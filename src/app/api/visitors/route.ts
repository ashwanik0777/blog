import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Visitor from '@/models/Visitor';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { path, sessionId } = await req.json();
    
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for')?.split(',')[0] || 
               headersList.get('x-real-ip') || 
               'unknown';
    const userAgent = headersList.get('user-agent') || '';
    const referer = headersList.get('referer') || '';

    // Simple device/browser detection
    let device = 'desktop';
    let browser = 'unknown';
    
    if (userAgent.includes('Mobile') || userAgent.includes('Android')) {
      device = 'mobile';
    } else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
      device = 'tablet';
    }

    if (userAgent.includes('Chrome')) browser = 'chrome';
    else if (userAgent.includes('Firefox')) browser = 'firefox';
    else if (userAgent.includes('Safari')) browser = 'safari';
    else if (userAgent.includes('Edge')) browser = 'edge';

    await Visitor.create({
      ip,
      userAgent,
      referer,
      path: path || '/',
      sessionId: sessionId || `session-${Date.now()}`,
      device,
      browser,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Visitor tracking error:', error);
    return NextResponse.json({ error: 'Failed to track visitor' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    await dbConnect();
    const url = new URL(req.url!);
    const range = url.searchParams.get('range') || '7d';
    
    const now = new Date();
    let startDate = new Date();
    
    switch (range) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // Get unique visitors (by IP per day)
    const uniqueVisitors = await Visitor.aggregate([
      { $match: { visitedAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            ip: '$ip',
            date: { $dateToString: { format: '%Y-%m-%d', date: '$visitedAt' } }
          }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get total page views
    const totalViews = await Visitor.countDocuments({ visitedAt: { $gte: startDate } });

    // Get unique IPs
    const uniqueIPs = await Visitor.distinct('ip', { visitedAt: { $gte: startDate } });

    // Get top pages
    const topPages = await Visitor.aggregate([
      { $match: { visitedAt: { $gte: startDate } } },
      { $group: { _id: '$path', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get device stats
    const deviceStats = await Visitor.aggregate([
      { $match: { visitedAt: { $gte: startDate } } },
      { $group: { _id: '$device', count: { $sum: 1 } } }
    ]);

    // Get browser stats
    const browserStats = await Visitor.aggregate([
      { $match: { visitedAt: { $gte: startDate } } },
      { $group: { _id: '$browser', count: { $sum: 1 } } }
    ]);

    return NextResponse.json({
      uniqueVisitors: uniqueVisitors.length,
      totalViews,
      uniqueIPs: uniqueIPs.length,
      visitorsByDay: uniqueVisitors,
      topPages,
      deviceStats: deviceStats.reduce((acc: any, item: any) => {
        acc[item._id || 'unknown'] = item.count;
        return acc;
      }, {}),
      browserStats: browserStats.reduce((acc: any, item: any) => {
        acc[item._id || 'unknown'] = item.count;
        return acc;
      }, {}),
    });
  } catch (error: any) {
    console.error('Visitor analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}


import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Visitor from '@/models/Visitor';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { path, sessionId } = await req.json();
    
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() || 
               headersList.get('x-real-ip') || 
               'unknown';
    const userAgent = headersList.get('user-agent') || '';
    const referer = headersList.get('referer') || '';

    // Enhanced device/browser detection
    let device = 'desktop';
    let browser = 'unknown';
    
    const ua = userAgent.toLowerCase();
    
    // Device detection
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      device = 'mobile';
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
      device = 'tablet';
    }

    // Browser detection
    if (ua.includes('chrome') && !ua.includes('edg')) {
      browser = 'chrome';
    } else if (ua.includes('firefox')) {
      browser = 'firefox';
    } else if (ua.includes('safari') && !ua.includes('chrome')) {
      browser = 'safari';
    } else if (ua.includes('edg')) {
      browser = 'edge';
    } else if (ua.includes('opera') || ua.includes('opr')) {
      browser = 'opera';
    }

    // Create visitor record - every page view is tracked
    await Visitor.create({
      ip,
      userAgent,
      referer: referer || 'direct',
      path: path || '/',
      sessionId: sessionId || `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      device,
      browser,
      visitedAt: new Date(),
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
    const statsOnly = url.searchParams.get('stats') === 'true';
    
    const now = new Date();
    let startDate: Date | null = null;
    
    if (range === 'lifetime') {
      startDate = null;
    } else {
      startDate = new Date();
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
    }

    const dateFilter = startDate ? { visitedAt: { $gte: startDate } } : {};

    // For stats only (used by footer)
    if (statsOnly) {
      const totalPageViews = await Visitor.countDocuments(dateFilter);
      const uniqueVisitors = await Visitor.distinct('ip', dateFilter);
      
      return NextResponse.json({
        uniqueVisitors: uniqueVisitors.length,
        totalPageViews,
      });
    }

    // Get unique visitors (by IP per day)
    const uniqueVisitorsByDay = await Visitor.aggregate([
      ...(startDate ? [{ $match: { visitedAt: { $gte: startDate } } }] : []),
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
    const totalViews = await Visitor.countDocuments(dateFilter);

    // Get unique IPs
    const uniqueIPs = await Visitor.distinct('ip', dateFilter);

    // Get page views by day
    const pageViewsByDay = await Visitor.aggregate([
      ...(startDate ? [{ $match: { visitedAt: { $gte: startDate } } }] : []),
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$visitedAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get top pages
    const topPages = await Visitor.aggregate([
      ...(startDate ? [{ $match: { visitedAt: { $gte: startDate } } }] : []),
      { $group: { _id: '$path', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get device stats
    const deviceStats = await Visitor.aggregate([
      ...(startDate ? [{ $match: { visitedAt: { $gte: startDate } } }] : []),
      { $group: { _id: '$device', count: { $sum: 1 } } }
    ]);

    // Get browser stats
    const browserStats = await Visitor.aggregate([
      ...(startDate ? [{ $match: { visitedAt: { $gte: startDate } } }] : []),
      { $group: { _id: '$browser', count: { $sum: 1 } } }
    ]);

    return NextResponse.json({
      uniqueVisitors: uniqueIPs.length,
      totalViews,
      uniqueIPs: uniqueIPs.length,
      visitorsByDay: uniqueVisitorsByDay.reduce((acc: any, item: any) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      pageViewsByDay: pageViewsByDay.reduce((acc: any, item: any) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      topPages: topPages.map((item: any) => ({
        page: item._id || 'unknown',
        views: item.count
      })),
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

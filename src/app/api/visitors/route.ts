import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Visitor from '@/models/Visitor';
import { randomUUID } from 'crypto';
import { requirePermission } from '@/lib/adminAuth';
import { badRequest, cleanString, getClientIp, limitRequest, readJsonBody, serverError } from '@/lib/security';

const BOT_PATTERN = /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|headless|lighthouse/i;

export async function POST(req: Request) {
  try {
    const limited = limitRequest(req, 'visitor', 60, 60 * 1000);
    if (limited) return limited;

    const body = await readJsonBody(req, 2 * 1024);
    if (!body) return badRequest();

    const userAgent = (req.headers.get('user-agent') || '').slice(0, 400);
    if (!userAgent || BOT_PATTERN.test(userAgent)) {
      return NextResponse.json({ success: true });
    }

    const rawPath = cleanString(body.path, 300);
    const path = rawPath.startsWith('/') ? rawPath : '/';
    if (path.startsWith('/admin') || path.startsWith('/api')) {
      return NextResponse.json({ success: true });
    }
    const sessionId = cleanString(body.sessionId, 80) || randomUUID();
    const ip = getClientIp(req);
    const referer = (req.headers.get('referer') || '').slice(0, 500);

    // Enhanced device/browser detection
    let device = 'desktop';
    let browser = 'unknown';
    
    const ua = userAgent.toLowerCase();
    
    // Device detection
    if (ua.includes('ipad') || ua.includes('tablet')) {
      device = 'tablet';
    } else if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      device = 'mobile';
    }

    // Browser detection
    if (ua.includes('edg')) {
      browser = 'edge';
    } else if (ua.includes('opera') || ua.includes('opr')) {
      browser = 'opera';
    } else if (ua.includes('chrome')) {
      browser = 'chrome';
    } else if (ua.includes('firefox')) {
      browser = 'firefox';
    } else if (ua.includes('safari')) {
      browser = 'safari';
    }

    await dbConnect();
    // Create visitor record - every page view is tracked
    await Visitor.create({
      ip,
      userAgent,
      referer: referer || 'direct',
      path,
      sessionId,
      device,
      browser,
      visitedAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return serverError('Visitor tracking error', error, 'Failed to track visitor');
  }
}

type AggregateRow = { _id: string | null; count: number };

export async function GET(req: Request) {
  try {
    const { errorResponse } = await requirePermission(req, 'view_analytics');
    if (errorResponse) return errorResponse;

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
      const uniqueVisitors = await countUniqueIps(dateFilter);
      
      return NextResponse.json({
        uniqueVisitors,
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
    const uniqueIPCount = await countUniqueIps(dateFilter);

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
      uniqueVisitors: uniqueIPCount,
      totalViews,
      uniqueIPs: uniqueIPCount,
      visitorsByDay: uniqueVisitorsByDay.reduce((acc: Record<string, number>, item: AggregateRow) => {
        acc[item._id ?? 'unknown'] = item.count;
        return acc;
      }, {}),
      pageViewsByDay: pageViewsByDay.reduce((acc: Record<string, number>, item: AggregateRow) => {
        acc[item._id ?? 'unknown'] = item.count;
        return acc;
      }, {}),
      topPages: topPages.map((item: AggregateRow) => ({
        page: item._id || 'unknown',
        views: item.count
      })),
      deviceStats: deviceStats.reduce((acc: Record<string, number>, item: AggregateRow) => {
        acc[item._id || 'unknown'] = item.count;
        return acc;
      }, {}),
      browserStats: browserStats.reduce((acc: Record<string, number>, item: AggregateRow) => {
        acc[item._id || 'unknown'] = item.count;
        return acc;
      }, {}),
    });
  } catch (error) {
    return serverError('Visitor analytics error', error, 'Failed to fetch analytics');
  }
}

async function countUniqueIps(filter: Record<string, unknown>) {
  const [row] = await Visitor.aggregate([{ $match: filter }, { $group: { _id: '$ip' } }, { $count: 'total' }]);
  return row?.total || 0;
}

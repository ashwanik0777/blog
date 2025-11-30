import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Blog from '@/models/Blog';
import User from '@/models/User';
import Visitor from '@/models/Visitor';
import Issue from '@/models/Issue';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import mongoose from 'mongoose';

export async function GET(req: Request) {
  try {
    await dbConnect();

    // Check admin authentication using NextAuth
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || (session.user as any).role !== 'admin') {
      // Return empty data instead of error to prevent frontend crashes
      return NextResponse.json({ 
        totalBlogs: 0,
        publishedBlogs: 0,
        totalUsers: 0,
        totalViews: 0,
        totalSubscribers: 0,
        totalIssues: 0,
        pendingIssues: 0,
        topBlogs: [],
        userGrowth: [],
        viewsByDay: {},
        uniqueVisitors: 0,
        totalPageViews: 0,
        uniqueIPs: 0,
        visitorsByDay: {},
        topPages: [],
        deviceStats: {},
        browserStats: {},
      });
    }

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

    // Get all analytics data
    const [
      totalBlogs,
      publishedBlogs,
      totalUsers,
      totalViews,
      topBlogs,
      userGrowth,
      totalSubscribers,
      totalIssues,
      pendingIssues,
      visitorStats
    ] = await Promise.all([
      Blog.countDocuments(),
      Blog.countDocuments({ published: true }),
      User.countDocuments(),
      Blog.aggregate([
        { $group: { _id: null, totalViews: { $sum: '$views' } } }
      ]),
      Blog.find({ published: true })
        .sort({ views: -1 })
        .limit(10)
        .select('title views slug createdAt'),
      User.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      // Newsletter subscribers
      (async () => {
        try {
          const Newsletter = mongoose.models.Newsletter || mongoose.model('Newsletter', new mongoose.Schema({
            email: String,
            subscribedAt: Date,
          }));
          return await Newsletter.countDocuments();
        } catch {
          return 0;
        }
      })(),
      Issue.countDocuments(),
      Issue.countDocuments({ status: 'pending' }),
      // Visitor stats
      (async () => {
        try {
          // Get unique visitors by IP per day
          const uniqueVisitorsByDay = await Visitor.aggregate([
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

          // Total unique visitors (unique IPs in the period)
          const uniqueIPs = await Visitor.distinct('ip', { visitedAt: { $gte: startDate } });
          const totalPageViews = await Visitor.countDocuments({ visitedAt: { $gte: startDate } });

          const topPages = await Visitor.aggregate([
            { $match: { visitedAt: { $gte: startDate } } },
            { $group: { _id: '$path', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
          ]);

          const deviceStats = await Visitor.aggregate([
            { $match: { visitedAt: { $gte: startDate } } },
            { $group: { _id: '$device', count: { $sum: 1 } } }
          ]);

          const browserStats = await Visitor.aggregate([
            { $match: { visitedAt: { $gte: startDate } } },
            { $group: { _id: '$browser', count: { $sum: 1 } } }
          ]);

          return {
            uniqueVisitors: uniqueIPs.length,
            totalPageViews,
            uniqueIPs: uniqueIPs.length,
            visitorsByDay: uniqueVisitorsByDay.reduce((acc: any, item: any) => {
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
          };
        } catch (error: any) {
          console.error('Visitor stats error:', error);
          return {
            uniqueVisitors: 0,
            totalPageViews: 0,
            uniqueIPs: 0,
            visitorsByDay: {},
            topPages: [],
            deviceStats: {},
            browserStats: {},
          };
        }
      })()
    ]);

    // Generate views by day data from blogs
    const viewsByDay: { [date: string]: number } = {};
    const blogs = await Blog.find({ published: true });
    
    blogs.forEach(blog => {
      if (blog.viewsByDay) {
        Object.keys(blog.viewsByDay).forEach(date => {
          const viewDate = new Date(date);
          if (viewDate >= startDate) {
            viewsByDay[date] = (viewsByDay[date] || 0) + blog.viewsByDay[date];
          }
        });
      }
    });

    const result = {
      totalBlogs,
      publishedBlogs,
      totalUsers,
      totalViews: totalViews[0]?.totalViews || 0,
      totalSubscribers,
      totalIssues,
      pendingIssues,
      topBlogs: topBlogs.map(blog => ({
        title: blog.title,
        views: blog.views || 0,
        slug: blog.slug,
        createdAt: blog.createdAt
      })),
      userGrowth: userGrowth.map(item => ({
        date: item._id,
        users: item.count
      })),
      viewsByDay: viewsByDay || {},
      uniqueVisitors: visitorStats?.uniqueVisitors || 0,
      totalPageViews: visitorStats?.totalPageViews || 0,
      uniqueIPs: visitorStats?.uniqueIPs || 0,
      visitorsByDay: visitorStats?.visitorsByDay || {},
      topPages: visitorStats?.topPages || [],
      deviceStats: visitorStats?.deviceStats || {},
      browserStats: visitorStats?.browserStats || {},
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Analytics error:', error);
    // Return empty data structure instead of error
    return NextResponse.json({ 
      totalBlogs: 0,
      publishedBlogs: 0,
      totalUsers: 0,
      totalViews: 0,
      totalSubscribers: 0,
      totalIssues: 0,
      pendingIssues: 0,
      topBlogs: [],
      userGrowth: [],
      viewsByDay: {},
      uniqueVisitors: 0,
      totalPageViews: 0,
      uniqueIPs: 0,
      visitorsByDay: {},
      topPages: [],
      deviceStats: {},
      browserStats: {},
    });
  }
}

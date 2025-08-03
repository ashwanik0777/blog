import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Blog from '@/models/Blog';
import User from '@/models/User';
import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  await dbConnect();
  
  // Check admin authentication
  const cookieStore = await cookies();
  const token = cookieStore.get('next-auth.session-token');
  
  if (!token) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 401 });
  }
  
  try {
    const decoded = verify(token.value, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any;
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Invalid admin session' }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const range = url.searchParams.get('range') || '7d';
    
    // Calculate date range
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

    // Get real analytics data from database
    const [
      totalBlogs,
      totalUsers,
      totalViews,
      topBlogs,
      userGrowth,
      totalSubscribers
    ] = await Promise.all([
      Blog.countDocuments(),
      User.countDocuments(),
      Blog.aggregate([
        { $group: { _id: null, totalViews: { $sum: '$views' } } }
      ]),
      Blog.find({ published: true })
        .sort({ views: -1 })
        .limit(5)
        .select('title views slug'),
      User.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      // Get newsletter subscribers count
      (async () => {
        try {
          const NewsletterSubscriber = (await import('mongoose')).models.NewsletterSubscriber;
          if (NewsletterSubscriber) {
            return await NewsletterSubscriber.countDocuments({ subscribed: true });
          }
          return 0;
        } catch {
          return 0;
        }
      })()
    ]);

    // Generate views by day data
    const viewsByDay: { [date: string]: number } = {};
    const blogs = await Blog.find({ published: true });
    
    blogs.forEach(blog => {
      if (blog.viewsByDay) {
        Object.entries(blog.viewsByDay).forEach(([date, views]) => {
          if (new Date(date) >= startDate) {
            viewsByDay[date] = (viewsByDay[date] || 0) + views;
          }
        });
      }
    });

    // Get device and browser stats (mock data for now)
    const deviceStats = {
      desktop: 65,
      mobile: 30,
      tablet: 5
    };

    const browserStats = {
      chrome: 45,
      firefox: 25,
      safari: 20,
      edge: 10
    };

    // Get page views (mock data for now)
    const pageViews = [
      { page: '/', views: Math.floor(totalViews[0]?.totalViews * 0.3 || 0) },
      { page: '/blog', views: Math.floor(totalViews[0]?.totalViews * 0.2 || 0) },
      ...topBlogs.map(blog => ({
        page: `/blog/${blog.slug}`,
        views: blog.views
      }))
    ];

    const analyticsData = {
      totalViews: totalViews[0]?.totalViews || 0,
      totalBlogs,
      totalUsers,
      totalSubscribers,
      viewsByDay,
      topBlogs: topBlogs.map(blog => ({
        title: blog.title,
        views: blog.views,
        slug: blog.slug
      })),
      userGrowth: userGrowth.map(item => ({
        date: item._id,
        users: item.count
      })),
      pageViews,
      deviceStats,
      browserStats
    };

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
} 
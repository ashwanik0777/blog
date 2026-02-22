import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Blog from '@/models/Blog';
import User from '@/models/User';
import { requireAdmin } from '@/lib/adminAuth';

function estimateReadingTime(content?: string) {
  if (!content) return 1;
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export async function GET(req: Request) {
  try {
    await dbConnect();

    const url = new URL(req.url!, process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000');
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = Math.min(parseInt(url.searchParams.get('pageSize') || '10', 10), 50);
    const isAdmin = url.searchParams.get('admin') === 'true';
    const skip = (page - 1) * pageSize;

    if (isAdmin) {
      const { errorResponse } = requireAdmin(req);

      if (errorResponse) {
        return NextResponse.json({ error: 'Admin access required' }, { status: 401 });
      }

      const selectFields = 'title summary excerpt featuredImage categories tags featured readingTime createdAt author published publishedAt status';
      const [total, blogs] = await Promise.all([
        Blog.countDocuments(),
        Blog.find()
          .select(selectFields)
          .populate('author', 'name email image')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(pageSize)
          .lean(),
      ]);

      const response = NextResponse.json({ blogs, total });
      response.headers.set('Cache-Control', 'no-store');
      return response;
    }

    const selectFields = 'title summary excerpt featuredImage categories tags featured readingTime createdAt author publishedAt';
    const [total, blogs] = await Promise.all([
      Blog.countDocuments({ published: true }),
      Blog.find({ published: true })
        .select(selectFields)
        .populate('author', 'name image')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
    ]);

    const response = NextResponse.json({ blogs, total });
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    return response;
  } catch (error) {
    console.error('Blog API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();

    const { user, errorResponse } = requireAdmin(req);
    if (errorResponse || !user) {
      return errorResponse || NextResponse.json({ error: 'Admin access required' }, { status: 401 });
    }

    const data = await req.json();

    const author = await User.findOne({ email: user.email }).select('_id');

    if (!author) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // AI moderation
    let status = data.status || 'pending';
    let flaggedReason = '';

    if (data.content) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const res = await fetch(baseUrl + '/api/ai/moderate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: data.content }),
        });
        const mod = await res.json();
        if (mod.verdict === 'flagged') {
          status = 'flagged';
          flaggedReason = mod.reason;
        } else if (mod.verdict === 'needs review') {
          status = 'pending';
          flaggedReason = mod.reason;
        } else {
          status = 'approved';
        }
      } catch (e) {
        console.warn('AI moderation failed', e);
      }
    }

    const blog = new Blog({
      ...data,
      author: author._id,
      status,
      flaggedReason,
      published: data.published || false,
      publishedAt: data.published ? new Date() : undefined,
      readingTime: data.readingTime || estimateReadingTime(data.content),
    });

    await blog.save();

    return NextResponse.json(blog);
  } catch (error) {
    console.error('Blog creation error:', error);
    return NextResponse.json({ error: 'Failed to create blog' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Blog from '@/models/Blog';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function GET(req: Request) {
  try {
    await dbConnect();

    const url = new URL(req.url!, process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000');
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10', 10);
    const isAdmin = url.searchParams.get('admin') === 'true';
    const skip = (page - 1) * pageSize;

  if (isAdmin) {
    // Check admin authentication using NextAuth
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 401 });
    }

    const total = await Blog.countDocuments();
    const blogs = await Blog.find()
      .populate('author', 'name email image')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    return NextResponse.json({ blogs, total });
  }

  const total = await Blog.countDocuments({ published: true });
  const blogs = await Blog.find({ published: true })
    .populate('author', 'name email image')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(pageSize);

  return NextResponse.json({ blogs, total });
  } catch (error) {
    console.error('Blog API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();

    // Check admin authentication using NextAuth
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 401 });
    }

    const data = await req.json();

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // AI moderation
    let status = data.status || 'pending';
    let flaggedReason = '';

    if (data.content) {
      try {
        const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL + '/api/ai/moderate', {
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
      author: user._id,
      status,
      flaggedReason,
      published: data.published || false,
      publishedAt: data.published ? new Date() : undefined,
    });

    await blog.save();

    // Emit real-time notification
    if (typeof global !== 'undefined' && (global as any)?.io) {
      (global as any).io.emit('new-blog', `New blog published: ${blog.title}`);
    } else if ((globalThis as any).res?.socket?.server?.io) {
      (globalThis as any).res.socket.server.io.emit('new-blog', `New blog published: ${blog.title}`);
    }

    return NextResponse.json(blog);
  } catch (error) {
    console.error('Blog creation error:', error);
    return NextResponse.json({ error: 'Failed to create blog' }, { status: 500 });
  }
}

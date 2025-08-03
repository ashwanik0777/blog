import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Blog from '../../../models/Blog';
import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  await dbConnect();
  const url = new URL(req.url!, process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000');
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const pageSize = parseInt(url.searchParams.get('pageSize') || '10', 10);
  const isAdmin = url.searchParams.get('admin') === 'true';
  const skip = (page - 1) * pageSize;
  
  // Check if admin request
  if (isAdmin) {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin-token');
    
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
    
    const total = await Blog.countDocuments();
    const blogs = await Blog.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .populate('author', 'name email image');
    return NextResponse.json({ blogs, total });
  }
  
  // Public request - only published blogs
  const total = await Blog.countDocuments({ published: true });
  const blogs = await Blog.find({ published: true })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(pageSize)
    .populate('author', 'name email image');
  return NextResponse.json({ blogs, total });
}

export async function POST(req: Request) {
  await dbConnect();
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-token');
  
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
  const data = await req.json();
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
    } catch {}
  }
  const blog = new Blog({ ...data, author: decoded.sub || decoded.email, status, flaggedReason });
  await blog.save();
  // Emit real-time notification
  if (typeof global !== 'undefined' && global?.io) {
    global.io.emit('new-blog', `New blog published: ${blog.title}`);
  } else if (typeof (globalThis as any).res !== 'undefined' && (globalThis as any).res.socket?.server?.io) {
    (globalThis as any).res.socket.server.io.emit('new-blog', `New blog published: ${blog.title}`);
  }
  return NextResponse.json(blog);
} 
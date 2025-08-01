import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Blog from '../../../models/Blog';
import { getToken } from 'next-auth/jwt';

export async function GET(req: Request) {
  await dbConnect();
  const url = new URL(req.url!, process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000');
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const pageSize = parseInt(url.searchParams.get('pageSize') || '10', 10);
  const skip = (page - 1) * pageSize;
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
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
  const blog = new Blog({ ...data, author: token.sub, status, flaggedReason });
  await blog.save();
  // Emit real-time notification
  if (typeof global !== 'undefined' && global?.io) {
    global.io.emit('new-blog', `New blog published: ${blog.title}`);
  } else if (typeof (globalThis as any).res !== 'undefined' && (globalThis as any).res.socket?.server?.io) {
    (globalThis as any).res.socket.server.io.emit('new-blog', `New blog published: ${blog.title}`);
  }
  return NextResponse.json(blog);
} 
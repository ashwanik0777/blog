import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Comment from '@/models/Comment';
import { getToken } from 'next-auth/jwt';

export async function POST(req: Request) {
  await dbConnect();
  const { blog, author, content } = await req.json();
  if (!blog || !author || !content) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  // AI moderation
  let status = 'pending';
  let flaggedReason = '';
  try {
    const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL + '/api/ai/moderate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
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
  const comment = await Comment.create({ blog, author, content, status, flaggedReason });
  return NextResponse.json(comment);
}

export async function GET(req: Request) {
  await dbConnect();
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const comments = await Comment.find().populate('blog', 'title').populate('author', 'name email').sort({ createdAt: -1 });
  return NextResponse.json({ comments });
} 
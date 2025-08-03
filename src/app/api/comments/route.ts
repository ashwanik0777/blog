import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Comment from '@/models/Comment';
import { getToken } from 'next-auth/jwt';

export async function POST(req: Request) {
  await dbConnect();
  const { blogId, content } = await req.json();
  
  if (!blogId || !content) {
    return NextResponse.json({ error: 'Blog ID and content are required' }, { status: 400 });
  }

  // Get user from session
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    // Find user by email
    const User = (await import('@/models/User')).default;
    const user = await User.findOne({ email: token.email });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify blog exists
    const Blog = (await import('@/models/Blog')).default;
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
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
    } catch (error) {
      console.error('AI moderation error:', error);
    }

    const comment = await Comment.create({ 
      blog: blogId, 
      author: user._id, 
      content, 
      status, 
      flaggedReason 
    });

    // Populate author info for response
    await comment.populate('author', 'name email');
    
    return NextResponse.json(comment);
  } catch (error) {
    console.error('Comment creation error:', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  await dbConnect();
  const url = new URL(req.url);
  const blogId = url.searchParams.get('blogId');
  const isAdmin = url.searchParams.get('admin') === 'true';

  if (isAdmin) {
    // Admin request - get all comments
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const comments = await Comment.find()
      .populate('blog', 'title')
      .populate('author', 'name email')
      .sort({ createdAt: -1 });
    return NextResponse.json({ comments });
  } else {
    // Public request - get approved comments for a specific blog
    if (!blogId) {
      return NextResponse.json({ error: 'Blog ID is required' }, { status: 400 });
    }
    
    const comments = await Comment.find({ 
      blog: blogId, 
      status: 'approved' 
    })
      .populate('author', 'name email')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ comments });
  }
} 
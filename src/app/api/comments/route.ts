import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Comment from '@/models/Comment';
import { requireAdmin } from '@/lib/adminAuth';

export async function POST(req: Request) {
  await dbConnect();
  const { blogId, content, authorName, authorEmail } = await req.json();
  
  if (!blogId || !content || !authorName) {
    return NextResponse.json({ error: 'Blog ID, content, and author name are required' }, { status: 400 });
  }

  try {
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
      // Default to approved if moderation fails
      status = 'approved';
    }

    const comment = await Comment.create({ 
      blog: blogId, 
      authorName,
      authorEmail: authorEmail || undefined,
      content, 
      status, 
      flaggedReason 
    });

    return NextResponse.json({
      _id: comment._id,
      content: comment.content,
      authorName: comment.authorName,
      authorEmail: comment.authorEmail,
      createdAt: comment.createdAt,
      status: comment.status,
    });
  } catch (error) {
    console.error('Comment creation error:', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  await dbConnect();
  const url = new URL(req.url!);
  const blogId = url.searchParams.get('blogId');
  const isAdmin = url.searchParams.get('admin') === 'true';

  if (isAdmin) {
    const { errorResponse } = requireAdmin(req);
    if (errorResponse) {
      return errorResponse;
    }
    const comments = await Comment.find()
      .populate('blog', 'title')
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
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ comments });
  }
}

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Comment from '@/models/Comment';
import Blog from '@/models/Blog';
import { requirePermission } from '@/lib/adminAuth';
import { moderateText } from '@/lib/gemini';
import { badRequest, cleanString, isObjectId, limitRequest, normalizeEmail, readJsonBody, serverError } from '@/lib/security';

export async function POST(req: Request) {
  try {
    const limited = limitRequest(req, 'comment', 5, 10 * 60 * 1000);
    if (limited) return limited;

    const body = await readJsonBody(req, 16 * 1024);
    if (!body) return badRequest();

    // Honeypot field: real users never fill it, bots usually do.
    if (cleanString(body.website, 200)) {
      return NextResponse.json({ success: true, status: 'pending' });
    }

    const blogId = body.blogId;
    const content = cleanString(body.content, 2000);
    const authorName = cleanString(body.authorName, 60);
    const authorEmail = body.authorEmail ? normalizeEmail(body.authorEmail) : '';

    if (!isObjectId(blogId) || content.length < 2 || !authorName) {
      return badRequest('Name and a comment are required');
    }
    if (body.authorEmail && !authorEmail) return badRequest('Please enter a valid email');

    await dbConnect();
    const blog = await Blog.findOne({ _id: blogId, published: true }).select('commentsEnabled');
    if (!blog) return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    if (blog.commentsEnabled === false) {
      return NextResponse.json({ error: 'Comments are closed for this post' }, { status: 403 });
    }

    const moderation = await moderateText(`${authorName}\n${content}`);
    const status =
      moderation.verdict === 'safe' ? 'approved' : moderation.verdict === 'flagged' ? 'flagged' : 'pending';

    const comment = await Comment.create({
      blog: blogId,
      authorName,
      authorEmail: authorEmail || undefined,
      content,
      status,
      flaggedReason: moderation.reason,
    });

    return NextResponse.json({
      _id: comment._id,
      content: comment.content,
      authorName: comment.authorName,
      createdAt: comment.createdAt,
      status: comment.status,
    });
  } catch (error) {
    return serverError('Comment creation error', error, 'Failed to post comment');
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const blogId = url.searchParams.get('blogId');
    const isAdmin = url.searchParams.get('admin') === 'true';

    await dbConnect();

    if (isAdmin) {
      const { errorResponse } = await requirePermission(req, 'manage_blogs');
      if (errorResponse) return errorResponse;
      const status = url.searchParams.get('status');
      const filter = status && ['pending', 'approved', 'flagged', 'rejected'].includes(status) ? { status } : {};
      const comments = await Comment.find(filter)
        .populate('blog', 'title slug')
        .sort({ createdAt: -1 })
        .limit(500)
        .lean();
      return NextResponse.json({ comments }, { headers: { 'Cache-Control': 'no-store' } });
    }

    if (!isObjectId(blogId)) return badRequest('Blog ID is required');

    const comments = await Comment.find({ blog: blogId, status: 'approved' })
      .select('authorName content createdAt status')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return NextResponse.json(
      { comments },
      { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120' } }
    );
  } catch (error) {
    return serverError('Comment fetch error', error);
  }
}

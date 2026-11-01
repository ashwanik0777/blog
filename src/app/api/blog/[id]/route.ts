import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Blog from '@/models/Blog';
import Comment from '@/models/Comment';
import { requirePermission, getVerifiedStaff } from '@/lib/adminAuth';
import { badRequest, cleanString, isObjectId, rateLimit, getClientIp, readJsonBody, serverError } from '@/lib/security';
import { buildUniqueSlug, estimateReadingTime, parseBlogInput } from '@/lib/blogInput';
import { revalidatePublicContent } from '@/lib/revalidate';
import { ensureHostedImage } from '@/lib/cloudinary';

type RouteContext = { params: Promise<{ id: string }> };

const notFound = () => NextResponse.json({ error: 'Not found' }, { status: 404 });

export async function GET(req: Request, { params }: RouteContext) {
  const { id } = await params;
  if (!isObjectId(id)) return badRequest('Invalid ID');

  try {
    await dbConnect();
    const staff = await getVerifiedStaff(req);
    const query = staff ? { _id: id } : { _id: id, published: true };
    const blog = await Blog.findOne(query)
      .populate('author', staff ? 'name email image' : 'name image')
      .lean();
    if (!blog) return notFound();

    return NextResponse.json(blog, {
      headers: { 'Cache-Control': staff ? 'no-store' : 'public, s-maxage=60, stale-while-revalidate=300' },
    });
  } catch (error) {
    return serverError('Blog fetch error', error);
  }
}

export async function PUT(req: Request, { params }: RouteContext) {
  const { errorResponse } = await requirePermission(req, 'manage_blogs');
  if (errorResponse) return errorResponse;

  const { id } = await params;
  if (!isObjectId(id)) return badRequest('Invalid ID');

  const body = await readJsonBody(req, 1024 * 1024);
  if (!body) return badRequest('Invalid blog payload');

  try {
    await dbConnect();
    const existing = await Blog.findById(id).select('slug title published publishedAt featuredImage');
    if (!existing) return notFound();

    const fields = parseBlogInput(body);
    if ('title' in fields && !fields.title) return badRequest('Title is required');
    if ('content' in fields && !fields.content) return badRequest('Content is required');

    const updates: Record<string, unknown> = { ...fields };
    delete updates.slug;

    // Hotlinked images break when the source site removes them — host a copy on Cloudinary.
    if (typeof fields.featuredImage === 'string' && fields.featuredImage && fields.featuredImage !== existing.featuredImage) {
      updates.featuredImage = await ensureHostedImage(fields.featuredImage);
    }

    if (fields.slug && fields.slug !== existing.slug) {
      updates.slug = await buildUniqueSlug(String(fields.slug), id);
    } else if (!existing.slug) {
      updates.slug = await buildUniqueSlug(String(fields.title || existing.title), id);
    }

    if (typeof fields.published === 'boolean') {
      updates.status = fields.published ? 'approved' : 'draft';
      if (fields.published && !existing.publishedAt) updates.publishedAt = new Date();
    }

    if (typeof fields.content === 'string' && !fields.readingTime) {
      updates.readingTime = estimateReadingTime(fields.content);
    }

    const blog = await Blog.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true });
    if (!blog) return notFound();

    revalidatePublicContent();
    return NextResponse.json(blog);
  } catch (error) {
    return serverError('Blog update error', error, 'Failed to update blog');
  }
}

export async function DELETE(req: Request, { params }: RouteContext) {
  const { errorResponse } = await requirePermission(req, 'manage_blogs');
  if (errorResponse) return errorResponse;

  const { id } = await params;
  if (!isObjectId(id)) return badRequest('Invalid ID');

  try {
    await dbConnect();
    const blog = await Blog.findByIdAndDelete(id);
    if (!blog) return notFound();
    await Comment.deleteMany({ blog: id });

    revalidatePublicContent();
    return NextResponse.json({ success: true });
  } catch (error) {
    return serverError('Blog delete error', error, 'Failed to delete blog');
  }
}

const MODERATION_STATUSES = ['draft', 'pending', 'approved', 'rejected', 'flagged'];

export async function PATCH(req: Request, { params }: RouteContext) {
  const { id } = await params;
  if (!isObjectId(id)) return badRequest('Invalid ID');
  const url = new URL(req.url);

  try {
    if (url.searchParams.get('view') === '1') {
      // Count at most one view per visitor per post every 30 minutes.
      const allowed = rateLimit(`view:${getClientIp(req)}:${id}`, 1, 30 * 60 * 1000).ok;
      if (!allowed) return new NextResponse(null, { status: 204 });

      await dbConnect();
      const today = new Date().toISOString().slice(0, 10);
      const blog = await Blog.findOneAndUpdate(
        { _id: id, published: true },
        { $inc: { views: 1, [`viewsByDay.${today}`]: 1 } },
        { new: true }
      ).select('views');
      if (!blog) return notFound();
      return NextResponse.json({ views: blog.views }, { headers: { 'Cache-Control': 'no-store' } });
    }

    const { errorResponse } = await requirePermission(req, 'manage_blogs');
    if (errorResponse) return errorResponse;

    const body = await readJsonBody(req, 16 * 1024);
    if (!body) return badRequest();

    const updates: Record<string, unknown> = {};
    if (typeof body.status === 'string' && MODERATION_STATUSES.includes(body.status)) updates.status = body.status;
    if (typeof body.featured === 'boolean') updates.featured = body.featured;
    if (typeof body.published === 'boolean') updates.published = body.published;
    if ('moderationNotes' in body) updates.moderationNotes = cleanString(body.moderationNotes, 2000);
    if ('flaggedReason' in body) updates.flaggedReason = cleanString(body.flaggedReason, 500);
    if (!Object.keys(updates).length) return badRequest('No valid fields to update');

    await dbConnect();
    const blog = await Blog.findByIdAndUpdate(id, { $set: updates }, { new: true });
    if (!blog) return notFound();

    revalidatePublicContent();
    return NextResponse.json(blog);
  } catch (error) {
    return serverError('Blog patch error', error);
  }
}

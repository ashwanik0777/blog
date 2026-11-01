import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Blog from '@/models/Blog';
import { requirePermission } from '@/lib/adminAuth';
import { badRequest, readJsonBody, serverError } from '@/lib/security';
import { buildUniqueSlug, estimateReadingTime, parseBlogInput } from '@/lib/blogInput';
import { revalidatePublicContent } from '@/lib/revalidate';
import { ensureHostedImage } from '@/lib/cloudinary';

function readInt(value: string | null, fallback: number, min: number, max: number) {
  const parsed = Number.parseInt(value || '', 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const isAdmin = url.searchParams.get('admin') === 'true';
    const page = readInt(url.searchParams.get('page'), 1, 1, 1000);

    await dbConnect();

    if (isAdmin) {
      const { errorResponse } = await requirePermission(req, 'manage_blogs');
      if (errorResponse) return errorResponse;

      const pageSize = readInt(url.searchParams.get('pageSize'), 200, 1, 500);
      // One-time data fix: older posts were published without a publishedAt date.
      await Blog.updateMany(
        { published: true, publishedAt: { $exists: false } },
        [{ $set: { publishedAt: '$createdAt' } }]
      );

      const selectFields = 'title slug summary excerpt content featuredImage categories tags featured readingTime createdAt updatedAt author published publishedAt status views metaTitle metaDescription keywords';
      const [total, blogs] = await Promise.all([
        Blog.countDocuments(),
        Blog.find()
          .select(selectFields)
          .populate('author', 'name email image')
          .sort({ createdAt: -1 })
          .skip((page - 1) * pageSize)
          .limit(pageSize)
          .lean(),
      ]);

      return NextResponse.json({ blogs, total }, { headers: { 'Cache-Control': 'no-store' } });
    }

    const pageSize = readInt(url.searchParams.get('pageSize'), 12, 1, 50);
    const selectFields = 'title slug summary excerpt featuredImage categories tags featured readingTime createdAt publishedAt author';
    const [total, blogs] = await Promise.all([
      Blog.countDocuments({ published: true }),
      Blog.find({ published: true })
        .select(selectFields)
        .populate('author', 'name image')
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
    ]);

    return NextResponse.json(
      { blogs, total, page, pageSize },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } }
    );
  } catch (error) {
    return serverError('Blog API error', error, 'Internal server error');
  }
}

export async function POST(req: Request) {
  try {
    const { user, errorResponse } = await requirePermission(req, 'manage_blogs');
    if (errorResponse || !user) return errorResponse;

    const body = await readJsonBody(req, 1024 * 1024);
    if (!body) return badRequest('Invalid blog payload');

    const fields = parseBlogInput(body);
    if (!fields.title || !fields.content) {
      return badRequest('Title and content are required');
    }

    await dbConnect();
    if (typeof fields.featuredImage === 'string' && fields.featuredImage) {
      fields.featuredImage = await ensureHostedImage(fields.featuredImage);
    }
    const published = fields.published === true;
    const slug = await buildUniqueSlug(String(fields.slug || fields.title));

    const blog = await Blog.create({
      ...fields,
      slug,
      author: user.id,
      published,
      status: published ? 'approved' : 'draft',
      publishedAt: published ? new Date() : undefined,
      readingTime: fields.readingTime || estimateReadingTime(String(fields.content)),
    });

    revalidatePublicContent();
    return NextResponse.json(blog);
  } catch (error) {
    return serverError('Blog creation error', error, 'Failed to create blog');
  }
}

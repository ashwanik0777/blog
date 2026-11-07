import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Blog from '@/models/Blog';
import Comment from '@/models/Comment';
import Issue from '@/models/Issue';
import Newsletter from '@/models/Newsletter';
import RateLimit from '@/models/RateLimit';
import NewsletterSubscriber from '@/models/NewsletterSubscriber';
import Settings from '@/models/Settings';
import User from '@/models/User';
import Visitor from '@/models/Visitor';
import { requireAdmin } from '@/lib/adminAuth';
import { importRemoteImage, isCloudinaryConfigured, isCloudinaryUrl } from '@/lib/cloudinary';
import { revalidatePublicContent } from '@/lib/revalidate';
import { badRequest, limitRequest, readJsonBody, serverError } from '@/lib/security';

export const maxDuration = 60;

async function importFeaturedImages() {
  if (!isCloudinaryConfigured()) {
    return NextResponse.json({ error: 'Cloudinary is not configured in .env' }, { status: 503 });
  }

  const blogs = await Blog.find({ featuredImage: { $exists: true, $nin: [null, ''] } })
    .select('title featuredImage')
    .lean<Array<{ _id: unknown; title: string; featuredImage: string }>>();
  const external = blogs.filter((blog) => !isCloudinaryUrl(blog.featuredImage));

  let imported = 0;
  const failed: Array<{ title: string; reason: string }> = [];
  for (const blog of external) {
    try {
      const url = await importRemoteImage(blog.featuredImage);
      await Blog.updateOne({ _id: blog._id }, { $set: { featuredImage: url } });
      imported += 1;
    } catch (error) {
      const reason = (error as { message?: string })?.message || 'Import failed';
      failed.push({ title: blog.title, reason: reason.slice(0, 160) });
    }
  }

  if (imported) revalidatePublicContent();
  return NextResponse.json({ checked: blogs.length, external: external.length, imported, failed });
}

async function createIndexes() {
  // createIndexes only adds missing indexes — it never drops existing ones.
  const models = [Blog, Comment, Issue, Newsletter, NewsletterSubscriber, RateLimit, Settings, User, Visitor];
  await Promise.all(models.map((model) => model.createIndexes()));
  return NextResponse.json({ success: true, models: models.map((model) => model.modelName) });
}

export async function POST(req: Request) {
  try {
    const { user, errorResponse } = await requireAdmin(req);
    if (errorResponse || !user) return errorResponse;

    const limited = limitRequest(req, 'maintenance', 5, 10 * 60 * 1000, user.id);
    if (limited) return limited;

    const body = await readJsonBody(req, 1024);
    await dbConnect();

    if (body?.action === 'import-images') return importFeaturedImages();
    if (body?.action === 'create-indexes') return createIndexes();
    return badRequest('Unknown maintenance action');
  } catch (error) {
    return serverError('Maintenance error', error, 'Maintenance task failed');
  }
}

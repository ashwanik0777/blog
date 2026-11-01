import Blog from '@/models/Blog';
import { cleanBoolean, cleanString, cleanStringArray, safeHttpUrl, toSlug } from '@/lib/security';

const MAX_CONTENT_LENGTH = 200_000;

export function estimateReadingTime(content?: string) {
  if (!content) return 1;
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

/** Whitelists and sanitises blog fields. Only keys present in the body are returned. */
export function parseBlogInput(body: Record<string, unknown>) {
  const has = (key: string) => Object.prototype.hasOwnProperty.call(body, key) && body[key] !== undefined;
  const fields: Record<string, unknown> = {};

  if (has('title')) fields.title = cleanString(body.title, 200);
  if (has('content')) fields.content = typeof body.content === 'string' ? body.content.slice(0, MAX_CONTENT_LENGTH) : '';
  if (has('summary')) fields.summary = cleanString(body.summary, 1000);
  if (has('excerpt')) fields.excerpt = cleanString(body.excerpt, 600);
  if (has('metaTitle')) fields.metaTitle = cleanString(body.metaTitle, 120);
  if (has('metaDescription')) fields.metaDescription = cleanString(body.metaDescription, 320);
  if (has('keywords')) fields.keywords = cleanStringArray(body.keywords, 20, 60);
  if (has('tags')) fields.tags = cleanStringArray(body.tags, 15, 40);
  if (has('categories')) fields.categories = cleanStringArray(body.categories, 8, 40);
  if (has('featuredImage')) fields.featuredImage = safeHttpUrl(body.featuredImage);
  if (typeof body.published === 'boolean') fields.published = body.published;
  if (typeof body.featured === 'boolean') fields.featured = cleanBoolean(body.featured);
  if (typeof body.commentsEnabled === 'boolean') fields.commentsEnabled = body.commentsEnabled;
  if (has('readingTime')) {
    const minutes = Math.round(Number(body.readingTime));
    if (Number.isFinite(minutes) && minutes > 0) fields.readingTime = Math.min(minutes, 300);
  }
  if (has('slug')) {
    const slug = toSlug(cleanString(body.slug, 120));
    if (slug) fields.slug = slug;
  }
  return fields;
}

export async function buildUniqueSlug(source: string, excludeId?: string) {
  const base = toSlug(source) || 'post';
  let slug = base;
  let counter = 1;
  while (await Blog.exists(excludeId ? { slug, _id: { $ne: excludeId } } : { slug })) {
    counter += 1;
    slug = `${base}-${counter}`;
  }
  return slug;
}

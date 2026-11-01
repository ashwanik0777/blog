import dbConnect from "@/lib/mongodb";
import Blog from "@/models/Blog";
import "@/models/User";
import { isObjectId } from "@/lib/security";
import { topicSlug } from "@/lib/site";

export type BlogAuthor = { _id?: string; name?: string; image?: string };

export type BlogSummary = {
  _id: string;
  title: string;
  slug?: string;
  summary?: string;
  excerpt?: string;
  featuredImage?: string;
  categories?: string[];
  tags?: string[];
  featured?: boolean;
  readingTime?: number;
  views?: number;
  createdAt: string;
  publishedAt?: string;
  updatedAt?: string;
  author?: BlogAuthor;
};

export type BlogDetail = BlogSummary & {
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  commentsEnabled?: boolean;
};

export type Topic = { name: string; slug: string; count: number };

const CARD_FIELDS =
  "title slug summary excerpt featuredImage categories tags featured readingTime views createdAt publishedAt updatedAt author";
const PUBLISHED = { published: true };

function serialize<T>(value: unknown): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export async function getPublishedBlogs(limit = 12, skip = 0): Promise<BlogSummary[]> {
  try {
    await dbConnect();
    const blogs = await Blog.find(PUBLISHED)
      .select(CARD_FIELDS)
      .populate("author", "name image")
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    return serialize<BlogSummary[]>(blogs);
  } catch (error) {
    console.error("getPublishedBlogs failed:", error);
    return [];
  }
}

export async function countPublishedBlogs() {
  try {
    await dbConnect();
    return await Blog.countDocuments(PUBLISHED);
  } catch {
    return 0;
  }
}

export async function getFeaturedBlogs(limit = 3): Promise<BlogSummary[]> {
  try {
    await dbConnect();
    const blogs = await Blog.find({ ...PUBLISHED, featured: true })
      .select(CARD_FIELDS)
      .populate("author", "name image")
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(limit)
      .lean();
    return serialize<BlogSummary[]>(blogs);
  } catch (error) {
    console.error("getFeaturedBlogs failed:", error);
    return [];
  }
}

export async function getPopularBlogs(limit = 5): Promise<BlogSummary[]> {
  try {
    await dbConnect();
    const blogs = await Blog.find(PUBLISHED)
      .select(CARD_FIELDS)
      .sort({ views: -1, publishedAt: -1 })
      .limit(limit)
      .lean();
    return serialize<BlogSummary[]>(blogs);
  } catch (error) {
    console.error("getPopularBlogs failed:", error);
    return [];
  }
}

/** Looks a published post up by slug, or by legacy ObjectId URL. */
export async function getBlogBySlugOrId(param: string): Promise<BlogDetail | null> {
  let raw = param;
  try {
    raw = decodeURIComponent(param);
  } catch {
    return null;
  }
  const key = raw.trim().slice(0, 200);
  if (!key) return null;

  await dbConnect();
  const slugs = [...new Set([key, key.toLowerCase()])];
  const query = isObjectId(key)
    ? { ...PUBLISHED, $or: [{ _id: key }, { slug: { $in: slugs } }] }
    : { ...PUBLISHED, slug: { $in: slugs } };
  const blog = await Blog.findOne(query)
    .select(`${CARD_FIELDS} content metaTitle metaDescription keywords commentsEnabled`)
    .populate("author", "name image")
    .lean();
  return blog ? serialize<BlogDetail>(blog) : null;
}

export async function getRelatedBlogs(blog: BlogSummary, limit = 3): Promise<BlogSummary[]> {
  try {
    await dbConnect();
    const topics = [...(blog.categories || []), ...(blog.tags || [])];
    const base = { ...PUBLISHED, _id: { $ne: blog._id } };
    const related = topics.length
      ? await Blog.find({ ...base, $or: [{ categories: { $in: topics } }, { tags: { $in: topics } }] })
          .select(CARD_FIELDS)
          .sort({ publishedAt: -1 })
          .limit(limit)
          .lean()
      : [];

    if (related.length < limit) {
      const exclude = [blog._id, ...related.map((item) => String((item as { _id: unknown })._id))];
      const filler = await Blog.find({ ...PUBLISHED, _id: { $nin: exclude } })
        .select(CARD_FIELDS)
        .sort({ publishedAt: -1 })
        .limit(limit - related.length)
        .lean();
      related.push(...filler);
    }
    return serialize<BlogSummary[]>(related);
  } catch (error) {
    console.error("getRelatedBlogs failed:", error);
    return [];
  }
}

export async function getAllTopics(limit = 60): Promise<Topic[]> {
  try {
    await dbConnect();
    const rows: Array<{ _id: string; count: number }> = await Blog.aggregate([
      { $match: PUBLISHED },
      {
        $project: {
          topic: { $setUnion: [{ $ifNull: ["$categories", []] }, { $ifNull: ["$tags", []] }] },
        },
      },
      { $unwind: "$topic" },
      { $group: { _id: "$topic", count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $limit: 500 },
    ]);

    const bySlug = new Map<string, Topic>();
    for (const row of rows) {
      const name = String(row._id || "").trim();
      const slug = topicSlug(name);
      if (!name || !slug) continue;
      const existing = bySlug.get(slug);
      if (existing) existing.count += row.count;
      else bySlug.set(slug, { name, slug, count: row.count });
    }
    return [...bySlug.values()].sort((a, b) => b.count - a.count).slice(0, limit);
  } catch (error) {
    console.error("getAllTopics failed:", error);
    return [];
  }
}

export async function getBlogsByTopic(slug: string): Promise<{ topic: Topic | null; blogs: BlogSummary[] }> {
  const topics = await getAllTopics(500);
  const topic = topics.find((item) => item.slug === slug) || null;
  if (!topic) return { topic: null, blogs: [] };

  await dbConnect();
  // Collect every spelling that maps to this slug (e.g. "AI" and "ai").
  const rows: Array<{ _id: string }> = await Blog.aggregate([
    { $match: PUBLISHED },
    { $project: { topic: { $setUnion: [{ $ifNull: ["$categories", []] }, { $ifNull: ["$tags", []] }] } } },
    { $unwind: "$topic" },
    { $group: { _id: "$topic" } },
  ]);
  const names = rows.map((row) => String(row._id)).filter((name) => topicSlug(name) === slug);

  const blogs = await Blog.find({ ...PUBLISHED, $or: [{ categories: { $in: names } }, { tags: { $in: names } }] })
    .select(CARD_FIELDS)
    .populate("author", "name image")
    .sort({ publishedAt: -1, createdAt: -1 })
    .limit(100)
    .lean();
  return { topic, blogs: serialize<BlogSummary[]>(blogs) };
}

export async function getSitemapEntries() {
  try {
    await dbConnect();
    const blogs = await Blog.find(PUBLISHED)
      .select("slug updatedAt publishedAt createdAt featuredImage")
      .sort({ publishedAt: -1 })
      .limit(5000)
      .lean();
    return serialize<Array<{ _id: string; slug?: string; updatedAt?: string; publishedAt?: string; createdAt: string; featuredImage?: string }>>(blogs);
  } catch (error) {
    console.error("getSitemapEntries failed:", error);
    return [];
  }
}

export async function getFeedEntries(limit = 30): Promise<BlogSummary[]> {
  return getPublishedBlogs(limit);
}

/** Pulls `## Heading` / `### Heading` lines out of markdown for the table of contents. */
export function extractHeadings(markdown: string) {
  const headings: Array<{ id: string; text: string; level: 2 | 3 }> = [];
  const seen = new Map<string, number>();
  let inFence = false;

  for (const line of markdown.split("\n")) {
    if (/^\s*```/.test(line)) inFence = !inFence;
    if (inFence) continue;
    const match = /^(#{1,3})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match) continue;
    // The id is built from the raw text (minus link targets) so it matches the
    // renderer, which slugifies the plain heading text the same way.
    const raw = match[2].replace(/\]\([^)]*\)/g, "]");
    const text = raw.replace(/\*\*|__|[*`[\]]/g, "").trim();
    if (!text) continue;
    const id = headingId(raw, seen);
    headings.push({ id, text, level: match[1].length === 3 ? 3 : 2 });
  }
  return headings;
}

export function headingId(text: string, seen?: Map<string, number>) {
  const base = topicSlug(text) || "section";
  if (!seen) return base;
  const count = seen.get(base) || 0;
  seen.set(base, count + 1);
  return count ? `${base}-${count}` : base;
}

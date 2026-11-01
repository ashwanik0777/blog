import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { cache } from "react";
import { Calendar, ChevronRight, Clock, Eye, Hash } from "lucide-react";
import BlogCard from "@/components/BlogCard";
import BlogImage from "@/components/BlogImage";
import BlogViewTracker from "@/components/BlogViewTracker";
import Comments from "@/components/Comments";
import JsonLd from "@/components/JsonLd";
import MarkdownContent from "@/components/MarkdownContent";
import ReadingProgress from "@/components/ReadingProgress";
import ShareMenu from "@/components/ShareMenu";
import TableOfContents from "@/components/TableOfContents";
import { extractHeadings, getBlogBySlugOrId, getRelatedBlogs } from "@/lib/blog";
import { SITE_NAME, absoluteUrl, blogPath, formatDate, topicPath } from "@/lib/site";

export const revalidate = 300;

type BlogPageParams = { params: Promise<{ slug: string }> };

// Rendered on first visit, then cached (ISR) and refreshed when an admin edits the post.
export async function generateStaticParams() {
  return [];
}

const loadBlog = cache(async (slug: string) => getBlogBySlugOrId(slug));

function describe(blog: { metaDescription?: string; summary?: string; excerpt?: string; content: string }) {
  const text = blog.metaDescription || blog.summary || blog.excerpt || blog.content.replace(/[#*_`>\[\]()!-]/g, " ");
  return text.replace(/\s+/g, " ").trim().slice(0, 160);
}

export async function generateMetadata({ params }: BlogPageParams): Promise<Metadata> {
  const { slug } = await params;
  const blog = await loadBlog(slug);
  if (!blog) return { title: "Article not found", robots: { index: false } };

  const path = blogPath(blog);
  const title = blog.metaTitle || blog.title;
  const description = describe(blog);
  const keywords = [...(blog.keywords || []), ...(blog.tags || []), ...(blog.categories || [])];

  return {
    title,
    description,
    keywords: keywords.length ? [...new Set(keywords)] : undefined,
    authors: blog.author?.name ? [{ name: blog.author.name }] : undefined,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      type: "article",
      siteName: SITE_NAME,
      publishedTime: blog.publishedAt || blog.createdAt,
      modifiedTime: blog.updatedAt,
      authors: blog.author?.name ? [blog.author.name] : undefined,
      tags: blog.tags,
      section: blog.categories?.[0],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function BlogDetailPage({ params }: BlogPageParams) {
  const { slug } = await params;
  const blog = await loadBlog(slug);
  if (!blog) notFound();

  // Old /blog/<id> links permanently redirect to the keyword-rich slug URL.
  if (blog.slug && slug !== blog.slug) {
    permanentRedirect(blogPath(blog));
  }

  const url = absoluteUrl(blogPath(blog));
  // Many posts start with "# <title>" — the page already renders the title as the H1.
  const leading = /^\s*#{1,2}\s+(.+?)\s*#*\s*(\r?\n|$)/.exec(blog.content);
  const content =
    leading && leading[1].replace(/[*_`]/g, "").trim().toLowerCase() === blog.title.trim().toLowerCase()
      ? blog.content.slice(leading[0].length)
      : blog.content;
  const headings = extractHeadings(content);
  const related = await getRelatedBlogs(blog, 3);
  const topics = [...new Set([...(blog.categories || []), ...(blog.tags || [])])];
  const published = blog.publishedAt || blog.createdAt;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: blog.title.slice(0, 110),
      description: describe(blog),
      image: [blog.featuredImage || absoluteUrl("/opengraph-image")],
      datePublished: published,
      dateModified: blog.updatedAt || published,
      author: { "@type": "Person", name: blog.author?.name || `${SITE_NAME} Team` },
      publisher: { "@type": "Organization", name: SITE_NAME, logo: { "@type": "ImageObject", url: absoluteUrl("/logo.png") } },
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      keywords: topics.join(", ") || undefined,
      articleSection: blog.categories?.[0],
      wordCount: blog.content.split(/\s+/).length,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: "Articles", item: absoluteUrl("/blog") },
        { "@type": "ListItem", position: 3, name: blog.title, item: url },
      ],
    },
  ];

  return (
    <>
      <JsonLd data={jsonLd} />
      <ReadingProgress />
      <BlogViewTracker blogId={blog._id} />

      <article>
        <header className="relative overflow-hidden border-b border-zinc-200/70 dark:border-zinc-800/70">
          <div className="bg-grid pointer-events-none absolute inset-0 opacity-70" />
          <div className="container-page relative max-w-4xl py-10 text-left sm:py-16 sm:text-center">
            <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-sm text-zinc-500 sm:mb-8 sm:justify-center dark:text-zinc-400">
              <Link href="/" className="hover:text-zinc-900 dark:hover:text-white">
                Home
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link href="/blog" className="hover:text-zinc-900 dark:hover:text-white">
                Articles
              </Link>
              {blog.categories?.[0] && (
                <>
                  <ChevronRight className="h-3.5 w-3.5" />
                  <Link href={topicPath(blog.categories[0])} className="hover:text-zinc-900 dark:hover:text-white">
                    {blog.categories[0]}
                  </Link>
                </>
              )}
            </nav>

            <h1 className="text-balance text-3xl font-extrabold leading-tight text-zinc-900 sm:text-5xl dark:text-white">{blog.title}</h1>
            {blog.summary && (
              <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-7 text-zinc-600 sm:text-lg sm:leading-8 dark:text-zinc-400">{blog.summary}</p>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-zinc-500 sm:justify-center dark:text-zinc-400">
              <span className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/60 text-sm font-bold text-brand-700 dark:text-brand-200">
                  {(blog.author?.name || "T").charAt(0).toUpperCase()}
                </span>
                <span className="font-semibold text-zinc-900 dark:text-white">{blog.author?.name || `${SITE_NAME} Team`}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <time dateTime={published}>{formatDate(published, "long")}</time>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" /> {blog.readingTime || 1} min read
              </span>
              {(blog.views || 0) > 0 && (
                <span className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4" /> {(blog.views || 0).toLocaleString("en-US")} views
                </span>
              )}
            </div>
          </div>
        </header>

        {blog.featuredImage && (
          <div className="container-page max-w-5xl pt-10">
            <div className="relative aspect-[16/9] overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-100 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
              <BlogImage src={blog.featuredImage} alt={blog.title} sizes="(min-width: 1024px) 1024px, 100vw" priority />
            </div>
          </div>
        )}

        <div className="container-page grid gap-12 py-12 lg:grid-cols-[minmax(0,1fr)_240px] lg:py-16 xl:grid-cols-[72px_minmax(0,1fr)_240px]">
          <aside className="hidden xl:block">
            <div className="sticky top-28">
              <ShareMenu url={url} title={blog.title} layout="column" />
            </div>
          </aside>

          <div className="mx-auto w-full max-w-3xl min-w-0">
            <MarkdownContent content={content} />

            {topics.length > 0 && (
              <div className="mt-14 flex flex-wrap gap-2">
                {topics.map((topic) => (
                  <Link key={topic} href={topicPath(topic)} className="chip">
                    <Hash className="h-3 w-3 text-zinc-400" />
                    {topic}
                  </Link>
                ))}
              </div>
            )}

            <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-zinc-50/80 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800 dark:bg-zinc-900/50">
              <p className="font-semibold text-zinc-900 dark:text-white">Found this useful? Share it with your team.</p>
              <ShareMenu url={url} title={blog.title} />
            </div>

            {blog.commentsEnabled !== false && (
              <div className="mt-16">
                <Comments blogId={blog._id} />
              </div>
            )}
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-8">
              {headings.length >= 2 && <TableOfContents headings={headings} />}
              <div className="rounded-2xl border border-brand-100 bg-brand-50/70 p-5 dark:border-brand-900/50 dark:bg-brand-950/30">
                <p className="font-display font-bold text-zinc-900 dark:text-white">Enjoying this?</p>
                <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">Get articles like this in your inbox every week.</p>
                <a href="#newsletter" className="btn-brand mt-4 w-full py-2">
                  Subscribe free
                </a>
              </div>
            </div>
          </aside>
        </div>
      </article>

      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="border-t border-zinc-200 bg-zinc-50/60 py-16 dark:border-zinc-800 dark:bg-zinc-900/20">
          <div className="container-page">
            <div className="mb-8 flex items-end justify-between">
              <h2 id="related-heading" className="text-3xl font-extrabold text-zinc-900 dark:text-white">
                Keep reading
              </h2>
              <Link href="/blog" className="text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-300">
                All articles →
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <BlogCard key={item._id} blog={item} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

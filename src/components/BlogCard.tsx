import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";
import BlogImage from "@/components/BlogImage";
import type { BlogSummary } from "@/lib/blog";
import { blogPath, formatDate, topicPath } from "@/lib/site";

type BlogCardProps = {
  blog: BlogSummary;
  variant?: "default" | "featured" | "compact";
  priority?: boolean;
};

function Meta({ blog }: { blog: BlogSummary }) {
  return (
    <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
      {blog.author?.name && (
        <>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/60 text-[10px] font-bold text-brand-700 dark:text-brand-200">
            {blog.author.name.charAt(0).toUpperCase()}
          </span>
          <span className="font-medium text-zinc-700 dark:text-zinc-300">{blog.author.name}</span>
          <span aria-hidden>·</span>
        </>
      )}
      <time dateTime={blog.publishedAt || blog.createdAt}>{formatDate(blog.publishedAt || blog.createdAt)}</time>
      <span aria-hidden>·</span>
      <span className="inline-flex items-center gap-1">
        <Clock className="h-3.5 w-3.5" />
        {blog.readingTime || 1} min
      </span>
    </div>
  );
}

export default function BlogCard({ blog, variant = "default", priority = false }: BlogCardProps) {
  const href = blogPath(blog);
  const topic = blog.categories?.[0] || blog.tags?.[0];
  const description = blog.excerpt || blog.summary;

  if (variant === "compact") {
    return (
      <article className="group relative flex gap-4">
        <div className="relative aspect-square w-20 shrink-0 overflow-hidden rounded-xl bg-zinc-100 sm:w-24 dark:bg-zinc-800">
          <BlogImage src={blog.featuredImage} alt={blog.title} sizes="96px" className="transition-transform duration-500 group-hover:scale-105" />
        </div>
        <div className="min-w-0">
          {topic && <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">{topic}</p>}
          <h3 className="line-clamp-2 font-display text-base font-bold leading-snug text-zinc-900 transition-colors group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-300">
            <Link href={href} className="after:absolute after:inset-0">
              {blog.title}
            </Link>
          </h3>
          <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
            {formatDate(blog.publishedAt || blog.createdAt)} · {blog.readingTime || 1} min read
          </p>
        </div>
      </article>
    );
  }

  if (variant === "featured") {
    return (
      <article className="group relative grid overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand-900/10 md:grid-cols-2 dark:border-zinc-800 dark:bg-zinc-900/70">
        <div className="relative aspect-[16/10] overflow-hidden bg-zinc-100 md:aspect-auto md:min-h-[340px] dark:bg-zinc-800">
          <BlogImage
            src={blog.featuredImage}
            alt={blog.title}
            sizes="(min-width: 1280px) 620px, (min-width: 768px) 50vw, 100vw"
            priority={priority}
            label={topic}
            className="transition-transform duration-700 group-hover:scale-105"
          />
        </div>
        <div className="flex flex-col justify-center gap-4 p-6 sm:p-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white">Featured</span>
            {topic && (
              <Link href={topicPath(topic)} className="chip relative z-10">
                {topic}
              </Link>
            )}
          </div>
          <h3 className="font-display text-2xl font-extrabold leading-tight text-zinc-900 sm:text-3xl dark:text-white">
            <Link href={href} className="after:absolute after:inset-0">
              {blog.title}
            </Link>
          </h3>
          {description && <p className="line-clamp-3 text-zinc-600 dark:text-zinc-400">{description}</p>}
          <Meta blog={blog} />
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 dark:text-brand-300">
            Read article <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        </div>
      </article>
    );
  }

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-900/5 dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-brand-800/60">
      <div className="relative aspect-[16/9] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        <BlogImage
          src={blog.featuredImage}
          alt={blog.title}
          sizes="(min-width: 1280px) 400px, (min-width: 768px) 50vw, 100vw"
          priority={priority}
          label={topic}
          className="transition-transform duration-500 group-hover:scale-105"
        />
        {topic && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-zinc-800 shadow-sm backdrop-blur dark:bg-zinc-950/80 dark:text-zinc-100">
            {topic}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="line-clamp-2 font-display text-lg font-bold leading-snug text-zinc-900 transition-colors group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-300">
          <Link href={href} className="after:absolute after:inset-0">
            {blog.title}
          </Link>
        </h3>
        {description && <p className="line-clamp-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{description}</p>}
        <div className="mt-auto pt-2">
          <Meta blog={blog} />
        </div>
      </div>
    </article>
  );
}

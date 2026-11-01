import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Code2, Flame, Hash, Layers, Search, Sparkles, TrendingUp, Zap } from "lucide-react";
import BlogCard from "@/components/BlogCard";
import JsonLd from "@/components/JsonLd";
import TopicCard from "@/components/TopicCard";
import SectionHeading from "@/components/SectionHeading";
import { countPublishedBlogs, getAllTopics, getFeaturedBlogs, getPopularBlogs, getPublishedBlogs } from "@/lib/blog";
import { SITE_DESCRIPTION, SITE_NAME, absoluteUrl, getSiteUrl, topicPath } from "@/lib/site";

export const revalidate = 300;

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": [{ url: "/feed.xml", title: `${SITE_NAME} RSS feed` }] },
  },
  openGraph: { url: "/" },
};

const VALUE_PROPS = [
  {
    icon: Code2,
    title: "Hands-on tutorials",
    description: "Step-by-step guides with real code you can copy, run and ship to production.",
  },
  {
    icon: Zap,
    title: "Signal over noise",
    description: "The tech news that actually matters, explained in minutes — not hours.",
  },
  {
    icon: Layers,
    title: "Deep dives",
    description: "Architecture, performance and AI workflows broken down into practical lessons.",
  },
];

export default async function Home() {
  const [latest, featured, popular, topics, total] = await Promise.all([
    getPublishedBlogs(10),
    getFeaturedBlogs(1),
    getPopularBlogs(5),
    getAllTopics(12),
    countPublishedBlogs(),
  ]);

  const hero = latest[0];
  const featuredStory = featured[0] && featured[0]._id !== hero?._id ? featured[0] : null;
  const rest = latest.slice(1).filter((blog) => blog._id !== featuredStory?._id);
  // Only show the "just published" list when there are enough posts to avoid repeating cards.
  const heroSide = rest.length >= 6 ? rest.slice(0, 2) : [];
  const grid = rest.slice(heroSide.length, heroSide.length + 6);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: getSiteUrl(),
      description: SITE_DESCRIPTION,
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${absoluteUrl("/blog")}?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE_NAME,
      url: getSiteUrl(),
      logo: absoluteUrl("/logo.png"),
    },
  ];

  return (
    <>
      <JsonLd data={jsonLd} />

      {/* Hero */}
      <section className="relative -mt-16 overflow-hidden pt-16">
        <div className="bg-grid pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-gradient-to-r from-brand-400/30 via-fuchsia-400/25 to-cyan-300/30 blur-3xl dark:from-brand-700/30 dark:via-fuchsia-700/20 dark:to-cyan-700/20" />

        <div className="container-page relative grid items-center gap-12 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          <div className="animate-fade-up">
            <span className="eyebrow">
              <Sparkles className="h-3.5 w-3.5" /> Fresh articles every week
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.08] text-zinc-900 sm:text-5xl lg:text-6xl dark:text-white">
              Learn faster. Build smarter.{" "}
              <span className="text-accent">Stay ahead in tech.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">{SITE_DESCRIPTION}</p>

            <form action="/blog" method="get" role="search" className="mt-8 max-w-xl">
              <label htmlFor="hero-search" className="sr-only">
                Search articles
              </label>
              <div className="flex items-center gap-2 rounded-2xl bg-white p-1.5 shadow-lg shadow-zinc-900/5 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
                <Search className="ml-3 h-5 w-5 shrink-0 text-zinc-400" />
                <input
                  id="hero-search"
                  name="q"
                  type="search"
                  maxLength={100}
                  placeholder="Search React, AI, Next.js, DevOps…"
                  className="min-w-0 flex-1 bg-transparent px-1 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none dark:text-white"
                />
                <button type="submit" className="btn-primary py-3">
                  Search
                </button>
              </div>
            </form>

            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
              <Link href="/blog" className="btn-brand px-6 py-3">
                <BookOpen className="h-4 w-4" /> Start reading
              </Link>
              <dl className="flex gap-8">
                <div>
                  <dt className="text-xs text-zinc-500 dark:text-zinc-400">Articles</dt>
                  <dd className="font-display text-2xl font-extrabold text-zinc-900 dark:text-white">{total}</dd>
                </div>
                <div>
                  <dt className="text-xs text-zinc-500 dark:text-zinc-400">Topics</dt>
                  <dd className="font-display text-2xl font-extrabold text-zinc-900 dark:text-white">{topics.length}</dd>
                </div>
              </dl>
            </div>
          </div>

          {hero ? (
            <div className="relative animate-fade-up [animation-delay:150ms]">
              <BlogCard blog={hero} priority />
              {heroSide.length > 0 && (
                <div className="card mt-4 space-y-4 p-4 sm:p-5">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                    <Flame className="h-4 w-4 text-orange-500" /> Just published
                  </p>
                  {heroSide.map((blog) => (
                    <BlogCard key={blog._id} blog={blog} variant="compact" />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="card flex flex-col items-center justify-center gap-3 p-12 text-center">
              <BookOpen className="h-10 w-10 text-brand-500" />
              <p className="font-display text-xl font-bold">First articles are on the way</p>
              <p className="text-sm text-zinc-500">Subscribe below to get notified when they land.</p>
            </div>
          )}
        </div>
      </section>

      {/* Trending topics */}
      {topics.length > 0 && (
        <section aria-label="Trending topics" className="border-y border-zinc-200/80 bg-zinc-50/70 dark:border-zinc-800 dark:bg-zinc-900/30">
          <div className="container-page flex items-center gap-4 overflow-x-auto py-4 [scrollbar-width:none]">
            <span className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-zinc-900 dark:text-white">
              <TrendingUp className="h-4 w-4 text-brand-600" /> Trending
            </span>
            {topics.map((topic) => (
              <Link key={topic.slug} href={topicPath(topic.name)} className="chip shrink-0">
                <Hash className="h-3 w-3 text-zinc-400" />
                {topic.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured story */}
      {featuredStory && (
        <section className="container-page pt-20">
          <SectionHeading eyebrow="Editor's pick" title="Featured story" />
          <BlogCard blog={featuredStory} variant="featured" />
        </section>
      )}

      {/* Latest + popular */}
      <section className="container-page pt-20">
        <div className="grid gap-12 lg:grid-cols-[1fr_320px]">
          <div>
            <SectionHeading
              eyebrow="Latest"
              title="Fresh from the blog"
              description="New tutorials, explainers and news — straight from our writers."
              href="/blog"
              linkLabel="All articles"
            />
            {grid.length ? (
              <div className="grid gap-6 sm:grid-cols-2">
                {grid.map((blog) => (
                  <BlogCard key={blog._id} blog={blog} />
                ))}
              </div>
            ) : (
              <p className="card p-10 text-center text-zinc-500">More articles are coming soon.</p>
            )}
          </div>

          <aside className="space-y-8 lg:pt-[88px]">
            {popular.length > 0 && (
              <div className="card p-6">
                <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-white">
                  <Flame className="h-5 w-5 text-orange-500" /> Most read
                </h2>
                <ol className="mt-5 space-y-5">
                  {popular.map((blog, index) => (
                    <li key={blog._id} className="flex gap-4">
                      <span className="font-display text-2xl font-extrabold text-zinc-200 dark:text-zinc-800">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <BlogCardTitle blog={blog} />
                    </li>
                  ))}
                </ol>
              </div>
            )}
            <div className="rounded-2xl border border-brand-100 bg-brand-50/70 p-6 dark:border-brand-900/50 dark:bg-brand-950/30">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">
                <Sparkles className="h-5 w-5" />
              </span>
              <p className="mt-4 font-display text-lg font-bold text-zinc-900 dark:text-white">Got a question?</p>
              <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                Our AI assistant can explain any concept from our articles — tap the chat button.
              </p>
              <a href="#newsletter" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-300">
                Join the newsletter <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </aside>
        </div>
      </section>

      {/* Explore topics */}
      {topics.length > 0 && (
        <section className="container-page pt-24">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.7fr)] lg:gap-14">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <p className="text-sm font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">Explore</p>
              <h2 className="mt-2 text-3xl font-extrabold text-zinc-900 sm:text-4xl dark:text-white">Browse by topic</h2>
              <p className="mt-4 leading-7 text-zinc-600 dark:text-zinc-400">
                Pick a subject and dive in. Every topic page collects the related tutorials, guides and news in one place.
              </p>
              <dl className="mt-8 grid max-w-xs grid-cols-2 gap-3">
                <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
                  <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Topics</dt>
                  <dd className="mt-1 font-display text-2xl font-extrabold text-zinc-900 dark:text-white">{topics.length}</dd>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
                  <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Articles</dt>
                  <dd className="mt-1 font-display text-2xl font-extrabold text-zinc-900 dark:text-white">{total}</dd>
                </div>
              </dl>
              <Link href="/topics" className="btn-ghost mt-8">
                View all topics <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <ul className="grid gap-3 sm:grid-cols-2">
              {topics.slice(0, 10).map((topic) => (
                <li key={topic.slug}>
                  <TopicCard topic={topic} max={topics[0]?.count || 1} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Value props */}
      <section className="container-page pt-24">
        <div className="grid gap-6 md:grid-cols-3">
          {VALUE_PROPS.map((item) => (
            <div key={item.title} className="card p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-300">
                <item.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-bold text-zinc-900 dark:text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{item.description}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function BlogCardTitle({ blog }: { blog: { title: string; slug?: string; _id: string; readingTime?: number } }) {
  return (
    <div className="min-w-0">
      <Link
        href={`/blog/${blog.slug || blog._id}`}
        className="line-clamp-2 font-semibold leading-snug text-zinc-900 transition-colors hover:text-brand-600 dark:text-zinc-100 dark:hover:text-brand-300"
      >
        {blog.title}
      </Link>
      <p className="mt-1 text-xs text-zinc-500">{blog.readingTime || 1} min read</p>
    </div>
  );
}

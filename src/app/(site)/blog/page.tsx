import type { Metadata } from "next";
import { Suspense } from "react";
import BlogList from "@/components/BlogList";
import JsonLd from "@/components/JsonLd";
import { getAllTopics, getPublishedBlogs } from "@/lib/blog";
import { SITE_NAME, absoluteUrl, blogPath } from "@/lib/site";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "All articles",
  description: `Browse every tutorial, guide and tech news story published on ${SITE_NAME}. Search by keyword or filter by topic.`,
  alternates: { canonical: "/blog" },
  openGraph: { url: "/blog", title: `All articles | ${SITE_NAME}` },
};

export default async function BlogPage() {
  const [blogs, topics] = await Promise.all([getPublishedBlogs(300), getAllTopics(20)]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `All articles | ${SITE_NAME}`,
    url: absoluteUrl("/blog"),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: blogs.slice(0, 30).map((blog, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: absoluteUrl(blogPath(blog)),
        name: blog.title,
      })),
    },
  };

  return (
    <div className="container-page py-12 sm:py-16">
      <JsonLd data={jsonLd} />
      <header className="mb-10 max-w-3xl">
        <p className="eyebrow">The archive</p>
        <h1 className="mt-4 text-4xl font-extrabold text-zinc-900 sm:text-5xl dark:text-white">
          Every article, <span className="text-accent">one place.</span>
        </h1>
        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
          {blogs.length} articles on programming, AI, web development and the tools developers love.
        </p>
      </header>
      <Suspense fallback={null}>
        <BlogList initialBlogs={blogs} topics={topics.map((topic) => topic.name)} />
      </Suspense>
    </div>
  );
}

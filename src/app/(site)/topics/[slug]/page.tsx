import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ArrowLeft } from "lucide-react";
import BlogCard from "@/components/BlogCard";
import JsonLd from "@/components/JsonLd";
import { getBlogsByTopic } from "@/lib/blog";
import { SITE_NAME, absoluteUrl, blogPath, topicPath } from "@/lib/site";

export const revalidate = 300;

type TopicPageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return [];
}

const loadTopic = cache(async (slug: string) => getBlogsByTopic(slug.toLowerCase().slice(0, 100)));

export async function generateMetadata({ params }: TopicPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { topic } = await loadTopic(slug);
  if (!topic) return { title: "Topic not found", robots: { index: false } };

  return {
    title: `${topic.name} articles & tutorials`,
    description: `Read ${topic.count} ${topic.name} articles, tutorials and guides on ${SITE_NAME}.`,
    alternates: { canonical: topicPath(topic.name) },
    openGraph: { url: topicPath(topic.name), title: `${topic.name} articles | ${SITE_NAME}` },
  };
}

export default async function TopicPage({ params }: TopicPageProps) {
  const { slug } = await params;
  const { topic, blogs } = await loadTopic(slug);
  if (!topic) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${topic.name} articles`,
    url: absoluteUrl(topicPath(topic.name)),
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
      <Link href="/topics" className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
        <ArrowLeft className="h-4 w-4" /> All topics
      </Link>
      <header className="mb-12 max-w-3xl">
        <p className="eyebrow">Topic</p>
        <h1 className="mt-4 text-4xl font-extrabold text-zinc-900 sm:text-5xl dark:text-white">
          <span className="text-accent">#</span>
          {topic.name}
        </h1>
        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
          {topic.count} {topic.count === 1 ? "article" : "articles"} about {topic.name}.
        </p>
      </header>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {blogs.map((blog, index) => (
          <BlogCard key={blog._id} blog={blog} priority={index < 3} />
        ))}
      </div>
    </div>
  );
}

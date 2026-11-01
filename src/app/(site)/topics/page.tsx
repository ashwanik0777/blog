import type { Metadata } from "next";
import TopicCard from "@/components/TopicCard";
import { getAllTopics } from "@/lib/blog";
import { SITE_NAME } from "@/lib/site";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Topics",
  description: `Explore ${SITE_NAME} articles by topic — programming languages, frameworks, AI, cloud, DevOps and more.`,
  alternates: { canonical: "/topics" },
};

export default async function TopicsPage() {
  const topics = await getAllTopics(200);
  const max = Math.max(1, ...topics.map((topic) => topic.count));

  return (
    <div className="container-page py-12 sm:py-16">
      <header className="mb-12 max-w-3xl">
        <p className="eyebrow">Explore</p>
        <h1 className="mt-4 text-4xl font-extrabold text-zinc-900 sm:text-5xl dark:text-white">
          Find your next <span className="text-accent">rabbit hole.</span>
        </h1>
        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
          {topics.length} topics covering everything from fundamentals to the latest releases.
        </p>
      </header>

      {topics.length === 0 ? (
        <p className="card p-10 text-center text-zinc-500">Topics will appear here once articles are published.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => (
            <li key={topic.slug}>
              <TopicCard topic={topic} max={max} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import TopicIcon from "@/components/TopicIcon";
import type { Topic } from "@/lib/blog";
import { topicPath } from "@/lib/site";

/** One topic with its icon, article count and a popularity bar relative to the busiest topic. */
export default function TopicCard({ topic, max }: { topic: Topic; max: number }) {
  const share = Math.max(10, Math.round((topic.count / Math.max(1, max)) * 100));

  return (
    <Link
      href={topicPath(topic.name)}
      className="group flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-brand-700"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100 transition-colors duration-200 group-hover:bg-brand-600 group-hover:text-white group-hover:ring-brand-600 dark:bg-brand-950/50 dark:text-brand-300 dark:ring-brand-900/60">
        <TopicIcon name={topic.name} className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-semibold text-zinc-900 transition-colors group-hover:text-brand-700 dark:text-white dark:group-hover:text-brand-300">
          {topic.name}
        </span>
        <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">
          {topic.count} {topic.count === 1 ? "article" : "articles"}
        </span>
        <span className="mt-2 block h-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800" aria-hidden>
          <span className="block h-full rounded-full bg-brand-500" style={{ width: `${share}%` }} />
        </span>
      </span>
      <ArrowUpRight className="h-4 w-4 shrink-0 text-zinc-300 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-600 dark:text-zinc-600" />
    </Link>
  );
}

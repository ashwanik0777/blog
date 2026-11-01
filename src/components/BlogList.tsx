"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SearchX, X } from "lucide-react";
import BlogCard from "@/components/BlogCard";
import type { BlogSummary } from "@/lib/blog";

const PAGE_SIZE = 12;

interface BlogListProps {
  initialBlogs: BlogSummary[];
  topics: string[];
}

function matches(blog: BlogSummary, term: string, topic: string) {
  const topicList = [...(blog.categories || []), ...(blog.tags || [])].map((value) => value.toLowerCase());
  if (topic && !topicList.includes(topic.toLowerCase())) return false;
  if (!term) return true;
  const haystack = [blog.title, blog.summary, blog.excerpt, ...topicList].filter(Boolean).join(" ").toLowerCase();
  return term
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word));
}

export default function BlogList({ initialBlogs, topics }: BlogListProps) {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(() => (searchParams.get("q") || "").slice(0, 100));
  const [activeTopic, setActiveTopic] = useState(() => searchParams.get("topic") || "");
  const [visible, setVisible] = useState(PAGE_SIZE);

  // Keep the box in sync when the header search navigates to /blog?q=…
  const queryParam = searchParams.get("q") || "";
  const [appliedQuery, setAppliedQuery] = useState(queryParam);
  if (queryParam !== appliedQuery) {
    setAppliedQuery(queryParam);
    setSearchTerm(queryParam.slice(0, 100));
    setVisible(PAGE_SIZE);
  }

  const filteredBlogs = useMemo(
    () => initialBlogs.filter((blog) => matches(blog, searchTerm.trim(), activeTopic)),
    [initialBlogs, searchTerm, activeTopic]
  );

  const hasFilters = Boolean(searchTerm.trim() || activeTopic);

  return (
    <>
      <div className="sticky top-16 z-20 -mx-4 mb-8 border-b border-zinc-200/70 bg-white/85 px-4 py-4 backdrop-blur-xl sm:mx-0 sm:rounded-2xl sm:border dark:border-zinc-800/70 dark:bg-zinc-950/85">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative w-full lg:max-w-sm">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="search"
              className="input pl-10"
              placeholder="Search articles…"
              aria-label="Search articles"
              maxLength={100}
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setVisible(PAGE_SIZE);
              }}
            />
          </div>
          {topics.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] lg:pb-0" role="toolbar" aria-label="Filter by topic">
              <button
                type="button"
                onClick={() => setActiveTopic("")}
                aria-pressed={!activeTopic}
                className={`chip shrink-0 ${!activeTopic ? "border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800 hover:text-white dark:border-white dark:bg-white dark:text-zinc-900" : ""}`}
              >
                All
              </button>
              {topics.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  aria-pressed={activeTopic === topic}
                  onClick={() => {
                    setActiveTopic(activeTopic === topic ? "" : topic);
                    setVisible(PAGE_SIZE);
                  }}
                  className={`chip shrink-0 ${
                    activeTopic === topic ? "border-brand-600 bg-brand-600 text-white hover:bg-brand-700 hover:text-white dark:border-brand-500 dark:bg-brand-600 dark:text-white" : ""
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {hasFilters && (
        <div className="mb-6 flex items-center justify-between text-sm text-zinc-600 dark:text-zinc-400">
          <p>
            {filteredBlogs.length} {filteredBlogs.length === 1 ? "result" : "results"}
            {searchTerm.trim() && (
              <>
                {" "}for <span className="font-semibold text-zinc-900 dark:text-white">“{searchTerm.trim()}”</span>
              </>
            )}
            {activeTopic && (
              <>
                {" "}in <span className="font-semibold text-zinc-900 dark:text-white">{activeTopic}</span>
              </>
            )}
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm("");
              setActiveTopic("");
            }}
            className="inline-flex items-center gap-1 font-medium text-brand-600 hover:text-brand-700 dark:text-brand-300"
          >
            <X className="h-4 w-4" /> Clear
          </button>
        </div>
      )}

      {filteredBlogs.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 px-6 py-20 text-center">
          <SearchX className="h-10 w-10 text-zinc-300 dark:text-zinc-700" />
          <p className="font-display text-xl font-bold text-zinc-900 dark:text-white">No articles found</p>
          <p className="max-w-sm text-sm text-zinc-500">Try a different keyword or browse all topics instead.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredBlogs.slice(0, visible).map((blog, index) => (
              <BlogCard key={blog._id} blog={blog} priority={index < 3} />
            ))}
          </div>
          {visible < filteredBlogs.length && (
            <div className="mt-12 flex justify-center">
              <button type="button" onClick={() => setVisible((count) => count + PAGE_SIZE)} className="btn-ghost px-8 py-3">
                Load more articles ({filteredBlogs.length - visible} left)
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}

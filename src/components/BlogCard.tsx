"use client";
import Link from "next/link";
import { motion } from "framer-motion";

function getReadingTime(content: string) {
  if (!content) return 1;
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default function BlogCard({ blog }: { blog: any }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -4, boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow p-0 flex flex-col overflow-hidden group border border-gray-100 dark:border-gray-800"
    >
      <div className="relative w-full h-48 overflow-hidden">
        {blog.featuredImage && (
          <img
            src={blog.featuredImage}
            alt={blog.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>
      <div className="p-4 flex flex-col flex-1">
        <Link href={`/blog/${blog.slug}`} className="text-xl font-bold hover:underline line-clamp-2 mb-1">
          {blog.title}
        </Link>
        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-2 flex-1">{blog.summary}</p>
        <div className="flex items-center gap-2 mt-2 mb-2">
          {blog.author?.image && (
            <img src={blog.author.image} alt={blog.author.name} className="w-7 h-7 rounded-full object-cover border border-gray-200 dark:border-gray-700" />
          )}
          <span className="text-xs text-gray-500">By {blog.author?.name || "Unknown"}</span>
          <span className="text-xs text-gray-400">• {new Date(blog.createdAt).toLocaleDateString()}</span>
          <span className="text-xs text-blue-500 ml-auto">{getReadingTime(blog.content)} min read</span>
        </div>
        <div className="flex flex-wrap gap-1 mb-3">
          {blog.tags?.map((tag: string, i: number) => (
            <motion.span
              key={tag}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.05, type: "spring", stiffness: 200 }}
              whileHover={{ scale: 1.12, boxShadow: "0 0 8px #2563eb44" }}
              className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs cursor-pointer transition-all"
            >
              #{tag}
            </motion.span>
          ))}
        </div>
        <Link
          href={`/blog/${blog.slug}`}
          className="mt-auto inline-block bg-blue-600 text-white px-4 py-2 rounded-lg font-medium shadow hover:bg-blue-700 transition"
        >
          Read more
        </Link>
      </div>
    </motion.div>
  );
}

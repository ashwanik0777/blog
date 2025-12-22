"use client";
import Link from "next/link";
import Image from "next/image";
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
        <div className="absolute inset-0 bg-black/40" />
        {blog.featured && (
          <div className="absolute top-3 left-3 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
            ⭐ Featured
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <Link href={`/blog/${blog._id}`} className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 hover:underline line-clamp-2 mb-2 transition-colors">
          {blog.title}
        </Link>
        <p className="text-gray-700 dark:text-gray-200 text-sm line-clamp-2 mb-3 flex-1 leading-relaxed">
          {blog.excerpt || blog.summary}
        </p>
        <div className="flex items-center gap-2 mt-2 mb-3">
          {blog.author?.image && (
            <Image src={blog.author.image} alt={blog.author.name} width={28} height={28} className="rounded-full object-cover border border-gray-200 dark:border-gray-700" />
          )}
          <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">By {blog.author?.name || "Unknown"}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">• {new Date(blog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}</span>
          <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold ml-auto">
            {blog.readingTime || getReadingTime(blog.content)} min read
          </span>
        </div>
        <div className="flex flex-wrap gap-1 mb-3">
          {blog.categories?.slice(0, 2).map((category: string, i: number) => (
            <motion.span
              key={category}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.05, type: "spring", stiffness: 200 }}
              whileHover={{ scale: 1.12, boxShadow: "0 0 8px #10b98144" }}
              className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded-md text-xs font-medium cursor-pointer transition-all hover:bg-green-200 dark:hover:bg-green-800"
            >
              {category}
            </motion.span>
          ))}
          {blog.tags?.slice(0, 3).map((tag: string, i: number) => (
            <motion.span
              key={tag}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.05, type: "spring", stiffness: 200 }}
              whileHover={{ scale: 1.12, boxShadow: "0 0 8px #2563eb44" }}
              className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-md text-xs font-medium cursor-pointer transition-all hover:bg-blue-200 dark:hover:bg-blue-800"
            >
              #{tag}
            </motion.span>
          ))}
        </div>
        <Link
          href={`/blog/${blog.slug}`}
          className="mt-auto inline-block bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:bg-blue-700 hover:shadow-lg transition-all"
        >
          Read more
        </Link>
      </div>
    </motion.div>
  );
}

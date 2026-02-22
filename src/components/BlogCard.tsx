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
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 overflow-hidden group transition-all duration-300"
    >
      <div className="relative w-full h-52 overflow-hidden bg-gray-100 dark:bg-gray-800">
        {blog.featuredImage ? (
          <Image
            src={blog.featuredImage}
            alt={blog.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={blog.featured}
          />
        ) : (
          <>
            <Image
              src="/blog-fallback-tech.svg"
              alt="Tech blog illustration"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </>
        )}
        {blog.featured && (
          <div className="absolute top-3 left-3 rounded-xl border border-blue-200/60 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-3 py-1.5 text-xs font-bold text-white shadow-lg shadow-blue-900/30">
            ⭐ Featured
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <Link href={`/blog/${blog._id}`} className="text-xl font-black text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 line-clamp-2 mb-3 transition-colors leading-tight">
          {blog.title}
        </Link>
        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4 flex-1 leading-relaxed">
          {blog.excerpt || blog.summary}
        </p>
        <div className="flex items-center gap-2 mb-4">
          {blog.author?.image && (
            <Image src={blog.author.image} alt={blog.author.name} width={32} height={32} className="rounded-full object-cover border-2 border-gray-200 dark:border-gray-700" />
          )}
          <span className="text-xs text-gray-600 dark:text-gray-400 font-semibold">By {blog.author?.name || "Unknown"}</span>
          <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(blog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
          <span className="text-xs text-blue-600 dark:text-blue-400 font-bold ml-auto">
            {blog.readingTime || getReadingTime(blog.content)} min read
          </span>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {blog.categories?.slice(0, 2).map((category: string, i: number) => (
            <motion.span
              key={category}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.05, type: "spring", stiffness: 200 }}
              whileHover={{ scale: 1.05 }}
              className="bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400 px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all border border-green-200 dark:border-green-800"
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
              whileHover={{ scale: 1.05 }}
              className="bg-blue-50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all border border-blue-200 dark:border-blue-800"
            >
              #{tag}
            </motion.span>
          ))}
        </div>
        <Link
          href={`/blog/${blog._id}`}
          className="mt-auto inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all text-center"
        >
          Read Article
        </Link>
      </div>
    </motion.div>
  );
}

"use client";

import { useState } from "react";
import BlogCard from "@/components/BlogCard";
import { Search } from "lucide-react";

interface BlogListProps {
  initialBlogs: any[];
}

export default function BlogList({ initialBlogs }: BlogListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBlogs = initialBlogs.filter((blog) => {
    const term = searchTerm.toLowerCase();
    return (
      blog.title.toLowerCase().includes(term) ||
      blog._id.toLowerCase().includes(term) ||
      (blog.summary && blog.summary.toLowerCase().includes(term))
    );
  });

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Latest Blogs</h1>
        
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
            placeholder="Search by title or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {filteredBlogs.length === 0 ? (
          <div className="col-span-3 text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">No blogs found matching your search.</p>
          </div>
        ) : (
          filteredBlogs.map((blog) => <BlogCard key={blog._id} blog={blog} />)
        )}
      </div>
    </>
  );
}
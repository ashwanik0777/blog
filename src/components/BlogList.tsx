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
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-2">Explore Blogs</h1>
          <p className="text-gray-600 dark:text-gray-400">Discover {initialBlogs.length} articles</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl leading-5 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="Search blogs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {filteredBlogs.length === 0 ? (
          <div className="col-span-3 text-center py-20">
            <p className="text-gray-500 dark:text-gray-400 text-xl font-medium">No blogs found matching your search.</p>
          </div>
        ) : (
          filteredBlogs.map((blog) => <BlogCard key={blog._id} blog={blog} />)
        )}
      </div>
    </>
  );
}
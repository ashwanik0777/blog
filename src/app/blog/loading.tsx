import React from "react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <main className="max-w-6xl mx-auto py-8 px-4">
        <div className="h-10 w-48 bg-gray-200 dark:bg-gray-800 rounded mb-6 animate-pulse"></div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div 
              key={i} 
              className="bg-white dark:bg-gray-800 rounded-xl shadow p-0 flex flex-col overflow-hidden border border-gray-100 dark:border-gray-800 h-[400px]"
            >
              {/* Image Skeleton */}
              <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 animate-pulse" />
              
              <div className="p-4 flex flex-col flex-1">
                {/* Title Skeleton */}
                <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3 animate-pulse" />
                
                {/* Excerpt Skeleton */}
                <div className="space-y-2 mb-4 flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 animate-pulse" />
                </div>
                
                {/* Meta Skeleton */}
                <div className="flex items-center gap-3 mt-auto">
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 ml-auto animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
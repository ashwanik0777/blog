import { headers } from "next/headers";
import BlogList from "@/components/BlogList";
import Footer from "@/components/Footer";

export const dynamic = 'force-dynamic';

async function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }
  const headersList = await headers();
  const host = headersList.get('host');
  const protocol = host?.includes('localhost') ? 'http' : 'https';
  return `${protocol}://${host}`;
}

async function getBlogs() {
  try {
    const baseUrl = await getBaseUrl();
    const response = await fetch(`${baseUrl}/api/blog`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch blogs');
    }
    
    const data = await response.json();
    return data.blogs || []; 
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return [];
  }
}

export default async function BlogPage() {
  let blogs = [];
  let error = null;
  
  try {
    blogs = await getBlogs();
  } catch (e) {
    error = "Failed to load blogs.";
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300 flex flex-col">
      <main className="max-w-6xl mx-auto py-8 px-4 flex-grow w-full">
        {error ? (
          <div className="p-8 text-center text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <p className="font-semibold">{error}</p>
            <p className="text-sm mt-2">Please try again later.</p>
          </div>
        ) : (
          <BlogList initialBlogs={blogs} />
        )}
      </main>

    </div>
  );
}
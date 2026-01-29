import BlogList from "@/components/BlogList";
import Footer from "@/components/Footer";
import ThemeToggle from "@/components/ThemeToggle";
import Link from "next/link";
import dbConnect from "@/lib/mongodb";
import Blog from "@/models/Blog";

export const revalidate = 60;

async function getBlogs() {
  try {
    await dbConnect();
    const blogs = await Blog.find({ published: true })
      .select('title summary excerpt featuredImage categories tags featured readingTime createdAt')
      .sort({ publishedAt: -1 })
      .lean();
    return JSON.parse(JSON.stringify(blogs));
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white flex flex-col">
      {/* Navbar */}
      <nav className="w-full py-4 px-6 flex justify-between items-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-sm sticky top-0 z-40 border-b border-gray-200/50 dark:border-gray-800/50">
        <Link href="/" className="text-2xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          TechUpdatesZone
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/blog" className="text-blue-600 dark:text-blue-400 font-semibold">Blogs</Link>
          <ThemeToggle />
        </div>
      </nav>
      
      <main className="max-w-6xl mx-auto py-12 px-4 flex-grow w-full">
        {error ? (
          <div className="p-8 text-center text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800">
            <p className="font-semibold text-lg">{error}</p>
            <p className="text-sm mt-2 text-gray-600 dark:text-gray-400">Please try again later.</p>
          </div>
        ) : (
          <BlogList initialBlogs={blogs} />
        )}
      </main>

    </div>
  );
}
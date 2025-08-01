import Link from "next/link";
import NewsletterForm from "@/components/NewsletterForm";
import BlogCard from "@/components/BlogCard";
import { headers } from "next/headers";

async function getBaseUrl() {
  const headersList = await headers();
  const host = headersList.get('host');
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  return `${protocol}://${host}`;
}

async function getLatestBlogs() {
  const baseUrl = await getBaseUrl();
  const res = await fetch(`${baseUrl}/api/blog`, { cache: 'no-store' });
  if (!res.ok) return [];
  const data = await res.json();
  return data.blogs ? data.blogs.slice(0, 3) : [];
}

export default async function Home() {
    const latestBlogs = await getLatestBlogs();
  return (
   <>
   <main className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      {/* Navbar */}
      <nav className="w-full py-4 px-6 flex justify-between items-center bg-white/80 dark:bg-gray-900/80 shadow-sm sticky top-0 z-40 backdrop-blur">
        <Link href="/" className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">Gemini AI Blog</Link>
        <div className="flex gap-4">
          <Link href="/blog" className="text-blue-600 hover:underline font-medium">Blogs</Link>
          <Link href="/login" className="text-gray-700 dark:text-gray-200 hover:underline">Login</Link>
        </div>
      </nav>
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-4 py-16 flex flex-col items-center text-center">
        <div className="relative w-full flex flex-col items-center">
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-32 bg-gradient-to-tr from-blue-400 to-purple-400 rounded-full blur-2xl opacity-30 animate-pulse" />
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text drop-shadow-lg">
            Gemini AI Blog
          </h1>
          <p className="text-lg md:text-2xl text-gray-700 dark:text-gray-300 mb-6 max-w-2xl">
            The most modern, AI-powered, SEO-optimized blogging platform. Discover, create, and learn with the power of Google Gemini.
          </p>
          <Link href="/blog" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-blue-700 transition mb-4">
            Explore Blogs
          </Link>
          <span className="text-gray-500 dark:text-gray-400 text-sm">Or subscribe for updates:</span>
          <NewsletterForm />
        </div>
      </section>
      {/* Features Section */}
      <section className="max-w-5xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-8 text-center">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex flex-col items-center gap-2">
          <span className="text-3xl">🤖</span>
          <h3 className="font-bold text-lg">AI-Powered Content</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">Generate, summarize, and enhance blogs with Google Gemini AI. Get instant suggestions and summaries as you write.</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex flex-col items-center gap-2">
          <span className="text-3xl">🚀</span>
          <h3 className="font-bold text-lg">SEO & Analytics</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">Automatic meta tags, sitemap, robots.txt, and Google Analytics integration for top search rankings and insights.</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex flex-col items-center gap-2">
          <span className="text-3xl">💬</span>
          <h3 className="font-bold text-lg">Live AI Chatbot</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">Ask questions, get blog suggestions, and interact with Gemini AI in real time. Always available, always learning.</p>
        </div>
      </section>
      {/* Latest Blogs Preview */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Latest Blogs</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {latestBlogs.length === 0 ? (
            <div className="col-span-3 text-gray-500 text-center">No blogs found.</div>
          ) : (
            latestBlogs.map((blog: any) => <BlogCard key={blog._id} blog={blog} />)
          )}
        </div>
        <div className="flex justify-center mt-6">
          <Link href="/blog" className="text-blue-600 underline font-medium">View all blogs &rarr;</Link>
        </div>
      </section>
      {/* Testimonials Section */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6 text-center">What Our Users Say</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <p className="text-gray-700 dark:text-gray-300 italic mb-2">“Gemini AI Blog helped me write and publish my first article in minutes. The AI suggestions are a game changer!”</p>
            <span className="font-semibold text-blue-600">— Priya S., Content Creator</span>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <p className="text-gray-700 dark:text-gray-300 italic mb-2">“The analytics and SEO tools are top notch. My blog traffic doubled in a month!”</p>
            <span className="font-semibold text-blue-600">— Alex R., Blogger</span>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-gray-900 py-8 mt-12 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 text-center text-gray-500 dark:text-gray-400">
          <div className="mb-2">&copy; {new Date().getFullYear()} Gemini AI Blog. All rights reserved.</div>
          <div className="text-xs">Built with Next.js, Tailwind CSS, MongoDB, and Google Gemini AI.</div>
        </div>
      </footer>
    </main>
   </>
  );
}

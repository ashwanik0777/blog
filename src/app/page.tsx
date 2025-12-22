import Link from "next/link";
import BlogCard from "@/components/BlogCard";
import Footer from "@/components/Footer";
import { headers } from "next/headers";
import { Sparkles, TrendingUp, ShieldCheck, Zap, BookOpen, Code, Rocket } from "lucide-react";

async function getBaseUrl() {
  const headersList = await headers();
  const host = headersList.get('host');
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  return `${protocol}://${host}`;
}

async function getLatestBlogs() {
  try {
    const baseUrl = await getBaseUrl();
    const res = await fetch(`${baseUrl}/api/blog?pageSize=6`, { 
      cache: 'no-store',
      next: { revalidate: 0 }
    });
    if (!res.ok) {
      console.error('Blog fetch failed:', res.status);
      return [];
    }
    const data = await res.json();
    const blogs = data.blogs || [];
    const publishedBlogs = blogs.filter((blog: any) => blog.published === true);
    return publishedBlogs.slice(0, 6);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return [];
  }
}

export default async function Home() {
  const latestBlogs = await getLatestBlogs();
  return (
    <main className="min-h-screen bg-white dark:bg-gray-900">
      {/* Navbar */}
      <nav className="w-full py-4 px-6 flex justify-between items-center bg-white dark:bg-gray-900 shadow-md sticky top-0 z-40 border-b border-gray-200 dark:border-gray-700">
        <Link href="/" className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
          TechUpdatesZone Blog
        </Link>
        <div className="flex gap-6">
          <Link href="/blog" className="text-blue-600 hover:text-blue-700 hover:underline font-semibold transition-colors">Blogs</Link>
          {/* <Link href="/admin" className="text-gray-800 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 hover:underline font-medium transition-colors">Admin</Link> */}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Zap className="h-4 w-4" />
            AI-Powered Tech Blog
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
            Latest from <span className="text-blue-600 dark:text-blue-400">TechUpdatesZone</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8 leading-relaxed">
            Stay updated with cutting-edge tech insights, in-depth tutorials, and industry news powered by AI
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold shadow-lg hover:bg-blue-700 transition-all transform hover:scale-105"
            >
              <BookOpen className="h-5 w-5" />
              Explore All Blogs
            </Link>
            <Link
              href="/report-issue"
              className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 px-8 py-4 rounded-lg font-semibold border-2 border-blue-600 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
            >
              Report an Issue
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 dark:bg-gray-800 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why TechUpdatesZone?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Discover what makes our platform unique
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Sparkles,
                title: "AI-Powered Content",
                description: "Leverage Google Gemini AI for intelligent content generation, summaries, and insights that keep you ahead of the curve.",
                color: "text-purple-600 dark:text-purple-400"
              },
              {
                icon: Rocket,
                title: "Latest Tech Trends",
                description: "Get real-time updates on emerging technologies, frameworks, and best practices from industry experts.",
                color: "text-blue-600 dark:text-blue-400"
              },
              {
                icon: Code,
                title: "Deep-Dive Tutorials",
                description: "Comprehensive guides and tutorials that help you master new technologies and improve your development skills.",
                color: "text-green-600 dark:text-green-400"
              },
              {
                icon: ShieldCheck,
                title: "Quality Content",
                description: "Every article is carefully curated and reviewed to ensure accuracy, relevance, and value for our readers.",
                color: "text-orange-600 dark:text-orange-400"
              },
              {
                icon: TrendingUp,
                title: "SEO Optimized",
                description: "All content is optimized for search engines, making it easy to discover and share with your network.",
                color: "text-red-600 dark:text-red-400"
              },
              {
                icon: BookOpen,
                title: "Regular Updates",
                description: "Fresh content published regularly to keep you informed about the latest developments in the tech world.",
                color: "text-indigo-600 dark:text-indigo-400"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                <div className={`w-12 h-12 ${feature.color} bg-opacity-10 dark:bg-opacity-20 rounded-lg flex items-center justify-center mb-4`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Blogs Section */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Latest Articles
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Explore our most recent tech insights and tutorials
          </p>
        </div>

        {latestBlogs.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <div className="text-gray-500 dark:text-gray-400 text-lg mb-4">No blogs published yet.</div>
            <Link href="/admin" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
              Create your first blog →
            </Link>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {latestBlogs.map((blog: any) => (
                <BlogCard key={blog._id} blog={blog} />
              ))}
            </div>
            <div className="text-center">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold shadow-md hover:bg-blue-700 transition-all transform hover:scale-105"
              >
                View All Blogs
                <TrendingUp className="h-5 w-5" />
              </Link>
            </div>
          </>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-blue-500 dark:bg-blue-700 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Stay Updated with TechUpdatesZone
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Get the latest tech news, tutorials, and insights delivered to your inbox
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold shadow-lg hover:bg-gray-100 transition-all transform hover:scale-105"
            >
              Browse Articles
            </Link>
            <Link
              href="/report-issue"
              className="inline-flex items-center gap-2 bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold border-2 border-white hover:bg-blue-800 transition-all"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

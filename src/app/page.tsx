import Link from "next/link";
import BlogCard from "@/components/BlogCard";
import Footer from "@/components/Footer";
import ThemeToggle from "@/components/ThemeToggle";
import { Sparkles, TrendingUp, ShieldCheck, Zap, BookOpen, Code, Rocket } from "lucide-react";
import dbConnect from "@/lib/mongodb";
import Blog from "@/models/Blog";

export const revalidate = 60;

async function getLatestBlogs() {
  try {
    await dbConnect();
    const blogs = await Blog.find({ published: true })
      .select('title summary excerpt featuredImage categories tags featured readingTime createdAt')
      .sort({ publishedAt: -1 })
      .limit(6)
      .lean();
    return JSON.parse(JSON.stringify(blogs));
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return [];
  }
}

export default async function Home() {
  const latestBlogs = await getLatestBlogs();
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Navbar */}
      <nav className="w-full py-4 px-6 flex justify-between items-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-sm sticky top-0 z-40 border-b border-gray-200/50 dark:border-gray-800/50">
        <Link href="/" className="text-2xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          TechUpdatesZone
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/blog" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">Blogs</Link>
          <ThemeToggle />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-blue-200 dark:border-blue-800">
            <Zap className="h-4 w-4" />
            AI-Powered Tech Blog
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
            Welcome to<br/>
            <span className="text-blue-600 dark:text-blue-500">TechUpdatesZone</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Discover cutting-edge tech insights, comprehensive tutorials, and industry news powered by advanced AI technology
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <BookOpen className="h-5 w-5" />
              Explore Blogs
            </Link>
            <Link
              href="/report-issue"
              className="inline-flex items-center gap-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-8 py-4 rounded-xl font-semibold border-2 border-gray-300 dark:border-gray-700 hover:border-blue-600 dark:hover:border-blue-500 transition-all duration-300"
            >
              Report Issue
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white dark:bg-gray-900 py-20 border-y border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
              Why Choose Us?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Everything you need for modern tech blogging
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
                className="bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center mb-4">
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
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
            Latest Articles
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Stay ahead with our latest tech insights and tutorials
          </p>
        </div>

        {latestBlogs.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
            <BookOpen className="h-16 w-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
            <div className="text-gray-500 dark:text-gray-400 text-lg mb-4">No blogs published yet</div>
            <Link href="/admin" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold">
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
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                View All Blogs
                <TrendingUp className="h-5 w-5" />
              </Link>
            </div>
          </>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 dark:bg-black py-20 border-t border-gray-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Stay Updated
          </h2>
          <p className="text-xl text-gray-400 mb-10">
            Get the latest tech news, tutorials, and insights
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300"
            >
              Browse Articles
            </Link>
            <Link
              href="/report-issue"
              className="inline-flex items-center gap-2 bg-transparent text-white px-8 py-4 rounded-xl font-semibold border-2 border-white hover:bg-white hover:text-gray-900 transition-all duration-300"
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

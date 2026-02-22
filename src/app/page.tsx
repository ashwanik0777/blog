import Link from "next/link";
import BlogCard from "@/components/BlogCard";
import Footer from "@/components/Footer";
import ThemeToggle from "@/components/ThemeToggle";
import NewsletterForm from "@/components/NewsletterForm";
import {
  ArrowRight,
  BookOpen,
  Code,
  Compass,
  Flame,
  Rocket,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
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
  const topicHighlights = Array.from(
    new Set(
      latestBlogs
        .flatMap((blog: any) => [...(blog.categories || []), ...(blog.tags || [])])
        .filter(Boolean)
    )
  ).slice(0, 8);

  const featuredBlogs = latestBlogs.filter((blog: any) => blog.featured).slice(0, 2);

  const statItems = [
    { label: "Fresh Articles", value: `${latestBlogs.length || 0}+`, icon: BookOpen },
    { label: "Featured Posts", value: `${featuredBlogs.length || 0}`, icon: Sparkles },
    { label: "Curated Topics", value: `${topicHighlights.length || 0}+`, icon: Compass },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 text-gray-900 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900 dark:text-white">
      <nav className="sticky top-0 z-40 w-full border-b border-gray-200/60 bg-white/80 px-6 py-4 shadow-sm backdrop-blur-lg dark:border-gray-800/60 dark:bg-gray-900/80">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          TechUpdatesZone
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/blog" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">Blogs</Link>
          <ThemeToggle />
        </div>
        </div>
      </nav>

      <section className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:py-20">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 dark:border-blue-900 dark:bg-blue-900/20 dark:text-blue-300">
            <Zap className="h-4 w-4" />
            Smart content for modern developers
          </div>
          <h1 className="mb-5 text-4xl font-black leading-tight tracking-tight text-gray-900 dark:text-white md:text-6xl">
            Build smarter with
            <br />
            <span className="text-blue-600 dark:text-blue-500">TechUpdatesZone</span>
          </h1>
          
          <div className="mb-10 flex flex-wrap gap-4">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl"
            >
              <BookOpen className="h-5 w-5" />
              Explore Blogs
            </Link>
            <Link
              href="/report-issue"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-gray-300 bg-white px-7 py-3.5 font-semibold text-gray-900 transition-all duration-300 hover:border-blue-600 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:border-blue-500"
            >
              Report Issue
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {statItems.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="mb-2 inline-flex rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
                  <item.icon className="h-4 w-4" />
                </div>
                <div className="text-2xl font-black text-gray-900 dark:text-white">{item.value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xl shadow-blue-100/40 dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Trending Topics</h3>
            <Flame className="h-5 w-5 text-orange-500" />
          </div>
          <div className="mb-6 flex flex-wrap gap-2">
            {(topicHighlights.length ? topicHighlights : ["AI", "Next.js", "TypeScript", "Cloud"]).map((topic) => (
              <span
                key={topic}
                className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
              >
                #{topic}
              </span>
            ))}
          </div>

          <div className="space-y-3">
            {(featuredBlogs.length ? featuredBlogs : latestBlogs.slice(0, 2)).map((blog: any) => (
              <Link
                key={blog._id}
                href={`/blog/${blog._id}`}
                className="group block rounded-xl border border-gray-200 bg-gray-50 p-4 transition-all hover:border-blue-500 hover:bg-white dark:border-gray-700 dark:bg-gray-800/70 dark:hover:border-blue-500"
              >
                <p className="mb-1 text-sm font-semibold text-blue-600 dark:text-blue-400">Featured Read</p>
                <h4 className="line-clamp-2 font-bold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                  {blog.title}
                </h4>
                <p className="mt-2 flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                  Open article <ArrowRight className="h-3.5 w-3.5" />
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-gray-200 bg-white py-20 dark:border-gray-800 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
              Why developers choose us
            </h2>
            
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Sparkles,
                title: "AI-Powered Content",
                description: "Gemini-backed ideas, summaries and optimization that make content sharp and useful.",
                color: "text-purple-600 dark:text-purple-400"
              },
              {
                icon: Rocket,
                title: "Latest Tech Trends",
                description: "Frameworks, tooling, AI workflows and cloud updates explained in simple practical form.",
                color: "text-blue-600 dark:text-blue-400"
              },
              {
                icon: Code,
                title: "Deep-Dive Tutorials",
                description: "Production-focused guides with clear steps so you can apply concepts quickly.",
                color: "text-green-600 dark:text-green-400"
              },
              {
                icon: ShieldCheck,
                title: "Quality Content",
                description: "Every post is curated for clarity, correctness and direct value to developers.",
                color: "text-orange-600 dark:text-orange-400"
              },
              {
                icon: TrendingUp,
                title: "SEO Optimized",
                description: "Structured and discoverable articles so useful knowledge reaches the right audience.",
                color: "text-red-600 dark:text-red-400"
              },
              {
                icon: BookOpen,
                title: "Regular Updates",
                description: "Consistent posting cadence so you always have fresh learning material.",
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
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl"
              >
                View All Blogs
                <TrendingUp className="h-5 w-5" />
              </Link>
            </div>
          </>
        )}
      </section>

      <section className="border-t border-gray-200 bg-gradient-to-b from-blue-50/60 via-white to-white py-20 dark:border-gray-800 dark:from-gray-950 dark:via-gray-900 dark:to-black">
        <div className="mx-auto max-w-7xl px-4">
          <div className="rounded-3xl border border-blue-100 bg-white p-8 text-center shadow-xl shadow-blue-100/60 dark:border-gray-700 dark:bg-gray-900 dark:shadow-none md:p-12">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 dark:border-blue-900 dark:bg-blue-900/20 dark:text-blue-300">
              <Sparkles className="h-4 w-4" />
              Weekly Developer Digest
            </div>
            <h2 className="mb-4 text-4xl font-black text-gray-900 dark:text-white md:text-5xl">
              Join the developer newsletter
            </h2>
            
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No spam. Unsubscribe anytime.</p>

            <div className="mt-6">
              <NewsletterForm />
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl"
              >
                Browse Articles
              </Link>
              <Link
                href="/report-issue"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-gray-300 bg-transparent px-8 py-4 font-semibold text-gray-900 transition-all duration-300 hover:border-blue-600 hover:text-blue-700 dark:border-gray-500 dark:text-white dark:hover:border-blue-400 dark:hover:text-blue-300"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

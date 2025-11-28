import Link from "next/link";
import NewsletterForm from "@/components/NewsletterForm";
import BlogCard from "@/components/BlogCard";
import { headers } from "next/headers";
import { Sparkles, Cpu, MessageSquare, TrendingUp, ShieldCheck, Newspaper } from "lucide-react";

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
      <nav className="w-full py-4 px-6 flex justify-between items-center bg-white/90 dark:bg-gray-900/90 shadow-md sticky top-0 z-40 backdrop-blur border-b border-gray-200 dark:border-gray-700">
        <Link href="/" className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text hover:scale-105 transition-transform">
          TechUpdatesZone Blog
        </Link>
        <div className="flex gap-6">
          <Link href="/blog" className="text-blue-600 hover:text-blue-700 hover:underline font-semibold transition-colors">Blogs</Link>
          <Link href="/admin" className="text-gray-800 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 hover:underline font-medium transition-colors">Admin</Link>
        </div>
      </nav>
      {/* Hero + Latest Blogs side-by-side on desktop */}
      <section className="max-w-6xl mx-auto px-4 py-16 grid gap-12 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] items-start">
        {/* Hero Section */}
        <div className="relative w-full flex flex-col items-start text-left">
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-32 bg-gradient-to-tr from-blue-400 to-purple-400 rounded-full blur-2xl opacity-30 animate-pulse" />
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text drop-shadow-lg">
            TechUpdatesZone Blog
          </h1>
          <p className="text-lg md:text-2xl text-gray-800 dark:text-gray-100 mb-6 max-w-2xl font-medium">
            Your AI-powered hub for the latest tech updates, deep–dive tutorials, and industry insights — built on Next.js 15 and Google Gemini.
          </p>
          <Link href="/blog" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-blue-700 transition mb-4">
            Explore Blogs
          </Link>
          <span className="text-gray-700 dark:text-gray-200 text-base font-semibold mb-2">Or subscribe for TechUpdatesZone digests:</span>
          <NewsletterForm />
        </div>

        {/* Latest Blogs Highlight */}
        <aside className="w-full bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Latest from TechUpdatesZone</h2>
          {latestBlogs.length === 0 ? (
            <div className="text-gray-600 dark:text-gray-400 text-sm">No blogs published yet.</div>
          ) : (
            <div className="space-y-4">
              {latestBlogs.map((blog: any) => (
                <BlogCard key={blog._id} blog={blog} />
              ))}
            </div>
          )}
          <div className="flex justify-end mt-4">
            <Link href="/blog" className="text-blue-600 hover:text-blue-700 underline font-semibold text-sm transition-colors">
              View all articles →
            </Link>
          </div>
        </aside>
      </section>

      {/* Feature Highlights */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "AI-native publishing",
              description:
                "Generate drafts, summaries, SEO copy, alt text, and tags with Google Gemini in one click.",
              icon: Sparkles,
            },
            {
              title: "Editorial intelligence",
              description:
                "Real-time insights, trend tracking, and scheduled publishing keep your tech newsroom ahead.",
              icon: Cpu,
            },
            {
              title: "Conversational editor",
              description:
                "Chat with an embedded assistant to rewrite paragraphs, adjust tone, or brainstorm new ideas.",
              icon: MessageSquare,
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm hover:shadow-xl transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/15 to-purple-500/15 flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>
      {/* Latest Blogs Preview */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm uppercase tracking-wide text-blue-500 font-semibold">
              Fresh drops
            </p>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Latest insights from TechUpdatesZone
            </h2>
          </div>
          <Link
            href="/blog"
            className="hidden md:inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
          >
            Browse archive <TrendingUp className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {latestBlogs.length === 0 ? (
            <div className="col-span-3 text-gray-600 dark:text-gray-400 text-center text-lg">No blogs found.</div>
          ) : (
            latestBlogs.map((blog: any) => <BlogCard key={blog._id} blog={blog} />)
          )}
        </div>
        <div className="flex justify-center mt-8">
          <Link href="/blog" className="text-blue-600 hover:text-blue-700 underline font-semibold text-lg transition-colors">View all blogs &rarr;</Link>
        </div>
      </section>
      {/* Trust & testimonials */}
      <section className="max-w-6xl mx-auto px-4 py-12 grid gap-8 md:grid-cols-2">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-8 shadow-sm">
          <p className="text-sm uppercase tracking-wide text-blue-500 font-semibold mb-2">
            Why publishers switch
          </p>
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            Built for modern tech newsrooms
          </h2>
          <ul className="space-y-4 text-gray-700 dark:text-gray-300">
            {[
              {
                icon: ShieldCheck,
                text: "Enterprise security, role-based access, and audit-ready logging out of the box.",
              },
              {
                icon: TrendingUp,
                text: "Next.js 15 performance + structured data, canonical URLs, sitemaps, and robots automation.",
              },
              {
                icon: Newspaper,
                text: "Editorial workflows with drafts, scheduling, AI moderation, and newsletter automation.",
              },
            ].map((benefit) => (
              <li key={benefit.text} className="flex items-start gap-3">
                <benefit.icon className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-1" />
                <span className="text-sm leading-relaxed">{benefit.text}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-2xl p-8 shadow-lg">
          <p className="text-sm uppercase tracking-wide font-semibold opacity-80 mb-2">
            Creator stories
          </p>
          <blockquote className="text-lg leading-relaxed italic">
            “TechUpdatesZone’s AI-assisted editor trimmed my research time by 70%. I now publish twice as often, and every post ships with polished SEO metadata.”
          </blockquote>
          <div className="mt-6">
            <p className="font-semibold">Rahul Verma</p>
            <p className="text-sm opacity-80">Founder, DevPulse Newsletter</p>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-gray-900 py-8 mt-12 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="mb-2 text-gray-700 dark:text-gray-300 font-medium">
            &copy; {new Date().getFullYear()} TechUpdatesZone Blog. All rights reserved.
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Built with Next.js, Tailwind CSS, MongoDB, and Google Gemini AI.
          </div>
        </div>
      </footer>
    </main>
   </>
  );
}

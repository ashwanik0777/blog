import Link from "next/link";
import BlogCard from "@/components/BlogCard";
import { headers } from "next/headers";
import { Mail, MessageSquare, FileText, HelpCircle, Github, Twitter, Linkedin, Facebook } from "lucide-react";

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
    // Filter only published blogs
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
          <Link href="/admin" className="text-gray-800 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 hover:underline font-medium transition-colors">Admin</Link>
        </div>
      </nav>

      {/* Latest from TechUpdatesZone Section */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
            Latest from TechUpdatesZone
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Stay updated with the latest tech insights, tutorials, and industry news
          </p>
        </div>

        {latestBlogs.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-500 dark:text-gray-400 text-lg mb-4">No blogs published yet.</div>
            <Link href="/admin" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
              Create your first blog →
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {latestBlogs.map((blog: any) => (
              <BlogCard key={blog._id} blog={blog} />
            ))}
          </div>
        )}

        {latestBlogs.length > 0 && (
          <div className="text-center">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-blue-700 transition-colors"
            >
              View All Blogs
            </Link>
          </div>
        )}
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-20">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* About Section */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">About</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                TechUpdatesZone Blog - Your AI-powered hub for the latest tech updates, deep-dive tutorials, and industry insights.
              </p>
              <div className="flex gap-3">
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <Github className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/blog" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm">
                    All Blogs
                  </Link>
                </li>
                <li>
                  <Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/report-issue" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm">
                    Report Issue
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm flex items-center gap-2">
                    <HelpCircle className="h-4 w-4" />
                    Help Center
                  </a>
                </li>
                <li>
                  <Link href="/report-issue" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Contact Support
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Contact</h3>
              <ul className="space-y-2">
                <li>
                  <a href="mailto:support@techupdateszone.com" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    support@techupdateszone.com
                  </a>
                </li>
                <li>
                  <Link href="/report-issue" className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium mt-4">
                    <HelpCircle className="h-4 w-4" />
                    Report an Issue
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-gray-600 dark:text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} TechUpdatesZone Blog. All rights reserved.
              </div>
              <div className="flex gap-6 text-sm">
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Terms of Service
                </a>
                <Link href="/report-issue" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Report Issue
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

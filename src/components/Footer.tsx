import Link from "next/link";
import { Mail, MessageSquare, FileText, HelpCircle, Github, Twitter, Linkedin, Facebook, Eye, Users } from "lucide-react";

async function getVisitorStats() {
  try {
    // Use stats=true for optimized response
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/visitors?range=lifetime&stats=true`, {
      cache: 'no-store',
      next: { revalidate: 60 } // Revalidate every 60 seconds
    });
    if (!res.ok) {
      // Fallback to full API if stats endpoint fails
      const fallbackRes = await fetch(`${baseUrl}/api/visitors?range=lifetime`, {
        cache: 'no-store'
      });
      if (!fallbackRes.ok) return { uniqueVisitors: 0, totalPageViews: 0 };
      const fallbackData = await fallbackRes.json();
      return {
        uniqueVisitors: fallbackData.uniqueVisitors || 0,
        totalPageViews: fallbackData.totalViews || fallbackData.totalPageViews || 0,
      };
    }
    const data = await res.json();
    return {
      uniqueVisitors: data.uniqueVisitors || 0,
      totalPageViews: data.totalPageViews || data.totalViews || 0,
    };
  } catch (error) {
    console.error('Footer stats error:', error);
    return { uniqueVisitors: 0, totalPageViews: 0 };
  }
}

export default async function Footer() {
  const stats = await getVisitorStats();
  
  return (
    <footer className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 ">
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

          {/* Contact & Stats */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Contact & Stats</h3>
            <ul className="space-y-2 mb-4">
              <li>
                <a href="mailto:support@techupdateszone.com" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  support@techupdateszone.com
                </a>
              </li>
            </ul>
            
            {/* Visitor Stats */}
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-semibold text-blue-800 dark:text-blue-300">Visitor Stats (Lifetime)</span>
              </div>
              <div className="space-y-1 text-xs text-blue-700 dark:text-blue-300">
                <div className="flex items-center gap-2">
                  <Users className="h-3 w-3" />
                  <span>Unique Visitors: <strong>{stats.uniqueVisitors.toLocaleString()}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-3 w-3" />
                  <span>Page Views: <strong>{stats.totalPageViews.toLocaleString()}</strong></span>
                </div>
              </div>
            </div>
            
            <Link href="/report-issue" className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium mt-4">
              <HelpCircle className="h-4 w-4" />
              Report an Issue
            </Link>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-600 dark:text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} TechUpdatesZone Blog. All rights reserved.
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="/privacy-policy" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Terms of Service
              </Link>
              <Link href="/report-issue" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Report Issue
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

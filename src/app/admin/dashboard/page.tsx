"use client";
import { errorMessage, useConfirm, useToast } from "@/components/admin/AdminFeedback";
import type { AdminSessionUser } from "@/types/admin";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import AdminBlogEditor from "@/components/AdminBlogEditor";
import Link from "next/link";
import { 
  FileText, 
  Eye, 
  TrendingUp, 
  Users, 
  Calendar,
  Edit,
  Trash2,
  Plus,
  Search,
  CheckCircle,
  BarChart3,
  Bot,
  MessageSquare,
  Settings,
  ArrowRight,
  Clock,
  Tag, AlertCircle } from "lucide-react";

interface Blog {
  _id: string;
  title: string;
  slug: string;
  content: string;
  summary?: string;
  tags: string[];
  categories: string[];
  published: boolean;
  status: string;
  views?: number;
  createdAt?: string;
  author?: {
    name: string;
    email: string;
  };
}

export default function AdminDashboard() {
  const toast = useToast();
  const askConfirm = useConfirm();
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showEditor, setShowEditor] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [adminUser, setAdminUser] = useState<AdminSessionUser | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [stats, setStats] = useState({
    totalBlogs: 0,
    publishedBlogs: 0,
    totalViews: 0,
    totalUsers: 0,
  });

  // Check if user is admin
  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/admin-session');
        if (response.ok) {
          const data = await response.json();
          setAdminUser(data.user);
          fetchBlogs();
          fetchStats();
        } else {
          router.push('/admin');
        }
      } catch {
        router.push('/admin');
      } finally {
        setCheckingAuth(false);
      }
    }
    checkAuth();
  }, [router]);

  async function fetchBlogs() {
    try {
      const response = await fetch('/api/blog?admin=true');
      const data = await response.json();
      setBlogs(data.blogs || []);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchStats() {
    try {
      const response = await fetch('/api/admin/analytics?range=30d');
      if (response.ok) {
        const data = await response.json();
        setStats({
          totalBlogs: data.totalBlogs || 0,
          publishedBlogs: data.publishedBlogs || 0,
          totalViews: data.totalViews || 0,
          totalUsers: data.totalUsers || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }

  async function handleDelete(blogId: string) {
    if (!(await askConfirm({ title: 'Delete this blog post?', message: 'The post and all of its comments will be permanently removed. This cannot be undone.', confirmLabel: 'Delete post', tone: 'danger' }))) return;

    try {
      const response = await fetch(`/api/blog/${blogId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setBlogs(blogs.filter(blog => blog._id !== blogId));
        toast.success('Blog deleted successfully!');
      } else {
        toast.error(await errorMessage(response, 'Failed to delete blog'));
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast.error('Something went wrong while deleting blog. Please check your connection and try again.');
    }
  }

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'published' && blog.published) ||
      (filterStatus === 'draft' && !blog.published);
    return matchesSearch && matchesStatus;
  });

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!adminUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 md:p-8">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white mb-3">
          Dashboard
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Welcome back, <span className="font-semibold text-zinc-900 dark:text-white">{adminUser.name || 'Admin'}</span>! Here&apos;s your blog overview.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-zinc-900 rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 p-6 hover:border-brand-500 dark:hover:border-brand-500 transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-2">Total Blogs</p>
              <p className="text-4xl font-black text-zinc-900 dark:text-white">{stats.totalBlogs}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">{stats.publishedBlogs} published</p>
            </div>
            <div className="p-4 bg-brand-50 dark:bg-brand-900/10 rounded-xl border border-brand-200 dark:border-brand-800">
              <FileText className="h-7 w-7 text-brand-600 dark:text-brand-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-zinc-900 rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 p-6 hover:border-green-500 dark:hover:border-green-500 transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-2">Total Views</p>
              <p className="text-4xl font-black text-zinc-900 dark:text-white">{stats.totalViews.toLocaleString()}</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center gap-1 font-medium">
                <TrendingUp className="h-3 w-3" />
                All time
              </p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-200 dark:border-green-800">
              <Eye className="h-7 w-7 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-zinc-900 rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 p-6 hover:border-purple-500 dark:hover:border-purple-500 transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-2">Total Users</p>
              <p className="text-4xl font-black text-zinc-900 dark:text-white">{stats.totalUsers}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">Registered users</p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-xl border border-purple-200 dark:border-purple-800">
              <Users className="h-7 w-7 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-zinc-900 rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 p-6 hover:border-orange-500 dark:hover:border-orange-500 transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-2">Quick Access</p>
              <Link
                href="/admin/dashboard/blogs"
                className="text-brand-600 dark:text-brand-400 hover:underline font-bold text-base"
              >
                Manage Content
              </Link>
            </div>
            <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-200 dark:border-orange-800">
              <Settings className="h-7 w-7 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-10">
        {[
          { href: "/admin/dashboard/create", label: "Write a new post", hint: "Start from scratch or with AI", icon: Plus, tone: "bg-brand-600 text-white" },
          { href: "/admin/dashboard/blogs", label: "Manage posts", hint: "Edit, publish or unpublish", icon: FileText, tone: "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" },
          { href: "/admin/dashboard/comments", label: "Moderate comments", hint: "Review held or flagged comments", icon: MessageSquare, tone: "bg-fuchsia-600 text-white" },
          { href: "/admin/dashboard/analytics", label: "Analytics", hint: "Traffic, top pages and devices", icon: BarChart3, tone: "bg-emerald-600 text-white" },
          { href: "/admin/dashboard/ai-content", label: "AI studio", hint: "Drafts, summaries and SEO tips", icon: Bot, tone: "bg-cyan-600 text-white" },
          { href: "/admin/dashboard/issues", label: "Reported issues", hint: "Reader bug reports and feedback", icon: AlertCircle, tone: "bg-amber-500 text-white" },
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group card flex items-center gap-4 p-5 transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg dark:hover:border-brand-800"
          >
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${action.tone}`}>
              <action.icon className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-zinc-900 dark:text-white">{action.label}</span>
              <span className="block truncate text-sm text-zinc-500 dark:text-zinc-400">{action.hint}</span>
            </span>
            <ArrowRight className="h-4 w-4 text-zinc-400 transition-transform group-hover:translate-x-1 group-hover:text-brand-600" />
          </Link>
        ))}
      </div>

      {/* Recent Blogs */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black text-zinc-900 dark:text-white mb-2">Recent Blogs</h2>
            <p className="text-zinc-600 dark:text-zinc-400">Latest posts and their status</p>
          </div>
          <button
            onClick={() => {
              setEditingBlog(null);
              setShowEditor(true);
            }}
            className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-xl transition-colors font-bold flex items-center gap-2 shadow-lg"
          >
            <Plus className="h-5 w-5" />
            New Blog
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search blogs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-5 py-3 rounded-xl font-bold transition-all duration-300 ${
                filterStatus === 'all'
                  ? 'bg-brand-600 text-white shadow-lg'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 border-2 border-zinc-200 dark:border-zinc-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('published')}
              className={`px-5 py-3 rounded-xl font-bold transition-all duration-300 ${
                filterStatus === 'published'
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 border-2 border-zinc-200 dark:border-zinc-700'
              }`}
            >
              Published
            </button>
            <button
              onClick={() => setFilterStatus('draft')}
              className={`px-5 py-3 rounded-xl font-bold transition-all duration-300 ${
                filterStatus === 'draft'
                  ? 'bg-yellow-600 text-white shadow-lg'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 border-2 border-zinc-200 dark:border-zinc-700'
              }`}
            >
              Drafts
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="h-20 w-20 text-zinc-300 dark:text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-600 dark:text-zinc-400 text-lg mb-6 font-medium">No blogs found</p>
            <button
              onClick={() => {
                setEditingBlog(null);
                setShowEditor(true);
              }}
              className="bg-brand-600 hover:bg-brand-700 text-white px-8 py-3 rounded-xl transition-colors font-bold shadow-lg"
            >
              Create Your First Blog
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBlogs.slice(0, 5).map((blog) => (
              <motion.div
                key={blog._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-5 border-2 border-zinc-200 dark:border-zinc-700 hover:border-brand-500 dark:hover:border-brand-500 transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                        {blog.title}
                      </h3>
                      {blog.published ? (
                        <span className="px-3 py-1.5 bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-green-200 dark:border-green-800">
                          <CheckCircle className="h-3.5 w-3.5" />
                          Published
                        </span>
                      ) : (
                        <span className="px-3 py-1.5 bg-yellow-50 dark:bg-yellow-900/10 text-yellow-700 dark:text-yellow-400 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-yellow-200 dark:border-yellow-800">
                          <Clock className="h-3.5 w-3.5" />
                          Draft
                        </span>
                      )}
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-3 line-clamp-2">
                      {blog.summary || blog.content.substring(0, 150)}...
                    </p>
                    <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
                      {blog.views !== undefined && (
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{blog.views} views</span>
                        </div>
                      )}
                      {blog.createdAt && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                        </div>
                      )}
                      {blog.tags && blog.tags.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          <span>{blog.tags.length} tags</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => {
                        setEditingBlog(blog);
                        setShowEditor(true);
                      }}
                      className="p-2.5 text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-xl transition-colors border-2 border-transparent hover:border-brand-200 dark:hover:border-brand-800"
                      title="Edit"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(blog._id)}
                      className="p-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors border-2 border-transparent hover:border-red-200 dark:hover:border-red-800"
                      title="Delete"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
            {filteredBlogs.length > 5 && (
              <div className="text-center pt-6">
                <Link
                  href="/admin/dashboard/blogs"
                  className="text-brand-600 dark:text-brand-400 hover:underline font-bold text-lg"
                >
                  View All Blogs ({filteredBlogs.length})
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Blog Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border-2 border-zinc-200 dark:border-zinc-800">
            <AdminBlogEditor
              blog={editingBlog}
              onClose={() => {
                setShowEditor(false);
                setEditingBlog(null);
                fetchBlogs();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

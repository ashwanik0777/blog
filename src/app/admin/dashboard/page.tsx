"use client";
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
  Filter,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  BarChart3,
  Bot,
  MessageSquare,
  Mail,
  Settings,
  ArrowRight,
  Clock,
  Tag
} from "lucide-react";

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
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showEditor, setShowEditor] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [adminUser, setAdminUser] = useState<any>(null);
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
      } catch (error) {
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
    if (!confirm('Are you sure you want to delete this blog?')) return;

    try {
      const response = await fetch(`/api/blog/${blogId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setBlogs(blogs.filter(blog => blog._id !== blogId));
        alert('Blog deleted successfully!');
      } else {
        alert('Failed to delete blog');
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
      alert('Error deleting blog');
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!adminUser) {
    return null;
  }

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Dashboard Overview
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome back, {adminUser.name || 'Admin'}! Here's what's happening with your blog.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Blogs</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalBlogs}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stats.publishedBlogs} published</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Views</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalViews.toLocaleString()}</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                All time
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Eye className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Registered users</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Quick Actions</p>
              <Link
                href="/admin/dashboard/blogs"
                className="text-blue-600 dark:text-blue-400 hover:underline font-semibold text-sm"
              >
                Manage Blogs
              </Link>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <Settings className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Link
          href="/admin/dashboard/blogs"
          className="bg-blue-600 text-white px-6 py-4 rounded-xl hover:bg-blue-700 transition-all duration-200 font-semibold flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <FileText className="h-5 w-5" />
          <span>Manage Blogs</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/admin/dashboard/analytics"
          className="bg-green-600 text-white px-6 py-4 rounded-xl hover:bg-green-700 transition-all duration-200 font-semibold flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <BarChart3 className="h-5 w-5" />
          <span>View Analytics</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/admin/dashboard/issues"
          className="bg-red-600 text-white px-6 py-4 rounded-xl hover:bg-red-700 transition-all duration-200 font-semibold flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <MessageSquare className="h-5 w-5" />
          <span>View Issues</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Recent Blogs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Recent Blogs</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Latest blog posts and their status</p>
          </div>
          <button
            onClick={() => {
              setEditingBlog(null);
              setShowEditor(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Blog
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search blogs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('published')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'published'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Published
            </button>
            <button
              onClick={() => setFilterStatus('draft')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'draft'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Drafts
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">No blogs found</p>
            <button
              onClick={() => {
                setEditingBlog(null);
                setShowEditor(true);
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
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
                className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {blog.title}
                      </h3>
                      {blog.published ? (
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Published
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-xs font-medium flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Draft
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                      {blog.summary || blog.content.substring(0, 150)}...
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
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
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(blog._id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
            {filteredBlogs.length > 5 && (
              <div className="text-center pt-4">
                <Link
                  href="/admin/dashboard/blogs"
                  className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
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
        <AdminBlogEditor
          blog={editingBlog}
          onClose={() => {
            setShowEditor(false);
            setEditingBlog(null);
            fetchBlogs();
          }}
        />
      )}
    </div>
  );
}

"use client";
import { errorMessage, useConfirm, useToast } from "@/components/admin/AdminFeedback";
import type { AdminSessionUser } from "@/types/admin";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import AdminBlogEditor from "@/components/AdminBlogEditor";
import { 
  FileText, 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  Search, 
  Filter,
  CheckCircle,
  XCircle,
  Calendar,
  Tag
} from "lucide-react";

interface Blog {
  _id: string;
  title: string;
  slug?: string;
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

export default function BlogManagementPage() {
  const toast = useToast();
  const askConfirm = useConfirm();
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<AdminSessionUser | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showEditor, setShowEditor] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);

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
  // Check if user is admin
  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/admin-session');
        if (response.ok) {
          const data = await response.json();
          setAdminUser(data.user);
          fetchBlogs();
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

  async function handleTogglePublish(blog: Blog) {
    try {
      const response = await fetch(`/api/blog/${blog._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...blog,
          published: !blog.published,
          status: !blog.published ? 'approved' : 'draft'
        }),
      });

      if (response.ok) {
        setBlogs(blogs.map(b => 
          b._id === blog._id 
            ? { ...b, published: !b.published, status: !b.published ? 'approved' : 'draft' }
            : b
        ));
        toast.success(`Blog ${!blog.published ? 'published' : 'unpublished'} successfully!`);
      } else {
        toast.error(await errorMessage(response, 'Failed to update blog status'));
      }
    } catch (error) {
      console.error('Error updating blog:', error);
      toast.error('Something went wrong while updating blog status. Please check your connection and try again.');
    }
  }

  async function handleSaveEdit(updatedBlog: Blog) {
    try {
      const response = await fetch(`/api/blog/${updatedBlog._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedBlog),
      });

      if (response.ok) {
        setBlogs(blogs.map(b => b._id === updatedBlog._id ? updatedBlog : b));
        setShowEditor(false);
        setEditingBlog(null);
        toast.success('Blog updated successfully!');
      } else {
        toast.error(await errorMessage(response, 'Failed to update blog'));
      }
    } catch (error) {
      console.error('Error updating blog:', error);
      toast.error('Something went wrong while updating blog. Please check your connection and try again.');
    }
  }

  function handleCancelEdit() {
    setShowEditor(false);
    setEditingBlog(null);
  }

  function handleCreateNew() {
    setEditingBlog(null);
    setShowEditor(true);
  }

  async function handleCreateBlog(newBlog: Blog) {
    try {
      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBlog),
      });

      if (response.ok) {
        const createdBlog = await response.json();
        setBlogs([createdBlog, ...blogs]);
        setShowEditor(false);
        toast.success('Blog created successfully!');
      } else {
        toast.error(await errorMessage(response, 'Failed to create blog'));
      }
    } catch (error) {
      console.error('Error creating blog:', error);
      toast.error('Something went wrong while creating blog. Please check your connection and try again.');
    }
  }

  // Filter blogs
  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (blog.slug || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || blog.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!adminUser) {
    return null;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
              Blog Management
            </h1>
            <p className="text-zinc-600 dark:text-zinc-300">
              Create, edit, and manage your blog posts
            </p>
          </div>
          <button
            onClick={handleCreateNew}
            className="bg-brand-600 text-white px-6 py-3 rounded-xl hover:bg-brand-700 transition-all duration-200 font-semibold flex items-center space-x-2 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>Create New Blog</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm p-6 border border-zinc-200 dark:border-zinc-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Total Blogs</p>
              <p className="text-3xl font-bold text-zinc-900 dark:text-white">{blogs.length}</p>
            </div>
            <div className="p-3 bg-brand-100 dark:bg-brand-900/20 rounded-lg">
              <FileText className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm p-6 border border-zinc-200 dark:border-zinc-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Published</p>
              <p className="text-3xl font-bold text-green-600">{blogs.filter(b => b.published).length}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm p-6 border border-zinc-200 dark:border-zinc-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Drafts</p>
              <p className="text-3xl font-bold text-yellow-600">{blogs.filter(b => !b.published).length}</p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <XCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm p-6 border border-zinc-200 dark:border-zinc-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Total Views</p>
              <p className="text-3xl font-bold text-purple-600">{blogs.reduce((sum, blog) => sum + (blog.views || 0), 0)}</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Eye className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6 mb-6 border border-zinc-200 dark:border-zinc-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search blogs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-5 h-5" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-10 pr-8 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent appearance-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="flagged">Flagged</option>
            </select>
          </div>
        </div>
      </div>

      {/* Blogs Table */}
      <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg overflow-hidden border border-zinc-200 dark:border-zinc-700">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto"></div>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">Loading blogs...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
              <thead className="bg-zinc-50 dark:bg-zinc-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-300 uppercase tracking-wider">
                    Blog Post
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-300 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-300 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-zinc-800 divide-y divide-zinc-200 dark:divide-zinc-700">
                {filteredBlogs.map((blog) => (
                  <motion.tr
                    key={blog._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-semibold text-zinc-900 dark:text-white">
                          {blog.title}
                        </div>
                        <div className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center mt-1">
                          <Tag className="w-4 h-4 mr-1" />
                          {blog.tags.slice(0, 3).join(', ')}
                          {blog.tags.length > 3 && ` +${blog.tags.length - 3} more`}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        blog.published 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : blog.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : blog.status === 'flagged'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200'
                      }`}>
                        {blog.published ? 'Published' : blog.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-white">
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 mr-1 text-zinc-400" />
                        {blog.views || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }) : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setEditingBlog(blog);
                            setShowEditor(true);
                          }}
                          className="text-brand-600 hover:text-brand-900 dark:hover:text-brand-400 p-2 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
                          title="Edit blog"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleTogglePublish(blog)}
                          className={`p-2 rounded-lg transition-colors ${
                            blog.published 
                              ? 'text-yellow-600 hover:text-yellow-900 dark:hover:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                              : 'text-green-600 hover:text-green-900 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                          }`}
                          title={blog.published ? 'Unpublish blog' : 'Publish blog'}
                        >
                          {blog.published ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDelete(blog._id)}
                          className="text-red-600 hover:text-red-900 dark:hover:text-red-400 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Delete blog"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {filteredBlogs.length === 0 && !loading && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-zinc-400 mx-auto mb-4" />
          <p className="text-zinc-500 dark:text-zinc-400 text-lg">No blogs found</p>
          <p className="text-zinc-400 dark:text-zinc-500">Create your first blog to get started</p>
        </div>
      )}

      {/* Blog Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 bg-zinc-950/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <AdminBlogEditor
              blog={editingBlog || undefined}
              onSave={editingBlog ? handleSaveEdit : handleCreateBlog}
              onCancel={handleCancelEdit}
              mode={editingBlog ? 'edit' : 'create'}
            />
          </div>
        </div>
      )}
    </div>
  );
} 
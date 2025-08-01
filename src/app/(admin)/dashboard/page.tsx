"use client";
import { useState, useEffect } from "react";
import Editor from "@/components/Editor";
import AdminBlogTable from "@/components/AdminBlogTable";
import { useNotification } from "@/components/NotificationProvider";

const statusOptions = ["all", "published", "draft", "pending", "flagged", "rejected", "approved"];

export default function AdminDashboardPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const notify = useNotification();

  // Filter and search
  const filtered = blogs.filter(b =>
    (status === "all" || b.status === status || (status === "published" && b.published)) &&
    (b.title?.toLowerCase().includes(search.toLowerCase()) || b.slug?.toLowerCase().includes(search.toLowerCase()))
  );
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const [total, setTotal] = useState(0);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const [paginated, setPaginated] = useState<any[]>([]);

  async function fetchBlogs() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/blog?page=${page}&pageSize=${pageSize}`);
      const data = await res.json();
      setPaginated(data.blogs);
      setTotal(data.total);
      setBlogs(data.blogs);
    } catch {
      setError("Failed to load blogs");
    }
    setLoading(false);
  }

  useEffect(() => { fetchBlogs(); }, [page]);

  async function handleSave(data: any) {
    setMessage("");
    setError("");
    const method = editing ? "PUT" : "POST";
    const url = editing ? `/api/blog/${editing.slug}` : "/api/blog";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setMessage(editing ? "Blog updated!" : "Blog created!");
      setEditing(null);
      fetchBlogs();
    } else {
      const d = await res.json();
      setError(d.error || "Failed to save blog");
    }
  }

  async function handleDelete(blog: any) {
    if (!confirm(`Delete blog: ${blog.title}?`)) return;
    setError("");
    const res = await fetch(`/api/blog/${blog.slug}`, { method: "DELETE" });
    if (res.ok) {
      setMessage("Blog deleted!");
      fetchBlogs();
    } else {
      const d = await res.json();
      setError(d.error || "Failed to delete blog");
    }
  }

  async function handleBulkAction(ids: string[], action: string) {
    if (action === "delete") {
      if (!confirm(`Delete ${ids.length} blogs?`)) return;
      for (const id of ids) {
        await fetch(`/api/blog/${id}`, { method: "DELETE" });
      }
      notify.addNotification(`Deleted ${ids.length} blogs.`, "success");
      fetchBlogs();
    } else if (action === "publish") {
      for (const id of ids) {
        await fetch(`/api/blog/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ published: true, status: "approved" }),
        });
      }
      notify.addNotification(`Published ${ids.length} blogs.`, "success");
      fetchBlogs();
    }
  }

  function handleEdit(blog: any) {
    setEditing(blog);
    setMessage("");
    setError("");
  }

  function handleCreate() {
    setEditing(null);
    setMessage("");
    setError("");
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Admin Dashboard</h1>
        
        {message && (
          <div className="bg-green-100 dark:bg-green-900 border border-green-400 text-green-700 dark:text-green-200 px-4 py-3 rounded mb-4">
            {message}
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {editing ? (
          <div>
            <button 
              onClick={handleCreate} 
              className="mb-4 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center"
            >
              ← Back to list
            </button>
            <Editor initialData={editing} onSave={handleSave} />
          </div>
        ) : (
          <div>
            <div className="flex flex-col md:flex-row gap-2 mb-4 items-center">
              <button 
                onClick={handleCreate} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
              >
                + New Blog
              </button>
              <input
                type="text"
                placeholder="Search by title or slug..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded flex-1 min-w-[180px] bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded min-w-[120px] bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {statusOptions.map(opt => (
                  <option key={opt} value={opt}>
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            {loading ? (
              <div className="grid md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-gray-200 dark:bg-gray-700 animate-pulse h-40 rounded-xl" />
                ))}
              </div>
            ) : (
              <AdminBlogTable blogs={paginated} onEdit={handleEdit} onDelete={handleDelete} onBulkAction={handleBulkAction} />
            )}
            
            {totalPages > 1 && !loading && (
              <div className="flex justify-center gap-2 mt-4">
                <button
                  className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 disabled:opacity-50 transition-colors"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Prev
                </button>
                <span className="px-2 py-1 text-gray-900 dark:text-white">
                  Page {page} of {totalPages}
                </span>
                <button
                  className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 disabled:opacity-50 transition-colors"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

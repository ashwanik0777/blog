"use client";
import { useEffect, useState } from "react";

export default function AdminModerationPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState("");
  const [note, setNote] = useState<{[id:string]:string}>({});

  useEffect(() => {
    async function fetchBlogs() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/blog");
        const data = await res.json();
        setBlogs(data.filter((b: any) => b.status === 'pending' || b.status === 'flagged'));
      } catch {
        setError("Failed to load blogs");
      }
      setLoading(false);
    }
    fetchBlogs();
  }, []);

  async function moderate(blogId: string, status: string, notes?: string) {
    setSaving(blogId);
    setError("");
    try {
      await fetch(`/api/blog/${blogId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, moderationNotes: notes }),
      });
      setBlogs(blogs => blogs.filter(b => b._id !== blogId));
    } catch {
      setError("Failed to update blog");
    }
    setSaving("");
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Content Moderation</h1>
        <div className="bg-white dark:bg-gray-800 p-6 rounded shadow">
          {error && <div className="text-red-500 mb-2">{error}</div>}
          {loading ? (
            <div>Loading...</div>
          ) : blogs.length === 0 ? (
            <div className="text-gray-500">No pending or flagged blogs.</div>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left px-2 py-1">Title</th>
                  <th className="text-left px-2 py-1">Status</th>
                  <th className="text-left px-2 py-1">Flagged Reason</th>
                  <th className="text-left px-2 py-1">Notes</th>
                  <th className="text-left px-2 py-1">Actions</th>
                </tr>
              </thead>
              <tbody>
                {blogs.map(b => (
                  <tr key={b._id} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="px-2 py-1">{b.title}</td>
                    <td className="px-2 py-1">{b.status}</td>
                    <td className="px-2 py-1 text-xs text-red-600">{b.flaggedReason || '-'}</td>
                    <td className="px-2 py-1">
                      <input
                        type="text"
                        value={note[b._id] || b.moderationNotes || ''}
                        onChange={e => setNote(n => ({ ...n, [b._id]: e.target.value }))}
                        className="w-32 p-1 border rounded"
                        placeholder="Add notes"
                        disabled={saving === b._id}
                      />
                    </td>
                    <td className="px-2 py-1 flex gap-2">
                      <button
                        onClick={() => moderate(b._id, 'approved', note[b._id])}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                        disabled={saving === b._id}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => moderate(b._id, 'rejected', note[b._id])}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                        disabled={saving === b._id}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
} 
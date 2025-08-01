"use client";
import { useEffect, useState } from "react";

export default function AdminCommentModerationPage() {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState("");
  const [note, setNote] = useState<{[id:string]:string}>({});

  useEffect(() => {
    async function fetchComments() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/comments");
        const data = await res.json();
        setComments(data.comments.filter((c: any) => c.status === 'pending' || c.status === 'flagged'));
      } catch {
        setError("Failed to load comments");
      }
      setLoading(false);
    }
    fetchComments();
  }, []);

  async function moderate(commentId: string, status: string, notes?: string) {
    setSaving(commentId);
    setError("");
    try {
      await fetch(`/api/comments/${commentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, moderationNotes: notes }),
      });
      setComments(comments => comments.filter(c => c._id !== commentId));
    } catch {
      setError("Failed to update comment");
    }
    setSaving("");
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Comment Moderation</h1>
        <div className="bg-white dark:bg-gray-800 p-6 rounded shadow">
          {error && <div className="text-red-500 mb-2">{error}</div>}
          {loading ? (
            <div>Loading...</div>
          ) : comments.length === 0 ? (
            <div className="text-gray-500">No pending or flagged comments.</div>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left px-2 py-1">Blog</th>
                  <th className="text-left px-2 py-1">Author</th>
                  <th className="text-left px-2 py-1">Content</th>
                  <th className="text-left px-2 py-1">Status</th>
                  <th className="text-left px-2 py-1">Flagged Reason</th>
                  <th className="text-left px-2 py-1">Notes</th>
                  <th className="text-left px-2 py-1">Actions</th>
                </tr>
              </thead>
              <tbody>
                {comments.map(c => (
                  <tr key={c._id} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="px-2 py-1">{c.blog?.title || '-'}</td>
                    <td className="px-2 py-1">{c.author?.name || c.author?.email || '-'}</td>
                    <td className="px-2 py-1 max-w-xs truncate" title={c.content}>{c.content}</td>
                    <td className="px-2 py-1">{c.status}</td>
                    <td className="px-2 py-1 text-xs text-red-600">{c.flaggedReason || '-'}</td>
                    <td className="px-2 py-1">
                      <input
                        type="text"
                        value={note[c._id] || c.moderationNotes || ''}
                        onChange={e => setNote(n => ({ ...n, [c._id]: e.target.value }))}
                        className="w-32 p-1 border rounded"
                        placeholder="Add notes"
                        disabled={saving === c._id}
                      />
                    </td>
                    <td className="px-2 py-1 flex gap-2">
                      <button
                        onClick={() => moderate(c._id, 'approved', note[c._id])}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                        disabled={saving === c._id}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => moderate(c._id, 'rejected', note[c._id])}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                        disabled={saving === c._id}
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
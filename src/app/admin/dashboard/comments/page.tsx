"use client";
import { useConfirm, useToast } from "@/components/admin/AdminFeedback";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock, ExternalLink, Flag, Loader2, MessageSquare, Search, Trash2, XCircle } from "lucide-react";

type CommentStatus = "pending" | "approved" | "flagged" | "rejected";

interface AdminComment {
  _id: string;
  authorName: string;
  authorEmail?: string;
  content: string;
  status: CommentStatus;
  flaggedReason?: string;
  createdAt: string;
  blog?: { _id: string; title: string; slug?: string } | null;
}

const FILTERS: Array<{ value: "all" | CommentStatus; label: string }> = [
  { value: "pending", label: "Needs review" },
  { value: "flagged", label: "Flagged" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "All" },
];

const STATUS_STYLES: Record<CommentStatus, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  flagged: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200",
  approved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  rejected: "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
};

export default function CommentsModerationPage() {
  const toast = useToast();
  const askConfirm = useConfirm();
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | CommentStatus>("pending");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/comments?admin=true")
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!active) return;
        if (response.ok) setComments(data.comments || []);
        else setError(data.error || "Failed to load comments");
      })
      .catch(() => active && setError("Network error while loading comments"))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const counts = useMemo(() => {
    const result: Record<string, number> = { all: comments.length };
    for (const comment of comments) result[comment.status] = (result[comment.status] || 0) + 1;
    return result;
  }, [comments]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return comments.filter(
      (comment) =>
        (filter === "all" || comment.status === filter) &&
        (!term ||
          comment.content.toLowerCase().includes(term) ||
          comment.authorName.toLowerCase().includes(term) ||
          comment.blog?.title?.toLowerCase().includes(term))
    );
  }, [comments, filter, search]);

  async function updateStatus(comment: AdminComment, status: CommentStatus) {
    setBusyId(comment._id);
    try {
      const response = await fetch(`/api/comments/${comment._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error || "Update failed");
      setComments((current) => current.map((item) => (item._id === comment._id ? { ...item, status } : item)));
    } catch (updateError) {
      toast.error(updateError instanceof Error ? updateError.message : "Update failed");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(comment: AdminComment) {
    if (!(await askConfirm({ title: 'Delete this comment?', message: `The comment by ${comment.authorName} will be permanently removed.`, confirmLabel: 'Delete comment', tone: 'danger' }))) return;
    setBusyId(comment._id);
    try {
      const response = await fetch(`/api/comments/${comment._id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Delete failed");
      setComments((current) => current.filter((item) => item._id !== comment._id));
    } catch {
      toast.error("Failed to delete comment");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-zinc-900 sm:text-3xl dark:text-white">Comment moderation</h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          Comments are checked by AI automatically. Anything held for review or flagged shows up here.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Needs review", value: counts.pending || 0, icon: Clock, tone: "text-amber-500" },
          { label: "Flagged", value: counts.flagged || 0, icon: Flag, tone: "text-rose-500" },
          { label: "Approved", value: counts.approved || 0, icon: CheckCircle2, tone: "text-emerald-500" },
          { label: "Total", value: counts.all || 0, icon: MessageSquare, tone: "text-brand-500" },
        ].map((stat) => (
          <div key={stat.label} className="card flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{stat.label}</p>
              <p className="mt-1 text-2xl font-extrabold text-zinc-900 dark:text-white">{stat.value}</p>
            </div>
            <stat.icon className={`h-7 w-7 ${stat.tone}`} />
          </div>
        ))}
      </div>

      <div className="card mb-6 flex flex-col gap-4 p-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by text, author or post…"
            className="input pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              className={`chip ${filter === item.value ? "border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800 hover:text-white dark:border-white dark:bg-white dark:text-zinc-900" : ""}`}
            >
              {item.label} ({counts[item.value] || 0})
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
        </div>
      ) : error ? (
        <p className="card p-6 text-rose-600 dark:text-rose-400">{error}</p>
      ) : visible.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 p-12 text-center">
          <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          <p className="font-semibold text-zinc-900 dark:text-white">All clear</p>
          <p className="text-sm text-zinc-500">No comments match this filter.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {visible.map((comment) => (
            <li key={comment._id} className="card p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-semibold text-zinc-900 dark:text-white">{comment.authorName}</span>
                    {comment.authorEmail && <span className="text-zinc-500">{comment.authorEmail}</span>}
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLES[comment.status]}`}>
                      {comment.status}
                    </span>
                    <span className="text-xs text-zinc-500">{new Date(comment.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="mt-3 whitespace-pre-line break-words text-zinc-700 dark:text-zinc-300">{comment.content}</p>
                  {comment.flaggedReason && (
                    <p className="mt-2 text-xs text-zinc-500">
                      <span className="font-semibold">AI note:</span> {comment.flaggedReason}
                    </p>
                  )}
                  {comment.blog && (
                    <Link
                      href={`/blog/${comment.blog.slug || comment.blog._id}#comments-heading`}
                      target="_blank"
                      className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-300"
                    >
                      On: {comment.blog.title} <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  {comment.status !== "approved" && (
                    <button
                      type="button"
                      disabled={busyId === comment._id}
                      onClick={() => updateStatus(comment, "approved")}
                      className="btn bg-emerald-600 px-3 py-2 text-white hover:bg-emerald-700"
                    >
                      <CheckCircle2 className="h-4 w-4" /> Approve
                    </button>
                  )}
                  {comment.status !== "rejected" && (
                    <button
                      type="button"
                      disabled={busyId === comment._id}
                      onClick={() => updateStatus(comment, "rejected")}
                      className="btn-ghost px-3 py-2"
                    >
                      <XCircle className="h-4 w-4" /> {comment.status === "approved" ? "Hide" : "Reject"}
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={busyId === comment._id}
                    onClick={() => remove(comment)}
                    className="btn px-3 py-2 text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
                    aria-label="Delete comment"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { Loader2, MessageCircle, Send } from "lucide-react";
import { formatDate } from "@/lib/site";

interface Comment {
  _id: string;
  content: string;
  authorName: string;
  createdAt: string;
  status: "pending" | "approved" | "flagged" | "rejected";
}

const MAX_LENGTH = 2000;

export default function Comments({ blogId }: { blogId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    fetch(`/api/comments?blogId=${encodeURIComponent(blogId)}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (active && data) setComments(data.comments || []);
      })
      // Comments are non-critical; keep the page usable.
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [blogId]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!content.trim() || !authorName.trim()) {
      setError("Please add your name and a comment.");
      return;
    }

    setSubmitting(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blogId,
          content: content.trim(),
          authorName: authorName.trim(),
          authorEmail: authorEmail.trim() || undefined,
          website,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.error || "Failed to post comment");
        return;
      }

      setContent("");
      if (data.status === "approved") {
        setComments((current) => [data as Comment, ...current]);
        setNotice("Thanks! Your comment is live.");
      } else {
        setNotice("Thanks! Your comment will appear after a quick review.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section aria-labelledby="comments-heading">
      <h2 id="comments-heading" className="flex items-center gap-2 text-2xl font-bold text-zinc-900 dark:text-white">
        <MessageCircle className="h-6 w-6 text-brand-600" /> Discussion
        <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-sm font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
          {comments.length}
        </span>
      </h2>

      <form onSubmit={handleSubmit} className="card mt-6 space-y-4 p-5 sm:p-6" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="comment-name" className="label">
              Name *
            </label>
            <input
              id="comment-name"
              type="text"
              value={authorName}
              onChange={(event) => setAuthorName(event.target.value)}
              className="input"
              placeholder="Your name"
              maxLength={60}
              autoComplete="name"
              required
            />
          </div>
          <div>
            <label htmlFor="comment-email" className="label">
              Email <span className="font-normal text-zinc-400">(optional, never shown)</span>
            </label>
            <input
              id="comment-email"
              type="email"
              value={authorEmail}
              onChange={(event) => setAuthorEmail(event.target.value)}
              className="input"
              placeholder="you@example.com"
              maxLength={254}
              autoComplete="email"
            />
          </div>
        </div>
        <div>
          <label htmlFor="comment-content" className="label">
            Comment *
          </label>
          <textarea
            id="comment-content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Share your thoughts or ask a question…"
            className="input resize-y"
            rows={4}
            maxLength={MAX_LENGTH}
            disabled={submitting}
            required
          />
          <p className="mt-1 text-right text-xs text-zinc-400">
            {content.length}/{MAX_LENGTH}
          </p>
        </div>
        <input
          type="text"
          name="website"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p role="status" aria-live="polite" className="text-sm">
            {error && <span className="text-rose-600 dark:text-rose-400">{error}</span>}
            {notice && <span className="text-emerald-600 dark:text-emerald-400">{notice}</span>}
          </p>
          <button type="submit" disabled={submitting || !content.trim() || !authorName.trim()} className="btn-primary">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Post comment
          </button>
        </div>
      </form>

      <div className="mt-8 space-y-4">
        {loading ? (
          Array.from({ length: 2 }).map((_, index) => <div key={index} className="h-24 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-900" />)
        ) : comments.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-zinc-300 px-6 py-10 text-center text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            No comments yet — start the conversation!
          </p>
        ) : (
          comments.map((comment) => (
            <article key={comment._id} className="flex gap-4 rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/60 font-semibold text-brand-700 dark:text-brand-200">
                {comment.authorName.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="flex flex-wrap items-baseline gap-x-2">
                  <span className="font-semibold text-zinc-900 dark:text-white">{comment.authorName}</span>
                  <time dateTime={comment.createdAt} className="text-xs text-zinc-500">
                    {formatDate(comment.createdAt)}
                  </time>
                </p>
                <p className="mt-1.5 whitespace-pre-line break-words leading-7 text-zinc-700 dark:text-zinc-300">{comment.content}</p>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

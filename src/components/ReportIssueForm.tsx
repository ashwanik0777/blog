"use client";
import { useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";

const EMPTY = { name: "", email: "", subject: "", message: "" };

export default function ReportIssueForm() {
  const [form, setForm] = useState(EMPTY);
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const update = (field: keyof typeof EMPTY) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, website }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data?.error ?? "Failed to submit. Please try again.");
        return;
      }
      setSuccess(true);
      setForm(EMPTY);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5 p-6 sm:p-8">
      {success && (
        <div role="status" className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
          <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <div>
            <p className="font-semibold text-emerald-800 dark:text-emerald-200">Thanks — we got your message!</p>
            <p className="text-sm text-emerald-700 dark:text-emerald-300">We review every report and will get back to you if needed.</p>
          </div>
        </div>
      )}
      {error && (
        <div role="alert" className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900 dark:bg-rose-950/30">
          <AlertCircle className="mt-0.5 h-5 w-5 text-rose-600 dark:text-rose-400" />
          <p className="text-sm text-rose-800 dark:text-rose-200">{error}</p>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="issue-name" className="label">Your name *</label>
          <input id="issue-name" type="text" value={form.name} onChange={update("name")} className="input" placeholder="Jane Doe" maxLength={80} autoComplete="name" required />
        </div>
        <div>
          <label htmlFor="issue-email" className="label">Email address *</label>
          <input id="issue-email" type="email" value={form.email} onChange={update("email")} className="input" placeholder="jane@example.com" maxLength={254} autoComplete="email" required />
        </div>
      </div>
      <div>
        <label htmlFor="issue-subject" className="label">Subject *</label>
        <input id="issue-subject" type="text" value={form.subject} onChange={update("subject")} className="input" placeholder="Broken link in the React hooks article" maxLength={150} required />
      </div>
      <div>
        <label htmlFor="issue-message" className="label">Details *</label>
        <textarea
          id="issue-message"
          value={form.message}
          onChange={update("message")}
          rows={6}
          className="input resize-y"
          placeholder="Tell us what happened, the page link, and anything that helps us reproduce it…"
          minLength={10}
          maxLength={5000}
          required
        />
      </div>
      <input type="text" name="website" value={website} onChange={(event) => setWebsite(event.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      <button type="submit" disabled={loading} className="btn-primary w-full py-3">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {loading ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}

"use client";
import { useState } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";

export default function NewsletterForm({ variant = "default" }: { variant?: "default" | "inverted" }) {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setSuccess(data.message || "You're subscribed!");
        setEmail("");
      } else {
        setError(data.error || "Subscription failed. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inverted = variant === "inverted";

  return (
    <form onSubmit={handleSubmit} className="w-full" noValidate>
      <div
        className={`flex flex-col gap-2 rounded-2xl p-1.5 sm:flex-row ${
          inverted ? "bg-white/10 ring-1 ring-white/20 backdrop-blur" : "bg-white ring-1 ring-zinc-200 shadow-sm dark:bg-zinc-900 dark:ring-zinc-800"
        }`}
      >
        <label htmlFor={`newsletter-${variant}`} className="sr-only">
          Email address
        </label>
        <input
          id={`newsletter-${variant}`}
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          required
          maxLength={254}
          disabled={loading}
          className={`min-w-0 flex-1 rounded-xl bg-transparent px-4 py-3 text-sm focus:outline-none ${
            inverted ? "text-white placeholder-white/60" : "text-zinc-900 placeholder-zinc-400 dark:text-white"
          }`}
        />
        {/* Honeypot — hidden from humans */}
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
        <button
          type="submit"
          disabled={loading || !email}
          className={`btn shrink-0 py-3 ${
            inverted ? "bg-white text-zinc-900 hover:bg-zinc-100" : "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900"
          }`}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Subscribe <ArrowRight className="h-4 w-4" /></>}
        </button>
      </div>
      <p role="status" aria-live="polite" className="mt-3 min-h-5 text-sm">
        {success && (
          <span className={`inline-flex items-center gap-1.5 font-medium ${inverted ? "text-emerald-200" : "text-emerald-600 dark:text-emerald-400"}`}>
            <CheckCircle2 className="h-4 w-4" /> {success}
          </span>
        )}
        {error && <span className={inverted ? "text-rose-200" : "text-rose-600 dark:text-rose-400"}>{error}</span>}
      </p>
    </form>
  );
}

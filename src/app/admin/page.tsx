"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkingSession, setCheckingSession] = useState(true);
  const router = useRouter();

  // Check if already logged in
  useEffect(() => {
    async function checkSession() {
      try {
        const response = await fetch('/api/auth/admin-session');
        if (response.ok) {
          router.replace('/admin/dashboard');
        }
      } catch {
        // Session not valid, continue to login
      } finally {
        setCheckingSession(false);
      }
    }
    checkSession();
  }, [router]);

  if (checkingSession) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-600 border-t-transparent"></div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const loginResponse = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!loginResponse.ok) {
        const data = await loginResponse.json().catch(() => ({}));
        setError(data.error || "Invalid credentials or insufficient permissions");
        setLoading(false);
        return;
      }

      // Check if user is admin
      const sessionCheck = await fetch('/api/auth/admin-session');
      if (sessionCheck.ok) {
        router.push('/admin/dashboard');
        router.refresh();
      } else {
        setError("Invalid credentials or insufficient permissions");
        setLoading(false);
        return;
      }
    } catch {
      setError("An error occurred. Please try again.");
    }

    setLoading(false);
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-zinc-50 p-4 dark:bg-zinc-950">
      <div className="bg-grid pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[640px] -translate-x-1/2 rounded-full bg-gradient-to-r from-brand-400/30 via-fuchsia-400/20 to-cyan-300/30 blur-3xl dark:from-brand-700/30 dark:via-fuchsia-700/20 dark:to-cyan-700/20" />
      <div className="relative w-full max-w-md">
        <div className="card p-8 shadow-2xl shadow-zinc-900/10">
          <div className="mb-8 text-center">
            <span className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-sm">
              <Lock className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Staff sign in</h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Sign in to manage TechUpdatesZone</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="label">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="you@company.com"
                autoComplete="username"
                maxLength={254}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="Enter your password"
                autoComplete="current-password"
                maxLength={200}
                required
              />
            </div>

            {error && (
              <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 dark:border-rose-900 dark:bg-rose-950/30">
                <p className="text-sm font-medium text-rose-700 dark:text-rose-300">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
            Authorized staff only. Repeated failed attempts are temporarily blocked.
          </p>
        </div>
        <p className="mt-6 text-center text-sm">
          <Link href="/" className="font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
            ← Back to the blog
          </Link>
        </p>
      </div>
    </div>
  );
}

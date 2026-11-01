import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4">
      <div className="bg-grid pointer-events-none absolute inset-0" />
      <div className="relative max-w-lg text-center">
        <p className="font-display text-8xl font-extrabold text-accent">404</p>
        <h1 className="mt-4 text-3xl font-extrabold text-zinc-900 dark:text-white">This page wandered off</h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          The link may be broken or the article was moved. Try searching, or head back home.
        </p>
        <form action="/blog" method="get" role="search" className="mx-auto mt-8 flex max-w-sm gap-2">
          <input name="q" type="search" maxLength={100} placeholder="Search articles…" aria-label="Search articles" className="input" />
          <button type="submit" className="btn-primary" aria-label="Search">
            <Search className="h-4 w-4" />
          </button>
        </form>
        <Link href="/" className="btn-ghost mt-6">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
      </div>
    </main>
  );
}

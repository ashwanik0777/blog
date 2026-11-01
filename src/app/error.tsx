"use client";
import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[70dvh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">Something went wrong</h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          We hit an unexpected error while loading this page. Please try again in a moment.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <button type="button" onClick={reset} className="btn-primary">
            <RefreshCw className="h-4 w-4" /> Try again
          </button>
          <Link href="/" className="btn-ghost">
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}

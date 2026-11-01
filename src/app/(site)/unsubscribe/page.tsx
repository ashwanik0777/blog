import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, MailX, XCircle } from "lucide-react";
import { verifyUnsubscribeToken } from "@/lib/email";
import { normalizeEmail } from "@/lib/security";

export const metadata: Metadata = {
  title: "Unsubscribe",
  robots: { index: false, follow: false },
};

type UnsubscribePageProps = { searchParams: Promise<{ email?: string; token?: string; done?: string }> };

export default async function UnsubscribePage({ searchParams }: UnsubscribePageProps) {
  const { email = "", token = "", done } = await searchParams;
  const normalized = normalizeEmail(email);
  const valid = Boolean(normalized && token && verifyUnsubscribeToken(normalized, token.slice(0, 100)));

  return (
    <div className="container-page flex max-w-xl flex-col items-center py-24 text-center">
      {done ? (
        <>
          <CheckCircle2 className="h-14 w-14 text-emerald-500" />
          <h1 className="mt-6 text-3xl font-extrabold text-zinc-900 dark:text-white">You&apos;re unsubscribed</h1>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400">You won&apos;t receive any more newsletter emails. Sorry to see you go!</p>
          <Link href="/" className="btn-primary mt-8">
            Back to the blog
          </Link>
        </>
      ) : valid ? (
        <>
          <MailX className="h-14 w-14 text-brand-500" />
          <h1 className="mt-6 text-3xl font-extrabold text-zinc-900 dark:text-white">Unsubscribe from the newsletter?</h1>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400">
            <span className="font-semibold text-zinc-900 dark:text-white">{normalized}</span> will stop receiving our weekly emails.
          </p>
          <form action="/api/newsletter/unsubscribe" method="post" className="mt-8">
            <input type="hidden" name="email" value={normalized} />
            <input type="hidden" name="token" value={token.slice(0, 100)} />
            <button type="submit" className="btn-primary px-8 py-3">
              Yes, unsubscribe me
            </button>
          </form>
        </>
      ) : (
        <>
          <XCircle className="h-14 w-14 text-rose-500" />
          <h1 className="mt-6 text-3xl font-extrabold text-zinc-900 dark:text-white">This link is invalid</h1>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400">Please use the unsubscribe link from the latest email you received.</p>
        </>
      )}
    </div>
  );
}

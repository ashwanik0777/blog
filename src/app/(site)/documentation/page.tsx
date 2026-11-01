import type { Metadata } from "next";
import Link from "next/link";
import { Bell, Bot, Compass, MessageSquare, Moon, PenLine, Rss, Search, ShieldCheck } from "lucide-react";
import PageHero from "@/components/PageHero";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Reader guide",
  description: `How to get the most out of ${SITE_NAME}: search, topics, newsletter, RSS, the AI assistant and our editorial standards.`,
  alternates: { canonical: "/documentation" },
};

const GUIDES = [
  {
    icon: Search,
    title: "Find what you need",
    description: "Use the search bar in the header or on the Articles page. Results update instantly as you type and match titles, summaries and topics.",
  },
  {
    icon: Compass,
    title: "Browse by topic",
    description: "Every article is tagged. Open the Topics page to explore a subject end-to-end, from fundamentals to the latest releases.",
  },
  {
    icon: Bell,
    title: "Get the weekly digest",
    description: "Subscribe to the newsletter at the bottom of any page. One email a week, no spam, unsubscribe in a click.",
  },
  {
    icon: Rss,
    title: "Follow via RSS",
    description: "Prefer a feed reader? Add /feed.xml to Feedly, Inoreader or any RSS app to get new posts the moment they go live.",
  },
  {
    icon: Bot,
    title: "Ask the AI assistant",
    description: "Stuck on a concept? Tap the chat bubble to ask our assistant for a quick explanation, example or next step.",
  },
  {
    icon: Moon,
    title: "Read comfortably",
    description: "Switch between light and dark mode, jump around long posts with the table of contents and copy code blocks in one click.",
  },
];

const STANDARDS = [
  { icon: PenLine, title: "Written for practitioners", text: "Articles focus on real problems, working code and trade-offs — not buzzwords." },
  { icon: ShieldCheck, title: "Reviewed before publishing", text: "AI tools may help with drafts and summaries, but every post is reviewed by an editor before it goes live." },
  { icon: MessageSquare, title: "Corrections welcome", text: "Spotted a mistake or outdated detail? Tell us and we will update the article and note the fix." },
];

export default function DocumentationPage() {
  return (
    <>
      <PageHero
        eyebrow="Reader guide"
        title={
          <>
            Get the most out of <span className="text-accent">{SITE_NAME}</span>
          </>
        }
        description="A quick tour of the features that help you learn faster — and the standards we follow when we write."
      >
        <Link href="/blog" className="btn-primary">
          Start reading
        </Link>
        <Link href="/help-center" className="btn-ghost">
          Visit help center
        </Link>
      </PageHero>

      <section className="container-page py-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {GUIDES.map((guide) => (
            <div key={guide.title} className="card p-6 transition hover:-translate-y-1 hover:shadow-lg">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
                <guide.icon className="h-5 w-5" />
              </span>
              <h2 className="mt-5 text-lg font-bold text-zinc-900 dark:text-white">{guide.title}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{guide.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page">
        <div className="grid gap-8 rounded-3xl border border-zinc-200 bg-zinc-50/70 p-8 sm:p-12 lg:grid-cols-[0.9fr_1.1fr] dark:border-zinc-800 dark:bg-zinc-900/40">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">Editorial standards</p>
            <h2 className="mt-3 text-3xl font-extrabold text-zinc-900 dark:text-white">How we write</h2>
            <p className="mt-4 text-zinc-600 dark:text-zinc-400">
              Trust matters. These are the principles behind every article we publish.
            </p>
            <Link href="/report-issue" className="btn-brand mt-6">
              Suggest a correction
            </Link>
          </div>
          <ul className="space-y-5">
            {STANDARDS.map((item) => (
              <li key={item.title} className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                  <item.icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-bold text-zinc-900 dark:text-white">{item.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{item.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

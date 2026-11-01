import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown, LifeBuoy, Mail } from "lucide-react";
import JsonLd from "@/components/JsonLd";
import PageHero from "@/components/PageHero";
import { SITE_NAME, SUPPORT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Help center",
  description: `Answers to common questions about ${SITE_NAME}: newsletter, comments, RSS, privacy and how to contact us.`,
  alternates: { canonical: "/help-center" },
};

const FAQS = [
  {
    question: "How do I subscribe to the newsletter?",
    answer: "Enter your email in the newsletter box at the bottom of any page and press Subscribe. You will receive one digest a week and can unsubscribe at any time.",
  },
  {
    question: "Why doesn't my comment appear right away?",
    answer: "Comments are checked automatically for spam and abuse. Most appear instantly; some are held for a quick manual review before they are published.",
  },
  {
    question: "Can I follow new articles without email?",
    answer: "Yes. Add our RSS feed (/feed.xml) to any feed reader such as Feedly or Inoreader to get new posts as soon as they are published.",
  },
  {
    question: "Is the AI assistant always accurate?",
    answer: "The assistant is great for quick explanations, but it can make mistakes. Double-check important details against the articles and official documentation.",
  },
  {
    question: "What data do you collect?",
    answer: "We collect basic, anonymous-style analytics (pages viewed, device and browser type) and anything you choose to submit, like comments or your newsletter email. See the privacy policy for details.",
  },
  {
    question: "I found an error in an article. How do I report it?",
    answer: "Use the contact form on the Report an Issue page. Include the article link and what needs fixing — we review every report.",
  },
  {
    question: "Can I republish your articles?",
    answer: "Please link back to the original article instead of copying it. For partnerships or syndication, contact us first.",
  },
];

export default function HelpCenterPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <PageHero
        eyebrow="Help center"
        title={
          <>
            How can we <span className="text-accent">help?</span>
          </>
        }
        description="Quick answers to the questions readers ask most. Can't find yours? We're one message away."
      />

      <section className="container-page max-w-3xl py-16">
        <div className="space-y-3">
          {FAQS.map((faq) => (
            <details key={faq.question} className="group card overflow-hidden open:shadow-md">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 font-semibold text-zinc-900 dark:text-white [&::-webkit-details-marker]:hidden">
                {faq.question}
                <ChevronDown className="h-5 w-5 shrink-0 text-zinc-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="px-6 pb-6 leading-7 text-zinc-600 dark:text-zinc-400">{faq.answer}</p>
            </details>
          ))}
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          <Link href="/report-issue" className="card flex items-center gap-4 p-6 transition hover:-translate-y-1 hover:shadow-lg">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white">
              <LifeBuoy className="h-5 w-5" />
            </span>
            <span>
              <span className="block font-bold text-zinc-900 dark:text-white">Report an issue</span>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">Bugs, corrections or feedback</span>
            </span>
          </Link>
          <a href={`mailto:${SUPPORT_EMAIL}`} className="card flex items-center gap-4 p-6 transition hover:-translate-y-1 hover:shadow-lg">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
              <Mail className="h-5 w-5" />
            </span>
            <span>
              <span className="block font-bold text-zinc-900 dark:text-white">Email us</span>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">{SUPPORT_EMAIL}</span>
            </span>
          </a>
        </div>
      </section>
    </>
  );
}

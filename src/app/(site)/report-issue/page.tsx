import type { Metadata } from "next";
import { Bug, Lightbulb, PenLine } from "lucide-react";
import PageHero from "@/components/PageHero";
import ReportIssueForm from "@/components/ReportIssueForm";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact & report an issue",
  description: `Found a bug, a mistake in an article or have an idea? Contact the ${SITE_NAME} team.`,
  alternates: { canonical: "/report-issue" },
};

const REASONS = [
  { icon: Bug, title: "Something broken?", text: "Tell us about bugs, broken links or pages that don't load." },
  { icon: PenLine, title: "Spotted a mistake?", text: "Corrections help everyone — we update articles quickly." },
  { icon: Lightbulb, title: "Have an idea?", text: "Suggest topics you'd like us to cover next." },
];

export default function ReportIssuePage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={
          <>
            We&apos;d love to <span className="text-accent">hear from you</span>
          </>
        }
        description="Questions, corrections, bug reports or topic ideas — send us a message and the team will take a look."
      />
      <section className="container-page grid max-w-5xl gap-10 py-16 lg:grid-cols-[0.8fr_1.2fr]">
        <ul className="space-y-6">
          {REASONS.map((reason) => (
            <li key={reason.title} className="flex gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                <reason.icon className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-bold text-zinc-900 dark:text-white">{reason.title}</h2>
                <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{reason.text}</p>
              </div>
            </li>
          ))}
        </ul>
        <ReportIssueForm />
      </section>
    </>
  );
}

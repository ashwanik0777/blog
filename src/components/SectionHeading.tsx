import Link from "next/link";
import { ArrowRight } from "lucide-react";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
};

export default function SectionHeading({ eyebrow, title, description, href, linkLabel = "View all" }: SectionHeadingProps) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div className="max-w-2xl">
        {eyebrow && <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">{eyebrow}</p>}
        <h2 className="text-3xl font-extrabold text-zinc-900 sm:text-4xl dark:text-white">{title}</h2>
        {description && <p className="mt-3 text-zinc-600 dark:text-zinc-400">{description}</p>}
      </div>
      {href && (
        <Link href={href} className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-zinc-900 hover:text-brand-600 dark:text-white dark:hover:text-brand-300">
          {linkLabel}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}

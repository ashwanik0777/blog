import Link from "next/link";
import { Github, Twitter, Linkedin, Facebook, Instagram, Youtube, Mail, Rss, Eye, Users } from "lucide-react";
import { unstable_cache } from "next/cache";
import dbConnect from "@/lib/mongodb";
import Settings from "@/models/Settings";
import Visitor from "@/models/Visitor";
import Logo from "@/components/Logo";
import NewsletterForm from "@/components/NewsletterForm";
import { SITE_NAME, SUPPORT_EMAIL } from "@/lib/site";

type Credit = { name?: string; portfolioUrl?: string };
type FooterSettings = { socialMedia?: Record<string, string>; designBy?: Credit; developedBy?: Credit };

const getVisitorStats = unstable_cache(
  async () => {
    try {
      await dbConnect();
      const [totalPageViews, [unique]] = await Promise.all([
        Visitor.estimatedDocumentCount(),
        Visitor.aggregate([{ $group: { _id: "$ip" } }, { $count: "total" }]),
      ]);
      return { uniqueVisitors: unique?.total || 0, totalPageViews };
    } catch (error) {
      console.error("Footer stats error:", error);
      return { uniqueVisitors: 0, totalPageViews: 0 };
    }
  },
  ["visitor-stats-v2"],
  { revalidate: 600 }
);

const getFooterSettings = unstable_cache(
  async (): Promise<FooterSettings> => {
    try {
      await dbConnect();
      const settings = await Settings.findOne().select("socialMedia designBy developedBy").lean<FooterSettings>();
      return JSON.parse(JSON.stringify(settings || {}));
    } catch {
      return {};
    }
  },
  ["footer-settings"],
  { revalidate: 300 }
);

const SOCIAL_ICONS = { twitter: Twitter, facebook: Facebook, linkedin: Linkedin, github: Github, instagram: Instagram, youtube: Youtube };

const COLUMNS = [
  {
    title: "Explore",
    links: [
      { href: "/blog", label: "All articles" },
      { href: "/topics", label: "Topics" },
      { href: "/feed.xml", label: "RSS feed" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/documentation", label: "Guides" },
      { href: "/help-center", label: "Help center" },
      { href: "/report-issue", label: "Contact & feedback" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy-policy", label: "Privacy policy" },
      { href: "/terms-of-service", label: "Terms of service" },
    ],
  },
];

function isSafeUrl(url?: string) {
  return typeof url === "string" && /^https?:\/\//i.test(url);
}

export default async function Footer() {
  const [stats, settings] = await Promise.all([getVisitorStats(), getFooterSettings()]);
  const socialLinks = Object.entries(SOCIAL_ICONS)
    .map(([key, Icon]) => ({ key, Icon, url: settings.socialMedia?.[key] }))
    .filter((link) => isSafeUrl(link.url));
  const credit = settings.designBy?.name ? settings.designBy : settings.developedBy;

  return (
    <footer className="mt-24 border-t border-zinc-200 bg-zinc-50/60 dark:border-zinc-800 dark:bg-zinc-950">
      <section id="newsletter" className="container-page scroll-mt-24 py-16">
        <div className="relative overflow-hidden rounded-3xl bg-zinc-900 px-6 py-12 text-white shadow-2xl sm:px-12 dark:bg-zinc-900 dark:ring-1 dark:ring-zinc-800">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-brand-600/40 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-10 h-64 w-64 rounded-full bg-fuchsia-600/30 blur-3xl" />
          <div className="relative grid items-center gap-8 lg:grid-cols-2">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-brand-300">Newsletter</p>
              <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl">Get the best of tech, once a week.</h2>
              <p className="mt-3 max-w-md text-zinc-300">
                Hand-picked tutorials, tooling tips and AI updates. No spam — unsubscribe any time.
              </p>
            </div>
            <NewsletterForm variant="inverted" />
          </div>
        </div>
      </section>

      <div className="container-page grid gap-12 border-t border-zinc-200 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)] dark:border-zinc-800">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            Practical tech news, programming tutorials and developer insights — written to help you build better software.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {socialLinks.map(({ key, Icon, url }) => (
              <a
                key={key}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${SITE_NAME} on ${key}`}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 transition hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-brand-300"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
            <a
              href="/feed.xml"
              aria-label="RSS feed"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 transition hover:-translate-y-0.5 hover:border-orange-300 hover:text-orange-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
            >
              <Rss className="h-4 w-4" />
            </a>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              aria-label="Email us"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 transition hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
            >
              <Mail className="h-4 w-4" />
            </a>
          </div>
        </div>

        {COLUMNS.map((column) => (
          <div key={column.title}>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">{column.title}</h3>
            <ul className="mt-4 space-y-3">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-zinc-600 transition-colors hover:text-brand-600 dark:text-zinc-400 dark:hover:text-brand-300">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-zinc-200 dark:border-zinc-800">
        <div className="container-page flex flex-col items-center justify-between gap-4 py-6 text-sm text-zinc-500 md:flex-row dark:text-zinc-400">
          <p>&copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" /> {stats.uniqueVisitors.toLocaleString("en-US")} readers
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5" /> {stats.totalPageViews.toLocaleString("en-US")} page views
            </span>
            {credit?.name && (
              <span>
                Crafted by{" "}
                {isSafeUrl(credit.portfolioUrl) ? (
                  <a href={credit.portfolioUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-zinc-700 hover:text-brand-600 dark:text-zinc-200">
                    {credit.name}
                  </a>
                ) : (
                  <span className="font-semibold text-zinc-700 dark:text-zinc-200">{credit.name}</span>
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}

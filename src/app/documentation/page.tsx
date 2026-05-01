import Link from "next/link";
import Footer from "@/components/Footer";
import { BookOpen, Compass, Wrench, ShieldCheck, Sparkles, BarChart3, Layout, LifeBuoy } from "lucide-react";
import { Playfair_Display, Manrope } from "next/font/google";

const headingFont = Playfair_Display({ subsets: ["latin"], weight: ["600", "700", "800"] });
const bodyFont = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

const sections = [
  {
    title: "Getting Started",
    description: "Understand how the blog works, from navigation to content discovery.",
    points: [
      "Explore categories and tags from the blog index.",
      "Each blog page includes reading time, author info, and related posts.",
      "Use the search and filters to quickly reach relevant topics.",
    ],
    icon: Compass,
  },
  {
    title: "Content Workflow",
    description: "Create, review, and publish high-quality tech posts.",
    points: [
      "Draft new content in the editor with headings, images, and code blocks.",
      "Use summaries and excerpts to improve SEO previews.",
      "Publish only after a final check for accuracy and formatting.",
    ],
    icon: Layout,
  },
  {
    title: "AI Assist Tools",
    description: "Use built-in AI utilities to speed up writing and optimization.",
    points: [
      "Generate blog drafts, summaries, and alternate titles.",
      "Improve SEO using the optimize and suggest tags features.",
      "Moderate content with AI safety checks before publishing.",
    ],
    icon: Sparkles,
  },
  {
    title: "Security & Roles",
    description: "Control access with clear roles and permissions.",
    points: [
      "Admin manages site settings, users, and approvals.",
      "Editors handle drafts and updates.",
      "Readers access content without an account.",
    ],
    icon: ShieldCheck,
  },
  {
    title: "Analytics & Growth",
    description: "Track performance and improve engagement.",
    points: [
      "Monitor views, visitor trends, and popular content.",
      "Use reading time and tags to refine content strategy.",
      "Spot top-performing categories and expand them.",
    ],
    icon: BarChart3,
  },
  {
    title: "Support & Maintenance",
    description: "Keep the platform healthy with ongoing checks.",
    points: [
      "Report issues directly from the footer link.",
      "Check API health during traffic spikes.",
      "Keep SEO, sitemap, and robots files up to date.",
    ],
    icon: LifeBuoy,
  },
];

const structure = [
  { label: "Blog Index", detail: "All posts with filters, categories, and latest updates." },
  { label: "Blog Detail", detail: "Full article, share tools, comments, and related posts." },
  { label: "Admin Dashboard", detail: "Create posts, manage users, monitor analytics." },
  { label: "Newsletter", detail: "Email subscribers, newsletters, and campaign insights." },
  { label: "Support", detail: "Help center, documentation, and issue reporting." },
];

export default function DocumentationPage() {
  return (
    <div className={`${bodyFont.className} min-h-screen bg-[#f8f5ef] text-gray-900`}>
      <div className="relative overflow-hidden">
        <div className="absolute -top-32 -right-24 h-80 w-80 rounded-full bg-gradient-to-br from-amber-200 to-orange-400 blur-3xl opacity-70" />
        <div className="absolute top-20 -left-32 h-72 w-72 rounded-full bg-gradient-to-br from-teal-200 to-emerald-400 blur-3xl opacity-70" />

        <header className="relative z-10 px-6 pt-12 pb-16 max-w-6xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900">
            <BookOpen className="w-4 h-4" />
            TechUpdatesZone Docs
          </Link>
          <h1 className={`${headingFont.className} mt-6 text-4xl md:text-6xl font-extrabold leading-tight`}>
            Documentation that explains every part of the platform.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-gray-700">
            This guide is your complete reference for how the blog works, how content is published, and how the platform stays fast and reliable.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/blog" className="inline-flex items-center justify-center rounded-full bg-gray-900 text-white px-6 py-2.5 text-sm font-semibold hover:bg-black">
              Explore Blogs
            </Link>
            <Link href="/help-center" className="inline-flex items-center justify-center rounded-full border border-gray-900 px-6 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-900 hover:text-white">
              Visit Help Center
            </Link>
          </div>
        </header>
      </div>

      <main className="max-w-6xl mx-auto px-6 pb-16">
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.title} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-lg transition">
                <div className="h-12 w-12 rounded-2xl bg-gray-900 text-white flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-gray-900">{section.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{section.description}</p>
                <ul className="mt-4 space-y-2 text-sm text-gray-700">
                  {section.points.map((point) => (
                    <li key={point} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </section>

        <section className="mt-16 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className={`${headingFont.className} text-3xl font-bold`}>Platform Structure</h2>
          <p className="mt-3 text-gray-600">
            The platform is divided into clear areas so editors and admins always know where to go.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {structure.map((item) => (
              <div key={item.label} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <h4 className="text-sm font-semibold text-gray-900">{item.label}</h4>
                <p className="mt-2 text-sm text-gray-600">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-gray-200 bg-gradient-to-br from-gray-900 to-gray-800 p-8 text-white">
            <h2 className={`${headingFont.className} text-3xl font-bold`}>Best Practices</h2>
            <p className="mt-4 text-sm text-gray-200">
              Keep every post helpful, accurate, and easy to scan. These habits maintain trust and engagement.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-gray-200">
              <li>Use short sections with meaningful headings.</li>
              <li>Provide real-world examples and clean code blocks.</li>
              <li>Include strong summaries and clear takeaways.</li>
              <li>Confirm facts before publishing.</li>
            </ul>
          </div>
          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900">Need direct support?</h3>
            <p className="mt-3 text-sm text-gray-600">
              Use the Help Center for step-by-step fixes or report a new issue.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Link href="/help-center" className="inline-flex items-center justify-center rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-amber-400">
                Go to Help Center
              </Link>
              <Link href="/report-issue" className="inline-flex items-center justify-center rounded-full border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-100">
                Report an Issue
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

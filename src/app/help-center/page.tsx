import Link from "next/link";
import Footer from "@/components/Footer";
import { Headphones, Search, ChevronRight, LifeBuoy, ShieldCheck, Mail, MessageSquare, FileQuestion, Sparkles, Wrench } from "lucide-react";
import { Space_Grotesk, Manrope } from "next/font/google";

const headingFont = Space_Grotesk({ subsets: ["latin"], weight: ["500", "600", "700"] });
const bodyFont = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

const categories = [
  {
    title: "Account & Access",
    description: "Login, roles, and permissions.",
    icon: ShieldCheck,
  },
  {
    title: "Content Publishing",
    description: "Drafts, approvals, and updates.",
    icon: Sparkles,
  },
  {
    title: "Technical Fixes",
    description: "Errors, performance, and API issues.",
    icon: Wrench,
  },
  {
    title: "Contact Support",
    description: "Reach the team with a detailed issue.",
    icon: LifeBuoy,
  },
];

const faqs = [
  {
    question: "How do I publish a new blog post?",
    answer: "Create a draft, add summary, tags, and featured image. Review the preview, then publish from the admin dashboard.",
  },
  {
    question: "Why is my post not visible on the blog page?",
    answer: "Make sure the post is marked as published and approved. Also confirm the category and tags are set correctly.",
  },
  {
    question: "How do I enable comments?",
    answer: "Open the post settings and enable comments. Save changes, then check the post page.",
  },
  {
    question: "How can I report a technical issue?",
    answer: "Use the Report Issue page and include steps to reproduce, screenshots, and any error message details.",
  },
];

export default function HelpCenterPage() {
  return (
    <div className={`${bodyFont.className} min-h-screen bg-[#f4f7fb] text-gray-900`}>
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_55%)]" />
        <header className="relative z-10 max-w-6xl mx-auto px-6 pt-12 pb-16">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900">
            <Headphones className="w-4 h-4" />
            Help Center
          </Link>
          <h1 className={`${headingFont.className} mt-6 text-4xl md:text-6xl font-bold text-gray-900`}>
            Need help? We have answers.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-gray-600">
            Browse guides, solve common issues, or contact support for fast assistance.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 flex items-center gap-3 rounded-full border border-gray-200 bg-white px-5 py-3 shadow-sm">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                className="w-full text-sm text-gray-700 outline-none placeholder:text-gray-400"
                placeholder="Search guides, errors, or features"
                aria-label="Search Help Center"
              />
            </div>
            <Link href="/documentation" className="inline-flex items-center justify-center rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-black">
              Read Documentation
            </Link>
          </div>
        </header>
      </div>

      <main className="max-w-6xl mx-auto px-6 pb-16">
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <div key={category.title} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition">
                <div className="h-11 w-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{category.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{category.description}</p>
                <button className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700">
                  View guides <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </section>

        <section className="mt-16 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <h2 className={`${headingFont.className} text-3xl font-bold text-gray-900`}>Popular Questions</h2>
            <div className="mt-6 space-y-4">
              {faqs.map((item) => (
                <details key={item.question} className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                  <summary className="cursor-pointer text-sm font-semibold text-gray-900">
                    {item.question}
                  </summary>
                  <p className="mt-3 text-sm text-gray-600">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-gradient-to-br from-blue-600 to-sky-500 p-8 text-white">
            <h3 className={`${headingFont.className} text-2xl font-bold`}>Still stuck?</h3>
            <p className="mt-3 text-sm text-blue-50">
              Share the issue details and we will respond with clear steps to fix it.
            </p>
            <div className="mt-6 space-y-3">
              <Link href="/report-issue" className="inline-flex items-center justify-center gap-2 rounded-full bg-white text-blue-700 px-5 py-2.5 text-sm font-semibold hover:bg-blue-50">
                <MessageSquare className="w-4 h-4" />
                Report an Issue
              </Link>
              <a href="mailto:support@techupdateszone.com" className="inline-flex items-center justify-center gap-2 rounded-full border border-blue-200 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500">
                <Mail className="w-4 h-4" />
                Email Support
              </a>
              <Link href="/documentation" className="inline-flex items-center justify-center gap-2 rounded-full border border-blue-200 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500">
                <FileQuestion className="w-4 h-4" />
                Documentation
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

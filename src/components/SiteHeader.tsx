"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Search, X } from "lucide-react";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Articles" },
  { href: "/topics", label: "Topics" },
  { href: "/documentation", label: "Guides" },
  { href: "/help-center", label: "Help" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu after navigating.
  const [menuPath, setMenuPath] = useState(pathname);
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname?.startsWith(href));

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    const term = query.trim();
    router.push(term ? `/blog?q=${encodeURIComponent(term)}` : "/blog");
    setQuery("");
    setMenuOpen(false);
  }

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        scrolled || menuOpen
          ? "border-b border-zinc-200/80 bg-white/80 shadow-sm backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/80"
          : "border-b border-transparent bg-white/0 dark:bg-zinc-950/0"
      }`}
    >
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800/80 dark:text-white"
                  : "text-zinc-600 hover:bg-zinc-100/70 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <form onSubmit={submitSearch} role="search" className="relative hidden md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search articles…"
              aria-label="Search articles"
              maxLength={100}
              className="h-10 w-44 rounded-xl border border-zinc-200 bg-zinc-50/80 pl-9 pr-3 text-sm text-zinc-900 placeholder-zinc-400 transition-all focus:w-60 focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-500/15 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-white dark:focus:border-brand-600"
            />
          </form>
          <ThemeToggle />
          <a href="#newsletter" className="btn-brand hidden px-4 sm:inline-flex">
            Subscribe
          </a>
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 text-zinc-700 lg:hidden dark:border-zinc-800 dark:text-zinc-200"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div id="mobile-menu" className="h-[calc(100dvh-4rem)] overflow-y-auto border-t border-zinc-200 bg-white px-4 pb-10 pt-4 lg:hidden dark:border-zinc-800 dark:bg-zinc-950">
          <form onSubmit={submitSearch} role="search" className="relative mb-4">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search articles…"
              aria-label="Search articles"
              maxLength={100}
              className="input pl-10"
            />
          </form>
          <nav aria-label="Mobile" className="grid gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-xl px-4 py-3 text-base font-semibold ${
                  isActive(link.href)
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300"
                    : "text-zinc-800 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/report-issue" className="rounded-xl px-4 py-3 text-base font-semibold text-zinc-800 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900">
              Contact
            </Link>
          </nav>
          <a href="#newsletter" onClick={() => setMenuOpen(false)} className="btn-brand mt-6 w-full py-3">
            Subscribe to the newsletter
          </a>
        </div>
      )}
    </header>
  );
}

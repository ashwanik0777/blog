"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  AlertCircle,
  ChevronsLeft,
  ChevronsRight,
  ExternalLink,
  FileText,
  FlaskConical,
  LayoutDashboard,
  LineChart,
  LogOut,
  Menu,
  MessageSquare,
  Newspaper,
  Settings,
  Users,
  X,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { AdminFeedbackProvider } from "@/components/admin/AdminFeedback";

interface MenuItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  requiredPermission?: string;
}

const MENU_ITEMS: MenuItem[] = [
  { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/dashboard/blogs", label: "Blog posts", icon: FileText, requiredPermission: "manage_blogs" },
  { href: "/admin/dashboard/comments", label: "Comments", icon: MessageSquare, requiredPermission: "manage_blogs" },
  { href: "/admin/dashboard/analytics", label: "Analytics", icon: LineChart, requiredPermission: "view_analytics" },
  { href: "/admin/dashboard/newsletter", label: "Newsletter", icon: Newspaper, requiredPermission: "manage_newsletter" },
  { href: "/admin/dashboard/ai-content", label: "AI studio", icon: FlaskConical, requiredPermission: "ai_content_generation" },
  { href: "/admin/dashboard/users", label: "Staff", icon: Users, requiredPermission: "manage_users" },
  { href: "/admin/dashboard/issues", label: "Reported issues", icon: AlertCircle, requiredPermission: "manage_issues" },
  { href: "/admin/dashboard/settings", label: "Settings", icon: Settings, requiredPermission: "manage_settings" },
];

const ROLE_LABELS = { admin: "Administrator", "sub-admin": "Sub admin", editor: "Editor" } as const;

type StaffInfo = {
  name: string;
  role: keyof typeof ROLE_LABELS;
  permissions: string[];
};

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  return href === "/admin/dashboard" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [staff, setStaff] = useState<StaffInfo | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/admin-session")
      .then(async (response) => {
        if (!response.ok) throw new Error("No session");
        const data = await response.json();
        if (!active) return;
        setStaff({
          name: data.user?.name || "Staff",
          role: data.user?.role || "editor",
          permissions: data.user?.permissions || [],
        });
      })
      .catch(() => router.replace("/admin"));
    return () => {
      active = false;
    };
  }, [router]);

  // Close the mobile drawer after navigating.
  const [drawerPath, setDrawerPath] = useState(pathname);
  if (drawerPath !== pathname) {
    setDrawerPath(pathname);
    setMobileOpen(false);
  }

  const hasPermission = (permission?: string) =>
    !permission || staff?.role === "admin" || Boolean(staff?.permissions.includes(permission));

  const current = [...MENU_ITEMS].reverse().find((item) => isActive(pathname, item.href));
  const forbidden = Boolean(staff && current?.requiredPermission && !hasPermission(current.requiredPermission));

  useEffect(() => {
    if (forbidden) router.replace("/admin/dashboard");
  }, [forbidden, router]);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      try {
        localStorage.clear();
      } catch {
        // Storage may be unavailable.
      }
      router.replace("/admin");
    }
  }

  if (!staff) {
    return (
      <div className="flex h-dvh items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  const nav = (
    <nav aria-label="Dashboard" className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
      {MENU_ITEMS.filter((item) => hasPermission(item.requiredPermission)).map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            title={collapsed ? item.label : undefined}
            aria-current={active ? "page" : undefined}
            className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-zinc-900 text-white shadow-sm dark:bg-white dark:text-zinc-900"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/70 dark:hover:text-white"
            } ${collapsed ? "lg:justify-center lg:px-0" : ""}`}
          >
            <item.icon className={`h-[18px] w-[18px] shrink-0 ${active ? "" : "text-zinc-400 group-hover:text-brand-600 dark:group-hover:text-brand-300"}`} />
            <span className={collapsed ? "lg:sr-only" : ""}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <AdminFeedbackProvider>
      <div className="flex h-dvh bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        {mobileOpen && (
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-40 bg-zinc-950/50 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-zinc-200 bg-white transition-all duration-300 lg:static lg:translate-x-0 dark:border-zinc-800 dark:bg-zinc-900 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          } ${collapsed ? "lg:w-[76px]" : "lg:w-64"}`}
        >
          <div className={`flex h-16 items-center border-b border-zinc-200 px-4 dark:border-zinc-800 ${collapsed ? "lg:justify-center" : "justify-between"}`}>
            <Link href="/admin/dashboard" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-zinc-200 dark:ring-zinc-700">
                <Image src="/logo.png" alt="" width={36} height={36} />
              </span>
              <span className={`font-display text-base font-extrabold ${collapsed ? "lg:hidden" : ""}`}>
                Admin<span className="text-accent">Panel</span>
              </span>
            </Link>
            <button type="button" onClick={() => setMobileOpen(false)} className="rounded-lg p-2 text-zinc-500 lg:hidden" aria-label="Close menu">
              <X className="h-5 w-5" />
            </button>
          </div>

          {nav}

          <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">
            <div className={`flex items-center gap-3 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/60 ${collapsed ? "lg:justify-center lg:bg-transparent lg:p-1 dark:lg:bg-transparent" : ""}`}>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/60 text-sm font-bold text-brand-700 dark:text-brand-200">
                {staff.name.charAt(0).toUpperCase()}
              </span>
              <div className={`min-w-0 flex-1 ${collapsed ? "lg:hidden" : ""}`}>
                <p className="truncate text-sm font-semibold">{staff.name}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{ROLE_LABELS[staff.role] || "Staff"}</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                title="Log out"
                aria-label="Log out"
                className={`rounded-lg p-2 text-zinc-500 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 ${collapsed ? "lg:hidden" : ""}`}
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => setCollapsed((value) => !value)}
              className="mt-2 hidden w-full items-center justify-center gap-2 rounded-lg py-2 text-xs font-medium text-zinc-500 hover:bg-zinc-100 lg:flex dark:hover:bg-zinc-800"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronsRight className="h-4 w-4" /> : <><ChevronsLeft className="h-4 w-4" /> Collapse</>}
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-zinc-200 bg-white/80 px-4 backdrop-blur-xl sm:px-6 dark:border-zinc-800 dark:bg-zinc-900/80">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 lg:hidden dark:border-zinc-800"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <h1 className="truncate font-display text-lg font-bold">{current?.label || "Dashboard"}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/" target="_blank" className="btn-ghost hidden px-3 py-2 sm:inline-flex">
                <ExternalLink className="h-4 w-4" /> View site
              </Link>
              <ThemeToggle />
              <button type="button" onClick={handleLogout} className="btn-ghost px-3 py-2 lg:hidden" aria-label="Log out">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto">{forbidden ? null : children}</main>
        </div>
      </div>
    </AdminFeedbackProvider>
  );
}

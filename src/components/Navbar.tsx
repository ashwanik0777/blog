"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const nav = [
    { href: "/(admin)/dashboard", label: "Blogs" },
    { href: "/(admin)/dashboard/analytics", label: "Analytics" },
    { href: "/(admin)/dashboard/blog-analytics", label: "Blog Analytics" },
    { href: "/(admin)/dashboard/moderation", label: "Content Moderation" },
    { href: "/(admin)/dashboard/comment-moderation", label: "Comment Moderation" },
    { href: "/(admin)/dashboard/chatbot-settings", label: "Chatbot Settings" },
    { href: "/(admin)/dashboard/newsletter", label: "Newsletter Subscribers" },
    { href: "/(admin)/dashboard/users", label: "User Management" },
  ];
  return (
    <nav className="bg-white dark:bg-gray-800 shadow mb-8">
      <div className="max-w-4xl mx-auto px-4 py-3 flex gap-6">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={
              (pathname === item.href
                ? "text-blue-600 dark:text-blue-400 font-bold"
                : "text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400") +
              " px-2 py-1 rounded"
            }
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

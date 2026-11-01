import { OPTIMIZED_IMAGE_HOSTS } from "@/lib/imageHosts";

export const SITE_NAME = "TechUpdatesZone";
export const SITE_TAGLINE = "Tech news, tutorials & developer insights";
export const SITE_DESCRIPTION =
  "TechUpdatesZone brings you practical tech news, in-depth programming tutorials, AI updates and web development guides — written for developers who ship.";
export const SITE_KEYWORDS = [
  "tech blog",
  "tech news",
  "programming tutorials",
  "web development",
  "Next.js",
  "React",
  "JavaScript",
  "TypeScript",
  "artificial intelligence",
  "developer guides",
];
export const SUPPORT_EMAIL = "support@techupdateszone.com";

export function getSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}

export function absoluteUrl(path = "/") {
  return `${getSiteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

export function blogPath(blog: { slug?: string; _id: string }) {
  return `/blog/${blog.slug || blog._id}`;
}

export function topicSlug(topic: string) {
  return topic
    .toLowerCase()
    .trim()
    .replace(/\+/g, "plus")
    .replace(/#/g, "sharp")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function topicPath(topic: string) {
  return `/topics/${topicSlug(topic)}`;
}

export function formatDate(value?: string | Date, style: "short" | "long" = "short") {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: style === "long" ? "long" : "short",
    day: "numeric",
  });
}

/** Allow-listed hosts go through next/image optimisation, everything else is served as-is. */
export function isOptimizableImage(src?: string) {
  if (!src) return false;
  if (src.startsWith("/")) return true;
  try {
    const url = new URL(src);
    return url.protocol === "https:" && OPTIMIZED_IMAGE_HOSTS.includes(url.hostname);
  } catch {
    return false;
  }
}

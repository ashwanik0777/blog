import type { MetadataRoute } from "next";
import { getAllTopics, getSitemapEntries } from "@/lib/blog";
import { absoluteUrl, blogPath, topicPath } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [blogs, topics] = await Promise.all([getSitemapEntries(), getAllTopics(500)]);
  const latest = blogs[0]?.updatedAt || blogs[0]?.publishedAt || new Date().toISOString();

  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: latest, changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/blog"), lastModified: latest, changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/topics"), lastModified: latest, changeFrequency: "weekly", priority: 0.7 },
    { url: absoluteUrl("/documentation"), changeFrequency: "monthly", priority: 0.4 },
    { url: absoluteUrl("/help-center"), changeFrequency: "monthly", priority: 0.4 },
    { url: absoluteUrl("/report-issue"), changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/privacy-policy"), changeFrequency: "yearly", priority: 0.2 },
    { url: absoluteUrl("/terms-of-service"), changeFrequency: "yearly", priority: 0.2 },
  ];

  return [
    ...staticPages,
    ...blogs.map((blog) => ({
      url: absoluteUrl(blogPath(blog)),
      lastModified: blog.updatedAt || blog.publishedAt || blog.createdAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      // Next.js does not XML-escape image URLs, and a raw "&" makes the whole sitemap invalid.
      images: blog.featuredImage ? [blog.featuredImage.replace(/&/g, "&amp;")] : undefined,
    })),
    ...topics.map((topic) => ({
      url: absoluteUrl(topicPath(topic.name)),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}

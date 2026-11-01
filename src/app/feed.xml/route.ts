import { getFeedEntries } from "@/lib/blog";
import { SITE_DESCRIPTION, SITE_NAME, absoluteUrl, blogPath } from "@/lib/site";

export const revalidate = 3600;

function escapeXml(value: string) {
  return value.replace(/[<>&'"]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[char] || char);
}

export async function GET() {
  const blogs = await getFeedEntries(30);
  const items = blogs
    .map((blog) => {
      const url = absoluteUrl(blogPath(blog));
      const categories = [...(blog.categories || []), ...(blog.tags || [])]
        .map((topic) => `<category>${escapeXml(topic)}</category>`)
        .join("");
      return `<item>
  <title>${escapeXml(blog.title)}</title>
  <link>${url}</link>
  <guid isPermaLink="true">${url}</guid>
  <pubDate>${new Date(blog.publishedAt || blog.createdAt).toUTCString()}</pubDate>
  <description>${escapeXml(blog.summary || blog.excerpt || "")}</description>
  ${categories}
</item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${escapeXml(SITE_NAME)}</title>
  <link>${absoluteUrl("/")}</link>
  <description>${escapeXml(SITE_DESCRIPTION)}</description>
  <language>en-us</language>
  <atom:link href="${absoluteUrl("/feed.xml")}" rel="self" type="application/rss+xml" />
${items}
</channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

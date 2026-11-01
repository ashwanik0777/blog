import { renderOgImage, ogSize } from "@/lib/og";
import { getBlogBySlugOrId } from "@/lib/blog";
import { SITE_NAME } from "@/lib/site";

export const alt = `Article on ${SITE_NAME}`;
export const size = ogSize;
export const contentType = "image/png";
export const revalidate = 3600;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const blog = await getBlogBySlugOrId(slug).catch(() => null);
  if (!blog) return renderOgImage({ title: SITE_NAME });

  return renderOgImage({
    title: blog.title.slice(0, 120),
    eyebrow: blog.categories?.[0] || blog.tags?.[0] || "Article",
    footer: `${blog.readingTime || 1} min read${blog.author?.name ? ` · by ${blog.author.name}` : ""}`,
  });
}

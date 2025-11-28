import React from "react";
import ReactMarkdown from "react-markdown";
import { Metadata } from "next";
import { headers } from "next/headers";
import Comments from "@/components/Comments";
import Link from "next/link";
import { Calendar, Clock, User, Eye, Share2, ArrowLeft, Tag, FolderOpen } from "lucide-react";
import Image from "next/image";

async function getBaseUrl() {
  const headersList = await headers();
  const host = headersList.get('host');
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  return `${protocol}://${host}`;
}

async function getBlog(slug: string) {
  const baseUrl = await getBaseUrl();
  const res = await fetch(`${baseUrl}/api/blog/${slug}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch blog");
  return res.json();
}

async function getRelatedBlogs(categories: string[], currentSlug: string) {
  try {
    const baseUrl = await getBaseUrl();
    const res = await fetch(`${baseUrl}/api/blog?pageSize=3`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.blogs?.filter((b: any) => b.slug !== currentSlug && b.published).slice(0, 3) || [];
  } catch {
    return [];
  }
}

type BlogPageParams = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: BlogPageParams): Promise<Metadata> {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  try {
    const blog = await getBlog(slug);
    const baseUrl = await getBaseUrl();
    const url = `${baseUrl}/blog/${blog.slug}`;
    return {
      title: blog.title,
      description: blog.summary || blog.excerpt || blog.content.substring(0, 160),
      openGraph: {
        title: blog.title,
        description: blog.summary || blog.excerpt || blog.content.substring(0, 160),
        url,
        type: "article",
        images: blog.featuredImage ? [{ url: blog.featuredImage }] : [],
        publishedTime: blog.createdAt,
        modifiedTime: blog.updatedAt,
        authors: [blog.author?.name || "TechUpdatesZone"],
      },
      twitter: {
        card: "summary_large_image",
        title: blog.title,
        description: blog.summary || blog.excerpt || blog.content.substring(0, 160),
        images: blog.featuredImage ? [blog.featuredImage] : [],
      },
      alternates: {
        canonical: url,
      },
    };
  } catch {
    return { title: "Blog Not Found" };
  }
}

function getReadingTime(content: string) {
  if (!content) return 1;
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default async function BlogDetailPage({ params }: BlogPageParams) {
  const { slug } = await params;
  let blog;
  try {
    blog = await getBlog(slug);
  } catch (e) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Blog Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">The blog post you're looking for doesn't exist.</p>
          <Link href="/blog" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
            ← Back to Blogs
          </Link>
        </div>
      </div>
    );
  }

  const baseUrl = await getBaseUrl();
  const url = `${baseUrl}/blog/${blog.slug}`;
  const readingTime = blog.readingTime || getReadingTime(blog.content);
  const relatedBlogs = await getRelatedBlogs(blog.categories || [], blog.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": blog.title,
    "description": blog.summary || blog.excerpt,
    "image": blog.featuredImage,
    "author": {
      "@type": "Person",
      "name": blog.author?.name || "Unknown"
    },
    "datePublished": blog.createdAt,
    "dateModified": blog.updatedAt || blog.createdAt,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url
    },
    "publisher": {
      "@type": "Organization",
      "name": "TechUpdatesZone Blog",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/logo.png`
      }
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      
      {/* Navbar */}
      <nav className="w-full py-4 px-6 flex justify-between items-center bg-white dark:bg-gray-900 shadow-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <Link href="/" className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
          TechUpdatesZone Blog
        </Link>
        <div className="flex gap-6">
          <Link href="/blog" className="text-blue-600 hover:text-blue-700 hover:underline font-semibold transition-colors">Blogs</Link>
          <Link href="/" className="text-gray-800 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 hover:underline font-medium transition-colors">Home</Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link 
          href="/blog" 
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="font-medium">Back to Blogs</span>
        </Link>

        {/* Article Header */}
        <article className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Featured Image */}
          {blog.featuredImage && (
            <div className="relative w-full h-96 md:h-[500px] overflow-hidden">
              <img
                src={blog.featuredImage}
                alt={blog.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20" />
            </div>
          )}

          <div className="p-8 md:p-12">
            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
              {blog.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <User className="h-4 w-4" />
                <span className="font-medium">{blog.author?.name || "Unknown Author"}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Calendar className="h-4 w-4" />
                <span>{new Date(blog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Clock className="h-4 w-4" />
                <span>{readingTime} min read</span>
              </div>
              {blog.views !== undefined && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Eye className="h-4 w-4" />
                  <span>{blog.views} views</span>
                </div>
              )}
            </div>

            {/* Summary/Excerpt */}
            {(blog.summary || blog.excerpt) && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600 p-6 mb-8 rounded-r-lg">
                <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed italic">
                  {blog.summary || blog.excerpt}
                </p>
              </div>
            )}

            {/* Content */}
            <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
              <ReactMarkdown
                components={{
                  h1: ({node, ...props}) => <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-8 mb-4" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-6 mb-3" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4 mb-2" {...props} />,
                  p: ({node, ...props}) => <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed" {...props} />,
                  a: ({node, ...props}) => <a className="text-blue-600 dark:text-blue-400 hover:underline" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4 text-gray-700 dark:text-gray-300 space-y-2" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-4 text-gray-700 dark:text-gray-300 space-y-2" {...props} />,
                  code: ({node, ...props}) => <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm" {...props} />,
                  blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-blue-600 pl-4 italic text-gray-600 dark:text-gray-400 my-4" {...props} />,
                }}
              >
                {blog.content}
              </ReactMarkdown>
            </div>

            {/* Tags and Categories */}
            <div className="mb-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              {blog.tags && blog.tags.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <span className="font-semibold text-gray-900 dark:text-white">Tags:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {blog.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {blog.categories && blog.categories.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <FolderOpen className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="font-semibold text-gray-900 dark:text-white">Categories:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {blog.categories.map((cat: string) => (
                      <span
                        key={cat}
                        className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Share Section */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6 mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Share2 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <span className="font-semibold text-gray-900 dark:text-white">Share this article:</span>
              </div>
              <div className="flex gap-3">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}&url=${encodeURIComponent(url)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  Twitter
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors font-medium"
                >
                  Facebook
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        </article>

        {/* Related Blogs */}
        {relatedBlogs.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Related Articles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedBlogs.map((relatedBlog: any) => (
                <Link
                  key={relatedBlog._id}
                  href={`/blog/${relatedBlog.slug}`}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {relatedBlog.featuredImage && (
                    <div className="relative w-full h-48 overflow-hidden">
                      <img
                        src={relatedBlog.featuredImage}
                        alt={relatedBlog.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      {relatedBlog.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {relatedBlog.excerpt || relatedBlog.summary}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Comments Section */}
        <div className="mt-12">
          <Comments blogId={blog._id} />
        </div>
      </main>
    </div>
  );
}

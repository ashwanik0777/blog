import React from "react";
import ReactMarkdown from "react-markdown";
import { Metadata } from "next";
import { headers } from "next/headers";
import Image from "next/image";
import Comments from "@/components/Comments";
import Footer from "@/components/Footer";
import CopyButton from "@/components/CopyButton";
import Link from "next/link";
import { Calendar, Clock, User, Eye, Share2, ArrowLeft, Tag, FolderOpen, BookOpen, TrendingUp, Heart } from "lucide-react";

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
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-8 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to All Blogs</span>
        </Link>

        {/* Article Container */}
        <article className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-12">
          {/* Featured Image */}
          {blog.featuredImage && (
            <div className="relative w-full h-64 md:h-96 overflow-hidden">
              <Image
                src={blog.featuredImage}
                alt={blog.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              />
              <div className="absolute inset-0 bg-black/40" />
              {blog.featured && (
                <div className="absolute top-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Featured
                </div>
              )}
            </div>
          )}

          <div className="p-8 md:p-12">
            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
              {blog.title}
            </h1>

            {/* Meta Information Bar */}
            <div className="flex flex-wrap items-center gap-4 mb-8 pb-8 border-b-2 border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 px-4 py-2 rounded-lg">
                <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="font-semibold">{blog.author?.name || "Unknown Author"}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 px-4 py-2 rounded-lg">
                <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span>{new Date(blog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 px-4 py-2 rounded-lg">
                <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span>{readingTime} min read</span>
              </div>
              {blog.views !== undefined && (
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 px-4 py-2 rounded-lg">
                  <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>{blog.views.toLocaleString()} views</span>
                </div>
              )}
            </div>

            {/* Summary/Excerpt */}
            {(blog.summary || blog.excerpt) && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600 p-6 mb-10 rounded-r-lg shadow-sm">
                <div className="flex items-start gap-3">
                  <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2 uppercase tracking-wide">Summary</h3>
                    <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed">
                      {blog.summary || blog.excerpt}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Content */}
            <div className="prose prose-lg dark:prose-invert max-w-none mb-10">
              <ReactMarkdown
                components={{
                  h1: ({node, ...props}) => <h1 className="text-4xl font-bold text-gray-900 dark:text-white mt-10 mb-6 pb-3 border-b-2 border-gray-200 dark:border-gray-700" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-8 mb-4" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mt-6 mb-3" {...props} />,
                  h4: ({node, ...props}) => <h4 className="text-xl font-semibold text-gray-900 dark:text-white mt-4 mb-2" {...props} />,
                  p: ({node, ...props}) => <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed text-lg" {...props} />,
                  a: ({node, ...props}) => <a className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline font-medium" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc list-inside mb-6 text-gray-700 dark:text-gray-300 space-y-3 ml-4" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-6 text-gray-700 dark:text-gray-300 space-y-3 ml-4" {...props} />,
                  li: ({node, ...props}) => <li className="text-lg leading-relaxed" {...props} />,
                  code: ({node, ...props}) => <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono text-blue-600 dark:text-blue-400" {...props} />,
                  pre: ({node, ...props}) => <pre className="bg-gray-900 dark:bg-gray-950 text-gray-100 p-4 rounded-lg overflow-x-auto mb-6" {...props} />,
                  blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-blue-600 pl-6 italic text-gray-600 dark:text-gray-400 my-6 text-lg bg-blue-50 dark:bg-blue-900/20 py-4 rounded-r-lg" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-bold text-gray-900 dark:text-white" {...props} />,
                  em: ({node, ...props}) => <em className="italic text-gray-800 dark:text-gray-200" {...props} />,
                }}
              >
                {blog.content}
              </ReactMarkdown>
            </div>

            {/* Tags and Categories */}
            <div className="mb-10 pt-8 border-t-2 border-gray-200 dark:border-gray-700">
              {blog.tags && blog.tags.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Tag className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <span className="font-bold text-gray-900 dark:text-white text-lg">Tags</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {blog.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-semibold hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors cursor-pointer"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {blog.categories && blog.categories.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <FolderOpen className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="font-bold text-gray-900 dark:text-white text-lg">Categories</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {blog.categories.map((cat: string) => (
                      <span
                        key={cat}
                        className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-4 py-2 rounded-full text-sm font-semibold hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors cursor-pointer"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Share Section */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 mb-8 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <Share2 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <span className="font-bold text-gray-900 dark:text-white text-lg">Share this article</span>
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}&url=${encodeURIComponent(url)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-all font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  Twitter
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-800 transition-all font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  Facebook
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  LinkedIn
                </a>
                <CopyButton text={url} />
              </div>
            </div>
          </div>
        </article>

        {/* Related Blogs */}
        {relatedBlogs.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Related Articles</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedBlogs.map((relatedBlog: any) => (
                <Link
                  key={relatedBlog._id}
                  href={`/blog/${relatedBlog.slug}`}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1 group"
                >
                  {relatedBlog.featuredImage && (
                    <div className="relative w-full h-48 overflow-hidden">
                      <img
                        src={relatedBlog.featuredImage}
                        alt={relatedBlog.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {relatedBlog.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                      {relatedBlog.excerpt || relatedBlog.summary}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="h-3 w-3" />
                      <span>{relatedBlog.readingTime || getReadingTime(relatedBlog.content)} min read</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Comments Section */}
        <Comments blogId={blog._id} />
      </main>

      <Footer />
    </div>
  );
}

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

async function getBlog(id: string) {
  const baseUrl = await getBaseUrl();
  const res = await fetch(`${baseUrl}/api/blog/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch blog");
  return res.json();
}

async function getRelatedBlogs(categories: string[], currentId: string) {
  try {
    const baseUrl = await getBaseUrl();
    const res = await fetch(`${baseUrl}/api/blog?pageSize=3`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.blogs?.filter((b: any) => b._id !== currentId && b.published).slice(0, 3) || [];
  } catch {
    return [];
  }
}

type BlogPageParams = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: BlogPageParams): Promise<Metadata> {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  try {
    const blog = await getBlog(id);
    const baseUrl = await getBaseUrl();
    const url = `${baseUrl}/blog/${blog._id}`;
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
  const { id } = await params;
  let blog;
  try {
    blog = await getBlog(id);
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
  const url = `${baseUrl}/blog/${blog._id}`;
  
  // Increment view count
  try {
    await fetch(`${baseUrl}/api/blog/${blog._id}?view=1`, { method: 'PATCH', cache: 'no-store' });
  } catch (e) {
    console.error('Failed to increment view count', e);
  }

  const relatedBlogs = await getRelatedBlogs(blog.categories || [], blog._id);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
      {/* Navbar */}
      <nav className="w-full py-4 px-6 flex justify-between items-center bg-white dark:bg-gray-900 shadow-md sticky top-0 z-40 border-b border-gray-200 dark:border-gray-700">
        <Link href="/" className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
          TechUpdatesZone Blog
        </Link>
        <div className="flex gap-6">
          <Link href="/blog" className="text-blue-600 hover:text-blue-700 hover:underline font-semibold transition-colors">Blogs</Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-10 px-4">
        <Link href="/blog" className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-8 font-medium transition-colors group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Blogs
        </Link>

        <article>
          {/* Header */}
          <header className="mb-10">
            <div className="flex flex-wrap gap-2 mb-4">
              {blog.categories?.map((cat: string) => (
                <span key={cat} className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide flex items-center gap-1">
                  <FolderOpen className="w-3 h-3" /> {cat}
                </span>
              ))}
            </div>
            
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight text-gray-900 dark:text-white">{blog.title}</h1>
            
            <div className="flex flex-wrap items-center gap-6 text-gray-600 dark:text-gray-400 text-sm border-b border-gray-200 dark:border-gray-800 pb-8">
              <div className="flex items-center gap-2">
                {blog.author?.image ? (
                  <Image src={blog.author.image} alt={blog.author.name} width={40} height={40} className="rounded-full border-2 border-white dark:border-gray-800 shadow-sm" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </div>
                )}
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">{blog.author?.name || "Unknown Author"}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">Author</p>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5" title="Published Date">
                <Calendar className="w-4 h-4" />
                <span>{new Date(blog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              
              <div className="flex items-center gap-1.5" title="Reading Time">
                <Clock className="w-4 h-4" />
                <span>{blog.readingTime || getReadingTime(blog.content)} min read</span>
              </div>
              
              <div className="flex items-center gap-1.5" title="Views">
                <Eye className="w-4 h-4" />
                <span>{blog.views || 0} views</span>
              </div>

              <div className="ml-auto flex gap-2">
                <CopyButton text={url} />
                <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400" title="Share">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          {blog.featuredImage && (
            <div className="relative w-full h-[400px] md:h-[500px] mb-10 rounded-2xl overflow-hidden shadow-xl">
              <Image 
                src={blog.featuredImage} 
                alt={blog.title} 
                fill 
                className="object-cover hover:scale-105 transition-transform duration-700"
                priority
              />
            </div>
          )}

          {/* Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none mb-12 prose-headings:font-bold prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-img:rounded-xl prose-pre:bg-gray-900 dark:prose-pre:bg-black prose-pre:border prose-pre:border-gray-800">
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }: any) {
                  return !inline ? (
                    <div className="relative group">
                      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <CopyButton text={String(children).replace(/\n$/, '')} />
                      </div>
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto border border-gray-800 shadow-inner">
                        <code {...props} className={className}>
                          {children}
                        </code>
                      </pre>
                    </div>
                  ) : (
                    <code className="bg-gray-100 dark:bg-gray-800 text-red-500 dark:text-red-400 px-1.5 py-0.5 rounded font-mono text-sm border border-gray-200 dark:border-gray-700" {...props} />
                  );
                },
                img: ({ node, ...props }) => (
                  <div className="my-8">
                    <img {...props} className="rounded-xl shadow-lg w-full" alt={props.alt || "Blog image"} />
                    {props.alt && <p className="text-center text-sm text-gray-500 mt-2 italic">{props.alt}</p>}
                  </div>
                ),
                blockquote: ({ node, ...props }) => (
                  <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-700 dark:text-gray-300 my-6 bg-blue-50 dark:bg-blue-900/10 p-4 rounded-r-lg" {...props} />
                ),
                table: ({ node, ...props }) => (
                  <div className="overflow-x-auto my-8 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" {...props} />
                  </div>
                ),
                th: ({ node, ...props }) => (
                  <th className="px-6 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" {...props} />
                ),
                td: ({ node, ...props }) => (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 border-t border-gray-200 dark:border-gray-700" {...props} />
                ),
              }}
            >
              {blog.content}
            </ReactMarkdown>
          </div>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-12 pt-8 border-t border-gray-200 dark:border-gray-800">
              <span className="text-gray-500 dark:text-gray-400 font-medium flex items-center gap-2 mr-2">
                <Tag className="w-4 h-4" /> Tags:
              </span>
              {blog.tags.map((tag: string) => (
                <span key={tag} className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Related Blogs */}
          {relatedBlogs.length > 0 && (
            <div className="mb-16">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
                <BookOpen className="w-6 h-6 text-blue-600" /> Related Posts
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedBlogs.map((relatedBlog: any) => (
                  <Link 
                    key={relatedBlog._id} 
                    href={`/blog/${relatedBlog._id}`}
                    className="group block bg-gray-50 dark:bg-gray-800/50 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="h-40 relative overflow-hidden">
                      {relatedBlog.featuredImage ? (
                        <Image src={relatedBlog.featuredImage} alt={relatedBlog.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <TrendingUp className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-2">
                        {relatedBlog.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {relatedBlog.summary || relatedBlog.excerpt}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Comments Section */}
          <div className="pt-10 border-t border-gray-200 dark:border-gray-800">
            <Comments blogId={blog._id} />
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}

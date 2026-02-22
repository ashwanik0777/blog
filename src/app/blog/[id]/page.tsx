import React from "react";
import ReactMarkdown from "react-markdown";
import { Metadata } from "next";
import Image from "next/image";
import Comments from "@/components/Comments";
import Footer from "@/components/Footer";
import CopyButton from "@/components/CopyButton";
import BlogViewTracker from "@/components/BlogViewTracker";
import ThemeToggle from "@/components/ThemeToggle";
import Link from "next/link";
import { Calendar, Clock, User, Eye, Share2, ArrowLeft, Tag, FolderOpen, BookOpen, TrendingUp, Heart, ChevronRight, Home } from "lucide-react";
import dbConnect from "@/lib/mongodb";
import Blog from "@/models/Blog";

export const revalidate = 60;

async function getBlog(id: string) {
  await dbConnect();
  const blog = await Blog.findById(id).populate('author', 'name email image').lean();
  if (!blog) throw new Error("Failed to fetch blog");
  return JSON.parse(JSON.stringify(blog));
}

async function getRelatedBlogs(categories: string[], currentId: string) {
  try {
    await dbConnect();
    const query = categories?.length
      ? { _id: { $ne: currentId }, published: true, categories: { $in: categories } }
      : { _id: { $ne: currentId }, published: true };

    const blogs = await Blog.find(query)
      .select('title summary excerpt featuredImage categories createdAt readingTime')
      .sort({ publishedAt: -1 })
      .limit(3)
      .lean();
    return JSON.parse(JSON.stringify(blogs));
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
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
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

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const url = `${baseUrl}/blog/${blog._id}`;

  const relatedBlogs = await getRelatedBlogs(blog.categories || [], blog._id);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300">
      {/* Navbar */}
      <nav className="w-full py-4 px-6 flex justify-between items-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-sm sticky top-0 z-50 border-b border-gray-200/50 dark:border-gray-800/50">
        <Link href="/" className="text-2xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          TechUpdatesZone
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/blog" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">Blogs</Link>
          <ThemeToggle />
        </div>
      </nav>

      <BlogViewTracker blogId={blog._id} />
      <main className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500 mb-10 overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
           <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1">
             <Home className="w-4 h-4" /> Home
           </Link>
           <ChevronRight className="w-4 h-4 flex-shrink-0" />
           <Link href="/blog" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Blogs</Link>
           <ChevronRight className="w-4 h-4 flex-shrink-0" />
           <span className="text-gray-700 dark:text-gray-300 font-medium truncate max-w-[200px]">{blog.title}</span>
        </div>

        <article>
           {/* Header Section */}
           <header className="max-w-7xl mx-auto text-center mb-10">
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                 {blog.categories?.map((cat: string) => (
                    <span key={cat} className="bg-blue-50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-400 text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wide border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                       <FolderOpen className="w-3 h-3" /> {cat}
                    </span>
                 ))}
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-6xl font-black mb-6 leading-tight tracking-tight text-gray-900 dark:text-white">
                 {blog.title}
              </h1>
              {blog.summary && (
                 <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-5xl mx-auto leading-relaxed">
                    {blog.summary}
                 </p>
              )}
              
              {/* Author & Meta */}
              <div className="flex flex-wrap items-center justify-center gap-6 text-gray-600 dark:text-gray-400 text-sm border border-gray-200 dark:border-gray-800 rounded-full py-4 w-fit mx-auto px-8 bg-white dark:bg-gray-900 shadow-sm">
                 <div className="flex items-center gap-2">
                    {blog.author?.image ? (
                      <Image src={blog.author.image} alt={blog.author.name} width={32} height={32} className="rounded-full border border-gray-200 dark:border-gray-700" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </div>
                    )}
                    <span className="font-semibold text-gray-900 dark:text-white">{blog.author?.name || "Unknown"}</span>
                 </div>
                 <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                 <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(blog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                 </div>
                 <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600 hidden sm:block" />
                 <div className="hidden sm:flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>{blog.readingTime || getReadingTime(blog.content)} min read</span>
                 </div>
                 <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600 hidden sm:block" />
                 <div className="hidden sm:flex items-center gap-1.5">
                    <Eye className="w-4 h-4" />
                    <span>{blog.views || 0} views</span>
                 </div>
              </div>
           </header>

           {/* Featured Image */}
           {blog.featuredImage && (
              <div className="relative w-full aspect-[16/9] md:aspect-[21/9] mb-16 rounded-2xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-800 group">
                 <Image 
                    src={blog.featuredImage} 
                    alt={blog.title} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    priority
                 />
              </div>
           )}

           {/* Content Column - Constrained Width */}
           <div className="max-w-5xl mx-auto">
              <div className="prose prose-lg dark:prose-invert max-w-none">
                 <ReactMarkdown
                    components={{
                      h1: ({node, ...props}) => <h1 className="text-3xl md:text-4xl font-extrabold mt-12 mb-6 text-gray-900 dark:text-white leading-tight" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-2xl md:text-3xl font-bold mt-10 mb-4 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-xl md:text-2xl font-bold mt-8 mb-3 text-gray-900 dark:text-white" {...props} />,
                      h4: ({node, ...props}) => <h4 className="text-lg md:text-xl font-bold mt-6 mb-2 text-gray-900 dark:text-white" {...props} />,
                      p: ({node, ...props}) => <p className="text-lg leading-8 text-gray-700 dark:text-gray-300 mb-6" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc list-outside ml-6 mb-6 text-gray-700 dark:text-gray-300 space-y-2 marker:text-blue-500" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal list-outside ml-6 mb-6 text-gray-700 dark:text-gray-300 space-y-2 marker:text-blue-500 font-medium" {...props} />,
                      li: ({node, ...props}) => <li className="pl-2" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-bold text-gray-900 dark:text-white" {...props} />,
                      a: ({node, ...props}) => <a className="text-blue-600 dark:text-blue-400 hover:underline font-medium transition-colors decoration-2 underline-offset-2" {...props} />,
                      blockquote: ({node, ...props}) => (
                        <blockquote className="border-l-4 border-blue-500 pl-6 py-3 my-8 bg-blue-50 dark:bg-blue-900/20 rounded-r-xl italic text-gray-800 dark:text-gray-200 shadow-sm" {...props} />
                      ),
                      hr: ({node, ...props}) => <hr className="my-10 border-gray-200 dark:border-gray-800" {...props} />,
                      code({ node, inline, className, children, ...props }: any) {
                        return !inline ? (
                          <div className="relative group my-8">
                            <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                              <CopyButton text={String(children).replace(/\n$/, '')} />
                            </div>
                            <pre className="!bg-[#0d1117] !p-0 rounded-xl overflow-hidden border border-gray-800 shadow-2xl">
                              <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-gray-800">
                                <div className="flex gap-1.5">
                                  <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                                  <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                                </div>
                                <span className="text-xs text-gray-400 font-mono font-medium">code</span>
                              </div>
                              <div className="p-5 overflow-x-auto">
                                <code {...props} className={`${className} !bg-transparent !p-0 text-sm font-mono leading-relaxed text-gray-300`}>
                                  {children}
                                </code>
                              </div>
                            </pre>
                          </div>
                        ) : (
                          <code className="bg-gray-100 dark:bg-gray-800 text-pink-600 dark:text-pink-400 px-1.5 py-0.5 rounded-md font-mono text-sm border border-gray-200 dark:border-gray-700 font-medium" {...props} />
                        );
                      },
                      img: ({ node, ...props }) => (
                        <figure className="my-10 group">
                          <div className="relative rounded-2xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                             <img {...props} className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.02]" alt={props.alt || "Blog image"} />
                          </div>
                          {props.alt && <figcaption className="text-center text-sm text-gray-500 mt-3 italic">{props.alt}</figcaption>}
                        </figure>
                      ),
                      table: ({ node, ...props }) => (
                        <div className="overflow-x-auto my-8 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" {...props} />
                        </div>
                      ),
                      th: ({ node, ...props }) => (
                        <th className="px-6 py-4 bg-gray-50 dark:bg-gray-800 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider" {...props} />
                      ),
                      td: ({ node, ...props }) => (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 border-t border-gray-200 dark:border-gray-700" {...props} />
                      ),
                    }}
                 >
                    {blog.content}
                 </ReactMarkdown>
              </div>

              {/* Tags & Share */}
              <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800">
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    {blog.tags && blog.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {blog.tags.map((tag: string) => (
                          <span key={tag} className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer flex items-center gap-1.5 font-medium">
                            <Tag className="w-3.5 h-3.5" /> {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Share this post:</span>
                      <div className="flex gap-2">
                        <CopyButton text={url} />
                        <button className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" title="Share">
                          <Share2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                 </div>
              </div>

              {/* Comments */}
              <div className="mt-16">
                 <Comments blogId={blog._id} />
              </div>
           </div>
        </article>

        {/* Related Posts */}
        {relatedBlogs.length > 0 && (
          <div className="mt-24 pt-16 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-3xl font-black flex items-center gap-2 text-gray-900 dark:text-white">
                <BookOpen className="w-6 h-6 text-blue-600" /> Related Posts
              </h3>
              <Link href="/blog" className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {relatedBlogs.map((relatedBlog: any) => (
                <Link 
                  key={relatedBlog._id} 
                  href={`/blog/${relatedBlog._id}`}
                  className="group block bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg transition-all duration-300"
                >
                  <div className="h-48 relative overflow-hidden">
                    {relatedBlog.featuredImage ? (
                      <Image src={relatedBlog.featuredImage} alt={relatedBlog.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <>
                        <Image
                          src="/blog-fallback-tech.svg"
                          alt="Tech blog illustration"
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                      </>
                    )}
                    <div className="absolute top-3 left-3">
                       {relatedBlog.categories?.[0] && (
                         <span className="bg-white/90 dark:bg-black/80 backdrop-blur-sm text-xs font-bold px-2 py-1 rounded-md shadow-sm">
                           {relatedBlog.categories[0]}
                         </span>
                       )}
                    </div>
                  </div>
                  <div className="p-5">
                    <h4 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-3">
                      {relatedBlog.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                      {relatedBlog.summary || relatedBlog.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                       <span>{new Date(relatedBlog.createdAt).toLocaleDateString()}</span>
                       <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {relatedBlog.readingTime || 1} min</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

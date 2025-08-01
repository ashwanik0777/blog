import React from "react";
import ReactMarkdown from "react-markdown";
import { Metadata } from "next";

async function getBlog(slug: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/blog/${slug}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch blog');
  return res.json();
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const blog = await getBlog(params.slug);
    const url = `${process.env.NEXT_PUBLIC_BASE_URL || ''}/blog/${blog.slug}`;
    return {
      title: blog.title,
      description: blog.summary,
      openGraph: {
        title: blog.title,
        description: blog.summary,
        url,
        type: "article",
        images: blog.featuredImage ? [{ url: blog.featuredImage }] : [],
      },
      twitter: {
        card: "summary_large_image",
        title: blog.title,
        description: blog.summary,
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

export default async function BlogDetailPage({ params }: { params: { slug: string } }) {
  let blog;
  try {
    blog = await getBlog(params.slug);
  } catch (e) {
    return <div className="p-8 text-center text-red-500">Blog not found.</div>;
  }
  const url = `${process.env.NEXT_PUBLIC_BASE_URL || ''}/blog/${blog.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": blog.title,
    "description": blog.summary,
    "image": blog.featuredImage,
    "author": {
      "@type": "Person",
      "name": blog.author?.name || "Unknown"
    },
    "datePublished": blog.createdAt,
    "dateModified": blog.updatedAt,
    "mainEntityOfPage": url,
  };
  // Note: View count increment will be handled client-side
  return (
    <main className="max-w-3xl mx-auto py-8 px-4">
      <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <h1 className="text-3xl font-bold mb-2">{blog.title}</h1>
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <span>By {blog.author?.name || "Unknown"}</span>
        <span>• {new Date(blog.createdAt).toLocaleDateString()}</span>
      </div>
      {blog.featuredImage && (
        <img src={blog.featuredImage} alt={blog.title} className="rounded w-full h-64 object-cover mb-4" />
      )}
      <div className="prose dark:prose-invert max-w-none mb-6">
        <ReactMarkdown>{blog.content}</ReactMarkdown>
      </div>
      <div className="flex flex-wrap gap-2 mb-2">
        {blog.tags?.map((tag: string) => (
          <span key={tag} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">#{tag}</span>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {blog.categories?.map((cat: string) => (
          <span key={cat} className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">{cat}</span>
        ))}
      </div>
    </main>
  );
} 
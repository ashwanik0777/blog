import { NextResponse } from 'next/server';

async function getBlogs() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/blog`, { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

export async function GET() {
  const data = await getBlogs();
  const blogs = data.blogs || [];
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://techupdates.zone';
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  
  // Static pages
  xml += `  <url>\n    <loc>${baseUrl}/</loc>\n    <priority>1.0</priority>\n  </url>\n`;
  xml += `  <url>\n    <loc>${baseUrl}/blog</loc>\n    <priority>0.9</priority>\n  </url>\n`;

  // Blog pages
  for (const blog of blogs) {
    xml += `  <url>\n    <loc>${baseUrl}/blog/${blog._id}</loc>\n    <lastmod>${new Date(blog.updatedAt || blog.createdAt).toISOString()}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
  }
  
  xml += `</urlset>`;
  
  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
} 
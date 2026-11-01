import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Blog from '@/models/Blog';
import { isObjectId } from '@/lib/security';

// Old article URLs used the database id (/blog/<id>). The proxy rewrites them here
// so search engines get a real 308 to the slug URL and keep the ranking signals.
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (isObjectId(id)) {
    try {
      await dbConnect();
      const blog = await Blog.findOne({ _id: id, published: true }).select('slug').lean<{ slug?: string }>();
      if (blog?.slug) {
        return NextResponse.redirect(new URL(`/blog/${blog.slug}`, req.url), {
          status: 308,
          headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' },
        });
      }
    } catch (error) {
      console.error('Legacy blog redirect failed:', error);
    }
  }
  return NextResponse.redirect(new URL('/blog', req.url), 307);
}

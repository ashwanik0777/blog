import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Blog from '../../../../models/Blog';
import { getToken } from 'next-auth/jwt';

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  await dbConnect();
  const { slug } = await params;
  const blog = await Blog.findOne({ slug }).populate('author', 'name email image');
  if (!blog) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(blog);
}

export async function PUT(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  await dbConnect();
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { slug } = await params;
  const body = await req.json();
  
  const blog = await Blog.findOneAndUpdate(
    { slug },
    {
      title: body.title,
      slug: body.slug,
      content: body.content,
      summary: body.summary,
      tags: body.tags,
      categories: body.categories,
      featuredImage: body.featuredImage,
      published: body.published,
      status: body.published ? 'approved' : 'draft'
    },
    { new: true }
  );
  
  if (!blog) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(blog);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  await dbConnect();
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { slug } = await params;
  const blog = await Blog.findOneAndDelete({ slug });
  if (!blog) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  await dbConnect();
  const { slug } = await params;
  const url = new URL(req.url!);
  if (url.searchParams.get('view') === '1') {
    const today = new Date().toISOString().slice(0, 10);
    const blog = await Blog.findOneAndUpdate(
      { slug },
      {
        $inc: { views: 1, [`viewsByDay.${today}`]: 1 },
      },
      { new: true }
    );
    if (!blog) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ views: blog.views, viewsByDay: blog.viewsByDay });
  }
  // If not a view increment, allow admin to update status/notes
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const updates = await req.json();
  const blog = await Blog.findOneAndUpdate({ slug }, updates, { new: true });
  if (!blog) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(blog);
} 
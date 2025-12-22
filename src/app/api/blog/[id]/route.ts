import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Blog from '@/models/Blog';
import { getToken } from 'next-auth/jwt';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const { id } = await params;
  try {
    const blog = await Blog.findById(id).populate('author', 'name email image');
    if (!blog) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(blog);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();
  
  try {
    const blog = await Blog.findByIdAndUpdate(
      id,
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
  } catch (error) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  try {
    const blog = await Blog.findByIdAndDelete(id);
    if (!blog) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const { id } = await params;
  const url = new URL(req.url!);
  
  try {
    if (url.searchParams.get('view') === '1') {
      const today = new Date().toISOString().slice(0, 10);
      const blog = await Blog.findByIdAndUpdate(
        id,
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
    const blog = await Blog.findByIdAndUpdate(id, updates, { new: true });
    if (!blog) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(blog);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }
} 
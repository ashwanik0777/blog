import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Blog from '../../../../models/Blog';
import { getToken } from 'next-auth/jwt';

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  await dbConnect();
  const blog = await Blog.findOne({ slug: params.slug }).populate('author', 'name email image');
  if (!blog) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(blog);
}

export async function PUT(req: Request, { params }: { params: { slug: string } }) {
  await dbConnect();
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const data = await req.json();
  const blog = await Blog.findOneAndUpdate({ slug: params.slug }, data, { new: true });
  if (!blog) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(blog);
}

export async function DELETE(req: Request, { params }: { params: { slug: string } }) {
  await dbConnect();
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const blog = await Blog.findOneAndDelete({ slug: params.slug });
  if (!blog) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}

export async function PATCH(req: Request, { params }: { params: { slug: string } }) {
  await dbConnect();
  const url = new URL(req.url!);
  if (url.searchParams.get('view') === '1') {
    const today = new Date().toISOString().slice(0, 10);
    const blog = await Blog.findOneAndUpdate(
      { slug: params.slug },
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
  const blog = await Blog.findByIdAndUpdate(params.slug, updates, { new: true });
  if (!blog) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(blog);
} 
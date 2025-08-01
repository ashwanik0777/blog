import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getToken } from 'next-auth/jwt';

export async function GET(req: Request) {
  await dbConnect();
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const users = await User.find({}, '-password').sort({ createdAt: -1 });
  return NextResponse.json({ users });
}

export async function POST(req: Request) {
  await dbConnect();
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { userId, role, disabled } = await req.json();
  const user = await User.findById(userId);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  if (role) user.role = role;
  if (typeof disabled === 'boolean') user.disabled = disabled;
  await user.save();
  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  await dbConnect();
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { userId } = await req.json();
  await User.findByIdAndDelete(userId);
  return NextResponse.json({ success: true });
} 
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Settings from '@/models/Settings';
import { getToken } from 'next-auth/jwt';

export async function GET() {
  await dbConnect();
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({ chatbotEnabled: true });
  }
  return NextResponse.json({ chatbotEnabled: settings.chatbotEnabled });
}

export async function POST(req: Request) {
  await dbConnect();
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { chatbotEnabled } = await req.json();
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({ chatbotEnabled });
  } else {
    settings.chatbotEnabled = chatbotEnabled;
    await settings.save();
  }
  return NextResponse.json({ chatbotEnabled: settings.chatbotEnabled });
} 
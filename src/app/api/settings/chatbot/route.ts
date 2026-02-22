import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Settings from '@/models/Settings';
import { requireAdmin } from '@/lib/adminAuth';

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
  const { errorResponse } = requireAdmin(req);
  if (errorResponse) {
    return errorResponse;
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
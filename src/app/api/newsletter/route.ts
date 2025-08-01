import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import mongoose, { Schema, models, model } from 'mongoose';

const NewsletterSchema = new Schema({
  email: { type: String, required: true, unique: true },
  subscribedAt: { type: Date, default: Date.now },
});
const Newsletter = models.Newsletter || model('Newsletter', NewsletterSchema);

export async function POST(req: Request) {
  await dbConnect();
  const { email } = await req.json();
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }
  const existing = await Newsletter.findOne({ email });
  if (existing) {
    return NextResponse.json({ error: 'Already subscribed' }, { status: 400 });
  }
  await Newsletter.create({ email });
  return NextResponse.json({ success: true });
}

export async function GET() {
  await dbConnect();
  const subs = await Newsletter.find().sort({ subscribedAt: -1 });
  return NextResponse.json({ subscribers: subs });
} 
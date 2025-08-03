import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getToken } from 'next-auth/jwt';
import mongoose, { Schema, models, model } from 'mongoose';

// Newsletter Subscriber Schema
const NewsletterSubscriberSchema = new Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String },
  subscribed: { type: Boolean, default: true },
  subscribedAt: { type: Date, default: Date.now },
  lastEmailSent: { type: Date },
  tags: [{ type: String }],
  source: { type: String }
});

const NewsletterSubscriber = models.NewsletterSubscriber || model('NewsletterSubscriber', NewsletterSubscriberSchema);

export async function GET(req: Request) {
  await dbConnect();
  
  // Check admin authentication
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  
  if (!token) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 401 });
  }
  
  if (token.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 401 });
  }

  try {
    const subscribers = await NewsletterSubscriber.find()
      .sort({ subscribedAt: -1 });
    
    return NextResponse.json({ subscribers });
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await dbConnect();
  
  // Check admin authentication
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  
  if (!token) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 401 });
  }
  
  if (token.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 401 });
  }

  try {
    const { email, name, tags, source } = await req.json();
    
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const existing = await NewsletterSubscriber.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: 'Email already subscribed' }, { status: 400 });
    }

    const subscriber = await NewsletterSubscriber.create({
      email,
      name,
      tags: tags || [],
      source: source || 'admin'
    });

    return NextResponse.json(subscriber);
  } catch (error) {
    console.error('Error creating subscriber:', error);
    return NextResponse.json({ error: 'Failed to create subscriber' }, { status: 500 });
  }
} 
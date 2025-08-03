import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';
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

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  
  // Check admin authentication
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 401 });
  }
  
  const token = authHeader.substring(7);
  
  try {
    const decoded = verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any;
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Invalid admin session' }, { status: 401 });
  }

  try {
    const subscriber = await NewsletterSubscriber.findById(params.id);
    if (!subscriber) {
      return NextResponse.json({ error: 'Subscriber not found' }, { status: 404 });
    }

    subscriber.subscribed = !subscriber.subscribed;
    await subscriber.save();
    
    return NextResponse.json(subscriber);
  } catch (error) {
    console.error('Error toggling subscription:', error);
    return NextResponse.json({ error: 'Failed to toggle subscription' }, { status: 500 });
  }
} 
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import mongoose, { Schema, models, model } from 'mongoose';
import { requireAdmin } from '@/lib/adminAuth';

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

  const { errorResponse } = requireAdmin(req);
  if (errorResponse) {
    return errorResponse;
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
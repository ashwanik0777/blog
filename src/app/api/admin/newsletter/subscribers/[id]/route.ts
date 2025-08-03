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

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
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
    const subscriber = await NewsletterSubscriber.findByIdAndDelete(params.id);
    if (!subscriber) {
      return NextResponse.json({ error: 'Subscriber not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting subscriber:', error);
    return NextResponse.json({ error: 'Failed to delete subscriber' }, { status: 500 });
  }
}

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
    const updates = await req.json();
    const subscriber = await NewsletterSubscriber.findByIdAndUpdate(params.id, updates, { new: true });
    
    if (!subscriber) {
      return NextResponse.json({ error: 'Subscriber not found' }, { status: 404 });
    }
    
    return NextResponse.json(subscriber);
  } catch (error) {
    console.error('Error updating subscriber:', error);
    return NextResponse.json({ error: 'Failed to update subscriber' }, { status: 500 });
  }
} 
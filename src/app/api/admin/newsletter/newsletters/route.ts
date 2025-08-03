import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import mongoose, { Schema, models, model } from 'mongoose';

// Newsletter Schema
const NewsletterSchema = new Schema({
  subject: { type: String, required: true },
  content: { type: String, required: true },
  status: { type: String, enum: ['draft', 'scheduled', 'sent'], default: 'draft' },
  scheduledAt: { type: Date },
  sentAt: { type: Date },
  recipients: { type: Number, default: 0 },
  opened: { type: Number, default: 0 },
  clicked: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const Newsletter = models.Newsletter || model('Newsletter', NewsletterSchema);

export async function GET(req: Request) {
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
    const newsletters = await Newsletter.find()
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ newsletters });
  } catch (error) {
    console.error('Error fetching newsletters:', error);
    return NextResponse.json({ error: 'Failed to fetch newsletters' }, { status: 500 });
  }
}

export async function POST(req: Request) {
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
    const { subject, content, status, scheduledAt } = await req.json();
    
    if (!subject || !content) {
      return NextResponse.json({ error: 'Subject and content are required' }, { status: 400 });
    }

    const newsletter = await Newsletter.create({
      subject,
      content,
      status: status || 'draft',
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined
    });

    return NextResponse.json(newsletter);
  } catch (error) {
    console.error('Error creating newsletter:', error);
    return NextResponse.json({ error: 'Failed to create newsletter' }, { status: 500 });
  }
} 
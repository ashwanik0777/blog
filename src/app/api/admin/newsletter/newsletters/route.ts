import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import mongoose, { Schema, models, model } from 'mongoose';
import { requireAdmin } from '@/lib/adminAuth';

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

  const { errorResponse } = requireAdmin(req);
  if (errorResponse) {
    return errorResponse;
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

  const { errorResponse } = requireAdmin(req);
  if (errorResponse) {
    return errorResponse;
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
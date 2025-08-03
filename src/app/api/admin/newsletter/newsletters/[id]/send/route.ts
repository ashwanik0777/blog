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

export async function POST(req: Request, { params }: { params: { id: string } }) {
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
    const newsletter = await Newsletter.findById(params.id);
    if (!newsletter) {
      return NextResponse.json({ error: 'Newsletter not found' }, { status: 404 });
    }

    if (newsletter.status === 'sent') {
      return NextResponse.json({ error: 'Newsletter already sent' }, { status: 400 });
    }

    // Get active subscribers
    const subscribers = await NewsletterSubscriber.find({ subscribed: true });
    const recipientCount = subscribers.length;

    // Update newsletter status
    newsletter.status = 'sent';
    newsletter.sentAt = new Date();
    newsletter.recipients = recipientCount;
    await newsletter.save();

    // Update last email sent for subscribers
    await NewsletterSubscriber.updateMany(
      { subscribed: true },
      { lastEmailSent: new Date() }
    );

    // In a real application, you would send emails here
    // For now, we'll just simulate the sending process
    console.log(`Newsletter "${newsletter.subject}" sent to ${recipientCount} subscribers`);

    return NextResponse.json(newsletter);
  } catch (error) {
    console.error('Error sending newsletter:', error);
    return NextResponse.json({ error: 'Failed to send newsletter' }, { status: 500 });
  }
} 
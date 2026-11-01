import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Newsletter from '@/models/Newsletter';
import NewsletterSubscriber from '@/models/NewsletterSubscriber';
import { requirePermission } from '@/lib/adminAuth';
import { badRequest, cleanString, cleanStringArray, normalizeEmail, readJsonBody, serverError } from '@/lib/security';

/**
 * The public signup form used to save emails into the campaigns collection
 * (both models were registered as "Newsletter"). Move any such records into
 * the subscribers collection. Idempotent and cheap once the data is clean.
 */
async function migrateMisplacedSubscribers() {
  const misplaced = await Newsletter.collection
    .find({ email: { $exists: true }, subject: { $exists: false } })
    .limit(1000)
    .toArray();
  if (!misplaced.length) return;

  for (const doc of misplaced) {
    const email = normalizeEmail(doc.email);
    if (email) {
      await NewsletterSubscriber.updateOne(
        { email },
        { $setOnInsert: { email, subscribed: true, subscribedAt: doc.subscribedAt || new Date(), source: 'website' } },
        { upsert: true }
      );
    }
    await Newsletter.collection.deleteOne({ _id: doc._id });
  }
}

export async function GET(req: Request) {
  try {
    const { errorResponse } = await requirePermission(req, 'manage_newsletter');
    if (errorResponse) return errorResponse;

    await dbConnect();
    await migrateMisplacedSubscribers();
    const subscribers = await NewsletterSubscriber.find().sort({ subscribedAt: -1 }).limit(5000).lean();

    return NextResponse.json({ subscribers }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return serverError('Error fetching subscribers', error, 'Failed to fetch subscribers');
  }
}

export async function POST(req: Request) {
  try {
    const { errorResponse } = await requirePermission(req, 'manage_newsletter');
    if (errorResponse) return errorResponse;

    const body = await readJsonBody(req, 8 * 1024);
    if (!body) return badRequest();

    const email = normalizeEmail(body.email);
    if (!email) return badRequest('Invalid email');

    await dbConnect();
    if (await NewsletterSubscriber.exists({ email })) {
      return badRequest('Email already subscribed');
    }

    const subscriber = await NewsletterSubscriber.create({
      email,
      name: cleanString(body.name, 100) || undefined,
      tags: cleanStringArray(body.tags, 10, 50),
      source: cleanString(body.source, 50) || 'admin',
    });

    return NextResponse.json(subscriber);
  } catch (error) {
    return serverError('Error creating subscriber', error, 'Failed to create subscriber');
  }
}

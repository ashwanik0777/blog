import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import NewsletterSubscriber from '@/models/NewsletterSubscriber';
import { badRequest, cleanString, limitRequest, normalizeEmail, readJsonBody, serverError } from '@/lib/security';

export async function POST(req: Request) {
  try {
    const limited = limitRequest(req, 'newsletter', 5, 15 * 60 * 1000);
    if (limited) return limited;

    const body = await readJsonBody(req, 4 * 1024);
    if (!body) return badRequest();

    if (cleanString(body.website, 200)) return NextResponse.json({ success: true });

    const email = normalizeEmail(body.email);
    if (!email) return badRequest('Please enter a valid email address');

    await dbConnect();
    const existing = await NewsletterSubscriber.findOne({ email }).select('subscribed');
    if (existing) {
      if (!existing.subscribed) {
        existing.subscribed = true;
        await existing.save();
      }
      return NextResponse.json({ success: true, message: "You're already on the list — thanks!" });
    }

    await NewsletterSubscriber.create({ email, source: 'website' });
    return NextResponse.json({ success: true, message: "You're subscribed! Welcome aboard." });
  } catch (error) {
    return serverError('Newsletter subscribe error', error, 'Subscription failed, please try again');
  }
}

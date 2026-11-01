import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import NewsletterSubscriber from '@/models/NewsletterSubscriber';
import { verifyUnsubscribeToken } from '@/lib/email';
import { cleanString, limitRequest, normalizeEmail, serverError } from '@/lib/security';

// Handles both the confirmation form on /unsubscribe and RFC 8058 one-click
// requests from mail providers. Authorised by the signed token, not a cookie.
export async function POST(req: Request) {
  try {
    const limited = limitRequest(req, 'unsubscribe', 20, 15 * 60 * 1000);
    if (limited) return limited;

    const url = new URL(req.url);
    let email = url.searchParams.get('email') || '';
    let token = url.searchParams.get('token') || '';
    const fromForm = (req.headers.get('content-type') || '').includes('application/x-www-form-urlencoded');

    if (fromForm) {
      const form = await req.formData().catch(() => null);
      email = String(form?.get('email') || email);
      token = String(form?.get('token') || token);
    }

    const normalized = normalizeEmail(email);
    const cleanToken = cleanString(token, 100);
    if (!normalized || !verifyUnsubscribeToken(normalized, cleanToken)) {
      return NextResponse.json({ error: 'Invalid unsubscribe link' }, { status: 400 });
    }

    await dbConnect();
    await NewsletterSubscriber.updateOne({ email: normalized }, { $set: { subscribed: false } });

    // Browser form submission → friendly page; mail provider → plain 200.
    if (fromForm && (req.headers.get('accept') || '').includes('text/html')) {
      return NextResponse.redirect(new URL('/unsubscribe?done=1', req.url), 303);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return serverError('Unsubscribe error', error);
  }
}

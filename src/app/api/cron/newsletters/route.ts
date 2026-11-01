import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import dbConnect from '@/lib/mongodb';
import Newsletter from '@/models/Newsletter';
import { isEmailConfigured } from '@/lib/email';
import { deliverNewsletter } from '@/lib/newsletter';
import { serverError } from '@/lib/security';

export const maxDuration = 60;

function authorized(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(req.headers.get('authorization') || '');
  return expected.length === received.length && timingSafeEqual(expected, received);
}

// Called by the scheduler (vercel.json cron) to deliver scheduled newsletters.
export async function GET(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!isEmailConfigured()) return NextResponse.json({ skipped: 'Email provider not configured' });

  try {
    await dbConnect();
    const due = await Newsletter.find({ status: 'scheduled', scheduledAt: { $lte: new Date() } }).select('_id').limit(5).lean();
    const results = [];
    for (const item of due) {
      const result = await deliverNewsletter(String(item._id));
      results.push({ id: String(item._id), ok: result.ok, sent: result.ok ? result.sent : 0 });
    }
    return NextResponse.json({ processed: results.length, results });
  } catch (error) {
    return serverError('Newsletter cron error', error);
  }
}

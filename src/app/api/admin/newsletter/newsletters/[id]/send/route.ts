import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { requirePermission } from '@/lib/adminAuth';
import { isEmailConfigured } from '@/lib/email';
import { deliverNewsletter } from '@/lib/newsletter';
import { badRequest, isObjectId, limitRequest, serverError } from '@/lib/security';

export const maxDuration = 60;

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, errorResponse } = await requirePermission(req, 'manage_newsletter');
    if (errorResponse || !user) return errorResponse;

    const limited = limitRequest(req, 'newsletter-send', 5, 10 * 60 * 1000, user.id);
    if (limited) return limited;

    const { id } = await params;
    if (!isObjectId(id)) return badRequest('Invalid ID');

    if (!isEmailConfigured()) {
      return NextResponse.json(
        { error: 'Email sending is not configured. Add RESEND_API_KEY and NEWSLETTER_FROM_EMAIL to .env and redeploy.' },
        { status: 503 }
      );
    }

    await dbConnect();
    const result = await deliverNewsletter(id);
    if (!result.ok) return badRequest(result.reason);

    return NextResponse.json({
      ...result.newsletter.toObject(),
      delivery: { sent: result.sent, failed: result.failed, errors: result.errors },
    });
  } catch (error) {
    return serverError('Error sending newsletter', error, 'Failed to send newsletter');
  }
}

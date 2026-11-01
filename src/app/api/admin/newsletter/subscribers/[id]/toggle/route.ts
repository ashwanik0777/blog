import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import NewsletterSubscriber from '@/models/NewsletterSubscriber';
import { requirePermission } from '@/lib/adminAuth';
import { badRequest, isObjectId, serverError } from '@/lib/security';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { errorResponse } = await requirePermission(req, 'manage_newsletter');
    if (errorResponse) return errorResponse;

    const { id } = await params;
    if (!isObjectId(id)) return badRequest('Invalid ID');

    await dbConnect();
    const subscriber = await NewsletterSubscriber.findById(id);
    if (!subscriber) {
      return NextResponse.json({ error: 'Subscriber not found' }, { status: 404 });
    }

    subscriber.subscribed = !subscriber.subscribed;
    await subscriber.save();
    return NextResponse.json(subscriber);
  } catch (error) {
    return serverError('Error toggling subscription', error, 'Failed to toggle subscription');
  }
}

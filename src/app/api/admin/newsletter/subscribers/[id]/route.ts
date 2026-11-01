import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import NewsletterSubscriber from '@/models/NewsletterSubscriber';
import { requirePermission } from '@/lib/adminAuth';
import { badRequest, cleanString, cleanStringArray, isObjectId, readJsonBody, serverError } from '@/lib/security';

type RouteContext = { params: Promise<{ id: string }> };
const notFound = () => NextResponse.json({ error: 'Subscriber not found' }, { status: 404 });

export async function DELETE(req: Request, { params }: RouteContext) {
  try {
    const { errorResponse } = await requirePermission(req, 'manage_newsletter');
    if (errorResponse) return errorResponse;

    const { id } = await params;
    if (!isObjectId(id)) return badRequest('Invalid ID');

    await dbConnect();
    const subscriber = await NewsletterSubscriber.findByIdAndDelete(id);
    if (!subscriber) return notFound();
    return NextResponse.json({ success: true });
  } catch (error) {
    return serverError('Error deleting subscriber', error, 'Failed to delete subscriber');
  }
}

export async function PATCH(req: Request, { params }: RouteContext) {
  try {
    const { errorResponse } = await requirePermission(req, 'manage_newsletter');
    if (errorResponse) return errorResponse;

    const { id } = await params;
    if (!isObjectId(id)) return badRequest('Invalid ID');

    const body = await readJsonBody(req, 8 * 1024);
    if (!body) return badRequest();

    const updates: Record<string, unknown> = {};
    if ('name' in body) updates.name = cleanString(body.name, 100);
    if ('tags' in body) updates.tags = cleanStringArray(body.tags, 10, 50);
    if (typeof body.subscribed === 'boolean') updates.subscribed = body.subscribed;
    if (!Object.keys(updates).length) return badRequest('No valid fields to update');

    await dbConnect();
    const subscriber = await NewsletterSubscriber.findByIdAndUpdate(id, { $set: updates }, { new: true });
    if (!subscriber) return notFound();
    return NextResponse.json(subscriber);
  } catch (error) {
    return serverError('Error updating subscriber', error, 'Failed to update subscriber');
  }
}

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Comment from '@/models/Comment';
import { requirePermission } from '@/lib/adminAuth';
import { badRequest, cleanString, isObjectId, readJsonBody, serverError } from '@/lib/security';

const STATUSES = ['pending', 'approved', 'flagged', 'rejected'];

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { errorResponse } = await requirePermission(req, 'manage_blogs');
  if (errorResponse) return errorResponse;

  const { id } = await params;
  if (!isObjectId(id)) return badRequest('Invalid ID');

  const body = await readJsonBody(req, 8 * 1024);
  if (!body) return badRequest();

  const updates: Record<string, unknown> = {};
  if (typeof body.status === 'string' && STATUSES.includes(body.status)) updates.status = body.status;
  if ('moderationNotes' in body) updates.moderationNotes = cleanString(body.moderationNotes, 1000);
  if (!Object.keys(updates).length) return badRequest('No valid fields to update');

  try {
    await dbConnect();
    const comment = await Comment.findByIdAndUpdate(id, { $set: updates }, { new: true });
    if (!comment) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(comment);
  } catch (error) {
    return serverError('Comment update error', error);
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { errorResponse } = await requirePermission(req, 'manage_blogs');
  if (errorResponse) return errorResponse;

  const { id } = await params;
  if (!isObjectId(id)) return badRequest('Invalid ID');

  try {
    await dbConnect();
    await Comment.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return serverError('Comment delete error', error);
  }
}

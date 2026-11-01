import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Issue from '@/models/Issue';
import { requirePermission } from '@/lib/adminAuth';
import { badRequest, cleanString, isObjectId, readJsonBody, serverError } from '@/lib/security';

const STATUSES = ['pending', 'resolved', 'closed'];

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, errorResponse } = await requirePermission(req, 'manage_issues');
    if (errorResponse || !user) return errorResponse;

    const { id } = await params;
    if (!isObjectId(id)) return badRequest('Invalid ID');

    const body = await readJsonBody(req, 16 * 1024);
    if (!body) return badRequest();

    const updateData: Record<string, unknown> = {};
    if (typeof body.status === 'string') {
      if (!STATUSES.includes(body.status)) return badRequest('Invalid status');
      updateData.status = body.status;
      if (body.status === 'resolved' || body.status === 'closed') {
        updateData.resolvedAt = new Date();
        updateData.resolvedBy = user.id;
      }
    }
    if (body.adminNotes !== undefined) updateData.adminNotes = cleanString(body.adminNotes, 5000);
    if (!Object.keys(updateData).length) return badRequest('No valid fields to update');

    await dbConnect();
    const issue = await Issue.findByIdAndUpdate(id, { $set: updateData }, { new: true }).populate('resolvedBy', 'name email');
    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, issue });
  } catch (error) {
    return serverError('Issue update error', error, 'Failed to update issue');
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { errorResponse } = await requirePermission(req, 'manage_issues');
    if (errorResponse) return errorResponse;

    const { id } = await params;
    if (!isObjectId(id)) return badRequest('Invalid ID');

    await dbConnect();
    await Issue.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return serverError('Issue delete error', error, 'Failed to delete issue');
  }
}

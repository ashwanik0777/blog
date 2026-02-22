import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Issue from '@/models/Issue';
import { requireAdmin } from '@/lib/adminAuth';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, errorResponse } = requireAdmin(req);
    if (errorResponse || !user) {
      return errorResponse || NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await dbConnect();
    const { id } = await params;
    const { status, adminNotes } = await req.json();

    const updateData: any = {};
    if (status) updateData.status = status;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    if (status === 'resolved' || status === 'closed') {
      updateData.resolvedAt = new Date();
      updateData.resolvedBy = user.id;
    }

    const issue = await Issue.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('resolvedBy', 'name email');

    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, issue });
  } catch (error: any) {
    console.error('Issue update error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to update issue' 
    }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { errorResponse } = requireAdmin(req);
    if (errorResponse) {
      return errorResponse;
    }

    await dbConnect();
    const { id } = await params;
    await Issue.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Issue delete error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to delete issue' 
    }, { status: 500 });
  }
}


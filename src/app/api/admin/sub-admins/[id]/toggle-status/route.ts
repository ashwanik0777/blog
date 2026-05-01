import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { requireAdmin } from '@/lib/adminAuth';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { errorResponse } = requireAdmin(req);
    if (errorResponse) return errorResponse;

    await dbConnect();

    // Check if user exists
    const existingUser = await User.findById(params.id);
    if (!existingUser) {
      return NextResponse.json({ error: 'Sub-admin not found' }, { status: 404 });
    }

    // Toggle disabled status
    const updatedUser = await User.findByIdAndUpdate(
      params.id,
      { disabled: !existingUser.disabled },
      { new: true }
    ).select('-password');

    // Add status field for frontend
    const userWithStatus = {
      ...updatedUser.toObject(),
      status: updatedUser.disabled ? 'inactive' : 'active'
    };

    return NextResponse.json(userWithStatus);
  } catch (error) {
    console.error('Error toggling sub-admin status:', error);
    return NextResponse.json({ error: 'Failed to toggle sub-admin status' }, { status: 500 });
  }
} 
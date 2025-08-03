import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin-token');

    if (!token) {
      return NextResponse.json({ error: 'No session' }, { status: 401 });
    }

    const decoded = verify(token.value, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any;
    
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

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
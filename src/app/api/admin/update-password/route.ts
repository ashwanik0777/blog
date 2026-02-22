import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { requireAdmin } from '@/lib/adminAuth';

export async function POST(req: Request) {
  try {
    const { user, errorResponse } = requireAdmin(req);
    if (errorResponse || !user) {
      return errorResponse || NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await dbConnect();
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current and new password required' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 });
    }

    const adminUser = await User.findById(user.id);
    if (!adminUser || !adminUser.password) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, adminUser.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
    }

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    adminUser.password = hashedPassword;
    await adminUser.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Password updated successfully' 
    });
  } catch (error: any) {
    console.error('Password update error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to update password' 
    }, { status: 500 });
  }
}


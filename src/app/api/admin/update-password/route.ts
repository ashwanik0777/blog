import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { createAdminSessionToken, requireStaff, setAdminSessionCookie } from '@/lib/adminAuth';
import { badRequest, cleanString, limitRequest, readJsonBody, serverError } from '@/lib/security';

export async function POST(req: Request) {
  try {
    const { user, errorResponse } = await requireStaff(req);
    if (errorResponse || !user) return errorResponse;

    const limited = limitRequest(req, 'update-password', 5, 15 * 60 * 1000, user.id);
    if (limited) return limited;

    const body = await readJsonBody(req, 4 * 1024);
    if (!body) return badRequest();

    const currentPassword = cleanString(body.currentPassword, 200);
    const newPassword = cleanString(body.newPassword, 200);

    if (!currentPassword || !newPassword) {
      return badRequest('Current and new password required');
    }
    if (newPassword.length < 8) {
      return badRequest('New password must be at least 8 characters');
    }
    if (newPassword === currentPassword) {
      return badRequest('New password must be different from the current password');
    }

    await dbConnect();
    const staffUser = await User.findById(user.id);
    if (!staffUser || !staffUser.password) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isValid = await bcrypt.compare(currentPassword, staffUser.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
    }

    staffUser.password = await bcrypt.hash(newPassword, 12);
    staffUser.passwordChangedAt = new Date();
    await staffUser.save();

    // Every other session is now invalid; keep this browser signed in with a fresh token.
    const response = NextResponse.json({
      success: true,
      message: 'Password updated. You have been signed out on all other devices.',
    });
    setAdminSessionCookie(
      response,
      createAdminSessionToken({ id: user.id, email: user.email, name: user.name, role: user.role })
    );
    return response;
  } catch (error) {
    return serverError('Password update error', error, 'Failed to update password');
  }
}

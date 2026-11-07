import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { requireAdmin, sanitizePermissions } from '@/lib/adminAuth';
import { badRequest, cleanString, isObjectId, normalizeEmail, readJsonBody, serverError } from '@/lib/security';

const STAFF_ROLES = ['sub-admin', 'editor'];

type StaffInput = {
  name: string;
  email: string;
  password: string;
  role: string;
  permissions: string[];
};

function parseStaffInput(body: Record<string, unknown>, requirePassword: boolean): StaffInput | string {
  const name = cleanString(body.name, 80);
  const email = normalizeEmail(body.email);
  const password = cleanString(body.password, 200);
  const role = cleanString(body.role, 20);

  if (!name || !role) return 'Missing required fields';
  if (!email) return 'Please enter a valid email address';
  if (!STAFF_ROLES.includes(role)) return 'Invalid role';
  if (requirePassword && !password) return 'Password is required';
  if (password && password.length < 8) return 'Password must be at least 8 characters';

  return { name, email, password, role, permissions: sanitizePermissions(body.permissions) };
}

export async function listStaff(req: Request, onlyStaffRoles: boolean) {
  try {
    const { user, errorResponse } = await requireAdmin(req);
    if (errorResponse || !user) return { errorResponse };

    await dbConnect();
    const filter = onlyStaffRoles ? { role: { $in: STAFF_ROLES }, _id: { $ne: user.id } } : {};
    const users = await User.find(filter).select('-password').sort({ createdAt: -1 }).limit(500).lean();
    return { users };
  } catch (error) {
    return { errorResponse: serverError('Error fetching staff', error, 'Failed to fetch users') };
  }
}

export async function createStaff(req: Request) {
  try {
    const { errorResponse } = await requireAdmin(req);
    if (errorResponse) return errorResponse;

    const body = await readJsonBody(req, 8 * 1024);
    if (!body) return badRequest();
    const input = parseStaffInput(body, true);
    if (typeof input === 'string') return badRequest(input);

    await dbConnect();
    if (await User.exists({ email: input.email })) {
      return badRequest('User with this email already exists');
    }

    const user = await User.create({
      name: input.name,
      email: input.email,
      password: await bcrypt.hash(input.password, 12),
      role: input.role,
      permissions: input.permissions,
      disabled: false,
    });

    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    return serverError('Error creating staff user', error, 'Failed to create user');
  }
}

async function loadEditableTarget(req: Request, id: string) {
  const { user, errorResponse } = await requireAdmin(req);
  if (errorResponse || !user) return { error: errorResponse };
  if (!isObjectId(id)) return { error: badRequest('Invalid ID') };

  await dbConnect();
  const target = await User.findById(id);
  if (!target) return { error: NextResponse.json({ error: 'User not found' }, { status: 404 }) };
  // The main admin account can only be managed from its own settings page.
  if (target.role === 'admin' || String(target._id) === user.id) {
    return { error: NextResponse.json({ error: 'Admin accounts cannot be modified here' }, { status: 403 }) };
  }
  return { target };
}

export async function updateStaff(req: Request, id: string) {
  try {
    const { target, error } = await loadEditableTarget(req, id);
    if (error || !target) return error;

    const body = await readJsonBody(req, 8 * 1024);
    if (!body) return badRequest();
    const input = parseStaffInput(body, false);
    if (typeof input === 'string') return badRequest(input);

    if (await User.exists({ email: input.email, _id: { $ne: target._id } })) {
      return badRequest('Email already taken');
    }

    const updateData: Record<string, unknown> = {
      name: input.name,
      email: input.email,
      role: input.role,
      permissions: input.permissions,
    };
    if (input.password) {
      updateData.password = await bcrypt.hash(input.password, 12);
      updateData.passwordChangedAt = new Date();
    }

    const updatedUser = await User.findByIdAndUpdate(target._id, { $set: updateData }, { new: true }).select('-password');
    return NextResponse.json(updatedUser);
  } catch (error) {
    return serverError('Error updating staff user', error, 'Failed to update user');
  }
}

export async function deleteStaff(req: Request, id: string) {
  try {
    const { target, error } = await loadEditableTarget(req, id);
    if (error || !target) return error;

    await User.findByIdAndDelete(target._id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return serverError('Error deleting staff user', error, 'Failed to delete user');
  }
}

export async function toggleStaffStatus(req: Request, id: string) {
  try {
    const { target, error } = await loadEditableTarget(req, id);
    if (error || !target) return error;

    target.disabled = !target.disabled;
    await target.save();

    const user = target.toObject();
    delete user.password;
    return NextResponse.json({ ...user, status: target.disabled ? 'inactive' : 'active' });
  } catch (error) {
    return serverError('Error toggling staff status', error, 'Failed to toggle user status');
  }
}

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { requireAdmin } from '@/lib/adminAuth';

export async function GET(req: Request) {
  try {
    const { user, errorResponse } = requireAdmin(req);
    if (errorResponse) return errorResponse;

    await dbConnect();
    
    // Get all sub-admins (users with role 'sub-admin' or 'admin')
    const subAdmins = await User.find({
      role: { $in: ['sub-admin', 'editor'] },
      email: { $ne: user?.email }
    }).select('-password');

    return NextResponse.json({ subAdmins });
  } catch (error) {
    console.error('Error fetching sub-admins:', error);
    return NextResponse.json({ error: 'Failed to fetch sub-admins' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { errorResponse } = requireAdmin(req);
    if (errorResponse) return errorResponse;

    const { name, email, password, role, permissions } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['sub-admin', 'editor'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new sub-admin
    const subAdmin = new User({
      name,
      email,
      password: hashedPassword,
      role,
      permissions: permissions || [],
      disabled: false
    });

    await subAdmin.save();

    // Return user without password
    const { password: _, ...userWithoutPassword } = subAdmin.toObject();

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Error creating sub-admin:', error);
    return NextResponse.json({ error: 'Failed to create sub-admin' }, { status: 500 });
  }
} 
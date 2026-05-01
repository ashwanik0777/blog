import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { createAdminSessionToken } from '@/lib/adminAuth';
import { setAdminSessionCookie } from '@/lib/adminAuth';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@in.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin';
    const normalizedEmail = String(email).toLowerCase();

    await dbConnect();

    let staffUser = await User.findOne({
      email: normalizedEmail,
      role: { $in: ['admin', 'sub-admin', 'editor'] },
    }).select('_id name email password role permissions disabled');

    if (staffUser) {
      if (staffUser.disabled) {
        return NextResponse.json({ error: 'Account disabled' }, { status: 403 });
      }

      if (!staffUser.password) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }

      const isValid = await bcrypt.compare(password, staffUser.password);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }
    } else {
      if (normalizedEmail !== adminEmail.toLowerCase() || password !== adminPassword) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }

      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      staffUser = await User.create({
        name: process.env.ADMIN_NAME || 'Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        permissions: [
          'manage_blogs',
          'manage_users',
          'manage_newsletter',
          'view_analytics',
          'ai_content_generation',
          'manage_settings',
          'manage_issues',
        ],
        emailVerified: new Date(),
        disabled: false,
      });
    }

    const token = createAdminSessionToken({
      id: String(staffUser._id),
      email: staffUser.email,
      name: staffUser.name,
      role: staffUser.role,
      permissions: staffUser.permissions || [],
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: String(staffUser._id),
        email: staffUser.email,
        name: staffUser.name,
        role: staffUser.role,
        permissions: staffUser.permissions || [],
      },
    });

    setAdminSessionCookie(response, token);
    return response;
  } catch (error) {
    console.error('Signin check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
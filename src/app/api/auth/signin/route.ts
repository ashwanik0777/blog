import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { createAdminSessionToken, setAdminSessionCookie } from '@/lib/adminAuth';

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

    let adminUser = await User.findOne({ email: normalizedEmail, role: 'admin' }).select('_id name email password role');

    if (adminUser?.password) {
      const isValid = await bcrypt.compare(password, adminUser.password);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }
    } else {
      if (normalizedEmail !== adminEmail.toLowerCase() || password !== adminPassword) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }

      if (!adminUser) {
        const hashedPassword = await bcrypt.hash(adminPassword, 12);
        adminUser = await User.create({
          name: process.env.ADMIN_NAME || 'Admin',
          email: adminEmail,
          password: hashedPassword,
          role: 'admin',
          emailVerified: new Date(),
          disabled: false,
        });
      }
    }

    const token = createAdminSessionToken({
      id: String(adminUser._id),
      email: adminUser.email,
      name: adminUser.name,
      role: 'admin',
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: String(adminUser._id),
        email: adminUser.email,
        name: adminUser.name,
        role: 'admin',
      },
    });

    setAdminSessionCookie(response, token);
    return response;
  } catch (error) {
    console.error('Signin check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
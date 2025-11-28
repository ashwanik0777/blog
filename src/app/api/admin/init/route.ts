import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    // Check if admin already exists
    let admin = await User.findOne({ email, role: 'admin' });

    if (admin) {
      // Update password if provided
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 12);
        admin.password = hashedPassword;
        if (name) admin.name = name;
        await admin.save();
        return NextResponse.json({ 
          success: true, 
          message: 'Admin user updated successfully',
          email: admin.email 
        });
      }
      return NextResponse.json({ 
        success: true, 
        message: 'Admin user already exists',
        email: admin.email 
      });
    }

    // Create new admin user
    const hashedPassword = await bcrypt.hash(password, 12);
    admin = await User.create({
      name: name || 'Admin User',
      email,
      password: hashedPassword,
      role: 'admin',
      emailVerified: new Date(),
      disabled: false,
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Admin user created successfully',
      email: admin.email 
    });
  } catch (error: any) {
    console.error('Init admin error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to initialize admin user' 
    }, { status: 500 });
  }
}


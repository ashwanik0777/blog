import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    await dbConnect();
    
    const adminAccounts = [
      {
        name: 'Admin User',
        email: process.env.ADMIN_EMAIL || 'admin@example.com',
        password: process.env.ADMIN_PASSWORD || 'admin123',
        role: 'admin'
      },
      {
        name: 'Super Admin',
        email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@example.com',
        password: process.env.SUPER_ADMIN_PASSWORD || 'superadmin123',
        role: 'admin'
      }
    ];

    const createdAdmins = [];

    for (const account of adminAccounts) {
      // Check if admin already exists
      const existingAdmin = await User.findOne({ email: account.email });
      if (existingAdmin) {
        createdAdmins.push({
          email: existingAdmin.email,
          role: existingAdmin.role,
          status: 'already exists'
        });
        continue;
      }

      // Create admin user
      const hashedPassword = await bcrypt.hash(account.password, 12);
      
      const adminUser = new User({
        name: account.name,
        email: account.email,
        password: hashedPassword,
        role: account.role,
        disabled: false
      });

      await adminUser.save();
      createdAdmins.push({
        email: adminUser.email,
        role: adminUser.role,
        status: 'created'
      });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Admin users processed',
      admins: createdAdmins
    });
  } catch (error) {
    console.error('Error creating admin:', error);
    return NextResponse.json({ error: 'Failed to create admin user' }, { status: 500 });
  }
} 
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Blog from '@/models/Blog';
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

    // Check blog count
    const blogCount = await Blog.countDocuments();

    return NextResponse.json({ 
      success: true, 
      message: 'Admin user created successfully',
      email: admin.email,
      blogCount 
    });
  } catch (error: any) {
    console.error('Setup error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to setup admin user' 
    }, { status: 500 });
  }
}

// Auto-create admin on GET if doesn't exist
export async function GET(req: Request) {
  try {
    await dbConnect();
    
    // Check if admin exists
    let admin = await User.findOne({ email: 'admin@in.com', role: 'admin' });
    
    if (!admin) {
      // Create default admin
      const hashedPassword = await bcrypt.hash('admin', 12);
      admin = await User.create({
        name: 'Admin',
        email: 'admin@in.com',
        password: hashedPassword,
        role: 'admin',
        emailVerified: new Date(),
        disabled: false,
      });
      return NextResponse.json({ 
        success: true, 
        message: 'Default admin created',
        email: admin.email 
      });
    } else {
      // Update password to ensure it's correct
      const hashedPassword = await bcrypt.hash('admin', 12);
      admin.password = hashedPassword;
      await admin.save();
      return NextResponse.json({ 
        success: true, 
        message: 'Admin credentials synced',
        email: admin.email 
      });
    }
  } catch (error: any) {
    console.error('Auto-setup error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to setup admin' 
    }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    await dbConnect();
    const blogCount = await Blog.countDocuments({ published: true });
    const adminCount = await User.countDocuments({ role: 'admin' });
    
    return NextResponse.json({ 
      blogCount,
      adminCount,
      database: 'Blog'
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message || 'Failed to check setup' 
    }, { status: 500 });
  }
}


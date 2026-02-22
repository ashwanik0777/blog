import { NextResponse } from 'next/server';
import { getAdminSessionFromRequest } from '@/lib/adminAuth';

export async function GET(req: Request) {
  try {
    const user = getAdminSessionFromRequest(req);

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'No session' }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        image: null,
      }
    });
  } catch (error) {
    console.error('Admin session error:', error);
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }
} 
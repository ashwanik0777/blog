import { NextResponse } from 'next/server';
import { getAdminSessionFromRequest } from '@/lib/adminAuth';

export async function GET(req: Request) {
  try {
    const user = getAdminSessionFromRequest(req);

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      image: null,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
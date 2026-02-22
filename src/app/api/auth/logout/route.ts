import { NextResponse } from 'next/server';
import { clearAdminSessionCookie } from '@/lib/adminAuth';

export async function POST(req: Request) {
  try {
    const response = NextResponse.json({ success: true });

    clearAdminSessionCookie(response);

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
} 
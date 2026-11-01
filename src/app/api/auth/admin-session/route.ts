import { NextResponse } from 'next/server';
import { getVerifiedStaff } from '@/lib/adminAuth';

export async function GET(req: Request) {
  try {
    const user = await getVerifiedStaff(req);

    if (!user) {
      return NextResponse.json({ error: 'No session' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
    }

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          permissions: user.permissions || [],
          name: user.name,
          image: null,
        },
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('Admin session error:', error);
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }
}

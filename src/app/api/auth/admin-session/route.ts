import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'No session' }, { status: 401 });
    }

    const userRole = (session.user as any).role;

    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    return NextResponse.json({
      user: {
        id: session.user.id || session.user.email,
        email: session.user.email,
        role: userRole,
        name: session.user.name,
        image: session.user.image
      }
    });
  } catch (error) {
    console.error('Admin session error:', error);
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }
} 
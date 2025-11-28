import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (session?.user) {
      return NextResponse.json({ 
        success: true, 
        role: (session.user as any).role,
        name: session.user.name,
        email: session.user.email
      });
    }

    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  } catch (error) {
    console.error('Signin check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
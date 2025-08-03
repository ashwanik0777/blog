import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin-token');

    if (!token) {
      return NextResponse.json({ error: 'No session' }, { status: 401 });
    }

    const decoded = verify(token.value, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any;
    
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Return current settings from environment variables
    return NextResponse.json({
      enableChatbot: process.env.ENABLE_CHATBOT === 'true',
      enableAIGeneration: process.env.ENABLE_AI_GENERATION === 'true',
      enableComments: process.env.ENABLE_COMMENTS === 'true',
      enableNewsletter: process.env.ENABLE_NEWSLETTER === 'true',
      enableAnalytics: process.env.ENABLE_ANALYTICS === 'true',
      siteName: process.env.SITE_NAME || 'Gemini AI Blog',
      siteDescription: process.env.SITE_DESCRIPTION || 'AI-powered blog platform with Gemini integration'
    });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin-token');

    if (!token) {
      return NextResponse.json({ error: 'No session' }, { status: 401 });
    }

    const decoded = verify(token.value, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any;
    
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const settings = await req.json();

    // In a real application, you would save these to a database
    // For now, we'll just return success
    console.log('Settings to save:', settings);

    return NextResponse.json({ 
      success: true,
      message: 'Settings saved successfully',
      settings
    });
  } catch (error) {
    console.error('Settings error:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
} 
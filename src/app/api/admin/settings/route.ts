import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/mongodb';
import Settings from '@/models/Settings';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await dbConnect();

    // Get settings from database or create default
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = await Settings.create({
        chatbotEnabled: true,
        socialMedia: {},
        designBy: { name: '', portfolioUrl: '' },
        developedBy: { name: '', portfolioUrl: '' },
      });
    }

    return NextResponse.json({
      enableChatbot: settings.chatbotEnabled,
      enableAIGeneration: process.env.ENABLE_AI_GENERATION === 'true',
      enableComments: process.env.ENABLE_COMMENTS === 'true',
      enableNewsletter: process.env.ENABLE_NEWSLETTER === 'true',
      enableAnalytics: process.env.ENABLE_ANALYTICS === 'true',
      siteName: process.env.SITE_NAME || 'TechUpdatesZone Blog',
      siteDescription: process.env.SITE_DESCRIPTION || 'TechUpdatesZone Blog — AI-powered tech news, tutorials, and insights with Google Gemini integration.',
      socialMedia: settings.socialMedia || {},
      designBy: settings.designBy || { name: '', portfolioUrl: '' },
      developedBy: settings.developedBy || { name: '', portfolioUrl: '' },
    });
  } catch (error: any) {
    console.error('Settings GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await dbConnect();
    const data = await req.json();

    // Update or create settings
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = await Settings.create({
        chatbotEnabled: data.enableChatbot ?? true,
        socialMedia: data.socialMedia || {},
        designBy: data.designBy || { name: '', portfolioUrl: '' },
        developedBy: data.developedBy || { name: '', portfolioUrl: '' },
      });
    } else {
      settings.chatbotEnabled = data.enableChatbot ?? settings.chatbotEnabled;
      if (data.socialMedia) {
        settings.socialMedia = { ...settings.socialMedia, ...data.socialMedia };
      }
      if (data.designBy) {
        settings.designBy = { ...settings.designBy, ...data.designBy };
      }
      if (data.developedBy) {
        settings.developedBy = { ...settings.developedBy, ...data.developedBy };
      }
      await settings.save();
    }

    return NextResponse.json({ 
      success: true,
      message: 'Settings saved successfully',
      settings
    });
  } catch (error: any) {
    console.error('Settings POST error:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
} 
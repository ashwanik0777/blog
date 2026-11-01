import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/adminAuth';
import dbConnect from '@/lib/mongodb';
import Settings from '@/models/Settings';
import { badRequest, cleanString, readJsonBody, safeHttpUrl, serverError } from '@/lib/security';
import { revalidatePublicContent } from '@/lib/revalidate';

const SOCIAL_KEYS = ['twitter', 'facebook', 'linkedin', 'github', 'instagram', 'youtube'] as const;

function parseCredit(value: unknown) {
  const source = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return {
    name: cleanString(source.name, 80),
    portfolioUrl: safeHttpUrl(source.portfolioUrl, 500),
  };
}

export async function GET(req: Request) {
  try {
    const { errorResponse } = await requirePermission(req, 'manage_settings');
    if (errorResponse) return errorResponse;

    await dbConnect();
    const settings = await Settings.findOne().lean<{
      chatbotEnabled?: boolean;
      socialMedia?: Record<string, string>;
      designBy?: { name: string; portfolioUrl: string };
    }>();

    return NextResponse.json(
      {
        enableChatbot: settings?.chatbotEnabled !== false,
        enableAIGeneration: process.env.ENABLE_AI_GENERATION === 'true',
        enableComments: process.env.ENABLE_COMMENTS === 'true',
        enableNewsletter: process.env.ENABLE_NEWSLETTER === 'true',
        enableAnalytics: process.env.ENABLE_ANALYTICS === 'true',
        siteName: process.env.SITE_NAME || 'TechUpdatesZone Blog',
        siteDescription:
          process.env.SITE_DESCRIPTION ||
          'TechUpdatesZone Blog — AI-powered tech news, tutorials, and insights with Google Gemini integration.',
        socialMedia: settings?.socialMedia || {},
        designBy: settings?.designBy || { name: '', portfolioUrl: '' },
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    return serverError('Settings GET error', error, 'Failed to fetch settings');
  }
}

export async function POST(req: Request) {
  try {
    const { errorResponse } = await requirePermission(req, 'manage_settings');
    if (errorResponse) return errorResponse;

    const data = await readJsonBody(req, 16 * 1024);
    if (!data) return badRequest();

    const updates: Record<string, unknown> = {};
    if (typeof data.enableChatbot === 'boolean') updates.chatbotEnabled = data.enableChatbot;

    if (data.socialMedia && typeof data.socialMedia === 'object') {
      const social = data.socialMedia as Record<string, unknown>;
      for (const key of SOCIAL_KEYS) {
        if (key in social) {
          const raw = cleanString(social[key], 500);
          const url = safeHttpUrl(raw, 500);
          if (raw && !url) return badRequest(`${key} must be a valid http(s) URL`);
          updates[`socialMedia.${key}`] = url;
        }
      }
    }
    if (data.designBy) {
      const credit = parseCredit(data.designBy);
      updates['designBy.name'] = credit.name;
      updates['designBy.portfolioUrl'] = credit.portfolioUrl;
    }
    if (data.developedBy) {
      const credit = parseCredit(data.developedBy);
      updates['developedBy.name'] = credit.name;
      updates['developedBy.portfolioUrl'] = credit.portfolioUrl;
    }

    await dbConnect();
    const settings = await Settings.findOneAndUpdate({}, { $set: updates }, { new: true, upsert: true });

    revalidatePublicContent();
    return NextResponse.json({
      success: true,
      message: 'Settings saved successfully',
      settings,
    });
  } catch (error) {
    return serverError('Settings POST error', error, 'Failed to save settings');
  }
}

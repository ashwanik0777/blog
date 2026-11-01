import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Settings from '@/models/Settings';
import { requirePermission } from '@/lib/adminAuth';
import { badRequest, readJsonBody, serverError } from '@/lib/security';

export async function GET() {
  try {
    await dbConnect();
    const settings = await Settings.findOne().select('chatbotEnabled').lean<{ chatbotEnabled?: boolean }>();
    return NextResponse.json(
      { chatbotEnabled: settings?.chatbotEnabled !== false },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } }
    );
  } catch (error) {
    return serverError('Chatbot setting error', error);
  }
}

export async function POST(req: Request) {
  const { errorResponse } = await requirePermission(req, 'manage_settings');
  if (errorResponse) return errorResponse;

  const body = await readJsonBody(req, 2 * 1024);
  if (!body || typeof body.chatbotEnabled !== 'boolean') return badRequest('chatbotEnabled must be a boolean');

  try {
    await dbConnect();
    const settings = await Settings.findOneAndUpdate(
      {},
      { $set: { chatbotEnabled: body.chatbotEnabled } },
      { new: true, upsert: true }
    );
    return NextResponse.json({ chatbotEnabled: settings.chatbotEnabled });
  } catch (error) {
    return serverError('Chatbot setting update error', error);
  }
}

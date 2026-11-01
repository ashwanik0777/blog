import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Newsletter from '@/models/Newsletter';
import { requirePermission } from '@/lib/adminAuth';
import { badRequest, cleanString, readJsonBody, serverError } from '@/lib/security';

export async function GET(req: Request) {
  try {
    const { errorResponse } = await requirePermission(req, 'manage_newsletter');
    if (errorResponse) return errorResponse;

    await dbConnect();
    const newsletters = await Newsletter.find({ subject: { $exists: true } }).sort({ createdAt: -1 }).limit(500).lean();
    return NextResponse.json({ newsletters }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return serverError('Error fetching newsletters', error, 'Failed to fetch newsletters');
  }
}

export async function POST(req: Request) {
  try {
    const { errorResponse } = await requirePermission(req, 'manage_newsletter');
    if (errorResponse) return errorResponse;

    const body = await readJsonBody(req, 256 * 1024);
    if (!body) return badRequest();

    const subject = cleanString(body.subject, 200);
    const content = typeof body.content === 'string' ? body.content.slice(0, 100_000) : '';
    const status = body.status === 'scheduled' ? 'scheduled' : 'draft';
    const scheduledAt = typeof body.scheduledAt === 'string' ? new Date(body.scheduledAt) : null;

    if (!subject || !content.trim()) {
      return badRequest('Subject and content are required');
    }

    await dbConnect();
    const newsletter = await Newsletter.create({
      subject,
      content,
      status,
      scheduledAt: scheduledAt && !Number.isNaN(scheduledAt.getTime()) ? scheduledAt : undefined,
    });

    return NextResponse.json(newsletter);
  } catch (error) {
    return serverError('Error creating newsletter', error, 'Failed to create newsletter');
  }
}

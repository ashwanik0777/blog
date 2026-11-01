import { NextResponse } from 'next/server';
import type { UploadApiResponse } from 'cloudinary';
import { requirePermission } from '@/lib/adminAuth';
import { cloudinaryClient } from '@/lib/cloudinary';
import { badRequest, limitRequest, serverError } from '@/lib/security';

export const runtime = 'nodejs';

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
// SVG is intentionally excluded: it can carry scripts.
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

export async function POST(req: Request) {
  const { user, errorResponse } = await requirePermission(req, 'manage_blogs');
  if (errorResponse || !user) return errorResponse;

  const limited = limitRequest(req, 'upload', 30, 10 * 60 * 1000, user.id);
  if (limited) return limited;

  if (Number(req.headers.get('content-length') || 0) > MAX_UPLOAD_BYTES + 64 * 1024) {
    return NextResponse.json({ error: 'Image must be 5 MB or smaller' }, { status: 413 });
  }

  let file: FormDataEntryValue | null = null;
  try {
    file = (await req.formData()).get('file');
  } catch {
    return badRequest('Invalid upload');
  }
  if (!file || typeof file === 'string') return badRequest('No file uploaded');
  if (!ALLOWED_TYPES.includes(file.type)) return badRequest('Only JPG, PNG, WebP, GIF or AVIF images are allowed');
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: 'Image must be 5 MB or smaller' }, { status: 413 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  try {
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinaryClient.uploader.upload_stream(
        { resource_type: 'image', folder: 'blog', allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'] },
        (error, uploadResult) => {
          if (error || !uploadResult) {
            reject(error || new Error('Upload failed'));
            return;
          }
          resolve(uploadResult);
        }
      );
      stream.end(buffer);
    });

    return NextResponse.json({
      url: result.secure_url,
      bytes: result.bytes,
      width: result.width,
      height: result.height,
      format: result.format,
    });
  } catch (error) {
    return serverError('Image upload error', error, 'Upload failed');
  }
}

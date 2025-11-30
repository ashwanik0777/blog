import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import cloudinary from 'cloudinary';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const formData = await req.formData();
  const file = formData.get('file');
  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  try {
    const upload = await cloudinary.v2.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
      if (error || !result) throw error;
      return result;
    });
    upload.end(buffer);
    const result = await new Promise((resolve, reject) => {
      upload.on('finish', resolve);
      upload.on('error', reject);
    });
    // @ts-ignore
    return NextResponse.json({ url: result.secure_url });
  } catch (e) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
} 
import cloudinary from 'cloudinary';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const cloudinaryClient = cloudinary.v2;

export function isCloudinaryConfigured() {
  return Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
}

export function isCloudinaryUrl(url?: string) {
  if (!url) return false;
  try {
    return new URL(url).hostname === 'res.cloudinary.com';
  } catch {
    return false;
  }
}

/**
 * Copies a hotlinked image into our Cloudinary account. Cloudinary fetches the
 * URL on its side, so our servers never request arbitrary user-supplied URLs.
 */
export async function importRemoteImage(url: string) {
  const result = await cloudinaryClient.uploader.upload(url, {
    folder: 'blog',
    resource_type: 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'],
    timeout: 30_000,
  });
  return result.secure_url;
}

/** Returns a Cloudinary URL for external images, or the original URL if import is not possible. */
export async function ensureHostedImage(url?: string) {
  if (!url || isCloudinaryUrl(url) || !isCloudinaryConfigured()) return url;
  try {
    return await importRemoteImage(url);
  } catch (error) {
    console.warn('Featured image import failed, keeping original URL:', error);
    return url;
  }
}

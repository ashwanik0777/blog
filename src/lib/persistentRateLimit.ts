import dbConnect from '@/lib/mongodb';
import RateLimit from '@/models/RateLimit';
import { getClientIp, tooManyRequests } from '@/lib/security';

let indexesReady: Promise<unknown> | null = null;

/**
 * Rate limit shared by every server instance (stored in MongoDB), so it still
 * holds on serverless platforms where each instance has its own memory.
 * Fails open if the database is unreachable — the route itself will fail anyway.
 * Returns a 429 response when the caller exceeded the limit, otherwise null.
 */
export async function persistentLimit(req: Request, name: string, limit: number, windowMs: number, extraKey = '') {
  return persistentLimitByKey(`${name}:${getClientIp(req)}:${extraKey}`, limit, windowMs);
}

/** Same as persistentLimit, but for a caller-chosen key (e.g. an account email, regardless of IP). */
export async function persistentLimitByKey(rawKey: string, limit: number, windowMs: number) {
  const key = rawKey.slice(0, 300);
  try {
    await dbConnect();
    // autoIndex is off in production; make sure the TTL index exists once per instance.
    indexesReady ??= RateLimit.createIndexes().catch(() => (indexesReady = null));
    await indexesReady;

    const now = new Date();
    const current = await RateLimit.findOneAndUpdate(
      { _id: key, expiresAt: { $gt: now } },
      { $inc: { count: 1 } },
      { new: true }
    ).lean<{ count: number; expiresAt: Date }>();

    if (!current) {
      await RateLimit.updateOne(
        { _id: key },
        { $set: { count: 1, expiresAt: new Date(now.getTime() + windowMs) } },
        { upsert: true }
      );
      return null;
    }

    if (current.count > limit) {
      return tooManyRequests(Math.max(1, Math.ceil((new Date(current.expiresAt).getTime() - now.getTime()) / 1000)));
    }
    return null;
  } catch (error) {
    console.warn('Persistent rate limit unavailable:', error);
    return null;
  }
}

/** Read-only check: returns a 429 response if `key` already reached `limit`, without counting this call. */
export async function persistentPeekByKey(rawKey: string, limit: number) {
  try {
    await dbConnect();
    const current = await RateLimit.findOne({ _id: rawKey.slice(0, 300), expiresAt: { $gt: new Date() } })
      .select('count expiresAt')
      .lean<{ count: number; expiresAt: Date }>();
    if (current && current.count >= limit) {
      return tooManyRequests(Math.max(1, Math.ceil((new Date(current.expiresAt).getTime() - Date.now()) / 1000)));
    }
  } catch (error) {
    console.warn('Persistent rate limit unavailable:', error);
  }
  return null;
}

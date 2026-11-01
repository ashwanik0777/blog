import { NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// Rate limiting (in-memory, per server instance)
// For multi-instance / serverless deployments put a WAF or a shared store
// (e.g. Upstash Redis, Vercel Firewall rules) in front for DDoS protection.
// ---------------------------------------------------------------------------

type Bucket = { count: number; resetAt: number };

const globalStore = globalThis as unknown as { __rateLimitStore?: Map<string, Bucket> };
const store: Map<string, Bucket> = globalStore.__rateLimitStore ?? new Map();
globalStore.__rateLimitStore = store;

const MAX_BUCKETS = 50_000;

function sweep(now: number) {
  for (const [key, bucket] of store) {
    if (bucket.resetAt <= now) store.delete(key);
  }
  // Hard cap so a flood of unique keys can never exhaust memory.
  if (store.size > MAX_BUCKETS) store.clear();
}

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  if (store.size > MAX_BUCKETS / 2) sweep(now);

  const bucket = store.get(key);
  if (!bucket || bucket.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return { ok: false, retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) };
  }
  return { ok: true, retryAfter: 0 };
}

export function getClientIp(req: Request) {
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim().slice(0, 64);
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim().slice(0, 64);
  return 'unknown';
}

export function tooManyRequests(retryAfter: number) {
  return NextResponse.json(
    { error: 'Too many requests. Please slow down and try again shortly.' },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } }
  );
}

/** Returns a 429 response when the caller exceeded the limit, otherwise null. */
export function limitRequest(req: Request, name: string, limit: number, windowMs: number, extraKey = '') {
  const result = rateLimit(`${name}:${getClientIp(req)}:${extraKey}`, limit, windowMs);
  return result.ok ? null : tooManyRequests(result.retryAfter);
}

// ---------------------------------------------------------------------------
// Input handling — every value coming from the client is untrusted.
// Coercing to primitives blocks NoSQL operator injection such as {"$ne": null}.
// ---------------------------------------------------------------------------

export async function readJsonBody<T extends Record<string, unknown> = Record<string, unknown>>(
  req: Request,
  maxBytes = 64 * 1024
): Promise<T | null> {
  const declared = Number(req.headers.get('content-length') || 0);
  if (declared > maxBytes) return null;
  try {
    const text = await req.text();
    if (text.length > maxBytes) return null;
    const data = JSON.parse(text);
    if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
    return data as T;
  } catch {
    return null;
  }
}

export function badRequest(message = 'Invalid request') {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function cleanString(value: unknown, maxLength: number) {
  if (typeof value !== 'string') return '';
  // Strip ASCII control characters (keep tab / newline / carriage return).
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, maxLength);
}

export function cleanStringArray(value: unknown, maxItems: number, maxLength: number) {
  const items = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(',')
      : [];
  const result: string[] = [];
  for (const item of items) {
    const cleaned = cleanString(item, maxLength);
    if (cleaned && !result.includes(cleaned)) result.push(cleaned);
    if (result.length >= maxItems) break;
  }
  return result;
}

export function cleanBoolean(value: unknown, fallback = false) {
  return typeof value === 'boolean' ? value : fallback;
}

const EMAIL_PATTERN = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[a-z]{2,}$/i;

export function normalizeEmail(value: unknown) {
  const email = cleanString(value, 254).toLowerCase();
  return EMAIL_PATTERN.test(email) ? email : '';
}

export function isObjectId(value: unknown): value is string {
  return typeof value === 'string' && /^[a-f0-9]{24}$/i.test(value);
}

/** Only allows absolute http(s) URLs — blocks javascript:, data: and friends. */
export function safeHttpUrl(value: unknown, maxLength = 2048) {
  const raw = cleanString(value, maxLength);
  if (!raw) return '';
  try {
    const url = new URL(raw);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : '';
  } catch {
    return '';
  }
}

export function toSlug(text: string) {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 96);
}

export function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function serverError(context: string, error: unknown, message = 'Something went wrong') {
  console.error(`${context}:`, error);
  return NextResponse.json({ error: message }, { status: 500 });
}

import { createHmac, timingSafeEqual } from 'crypto';
import { Resend } from 'resend';
import { SITE_NAME, absoluteUrl } from '@/lib/site';

const BATCH_SIZE = 100; // Resend batch API limit

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.NEWSLETTER_FROM_EMAIL);
}

function signingSecret() {
  const secret = process.env.ADMIN_JWT_SECRET || process.env.NEXTAUTH_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === 'production') throw new Error('ADMIN_JWT_SECRET must be set in production');
  return 'dev-only-insecure-secret-change-me';
}

// ---------------------------------------------------------------------------
// Unsubscribe links are signed so nobody can unsubscribe other people.
// ---------------------------------------------------------------------------

export function unsubscribeToken(email: string) {
  return createHmac('sha256', signingSecret()).update(`unsubscribe:${email.toLowerCase()}`).digest('base64url');
}

export function verifyUnsubscribeToken(email: string, token: string) {
  const expected = Buffer.from(unsubscribeToken(email));
  const received = Buffer.from(token || '');
  return expected.length === received.length && timingSafeEqual(expected, received);
}

/** Human-facing confirmation page linked in the email footer. */
export function unsubscribeUrl(email: string) {
  const params = new URLSearchParams({ email, token: unsubscribeToken(email) });
  return absoluteUrl(`/unsubscribe?${params.toString()}`);
}

/** RFC 8058 one-click endpoint used in the List-Unsubscribe header (Gmail / Yahoo). */
export function oneClickUnsubscribeUrl(email: string) {
  const params = new URLSearchParams({ email, token: unsubscribeToken(email) });
  return absoluteUrl(`/api/newsletter/unsubscribe?${params.toString()}`);
}

// ---------------------------------------------------------------------------
// Minimal, safe Markdown → HTML for newsletters (everything is escaped first).
// Supports: # headings, **bold**, *italic*, `code`, [links](https://…), - lists.
// ---------------------------------------------------------------------------

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] || char);
}

function inline(text: string) {
  return escapeHtml(text)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" style="color:#7c3aed;text-decoration:underline">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>')
    .replace(/`([^`]+)`/g, '<code style="background:#f4f4f5;padding:2px 6px;border-radius:4px;font-size:90%">$1</code>');
}

export function markdownToEmailHtml(markdown: string) {
  return markdown
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const heading = /^(#{1,3})\s+(.+)$/.exec(block);
      if (heading) {
        const size = heading[1].length === 1 ? 26 : heading[1].length === 2 ? 21 : 18;
        return `<h${heading[1].length} style="margin:28px 0 12px;font-size:${size}px;line-height:1.3;color:#18181b">${inline(heading[2])}</h${heading[1].length}>`;
      }
      const lines = block.split('\n');
      if (lines.every((line) => /^[-*]\s+/.test(line))) {
        return `<ul style="margin:0 0 16px;padding-left:22px">${lines
          .map((line) => `<li style="margin:6px 0">${inline(line.replace(/^[-*]\s+/, ''))}</li>`)
          .join('')}</ul>`;
      }
      return `<p style="margin:0 0 16px">${lines.map(inline).join('<br>')}</p>`;
    })
    .join('\n');
}

export function markdownToText(markdown: string) {
  return markdown
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '$1 ($2)')
    .replace(/[*`#]/g, '')
    .trim();
}

export function renderNewsletterHtml(subject: string, content: string, unsubscribeLink: string) {
  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden">
        <tr><td style="background:#7c3aed;padding:28px 32px;color:#ffffff">
          <div style="font-size:14px;letter-spacing:2px;text-transform:uppercase;opacity:.85">${escapeHtml(SITE_NAME)} newsletter</div>
          <div style="font-size:24px;font-weight:800;margin-top:6px;line-height:1.3">${escapeHtml(subject)}</div>
        </td></tr>
        <tr><td style="padding:32px;color:#3f3f46;font-size:16px;line-height:1.7">
          ${markdownToEmailHtml(content)}
          <p style="margin:28px 0 0"><a href="${absoluteUrl('/blog')}" style="display:inline-block;background:#18181b;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:600">Read the latest articles →</a></p>
        </td></tr>
        <tr><td style="padding:20px 32px;border-top:1px solid #e4e4e7;color:#71717a;font-size:12px;line-height:1.6">
          You are receiving this because you subscribed at ${escapeHtml(absoluteUrl('/'))}.<br>
          <a href="${unsubscribeLink}" style="color:#71717a">Unsubscribe</a> at any time.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendNewsletterEmails(emails: string[], subject: string, content: string) {
  if (!isEmailConfigured()) throw new Error('Email provider is not configured');

  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = process.env.NEWSLETTER_FROM_EMAIL as string;
  const text = markdownToText(content);
  let sent = 0;
  const failedBatches: string[] = [];

  for (let start = 0; start < emails.length; start += BATCH_SIZE) {
    const batch = emails.slice(start, start + BATCH_SIZE).map((email) => {
      const link = unsubscribeUrl(email);
      return {
        from,
        to: [email],
        subject,
        html: renderNewsletterHtml(subject, content, link),
        text: `${text}\n\n---\nUnsubscribe: ${link}`,
        headers: {
          'List-Unsubscribe': `<${oneClickUnsubscribeUrl(email)}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
      };
    });

    const { error } = await resend.batch.send(batch);
    if (error) {
      console.error('Newsletter batch failed:', error);
      failedBatches.push(error.message);
    } else {
      sent += batch.length;
    }
  }

  return { sent, failed: emails.length - sent, errors: failedBatches.slice(0, 3) };
}

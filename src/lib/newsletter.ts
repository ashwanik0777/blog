import Newsletter from '@/models/Newsletter';
import NewsletterSubscriber from '@/models/NewsletterSubscriber';
import { sendNewsletterEmails } from '@/lib/email';

/**
 * Sends one campaign to every active subscriber. The status is claimed
 * atomically first, so a double click or an overlapping cron run can never
 * send the same newsletter twice.
 */
export async function deliverNewsletter(id: string) {
  const newsletter = await Newsletter.findOneAndUpdate(
    { _id: id, status: { $in: ['draft', 'scheduled', 'failed'] } },
    { $set: { status: 'sending' } },
    { new: true }
  );
  if (!newsletter) return { ok: false as const, reason: 'Newsletter not found or already sent' };

  try {
    const subscribers = await NewsletterSubscriber.find({ subscribed: true }).select('email').lean<Array<{ email: string }>>();
    const emails = subscribers.map((subscriber) => subscriber.email);
    const result = emails.length
      ? await sendNewsletterEmails(emails, newsletter.subject, newsletter.content)
      : { sent: 0, failed: 0, errors: [] as string[] };

    newsletter.status = result.sent > 0 || emails.length === 0 ? 'sent' : 'failed';
    newsletter.sentAt = new Date();
    newsletter.recipients = result.sent;
    await newsletter.save();

    if (result.sent > 0) {
      await NewsletterSubscriber.updateMany({ subscribed: true }, { $set: { lastEmailSent: new Date() } });
    }
    return { ok: true as const, newsletter, ...result };
  } catch (error) {
    newsletter.status = 'failed';
    await newsletter.save();
    throw error;
  }
}

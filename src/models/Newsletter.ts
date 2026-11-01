import { Schema, models, model } from 'mongoose';

// Newsletter campaigns (subject + content) created from the admin dashboard.
const NewsletterSchema = new Schema({
  subject: { type: String, required: true, maxlength: 200 },
  content: { type: String, required: true, maxlength: 100_000 },
  status: { type: String, enum: ['draft', 'scheduled', 'sending', 'sent', 'failed'], default: 'draft' },
  scheduledAt: { type: Date },
  sentAt: { type: Date },
  recipients: { type: Number, default: 0 },
  opened: { type: Number, default: 0 },
  clicked: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default models.Newsletter || model('Newsletter', NewsletterSchema);

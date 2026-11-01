import { Schema, models, model } from 'mongoose';

const NewsletterSubscriberSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
  name: { type: String, maxlength: 100 },
  subscribed: { type: Boolean, default: true },
  subscribedAt: { type: Date, default: Date.now },
  lastEmailSent: { type: Date },
  tags: [{ type: String, maxlength: 50 }],
  source: { type: String, maxlength: 50 },
});

export default models.NewsletterSubscriber || model('NewsletterSubscriber', NewsletterSubscriberSchema);

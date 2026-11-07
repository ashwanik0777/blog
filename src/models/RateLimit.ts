import { Schema, models, model } from 'mongoose';

// One document per (route, client, window). MongoDB deletes it automatically once it expires.
const RateLimitSchema = new Schema(
  {
    _id: { type: String, required: true },
    count: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
  },
  { versionKey: false }
);

RateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default models.RateLimit || model('RateLimit', RateLimitSchema);

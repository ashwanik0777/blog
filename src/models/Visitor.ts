import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IVisitor extends Document {
  ip: string;
  userAgent?: string;
  referer?: string;
  path: string;
  visitedAt: Date;
  sessionId?: string;
  country?: string;
  city?: string;
  device?: string;
  browser?: string;
}

const VisitorSchema = new Schema<IVisitor>({
  ip: { type: String, required: true, index: true },
  userAgent: { type: String },
  referer: { type: String },
  path: { type: String, required: true },
  visitedAt: { type: Date, default: Date.now, index: true },
  sessionId: { type: String, index: true },
  country: { type: String },
  city: { type: String },
  device: { type: String },
  browser: { type: String },
}, { timestamps: true });

// Index for unique visitor tracking (IP + date)
VisitorSchema.index({ ip: 1, visitedAt: 1 });

export default models.Visitor || model<IVisitor>('Visitor', VisitorSchema);


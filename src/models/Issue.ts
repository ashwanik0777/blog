import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IIssue extends Document {
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'pending' | 'resolved' | 'closed';
  adminNotes?: string;
  resolvedAt?: Date;
  resolvedBy?: mongoose.Types.ObjectId;
}

const IssueSchema = new Schema<IIssue>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['pending', 'resolved', 'closed'], default: 'pending' },
  adminNotes: { type: String },
  resolvedAt: { type: Date },
  resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default models.Issue || model<IIssue>('Issue', IssueSchema);


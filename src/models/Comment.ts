import mongoose, { Schema, models, model, Document } from 'mongoose';

export interface IComment extends Document {
  blog: mongoose.Types.ObjectId;
  author?: mongoose.Types.ObjectId; // Optional for logged-in users
  authorName: string; // Required for anonymous comments
  authorEmail?: string; // Optional email
  content: string;
  status: 'pending' | 'approved' | 'flagged' | 'rejected';
  flaggedReason?: string;
  moderationNotes?: string;
  createdAt: Date;
}

const CommentSchema = new Schema<IComment>({
  blog: { type: Schema.Types.ObjectId, ref: 'Blog', required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User' }, // Optional
  authorName: { type: String, required: true },
  authorEmail: { type: String },
  content: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'flagged', 'rejected'], default: 'pending' },
  flaggedReason: { type: String },
  moderationNotes: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default models.Comment || model<IComment>('Comment', CommentSchema);

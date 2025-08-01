import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IBlog extends Document {
  title: string;
  slug: string;
  content: string;
  summary?: string;
  tags: string[];
  categories: string[];
  author: mongoose.Types.ObjectId;
  featuredImage?: string;
  published: boolean;
  publishedAt?: Date;
  views: number;
  viewsByDay: { [date: string]: number };
  status: string;
  flaggedReason?: string;
  moderationNotes?: string;
}

const BlogSchema = new Schema<IBlog>({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  summary: { type: String },
  tags: [{ type: String }],
  categories: [{ type: String }],
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  featuredImage: { type: String },
  published: { type: Boolean, default: false },
  publishedAt: { type: Date },
  views: { type: Number, default: 0 },
  viewsByDay: { type: Object, default: {} },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'flagged'], default: 'approved' },
  flaggedReason: { type: String },
  moderationNotes: { type: String },
}, { timestamps: true });

export default models.Blog || model<IBlog>('Blog', BlogSchema);

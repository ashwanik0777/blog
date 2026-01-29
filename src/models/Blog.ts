import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IBlog extends Document {
  title: string;
  slug: string;
  content: string;
  summary?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
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
  readingTime?: number;
  excerpt?: string;
  tableOfContents?: string[];
  internalLinks?: string[];
  externalLinks?: string[];
  relatedPosts?: mongoose.Types.ObjectId[];
  socialShareEnabled?: boolean;
  commentsEnabled?: boolean;
  seoOptimized?: boolean;
  featured?: boolean;
  priority?: number;
}

const BlogSchema = new Schema<IBlog>({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  summary: { type: String },
  metaTitle: { type: String },
  metaDescription: { type: String },
  keywords: [{ type: String }],
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
  readingTime: { type: Number },
  excerpt: { type: String },
  tableOfContents: [{ type: String }],
  internalLinks: [{ type: String }],
  externalLinks: [{ type: String }],
  relatedPosts: [{ type: Schema.Types.ObjectId, ref: 'Blog' }],
  socialShareEnabled: { type: Boolean, default: true },
  commentsEnabled: { type: Boolean, default: true },
  seoOptimized: { type: Boolean, default: false },
  featured: { type: Boolean, default: false },
  priority: { type: Number, default: 0 },
}, { timestamps: true });

BlogSchema.index({ published: 1, publishedAt: -1 });
BlogSchema.index({ featured: 1, publishedAt: -1 });
BlogSchema.index({ tags: 1 });
BlogSchema.index({ categories: 1 });
BlogSchema.index({ status: 1, createdAt: -1 });

export default models.Blog || model<IBlog>('Blog', BlogSchema);

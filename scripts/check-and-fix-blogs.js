const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://blog:u5k0Km2rzd0dRZcG@blog.a1u1ipy.mongodb.net/');

// Define schemas
const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  summary: { type: String },
  metaTitle: { type: String },
  metaDescription: { type: String },
  keywords: [{ type: String }],
  tags: [{ type: String }],
  categories: [{ type: String }],
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
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
  relatedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Blog' }],
  socialShareEnabled: { type: Boolean, default: true },
  commentsEnabled: { type: Boolean, default: true },
  seoOptimized: { type: Boolean, default: false },
  featured: { type: Boolean, default: false },
  priority: { type: Number, default: 0 },
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  role: { type: String, enum: ['admin', 'sub-admin', 'editor', 'reader'], default: 'reader' },
  permissions: [{ type: String }],
  emailVerified: { type: Date },
  image: { type: String },
  disabled: { type: Boolean, default: false },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Blog = mongoose.models.Blog || mongoose.model('Blog', BlogSchema);

async function checkAndFixBlogs() {
  try {
    console.log('🔍 Checking blogs in database...');
    
    const blogs = await Blog.find().populate('author', 'name email');
    console.log(`📝 Found ${blogs.length} blogs in database`);
    
    if (blogs.length === 0) {
      console.log('❌ No blogs found in database');
      return;
    }
    
    console.log('\n📋 Blog details:');
    for (const blog of blogs) {
      console.log(`- ${blog.title}`);
      console.log(`  Slug: ${blog.slug}`);
      console.log(`  Published: ${blog.published}`);
      console.log(`  Status: ${blog.status}`);
      console.log(`  Author: ${blog.author?.name || 'Unknown'}`);
      console.log(`  Views: ${blog.views}`);
      console.log('');
    }
    
    // Check if any blogs are not published
    const unpublishedBlogs = blogs.filter(blog => !blog.published);
    if (unpublishedBlogs.length > 0) {
      console.log(`⚠️  Found ${unpublishedBlogs.length} unpublished blogs`);
      console.log('🔄 Publishing all blogs...');
      
      await Blog.updateMany(
        { published: false },
        { 
          published: true, 
          publishedAt: new Date(),
          status: 'approved'
        }
      );
      
      console.log('✅ All blogs have been published');
    }
    
    // Check if any blogs have no views
    const blogsWithNoViews = blogs.filter(blog => !blog.views || blog.views === 0);
    if (blogsWithNoViews.length > 0) {
      console.log(`📊 Found ${blogsWithNoViews.length} blogs with no views`);
      console.log('🔄 Adding sample views...');
      
      for (const blog of blogsWithNoViews) {
        const randomViews = Math.floor(Math.random() * 1000) + 100;
        await Blog.findByIdAndUpdate(blog._id, { views: randomViews });
      }
      
      console.log('✅ Sample views added to blogs');
    }
    
    console.log('\n🎉 Blog check and fix completed!');
    
  } catch (error) {
    console.error('❌ Error checking blogs:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Database connection closed.');
  }
}

// Run the check
checkAndFixBlogs(); 
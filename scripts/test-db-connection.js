const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://blog:u5k0Km2rzd0dRZcG@blog.a1u1ipy.mongodb.net/');

// Define the Blog schema inline
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

const Blog = mongoose.models.Blog || mongoose.model('Blog', BlogSchema);

// Define User schema
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

async function testDatabaseConnection() {
  try {
    console.log('🔌 Testing database connection...');
    
    // Test connection
    await mongoose.connection.asPromise();
    console.log('✅ Database connected successfully!');
    
    // Check if we have any users
    const userCount = await User.countDocuments();
    console.log(`📊 Found ${userCount} users in database`);
    
    // Create a test user if none exists
    let testUser;
    if (userCount === 0) {
      console.log('👤 Creating test user...');
      testUser = await User.create({
        name: 'Test Admin',
        email: 'admin@test.com',
        role: 'admin'
      });
      console.log('✅ Test user created successfully!');
    } else {
      testUser = await User.findOne();
      console.log(`👤 Using existing user: ${testUser.name} (${testUser.email})`);
    }
    
    // Check if we have any blogs
    const blogCount = await Blog.countDocuments();
    console.log(`📝 Found ${blogCount} blogs in database`);
    
    // Create a test blog
    console.log('📝 Creating test blog...');
    const testBlog = await Blog.create({
      title: 'Test Blog Post',
      slug: 'test-blog-post-' + Date.now(),
      content: 'This is a test blog post to verify database functionality.',
      summary: 'A test blog post for database verification.',
      tags: ['test', 'database'],
      categories: ['testing'],
      author: testUser._id,
      published: true,
      publishedAt: new Date()
    });
    console.log('✅ Test blog created successfully!');
    
    // Verify the blog was saved
    const savedBlog = await Blog.findById(testBlog._id).populate('author', 'name email');
    console.log('📋 Blog details:', {
      id: savedBlog._id,
      title: savedBlog.title,
      author: savedBlog.author.name,
      published: savedBlog.published,
      createdAt: savedBlog.createdAt
    });
    
    // Clean up test data
    console.log('🧹 Cleaning up test data...');
    await Blog.findByIdAndDelete(testBlog._id);
    console.log('✅ Test blog deleted successfully!');
    
    console.log('🎉 Database test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Database connection closed.');
  }
}

// Run the test
testDatabaseConnection(); 
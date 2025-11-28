const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://blog:u5k0Km2rzd0dRZcG@blog.a1u1ipy.mongodb.net/');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin User';

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('❌ Missing ADMIN_EMAIL or ADMIN_PASSWORD environment variables.');
  process.exit(1);
}

// Define schemas
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

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Blog = mongoose.models.Blog || mongoose.model('Blog', BlogSchema);

async function setupAdminAndBlogs() {
  try {
    console.log('🔧 Setting up admin user and sample blogs...');
    
    // Check if admin user exists
    let adminUser = await User.findOne({ email: ADMIN_EMAIL });
    
    if (!adminUser) {
      console.log('👤 Creating admin user...');
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);
      adminUser = await User.create({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: hashedPassword,
        role: 'admin',
        emailVerified: new Date()
      });
      console.log('✅ Admin user created successfully!');
    } else {
      console.log('👤 Admin user already exists');
    }
    
    // Check if blogs exist
    const blogCount = await Blog.countDocuments();
    console.log(`📝 Found ${blogCount} blogs in database`);
    
    if (blogCount === 0) {
      console.log('📝 Creating sample blogs...');
      
      const sampleBlogs = [
        {
          title: 'Getting Started with Next.js 15',
          slug: 'getting-started-nextjs-15',
          content: `# Getting Started with Next.js 15

Next.js 15 is the latest version of the React framework that brings exciting new features and improvements. In this comprehensive guide, we'll explore what's new and how to get started.

## What's New in Next.js 15

### 1. Improved Performance
- Faster build times with Turbopack
- Better caching strategies
- Optimized bundle splitting

### 2. Enhanced Developer Experience
- Better error messages
- Improved debugging tools
- Streamlined development workflow

### 3. New Features
- Server Actions improvements
- Better TypeScript support
- Enhanced routing capabilities

## Getting Started

To create a new Next.js 15 project:

\`\`\`bash
npx create-next-app@latest my-app
cd my-app
npm run dev
\`\`\`

## Key Benefits

1. **Performance**: Significantly faster builds and runtime
2. **Developer Experience**: Better tooling and debugging
3. **Scalability**: Improved for large applications
4. **TypeScript**: Enhanced type safety

Next.js 15 represents a major step forward in the React ecosystem, making it easier than ever to build fast, scalable web applications.`,
          summary: 'A comprehensive guide to getting started with Next.js 15, covering new features, improvements, and best practices.',
          tags: ['Next.js', 'React', 'JavaScript', 'Web Development'],
          categories: ['Programming', 'Frontend'],
          author: adminUser._id,
          published: true,
          publishedAt: new Date(),
          views: 1250,
          status: 'approved'
        },
        {
          title: 'The Future of AI in Web Development',
          slug: 'future-ai-web-development',
          content: `# The Future of AI in Web Development

Artificial Intelligence is revolutionizing how we build and maintain web applications. From code generation to testing, AI tools are becoming an integral part of the development workflow.

## AI-Powered Development Tools

### 1. Code Generation
- GitHub Copilot and similar tools
- Automated code suggestions
- Intelligent autocomplete

### 2. Testing and Debugging
- AI-powered test generation
- Automated bug detection
- Performance optimization suggestions

### 3. Design and UX
- AI-generated UI components
- Automated accessibility checks
- Smart layout suggestions

## Benefits for Developers

1. **Increased Productivity**: AI tools can significantly speed up development
2. **Better Code Quality**: Automated suggestions help maintain standards
3. **Reduced Errors**: AI can catch common mistakes early
4. **Faster Learning**: AI helps developers learn new technologies

## Challenges and Considerations

While AI offers tremendous benefits, it's important to:
- Understand the generated code
- Maintain human oversight
- Keep security in mind
- Stay updated with best practices

The future of web development is increasingly AI-assisted, but human creativity and judgment remain essential.`,
          summary: 'Exploring how AI is transforming web development, from code generation to testing and design.',
          tags: ['AI', 'Web Development', 'Programming', 'Technology'],
          categories: ['Technology', 'Programming'],
          author: adminUser._id,
          published: true,
          publishedAt: new Date(),
          views: 2100,
          status: 'approved'
        },
        {
          title: 'Building Scalable APIs with Node.js',
          slug: 'building-scalable-apis-nodejs',
          content: `# Building Scalable APIs with Node.js

Creating scalable APIs is crucial for modern web applications. Node.js provides an excellent foundation for building robust, high-performance APIs.

## Key Principles

### 1. Architecture Design
- Microservices vs Monolithic
- RESTful API design
- GraphQL considerations

### 2. Performance Optimization
- Database query optimization
- Caching strategies
- Load balancing

### 3. Security Best Practices
- Authentication and authorization
- Input validation
- Rate limiting
- CORS configuration

## Implementation Example

Here's a basic Express.js API structure:

\`\`\`javascript
const express = require('express');
const app = express();

app.use(express.json());

// Middleware
app.use('/api', authMiddleware);

// Routes
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
\`\`\`

## Best Practices

1. **Error Handling**: Implement comprehensive error handling
2. **Logging**: Use proper logging for debugging
3. **Documentation**: Maintain clear API documentation
4. **Testing**: Write comprehensive tests
5. **Monitoring**: Implement health checks and monitoring

Building scalable APIs requires careful planning and attention to detail.`,
          summary: 'A comprehensive guide to building scalable APIs using Node.js, covering architecture, performance, and security.',
          tags: ['Node.js', 'API', 'Backend', 'JavaScript'],
          categories: ['Programming', 'Backend'],
          author: adminUser._id,
          published: true,
          publishedAt: new Date(),
          views: 1800,
          status: 'approved'
        },
        {
          title: 'Modern CSS Techniques for 2024',
          slug: 'modern-css-techniques-2024',
          content: `# Modern CSS Techniques for 2024

CSS has evolved significantly over the years, and 2024 brings exciting new features and techniques for creating beautiful, responsive web designs.

## New CSS Features

### 1. Container Queries
\`\`\`css
.container {
  container-type: inline-size;
}

.card {
  @container (min-width: 400px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}
\`\`\`

### 2. CSS Grid Improvements
- Subgrid support
- Better grid alignment
- Enhanced grid areas

### 3. Modern Layout Techniques
- Flexbox for complex layouts
- CSS Grid for two-dimensional layouts
- Logical properties for better internationalization

## Performance Optimization

1. **Critical CSS**: Inline critical styles
2. **CSS-in-JS**: Consider performance implications
3. **PurgeCSS**: Remove unused styles
4. **CSS Custom Properties**: For dynamic theming

## Best Practices

- Use semantic HTML
- Implement responsive design
- Optimize for performance
- Consider accessibility
- Test across browsers

Modern CSS provides powerful tools for creating sophisticated layouts and animations.`,
          summary: 'Exploring the latest CSS techniques and features for modern web development in 2024.',
          tags: ['CSS', 'Frontend', 'Web Design', 'Responsive Design'],
          categories: ['Design', 'Frontend'],
          author: adminUser._id,
          published: true,
          publishedAt: new Date(),
          views: 950,
          status: 'approved'
        },
        {
          title: 'Introduction to TypeScript for JavaScript Developers',
          slug: 'introduction-typescript-javascript',
          content: `# Introduction to TypeScript for JavaScript Developers

TypeScript is a powerful superset of JavaScript that adds static typing and other features to make your code more robust and maintainable.

## Why TypeScript?

### 1. Type Safety
- Catch errors at compile time
- Better IDE support
- Improved refactoring

### 2. Enhanced Developer Experience
- Better autocomplete
- IntelliSense support
- Easier debugging

### 3. Better for Teams
- Self-documenting code
- Easier onboarding
- Reduced bugs

## Getting Started

### Basic Types
\`\`\`typescript
let name: string = 'John';
let age: number = 30;
let isActive: boolean = true;
let hobbies: string[] = ['reading', 'coding'];
\`\`\`

### Interfaces
\`\`\`typescript
interface User {
  id: number;
  name: string;
  email: string;
  isAdmin?: boolean;
}

const user: User = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com'
};
\`\`\`

### Functions
\`\`\`typescript
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

const greetArrow = (name: string): string => \`Hello, \${name}!\`;
\`\`\`

## Migration Strategy

1. Start with new files
2. Gradually add types
3. Use strict mode
4. Leverage existing JavaScript

TypeScript can significantly improve your development experience and code quality.`,
          summary: 'A beginner-friendly guide to TypeScript for JavaScript developers, covering types, interfaces, and migration strategies.',
          tags: ['TypeScript', 'JavaScript', 'Programming', 'Web Development'],
          categories: ['Programming', 'Frontend'],
          author: adminUser._id,
          published: true,
          publishedAt: new Date(),
          views: 1400,
          status: 'approved'
        }
      ];
      
      for (const blogData of sampleBlogs) {
        await Blog.create(blogData);
      }
      
      console.log('✅ Sample blogs created successfully!');
    } else {
      console.log('📝 Blogs already exist in database');
    }
    
    console.log('🎉 Setup completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`- Admin user: ${adminUser.email}`);
    console.log(`- Total blogs: ${await Blog.countDocuments()}`);
    console.log(`- Total users: ${await User.countDocuments()}`);
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Database connection closed.');
  }
}

// Run the setup
setupAdminAndBlogs(); 
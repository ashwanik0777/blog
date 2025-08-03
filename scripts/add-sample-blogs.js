const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gemini-blog');

// Define schemas inline
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

const Blog = mongoose.models.Blog || mongoose.model('Blog', BlogSchema);
const User = mongoose.models.User || mongoose.model('User', UserSchema);

const sampleBlogs = [
  {
    title: "The Future of AI in Web Development: A Comprehensive Guide",
    slug: "future-of-ai-web-development",
    content: `
# The Future of AI in Web Development: A Comprehensive Guide

## Introduction

Artificial Intelligence is revolutionizing web development, transforming how we build, deploy, and maintain websites. From automated code generation to intelligent user experiences, AI is becoming an integral part of modern web development workflows.

## Key AI Technologies in Web Development

### 1. AI-Powered Code Generation
- **GitHub Copilot**: AI pair programming assistant
- **CodeWhisperer**: Amazon's AI coding companion
- **Tabnine**: AI code completion tool

### 2. Intelligent Testing and Debugging
- Automated test case generation
- AI-powered bug detection
- Performance optimization suggestions

### 3. Smart User Experience
- Personalized content delivery
- Intelligent chatbots
- Predictive user behavior analysis

## Benefits of AI in Web Development

### Increased Productivity
- Faster code generation
- Automated repetitive tasks
- Reduced development time

### Improved Quality
- AI-powered code review
- Automated testing
- Better error handling

### Enhanced User Experience
- Personalized interfaces
- Smart recommendations
- Intelligent navigation

## Real-World Examples

### Case Study: E-commerce Platform
A major e-commerce platform implemented AI-powered product recommendations, resulting in:
- 35% increase in conversion rates
- 28% improvement in user engagement
- 42% reduction in cart abandonment

### Case Study: Content Management System
An AI-enhanced CMS achieved:
- 60% faster content creation
- 45% improvement in SEO scores
- 50% reduction in content errors

## Implementation Strategies

### 1. Start Small
- Begin with AI-powered code completion
- Gradually integrate more advanced features
- Measure impact and iterate

### 2. Choose the Right Tools
- Evaluate AI tools based on your needs
- Consider integration complexity
- Assess cost-benefit analysis

### 3. Train Your Team
- Provide AI tool training
- Establish best practices
- Encourage experimentation

## Challenges and Considerations

### Technical Challenges
- Integration complexity
- Data privacy concerns
- Performance overhead

### Ethical Considerations
- Bias in AI algorithms
- Job displacement concerns
- Transparency requirements

## Future Trends

### 1. AI-First Development
- AI-native frameworks
- Intelligent development environments
- Automated deployment pipelines

### 2. Enhanced Personalization
- Real-time user adaptation
- Context-aware interfaces
- Predictive user needs

### 3. Advanced Automation
- Self-healing applications
- Intelligent monitoring
- Automated optimization

## Conclusion

AI is not just a trend in web development—it's the future. By embracing AI technologies, developers can create more efficient, intelligent, and user-friendly web applications. The key is to start small, choose the right tools, and continuously learn and adapt.

## Call to Action

Ready to explore AI in your web development projects? Start by integrating AI-powered code completion tools and gradually expand to more advanced features. The future of web development is intelligent, and the time to start is now.

---

*This article was written with the assistance of AI tools to demonstrate the capabilities discussed within.*
    `,
    summary: "Explore how artificial intelligence is transforming web development, from automated code generation to intelligent user experiences. Learn about key AI technologies, benefits, implementation strategies, and future trends.",
    metaTitle: "The Future of AI in Web Development: Complete Guide 2024",
    metaDescription: "Discover how AI is revolutionizing web development with automated coding, intelligent testing, and enhanced user experiences. Learn implementation strategies and future trends.",
    keywords: ["AI", "web development", "artificial intelligence", "coding", "automation", "future technology"],
    tags: ["AI", "Web Development", "Technology", "Future", "Automation"],
    categories: ["Technology", "AI", "Web Development"],
    published: true,
    status: "approved",
    readingTime: 8,
    excerpt: "Discover how artificial intelligence is revolutionizing web development with automated code generation, intelligent testing, and enhanced user experiences.",
    socialShareEnabled: true,
    commentsEnabled: true,
    seoOptimized: true,
    featured: true,
    priority: 1
  },
  {
    title: "Next.js 15: What's New and How to Upgrade",
    slug: "nextjs-15-whats-new-upgrade-guide",
    content: `
# Next.js 15: What's New and How to Upgrade

## Introduction

Next.js 15 brings significant improvements in performance, developer experience, and new features that make building modern web applications even more efficient. This comprehensive guide covers everything you need to know about the latest release.

## Major New Features

### 1. Improved Server Actions
- Enhanced form handling
- Better error boundaries
- Optimized revalidation

### 2. Partial Prerendering (Preview)
- Hybrid rendering approach
- Faster initial page loads
- Better SEO performance

### 3. Enhanced Image Component
- Automatic WebP/AVIF conversion
- Improved lazy loading
- Better responsive handling

## Performance Improvements

### 1. Faster Build Times
- Optimized bundling
- Reduced memory usage
- Parallel processing

### 2. Better Runtime Performance
- Improved hydration
- Faster navigation
- Reduced bundle sizes

### 3. Enhanced Caching
- Smarter cache invalidation
- Better static generation
- Improved ISR performance

## Developer Experience Enhancements

### 1. Improved Error Handling
- Better error messages
- Enhanced debugging tools
- Stack trace improvements

### 2. Enhanced TypeScript Support
- Better type inference
- Improved IntelliSense
- Stricter type checking

### 3. Better Development Server
- Faster hot reloading
- Improved error overlay
- Better debugging experience

## Migration Guide

### Step 1: Update Dependencies
\`\`\`bash
npm install next@latest react@latest react-dom@latest
\`\`\`

### Step 2: Review Breaking Changes
- Check deprecated APIs
- Update configuration files
- Review component changes

### Step 3: Test Your Application
- Run comprehensive tests
- Check for performance regressions
- Verify all features work

### Step 4: Optimize for New Features
- Implement partial prerendering
- Update image components
- Optimize server actions

## Best Practices

### 1. Use App Router
- Leverage new routing features
- Implement server components
- Optimize for performance

### 2. Implement Partial Prerendering
- Identify static content
- Optimize dynamic sections
- Balance performance and freshness

### 3. Optimize Images
- Use next/image properly
- Implement responsive images
- Optimize for Core Web Vitals

## Common Issues and Solutions

### 1. Build Errors
- Check for deprecated APIs
- Update third-party packages
- Review configuration changes

### 2. Performance Issues
- Monitor Core Web Vitals
- Optimize bundle sizes
- Implement proper caching

### 3. TypeScript Errors
- Update type definitions
- Check for breaking changes
- Review component props

## Conclusion

Next.js 15 represents a significant step forward in the framework's evolution. With improved performance, better developer experience, and new features like partial prerendering, it's an upgrade worth considering for any Next.js project.

## Call to Action

Ready to upgrade to Next.js 15? Start by reviewing the migration guide and testing your application thoroughly. The performance and developer experience improvements make this upgrade highly recommended.

---

*This guide covers the essential aspects of Next.js 15. For more detailed information, refer to the official documentation.*
    `,
    summary: "Discover what's new in Next.js 15, including partial prerendering, improved server actions, and performance enhancements. Learn how to upgrade your existing Next.js applications.",
    metaTitle: "Next.js 15: Complete Guide to New Features and Migration",
    metaDescription: "Learn about Next.js 15's new features including partial prerendering, improved server actions, and performance enhancements. Get step-by-step migration guide.",
    keywords: ["Next.js", "React", "web development", "framework", "migration", "performance"],
    tags: ["Next.js", "React", "Web Development", "Framework", "Migration"],
    categories: ["Technology", "Web Development", "React"],
    published: true,
    status: "approved",
    readingTime: 6,
    excerpt: "Discover what's new in Next.js 15 and learn how to upgrade your applications with improved performance and new features.",
    socialShareEnabled: true,
    commentsEnabled: true,
    seoOptimized: true,
    featured: true,
    priority: 2
  },
  {
    title: "Building Scalable APIs with Node.js and Express",
    slug: "building-scalable-apis-nodejs-express",
    content: `
# Building Scalable APIs with Node.js and Express

## Introduction

Building scalable APIs is crucial for modern web applications. This comprehensive guide covers best practices, patterns, and techniques for creating robust, scalable APIs using Node.js and Express.

## Architecture Patterns

### 1. Layered Architecture
- **Controller Layer**: Handle HTTP requests
- **Service Layer**: Business logic
- **Data Access Layer**: Database operations
- **Model Layer**: Data structures

### 2. Microservices Pattern
- Service decomposition
- Independent deployment
- Technology diversity
- Fault isolation

### 3. Event-Driven Architecture
- Asynchronous processing
- Loose coupling
- Scalability benefits
- Event sourcing

## Best Practices

### 1. Error Handling
\`\`\`javascript
// Global error handler
app.use((error, req, res, next) => {
  console.error(error.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});
\`\`\`

### 2. Input Validation
\`\`\`javascript
const { body, validationResult } = require('express-validator');

const validateUser = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];
\`\`\`

### 3. Rate Limiting
\`\`\`javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use('/api/', limiter);
\`\`\`

## Performance Optimization

### 1. Caching Strategies
- **Redis**: In-memory caching
- **CDN**: Static content delivery
- **Database**: Query result caching
- **Application**: Response caching

### 2. Database Optimization
- Connection pooling
- Query optimization
- Indexing strategies
- Read replicas

### 3. Load Balancing
- Horizontal scaling
- Load balancer configuration
- Health checks
- Session management

## Security Considerations

### 1. Authentication & Authorization
- JWT tokens
- OAuth 2.0
- Role-based access control
- API keys

### 2. Data Protection
- Input sanitization
- SQL injection prevention
- XSS protection
- CSRF tokens

### 3. HTTPS & SSL
- SSL/TLS configuration
- Certificate management
- Security headers
- HSTS implementation

## Monitoring and Logging

### 1. Application Monitoring
- Performance metrics
- Error tracking
- User analytics
- Health checks

### 2. Logging Strategy
- Structured logging
- Log levels
- Log aggregation
- Log rotation

### 3. Alerting
- Error notifications
- Performance alerts
- Capacity warnings
- Security alerts

## Testing Strategies

### 1. Unit Testing
\`\`\`javascript
const request = require('supertest');
const app = require('../app');

describe('User API', () => {
  test('GET /api/users should return users', async () => {
    const response = await request(app)
      .get('/api/users')
      .expect(200);
    
    expect(response.body).toHaveProperty('users');
  });
});
\`\`\`

### 2. Integration Testing
- API endpoint testing
- Database integration
- External service testing
- End-to-end testing

### 3. Performance Testing
- Load testing
- Stress testing
- Scalability testing
- Benchmarking

## Deployment and DevOps

### 1. Containerization
- Docker configuration
- Multi-stage builds
- Environment management
- Container orchestration

### 2. CI/CD Pipeline
- Automated testing
- Code quality checks
- Deployment automation
- Rollback strategies

### 3. Environment Management
- Development setup
- Staging environment
- Production deployment
- Configuration management

## Real-World Example

### E-commerce API Structure
\`\`\`javascript
// routes/products.js
const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/ProductController');
const auth = require('../middleware/auth');

router.get('/', ProductController.getAllProducts);
router.get('/:id', ProductController.getProductById);
router.post('/', auth, ProductController.createProduct);
router.put('/:id', auth, ProductController.updateProduct);
router.delete('/:id', auth, ProductController.deleteProduct);

module.exports = router;
\`\`\`

## Conclusion

Building scalable APIs requires careful planning, proper architecture, and adherence to best practices. By following the patterns and techniques outlined in this guide, you can create robust, maintainable, and scalable APIs that can handle growing user demands.

## Call to Action

Start implementing these patterns in your next API project. Focus on one area at a time, measure the impact, and continuously improve your architecture based on real-world usage patterns.

---

*This guide provides a foundation for building scalable APIs. For more advanced topics, consider exploring microservices, event-driven architecture, and cloud-native patterns.*
    `,
    summary: "Learn how to build scalable APIs with Node.js and Express. This comprehensive guide covers architecture patterns, best practices, performance optimization, security, and deployment strategies.",
    metaTitle: "Building Scalable APIs with Node.js and Express: Complete Guide",
    metaDescription: "Master the art of building scalable APIs with Node.js and Express. Learn architecture patterns, best practices, security, and deployment strategies.",
    keywords: ["Node.js", "Express", "API", "scalable", "backend", "development"],
    tags: ["Node.js", "Express", "API", "Backend", "Scalability"],
    categories: ["Technology", "Backend", "API Development"],
    published: true,
    status: "approved",
    readingTime: 10,
    excerpt: "Master the art of building scalable APIs with Node.js and Express through comprehensive architecture patterns and best practices.",
    socialShareEnabled: true,
    commentsEnabled: true,
    seoOptimized: true,
    featured: true,
    priority: 3
  }
];

async function addSampleBlogs() {
  try {
    // Find an admin user to use as author
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.error('No admin user found. Please create an admin user first.');
      return;
    }

    // Add blogs with the admin user as author
    for (const blogData of sampleBlogs) {
      const existingBlog = await Blog.findOne({ slug: blogData.slug });
      if (!existingBlog) {
        const blog = new Blog({
          ...blogData,
          author: adminUser._id,
          publishedAt: new Date(),
          views: Math.floor(Math.random() * 1000) + 100,
          viewsByDay: {}
        });
        await blog.save();
        console.log(`✅ Added blog: ${blogData.title}`);
      } else {
        console.log(`⏭️  Blog already exists: ${blogData.title}`);
      }
    }

    console.log('🎉 Sample blogs added successfully!');
  } catch (error) {
    console.error('❌ Error adding blogs:', error);
  } finally {
    mongoose.connection.close();
  }
}

addSampleBlogs(); 
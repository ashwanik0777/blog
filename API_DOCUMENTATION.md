# 🔧 API Documentation - Gemini AI Blog

Complete API reference for the Gemini AI Blog platform.

## 📋 Table of Contents

- [🔐 Authentication](#-authentication)
- [📝 Blog Management](#-blog-management)
- [🤖 AI Services](#-ai-services)
- [👥 User Management](#-user-management)
- [📧 Newsletter](#-newsletter)
- [📊 Analytics](#-analytics)
- [⚙️ Settings](#️-settings)
- [💬 Comments](#-comments)

---

## 🔐 Authentication

### NextAuth.js Endpoints

All authentication is handled through NextAuth.js with the following providers:
- Google OAuth
- Email/Password (Credentials)

#### Base URL
```
/api/auth/[...nextauth]
```

#### Available Endpoints
- `GET /api/auth/signin` - Sign in page
- `GET /api/auth/signout` - Sign out
- `GET /api/auth/session` - Get current session
- `GET /api/auth/csrf` - Get CSRF token

#### Session Object
```typescript
interface Session {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
    role: 'admin' | 'editor' | 'reader';
  };
  expires: string;
}
```

---

## 📝 Blog Management

### Get All Blogs

**GET** `/api/blog`

Retrieve all published blogs with pagination.

#### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `pageSize` | number | 10 | Items per page |

#### Response
```typescript
{
  blogs: Blog[];
  total: number;
}
```

#### Example
```bash
curl -X GET "http://localhost:3000/api/blog?page=1&pageSize=5"
```

### Get Single Blog

**GET** `/api/blog/[slug]`

Retrieve a specific blog by slug.

#### Response
```typescript
{
  _id: string;
  title: string;
  slug: string;
  content: string;
  summary?: string;
  tags: string[];
  categories: string[];
  author: {
    _id: string;
    name: string;
    email: string;
    image?: string;
  };
  featuredImage?: string;
  published: boolean;
  publishedAt?: Date;
  views: number;
  viewsByDay: Record<string, number>;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  createdAt: Date;
  updatedAt: Date;
}
```

### Create Blog

**POST** `/api/blog`

Create a new blog post (Admin/Editor only).

#### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### Request Body
```typescript
{
  title: string;
  slug: string;
  content: string;
  summary?: string;
  tags?: string[];
  categories?: string[];
  featuredImage?: string;
  published?: boolean;
}
```

#### Response
```typescript
{
  _id: string;
  title: string;
  // ... other blog fields
}
```

### Update Blog

**PUT** `/api/blog/[slug]`

Update an existing blog post (Admin/Editor only).

#### Request Body
```typescript
{
  title?: string;
  slug?: string;
  content?: string;
  summary?: string;
  tags?: string[];
  categories?: string[];
  featuredImage?: string;
  published?: boolean;
}
```

### Delete Blog

**DELETE** `/api/blog/[slug]`

Delete a blog post (Admin only).

#### Response
```typescript
{
  success: true;
  message: "Blog deleted successfully";
}
```

### Partial Update Blog

**PATCH** `/api/blog/[slug]`

Partially update a blog post.

#### Request Body
```typescript
{
  published?: boolean;
  status?: 'pending' | 'approved' | 'rejected' | 'flagged';
  moderationNotes?: string;
}
```

---

## 🤖 AI Services

### Generate Blog Content

**POST** `/api/ai/generate-blog`

Generate blog content using Gemini AI (Admin only).

#### Request Body
```typescript
{
  title: string;
  keywords?: string;
}
```

#### Response
```typescript
{
  content: string;      // Markdown content
  summary: string;      // Blog summary
  tags: string[];       // Suggested tags
  categories: string[]; // Suggested categories
}
```

### AI Chat

**POST** `/api/ai/chat`

Interact with Gemini AI chatbot.

#### Request Body
```typescript
{
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
}
```

#### Response
```typescript
{
  content: string;
}
```

### Content Moderation

**POST** `/api/ai/moderate`

Moderate content using AI (Admin only).

#### Request Body
```typescript
{
  content: string;
}
```

#### Response
```typescript
{
  verdict: 'safe' | 'flagged' | 'needs review';
  reason: string;
}
```

### Suggest Tags

**POST** `/api/ai/suggest-tags`

Get AI-suggested tags for content.

#### Request Body
```typescript
{
  content: string;
  title?: string;
}
```

#### Response
```typescript
{
  tags: string[];
}
```

### Generate Summary

**POST** `/api/ai/summarize`

Generate content summary using AI.

#### Request Body
```typescript
{
  content: string;
  maxLength?: number;
}
```

#### Response
```typescript
{
  summary: string;
}
```

### Generate Alt Text

**POST** `/api/ai/alt-text`

Generate alt text for images using AI.

#### Request Body
```typescript
{
  imageUrl: string;
  context?: string;
}
```

#### Response
```typescript
{
  altText: string;
}
```

---

## 👥 User Management

### Get All Users

**GET** `/api/admin/users`

Get all users (Admin only).

#### Response
```typescript
{
  users: Array<{
    _id: string;
    name: string;
    email: string;
    role: 'admin' | 'editor' | 'reader';
    disabled: boolean;
    createdAt: Date;
  }>;
}
```

### Update User

**POST** `/api/admin/users`

Update user information (Admin only).

#### Request Body
```typescript
{
  userId: string;
  role?: 'admin' | 'editor' | 'reader';
  disabled?: boolean;
}
```

### Delete User

**DELETE** `/api/admin/users`

Delete a user (Admin only).

#### Request Body
```typescript
{
  userId: string;
}
```

### User Registration

**POST** `/api/auth/register`

Register a new user.

#### Request Body
```typescript
{
  name: string;
  email: string;
  password: string;
}
```

#### Response
```typescript
{
  success: boolean;
  message: string;
  user?: {
    _id: string;
    name: string;
    email: string;
  };
}
```

---

## 📧 Newsletter

### Subscribe to Newsletter

**POST** `/api/newsletter`

Subscribe an email to the newsletter.

#### Request Body
```typescript
{
  email: string;
}
```

#### Response
```typescript
{
  success: boolean;
  message?: string;
  error?: string;
}
```

### Get Subscribers

**GET** `/api/newsletter`

Get all newsletter subscribers (Admin only).

#### Response
```typescript
{
  subscribers: Array<{
    _id: string;
    email: string;
    subscribedAt: Date;
  }>;
}
```

---

## 📊 Analytics

### Blog Analytics

**GET** `/api/analytics/blogs`

Get blog performance analytics (Admin only).

#### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `period` | string | '30d' | Time period (7d, 30d, 90d) |

#### Response
```typescript
{
  totalViews: number;
  totalBlogs: number;
  topBlogs: Array<{
    _id: string;
    title: string;
    views: number;
    viewsByDay: Record<string, number>;
  }>;
  viewsByDay: Record<string, number>;
}
```

### User Analytics

**GET** `/api/analytics/users`

Get user activity analytics (Admin only).

#### Response
```typescript
{
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  usersByRole: Record<string, number>;
  userActivity: Array<{
    date: string;
    activeUsers: number;
    newUsers: number;
  }>;
}
```

---

## ⚙️ Settings

### Chatbot Settings

**GET** `/api/settings/chatbot`

Get chatbot configuration.

#### Response
```typescript
{
  chatbotEnabled: boolean;
}
```

**POST** `/api/settings/chatbot`

Update chatbot settings (Admin only).

#### Request Body
```typescript
{
  chatbotEnabled: boolean;
}
```

---

## 💬 Comments

### Get Comments

**GET** `/api/comments`

Get comments for blogs.

#### Query Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `blogId` | string | Blog ID to filter comments |

#### Response
```typescript
{
  comments: Array<{
    _id: string;
    content: string;
    author: {
      _id: string;
      name: string;
      email: string;
    };
    blog: {
      _id: string;
      title: string;
    };
    status: 'pending' | 'approved' | 'rejected' | 'flagged';
    createdAt: Date;
  }>;
}
```

### Create Comment

**POST** `/api/comments`

Create a new comment.

#### Request Body
```typescript
{
  blogId: string;
  content: string;
}
```

### Update Comment

**PATCH** `/api/comments/[id]`

Update comment status (Admin only).

#### Request Body
```typescript
{
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  moderationNotes?: string;
}
```

### Delete Comment

**DELETE** `/api/comments/[id]`

Delete a comment (Admin/Author only).

---

## 🔧 Error Handling

### Error Response Format

All API endpoints return consistent error responses:

```typescript
{
  success: false;
  error: string;
  code?: string;
  details?: any;
}
```

### Common HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

### Error Codes

| Code | Description |
|------|-------------|
| `INVALID_INPUT` | Invalid request data |
| `UNAUTHORIZED` | Authentication required |
| `FORBIDDEN` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `VALIDATION_ERROR` | Data validation failed |
| `AI_SERVICE_ERROR` | AI service unavailable |

---

## 📝 Rate Limiting

### Limits
- **Public endpoints**: 100 requests per minute
- **Authenticated endpoints**: 1000 requests per minute
- **AI endpoints**: 50 requests per minute

### Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## 🔒 Security

### Authentication
- JWT-based sessions
- CSRF protection
- Secure cookie settings

### Authorization
- Role-based access control
- Resource-level permissions
- Input validation and sanitization

### Data Protection
- Password hashing with bcrypt
- HTTPS enforcement
- SQL injection prevention

---

## 📚 Examples

### Complete Blog Creation Flow

```bash
# 1. Authenticate
curl -X POST "http://localhost:3000/api/auth/signin" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password"}'

# 2. Generate blog content with AI
curl -X POST "http://localhost:3000/api/ai/generate-blog" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title": "AI in Modern Web Development", "keywords": "AI, web development, next.js"}'

# 3. Create blog post
curl -X POST "http://localhost:3000/api/blog" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "AI in Modern Web Development",
    "slug": "ai-modern-web-development",
    "content": "Generated content...",
    "summary": "Generated summary...",
    "tags": ["AI", "Web Development"],
    "published": true
  }'
```

### Newsletter Subscription

```bash
curl -X POST "http://localhost:3000/api/newsletter" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

---

## 🚀 SDK Examples

### JavaScript/TypeScript

```typescript
class GeminiAIBlogAPI {
  private baseUrl: string;
  private token?: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string) {
    this.token = token;
  }

  async getBlogs(page = 1, pageSize = 10) {
    const response = await fetch(
      `${this.baseUrl}/api/blog?page=${page}&pageSize=${pageSize}`,
      {
        headers: this.getHeaders(),
      }
    );
    return response.json();
  }

  async createBlog(blogData: any) {
    const response = await fetch(`${this.baseUrl}/api/blog`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(blogData),
    });
    return response.json();
  }

  async generateBlogContent(title: string, keywords?: string) {
    const response = await fetch(`${this.baseUrl}/api/ai/generate-blog`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ title, keywords }),
    });
    return response.json();
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }
}

// Usage
const api = new GeminiAIBlogAPI('http://localhost:3000');
api.setToken('your-jwt-token');

// Get blogs
const blogs = await api.getBlogs();

// Generate content
const content = await api.generateBlogContent('My Blog Title');
```

---

## 📞 Support

For API support and questions:

- **Documentation**: Check this file and README.md
- **Issues**: Create GitHub issues for bugs
- **Discussions**: Use GitHub Discussions for questions

---

<div align="center">

**API Documentation for Gemini AI Blog** 🤖

*Built with Next.js, TypeScript, and Google Gemini AI*

</div> 
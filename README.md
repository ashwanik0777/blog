# 🤖 Gemini AI Blog

<div align="center">

![Gemini AI Blog](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-2f74c0?style=for-the-badge&logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-0fa14c?style=for-the-badge&logo=mongodb)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.0-38B2AC?style=for-the-badge&logo=tailwind-css)
![Gemini AI](https://img.shields.io/badge/Gemini-AI-blueviolet?style=for-the-badge&logo=google)

**An end-to-end, AI-native publishing platform with admin tooling, analytics, and multi-channel deployment in one repo.**

[Live Demo](#) • [Start Building](#-getting-started) • [API Reference](#-api-reference) • [Deployment](#-deployment--operations)

</div>

---

## 📚 Why This README?

All platform docs (`API_DOCUMENTATION.md`, `ARCHITECTURE.md`, `DEPLOYMENT.md`, `USER_GUIDE.md`, and the legacy README) now live here. Use this single file for:

- Product & feature overview
- Architecture and data contracts
- Local development + environment setup
- API reference and SDK notes
- User/admin workflows & AI usage
- Deployment, security, monitoring, and troubleshooting

---

## 🧭 Table of Contents

1. [Overview & Feature Set](#-overview--feature-set)
2. [Architecture & Stack](#-architecture--stack)
3. [Project Structure](#-project-structure)
4. [Getting Started](#-getting-started)
5. [Configuration](#-configuration)
6. [Run & Test Commands](#-run--test-commands)
7. [API Reference](#-api-reference)
8. [User & Admin Guide](#-user--admin-guide)
9. [AI Capabilities](#-ai-capabilities)
10. [Deployment & Operations](#-deployment--operations)
11. [Security & Compliance](#-security--compliance)
12. [Monitoring & Troubleshooting](#-monitoring--troubleshooting)
13. [Contributing & License](#-contributing--license)

---

## 🌟 Overview & Feature Set

- **AI-native authoring:** Gemini-powered generation, summaries, tags, alt text, moderation, chatbot.
- **Full CMS:** Drafts, publishing, featured media, comments, newsletter capture, admin workflows.
- **Analytics suite:** Blog KPIs, user growth, views-by-day, traffic segmentation.
- **Role-based control:** Admin/editor/reader roles with toggleable user states.
- **Modern UX:** Next.js App Router, responsive UI, dark mode, Tailwind + Framer Motion polish.
- **Enterprise-ready:** NextAuth, rate limiting, consistent error schema, deployment blueprints.

---

## 🏗️ Architecture & Stack

```mermaid
graph TB
    subgraph "Clients"
        A[Public Web]
        B[Admin Dashboard]
        C[AI Chatbot Widget]
    end

    subgraph "Next.js App"
        D[App Router Pages]
        E[React Components]
        F[API Routes & Server Actions]
        G[Middleware]
    end

    subgraph "Services"
        H[Auth (NextAuth)]
        I[Blog/User Services]
        J[AI Service Layer]
        K[Analytics Engine]
    end

    subgraph "Data Stores"
        L[MongoDB Atlas]
        M[Edge Cache/CDN]
    end

    subgraph "External Providers"
        N[Google Gemini]
        O[Google OAuth]
    end

    A --> D
    B --> D
    C --> E
    D --> F --> I --> L
    F --> H --> O
    F --> J --> N
    G --> F
    K --> L
    F --> M
```

### Layer Responsibilities
- **Presentation:** `src/app`, `src/components` for layouts, route groups, reusable UI.
- **Application:** `src/app/api`, middleware, authentication, validation, and orchestrations.
- **Business Logic:** API route handlers invoking services (blogs, users, newsletter, analytics).
- **Data Access:** `src/models`, `src/lib/mongodb*.ts` for schemas, indexing, pooling.
- **External Integrations:** Gemini AI, Google OAuth, optional SMTP/Redis hooks.

### Technology Stack

| Layer | Technologies |
|-------|--------------|
| Frontend | Next.js 15 (App Router), React 18, TypeScript, Tailwind, Framer Motion, React Hook Form |
| Backend | Node.js 18, Next.js API Routes, NextAuth, Mongoose |
| Database | MongoDB Atlas (indexes on slug, author, tags, status, published) |
| AI | Google Gemini (generation, moderation, summarization, chatbot, alt text) |
| Tooling | ESLint, Prettier, Jest/RTL, Cypress, Husky, GitHub Actions |

---

## 📂 Project Structure

```
├── src/
│   ├── app/                 # Public, admin, auth, API routes, sitemaps, middleware
│   ├── api/                 # Client helpers for internal APIs
│   ├── components/          # Navbar, Editor, Chatbot, Tables, etc.
│   ├── lib/                 # Auth options, Mongo connection helpers
│   ├── models/              # Blog, User, Comment, Settings schemas
│   └── middleware.ts        # Auth + rate limiting middleware
├── scripts/                 # Seeding + admin utilities
├── public/                  # Static assets
├── package.json             # npm scripts + deps
└── README.md                # ← single source for all docs
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js **18+**
- npm **10+**
- MongoDB Atlas cluster (or local Mongo)
- Google Gemini API key
- (Optional) Google OAuth client

### Bootstrap

```bash
git clone https://github.com/yourusername/gemini-ai-blog.git
cd gemini-ai-blog
npm install
cp .env.example .env.local    # populate with your secrets
npm run dev
```

Visit `http://localhost:3000` (public) and `http://localhost:3000/admin` (dashboard).

---

## 🔧 Configuration

```env
# Core
NODE_ENV=development
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/blog

# Authentication
NEXTAUTH_SECRET=replace_me
NEXTAUTH_URL=http://localhost:3000

# Admin bootstrap
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=supersecurepassword
ADMIN_NAME=Platform Admin

# OAuth (optional)
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxx

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Optional providers
REDIS_URL=redis://127.0.0.1:6379
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=no-reply@example.com
SMTP_PASS=app_password
```

Generate secure secrets:

```bash
openssl rand -base64 32                      # NEXTAUTH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

> Admin bootstrap credentials feed `scripts/setup-admin-and-blogs.js`; populate `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and optional `ADMIN_NAME` before running any seed script.

Use `.env.local`, `.env.staging`, `.env.production` per environment.

---

## 🧪 Run & Test Commands

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Serve production build

npm run lint         # ESLint
npm run test         # Jest/RTL
npm run test:watch   # Jest watch mode

npm run db:seed      # Seed sample admins/blogs
npm run db:reset     # Reset Mongo data
```

---

## 📡 API Reference

> Base path: `/api`

### Authentication & Session
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/[...nextauth]` | GET/POST | NextAuth provider router |
| `/auth/signin`, `/auth/register` | GET/POST | Sign-in UI, credential signup |
| `/auth/logout` | POST | Destroy session |
| `/auth/me` | GET | Current user profile |

Session payload:

```typescript
interface Session {
  user: {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'editor' | 'reader';
    image?: string;
  };
  expires: string;
}
```

### Blog Management
| Endpoint | Method | Notes |
|----------|--------|-------|
| `/blog` | GET | Pagination via `page`, `pageSize` |
| `/blog/[slug]` | GET | Populated blog detail |
| `/blog` | POST | Admin/Editor create |
| `/blog/[slug]` | PUT/PATCH | Update or partial update |
| `/blog/[slug]` | DELETE | Admin-only delete |

### AI Services
| Endpoint | Purpose | Payload |
|----------|---------|---------|
| `/ai/generate-blog` | Full draft generation | `{ title, keywords? }` |
| `/ai/summarize` | Summary | `{ content, maxLength? }` |
| `/ai/suggest-tags` | Tags/categories | `{ content, title? }` |
| `/ai/alt-text` | Image accessibility | `{ imageUrl, context? }` |
| `/ai/moderate` | Content moderation | `{ content }` |
| `/ai/chat` | Conversational chatbot | `{ messages: [{role, content}] }` |

### User & Admin APIs
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/admin/users` | GET/POST/DELETE | List/update/delete users |
| `/admin/users/[id]/toggle-status` | PATCH | Enable/disable |
| `/admin/sub-admins` | CRUD delegated admins |
| `/admin/settings` | GET/POST site + chatbot settings |
| `/admin/analytics` | GET blog/user KPIs |
| `/newsletter` | GET/POST subscribers |
| `/comments` | GET/POST public comments |
| `/comments/[id]` | PATCH/DELETE moderation |

### Error & Rate Limiting

```typescript
{
  success: false,
  error: "INVALID_INPUT",
  code?: "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "AI_SERVICE_ERROR",
  details?: any
}
```

- Public endpoints: **100 req/min**
- Authenticated: **1000 req/min**
- AI endpoints: **50 req/min**

Response headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`.

---

## 👩‍💻 User & Admin Guide

### Getting Started
1. Visit homepage → explore featured blogs.
2. Register/sign in (Google OAuth or credentials).
3. Admins land on `/admin/dashboard`; editors access creation tools; readers can comment + subscribe.

### Writing & Publishing
1. `Dashboard → Blogs → Create`.
2. Fill title (slug auto-generates, editable), summary, tags, categories, featured image.
3. Use markdown editor or **Generate with AI** for auto draft.
4. Save as draft or publish; AI moderation runs automatically and surfaces notes.

### Admin Dashboard Highlights
- **Content:** filters, search, bulk publish/delete, quick edit, scheduled posts.
- **Moderation:** AI verdicts + manual review for blogs/comments.
- **Users:** assign roles, toggle access, view account timelines.
- **Newsletter:** subscriber list, CSV export, manual outreach tools.
- **Analytics:** blog views, user growth, traffic sources, conversion funnels.
- **Settings:** site metadata, SEO defaults, chatbot toggle, welcome message, response tone.

### AI Chatbot
- Floating action button on every page.
- Use prompts like “Suggest topics for fintech blog”, “Review this introduction”.
- Tips: be specific, include context, ask follow-ups, copy outputs for reuse.

### Newsletter & Comments
- Homepage form with validation + spam protection.
- Admin exports subscribers; aligns with analytics conversions.
- Comments API enforces moderation statuses: `pending`, `approved`, `rejected`, `flagged`.

### Roles & Permissions
| Role | Capabilities |
|------|--------------|
| Admin | Full access, settings, user management, deployments |
| Editor | Create/edit blogs, limited analytics |
| Reader | View/publish comments, subscribe |

---

## 🤖 AI Capabilities

```mermaid
sequenceDiagram
    participant Editor
    participant AIService
    participant Gemini
    participant Database

    Editor->>AIService: Generate blog (title, keywords)
    AIService->>Gemini: Prompt template
    Gemini-->>AIService: Structured draft JSON
    AIService->>Editor: Markdown + summary + tags
    Editor->>AIService: Request moderation
    AIService->>Gemini: Moderation prompt
    Gemini-->>AIService: Verdict + reason
    AIService->>Database: Persist blog + moderation notes
```

AI prompt templates (generate, moderate, tag, summarize, alt text, chatbot) live in the service layer and can be tuned for tone, compliance, or vertical-specific language.

---

## 🚢 Deployment & Operations

### Vercel (Recommended)
1. Fork/clone repo, push to GitHub.
2. In Vercel: **New Project → Import repo**.
3. Add env vars (see [Configuration](#-configuration)).
4. Deploy, add custom domain, update `NEXTAUTH_URL` & `NEXT_PUBLIC_BASE_URL`.

### Docker

```dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
USER node
EXPOSE 3000
CMD ["node", "server.js"]
```

Compose example: app (port 3000) + nginx reverse proxy (TLS termination) + shared bridge network. Mount `nginx.conf`, `ssl/` for certs, restart `unless-stopped`.

### Self-Hosted (Ubuntu + PM2)

```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
git clone https://github.com/yourusername/gemini-ai-blog.git
cd gemini-ai-blog && npm install && npm run build
pm2 start npm --name "gemini-ai-blog" -- start
pm2 save && pm2 startup
```

Optional systemd unit ensures auto-start on boot.

### CI/CD
- `deploy.yml`: on `main` push → test, lint, build, deploy via `amondnet/vercel-action`.
- `deploy-staging.yml`: on `develop` push → deploy to Vercel staging target.

### Production Checklist
- [ ] Secrets stored securely, never committed.
- [ ] HTTPS + HSTS enforced; DNS + SSL verified.
- [ ] Mongo IP whitelist + least privilege DB users.
- [ ] Rate limiting + CORS validated.
- [ ] Health checks responding; readiness/liveness monitors.
- [ ] Backups + disaster recovery plan tested.

---

## 🛡️ Security & Compliance

- **Authentication:** NextAuth (Google OAuth + credentials) with JWT sessions.
- **Authorization:** Role-based permissions per resource; middleware guards admin routes.
- **Transport:** Enforce HTTPS, secure cookies, CSRF tokens.
- **Data:** Password hashing via bcrypt, sanitized inputs, Mongo indexes for efficient lookups.
- **Rate Limiting:** Category-specific quotas (public/auth/AI).
- **Logging:** Centralized error handling returns `success:false` payload with code + timestamp.

Authorization matrix example:

```typescript
const permissions = {
  admin: ['read', 'write', 'delete', 'manage_users'],
  editor: ['read', 'write'],
  reader: ['read'],
};
```

---

## 📊 Monitoring & Troubleshooting

### Observability
- **Vercel Analytics:** Add `<Analytics />` in `app/layout.tsx`.
- **Sentry:** Configure via `lib/sentry.ts`, set `SENTRY_DSN`.
- **Health Check:** `app/api/health/route.ts` checks DB connectivity and returns uptime/memory.
- **Performance Hooks:** Optional Next.js instrumentation + bundle analyzer.

### Common Issues
| Symptom | Fix |
|---------|-----|
| Build failure | Check Node 18+, reinstall deps, review Vercel logs |
| AI endpoints timeout | Validate `GEMINI_API_KEY`, inspect quotas, ensure outbound network |
| Cannot publish blog | Confirm role permissions, required fields, moderation status |
| Slow pages | Clear browser cache, check Mongo indexes, enable CDN caching |
| Login problems | Verify credentials, role assignments, clear cookies, reset password |

Collect reproduction steps + logs before escalating.

---

## 🤝 Contributing & License

1. Fork → create feature branch.
2. Implement changes with tests.
3. Run `npm run lint && npm run test && npm run build`.
4. Submit PR describing changes + screenshots if UI.

Development standards live in `CONTRIBUTING.md`.

**License:** MIT (see `LICENSE`).

---

## 🙌 Support & Links

- Issues: GitHub issue tracker
- Discussions: GitHub Discussions/Community
- Deployment docs: Vercel, Docker, MongoDB official guides
- AI feedback: In-app chatbot or issue template

<div align="center">

**Built with ❤️, Next.js, and Google Gemini AI.**

[Report Bug](https://github.com/yourusername/gemini-ai-blog/issues) • [Request Feature](https://github.com/yourusername/gemini-ai-blog/issues) • [Star Repo](https://github.com/yourusername/gemini-ai-blog)

</div>

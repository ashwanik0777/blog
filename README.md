# 🤖 TechUpdatesZone Blog

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-2f74c0?style=for-the-badge&logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-0fa14c?style=for-the-badge&logo=mongodb)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)
![Gemini AI](https://img.shields.io/badge/Gemini-AI-blueviolet?style=for-the-badge&logo=google)
![Cloudinary](https://img.shields.io/badge/Cloudinary-Uploads-blue?style=for-the-badge&logo=cloudinary)

**An end-to-end, AI-native publishing platform with admin tooling, analytics, and multi-channel deployment.**

[Live Demo](#) • [Start Building](#-getting-started) • [API Reference](#-api-reference) • [Deployment](#-deployment--operations)

</div>

---

## 📚 Why This README?

This document serves as the single source of truth for the project, covering:

- Product & feature overview
- Architecture and data contracts
- Local development + environment setup
- API reference
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

- **AI-native authoring:** Gemini-powered generation, summaries, tags, alt text, moderation, and chatbot.
- **Full CMS:** Drafts, publishing, featured media (Cloudinary), custom comments system, newsletter capture.
- **Admin Dashboard:** Comprehensive analytics (visitors, views), user management, blog management, and settings.
- **Role-based control:** Admin/editor/reader roles with toggleable user states.
- **Modern UX:** Next.js 15 App Router, responsive UI, dark mode, Tailwind 4 + Framer Motion animations.
- **Enterprise-ready:** NextAuth (Google + Credentials), visitor tracking, issue reporting system.

---

## 🏗️ Architecture & Stack

```mermaid
graph TB
    subgraph Clients
        A["Public Web"]
        B["Admin Dashboard"]
        C["AI Chatbot Widget"]
    end

    subgraph "Next.js App"
        D["App Router Pages"]
        E["Shared Components"]
        F["API Routes (App Router)"]
        G["Real-time Notifications (App Router)"]
    end

    subgraph "Core Services"
        H["Auth · NextAuth"]
        I["Content Services"]
        J["AI Service Layer"]
        K["Analytics Engine"]
    end

    subgraph "Data Stores"
        L["MongoDB Atlas"]
        M["Cloudinary (Images)"]
    end

    subgraph "External Providers"
        N["Google Gemini"]
        O["Google OAuth"]
    end

    A --> D
    B --> D
    C --> E
    D --> F --> I --> L
    F --> H --> O
    F --> J --> N
    F --> M
```

### Layer Responsibilities
- **Presentation:** `src/app`, `src/components` for layouts, route groups, reusable UI.
- **Application:** `src/app/api`, authentication, validation, and orchestrations.
- **Business Logic:** API route handlers invoking services (blogs, users, newsletter, analytics).
- **Data Access:** `src/models`, `src/lib/mongodb*.ts` for schemas and connections.
- **External Integrations:** Gemini AI, Google OAuth, Cloudinary.

### Technology Stack

| Layer | Technologies |
|-------|--------------|
| Frontend | Next.js 15.4 (App Router), React 19, TypeScript, Tailwind CSS 4, Framer Motion |
| Backend | Node.js, Next.js API Routes, NextAuth, Mongoose |
| Database | MongoDB Atlas |
| Storage | Cloudinary (Image Uploads) |
| AI | Google Gemini (generation, moderation, summarization, chatbot, alt text) |
| Tooling | ESLint, Prettier |

---

## 📂 Project Structure

```
├── src/
│   ├── app/                 # App Router: Public, admin, auth, API routes
│   │   ├── (site)/          # Public pages: home, /blog/[slug], /topics, legal, contact
│   │   ├── admin/           # Staff login + dashboard
│   │   ├── api/             # Backend API endpoints
│   │   ├── sitemap.ts, robots.ts, feed.xml/   # SEO + RSS
│   │   └── ...
│   ├── components/          # Reusable UI components (AdminBlogEditor, Chatbot, etc.)
│   ├── lib/                 # Auth, security (validation + rate limits), blog data, email, MongoDB
│   ├── models/              # Mongoose Schemas: Blog, User, Comment, Settings, etc.
│   └── proxy.ts             # Rate limiting, CSRF checks, legacy URL redirects
├── pages/
│   └── api/                 # API Routes
├── public/                  # Static assets
├── package.json             # npm scripts + deps
└── README.md                # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js **18+**
- npm **10+**
- MongoDB Atlas cluster (or local Mongo)
- Google Gemini API key
- Cloudinary Account
- Google OAuth Credentials (optional)

### Bootstrap

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/gemini-ai-blog.git
   cd gemini-ai-blog
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment:**
   Create a single `.env` file in the root directory:

   ```env
   # Database
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/blog
   # Public site URL, no trailing slash (canonical URLs, sitemap, RSS, OG images)
   NEXT_PUBLIC_BASE_URL=http://localhost:3000

   # Session signing secret — long random string, required in production
   ADMIN_JWT_SECRET=

   # First admin (only used while no admin exists in the database; min 8 chars)
   ADMIN_NAME=Admin
   ADMIN_EMAIL=
   ADMIN_PASSWORD=

   # AI
   GEMINI_API_KEY=

   # Image Upload (Cloudinary)
   CLOUDINARY_CLOUD_NAME=
   CLOUDINARY_API_KEY=
   CLOUDINARY_API_SECRET=

   # Newsletter email (Resend) + scheduled sends
   RESEND_API_KEY=
   NEWSLETTER_FROM_EMAIL="TechUpdatesZone <newsletter@yourdomain.com>"
   CRON_SECRET=

   # Search engine verification (optional)
   GOOGLE_SITE_VERIFICATION=
   BING_SITE_VERIFICATION=
   ```

4. **Run the application:**
   ```bash
   npm run dev
   ```

5. **Initial Setup:**
   - Visit `http://localhost:3000/admin` and sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD` — the first admin account is created on that first login.
   - Change the password right away from **Settings → Password**.
   - Run **Settings → Maintenance → Sync indexes** once after the first deploy.

---

## 🧪 Run & Test Commands

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Serve production build
npm run lint         # ESLint
```

---

## 📡 API Reference

> Base path: `/src/app/api`

### Authentication
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/signin` | POST | Staff sign in (rate limited). The first admin is bootstrapped from `ADMIN_EMAIL` / `ADMIN_PASSWORD` only while no admin exists |
| `/api/auth/logout` | POST | Clear the session cookie |
| `/api/auth/admin-session` | GET | Current staff session (re-validated against the database) |

### Blog & Content
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/blog` | GET/POST | List blogs / Create blog |
| `/api/blog/[id]` | GET/PUT/PATCH/DELETE | Get, update, moderate, delete a blog (public pages use `/blog/<slug>`) |
| `/api/upload-image` | POST | Upload image to Cloudinary |

### AI Services
| Endpoint | Purpose | Payload |
|----------|---------|---------|
| `/api/ai/generate-blog` | Full draft generation | `{ title, keywords? }` |
| `/api/ai/summarize` | Summary | `{ content, maxLength? }` |
| `/api/ai/suggest-tags` | Tags/categories | `{ content, title? }` |
| `/api/ai/alt-text` | Image accessibility | `{ imageUrl }` |
| `/api/ai/moderate` | Content moderation | `{ content }` |
| `/api/ai/chat` | Conversational chatbot | `{ messages }` |

### User & Admin APIs
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/users` | GET/POST/DELETE | Manage users |
| `/api/admin/analytics` | GET | Dashboard KPIs |
| `/api/newsletter` | GET/POST | Subscribe / List subscribers |
| `/api/comments` | GET/POST | Public comments |
| `/api/visitors` | POST | Track visitor sessions |
| `/api/issues` | POST | Report issues |

---

## 👩‍💻 User & Admin Guide

### Getting Started
1. **First login:** Open `/admin` and sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env` (creates the first admin).
2. **Login:** Afterwards use `/admin` with your own credentials.
3. **Dashboard:** View analytics, manage content, and configure settings.

### Writing & Publishing
1. Navigate to `Dashboard → Blogs → Create`.
2. Enter a title and use **Generate with AI** to create a draft.
3. Upload a featured image (handled by Cloudinary).
4. Use the Markdown editor to refine content.
5. Publish or save as draft.

### Admin Features
- **Analytics:** Track views, visitors, and engagement.
- **User Management:** Manage roles (Admin, Editor, Reader) and access.
- **Newsletter:** View and manage subscribers.
- **Settings:** Configure site metadata and chatbot behavior.

### AI Chatbot
- Available on public pages.
- Powered by Gemini to answer questions based on context.

---

## 🤖 AI Capabilities

The platform leverages Google Gemini for:
- **Content Generation:** Creates structured blog posts from titles/keywords.
- **Moderation:** Automatically checks content for safety before publishing.
- **Accessibility:** Generates alt text for uploaded images.
- **Engagement:** Chatbot for visitor interaction.

---

## 🚢 Deployment

### Vercel (Recommended)
1. Push your code to a GitHub repository.
2. Import the project into Vercel.
3. Add all environment variables from `.env` (set `NEXT_PUBLIC_BASE_URL` to your real domain).
4. `vercel.json` schedules `/api/cron/newsletters` daily to deliver scheduled newsletters.
5. Deploy.

### Docker
(Standard Next.js Dockerfile structure applies)

---

## 🛡️ Security

- **Sessions:** HS256-signed, httpOnly + `SameSite=Strict` cookies; every admin API re-checks the user in the database, so disabled staff lose access immediately.
- **Brute force:** login is limited to 5 attempts per 15 minutes per IP.
- **Injection:** all inputs are type-checked and length-limited (blocks NoSQL operator injection); Markdown is rendered without raw HTML.
- **CSRF:** cross-site state-changing API requests are rejected in `src/proxy.ts`.
- **Headers:** CSP, HSTS, `X-Frame-Options: DENY`, `nosniff`, strict referrer and permissions policies (`next.config.ts`).
- **Abuse limits:** per-route rate limits, request size caps and honeypot fields on public forms. For real DDoS protection put Vercel Firewall or Cloudflare in front — in-app limits are per server instance.

---

## 🤝 Contributing

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Push to the branch.
5. Open a Pull Request.

---

<div align="center">

**Built with Next.js 15, Tailwind 4, and Google Gemini AI.**

</div>


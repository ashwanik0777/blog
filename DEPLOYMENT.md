# 🚀 Deployment Guide - Gemini AI Blog

Complete deployment guide for the Gemini AI Blog platform across different environments and platforms.

## 📋 Table of Contents

- [🌟 Quick Deploy](#-quick-deploy)
- [☁️ Vercel Deployment](#️-vercel-deployment)
- [🐳 Docker Deployment](#-docker-deployment)
- [🖥️ Self-Hosted Deployment](#️-self-hosted-deployment)
- [🔧 Environment Configuration](#-environment-configuration)
- [📊 Production Optimization](#-production-optimization)
- [🔒 Security Checklist](#-security-checklist)
- [📈 Monitoring & Analytics](#-monitoring--analytics)
- [🔄 CI/CD Pipeline](#-cicd-pipeline)

---

## 🌟 Quick Deploy

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/gemini-ai-blog)

### Prerequisites

- **MongoDB Atlas** account
- **Google Gemini API** key
- **Google OAuth** credentials (optional)
- **Domain name** (optional)

---

## ☁️ Vercel Deployment

### Step 1: Prepare Your Repository

1. **Fork or clone the repository**
   ```bash
   git clone https://github.com/yourusername/gemini-ai-blog.git
   cd gemini-ai-blog
   ```

2. **Push to your GitHub account**
   ```bash
   git remote set-url origin https://github.com/yourusername/gemini-ai-blog.git
   git push -u origin main
   ```

### Step 2: Deploy to Vercel

1. **Visit Vercel Dashboard**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"

2. **Import Repository**
   - Select your `gemini-ai-blog` repository
   - Vercel will auto-detect Next.js settings

3. **Configure Environment Variables**
   ```env
   MONGODB_URI=your_mongodb_atlas_connection_string
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=https://your-domain.vercel.app
   GEMINI_API_KEY=your_gemini_api_key
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

### Step 3: Custom Domain (Optional)

1. **Add Custom Domain**
   - Go to Project Settings → Domains
   - Add your domain
   - Update DNS records

2. **Update Environment Variables**
   ```env
   NEXTAUTH_URL=https://yourdomain.com
   NEXT_PUBLIC_BASE_URL=https://yourdomain.com
   ```

---

## 🐳 Docker Deployment

### Dockerfile

```dockerfile
# Use Node.js 18 Alpine image
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=${MONGODB_URI}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
      - NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL}
    restart: unless-stopped
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

### Nginx Configuration

```nginx
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:3000;
    }

    server {
        listen 80;
        server_name yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name yourdomain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        location / {
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
```

### Deployment Commands

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down

# Update and restart
docker-compose pull
docker-compose up -d
```

---

## 🖥️ Self-Hosted Deployment

### Ubuntu Server Setup

1. **Update System**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Install PM2**
   ```bash
   sudo npm install -g pm2
   ```

4. **Clone Repository**
   ```bash
   git clone https://github.com/yourusername/gemini-ai-blog.git
   cd gemini-ai-blog
   ```

5. **Install Dependencies**
   ```bash
   npm install
   ```

6. **Build Application**
   ```bash
   npm run build
   ```

7. **Start with PM2**
   ```bash
   pm2 start npm --name "gemini-ai-blog" -- start
   pm2 save
   pm2 startup
   ```

### Systemd Service

```ini
[Unit]
Description=Gemini AI Blog
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/gemini-ai-blog
ExecStart=/usr/bin/npm start
Restart=always
Environment=NODE_ENV=production
Environment=MONGODB_URI=your_mongodb_uri
Environment=NEXTAUTH_SECRET=your_secret
Environment=GEMINI_API_KEY=your_api_key

[Install]
WantedBy=multi-user.target
```

---

## 🔧 Environment Configuration

### Production Environment Variables

```env
# Application
NODE_ENV=production
NEXT_PUBLIC_BASE_URL=https://yourdomain.com

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gemini-blog?retryWrites=true&w=majority

# Authentication
NEXTAUTH_SECRET=your-super-secret-key-here
NEXTAUTH_URL=https://yourdomain.com

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# Optional: Redis for sessions
REDIS_URL=redis://localhost:6379

# Optional: Email service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Environment Variable Security

1. **Generate Secure Secrets**
   ```bash
   # Generate NEXTAUTH_SECRET
   openssl rand -base64 32
   
   # Generate random string
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Use Environment-Specific Files**
   ```bash
   .env.local          # Local development
   .env.production     # Production
   .env.staging        # Staging
   ```

---

## 📊 Production Optimization

### Performance Optimization

1. **Enable Compression**
   ```javascript
   // next.config.js
   const withBundleAnalyzer = require('@next/bundle-analyzer')({
     enabled: process.env.ANALYZE === 'true',
   });

   module.exports = withBundleAnalyzer({
     compress: true,
     poweredByHeader: false,
     generateEtags: false,
   });
   ```

2. **Image Optimization**
   ```javascript
   // next.config.js
   module.exports = {
     images: {
       domains: ['your-cdn-domain.com'],
       formats: ['image/webp', 'image/avif'],
     },
   };
   ```

3. **Caching Strategy**
   ```javascript
   // middleware.ts
   export function middleware(request: NextRequest) {
     const response = NextResponse.next();
     
     // Cache static assets
     if (request.nextUrl.pathname.startsWith('/_next/')) {
       response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
     }
     
     return response;
   }
   ```

### Database Optimization

1. **MongoDB Atlas Configuration**
   ```javascript
   // lib/mongodb.ts
   const mongoose = require('mongoose');

   const MONGODB_URI = process.env.MONGODB_URI;

   if (!MONGODB_URI) {
     throw new Error('Please define the MONGODB_URI environment variable');
   }

   let cached = global.mongoose;

   if (!cached) {
     cached = global.mongoose = { conn: null, promise: null };
   }

   async function dbConnect() {
     if (cached.conn) {
       return cached.conn;
     }

     if (!cached.promise) {
       const opts = {
         bufferCommands: false,
         maxPoolSize: 10,
         serverSelectionTimeoutMS: 5000,
         socketTimeoutMS: 45000,
       };

       cached.promise = mongoose.connect(MONGODB_URI, opts);
     }

     cached.conn = await cached.promise;
     return cached.conn;
   }

   module.exports = dbConnect;
   ```

2. **Index Optimization**
   ```javascript
   // models/Blog.js
   BlogSchema.index({ slug: 1 });
   BlogSchema.index({ published: 1, createdAt: -1 });
   BlogSchema.index({ author: 1 });
   BlogSchema.index({ tags: 1 });
   ```

---

## 🔒 Security Checklist

### Pre-Deployment Security

- [ ] **Environment Variables**
  - [ ] All secrets are in environment variables
  - [ ] No hardcoded credentials
  - [ ] Secrets are properly generated

- [ ] **Authentication**
  - [ ] JWT tokens are secure
  - [ ] Session management is configured
  - [ ] CSRF protection is enabled

- [ ] **Database Security**
  - [ ] MongoDB Atlas is properly configured
  - [ ] Database user has minimal permissions
  - [ ] Connection string is secure

- [ ] **API Security**
  - [ ] Rate limiting is implemented
  - [ ] Input validation is in place
  - [ ] CORS is properly configured

### Post-Deployment Security

- [ ] **SSL/TLS**
  - [ ] HTTPS is enforced
  - [ ] SSL certificate is valid
  - [ ] HSTS headers are set

- [ ] **Monitoring**
  - [ ] Error logging is configured
  - [ ] Security monitoring is active
  - [ ] Backup strategy is in place

---

## 📈 Monitoring & Analytics

### Application Monitoring

1. **Vercel Analytics**
   ```javascript
   // app/layout.tsx
   import { Analytics } from '@vercel/analytics/react';

   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           {children}
           <Analytics />
         </body>
       </html>
     );
   }
   ```

2. **Error Tracking**
   ```javascript
   // lib/sentry.js
   import * as Sentry from '@sentry/nextjs';

   Sentry.init({
     dsn: process.env.SENTRY_DSN,
     environment: process.env.NODE_ENV,
   });
   ```

3. **Performance Monitoring**
   ```javascript
   // next.config.js
   module.exports = {
     experimental: {
       instrumentationHook: true,
     },
   };
   ```

### Health Checks

```javascript
// app/api/health/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';

export async function GET() {
  try {
    await dbConnect();
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'unhealthy', error: error.message },
      { status: 500 }
    );
  }
}
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Run linting
      run: npm run lint
    
    - name: Build application
      run: npm run build
      env:
        MONGODB_URI: ${{ secrets.MONGODB_URI }}
        NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
        GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
```

### Environment-Specific Deployments

```yaml
# .github/workflows/deploy-staging.yml
name: Deploy to Staging

on:
  push:
    branches: [develop]

jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to Staging
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.STAGING_PROJECT_ID }}
        vercel-args: '--target staging'
```

---

## 🚀 Deployment Checklist

### Pre-Deployment

- [ ] Code review completed
- [ ] Tests are passing
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificate installed
- [ ] Domain DNS configured

### Deployment

- [ ] Build successful
- [ ] Application starts without errors
- [ ] Database connection established
- [ ] AI services are responding
- [ ] Authentication working
- [ ] Admin dashboard accessible

### Post-Deployment

- [ ] Health check endpoint responding
- [ ] Monitoring alerts configured
- [ ] Backup system tested
- [ ] Performance metrics collected
- [ ] Security scan completed
- [ ] Documentation updated

---

## 📞 Support

### Deployment Issues

- **Vercel Issues**: Check [Vercel Documentation](https://vercel.com/docs)
- **Docker Issues**: Check [Docker Documentation](https://docs.docker.com)
- **MongoDB Issues**: Check [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com)

### Common Problems

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Review build logs for errors

2. **Environment Variables**
   - Ensure all required variables are set
   - Check variable names and values
   - Verify no typos in configuration

3. **Database Connection**
   - Verify MongoDB Atlas connection string
   - Check network access and IP whitelist
   - Ensure database user has proper permissions

---

<div align="center">

**Deployment Guide for Gemini AI Blog** 🚀

*Deploy with confidence and scale with ease*

</div> 
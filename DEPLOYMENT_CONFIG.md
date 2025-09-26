# Deployment & Hosting Konfigürasyonu

## 🚀 Hosting Stratejisi

### Frontend Deployment (Netlify)
```yaml
# netlify.toml
[build]
  base = "frontend/"
  command = "npm run build"
  publish = "dist/"

[build.environment]
  NODE_VERSION = "18"
  NPM_VERSION = "9"

# Redirect rules for SPA
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Custom headers
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"

# Cache static assets
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

# API proxy to backend
[[redirects]]
  from = "/api/*"
  to = "https://api.hasanarthuraltuntas.xyz/:splat"
  status = 200
  force = true

# Environment variables
[context.production.environment]
  NEXT_PUBLIC_API_URL = "https://api.hasanarthuraltuntas.xyz"
  NEXT_PUBLIC_ENVIRONMENT = "production"
  NEXT_PUBLIC_VERCEL_ANALYTICS_ID = "prj_xxxxx"

[context.staging.environment]
  NEXT_PUBLIC_API_URL = "https://staging-api.hasanarthuraltuntas.xyz"
  NEXT_PUBLIC_ENVIRONMENT = "staging"

[context.development.environment]
  NEXT_PUBLIC_API_URL = "http://localhost:3001"
  NEXT_PUBLIC_ENVIRONMENT = "development"
```

### Backend Deployment (Vercel)
```json
// vercel.json
{
  "version": 2,
  "name": "hasanarthuraltuntas-api",
  "builds": [
    {
      "src": "api/**/*.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/health",
      "dest": "/api/health"
    }
  ],
  "functions": {
    "api/**/*.ts": {
      "maxDuration": 30
    },
    "api/data/process.ts": {
      "maxDuration": 300
    },
    "api/music/analyze.ts": {
      "maxDuration": 300
    }
  },
  "env": {
    "NODE_ENV": "production",
    "DATABASE_URL": "@database-url",
    "REDIS_URL": "@redis-url",
    "JWT_SECRET": "@jwt-secret",
    "REFRESH_SECRET": "@refresh-secret",
    "BLOB_READ_WRITE_TOKEN": "@blob-token"
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "https://hasanarthuraltuntas.xyz"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

## 🔧 Environment Configurations

### Production Environment Variables
```bash
# Frontend (.env.production)
NEXT_PUBLIC_API_URL=https://api.hasanarthuraltuntas.xyz
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=prj_xxxxx
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx

# Backend (.env.production) - Stored in Vercel
DATABASE_URL=postgresql://username:password@hostname:port/database
REDIS_URL=redis://username:password@hostname:port
JWT_SECRET=your-super-secure-jwt-secret-key
REFRESH_SECRET=your-super-secure-refresh-secret-key
BLOB_READ_WRITE_TOKEN=vercel-blob-token
SENDGRID_API_KEY=SG.xxxxx
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
OPENAI_API_KEY=sk-xxxxx (if using OpenAI services)
```

### Staging Environment Variables
```bash
# Frontend (.env.staging)
NEXT_PUBLIC_API_URL=https://staging-api.hasanarthuraltuntas.xyz
NEXT_PUBLIC_ENVIRONMENT=staging
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=prj_staging_xxxxx

# Backend (.env.staging)
DATABASE_URL=postgresql://staging-db-url
REDIS_URL=redis://staging-redis-url
JWT_SECRET=staging-jwt-secret
REFRESH_SECRET=staging-refresh-secret
```

### Development Environment Variables
```bash
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_ENVIRONMENT=development
NEXT_PUBLIC_DEBUG=true

# Backend (.env.local)
DATABASE_URL=postgresql://localhost:5432/datasetcogaltici_dev
REDIS_URL=redis://localhost:6379
JWT_SECRET=dev-jwt-secret-key
REFRESH_SECRET=dev-refresh-secret-key
PORT=3001
NODE_ENV=development
```

## 🗄️ Database Deployment

### PostgreSQL Setup (Vercel Postgres)
```sql
-- Production database initialization script
-- init.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create production database schema
\i schema.sql

-- Create indexes for performance
\i indexes.sql

-- Insert initial data
\i seeds/production.sql

-- Set up Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE processed_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE detection_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY users_own_data ON users
  FOR ALL USING (id = current_setting('app.current_user_id')::uuid);

CREATE POLICY users_own_uploads ON data_uploads
  FOR ALL USING (user_id = current_setting('app.current_user_id')::uuid);

CREATE POLICY users_own_processed_files ON processed_files
  FOR ALL USING (
    upload_id IN (
      SELECT id FROM data_uploads
      WHERE user_id = current_setting('app.current_user_id')::uuid
    )
  );
```

### Database Migration Script
```bash
#!/bin/bash
# scripts/migrate.sh

set -e

# Load environment variables
source .env.production

echo "Starting database migration..."

# Run migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Seed production data if needed
if [ "$SEED_PRODUCTION" = "true" ]; then
  echo "Seeding production database..."
  npx prisma db seed
fi

echo "Database migration completed successfully!"
```

## 📦 CI/CD Pipeline

### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '18'

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: |
          cd frontend && npm ci
          cd ../backend && npm ci

      - name: Run linting
        run: |
          cd frontend && npm run lint
          cd ../backend && npm run lint

      - name: Run type checking
        run: |
          cd frontend && npm run type-check
          cd ../backend && npm run type-check

      - name: Run tests
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
          REDIS_URL: redis://localhost:6379
          JWT_SECRET: test-jwt-secret
        run: |
          cd backend && npm run test
          cd ../frontend && npm run test

      - name: Run E2E tests
        run: |
          cd frontend && npm run test:e2e

  build-frontend:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install frontend dependencies
        run: cd frontend && npm ci

      - name: Build frontend
        env:
          NEXT_PUBLIC_API_URL: https://api.hasanarthuraltuntas.xyz
          NEXT_PUBLIC_ENVIRONMENT: production
        run: cd frontend && npm run build

      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v2.0
        with:
          publish-dir: './frontend/dist'
          production-branch: main
          github-token: ${{ secrets.GITHUB_TOKEN }}
          deploy-message: "Deploy from GitHub Actions"
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./backend
          vercel-args: '--prod'

  notify:
    needs: [build-frontend, deploy-backend]
    runs-on: ubuntu-latest
    if: always()

    steps:
      - name: Notify deployment status
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          channel: '#deployments'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## 🔍 Monitoring Setup

### Health Check Endpoints
```typescript
// api/health.ts
import { NextRequest, NextResponse } from 'next/server'
import { createConnection } from '../lib/database'
import { createRedisClient } from '../lib/redis'

export async function GET(request: NextRequest) {
  const checks = {
    database: false,
    redis: false,
    storage: false,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  }

  try {
    // Database health check
    const db = createConnection()
    await db.query('SELECT 1')
    checks.database = true
    await db.end()
  } catch (error) {
    console.error('Database health check failed:', error)
  }

  try {
    // Redis health check
    const redis = createRedisClient()
    await redis.ping()
    checks.redis = true
    await redis.quit()
  } catch (error) {
    console.error('Redis health check failed:', error)
  }

  try {
    // Storage health check (verify blob storage access)
    const { head } = await import('@vercel/blob')
    await head('health-check.txt')
    checks.storage = true
  } catch (error) {
    console.error('Storage health check failed:', error)
  }

  const allHealthy = Object.values(checks).every(check =>
    typeof check === 'boolean' ? check : true
  )

  return NextResponse.json(checks, {
    status: allHealthy ? 200 : 503,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Content-Type': 'application/json'
    }
  })
}
```

### Error Tracking (Sentry)
```typescript
// lib/sentry.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_ENVIRONMENT || 'development',

  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Error filtering
  beforeSend(event, hint) {
    // Filter out development errors
    if (process.env.NODE_ENV === 'development') {
      return null
    }

    // Filter out specific errors
    if (event.exception) {
      const error = hint.originalException
      if (error && error.message && error.message.includes('Non-Error promise rejection')) {
        return null
      }
    }

    return event
  },

  // Performance monitoring for specific operations
  beforeTransaction(context) {
    if (context.name?.includes('/api/')) {
      context.tags = { ...context.tags, type: 'api' }
    }
    return context
  }
})

export { Sentry }
```

## 📊 Performance Monitoring

### Vercel Analytics Setup
```typescript
// components/Analytics.tsx
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Analytics />
      <SpeedInsights />
    </>
  )
}
```

### Custom Performance Tracking
```typescript
// lib/analytics.ts
interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  metadata?: Record<string, any>
}

export class PerformanceTracker {
  private static queue: PerformanceMetric[] = []
  private static batchSize = 10
  private static endpoint = '/api/analytics/performance'

  static track(name: string, value: number, metadata?: Record<string, any>) {
    this.queue.push({
      name,
      value,
      timestamp: Date.now(),
      metadata
    })

    if (this.queue.length >= this.batchSize) {
      this.flush()
    }
  }

  static async flush() {
    if (this.queue.length === 0) return

    const metrics = [...this.queue]
    this.queue = []

    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ metrics })
      })
    } catch (error) {
      console.error('Failed to send performance metrics:', error)
      // Re-queue failed metrics
      this.queue.unshift(...metrics)
    }
  }

  // Track Web Vitals
  static trackWebVitals() {
    if (typeof window !== 'undefined') {
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(metric => this.track('CLS', metric.value, { id: metric.id }))
        getFID(metric => this.track('FID', metric.value, { id: metric.id }))
        getFCP(metric => this.track('FCP', metric.value, { id: metric.id }))
        getLCP(metric => this.track('LCP', metric.value, { id: metric.id }))
        getTTFB(metric => this.track('TTFB', metric.value, { id: metric.id }))
      })
    }
  }
}
```

## 🔄 Backup & Recovery

### Database Backup Script
```bash
#!/bin/bash
# scripts/backup.sh

set -e

# Configuration
BACKUP_DIR="/tmp/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_${DATE}.sql"
S3_BUCKET="hasanarthuraltuntas-backups"

# Create backup directory
mkdir -p $BACKUP_DIR

echo "Starting database backup..."

# Create database dump
pg_dump $DATABASE_URL > "$BACKUP_DIR/$BACKUP_FILE"

# Compress backup
gzip "$BACKUP_DIR/$BACKUP_FILE"

# Upload to cloud storage (if configured)
if [ ! -z "$S3_BUCKET" ]; then
  echo "Uploading backup to S3..."
  aws s3 cp "$BACKUP_DIR/${BACKUP_FILE}.gz" "s3://$S3_BUCKET/database/"
fi

# Clean up local files older than 7 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: ${BACKUP_FILE}.gz"
```

### Automated Backup (GitHub Actions)
```yaml
# .github/workflows/backup.yml
name: Database Backup

on:
  schedule:
    - cron: '0 2 * * *' # Daily at 2 AM UTC
  workflow_dispatch: # Manual trigger

jobs:
  backup:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Install PostgreSQL client
        run: |
          sudo apt-get update
          sudo apt-get install -y postgresql-client

      - name: Create database backup
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: |
          ./scripts/backup.sh

      - name: Upload backup artifact
        uses: actions/upload-artifact@v4
        with:
          name: database-backup-${{ github.run_number }}
          path: /tmp/backups/
          retention-days: 30
```

Bu deployment konfigürasyonu, projenin production'a çıkması için gereken tüm adımları ve ayarları kapsamlı olarak tanımlar.
# Production Deployment & Configuration Guide

## Environment Setup

### Production Environment Variables

Add these to your production environment (Vercel, AWS, etc.):

```env
# Database
MONGODB_URI=mongodb+srv://prod_user:prod_password@prod-cluster.mongodb.net/anivault

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
CLERK_SIGNING_KEY=whsec_...

# Admin Configuration
ADMIN_USER_IDS=user123,user456

# Cron Job Secret (must be secure)
CRON_SECRET=your-super-secure-random-string-here

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=anime-videos-prod
AWS_REGION=us-east-1
AWS_S3_SIGNED_URL_EXPIRES=3600

# CDN Configuration
CDN_URL=https://d1234567890.cloudfront.net
CLOUDFRONT_KEY_ID=APKA...
CLOUDFRONT_PRIVATE_KEY=...

# Email Configuration (for notifications)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=SG....

# Jikan API
JIKAN_API_RATE_LIMIT=60
JIKAN_API_TIMEOUT=10000

# Logging
LOG_LEVEL=info
SENTRY_DSN=https://...

# Feature Flags
ENABLE_OFFLINE_DOWNLOADS=true
ENABLE_PUSH_NOTIFICATIONS=true
ENABLE_USER_UPLOADS=false
```

---

## Vercel Deployment

### 1. Configure Cron Jobs

Add to `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm ci",
  "env": {
    "CRON_SECRET": "@cron_secret"
  },
  "crons": [
    {
      "path": "/api/cron/update-episodes",
      "schedule": "0 */6 * * *"
    },
    {
      "path": "/api/cron/cleanup-old-logs",
      "schedule": "0 0 * * 0"
    }
  ]
}
```

### 2. Deploy

```bash
npm install -g vercel
vercel env add CRON_SECRET
vercel deploy
```

---

## AWS Deployment

### 1. Using Lambda + EventBridge

**Lambda Function (Serverless Handler)**:

```typescript
// vercel.json or serverless.yml configuration
{
  "functions": {
    "api/cron/update-episodes": {
      "memory": 512,
      "timeout": 900,
      "environment": {
        "CRON_SECRET": "${{CRON_SECRET}}"
      }
    }
  }
}
```

**EventBridge Rule**:

```json
{
  "Name": "anime-update-schedule",
  "ScheduleExpression": "cron(0 */6 * * ? *)",
  "State": "ENABLED",
  "Targets": [
    {
      "Arn": "arn:aws:lambda:region:account:function:update-episodes",
      "RoleArn": "arn:aws:iam::account:role/lambda-invoke-role"
    }
  ]
}
```

### 2. S3 Configuration for Videos

```bash
# Create S3 bucket
aws s3 mb s3://anime-videos-prod --region us-east-1

# Configure CORS
aws s3api put-bucket-cors --bucket anime-videos-prod --cors-configuration file://cors.json

# Enable CloudFront
aws cloudfront create-distribution --distribution-config file://cloudfront.json

# Set up lifecycle policy
aws s3api put-bucket-lifecycle-configuration --bucket anime-videos-prod --lifecycle-configuration file://lifecycle.json
```

---

## Database Best Practices

### 1. Connection Pooling

```typescript
// Recommended pool size for production
const mongoOptions = {
  maxPoolSize: 50,
  minPoolSize: 10,
  maxIdleTimeMS: 60000,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};
```

### 2. Backup Strategy

```bash
# Daily automated backup
mongodump --uri="$MONGODB_URI" --out=/backups/$(date +%Y%m%d)

# Restore from backup
mongorestore --uri="$MONGODB_URI" --dir=/backups/20240115
```

### 3. Monitoring & Alerts

Add to MongoDB Atlas:

```yaml
alerts:
  - name: High CPU Usage
    threshold: 80
    duration: 5m
    notification: email
  
  - name: Connection Pool Exhausted
    threshold: 95
    notification: slack
  
  - name: Slow Queries
    slow_query_ms: 1000
    notification: email
```

---

## Performance Optimization

### 1. Query Optimization

```typescript
// Add indexes to frequently queried fields
db.episodes.createIndex(
  { animeId: 1, episodeNumber: 1, 'formats.subbed.available': 1 },
  { name: 'idx_episode_format_lookup' }
);

db.userPreferences.createIndex(
  { userId: 1, 'watchHistory.episodeId': 1 },
  { name: 'idx_user_watch_history' }
);
```

### 2. Caching Layer

```typescript
// Use Redis for frequently accessed data
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_TOKEN,
});

async function getEpisodeWithCache(episodeId: string) {
  // Check cache first
  const cached = await redis.get(`episode:${episodeId}`);
  if (cached) return cached;

  // Fetch from DB
  const episode = await getEpisodeById(episodeId);

  // Cache for 24 hours
  await redis.set(`episode:${episodeId}`, episode, {
    ex: 86400,
  });

  return episode;
}
```

### 3. Image Optimization

```typescript
// Use Next.js Image component
import Image from 'next/image';

<Image
  src={anime.imageUrl}
  alt={anime.name}
  width={300}
  height={400}
  priority
  quality={75}
/>
```

---

## Security Measures

### 1. Rate Limiting

```typescript
import { Ratelimit } from '@upstash/ratelimit';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 h'),
});

export async function middleware(request: NextRequest) {
  const ip = request.ip || 'unknown';
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }
}
```

### 2. HTTPS & HSTS

```typescript
// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        }
      ]
    }
  ]
}
```

### 3. CORS Policy

```typescript
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  response.headers.set('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  return response;
}
```

### 4. Input Validation

```typescript
// Validate all user inputs
import { z } from 'zod';

const episodeQuerySchema = z.object({
  format: z.enum(['subbed', 'dubbed']),
  language: z.string().min(2).max(50),
  quality: z.enum(['360p', '480p', '720p', '1080p']),
});

export async function GET(request: NextRequest) {
  const params = episodeQuerySchema.parse(
    Object.fromEntries(new URL(request.url).searchParams)
  );
  // ... proceed with validated params
}
```

---

## Monitoring & Logging

### 1. Error Tracking

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

### 2. Performance Monitoring

```typescript
import { performance } from 'perf_hooks';

export async function logPerformance(
  operation: string,
  fn: () => Promise<any>
) {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;

  console.log(`[${operation}] Completed in ${duration.toFixed(2)}ms`);

  if (duration > 1000) {
    Sentry.captureMessage(`Slow operation: ${operation}`, 'warning');
  }

  return result;
}
```

### 3. Health Check Endpoint

```typescript
export async function GET() {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    s3: await checkS3(),
    apiResponse: true,
  };

  const allHealthy = Object.values(checks).every(c => c === true);

  return NextResponse.json(
    { status: allHealthy ? 'healthy' : 'degraded', checks },
    { status: allHealthy ? 200 : 503 }
  );
}
```

---

## Scaling Considerations

### Horizontal Scaling

```typescript
// Use serverless features for auto-scaling
// - Vercel Functions scale automatically
// - Lambda functions scale on demand
// - Database read replicas for read-heavy operations
```

### Database Sharding

```typescript
// For very large datasets, shard by animeId
const getShardKey = (animeId: string) => {
  return parseInt(animeId.substring(0, 8), 16) % NUM_SHARDS;
};

const getShardCollection = async (animeId: string) => {
  const shard = getShardKey(animeId);
  return db.collection(`episodes_shard_${shard}`);
};
```

---

## Disaster Recovery

### 1. Backup Schedule

```bash
# Daily automated backups
0 2 * * * mongodump --uri="$MONGODB_URI" --archive=/backups/daily-$(date +\%Y\%m\%d).archive
0 4 * * 0 mongodump --uri="$MONGODB_URI" --archive=/backups/weekly-$(date +\%Y-\%V).archive
0 5 1 * * mongodump --uri="$MONGODB_URI" --archive=/backups/monthly-$(date +\%Y\%m).archive
```

### 2. Failover Configuration

```typescript
// Use MongoDB replica sets
const mongoUri = process.env.MONGODB_URI;
// mongodb+srv://user:pass@primary,secondary,tertiary/db
```

### 3. Incident Response

1. **Immediate Actions**
   - Isolate affected components
   - Notify users via status page
   - Begin rollback if needed

2. **Communication**
   - Update status.page.io every 15 minutes
   - Tweet from official account
   - Send email to affected users

3. **Investigation**
   - Check logs (Sentry, CloudWatch)
   - Review recent deployments
   - Check database health
   - Analyze metrics

---

## Cost Optimization

### 1. Database Costs

| Provider | Cost | Notes |
|----------|------|-------|
| MongoDB Atlas M0 | Free | Limited to 512MB |
| MongoDB Atlas M2 | $9/month | Recommended minimum |
| MongoDB Atlas M10 | $57/month | High performance |

### 2. Storage Costs

| Provider | Cost | Notes |
|----------|------|-------|
| AWS S3 | $0.023/GB | Tier 1 storage |
| AWS Glacier | $0.004/GB | Archive storage |
| Cloudflare R2 | $0.015/GB | Egress free |

### 3. Compute Costs

| Provider | Cost | Notes |
|----------|------|-------|
| Vercel Hobby | Free | 100GB bandwidth |
| Vercel Pro | $20/month | 1TB bandwidth |
| AWS Lambda | $0.20/1M | Within free tier |

---

## Maintenance Schedule

```
Daily:
- Monitor error rates and performance metrics
- Check database size and growth
- Run health checks

Weekly:
- Update dependencies
- Review slow queries
- Audit user access logs

Monthly:
- Full database backup
- Security audit
- Performance optimization review
- Cost analysis

Quarterly:
- Major version upgrades
- Capacity planning
- Disaster recovery drill
```

For additional information, visit:
- [Vercel Deployment Documentation](https://vercel.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [AWS Best Practices](https://aws.amazon.com/architecture/well-architected/)

# Production Deployment Guide

ContentFlow is ready for deployment across modern cloud platforms.

## Deploying on Vercel

1. Push your repository to GitHub.
2. Import project into Vercel.
3. Add Environment Variables:
   - `DATABASE_URL`: Connection string to Neon PostgreSQL.
   - `AUTH_SECRET`: Random 32-byte secret string.
   - `NEXTAUTH_URL`: Your production domain (e.g. `https://contentflow.io`).
   - `NEXT_PUBLIC_APP_URL`: Your production domain.
   - `RESEND_API_KEY`: Resend email API key.
   - `CRON_SECRET`: Secret token for scheduled publishing worker.
4. Deploy!

## Scheduled Publishing Cron Trigger

Configure Vercel Cron or GitHub Actions to send a scheduled HTTP request every 5-15 minutes:
```bash
curl -X POST https://yourdomain.com/api/cron/schedule \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Docker Container Deployment

```bash
docker compose up -d --build
```

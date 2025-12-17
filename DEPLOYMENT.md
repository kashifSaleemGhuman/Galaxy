# Galaxy ERP - Vercel Deployment Guide

## 🚀 Deployment Steps

### 1. Git Repository Setup
```bash
# Commit all deployment changes
git add .
git commit -m "feat: prepare for Vercel deployment"
git push origin dev-kashif
```

### 2. Vercel Dashboard Setup

1. **Visit**: [vercel.com/dashboard](https://vercel.com/dashboard)
2. **Import Project**: Click "Add New..." → "Project"
3. **Connect Repository**: Select your Git provider and Galaxy repository
4. **Choose Branch**: Select `dev-kashif` branch
5. **Framework**: Next.js (auto-detected)

### 3. Environment Variables Configuration

In Vercel Dashboard → Project Settings → Environment Variables:

```env
# Database Configuration
DATABASE_URL=postgres://4c5e6bc6e2170edafd853657a2e7f9380eaee92c733e1f037dee71680ccfc1c2:sk_QEVyfRZzOxulIkEC4Qu0Y@db.prisma.io:5432/postgres?sslmode=require
PRISMA_DATABASE_URL=prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19RRVZ5ZlJaek94dWxJa0VDNFF1MFkiLCJhcGlfa2V5IjoiMDFLOEFIMTJNMjhENFdQMDYxOUNZUjFYRU0iLCJ0ZW5hbnRfaWQiOiI0YzVlNmJjNmUyMTcwZWRhZmQ4NTM2NTdhMmU3ZjkzODBlYWVlOTJjNzMzZTFmMDM3ZGVlNzE2ODBjY2ZjMWMyIiwiaW50ZXJuYWxfc2VjcmV0IjoiM2ViNDg5ZDYtNTgyOC00NmU2LWFkZmEtMDJjMWY5ZjU3NTA3In0.GaaWLjufdluEDmAo8M8nIgTP57qlLgbHVnsEf-Ij21M

# NextAuth Configuration
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=your-production-secret-key-here

# Application Configuration
NODE_ENV=production
APP_URL=https://your-app-name.vercel.app

# Security Configuration
JWT_SECRET=your-production-jwt-secret
BCRYPT_ROUNDS=12

# Redis Configuration (Optional - for caching)
REDIS_URL=your-redis-url-if-needed

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 4. Build Configuration

Vercel will automatically detect:
- **Framework**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 5. Database Migration

After deployment, run database migrations:

```bash
# Option 1: Using Vercel CLI
vercel env pull .env.local
npx prisma migrate deploy

# Option 2: Using the migration script
node scripts/migrate.js
```

### 6. Post-Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations deployed
- [ ] Application accessible at Vercel URL
- [ ] Authentication working
- [ ] Database connections established
- [ ] All API endpoints functional

## 🔧 Troubleshooting

### Common Issues:

1. **Build Failures**:
   - Check environment variables
   - Ensure all dependencies are in package.json
   - Verify Prisma schema is correct

2. **Database Connection Issues**:
   - Verify DATABASE_URL format
   - Check database credentials
   - Ensure database is accessible from Vercel

3. **Authentication Issues**:
   - Verify NEXTAUTH_URL matches deployment URL
   - Check NEXTAUTH_SECRET is set
   - Ensure callback URLs are configured

### Useful Commands:

```bash
# Check deployment logs
vercel logs

# Pull environment variables
vercel env pull .env.local

# Run migrations locally with production DB
npx prisma migrate deploy

# Check database connection
npx prisma db pull
```

## 📊 Monitoring

- **Vercel Dashboard**: Monitor deployments and performance
- **Function Logs**: Check serverless function execution
- **Database**: Monitor Prisma database connections
- **Analytics**: Set up Vercel Analytics for user insights

## 🔄 Automatic Deployments

Once connected to Git:
- Every push to `dev-kashif` triggers automatic deployment
- Preview deployments for pull requests
- Production deployments for main branch merges

## 🚀 Next Steps

1. Set up custom domain (optional)
2. Configure SSL certificates
3. Set up monitoring and alerts
4. Configure backup strategies
5. Set up staging environment

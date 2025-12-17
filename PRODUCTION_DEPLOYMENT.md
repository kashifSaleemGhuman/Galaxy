# Production Deployment Guide

## ✅ What Happens Automatically

When you push to Vercel, the `vercel-build` script automatically:
1. ✅ **Generates Prisma Client** - Creates the database client
2. ✅ **Pushes Schema** - Creates/updates all database tables (Organization, Employee, Document, Machine, Permit, etc.)
3. ✅ **Seeds Database** - Creates initial data:
   - Admin user: `admin@galaxy.com` / `admin123` (if doesn't exist)
   - Demo users: `manager@galaxy.com`, `user@galaxy.com` (if don't exist)
   - Sample vendors and products (if don't exist)
4. ✅ **Builds Next.js App** - Compiles the application

**The seed script is idempotent** - it checks if data exists before creating, so it's safe to run multiple times.

## 🔧 Required: Set Environment Variables in Vercel

You **MUST** set these environment variables in Vercel Dashboard:

### Required Variables:

1. **DATABASE_URL** (Required)
   ```
   postgres://4c5e6bc6e2170edafd853657a2e7f9380eaee92c733e1f037dee71680ccfc1c2:sk_QEVyfRZzOxulIkEC4Qu0Y@db.prisma.io:5432/postgres?sslmode=require
   ```

2. **PRISMA_DATABASE_URL** (Optional but Recommended for Performance)
   ```
   prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19RRVZ5ZlJaek94dWxJa0VDNFF1MFkiLCJhcGlfa2V5IjoiMDFLOEFIMTJNMjhENFdQMDYxOUNZUjFYRU0iLCJ0ZW5hbnRfaWQiOiI0YzVlNmJjNmUyMTcwZWRhZmQ4NTM2NTdhMmU3ZjkzODBlYWVlOTJjNzMzZTFmMDM3ZGVlNzE2ODBjY2ZjMWMyIiwiaW50ZXJuYWxfc2VjcmV0IjoiM2ViNDg5ZDYtNTgyOC00NmU2LWFkZmEtMDJjMWY5ZjU3NTA3In0.GaaWLjufdluEDmAo8M8nIgTP57qlLgbHVnsEf-Ij21M
   ```

3. **NEXTAUTH_URL** (Required - Update with your actual Vercel URL)
   ```
   https://your-app-name.vercel.app
   ```

4. **NEXTAUTH_SECRET** (Required - Generate a secure random string)
   ```
   # Generate a secure secret:
   openssl rand -base64 32
   # Or use: https://generate-secret.vercel.app/32
   ```

5. **NODE_ENV** (Required)
   ```
   production
   ```

### Optional Variables:

- `APP_URL` - Your production URL
- `JWT_SECRET` - For JWT tokens (if used separately)
- `BCRYPT_ROUNDS` - Password hashing rounds (default: 12)
- `REDIS_URL` - If using Redis for caching
- `SMTP_*` - If using email features

## 📋 Deployment Steps

### Step 1: Set Environment Variables in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add all required variables listed above
5. Make sure to select **Production**, **Preview**, and **Development** environments

### Step 2: Push Your Code

```bash
git add .
git commit -m "feat: ready for production deployment"
git push origin main  # or your deployment branch
```

### Step 3: Vercel Automatically Deploys

Vercel will:
- Install dependencies
- Run `vercel-build` script which:
  - Generates Prisma client
  - Pushes database schema
  - Seeds initial data (admin user, etc.)
  - Builds the application
- Deploy to production

### Step 4: Verify Deployment

1. ✅ Check build logs in Vercel dashboard
2. ✅ Visit your production URL
3. ✅ Login with: `admin@galaxy.com` / `admin123`
4. ✅ Test organization module APIs
5. ✅ Verify all features work

## 🎯 What You DON'T Need to Do

- ❌ **No manual database seeding** - Handled automatically by `vercel-build`
- ❌ **No manual schema push** - Handled automatically
- ❌ **No code changes** - Everything is already configured
- ❌ **No separate migration commands** - `prisma db push` handles it

## ⚠️ Important Notes

1. **First Deployment**: The seed script will create the admin user automatically
2. **Subsequent Deployments**: Seed script checks if data exists, so it won't duplicate
3. **Database Connection**: The `db.js` file automatically detects production database
4. **NEXTAUTH_URL**: Must match your actual Vercel deployment URL exactly
5. **NEXTAUTH_SECRET**: Must be the same across all deployments (don't regenerate)

## 🔐 Security Recommendations

1. **Change Admin Password**: After first login, change the default `admin123` password
2. **Use Strong NEXTAUTH_SECRET**: Generate a secure random string
3. **Enable HTTPS**: Vercel does this automatically
4. **Review Environment Variables**: Don't commit secrets to Git

## 🐛 Troubleshooting

### Build Fails
- Check environment variables are set correctly
- Verify DATABASE_URL is accessible from Vercel
- Check build logs for specific errors

### Can't Login
- Verify NEXTAUTH_URL matches your deployment URL
- Check NEXTAUTH_SECRET is set
- Verify admin user was created (check database)

### Database Connection Issues
- Verify DATABASE_URL format is correct
- Check database credentials
- Ensure database allows connections from Vercel IPs

## ✅ Summary

**You just need to:**
1. Set environment variables in Vercel (especially `NEXTAUTH_URL` and `NEXTAUTH_SECRET`)
2. Push your code
3. Everything else happens automatically! 🚀

The database schema, seeding, and all configurations are already set up in your code.


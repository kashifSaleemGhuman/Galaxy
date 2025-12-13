#!/bin/bash
set -e

echo "🔧 Starting Vercel build process..."

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
npx prisma generate

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "⚠️  WARNING: DATABASE_URL is not set. Skipping database operations."
  echo "📦 Building Next.js application..."
  npm run build
  exit 0
fi

# Try to push schema (non-blocking)
echo "🗄️  Pushing database schema..."
if npx prisma db push --accept-data-loss --skip-generate 2>/dev/null; then
  echo "✅ Database schema pushed successfully"
else
  echo "⚠️  WARNING: Failed to push database schema. Continuing with build..."
fi

# Try to seed database (non-blocking)
echo "🌱 Seeding database..."
if npm run db:seed 2>/dev/null; then
  echo "✅ Database seeded successfully"
else
  echo "⚠️  WARNING: Failed to seed database. Continuing with build..."
fi

# Build Next.js application
echo "📦 Building Next.js application..."
npm run build

echo "✅ Build completed successfully!"


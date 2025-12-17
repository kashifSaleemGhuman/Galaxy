#!/usr/bin/env node

/**
 * Database Migration Script for Production
 * Run this after deployment to set up the database
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Starting database migration...');

try {
  // Generate Prisma client
  console.log('📦 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  // Deploy migrations to production database
  console.log('🗄️ Deploying database migrations...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });

  // Optional: Seed the database with initial data
  console.log('🌱 Seeding database...');
  try {
    execSync('npx prisma db seed', { stdio: 'inherit' });
  } catch (seedError) {
    console.log('⚠️ Seeding failed (this might be expected):', seedError.message);
  }

  console.log('✅ Database migration completed successfully!');
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}

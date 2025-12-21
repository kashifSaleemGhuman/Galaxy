#!/usr/bin/env node

/**
 * Migration script to update internalAuditorName to internalAuditorNames
 * This migrates the data from String to Json array format
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateInternalAuditorNames() {
  console.log('🔄 Starting migration: internalAuditorName -> internalAuditorNames');
  
  try {
    // Step 1: Add the new column if it doesn't exist
    console.log('📝 Step 1: Adding internalAuditorNames column...');
    await prisma.$executeRaw`
      ALTER TABLE "Organization" 
      ADD COLUMN IF NOT EXISTS "internalAuditorNames" JSONB DEFAULT '[]'::jsonb;
    `;
    console.log('✅ Column added');

    // Step 2: Migrate existing data
    console.log('📝 Step 2: Migrating existing data...');
    await prisma.$executeRaw`
      UPDATE "Organization" 
      SET "internalAuditorNames" = CASE 
        WHEN "internalAuditorName" IS NOT NULL AND "internalAuditorName" != '' 
        THEN jsonb_build_array("internalAuditorName")
        ELSE '[]'::jsonb
      END
      WHERE "internalAuditorNames" IS NULL OR "internalAuditorNames" = '[]'::jsonb;
    `;
    console.log('✅ Data migrated');

    // Step 3: Verify the migration
    const orgs = await prisma.$queryRaw`
      SELECT id, "internalAuditorName", "internalAuditorNames" 
      FROM "Organization" 
      WHERE "internalAuditorName" IS NOT NULL 
      LIMIT 5
    `;
    
    if (orgs.length > 0) {
      console.log('📊 Sample migrated data:');
      orgs.forEach(org => {
        console.log(`  - ID: ${org.id}`);
        console.log(`    Old: ${org.internalAuditorName}`);
        console.log(`    New: ${JSON.stringify(org.internalAuditorNames)}`);
      });
    }

    // Step 4: Drop the old column
    console.log('📝 Step 3: Dropping old internalAuditorName column...');
    await prisma.$executeRaw`
      ALTER TABLE "Organization" 
      DROP COLUMN IF EXISTS "internalAuditorName";
    `;
    console.log('✅ Old column dropped');

    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateInternalAuditorNames()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


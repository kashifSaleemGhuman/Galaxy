#!/usr/bin/env node

/**
 * Apply Document Management Migration
 * 
 * This script applies the document management migration directly to the database
 * without using Prisma's shadow database (which can cause issues)
 * 
 * Usage: node scripts/apply-document-migration.js
 */

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function applyMigration() {
  try {
    console.log('📄 Applying document management migration...\n')

    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '../prisma/migrations/20250103120000_add_document_management/migration.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8')

    // Split statements intelligently - handle DO blocks as single statements
    const statements = []
    let currentStatement = ''
    let inDoBlock = false
    let braceCount = 0

    const lines = migrationSQL.split('\n')
    
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('--')) continue
      
      currentStatement += line + '\n'
      
      // Track DO $$ blocks
      if (trimmed.startsWith('DO $$')) {
        inDoBlock = true
        braceCount = 0
      }
      
      if (inDoBlock) {
        // Count $$ markers
        const dollarCount = (trimmed.match(/\$\$/g) || []).length
        if (dollarCount > 0) {
          braceCount += dollarCount
          if (braceCount >= 2 && trimmed.includes('$$;')) {
            inDoBlock = false
            statements.push(currentStatement.trim())
            currentStatement = ''
          }
        }
      } else if (trimmed.endsWith(';') && !trimmed.includes('$$')) {
        // Regular statement ending with semicolon
        statements.push(currentStatement.trim())
        currentStatement = ''
      }
    }
    
    if (currentStatement.trim()) {
      statements.push(currentStatement.trim())
    }

    console.log(`Executing ${statements.length} SQL statements...\n`)

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim()
      if (!statement) continue
      
      try {
        await prisma.$executeRawUnsafe(statement)
        console.log(`✅ Statement ${i + 1}/${statements.length} executed`)
      } catch (error) {
        // Ignore errors for IF NOT EXISTS statements
        if (error.message.includes('already exists') || 
            error.message.includes('duplicate') ||
            (error.message.includes('relation') && error.message.includes('already exists')) ||
            error.message.includes('constraint') && error.message.includes('already exists')) {
          console.log(`⚠️  Statement ${i + 1}/${statements.length} skipped (already exists)`)
        } else {
          console.error(`❌ Error in statement ${i + 1}:`, error.message)
          throw error
        }
      }
    }

    // Mark migration as applied in Prisma's migration history
    try {
      await prisma.$executeRawUnsafe(`
        INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
        VALUES (
          gen_random_uuid()::text,
          '',
          NOW(),
          '20250103120000_add_document_management',
          NULL,
          NULL,
          NOW(),
          1
        )
        ON CONFLICT DO NOTHING;
      `)
      console.log('\n✅ Migration marked as applied in Prisma history')
    } catch (error) {
      console.log('\n⚠️  Could not update migration history (this is okay if migration was already applied)')
    }

    console.log('\n✅ Document management migration applied successfully!')
    console.log('\n📋 Next steps:')
    console.log('   1. Run: npx prisma generate')
    console.log('   2. Restart your development server')
    console.log('   3. The document management system is now ready to use!')

  } catch (error) {
    console.error('\n❌ Error applying migration:', error.message)
    console.error(error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

applyMigration()


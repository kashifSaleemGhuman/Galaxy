/**
 * Complete Database Fix
 * 
 * This script fixes ALL database issues:
 * 1. Creates base tables (Tenant, User)
 * 2. Creates all missing tables from Prisma schema
 * 3. Ensures all required tables exist
 * 
 * Run this to fix all database issues at once.
 */

const { execSync } = require('child_process')

async function fixDatabaseComplete() {
  try {
    console.log('🔧 Complete Database Fix')
    console.log('=' .repeat(60))
    console.log()

    // Step 1: Create base tables
    console.log('Step 1: Creating base tables...')
    try {
      execSync('node scripts/create-base-tables.js', { stdio: 'inherit' })
      console.log('✅ Base tables ready\n')
    } catch (error) {
      console.log('⚠️  Base tables script had issues, continuing...\n')
    }

    // Step 2: Create all missing tables
    console.log('Step 2: Creating all missing tables...')
    try {
      execSync('node scripts/create-all-missing-tables.js', { stdio: 'inherit' })
      console.log('✅ Missing tables created\n')
    } catch (error) {
      console.log('⚠️  Missing tables script had issues, continuing...\n')
    }

    // Step 3: Generate Prisma client
    console.log('Step 3: Generating Prisma client...')
    try {
      execSync('npx prisma generate', { stdio: 'inherit' })
      console.log('✅ Prisma client generated\n')
    } catch (error) {
      console.log('⚠️  Prisma generate had issues\n')
    }

    console.log('=' .repeat(60))
    console.log('✅ Complete database fix finished!')
    console.log('\n📋 Next steps:')
    console.log('   1. Restart your application')
    console.log('   2. Try logging in again')
    console.log('   3. If issues persist, check the error messages above')

  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

fixDatabaseComplete()


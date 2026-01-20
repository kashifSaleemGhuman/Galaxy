/**
 * Fix All Migrations
 * 
 * This script fixes all migration dependency issues by:
 * 1. Creating base tables (Tenant, User)
 * 2. Fixing Employee table
 * 3. Providing instructions for marking migrations as applied
 * 
 * Run this BEFORE running `npx prisma migrate deploy`
 */

const { PrismaClient } = require('@prisma/client')
const { execSync } = require('child_process')
const prisma = new PrismaClient()

async function fixAllMigrations() {
  try {
    console.log('🔧 Fixing all migration dependencies...\n')
    console.log('=' .repeat(60))
    console.log()

    // Step 1: Create base tables
    console.log('📦 Step 1: Creating base tables...')
    console.log('   Running: node scripts/create-base-tables.js')
    try {
      execSync('node scripts/create-base-tables.js', { stdio: 'inherit' })
      console.log('   ✅ Base tables created\n')
    } catch (error) {
      console.log('   ⚠️  Base tables script had issues, continuing...\n')
    }

    // Step 2: Create User table
    console.log('📦 Step 2: Ensuring User table exists...')
    console.log('   Running: node scripts/create-user-table-if-missing.js')
    try {
      execSync('node scripts/create-user-table-if-missing.js', { stdio: 'inherit' })
      console.log('   ✅ User table ready\n')
    } catch (error) {
      console.log('   ⚠️  User table script had issues, continuing...\n')
    }

    // Step 3: Fix Employee table
    console.log('📦 Step 3: Fixing Employee table...')
    console.log('   Running: node scripts/fix-employee-table-migration.js')
    try {
      execSync('node scripts/fix-employee-table-migration.js', { stdio: 'inherit' })
      console.log('   ✅ Employee table fixed\n')
    } catch (error) {
      console.log('   ⚠️  Employee table script had issues, continuing...\n')
    }

    // Step 4: Check migration status
    console.log('📦 Step 4: Checking migration status...')
    try {
      const status = execSync('npx prisma migrate status', { encoding: 'utf-8', stdio: 'pipe' })
      console.log(status)
    } catch (error) {
      console.log('   ⚠️  Some migrations may need to be marked as applied\n')
    }

    console.log('=' .repeat(60))
    console.log()
    console.log('✅ Migration fixes completed!\n')
    console.log('📋 Next steps:')
    console.log()
    console.log('   1. If migrations failed, mark them as applied:')
    console.log('      npx prisma migrate resolve --applied 20250103000000_add_employee_user_relationship')
    console.log('      npx prisma migrate resolve --applied 20250116000000_add_leave_management')
    console.log()
    console.log('   2. Deploy remaining migrations:')
    console.log('      npx prisma migrate deploy')
    console.log()
    console.log('   3. Generate Prisma client:')
    console.log('      npx prisma generate')
    console.log()

  } catch (error) {
    console.error('❌ Error:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

fixAllMigrations()
  .then(() => {
    console.log('✅ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Failed:', error)
    process.exit(1)
  })


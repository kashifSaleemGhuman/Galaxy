/**
 * Validate Migration Dependencies
 * 
 * This script validates that all tables referenced in migrations exist
 * before running migrations. This prevents production deployment failures.
 */

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')
const prisma = new PrismaClient()

// Tables that should exist before migrations run
const REQUIRED_BASE_TABLES = ['Tenant', 'User']

// Map of migrations to their required tables
const MIGRATION_DEPENDENCIES = {
  '20250103000000_add_employee_user_relationship': ['User', 'Employee'],
  '20250116000000_add_leave_management': ['Tenant', 'Employee'],
  '20250117000000_add_payroll_system': ['Employee'],
  '20251119200000_add_vendor_custom_fields': ['Vendor'],
  '20251221112543_add_optional_tenant_ids': ['Tenant'],
}

async function checkTableExists(tableName) {
  try {
    const result = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = ${tableName}
      )
    `
    return result[0].exists
  } catch (error) {
    return false
  }
}

async function validateDependencies() {
  try {
    console.log('🔍 Validating migration dependencies...\n')
    console.log('=' .repeat(60))
    console.log()

    const missingTables = []
    const issues = []

    // Check base tables
    console.log('📋 Checking base tables...')
    for (const table of REQUIRED_BASE_TABLES) {
      const exists = await checkTableExists(table)
      if (!exists) {
        missingTables.push(table)
        console.log(`   ❌ ${table} - MISSING`)
      } else {
        console.log(`   ✅ ${table} - EXISTS`)
      }
    }
    console.log()

    // Check migration dependencies
    console.log('📋 Checking migration dependencies...')
    const migrationsDir = path.join(process.cwd(), 'prisma', 'migrations')
    const migrations = fs.readdirSync(migrationsDir)
      .filter(dir => fs.statSync(path.join(migrationsDir, dir)).isDirectory())
      .sort()

    for (const migration of migrations) {
      const deps = MIGRATION_DEPENDENCIES[migration]
      if (deps) {
        console.log(`\n   Migration: ${migration}`)
        for (const table of deps) {
          const exists = await checkTableExists(table)
          if (!exists) {
            issues.push({ migration, table })
            console.log(`      ❌ ${table} - MISSING`)
          } else {
            console.log(`      ✅ ${table} - EXISTS`)
          }
        }
      }
    }

    console.log()
    console.log('=' .repeat(60))
    console.log()

    if (missingTables.length > 0 || issues.length > 0) {
      console.log('❌ Validation failed!\n')
      console.log('Missing base tables:')
      missingTables.forEach(table => {
        console.log(`   - ${table}`)
      })
      
      if (issues.length > 0) {
        console.log('\nMissing tables for migrations:')
        issues.forEach(({ migration, table }) => {
          console.log(`   - ${migration} requires ${table}`)
        })
      }

      console.log('\n📋 Fix steps:')
      console.log('   1. Run: node scripts/create-base-tables.js')
      console.log('   2. Create missing tables manually or via migrations')
      console.log('   3. Re-run this validation: node scripts/validate-migration-dependencies.js')
      
      process.exit(1)
    } else {
      console.log('✅ All dependencies validated successfully!\n')
      console.log('📋 Safe to run migrations:')
      console.log('   npx prisma migrate deploy')
      process.exit(0)
    }

  } catch (error) {
    console.error('❌ Validation error:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

validateDependencies()


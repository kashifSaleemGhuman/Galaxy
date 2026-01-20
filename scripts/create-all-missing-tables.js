/**
 * Create All Missing Tables
 * 
 * This script creates ALL tables that are defined in Prisma schema but missing from database.
 * This is a comprehensive fix for migration issues.
 * 
 * Run this ONCE to fix all missing table issues.
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

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

async function createAllMissingTables() {
  try {
    console.log('🔧 Creating all missing tables from Prisma schema...\n')
    console.log('=' .repeat(60))
    console.log()

    const tablesCreated = []
    const tablesSkipped = []

    // 1. Role table (PascalCase as per Prisma schema)
    console.log('📦 Checking Role table...')
    if (!(await checkTableExists('Role'))) {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Role" (
          "id" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "description" TEXT,
          "permissions" JSONB NOT NULL DEFAULT '{}',
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
        )
      `)
      await prisma.$executeRawUnsafe(`
        CREATE UNIQUE INDEX IF NOT EXISTS "Role_name_key" ON "Role"("name")
      `)
      tablesCreated.push('Role')
      console.log('   ✅ Created Role table')
    } else {
      tablesSkipped.push('Role')
      console.log('   ✅ Role table already exists')
    }

    // 2. AuditLog table
    console.log('\n📦 Checking AuditLog table...')
    if (!(await checkTableExists('AuditLog'))) {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "AuditLog" (
          "id" TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          "action" TEXT NOT NULL,
          "details" TEXT,
          "ipAddress" TEXT,
          "userAgent" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
        )
      `)
      
      // Add foreign key if User table exists
      const userExists = await checkTableExists('User')
      if (userExists) {
        await prisma.$executeRawUnsafe(`
          DO $$
          BEGIN
              IF NOT EXISTS (
                  SELECT 1 FROM pg_constraint 
                  WHERE conname = 'AuditLog_userId_fkey'
              ) THEN
                  ALTER TABLE "AuditLog" 
                  ADD CONSTRAINT "AuditLog_userId_fkey" 
                  FOREIGN KEY ("userId") 
                  REFERENCES "User"("id") 
                  ON DELETE CASCADE;
              END IF;
          END $$;
        `)
      }
      
      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "AuditLog_userId_idx" ON "AuditLog"("userId")
      `)
      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "AuditLog_action_idx" ON "AuditLog"("action")
      `)
      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx" ON "AuditLog"("createdAt")
      `)
      tablesCreated.push('AuditLog')
      console.log('   ✅ Created AuditLog table')
    } else {
      tablesSkipped.push('AuditLog')
      console.log('   ✅ AuditLog table already exists')
    }

    // 3. PasswordHistory table
    console.log('\n📦 Checking PasswordHistory table...')
    if (!(await checkTableExists('PasswordHistory'))) {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "PasswordHistory" (
          "id" TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          "password" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "PasswordHistory_pkey" PRIMARY KEY ("id")
        )
      `)
      
      // Add foreign key if User table exists
      const userExists = await checkTableExists('User')
      if (userExists) {
        await prisma.$executeRawUnsafe(`
          DO $$
          BEGIN
              IF NOT EXISTS (
                  SELECT 1 FROM pg_constraint 
                  WHERE conname = 'PasswordHistory_userId_fkey'
              ) THEN
                  ALTER TABLE "PasswordHistory" 
                  ADD CONSTRAINT "PasswordHistory_userId_fkey" 
                  FOREIGN KEY ("userId") 
                  REFERENCES "User"("id") 
                  ON DELETE CASCADE;
              END IF;
          END $$;
        `)
      }
      
      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "PasswordHistory_userId_idx" ON "PasswordHistory"("userId")
      `)
      tablesCreated.push('PasswordHistory')
      console.log('   ✅ Created PasswordHistory table')
    } else {
      tablesSkipped.push('PasswordHistory')
      console.log('   ✅ PasswordHistory table already exists')
    }

    console.log()
    console.log('=' .repeat(60))
    console.log()
    console.log('📊 Summary:')
    console.log(`   ✅ Created: ${tablesCreated.length} table(s)`)
    if (tablesCreated.length > 0) {
      console.log(`      - ${tablesCreated.join(', ')}`)
    }
    console.log(`   ⏭️  Skipped: ${tablesSkipped.length} table(s) (already exist)`)
    console.log()

    if (tablesCreated.length > 0) {
      console.log('✅ All missing tables created successfully!')
      console.log('\n📋 Next steps:')
      console.log('   1. Run: npx prisma generate')
      console.log('   2. Restart your application')
      console.log('   3. Try logging in again')
    } else {
      console.log('✅ All required tables already exist!')
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

createAllMissingTables()
  .then(() => {
    console.log('\n✅ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Failed:', error)
    process.exit(1)
  })


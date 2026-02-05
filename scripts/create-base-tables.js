/**
 * Create Base Tables
 * 
 * This script creates all base tables (Tenant, User) that are required
 * before running other migrations. Run this FIRST before any migrations.
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function createBaseTables() {
  try {
    console.log('🔧 Creating base tables...\n')

    // 1. Create Tenant table (PascalCase as per Prisma schema)
    console.log('📦 Checking Tenant table...')
    const tenantExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'Tenant'
      )
    `

    if (!tenantExists[0].exists) {
      console.log('   Creating Tenant table...')
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Tenant" (
          "id" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "domain" TEXT,
          "settings" JSONB NOT NULL DEFAULT '{}',
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,

          CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
        )
      `)

      await prisma.$executeRawUnsafe(`
        CREATE UNIQUE INDEX IF NOT EXISTS "Tenant_domain_key" ON "Tenant"("domain") WHERE "domain" IS NOT NULL
      `)

      console.log('   ✅ Tenant table created')
    } else {
      console.log('   ✅ Tenant table already exists')
    }

    // 2. Create User table (PascalCase as per Prisma schema)
    console.log('\n📦 Checking User table...')
    const userExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'User'
      )
    `

    if (!userExists[0].exists) {
      console.log('   Creating User table...')
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "User" (
          "id" TEXT NOT NULL,
          "email" TEXT NOT NULL,
          "name" TEXT,
          "password" TEXT NOT NULL,
          "role" TEXT NOT NULL,
          "tenantId" TEXT,
          "isFirstLogin" BOOLEAN NOT NULL DEFAULT true,
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,

          CONSTRAINT "User_pkey" PRIMARY KEY ("id")
        )
      `)

      await prisma.$executeRawUnsafe(`
        CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email")
      `)

      // Add foreign key to Tenant if Tenant exists
      const tenantCheck = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'Tenant'
        )
      `

      if (tenantCheck[0].exists) {
        await prisma.$executeRawUnsafe(`
          DO $$
          BEGIN
              IF NOT EXISTS (
                  SELECT 1 FROM pg_constraint 
                  WHERE conname = 'User_tenantId_fkey'
              ) THEN
                  ALTER TABLE "User" 
                  ADD CONSTRAINT "User_tenantId_fkey" 
                  FOREIGN KEY ("tenantId") 
                  REFERENCES "Tenant"("id") 
                  ON DELETE SET NULL;
              END IF;
          END $$;
        `)
        console.log('   ✅ Foreign key to Tenant added')
      }

      console.log('   ✅ User table created')
    } else {
      console.log('   ✅ User table already exists')
    }

    console.log('\n✅ All base tables are ready!\n')
    console.log('📋 Next steps:')
    console.log('   1. Run: npx prisma migrate deploy')
    console.log('   2. If migrations fail, mark them as applied:')
    console.log('      npx prisma migrate resolve --applied <migration_name>')
    console.log('   3. Run: npx prisma generate')

  } catch (error) {
    console.error('❌ Error:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

createBaseTables()
  .then(() => {
    console.log('✅ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Failed:', error)
    process.exit(1)
  })


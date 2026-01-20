/**
 * Create User Table If Missing
 * 
 * This script creates the User table if it doesn't exist
 * Run this before running the Employee migration fix
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function createUserTable() {
  try {
    console.log('🔧 Checking User table...\n')

    // Check if User table exists
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'User'
      )
    `

    if (tableExists[0].exists) {
      console.log('✅ User table already exists\n')
      process.exit(0)
    }

    console.log('📦 Creating User table...')
    
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

    // Check if Tenant table exists before adding foreign key
    const tenantExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'Tenant'
      )
    `

    if (tenantExists[0].exists) {
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
      console.log('✅ Foreign key to Tenant added')
    }

    console.log('✅ User table created successfully!\n')

  } catch (error) {
    console.error('❌ Error:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

createUserTable()
  .then(() => {
    console.log('✅ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Failed:', error)
    process.exit(1)
  })


/**
 * Fix Employee Table Migration
 * 
 * This script ensures the Employee table exists and has the userId column
 * Run this if migrations fail due to missing Employee table
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixEmployeeTable() {
  try {
    console.log('🔧 Fixing Employee table...\n')
    
    // First, ensure User table exists
    console.log('📋 Checking if User table exists...')
    const userTableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'User'
      )
    `
    
    if (!userTableExists[0].exists) {
      console.log('⚠️  User table does not exist.')
      console.log('   Please run: node scripts/create-user-table-if-missing.js')
      console.log('   Or create User table manually before running this script.\n')
      process.exit(1)
    }
    console.log('✅ User table exists\n')

    // Check if Employee table exists
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'Employee'
      )
    `

    const exists = tableExists[0].exists

    if (!exists) {
      console.log('📦 Creating Employee table...')
      
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Employee" (
          "id" TEXT NOT NULL,
          "employeeId" TEXT NOT NULL,
          "idCardNumber" TEXT,
          "name" TEXT NOT NULL,
          "photo" TEXT,
          "parentName" TEXT,
          "dob" TIMESTAMP(3),
          "address" TEXT,
          "gender" TEXT,
          "contactNumber" TEXT,
          "emergencyContact" TEXT,
          "dateOfJoining" TIMESTAMP(3),
          "department" TEXT,
          "lastEmployment" TEXT,
          "process" TEXT,
          "designation" TEXT,
          "salary" DECIMAL(10,2),
          "dateOfLeaving" TIMESTAMP(3),
          "shift" TEXT,
          "secondaryJob" TEXT,
          "tenantId" TEXT,
          "userId" TEXT,
          "isFirstAider" BOOLEAN NOT NULL DEFAULT false,
          "isEmergencyResponder" BOOLEAN NOT NULL DEFAULT false,
          "isFirefighter" BOOLEAN NOT NULL DEFAULT false,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,

          CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
        )
      `)

      await prisma.$executeRawUnsafe(`
        CREATE UNIQUE INDEX IF NOT EXISTS "Employee_employeeId_key" ON "Employee"("employeeId")
      `)

      console.log('✅ Employee table created\n')
    } else {
      console.log('✅ Employee table already exists\n')
    }

    // Check if userId column exists
    const columnExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'Employee' 
        AND column_name = 'userId'
      )
    `

    const colExists = columnExists[0].exists

    if (!colExists) {
      console.log('📦 Adding userId column...')
      
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "Employee" ADD COLUMN IF NOT EXISTS "userId" TEXT
      `)

      console.log('✅ userId column added\n')
    } else {
      console.log('✅ userId column already exists\n')
    }

    // Create unique index on userId
    console.log('📦 Creating unique index on userId...')
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "Employee_userId_key" 
      ON "Employee"("userId") 
      WHERE "userId" IS NOT NULL
    `)
    console.log('✅ Unique index created\n')

    // Add foreign key constraint (User table already verified at start)
    console.log('📦 Adding foreign key constraint...')
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
          IF NOT EXISTS (
              SELECT 1 FROM pg_constraint 
              WHERE conname = 'Employee_userId_fkey'
          ) THEN
              ALTER TABLE "Employee" 
              ADD CONSTRAINT "Employee_userId_fkey" 
              FOREIGN KEY ("userId") 
              REFERENCES "User"("id") 
              ON DELETE SET NULL;
          END IF;
      END $$;
    `)
    console.log('✅ Foreign key constraint added\n')

    console.log('✅ All fixes applied successfully!\n')
    
    console.log('📋 Next steps:')
    console.log('   1. Run: npx prisma migrate resolve --applied 20250103000000_add_employee_user_relationship')
    console.log('   2. Run: npx prisma migrate deploy')
    console.log('   3. Run: npx prisma generate')

  } catch (error) {
    console.error('❌ Error:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

fixEmployeeTable()
  .then(() => {
    console.log('✅ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Failed:', error)
    process.exit(1)
  })


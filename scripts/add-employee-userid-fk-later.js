/**
 * Add Employee userId Foreign Key Later
 * 
 * Run this script after User table is created to add the foreign key constraint
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function addForeignKey() {
  try {
    console.log('🔧 Adding Employee.userId foreign key constraint...\n')

    // Check if User table exists
    const userTableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'User'
      )
    `

    if (!userTableExists[0].exists) {
      console.log('❌ User table does not exist. Please create User table first.')
      process.exit(1)
    }

    // Check if Employee table exists
    const employeeTableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'Employee'
      )
    `

    if (!employeeTableExists[0].exists) {
      console.log('❌ Employee table does not exist. Please create Employee table first.')
      process.exit(1)
    }

    // Check if constraint already exists
    const constraintExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'Employee_userId_fkey'
      )
    `

    if (constraintExists[0].exists) {
      console.log('✅ Foreign key constraint already exists\n')
      process.exit(0)
    }

    // Add foreign key constraint
    console.log('📦 Adding foreign key constraint...')
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Employee" 
      ADD CONSTRAINT "Employee_userId_fkey" 
      FOREIGN KEY ("userId") 
      REFERENCES "User"("id") 
      ON DELETE SET NULL;
    `)

    console.log('✅ Foreign key constraint added successfully!\n')

  } catch (error) {
    console.error('❌ Error:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

addForeignKey()
  .then(() => {
    console.log('✅ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Failed:', error)
    process.exit(1)
  })


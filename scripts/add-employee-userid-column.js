const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addUserIdColumn() {
  try {
    console.log('Adding userId column to Employee table...');
    
    // Add the column
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Employee" ADD COLUMN IF NOT EXISTS "userId" TEXT;
    `);
    
    console.log('✅ Column added successfully');
    
    // Create unique index if it doesn't exist
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "Employee_userId_key" ON "Employee"("userId") WHERE "userId" IS NOT NULL;
    `);
    
    console.log('✅ Unique index created');
    
    // Add foreign key constraint if it doesn't exist
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
    `);
    
    console.log('✅ Foreign key constraint added');
    console.log('✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addUserIdColumn()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed:', error);
    process.exit(1);
  });


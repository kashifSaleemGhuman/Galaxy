import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteIfExists(model: any, name: string) {
  try {
    const result = await model.deleteMany({});
    console.log(`✅ Deleted ${result.count} ${name}`);
    return result.count;
  } catch (error: any) {
    if (error.code === 'P2021' || error.message?.includes('does not exist')) {
      console.log(`⏭️  Table for ${name} does not exist, skipping...`);
      return 0;
    }
    throw error;
  }
}

async function clearDatabase() {
  try {
    console.log('🗑️  Starting database cleanup...\n');

    // Delete in order to respect foreign key constraints
    // Start with child tables (those with foreign keys)

    await deleteIfExists(prisma.rFQItem, 'RFQ items');
    await deleteIfExists(prisma.rFQApproval, 'RFQ approvals');
    await deleteIfExists(prisma.pOLine, 'PO lines');
    await deleteIfExists(prisma.auditLog, 'audit logs');
    await deleteIfExists(prisma.passwordHistory, 'password history records');

    // Now delete parent tables
    await deleteIfExists(prisma.rFQ, 'RFQs');
    await deleteIfExists(prisma.purchaseOrder, 'purchase orders');
    await deleteIfExists(prisma.user, 'users');
    await deleteIfExists(prisma.vendor, 'vendors');
    await deleteIfExists(prisma.product, 'products');
    await deleteIfExists(prisma.supplier, 'suppliers');

    console.log('\n✅ Database cleared successfully!');
    console.log('💡 Run "npm run db:seed" to repopulate with initial data if needed.');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  }
}

clearDatabase()
  .catch((e) => {
    console.error('❌ Database cleanup failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


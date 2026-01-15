import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

// Define roles
const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  PURCHASE_MANAGER: 'purchase_manager',
  PURCHASE_USER: 'purchase_user'
} as const;

async function main() {
  try {
    // Create demo users if they don't exist
    const demoUsers = [
      {
        email: 'admin@galaxy.com',
        name: 'System Administrator',
        password: 'admin123',
        role: ROLES.SUPER_ADMIN
      },
      {
        email: 'manager@galaxy.com',
        name: 'Purchase Manager',
        password: 'manager123',
        role: ROLES.PURCHASE_MANAGER
      },
      {
        email: 'user@galaxy.com',
        name: 'Purchase User',
        password: 'user123',
        role: ROLES.PURCHASE_USER
      }
    ];

    for (const demoUser of demoUsers) {
      const userExists = await prisma.user.findUnique({
        where: { email: demoUser.email }
      });

      if (!userExists) {
        const hashedPassword = await hash(demoUser.password, 12);
        
        const user = await prisma.user.create({
          data: {
            email: demoUser.email,
            name: demoUser.name,
            password: hashedPassword,
            role: demoUser.role,
            isActive: true,
            isFirstLogin: true
          }
        });

        // Create audit log for admin creation (only for admin user)
        if (demoUser.role === ROLES.SUPER_ADMIN) {
          await prisma.auditLog.create({
            data: {
              userId: user.id,
              action: 'USER_CREATED',
              details: 'Initial super admin user created during seeding',
            }
          });
          console.log('✅ Root admin created successfully');
          console.log('Email: admin@galaxy.com');
          console.log('Password: admin123');
          console.log('⚠️  Please change the password after first login');
        } else {
          await prisma.auditLog.create({
            data: {
              userId: user.id,
              action: 'USER_CREATED',
              details: 'Demo user created during seeding',
            }
          });
          console.log(`✅ Created demo user: ${demoUser.email}`);
        }
      } else {
        if (demoUser.role === ROLES.SUPER_ADMIN) {
          console.log('👍 Root admin already exists, skipping creation');
        } else {
          console.log(`👍 Demo user already exists: ${demoUser.email}`);
        }
      }
    }

    // Vendors
    const vendors = [
      { name: 'Tech Solutions Inc.', email: 'sales@techsolutions.com', phone: '+1-555-123-4567', address: '100 Innovation Way, San Francisco, CA' },
      { name: 'Global Supplies LLC', email: 'contact@globalsupplies.com', phone: '+1-555-987-6543', address: '200 Commerce St, New York, NY' },
      { name: 'Alpha Components', email: 'quotes@alphacomponents.com', phone: '+1-555-222-3344', address: '55 Industrial Park, Austin, TX' },
      { name: 'Pacific Traders', email: 'info@pacifictraders.com', phone: '+1-555-777-8888', address: '12 Harbor Ave, Seattle, WA' }
    ];

    for (const v of vendors) {
      const exists = await prisma.vendor.findUnique({ where: { email: v.email } });
      if (!exists) {
        await prisma.vendor.create({ data: v });
        console.log(`✅ Created vendor: ${v.name}`);
      } else {
        console.log(`👍 Vendor already exists: ${v.name}`);
      }
    }

    // Products
    const products = [
      { name: 'High Performance CPU', description: '8-core, 16-thread processor', category: 'Electronics', unit: 'pcs' },
      { name: 'Enterprise SSD 1TB', description: 'NVMe Gen4 SSD', category: 'Storage', unit: 'pcs' },
      { name: '24" IPS Monitor', description: '1080p professional display', category: 'Peripherals', unit: 'pcs' },
      { name: 'Cat6 Ethernet Cable 10m', description: 'High-speed network cable', category: 'Cabling', unit: 'pcs' },
      { name: 'Packaging Box Large', description: 'Corrugated cardboard box', category: 'Packaging', unit: 'pcs' }
    ];

    for (const p of products) {
      const exists = await prisma.product.findFirst({ where: { name: p.name } });
      if (!exists) {
        await prisma.product.create({ data: p });
        console.log(`✅ Created product: ${p.name}`);
      } else {
        console.log(`👍 Product already exists: ${p.name}`);
      }
    }
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
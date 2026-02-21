import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

// Define roles
const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  PURCHASE_MANAGER: 'PURCHASE_MANAGER',
  PURCHASE_USER: 'PURCHASE_USER',
  SALES_MANAGER: 'SALES_MANAGER',
  SALES_USER: 'SALES_USER',
  HR_MANAGER: 'HR_MANAGER'
} as const;

const DEFAULT_LEAVE_TYPES = [
  {
    name: 'Casual Leave',
    code: 'CL',
    description: 'Casual leave for personal reasons',
    isPaid: true,
    requiresApproval: true,
    maxConsecutiveDays: 3,
    requiresMedicalCertificate: false
  },
  {
    name: 'Sick Leave',
    code: 'SL',
    description: 'Leave for medical reasons',
    isPaid: true,
    requiresApproval: true,
    maxConsecutiveDays: null,
    requiresMedicalCertificate: true
  },
  {
    name: 'Annual Leave',
    code: 'AL',
    description: 'Annual vacation leave',
    isPaid: true,
    requiresApproval: true,
    maxConsecutiveDays: null,
    requiresMedicalCertificate: false
  },
  {
    name: 'Emergency Leave',
    code: 'EL',
    description: 'Leave for emergency situations',
    isPaid: true,
    requiresApproval: true,
    maxConsecutiveDays: 5,
    requiresMedicalCertificate: false
  },
  {
    name: 'Maternity Leave',
    code: 'ML',
    description: 'Maternity leave for expecting mothers',
    isPaid: true,
    requiresApproval: true,
    maxConsecutiveDays: null,
    requiresMedicalCertificate: true
  },
  {
    name: 'Paternity Leave',
    code: 'PL',
    description: 'Paternity leave for new fathers',
    isPaid: true,
    requiresApproval: true,
    maxConsecutiveDays: 7,
    requiresMedicalCertificate: false
  },
  {
    name: 'Unpaid Leave',
    code: 'UL',
    description: 'Unpaid leave for extended absence',
    isPaid: false,
    requiresApproval: true,
    maxConsecutiveDays: null,
    requiresMedicalCertificate: false
  }
] as const;

async function main() {
  try {
    const defaultTenant = await prisma.tenant.upsert({
      where: { domain: 'default' },
      update: {},
      create: {
        name: 'Default Company',
        domain: 'default',
        settings: {
          timezone: 'UTC',
          currency: 'USD',
          dateFormat: 'MM/DD/YYYY',
          features: { hrm: true }
        }
      }
    });

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
      },
      {
        email: 'salesmanager@galaxy.com',
        name: 'Sales Manager',
        password: 'salesmanager123',
        role: ROLES.SALES_MANAGER
      },
      {
        email: 'salesuser@galaxy.com',
        name: 'Sales User',
        password: 'salesuser123',
        role: ROLES.SALES_USER
      },
      {
        email: 'hrmanager@galaxy.com',
        name: 'HR Manager',
        password: 'hrmanager123',
        role: ROLES.HR_MANAGER
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
            tenantId: defaultTenant.id,
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
        // Keep seed idempotent, but normalize role casing for existing demo users.
        if (userExists.role !== demoUser.role) {
          await prisma.user.update({
            where: { id: userExists.id },
            data: { role: demoUser.role }
          });
          console.log(`🔄 Normalized role for ${demoUser.email}: ${userExists.role} -> ${demoUser.role}`);
        }

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
        await prisma.product.create({
          data: {
            ...p,
            tenantId: defaultTenant.id
          }
        });
        console.log(`✅ Created product: ${p.name}`);
      } else {
        console.log(`👍 Product already exists: ${p.name}`);
      }
    }

    // Leave types for HRM setup
    for (const leaveType of DEFAULT_LEAVE_TYPES) {
      const existingLeaveType = await prisma.leaveType.findUnique({
        where: {
          tenantId_code: {
            tenantId: defaultTenant.id,
            code: leaveType.code
          }
        }
      });

      if (!existingLeaveType) {
        await prisma.leaveType.create({
          data: {
            tenantId: defaultTenant.id,
            ...leaveType
          }
        });
        console.log(`✅ Created leave type: ${leaveType.name} (${leaveType.code})`);
      } else {
        console.log(`👍 Leave type already exists: ${leaveType.name} (${leaveType.code})`);
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
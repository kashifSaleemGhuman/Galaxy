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
    // Check if root admin exists
    const adminExists = await prisma.user.findFirst({
      where: { role: ROLES.SUPER_ADMIN }
    });

    if (!adminExists) {
      // Create root admin with secure password
      const hashedPassword = await hash('admin123', 12);
      
      const admin = await prisma.user.create({
        data: {
          email: 'admin@galaxy.com',
          name: 'System Administrator',
          password: hashedPassword,
          role: ROLES.SUPER_ADMIN,
          isActive: true,
          isFirstLogin: true
        }
      });

      // Create audit log for admin creation
      await prisma.auditLog.create({
        data: {
          userId: admin.id,
          action: 'USER_CREATED',
          details: 'Initial super admin user created during seeding',
        }
      });

      console.log('✅ Root admin created successfully');
      console.log('Email: admin@galaxy.com');
      console.log('Password: admin123');
      console.log('⚠️  Please change the password after first login');
    } else {
      console.log('👍 Root admin already exists, skipping creation');
    }

    // Create demo users if they don't exist
    const demoUsers = [
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
            ...demoUser,
            password: hashedPassword,
            isActive: true,
            isFirstLogin: true
          }
        });

        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: 'USER_CREATED',
            details: 'Demo user created during seeding',
          }
        });

        console.log(`✅ Created demo user: ${demoUser.email}`);
      } else {
        console.log(`👍 Demo user already exists: ${demoUser.email}`);
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
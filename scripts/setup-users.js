#!/usr/bin/env node

/**
 * Complete User Setup Script for Galaxy ERP
 * 
 * This script creates:
 * 1. All necessary roles with proper permissions
 * 2. Admin users with full system access
 * 3. Manager users for different modules
 * 4. Regular users for testing
 * 
 * Usage: node scripts/setup-users.js
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Role configurations with permissions
const ROLES = [
  {
    name: 'Super Administrator',
    key: 'SUPER_ADMIN',
    description: 'Full system access with all permissions',
    permissions: {
      '*': ['read', 'write', 'approve', 'delete', 'admin'],
      system: ['read', 'write', 'approve', 'delete', 'admin'],
      users: ['read', 'write', 'approve', 'delete', 'admin'],
      tenants: ['read', 'write', 'approve', 'delete', 'admin'],
      purchase: ['read', 'write', 'approve', 'delete', 'admin'],
      inventory: ['read', 'write', 'approve', 'delete', 'admin'],
      crm: ['read', 'write', 'approve', 'delete', 'admin'],
      sales: ['read', 'write', 'approve', 'delete', 'admin'],
      hrm: ['read', 'write', 'approve', 'delete', 'admin'],
      accounting: ['read', 'write', 'approve', 'delete', 'admin']
    }
  },
  {
    name: 'Administrator',
    key: 'ADMIN',
    description: 'Administrative access to most modules',
    permissions: {
      users: ['read', 'write', 'approve'],
      purchase: ['read', 'write', 'approve', 'delete'],
      inventory: ['read', 'write', 'approve', 'delete'],
      crm: ['read', 'write', 'approve', 'delete'],
      sales: ['read', 'write', 'approve', 'delete'],
      hrm: ['read', 'write', 'approve', 'delete'],
      accounting: ['read', 'write', 'approve', 'delete']
    }
  },
  {
    name: 'Purchase Manager',
    key: 'PURCHASE_MANAGER',
    description: 'Manages purchase operations and approvals',
    permissions: {
      purchase: ['read', 'write', 'approve', 'delete'],
      inventory: ['read', 'write'],
      suppliers: ['read', 'write', 'approve'],
      rfqs: ['read', 'write', 'approve', 'delete'],
      purchase_orders: ['read', 'write', 'approve', 'delete'],
      dashboard: ['read']
    }
  },
  {
    name: 'Purchase User',
    key: 'PURCHASE_USER',
    description: 'Creates RFQs and manages purchase requests',
    permissions: {
      purchase: ['read', 'write'],
      suppliers: ['read'],
      rfqs: ['read', 'write'],
      purchase_orders: ['read'],
      dashboard: ['read']
    }
  },
  {
    name: 'Inventory Manager',
    key: 'INVENTORY_MANAGER',
    description: 'Manages inventory operations',
    permissions: {
      inventory: ['read', 'write', 'approve', 'delete'],
      products: ['read', 'write', 'approve', 'delete'],
      warehouses: ['read', 'write', 'approve', 'delete'],
      stock: ['read', 'write', 'approve', 'delete'],
      dashboard: ['read']
    }
  },
  {
    name: 'CRM Manager',
    key: 'CRM_MANAGER',
    description: 'Manages customer relationships',
    permissions: {
      crm: ['read', 'write', 'approve', 'delete'],
      customers: ['read', 'write', 'approve', 'delete'],
      leads: ['read', 'write', 'approve', 'delete'],
      opportunities: ['read', 'write', 'approve', 'delete'],
      dashboard: ['read']
    }
  },
  {
    name: 'Sales Manager',
    key: 'SALES_MANAGER',
    description: 'Manages sales operations',
    permissions: {
      sales: ['read', 'write', 'approve', 'delete'],
      orders: ['read', 'write', 'approve', 'delete'],
      quotes: ['read', 'write', 'approve', 'delete'],
      invoices: ['read', 'write', 'approve', 'delete'],
      crm: ['read', 'write'],
      dashboard: ['read']
    }
  },
  {
    name: 'HR Manager',
    key: 'HR_MANAGER',
    description: 'Manages human resources',
    permissions: {
      hrm: ['read', 'write', 'approve', 'delete'],
      employees: ['read', 'write', 'approve', 'delete'],
      departments: ['read', 'write', 'approve', 'delete'],
      payroll: ['read', 'write', 'approve'],
      dashboard: ['read']
    }
  },
  {
    name: 'Accountant',
    key: 'ACCOUNTANT',
    description: 'Manages financial operations',
    permissions: {
      accounting: ['read', 'write', 'approve', 'delete'],
      chart_of_accounts: ['read', 'write', 'approve', 'delete'],
      journal_entries: ['read', 'write', 'approve', 'delete'],
      financial_reports: ['read', 'write', 'approve', 'delete'],
      dashboard: ['read']
    }
  },
  {
    name: 'Regular User',
    key: 'USER',
    description: 'Basic user with limited access',
    permissions: {
      dashboard: ['read'],
      profile: ['read', 'write']
    }
  }
];

// User configurations
const USERS = [
  {
    email: 'admin@galaxy.com',
    name: 'System Administrator',
    role: 'SUPER_ADMIN',
    password: 'admin123',
    description: 'Main system administrator'
  },
  {
    email: 'purchase.manager@galaxy.com',
    name: 'Purchase Manager',
    role: 'PURCHASE_MANAGER',
    password: 'manager123',
    description: 'Purchase operations manager'
  },
  {
    email: 'purchase.user@galaxy.com',
    name: 'Purchase User',
    role: 'PURCHASE_USER',
    password: 'user123',
    description: 'Purchase operations user'
  },
  {
    email: 'inventory.manager@galaxy.com',
    name: 'Inventory Manager',
    role: 'INVENTORY_MANAGER',
    password: 'manager123',
    description: 'Inventory operations manager'
  },
  {
    email: 'crm.manager@galaxy.com',
    name: 'CRM Manager',
    role: 'CRM_MANAGER',
    password: 'manager123',
    description: 'Customer relationship manager'
  },
  {
    email: 'sales.manager@galaxy.com',
    name: 'Sales Manager',
    role: 'SALES_MANAGER',
    password: 'manager123',
    description: 'Sales operations manager'
  },
  {
    email: 'hr.manager@galaxy.com',
    name: 'HR Manager',
    role: 'HR_MANAGER',
    password: 'manager123',
    description: 'Human resources manager'
  },
  {
    email: 'accountant@galaxy.com',
    name: 'Finance Accountant',
    role: 'ACCOUNTANT',
    password: 'manager123',
    description: 'Financial operations accountant'
  },
  {
    email: 'test.user@galaxy.com',
    name: 'Test User',
    role: 'USER',
    password: 'user123',
    description: 'Regular user for testing'
  }
];

async function createRoles() {
  console.log('👥 Creating roles...');
  
  const createdRoles = [];
  
  for (const roleConfig of ROLES) {
    try {
      const existingRole = await prisma.role.findFirst({
        where: { name: roleConfig.name }
      });
      
      if (existingRole) {
        console.log(`✅ Role already exists: ${roleConfig.name}`);
        createdRoles.push(existingRole);
        continue;
      }
      
      const role = await prisma.role.create({
        data: {
          name: roleConfig.name,
          description: roleConfig.description,
          permissions: roleConfig.permissions
        }
      });
      
      console.log(`✅ Created role: ${role.name}`);
      createdRoles.push(role);
    } catch (error) {
      console.error(`❌ Error creating role ${roleConfig.name}:`, error.message);
    }
  }
  
  return createdRoles;
}

async function createUsers() {
  console.log('\n👤 Creating users...');
  
  const createdUsers = [];
  
  for (const userConfig of USERS) {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email: userConfig.email }
      });
      
      if (existingUser) {
        console.log(`✅ User already exists: ${userConfig.email}`);
        createdUsers.push(existingUser);
        continue;
      }
      
      const passwordHash = await bcrypt.hash(userConfig.password, 10);
      
      const user = await prisma.user.create({
        data: {
          email: userConfig.email,
          name: userConfig.name,
          password: passwordHash,
          role: userConfig.role,
          isActive: true,
          isFirstLogin: true
        }
      });
      
      console.log(`✅ Created user: ${user.email} (${user.name})`);
      createdUsers.push(user);
    } catch (error) {
      console.error(`❌ Error creating user ${userConfig.email}:`, error.message);
    }
  }
  
  return createdUsers;
}

async function main() {
  try {
    console.log('🚀 Starting Galaxy ERP User Setup...\n');
    
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully\n');
    
    // Create roles
    const roles = await createRoles();
    console.log(`\n📋 Created ${roles.length} roles`);
    
    // Create users
    const users = await createUsers();
    console.log(`\n👥 Created ${users.length} users`);
    
    // Display login credentials
    console.log('\n🔐 Login Credentials:');
    console.log('====================');
    console.log('');
    
    USERS.forEach(user => {
      console.log(`${user.description}:`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Password: ${user.password}`);
      console.log(`  Role: ${user.role}`);
      console.log('');
    });
    
    console.log('🎉 Setup completed successfully!');
    console.log('🌐 Access the application at: http://localhost:3000');
    console.log('🔑 Login at: http://localhost:3000/login');
    console.log('');
    console.log('📝 Next Steps:');
    console.log('1. Start the development server: npm run dev');
    console.log('2. Open http://localhost:3000');
    console.log('3. Login with any of the created accounts');
    console.log('4. Change passwords on first login');
    
  } catch (error) {
    console.error('❌ Error during setup:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code
    });
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the setup
main();

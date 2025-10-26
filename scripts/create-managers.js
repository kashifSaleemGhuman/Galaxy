#!/usr/bin/env node

/**
 * Create All Manager Users Script
 * 
 * This script creates:
 * 1. A default tenant (if not exists)
 * 2. All necessary roles with permissions
 * 3. All manager users with manager123 password
 * 
 * Usage: node scripts/create-managers.js
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const PASSWORD = 'manager123'
const TENANT_NAME = 'Galaxy ERP Main Tenant'

// Manager configurations
const MANAGERS = [
  {
    email: 'inventory.manager@galaxy.com',
    firstName: 'Inventory',
    lastName: 'Manager',
    roleName: 'Inventory Manager',
    roleKey: 'inventory_manager',
    permissions: {
      inventory: ['read', 'write', 'approve', 'delete'],
      purchase: ['read'],
      crm: ['read'],
      dashboard: ['read']
    }
  },
  {
    email: 'purchase.manager@galaxy.com',
    firstName: 'Purchase',
    lastName: 'Manager',
    roleName: 'Purchase Manager',
    roleKey: 'purchase_manager',
    permissions: {
      purchase: ['read', 'write', 'approve', 'delete'],
      inventory: ['read', 'write'],
      suppliers: ['read', 'write', 'approve'],
      dashboard: ['read']
    }
  },
  {
    email: 'crm.manager@galaxy.com',
    firstName: 'CRM',
    lastName: 'Manager',
    roleName: 'CRM Manager',
    roleKey: 'crm_manager',
    permissions: {
      crm: ['read', 'write', 'approve', 'delete'],
      sales: ['read', 'write'],
      customers: ['read', 'write', 'approve'],
      leads: ['read', 'write', 'approve'],
      dashboard: ['read']
    }
  },
  {
    email: 'hr.manager@galaxy.com',
    firstName: 'HR',
    lastName: 'Manager',
    roleName: 'HR Manager',
    roleKey: 'hr_manager',
    permissions: {
      hrm: ['read', 'write', 'approve', 'delete'],
      employees: ['read', 'write', 'approve'],
      departments: ['read', 'write', 'approve'],
      payroll: ['read', 'write'],
      dashboard: ['read']
    }
  },
  {
    email: 'accountant@galaxy.com',
    firstName: 'Finance',
    lastName: 'Accountant',
    roleName: 'Accountant',
    roleKey: 'accountant',
    permissions: {
      accounting: ['read', 'write', 'approve', 'delete'],
      chart_of_accounts: ['read', 'write', 'approve'],
      journal_entries: ['read', 'write', 'approve'],
      financial_reports: ['read', 'write', 'approve'],
      dashboard: ['read']
    }
  },
  {
    email: 'sales.manager@galaxy.com',
    firstName: 'Sales',
    lastName: 'Manager',
    roleName: 'Sales Manager',
    roleKey: 'sales_manager',
    permissions: {
      sales: ['read', 'write', 'approve', 'delete'],
      orders: ['read', 'write', 'approve'],
      quotes: ['read', 'write', 'approve'],
      invoices: ['read', 'write', 'approve'],
      crm: ['read', 'write'],
      dashboard: ['read']
    }
  }
]

async function createTenant() {
  console.log('🏢 Creating tenant...')
  
  const existingTenant = await prisma.tenant.findFirst({
    where: { name: TENANT_NAME }
  })
  
  if (existingTenant) {
    console.log(`✅ Tenant already exists: ${existingTenant.id}`)
    return existingTenant
  }
  
  const tenant = await prisma.tenant.create({
    data: {
      name: TENANT_NAME,
      domain: 'galaxy.local',
      settings: {
        timezone: 'UTC',
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        features: {
          crm: true,
          sales: true,
          inventory: true,
          purchase: true,
          hrm: true,
          accounting: true
        }
      }
    }
  })
  
  console.log(`✅ Created tenant: ${tenant.id}`)
  return tenant
}

async function createRoles(tenantId) {
  console.log('👥 Creating roles...')
  
  const roles = []
  
  for (const manager of MANAGERS) {
    const existingRole = await prisma.role.findFirst({
      where: { 
        name: manager.roleName,
        // Note: roles table doesn't have tenantId in schema, so we'll use name uniqueness
      }
    })
    
    if (existingRole) {
      console.log(`✅ Role already exists: ${manager.roleName}`)
      roles.push(existingRole)
      continue
    }
    
    const role = await prisma.role.create({
      data: {
        name: manager.roleName,
        description: `${manager.roleName} with full access to ${Object.keys(manager.permissions).join(', ')}`,
        permissions: manager.permissions
      }
    })
    
    console.log(`✅ Created role: ${role.name}`)
    roles.push(role)
  }
  
  return roles
}

async function createManagers(tenantId, roles) {
  console.log('👤 Creating manager users...')
  
  const passwordHash = await bcrypt.hash(PASSWORD, 10)
  const createdUsers = []
  
  for (let i = 0; i < MANAGERS.length; i++) {
    const manager = MANAGERS[i]
    const role = roles[i]
    
    const existingUser = await prisma.user.findUnique({
      where: { email: manager.email }
    })
    
    if (existingUser) {
      console.log(`✅ User already exists: ${manager.email}`)
      createdUsers.push(existingUser)
      continue
    }
    
    const user = await prisma.user.create({
      data: {
        tenantId,
        email: manager.email,
        passwordHash,
        firstName: manager.firstName,
        lastName: manager.lastName,
        roleId: role.id,
        isActive: true
      }
    })
    
    console.log(`✅ Created user: ${user.email} (${user.firstName} ${user.lastName})`)
    createdUsers.push(user)
  }
  
  return createdUsers
}

async function createAdminUser(tenantId) {
  console.log('👑 Creating admin user...')
  
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@galaxy.com' }
  })
  
  if (existingAdmin) {
    console.log('✅ Admin user already exists')
    return existingAdmin
  }
  
  // Create admin role if not exists
  let adminRole = await prisma.role.findFirst({
    where: { name: 'System Administrator' }
  })
  
  if (!adminRole) {
    adminRole = await prisma.role.create({
      data: {
        name: 'System Administrator',
        description: 'Full system access with all permissions',
        permissions: {
          '*': ['read', 'write', 'approve', 'delete', 'admin'],
          system: ['read', 'write', 'approve', 'delete', 'admin'],
          users: ['read', 'write', 'approve', 'delete', 'admin'],
          tenants: ['read', 'write', 'approve', 'delete', 'admin']
        }
      }
    })
    console.log('✅ Created admin role')
  }
  
  const passwordHash = await bcrypt.hash('admin123', 10)
  
  const admin = await prisma.user.create({
    data: {
      tenantId,
      email: 'admin@galaxy.com',
      passwordHash,
      firstName: 'System',
      lastName: 'Administrator',
      roleId: adminRole.id,
      isActive: true
    }
  })
  
  console.log('✅ Created admin user: admin@galaxy.com')
  return admin
}

async function main() {
  try {
    console.log('🚀 Starting Galaxy ERP Manager Setup...\n')
    
    // 1. Create tenant
    const tenant = await createTenant()
    console.log('')
    
    // 2. Create roles
    const roles = await createRoles(tenant.id)
    console.log('')
    
    // 3. Create managers
    const managers = await createManagers(tenant.id, roles)
    console.log('')
    
    // 4. Create admin user
    const admin = await createAdminUser(tenant.id)
    console.log('')
    
    // 5. Summary
    console.log('📋 Setup Summary:')
    console.log('================')
    console.log(`🏢 Tenant: ${tenant.name} (${tenant.id})`)
    console.log(`👥 Roles created: ${roles.length}`)
    console.log(`👤 Manager users created: ${managers.length}`)
    console.log(`👑 Admin user: admin@galaxy.com`)
    console.log('')
    console.log('🔐 Login Credentials:')
    console.log('====================')
    console.log('Admin:')
    console.log('  Email: admin@galaxy.com')
    console.log('  Password: admin123')
    console.log('')
    console.log('Managers (all use password: manager123):')
    managers.forEach((user, index) => {
      const manager = MANAGERS[index]
      console.log(`  ${manager.roleName}:`)
      console.log(`    Email: ${user.email}`)
      console.log(`    Password: ${PASSWORD}`)
    })
    console.log('')
    console.log('✅ Setup completed successfully!')
    console.log('🌐 Access the application at: http://localhost:3000')
    console.log('🔑 Login at: http://localhost:3000/login')
    
  } catch (error) {
    console.error('❌ Error during setup:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
main()







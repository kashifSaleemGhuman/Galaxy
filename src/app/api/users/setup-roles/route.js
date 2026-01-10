import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import prisma from '@/lib/db'
import bcrypt from 'bcryptjs'
import { ROLES } from '@/lib/constants/roles'

export async function POST() {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const currentUser = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!currentUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    if (![ROLES.SUPER_ADMIN].includes(currentUser.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const roleNames = [
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN,
      ROLES.PURCHASE_MANAGER,
      ROLES.PURCHASE_USER,
      ROLES.INVENTORY_MANAGER,
      ROLES.INVENTORY_USER,
      ROLES.ACCOUNTS_MANAGER,
      ROLES.ACCOUNTS_USER,
      ROLES.CRM_MANAGER,
      ROLES.SALES_MANAGER,
      ROLES.HR_MANAGER,
      ROLES.ACCOUNTANT,
      ROLES.USER
    ]

    // Ensure roles exist
    await Promise.all(roleNames.map(async (name) => {
      await prisma.role.upsert({
        where: { name },
        update: {},
        create: { name, description: `${name} role`, permissions: {} }
      })
    }))

    // Seed essential users with default passwords
    const accounts = [
      { email: 'admin@galaxy.com', name: 'Super Admin', role: ROLES.SUPER_ADMIN, password: 'admin123' },
      { email: 'purchase.manager@galaxy.com', name: 'Purchase Manager', role: ROLES.PURCHASE_MANAGER, password: 'purchase123' },
      { email: 'inventory.manager@galaxy.com', name: 'Inventory Manager', role: ROLES.INVENTORY_MANAGER, password: 'inventory123' },
      { email: 'warehouse.operator@galaxy.com', name: 'Warehouse Operator', role: ROLES.INVENTORY_USER, password: 'warehouse123' }
    ]

    const results = []
    for (const acc of accounts) {
      const hashed = await bcrypt.hash(acc.password, 10)
      const user = await prisma.user.upsert({
        where: { email: acc.email },
        update: { name: acc.name, role: acc.role, password: hashed, isActive: true },
        create: { email: acc.email, name: acc.name, role: acc.role, password: hashed, isActive: true }
      })
      results.push({ email: user.email, role: user.role, password: acc.password })
    }

    return NextResponse.json({ success: true, created: results })
  } catch (err) {
    console.error('Error setting up roles:', err)
    return NextResponse.json({ error: 'Failed to create roles and users', details: err.message }, { status: 500 })
  }
}



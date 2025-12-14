import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { ROLES } from '@/lib/constants/roles'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    })
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const role = (currentUser.role || '').toUpperCase()
    const canViewInventory = [
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN,
      ROLES.INVENTORY_MANAGER,
      ROLES.INVENTORY_USER,
      ROLES.WAREHOUSE_OPERATOR,
      ROLES.PURCHASE_MANAGER
    ].includes(role)

    if (!canViewInventory) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Parallel fetches
    const [
      totalProducts,
      totalWarehouses,
      locations,
      lowStockItems,
      recentMovements,
      pendingReceipts,
      stockSummary
    ] = await Promise.all([
      prisma.product.count(),
      prisma.warehouse.count({ where: { isActive: true } }),
      prisma.inventoryItem.findMany({
        where: { locationId: { not: null } },
        select: { locationId: true }
      }),
      prisma.inventoryItem.findMany({
        where: { quantity: { lte: prisma.inventoryItem.fields.minLevel } }, // fallback handled below
        select: {
          id: true,
          quantity: true,
          minLevel: true,
          product: { select: { id: true, name: true } },
          warehouse: { select: { id: true, name: true } }
        },
        take: 10
      }).catch(async () => {
        // Prisma doesn't allow comparing to another field directly; fallback: fetch all and filter
        const items = await prisma.inventoryItem.findMany({
          select: {
            id: true,
            quantity: true,
            minLevel: true,
            product: { select: { id: true, name: true } },
            warehouse: { select: { id: true, name: true } }
          }
        })
        return items.filter(i => i.quantity <= (i.minLevel ?? 0)).slice(0, 10)
      }),
      prisma.stockMovement.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          type: true,
          quantity: true,
          createdAt: true,
          reference: true,
          product: { select: { id: true, name: true } },
          warehouse: { select: { id: true, name: true } }
        }
      }),
      prisma.incomingShipment.findMany({
        where: { status: { in: ['pending', 'assigned'] } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          warehouse: true,
          purchaseOrder: {
            include: { supplier: true }
          }
        }
      }),
      prisma.inventoryItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true }
      })
    ])

    const totalLocations = new Set(
      locations
        .map(l => l.locationId)
        .filter(Boolean)
    ).size

    const totalStockUnits = stockSummary.reduce((sum, row) => sum + (row._sum.quantity || 0), 0)

    return NextResponse.json({
      success: true,
      stats: {
        totalProducts,
        totalWarehouses,
        totalLocations,
        totalStockUnits
      },
      lowStock: lowStockItems.map(item => ({
        id: item.id,
        productName: item.product?.name || 'Unknown',
        warehouseName: item.warehouse?.name || 'Unknown',
        quantity: item.quantity,
        minLevel: item.minLevel ?? 0
      })),
      recentMovements: recentMovements.map(m => ({
        id: m.id,
        type: m.type,
        quantity: m.quantity,
        createdAt: m.createdAt,
        product: m.product?.name || 'Unknown',
        warehouse: m.warehouse?.name || 'Unknown',
        reference: m.reference || ''
      })),
      pendingReceipts: pendingReceipts.map(r => ({
        id: r.id,
        status: r.status,
        warehouse: r.warehouse?.name || 'Unassigned',
        supplier: r.purchaseOrder?.supplier?.name || 'Unknown',
        expectedDate: r.assignedAt || r.createdAt
      }))
    })
  } catch (error) {
    console.error('Inventory stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


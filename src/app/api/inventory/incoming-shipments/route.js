import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to view goods receipts
    if (!['SUPER_ADMIN', 'ADMIN', 'PURCHASE_MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const goodsReceipts = await prisma.goodsReceipt.findMany({
      include: {
        purchaseOrder: {
          include: {
            supplier: true,
            lines: {
              include: {
                product: true
              }
            }
          }
        }
      },
      orderBy: {
        dateReceived: 'desc'
      }
    })

    return NextResponse.json(goodsReceipts || [])

  } catch (error) {
    console.error('Error fetching goods receipts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to create POs
    if (!['SUPER_ADMIN', 'ADMIN', 'PURCHASE_MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { supplierId } = body || {}

    // If no supplier provided, create mock one
    let supplier
    
    if (supplierId) {
      supplier = await prisma.supplier.findFirst({
        where: {
          supplierId: supplierId
        }
      })
    }
    
    if (!supplier) {
      // Create a mock supplier
      supplier = await prisma.supplier.upsert({
        where: { supplierId: 'MOCK-SUP-001' },
        update: {},
        create: {
          supplierId: 'MOCK-SUP-001',
          name: 'Mock Supplier Ltd',
          email: 'mock@supplier.com',
          contactInfo: 'contact@mocksupplier.com, +1-555-0001',
          phone: '+1-555-0001'
        }
      })
    }

    // Get some products to create PO lines
    const products = await prisma.product.findMany({
      where: {
        isActive: true
      },
      take: 3
    })

    if (products.length === 0) {
      return NextResponse.json(
        { error: 'No products available to create PO' },
        { status: 400 }
      )
    }

    // Generate PO number
    const poNumber = `PO-${Date.now()}`
    
    // Create PO with lines
    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        poId: poNumber,
        supplierId: supplier.supplierId,
        status: 'draft',
        lines: {
          create: products.map((product, index) => ({
            poLineId: `POL-${Date.now()}-${index}`,
            productId: product.id,
            quantityOrdered: Math.floor(Math.random() * 10) + 1,
            quantityReceived: 0,
            price: Math.random() * 100 + 10 // Random price between 10-110
          }))
        }
      },
      include: {
        lines: {
          include: {
            product: true
          }
        },
        supplier: true
      }
    })

    // Create goods receipt automatically
    const goodsReceipt = await prisma.goodsReceipt.create({
      data: {
        receiptId: `GR-${Date.now()}`,
        poId: purchaseOrder.poId,
        dateReceived: new Date(),
        status: 'pending'
      },
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
      }
    })

    return NextResponse.json({
      message: 'Mock PO and goods receipt created successfully',
      purchaseOrder,
      goodsReceipt
    })

  } catch (error) {
    console.error('Error creating mock PO:', error)
    return NextResponse.json(
      { error: 'Failed to create mock PO' },
      { status: 500 }
    )
  }
}
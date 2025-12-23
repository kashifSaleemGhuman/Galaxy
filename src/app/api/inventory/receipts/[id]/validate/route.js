import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { hasPermission, PERMISSIONS } from '@/lib/constants/roles'
import { isAuthorizedForWarehouse } from '@/lib/warehouse-auth'

// Force dynamic rendering - this route uses getServerSession which requires headers()
export const dynamic = 'force-dynamic'

// POST /api/inventory/receipts/[id]/validate - Validate goods receipt and update stock
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current user from database
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check permissions
    if (!hasPermission(currentUser.role, PERMISSIONS.INVENTORY.RECEIPT_VALIDATE)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    const { id } = params
    const body = await request.json()
    const { receivedQuantities = [] } = body // Array of { productId, quantity, warehouseId, locationId }
    
    // Check warehouse authorization for each warehouse in receivedQuantities
    const warehouseIds = [...new Set(receivedQuantities.map(rq => rq.warehouseId).filter(Boolean))]
    for (const warehouseId of warehouseIds) {
      const isAuthorized = await isAuthorizedForWarehouse(currentUser, warehouseId)
      if (!isAuthorized) {
        return NextResponse.json(
          { error: `You are not authorized to validate receipts for warehouse ${warehouseId}. Only the assigned warehouse manager can process receipts for their warehouse.` },
          { status: 403 }
        )
      }
    }
    
    // Get the goods receipt with related data
    const receipt = await prisma.goodsReceipt.findUnique({
      where: { receiptId: id },
      include: {
        purchaseOrder: {
          include: {
            lines: {
              include: {
                product: true
              }
            }
          }
        }
      }
    })
    
    if (!receipt) {
      return NextResponse.json(
        { error: 'Goods receipt not found' },
        { status: 404 }
      )
    }
    
    if (receipt.status === 'Received') {
      return NextResponse.json(
        { error: 'Receipt already validated' },
        { status: 400 }
      )
    }
    
    // Start transaction to update multiple records
    const result = await prisma.$transaction(async (tx) => {
      // Update receipt status
      const updatedReceipt = await tx.goodsReceipt.update({
        where: { receiptId: id },
        data: {
          status: 'Received',
          dateReceived: new Date()
        }
      })
      
      // Update PO line quantities received
      for (const line of receipt.purchaseOrder.lines) {
        const receivedQty = receivedQuantities.find(rq => rq.productId === line.productId)?.quantity || line.quantityOrdered
        
        await tx.pOLine.update({
          where: { poLineId: line.poLineId },
          data: {
            quantityReceived: receivedQty
          }
        })
        
        // Find or create inventory item
        const warehouseId = receivedQuantities.find(rq => rq.productId === line.productId)?.warehouseId || 'default-warehouse'
        const locationId = receivedQuantities.find(rq => rq.productId === line.productId)?.locationId || null
        
        const inventoryItem = await tx.inventoryItem.upsert({
          where: {
            productId_warehouseId: {
              productId: line.productId,
              warehouseId: warehouseId
            }
          },
          update: {
            quantity: {
              increment: receivedQty
            },
            available: {
              increment: receivedQty
            }
          },
          create: {
            productId: line.productId,
            warehouseId: warehouseId,
            locationId: locationId,
            quantity: receivedQty,
            reserved: 0,
            available: receivedQty,
            minLevel: 0,
            maxLevel: 0
          }
        })
        
        // Create stock movement record
        await tx.stockMovement.create({
          data: {
            productId: line.productId,
            warehouseId: warehouseId,
            locationId: locationId,
            type: 'in',
            quantity: receivedQty,
            reason: `Goods receipt ${receipt.receiptId}`,
            reference: receipt.poId,
            createdBy: session.user.id
          }
        })
      }
      
      // Update PO status if all items received
      const allLinesReceived = await tx.pOLine.findMany({
        where: { poId: receipt.poId }
      })
      
      const totalOrdered = allLinesReceived.reduce((sum, line) => sum + line.quantityOrdered, 0)
      const totalReceived = allLinesReceived.reduce((sum, line) => sum + line.quantityReceived, 0)
      
      if (totalReceived >= totalOrdered) {
        await tx.purchaseOrder.update({
          where: { poId: receipt.poId },
          data: { status: 'Received' }
        })
      } else if (totalReceived > 0) {
        await tx.purchaseOrder.update({
          where: { poId: receipt.poId },
          data: { status: 'Partially Received' }
        })
      }
      
      return updatedReceipt
    })
    
    console.log('✅ Goods receipt validated successfully:', id)
    
    return NextResponse.json({ 
      message: 'Goods receipt validated successfully',
      receipt: result
    })
    
  } catch (error) {
    console.error('❌ Error validating goods receipt:', error)
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    )
  }
}

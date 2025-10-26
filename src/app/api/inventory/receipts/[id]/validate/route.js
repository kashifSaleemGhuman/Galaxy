import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'

// POST /api/inventory/receipts/[id]/validate - Validate goods receipt and update stock
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    if (!hasPermission(session.user.role?.name, PERMISSIONS.INVENTORY.RECEIPT_VALIDATE)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    const { id } = params
    const body = await request.json()
    const { receivedQuantities = [] } = body // Array of { productId, quantity, warehouseId, locationId }
    
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
        
        await tx.pO_Line.update({
          where: { poLineId: line.poLineId },
          data: {
            quantityReceived: receivedQty
          }
        })
        
        // Find or create inventory item
        const inventoryItem = await tx.inventoryItem.upsert({
          where: {
            productId_warehouseId_locationId: {
              productId: line.productId,
              warehouseId: receivedQuantities.find(rq => rq.productId === line.productId)?.warehouseId || 'default-warehouse',
              locationId: receivedQuantities.find(rq => rq.productId === line.productId)?.locationId || null
            }
          },
          update: {
            quantityOnHand: {
              increment: receivedQty
            },
            quantityAvailable: {
              increment: receivedQty
            },
            lastMovementDate: new Date()
          },
          create: {
            tenantId: session.user.tenantId,
            productId: line.productId,
            warehouseId: receivedQuantities.find(rq => rq.productId === line.productId)?.warehouseId || 'default-warehouse',
            locationId: receivedQuantities.find(rq => rq.productId === line.productId)?.locationId || null,
            quantityOnHand: receivedQty,
            quantityReserved: 0,
            quantityAvailable: receivedQty,
            reorderPoint: line.product.reorderPoint,
            maxStock: line.product.maxStock,
            minStock: line.product.minStock,
            averageCost: line.price,
            lastCost: line.price,
            lastMovementDate: new Date()
          }
        })
        
        // Create stock movement record
        await tx.stockMovement.create({
          data: {
            tenantId: session.user.tenantId,
            inventoryItemId: inventoryItem.id,
            movementType: 'in',
            quantity: receivedQty,
            unitCost: line.price,
            totalCost: receivedQty * line.price,
            referenceType: 'purchase',
            referenceId: receipt.poId,
            notes: `Goods receipt ${receipt.receiptId}`,
            movementDate: new Date(),
            createdBy: session.user.id
          }
        })
      }
      
      // Update PO status if all items received
      const allLinesReceived = await tx.pO_Line.findMany({
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

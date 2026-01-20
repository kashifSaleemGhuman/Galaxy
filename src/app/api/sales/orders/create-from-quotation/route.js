import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { ROLES } from '@/lib/constants/roles';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// POST /api/sales/orders/create-from-quotation - Create sales order from quotation
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check permissions
    const userRole = (currentUser.role || '').toUpperCase();
    const canCreateOrder = [
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN,
      ROLES.SALES_MANAGER,
      ROLES.SALES_USER
    ].includes(userRole);

    if (!canCreateOrder) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await req.json();
    const { quotationId, warehouseId } = body;

    if (!quotationId || !warehouseId) {
      return NextResponse.json(
        { error: 'quotationId and warehouseId are required' },
        { status: 400 }
      );
    }

    // Fetch quotation with items
    const quotation = await prisma.salesQuotation.findUnique({
      where: { id: quotationId },
      include: {
        items: true,
        createdBy: { select: { id: true, name: true, email: true } }
      }
    });

    if (!quotation) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    }

    // Validate quotation status
    if (quotation.status !== 'sent') {
      return NextResponse.json(
        { error: `Quotation must be in 'sent' status. Current status: ${quotation.status}` },
        { status: 400 }
      );
    }

    // Check if warehouse exists
    const warehouse = await prisma.warehouse.findUnique({
      where: { id: warehouseId }
    });

    if (!warehouse) {
      return NextResponse.json({ error: 'Warehouse not found' }, { status: 404 });
    }

    // Validate inventory availability
    const insufficientStock = [];
    for (const item of quotation.items) {
      if (item.productId) {
        const inventoryItem = await prisma.inventoryItem.findUnique({
          where: {
            productId_warehouseId: {
              productId: item.productId,
              warehouseId: warehouseId
            }
          }
        });

        if (!inventoryItem || inventoryItem.available < item.quantity) {
          insufficientStock.push({
            productName: item.productName,
            required: item.quantity,
            available: inventoryItem?.available || 0
          });
        }
      }
    }

    if (insufficientStock.length > 0) {
      return NextResponse.json(
        {
          error: 'Insufficient stock for one or more items',
          insufficientStock
        },
        { status: 400 }
      );
    }

    // Generate order number
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
    
    // Check if SalesOrder model exists in Prisma client
    if (!prisma.salesOrder) {
      console.error('SalesOrder model not found in Prisma client. Please run: npx prisma generate');
      return NextResponse.json(
        { error: 'Database models not initialized. Please contact administrator.' },
        { status: 500 }
      );
    }
    
    const count = await prisma.salesOrder.count({
      where: {
        orderNumber: {
          startsWith: `SO-${dateStr}`
        }
      }
    });
    const orderNumber = `SO-${dateStr}-${String(count + 1).padStart(3, '0')}`;

    // Create sales order and reduce inventory in transaction
    const salesOrder = await prisma.$transaction(async (tx) => {
      // Create sales order
      const order = await tx.salesOrder.create({
        data: {
          orderNumber,
          quotationId: quotation.id,
          warehouseId: warehouseId,
          status: 'pending',
          customerName: quotation.customerName,
          customerEmail: quotation.customerEmail,
          customerPhone: quotation.customerPhone,
          customerCompanyName: quotation.customerCompanyName,
          totalAmount: quotation.totalAmount,
          taxAmount: quotation.taxAmount,
          discountAmount: quotation.discountAmount,
          freightCharges: quotation.freightCharges,
          finalNetPrice: quotation.finalNetPrice,
          createdById: currentUser.id
        }
      });

      // Create order items and reduce inventory
      for (const item of quotation.items) {
        // Create order item
        await tx.salesOrderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            exFactoryPrice: item.exFactoryPrice,
            taxCharges: item.taxCharges,
            freightCharges: item.freightCharges,
            discountAmount: item.discountAmount,
            finalNetPrice: item.finalNetPrice
          }
        });

        // Reduce inventory if product exists
        if (item.productId) {
          // Get inventory item first to ensure it exists
          const inventoryItem = await tx.inventoryItem.findUnique({
            where: {
              productId_warehouseId: {
                productId: item.productId,
                warehouseId: warehouseId
              }
            }
          });

          if (!inventoryItem) {
            throw new Error(`Inventory item not found for product ${item.productId} in warehouse ${warehouseId}`);
          }

          // Update inventory first
          const updatedInventory = await tx.inventoryItem.update({
            where: {
              productId_warehouseId: {
                productId: item.productId,
                warehouseId: warehouseId
              }
            },
            data: {
              quantity: { decrement: item.quantity },
              available: { decrement: item.quantity }
            }
          });

          // Create stock movement (quantity should be positive, type indicates direction)
          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              warehouseId: warehouseId,
              type: 'out',
              quantity: item.quantity, // Positive quantity, type='out' indicates outbound
              reason: `Sales order ${orderNumber}`,
              reference: orderNumber,
              createdBy: currentUser.id
            }
          });
        }
      }

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: currentUser.id,
          action: 'CREATE_SALES_ORDER',
          details: `Created sales order ${orderNumber} from quotation ${quotation.quotationNumber}`
        }
      });

      // Fetch complete order with relations
      return await tx.salesOrder.findUnique({
        where: { id: order.id },
        include: {
          quotation: {
            include: {
              createdBy: { select: { id: true, name: true, email: true } }
            }
          },
          warehouse: true,
          createdBy: { select: { id: true, name: true, email: true } },
          items: {
            include: {
              product: true
            }
          }
        }
      });
    });

    return NextResponse.json({ order: salesOrder });
  } catch (error) {
    console.error('Error creating sales order:', error);
    
    // Provide more specific error messages
    if (error.message?.includes('not found in Prisma client')) {
      return NextResponse.json(
        { 
          error: 'Database models not initialized. Please run: npx prisma generate',
          details: error.message
        },
        { status: 500 }
      );
    }
    
    if (error.message?.includes('Inventory item not found')) {
      return NextResponse.json(
        { 
          error: error.message,
          insufficientStock: [{ productName: 'Unknown', required: 0, available: 0 }]
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to create sales order',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

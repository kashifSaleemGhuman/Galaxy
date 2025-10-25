import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/db';
import { ROLES } from '@/lib/constants/roles';

// POST /api/purchase/purchase-orders/from-rfq - Create Purchase Order from approved RFQ
export async function POST(req) {
  // Debug: Check prisma client
  console.log('Prisma client imported:', !!prisma);
  console.log('Prisma client type:', typeof prisma);
  console.log('Available models:', Object.keys(prisma));
  console.log('Supplier model available:', !!prisma.supplier);
  
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has permission to create purchase orders
    const canCreatePO = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PURCHASE_MANAGER, ROLES.PURCHASE_USER].includes(currentUser.role);
    if (!canCreatePO) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { rfqId, poNumber, notes } = await req.json();

    if (!rfqId) {
      return NextResponse.json({ error: 'RFQ ID is required' }, { status: 400 });
    }

    // Get the approved RFQ with all related data
    const rfq = await prisma.rFQ.findUnique({
      where: { id: rfqId },
      include: {
        vendor: true,
        items: {
          include: {
            product: true
          }
        },
        approvedBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!rfq) {
      return NextResponse.json({ error: 'RFQ not found' }, { status: 404 });
    }

    // Check if RFQ is approved
    if (rfq.status !== 'approved') {
      return NextResponse.json({ 
        error: `RFQ must be approved to create a purchase order. Current status: ${rfq.status}` 
      }, { status: 400 });
    }

    // Validate RFQ has required data
    if (!rfq.vendor) {
      return NextResponse.json({ 
        error: 'RFQ must have vendor information' 
      }, { status: 400 });
    }

    if (!rfq.items || rfq.items.length === 0) {
      return NextResponse.json({ 
        error: 'RFQ must have items to create a purchase order' 
      }, { status: 400 });
    }

    console.log('RFQ data:', {
      id: rfq.id,
      status: rfq.status,
      vendor: rfq.vendor,
      itemsCount: rfq.items.length,
      vendorPrice: rfq.vendorPrice
    });

    // Check if vendor has supplier record
    console.log('Looking for supplier with email:', rfq.vendor.email);
    let supplier;
    try {
      supplier = await prisma.supplier.findFirst({
        where: { email: rfq.vendor.email }
      });
      console.log('Found supplier:', supplier);
    } catch (supplierError) {
      console.error('Error finding supplier:', supplierError);
      throw new Error(`Failed to lookup supplier: ${supplierError.message}`);
    }

    // If supplier doesn't exist, create one
    if (!supplier) {
      try {
        console.log('Creating new supplier for vendor:', rfq.vendor.name);
        supplier = await prisma.supplier.create({
          data: {
            supplierId: `SUP-${Date.now()}`,
            name: rfq.vendor.name,
            email: rfq.vendor.email,
            phone: rfq.vendor.phone,
            contactInfo: rfq.vendor.address
          }
        });
        console.log('Created supplier:', supplier);
      } catch (createError) {
        console.error('Error creating supplier:', createError);
        throw new Error(`Failed to create supplier: ${createError.message}`);
      }
    }

    // Generate PO number if not provided
    const finalPONumber = poNumber || `PO-${Date.now()}`;

    // Create purchase order with lines in a transaction
    const purchaseOrder = await prisma.$transaction(async (tx) => {
      // Create the purchase order
      const po = await tx.purchaseOrder.create({
        data: {
          poId: finalPONumber,
          rfqId: rfq.id,
          supplierId: supplier.supplierId,
          status: 'draft',
          dateCreated: new Date()
        }
      });

      // Create purchase order lines from RFQ items
      const poLines = await Promise.all(
        rfq.items.map(async (item, index) => {
          return await tx.pOLine.create({
            data: {
              poLineId: `POL-${Date.now()}-${index}`,
              poId: po.poId,
              productId: item.productId || item.product?.id,
              quantityOrdered: item.quantity,
              quantityReceived: 0,
              price: rfq.vendorPrice || 0 // Use vendor price from RFQ
            }
          });
        })
      );

      return { po, lines: poLines };
    });

    // Return the created purchase order with details
    const createdPO = await prisma.purchaseOrder.findUnique({
      where: { poId: purchaseOrder.po.poId },
      include: {
        supplier: true,
        lines: {
          include: {
            product: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Purchase order created successfully',
      data: {
        poId: createdPO.poId,
        rfqId: createdPO.rfqId,
        supplierId: createdPO.supplierId,
        supplierName: createdPO.supplier.name,
        status: createdPO.status,
        dateCreated: createdPO.dateCreated,
        lines: createdPO.lines.map(line => ({
          poLineId: line.poLineId,
          productId: line.productId,
          productName: line.product.name,
          quantityOrdered: line.quantityOrdered,
          quantityReceived: line.quantityReceived,
          price: line.price,
          totalAmount: line.quantityOrdered * line.price
        })),
        totalAmount: createdPO.lines.reduce((sum, line) => 
          sum + (line.quantityOrdered * line.price), 0
        )
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating purchase order from RFQ:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      meta: error.meta
    });
    
    return NextResponse.json({ 
      error: 'Failed to create purchase order',
      details: error.message,
      code: error.code || 'UNKNOWN_ERROR'
    }, { status: 500 });
  } finally {
    // No need to disconnect shared Prisma client
  }
}

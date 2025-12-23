import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/db';
import { ROLES } from '@/lib/constants/roles';

// Force dynamic rendering - this route uses getServerSession which requires headers()
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req) {
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

    const role = (currentUser.role || '').toUpperCase()
    // Check permissions
    const canViewPO = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PURCHASE_MANAGER, ROLES.PURCHASE_USER].includes(role);
    if (!canViewPO) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const supplierId = searchParams.get('supplier_id');
    const rfqId = searchParams.get('rfqId') || searchParams.get('rfq_id');
    const limit = parseInt(searchParams.get('limit')) || 50;

    let whereClause = {};
    
    if (status) {
      whereClause.status = status;
    }
    
    if (supplierId) {
      whereClause.supplierId = supplierId;
    }
    if (rfqId) {
      whereClause.rfqId = rfqId;
    }

    let data = [];
    try {
      data = await prisma.purchaseOrder.findMany({ 
        where: whereClause,
        include: { 
          supplier: true,
          lines: {
            include: {
              product: true
            }
          }
        },
        orderBy: { dateCreated: 'desc' },
        take: limit
      });
    } catch (dbError) {
      console.error('Database error fetching purchase orders:', dbError);
      // Return empty array instead of failing - allows UI to continue working
      if (rfqId) {
        // If querying by rfqId and it fails, return empty (no PO exists yet)
        return NextResponse.json({ success: true, data: [] });
      }
      throw dbError;
    }

    const shaped = data.map(p => ({
      po_id: p.poId,
      rfq_id: p.rfqId,
      supplier_id: p.supplierId,
      supplier_name: p.supplier?.name,
      date_created: p.dateCreated.toISOString().split('T')[0],
      status: p.status,
      total_amount: p.lines.reduce((sum, line) => 
        sum + (line.quantityOrdered * line.price), 0
      ),
      line_count: p.lines.length
    }));

    return NextResponse.json({ success: true, data: shaped });
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
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

    // Check permissions
    const canCreatePO = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PURCHASE_MANAGER, ROLES.PURCHASE_USER].includes(currentUser.role);
    if (!canCreatePO) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { po_id, rfq_id, supplier_id, status = 'draft', lines = [] } = body;

    if (!supplier_id) {
      return NextResponse.json({ 
        success: false, 
        error: 'supplier_id is required' 
      }, { status: 400 });
    }

    // Validate supplier exists
    const supplier = await prisma.supplier.findUnique({
      where: { supplierId: supplier_id }
    });

    if (!supplier) {
      return NextResponse.json({ 
        success: false, 
        error: 'Supplier not found' 
      }, { status: 404 });
    }

    // Generate PO ID if not provided
    const finalPOId = po_id || `PO-${Date.now()}`;

    // Create purchase order with lines in transaction
    const result = await prisma.$transaction(async (tx) => {
      const created = await tx.purchaseOrder.create({
        data: {
          poId: finalPOId,
          rfqId: rfq_id || null,
          supplierId: supplier_id,
          status,
          dateCreated: new Date()
        }
      });

      // Create PO lines if provided
      if (lines && lines.length > 0) {
        const poLines = await Promise.all(
          lines.map(async (line) => {
            return await tx.pOLine.create({
              data: {
                poLineId: `POL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                poId: created.poId,
                productId: line.product_id,
                quantityOrdered: line.quantity_ordered,
                quantityReceived: line.quantity_received || 0,
                price: line.price
              }
            });
          })
        );
        return { po: created, lines: poLines };
      }

      return { po: created, lines: [] };
    });

    return NextResponse.json({ 
      success: true, 
      data: { 
        po_id: result.po.poId, 
        rfq_id: result.po.rfqId, 
        supplier_id: result.po.supplierId, 
        date_created: result.po.dateCreated.toISOString().split('T')[0], 
        status: result.po.status,
        lines_created: result.lines.length
      } 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating purchase order:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

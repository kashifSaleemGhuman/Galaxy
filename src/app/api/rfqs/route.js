import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { ROLES } from '@/lib/constants/roles';

// Force dynamic rendering - this route uses getServerSession which requires headers()
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Helper function to generate RFQ number
function generateRFQNumber() {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  return `RFQ-${year}${month}-${random}`;
}

// GET /api/rfqs - List RFQs
export async function GET(req) {
  try {
    // Check if Prisma client is available
    if (!prisma) {
      console.error('Prisma client is not initialized');
      return NextResponse.json({ error: 'Database connection error' }, { status: 500 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;

    // Build where clause
    const where = {};
    if (status && status !== 'all') {
      where.status = status;
    }

    // Check if user is admin/manager - they can see all RFQs
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (![ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PURCHASE_MANAGER].includes(currentUser.role)) {
      // Regular users can only see their own RFQs
      where.createdById = currentUser.id;
    }

    const [rfqs, total] = await Promise.all([
      prisma.rFQ.findMany({
        where,
        include: {
          vendor: true,
          createdBy: {
            select: { id: true, name: true, email: true }
          },
          approvedBy: {
            select: { id: true, name: true, email: true }
          },
          items: {
            include: {
              product: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.rFQ.count({ where })
    ]);

    return NextResponse.json({
      rfqs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching RFQs:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      name: error.name,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
    
    // Return error details for debugging (safe to expose Prisma error codes)
    const errorResponse = {
      error: 'Failed to fetch RFQs',
      ...(error.code && { code: error.code }),
      ...(error.meta && { meta: error.meta }),
      ...(process.env.NODE_ENV === 'development' && { 
        message: error.message,
        stack: error.stack 
      })
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// POST /api/rfqs - Create RFQ
export async function POST(req) {
  try {
    // Check if Prisma client is available
    if (!prisma) {
      console.error('Prisma client is not initialized');
      return NextResponse.json({ error: 'Database connection error' }, { status: 500 });
    }

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

    const {
      vendorId,
      orderDeadline,
      items // Array of { productId, quantity, unit }
    } = await req.json();

    // Validate required fields
    if (!vendorId || !orderDeadline || !items || items.length === 0) {
      return NextResponse.json({ 
        error: 'Vendor, order deadline, and items are required' 
      }, { status: 400 });
    }

    // Verify vendor exists
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId }
    });

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    // Verify products exist
    const productIds = items.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } }
    });

    if (products.length !== productIds.length) {
      return NextResponse.json({ error: 'One or more products not found' }, { status: 404 });
    }

    // Validate and parse items
    const validatedItems = items.map(item => {
      const quantity = parseInt(item.quantity, 10);
      if (isNaN(quantity) || quantity <= 0) {
        throw new Error(`Invalid quantity for product ${item.productId}: ${item.quantity}`);
      }
      if (!item.unit || typeof item.unit !== 'string' || item.unit.trim() === '') {
        throw new Error(`Invalid unit for product ${item.productId}`);
      }
      return {
        productId: item.productId,
        quantity,
        unit: item.unit.trim()
      };
    });

    // Create RFQ with items
    const rfq = await prisma.$transaction(async (tx) => {
      const rfqNumber = generateRFQNumber();
      
      const newRfq = await tx.rFQ.create({
        data: {
          rfqNumber,
          vendorId,
          createdById: currentUser.id,
          orderDeadline: new Date(orderDeadline),
          status: 'draft'
        }
      });

      // Create RFQ items
      await tx.rFQItem.createMany({
        data: validatedItems.map(item => ({
          rfqId: newRfq.id,
          productId: item.productId,
          quantity: item.quantity,
          unit: item.unit
        }))
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: currentUser.id,
          action: 'CREATE_RFQ',
          details: `Created RFQ ${rfqNumber} for vendor ${vendor.name}`
        }
      });

      return newRfq;
    });

    // Fetch the complete RFQ with relations
    const completeRfq = await prisma.rFQ.findUnique({
      where: { id: rfq.id },
      include: {
        vendor: true,
        createdBy: {
          select: { id: true, name: true, email: true }
        },
        items: {
          include: {
            product: true
          }
        }
      }
    });

    return NextResponse.json({ rfq: completeRfq }, { status: 201 });
  } catch (error) {
    console.error('Error creating RFQ:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      name: error.name,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
    
    // Return error details for debugging (safe to expose Prisma error codes)
    const errorResponse = {
      error: 'Failed to create RFQ',
      ...(error.code && { code: error.code }),
      ...(error.meta && { meta: error.meta }),
      ...(process.env.NODE_ENV === 'development' && { 
        message: error.message,
        stack: error.stack 
      })
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

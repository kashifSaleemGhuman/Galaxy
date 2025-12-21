import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { ROLES } from '@/lib/constants/roles';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Helper function to generate Quotation number
function generateQuotationNumber() {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  return `SQ-${year}${month}-${random}`;
}

// GET /api/sales/quotations - List quotations
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;
    const customer = searchParams.get('customer');

    // Build where clause
    const where = {};
    if (status && status !== 'all') {
      if (status.includes(',')) {
        // Multiple statuses (e.g., "approved,rejected")
        where.status = { in: status.split(',') };
      } else {
        where.status = status;
      }
    }
    if (customer) {
      where.OR = [
        { customerName: { contains: customer, mode: 'insensitive' } },
        { customerEmail: { contains: customer, mode: 'insensitive' } },
        { customerCompanyName: { contains: customer, mode: 'insensitive' } }
      ];
    }

    // Check user role
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Sales users can only see their own quotations
    // Managers and admins can see all
    if (![ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SALES_MANAGER].includes(currentUser.role)) {
      where.createdById = currentUser.id;
    }

    const [quotations, total] = await Promise.all([
      prisma.salesQuotation.findMany({
        where,
        include: {
          createdBy: {
            select: { id: true, name: true, email: true }
          },
          approvedBy: {
            select: { id: true, name: true, email: true }
          },
          items: true,
          approvals: {
            include: {
              approver: {
                select: { id: true, name: true, email: true }
              }
            },
            orderBy: { createdAt: 'desc' }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.salesQuotation.count({ where })
    ]);

    return NextResponse.json({
      quotations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching quotations:', error);
     console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
    return NextResponse.json(
      { 
        error: 'Failed to fetch quotations',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// POST /api/sales/quotations - Create new quotation
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
    const canCreate = [
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN,
      ROLES.SALES_MANAGER,
      ROLES.SALES_USER
    ].includes(currentUser.role);

    if (!canCreate) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await req.json();
    const {
      validityDate,
      customerName,
      customerEmail,
      customerPhone,
      customerCompanyName,
      termsAndConditions,
      items
    } = body;

    // Validate required fields
    if (!validityDate || !customerName || !customerEmail || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: validityDate, customerName, customerEmail, items' },
        { status: 400 }
      );
    }

    // Calculate totals
    let totalAmount = 0;
    let totalTax = 0;
    let totalFreight = 0;

    const quotationItems = items.map(item => {
      const exFactory = parseFloat(item.exFactoryPrice) || 0;
      const tax = parseFloat(item.taxCharges) || 0;
      const freight = parseFloat(item.freightCharges) || 0;
      const quantity = parseInt(item.quantity) || 1;
      
      // Final price = (exFactoryPrice + tax + freight) * quantity
      const itemTotal = (exFactory + tax + freight) * quantity;
      const itemTax = tax * quantity;
      const itemFreight = freight * quantity;

      totalAmount += exFactory * quantity;
      totalTax += itemTax;
      totalFreight += itemFreight;

      return {
        productId: item.productId || null,
        productName: item.productName,
        quantity: quantity,
        exFactoryPrice: exFactory,
        taxCharges: tax,
        freightCharges: freight,
        discountAmount: 0, // Not used in calculation, but kept for schema compatibility
        finalNetPrice: itemTotal
      };
    });

    // Final price = totalAmount + totalTax + totalFreight
    const finalNetPrice = totalAmount + totalTax + totalFreight;

    // Generate quotation number
    let quotationNumber;
    let isUnique = false;
    while (!isUnique) {
      quotationNumber = generateQuotationNumber();
      const existing = await prisma.salesQuotation.findUnique({
        where: { quotationNumber }
      });
      if (!existing) {
        isUnique = true;
      }
    }

    // Create quotation with items
    const quotation = await prisma.salesQuotation.create({
      data: {
        quotationNumber,
        validityDate: new Date(validityDate),
        status: 'draft',
        customerName,
        customerEmail,
        customerPhone: customerPhone || null,
        customerCompanyName: customerCompanyName || null,
        termsAndConditions: termsAndConditions || null,
        totalAmount,
        taxAmount: totalTax,
        discountAmount: 0, // Not used in calculation
        freightCharges: totalFreight,
        finalNetPrice,
        createdById: currentUser.id,
        items: {
          create: quotationItems
        }
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        },
        items: true
      }
    });

    return NextResponse.json({ quotation }, { status: 201 });
  } catch (error) {
    console.error('Error creating quotation:', error);
    return NextResponse.json(
      { error: 'Failed to create quotation', details: error.message },
      { status: 500 }
    );
  }
}


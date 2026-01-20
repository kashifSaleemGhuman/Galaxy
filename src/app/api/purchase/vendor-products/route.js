// Force dynamic rendering - this route uses getServerSession which requires headers()
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { hasPermission, PERMISSIONS } from '@/lib/constants/roles';

// GET - Fetch vendor-product relationships
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const vendorId = searchParams.get('vendorId');
    const productId = searchParams.get('productId');

    const where = {};
    if (vendorId) where.vendorId = vendorId;
    if (productId) where.productId = productId;

    const vendorProducts = await prisma.vendorProduct.findMany({
      where,
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        product: {
          select: {
            id: true,
            name: true,
            description: true,
            category: true,
            unit: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: vendorProducts });
  } catch (error) {
    console.error('Error fetching vendor-products:', error);
    return NextResponse.json({ error: 'Failed to fetch vendor-products: ' + error.message }, { status: 500 });
  }
}

// POST - Link a vendor with a product
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permissions using unified permission system
    if (!hasPermission(session.user.role, PERMISSIONS.PURCHASE.MANAGE_VENDORS)) {
      return NextResponse.json({ error: 'Forbidden: You do not have permission to manage vendor-product links' }, { status: 403 });
    }

    const body = await req.json();
    const { vendorId, productId, price } = body;

    // Validation
    if (!vendorId || !productId) {
      return NextResponse.json({ error: 'Vendor ID and Product ID are required' }, { status: 400 });
    }

    // Verify vendor exists
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId }
    });

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check if relationship already exists
    const existing = await prisma.vendorProduct.findUnique({
      where: {
        vendorId_productId: {
          vendorId,
          productId
        }
      }
    });

    if (existing) {
      // Update existing relationship
      const updated = await prisma.vendorProduct.update({
        where: {
          vendorId_productId: {
            vendorId,
            productId
          }
        },
        data: {
          price: price ? parseFloat(price) : null,
          isActive: true
        },
        include: {
          vendor: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          product: {
            select: {
              id: true,
              name: true,
              description: true,
              category: true,
              unit: true
            }
          }
        }
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'VENDOR_PRODUCT_UPDATED',
          details: `Vendor-Product link updated: ${vendor.name} - ${product.name} by ${session.user.email}`,
        }
      });

      return NextResponse.json({ success: true, vendorProduct: updated }, { status: 200 });
    }

    // Create new relationship
    const vendorProduct = await prisma.vendorProduct.create({
      data: {
        vendorId,
        productId,
        price: price ? parseFloat(price) : null,
        isActive: true
      },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        product: {
          select: {
            id: true,
            name: true,
            description: true,
            category: true,
            unit: true
          }
        }
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'VENDOR_PRODUCT_CREATED',
        details: `Vendor-Product link created: ${vendor.name} - ${product.name} by ${session.user.email}`,
      }
    });

    return NextResponse.json({ success: true, vendorProduct }, { status: 201 });
  } catch (error) {
    console.error('Error creating vendor-product link:', error);
    return NextResponse.json({ error: 'Failed to create vendor-product link: ' + error.message }, { status: 500 });
  }
}


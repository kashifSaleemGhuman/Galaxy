// Force dynamic rendering - this route uses getServerSession which requires headers()
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { hasPermission, PERMISSIONS } from '@/lib/constants/roles';

// PUT - Update product
export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permissions using unified permission system
    if (!hasPermission(session.user.role, PERMISSIONS.PURCHASE.MANAGE_PRODUCTS)) {
      return NextResponse.json({ error: 'Forbidden: You do not have permission to manage products' }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();
    const { name, description, category, unit, isActive } = body;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Update product
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description: description || null }),
        ...(category !== undefined && { category: category || null }),
        ...(unit && { unit }),
        ...(isActive !== undefined && { isActive })
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'PRODUCT_UPDATED',
        details: `Product "${product.name}" updated by ${session.user.email}`,
      }
    });

    return NextResponse.json({ success: true, product }, { status: 200 });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product: ' + error.message }, { status: 500 });
  }
}

// DELETE - Delete product (soft delete by setting isActive to false)
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permissions using unified permission system
    if (!hasPermission(session.user.role, PERMISSIONS.PURCHASE.MANAGE_PRODUCTS)) {
      return NextResponse.json({ error: 'Forbidden: You do not have permission to manage products' }, { status: 403 });
    }

    const { id } = params;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check if product has active RFQ items
    const activeRfqItems = await prisma.rFQItem.findFirst({
      where: {
        productId: id,
        rfq: {
          status: { notIn: ['completed', 'cancelled'] }
        }
      }
    });

    if (activeRfqItems) {
      return NextResponse.json({ 
        error: 'Cannot delete product with active RFQ items. Please deactivate instead.' 
      }, { status: 400 });
    }

    // Soft delete by setting isActive to false
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { isActive: false }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'PRODUCT_DELETED',
        details: `Product "${product.name}" deleted (deactivated) by ${session.user.email}`,
      }
    });

    return NextResponse.json({ success: true, product: updatedProduct }, { status: 200 });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product: ' + error.message }, { status: 500 });
  }
}

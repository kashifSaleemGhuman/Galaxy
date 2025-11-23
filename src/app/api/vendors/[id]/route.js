// Force dynamic rendering - this route uses getServerSession which requires headers()
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prismaImported from '@/lib/db';
import { PrismaClient } from '@prisma/client';
import { hasPermission, PERMISSIONS } from '@/lib/constants/roles';

// PUT - Update vendor
export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to manage vendors using unified permission system
    if (!hasPermission(session.user.role, PERMISSIONS.PURCHASE.MANAGE_VENDORS)) {
      return NextResponse.json({ error: 'Forbidden: You do not have permission to manage vendors' }, { status: 403 });
    }

    const prisma = prismaImported ?? new PrismaClient();
    const { id } = params;
    const body = await req.json();
    const { name, email, phone, address, isActive } = body;

    // Check if vendor exists
    const existingVendor = await prisma.vendor.findUnique({
      where: { id }
    });

    if (!existingVendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    // If email is being changed, check if new email already exists
    if (email && email !== existingVendor.email) {
      const emailExists = await prisma.vendor.findUnique({
        where: { email }
      });

      if (emailExists) {
        return NextResponse.json({ error: 'Vendor with this email already exists' }, { status: 400 });
      }
    }

    // Update vendor
    const vendor = await prisma.vendor.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone !== undefined && { phone: phone || null }),
        ...(address !== undefined && { address: address || null }),
        ...(isActive !== undefined && { isActive })
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'VENDOR_UPDATED',
        details: `Vendor "${vendor.name}" updated by ${session.user.email}`,
      }
    });

    return NextResponse.json({ success: true, vendor }, { status: 200 });
  } catch (error) {
    console.error('Error updating vendor:', error);
    return NextResponse.json({ error: 'Failed to update vendor: ' + error.message }, { status: 500 });
  }
}

// DELETE - Delete vendor (soft delete by setting isActive to false)
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to manage vendors using unified permission system
    if (!hasPermission(session.user.role, PERMISSIONS.PURCHASE.MANAGE_VENDORS)) {
      return NextResponse.json({ error: 'Forbidden: You do not have permission to manage vendors' }, { status: 403 });
    }

    const prisma = prismaImported ?? new PrismaClient();
    const { id } = params;

    // Check if vendor exists
    const vendor = await prisma.vendor.findUnique({
      where: { id }
    });

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    // Check if vendor has active RFQs
    const activeRfqs = await prisma.rFQ.findFirst({
      where: {
        vendorId: id,
        status: { notIn: ['completed', 'cancelled'] }
      }
    });

    if (activeRfqs) {
      return NextResponse.json({ 
        error: 'Cannot delete vendor with active RFQs. Please deactivate instead.' 
      }, { status: 400 });
    }

    // Soft delete by setting isActive to false
    const updatedVendor = await prisma.vendor.update({
      where: { id },
      data: { isActive: false }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'VENDOR_DELETED',
        details: `Vendor "${vendor.name}" deleted (deactivated) by ${session.user.email}`,
      }
    });

    return NextResponse.json({ success: true, vendor: updatedVendor }, { status: 200 });
  } catch (error) {
    console.error('Error deleting vendor:', error);
    return NextResponse.json({ error: 'Failed to delete vendor: ' + error.message }, { status: 500 });
  }
}


import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to reject shipments
    if (session.user.role.name !== 'Admin' && session.user.role.name !== 'Warehouse Operator') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { id } = params
    const { reason } = await request.json()

    if (!reason) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      )
    }

    // Get shipment
    const shipment = await prisma.incomingShipment.findFirst({
      where: {
        id: id,
        tenantId: session.user.tenantId
      },
      include: {
        purchaseOrder: true
      }
    })

    if (!shipment) {
      return NextResponse.json(
        { error: 'Shipment not found' },
        { status: 404 }
      )
    }

    if (shipment.status === 'Received') {
      return NextResponse.json(
        { error: 'Cannot reject already received shipment' },
        { status: 400 }
      )
    }

    // Update shipment status
    const updatedShipment = await prisma.incomingShipment.update({
      where: { id: id },
      data: {
        status: 'Rejected',
        rejectedAt: new Date(),
        rejectedBy: session.user.id,
        rejectionReason: reason
      }
    })

    // Update related purchase order status if exists
    if (shipment.purchaseOrder) {
      await prisma.purchaseOrder.update({
        where: { id: shipment.purchaseOrder.id },
        data: {
          status: 'Cancelled'
        }
      })
    }

    return NextResponse.json({
      message: 'Shipment rejected successfully',
      shipment: updatedShipment
    })

  } catch (error) {
    console.error('Error rejecting shipment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


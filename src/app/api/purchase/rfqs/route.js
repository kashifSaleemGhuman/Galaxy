import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
  try {
    const data = await prisma.rFQ.findMany({ 
      include: { 
        vendor: true,
        createdBy: true,
        approvedBy: true,
        items: {
          include: {
            product: true
          }
        }
      } 
    })
    const shaped = data.map(r => ({
      rfq_id: r.id,
      rfq_number: r.rfqNumber,
      vendor_id: r.vendorId,
      vendor_name: r.vendor?.name,
      created_by: r.createdBy?.name,
      order_deadline: r.orderDeadline.toISOString().split('T')[0],
      sent_date: r.sentDate?.toISOString().split('T')[0],
      status: r.status,
      vendor_price: r.vendorPrice,
      expected_delivery: r.expectedDelivery?.toISOString().split('T')[0],
      approved_by: r.approvedBy?.name,
      approved_at: r.approvedAt?.toISOString().split('T')[0],
    }))
    return NextResponse.json({ success: true, data: shaped })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { vendor_id, created_by, order_deadline, items } = body

    if (!vendor_id || !created_by || !order_deadline) {
      return NextResponse.json({ success: false, error: 'vendor_id, created_by, and order_deadline are required' }, { status: 400 })
    }

    // Generate RFQ number
    const rfqNumber = `RFQ-${Date.now()}`

    const created = await prisma.rFQ.create({
      data: {
        rfqNumber,
        vendorId: vendor_id,
        createdById: created_by,
        orderDeadline: new Date(order_deadline),
        status: 'draft',
        items: items ? {
          create: items.map(item => ({
            productId: item.product_id,
            quantity: item.quantity,
            unit: item.unit || 'pcs'
          }))
        } : undefined
      },
      include: {
        vendor: true,
        createdBy: true,
        items: {
          include: {
            product: true
          }
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      data: { 
        rfq_id: created.id, 
        rfq_number: created.rfqNumber,
        vendor_id: created.vendorId, 
        vendor_name: created.vendor?.name,
        created_by: created.createdBy?.name,
        order_deadline: created.orderDeadline.toISOString().split('T')[0], 
        status: created.status 
      } 
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

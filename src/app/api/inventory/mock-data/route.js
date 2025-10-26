import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/inventory/mock-data - Create mock PO and RFQ data for inventory testing
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tenantId = session.user.tenantId

    // Create mock suppliers
    const suppliers = await Promise.all([
      prisma.supplier.upsert({
        where: { supplierId: 'SUP-001' },
        update: {},
        create: {
          supplierId: 'SUP-001',
          name: 'Acme Supplies',
          email: 'contact@acme.com',
          phone: '+1-555-0101',
          contactInfo: 'John Smith, Procurement Manager'
        }
      }),
      prisma.supplier.upsert({
        where: { supplierId: 'SUP-002' },
        update: {},
        create: {
          supplierId: 'SUP-002',
          name: 'Office Depot',
          email: 'orders@officedepot.com',
          phone: '+1-555-0102',
          contactInfo: 'Sarah Johnson, Sales Rep'
        }
      }),
      prisma.supplier.upsert({
        where: { supplierId: 'SUP-003' },
        update: {},
        create: {
          supplierId: 'SUP-003',
          name: 'Tech Solutions',
          email: 'sales@techsolutions.com',
          phone: '+1-555-0103',
          contactInfo: 'Mike Chen, Account Manager'
        }
      })
    ])

    // Create mock products if they don't exist
    const products = await Promise.all([
      prisma.product.upsert({
        where: { id: 'PROD-001' },
        update: {},
        create: {
          id: 'PROD-001',
          tenantId,
          name: 'Paper A4 80gsm',
          sku: 'PAP-001',
          description: 'High quality A4 paper, 80gsm',
          price: 12.25,
          cost: 8.50,
          trackQuantity: true,
          allowNegativeStock: false,
          reorderPoint: 20,
          maxStock: 1000,
          minStock: 10,
          isActive: true
        }
      }),
      prisma.product.upsert({
        where: { id: 'PROD-002' },
        update: {},
        create: {
          id: 'PROD-002',
          tenantId,
          name: 'Stapler Heavy Duty',
          sku: 'STAP-001',
          description: 'Heavy duty stapler for office use',
          price: 11.80,
          cost: 7.50,
          trackQuantity: true,
          allowNegativeStock: false,
          reorderPoint: 5,
          maxStock: 100,
          minStock: 2,
          isActive: true
        }
      }),
      prisma.product.upsert({
        where: { id: 'PROD-003' },
        update: {},
        create: {
          id: 'PROD-003',
          tenantId,
          name: 'Printer Ink Black',
          sku: 'INK-001',
          description: 'Black ink cartridge for HP printers',
          price: 8.50,
          cost: 5.00,
          trackQuantity: true,
          allowNegativeStock: false,
          reorderPoint: 10,
          maxStock: 200,
          minStock: 3,
          isActive: true
        }
      })
    ])

    // Create mock RFQs
    const rfqs = await Promise.all([
      prisma.rFQ.upsert({
        where: { rfqNumber: 'RFQ-001' },
        update: {},
        create: {
          rfqNumber: 'RFQ-001',
          vendorId: suppliers[0].supplierId,
          createdById: users[0].id,
          orderDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          status: 'draft',
          items: {
            create: [
              {
                productId: products[0].id,
                quantity: 20,
                unit: 'pcs'
              },
              {
                productId: products[1].id,
                quantity: 5,
                unit: 'pcs'
              }
            ]
          }
        }
      }),
      prisma.rFQ.upsert({
        where: { rfqNumber: 'RFQ-002' },
        update: {},
        create: {
          rfqNumber: 'RFQ-002',
          vendorId: suppliers[1].supplierId,
          createdById: users[0].id,
          orderDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
          status: 'sent',
          sentDate: new Date(),
          items: {
            create: [
              {
                productId: products[2].id,
                quantity: 10,
                unit: 'pcs'
              }
            ]
          }
        }
      })
    ])

    // Create mock Purchase Orders
    const purchaseOrders = await Promise.all([
      prisma.purchaseOrder.upsert({
        where: { poId: 'PO-101' },
        update: {},
        create: {
          poId: 'PO-101',
          rfqId: rfqs[0].rfqId,
          supplierId: suppliers[0].supplierId,
          status: 'Waiting Receipt',
          lines: {
            create: [
              {
                poLineId: 'POL-001',
                productId: products[0].id,
                quantityOrdered: 20,
                quantityReceived: 0,
                price: 12.25
              },
              {
                poLineId: 'POL-002',
                productId: products[1].id,
                quantityOrdered: 5,
                quantityReceived: 0,
                price: 11.80
              }
            ]
          }
        }
      }),
      prisma.purchaseOrder.upsert({
        where: { poId: 'PO-102' },
        update: {},
        create: {
          poId: 'PO-102',
          rfqId: rfqs[1].rfqId,
          supplierId: suppliers[1].supplierId,
          status: 'Draft',
          lines: {
            create: [
              {
                poLineId: 'POL-003',
                productId: products[2].id,
                quantityOrdered: 10,
                quantityReceived: 0,
                price: 8.50
              }
            ]
          }
        }
      })
    ])

    // Create mock Goods Receipts
    const goodsReceipts = await Promise.all([
      prisma.goodsReceipt.upsert({
        where: { receiptId: 'GR-001' },
        update: {},
        create: {
          receiptId: 'GR-001',
          poId: purchaseOrders[0].poId,
          status: 'Draft',
          dateReceived: new Date()
        }
      }),
      prisma.goodsReceipt.upsert({
        where: { receiptId: 'GR-002' },
        update: {},
        create: {
          receiptId: 'GR-002',
          poId: purchaseOrders[1].poId,
          status: 'Draft',
          dateReceived: new Date()
        }
      })
    ])

    // Create mock Vendor Bills
    const vendorBills = await Promise.all([
      prisma.vendorBill.upsert({
        where: { billId: 'BILL-001' },
        update: {},
        create: {
          billId: 'BILL-001',
          poId: purchaseOrders[0].poId,
          amount: 245.00,
          status: 'Draft',
          dateBilled: new Date()
        }
      })
    ])

    return NextResponse.json({
      message: 'Mock data created successfully',
      data: {
        suppliers: suppliers.length,
        products: products.length,
        rfqs: rfqs.length,
        purchaseOrders: purchaseOrders.length,
        goodsReceipts: goodsReceipts.length,
        vendorBills: vendorBills.length
      }
    })

  } catch (error) {
    console.error('Error creating mock data:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

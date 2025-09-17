import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Ensure a default tenant exists for sample data
  const tenant = await prisma.tenant.upsert({
    where: { id: 'default-tenant' },
    update: {},
    create: {
      id: 'default-tenant',
      name: 'Default Tenant',
      domain: 'local.test',
      settings: {},
    },
  })

  // Basic products
  const [p1, p2, p3] = await Promise.all([
    prisma.product.upsert({
      where: { id: 'PRD-001' },
      update: {},
      create: {
        id: 'PRD-001',
        tenantId: tenant.id,
        name: 'Paper A4 80gsm',
        sku: 'PA4-80',
        unitOfMeasure: 'Box',
        defaultPrice: 25,
        price: 25,
      },
    }),
    prisma.product.upsert({
      where: { id: 'PRD-002' },
      update: {},
      create: {
        id: 'PRD-002',
        tenantId: tenant.id,
        name: 'Stapler Heavy Duty',
        sku: 'STP-HD',
        unitOfMeasure: 'Unit',
        defaultPrice: 12.5,
        price: 12.5,
      },
    }),
    prisma.product.upsert({
      where: { id: 'PRD-003' },
      update: {},
      create: {
        id: 'PRD-003',
        tenantId: tenant.id,
        name: 'Printer Ink Black',
        sku: 'INK-BLK',
        unitOfMeasure: 'Cartridge',
        defaultPrice: 35,
        price: 35,
      },
    }),
  ])

  // Supplier
  const acme = await prisma.supplier.upsert({
    where: { supplierId: 'SUP-001' },
    update: {},
    create: {
      supplierId: 'SUP-001',
      name: 'Acme Supplies',
      email: 'sales@acme.com',
      contactInfo: '123 Main St, City',
      phone: '+1 555-1001',
    },
  })

  // RFQ with lines
  const rfq = await prisma.requestForQtn.upsert({
    where: { rfqId: 'RFQ-001' },
    update: {},
    create: {
      rfqId: 'RFQ-001',
      supplierId: acme.supplierId,
      status: 'Draft',
      lines: {
        create: [
          { rfqLineId: 'RFL-001', productId: p1.id, quantity: 20, price: 24.5 },
          { rfqLineId: 'RFL-002', productId: p2.id, quantity: 5, price: 11.8 },
        ],
      },
    },
    include: { lines: true },
  })

  // PO with lines
  const po = await prisma.purchaseOrder.upsert({
    where: { poId: 'PO-101' },
    update: {},
    create: {
      poId: 'PO-101',
      rfqId: rfq.rfqId,
      supplierId: acme.supplierId,
      status: 'Waiting Receipt',
      lines: {
        create: [
          { poLineId: 'POL-001', productId: p1.id, quantityOrdered: 20, quantityReceived: 0, price: 24.5 },
          { poLineId: 'POL-002', productId: p2.id, quantityOrdered: 5, quantityReceived: 0, price: 11.8 },
        ],
      },
    },
    include: { lines: true },
  })

  // Receipt and Bill
  await prisma.goodsReceipt.upsert({
    where: { receiptId: 'GR-201' },
    update: {},
    create: { receiptId: 'GR-201', poId: po.poId, status: 'Draft', dateReceived: new Date() },
  })

  await prisma.vendorBill.upsert({
    where: { billId: 'BILL-301' },
    update: {},
    create: { billId: 'BILL-301', poId: po.poId, amount: 245, status: 'Draft', dateBilled: new Date() },
  })

  console.log('Seeded purchase data')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })



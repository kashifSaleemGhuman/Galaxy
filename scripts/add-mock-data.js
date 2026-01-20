#!/usr/bin/env node

/**
 * Add Mock Data for Testing
 * 
 * This script adds mock data to the database for testing RFQ and PO creation
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function addMockData() {
  console.log('🚀 Adding mock data for testing...\n');

  try {
    // 1. Create mock vendors
    console.log('📦 Creating mock vendors...');
    const vendors = await Promise.all([
      prisma.vendor.upsert({
        where: { email: 'sales@acme.com' },
        update: {},
        create: {
          name: 'Acme Supplies Ltd',
          email: 'sales@acme.com',
          phone: '+1-555-0101',
          address: '123 Business St, City, State 12345',
          isActive: true
        }
      }),
      prisma.vendor.upsert({
        where: { email: 'orders@globaltech.com' },
        update: {},
        create: {
          name: 'Global Tech Solutions',
          email: 'orders@globaltech.com',
          phone: '+1-555-0202',
          address: '456 Tech Ave, Tech City, TC 54321',
          isActive: true
        }
      }),
      prisma.vendor.upsert({
        where: { email: 'pro@officedepot.com' },
        update: {},
        create: {
          name: 'Office Depot Pro',
          email: 'pro@officedepot.com',
          phone: '+1-555-0303',
          address: '789 Office Blvd, Office City, OC 67890',
          isActive: true
        }
      })
    ]);
    console.log(`✅ Created ${vendors.length} vendors`);

    // Also create suppliers for backward compatibility
    console.log('📦 Creating mock suppliers...');
    const suppliers = await Promise.all([
      prisma.supplier.upsert({
        where: { supplierId: 'SUP-001' },
        update: {},
        create: {
          supplierId: 'SUP-001',
          name: 'Acme Supplies Ltd',
          contactInfo: '123 Business St, City, State 12345\nPhone: +1-555-0101\nEmail: sales@acme.com\nWebsite: https://acme.com',
          email: 'sales@acme.com',
          phone: '+1-555-0101'
        }
      }),
      prisma.supplier.upsert({
        where: { supplierId: 'SUP-002' },
        update: {},
        create: {
          supplierId: 'SUP-002',
          name: 'Global Tech Solutions',
          contactInfo: '456 Tech Ave, Tech City, TC 54321\nPhone: +1-555-0202\nEmail: orders@globaltech.com\nWebsite: https://globaltech.com',
          email: 'orders@globaltech.com',
          phone: '+1-555-0202'
        }
      }),
      prisma.supplier.upsert({
        where: { supplierId: 'SUP-003' },
        update: {},
        create: {
          supplierId: 'SUP-003',
          name: 'Office Depot Pro',
          contactInfo: '789 Office Blvd, Office City, OC 67890\nPhone: +1-555-0303\nEmail: pro@officedepot.com\nWebsite: https://officedepot.com',
          email: 'pro@officedepot.com',
          phone: '+1-555-0303'
        }
      })
    ]);
    console.log(`✅ Created ${suppliers.length} suppliers`);

    // 2. Create mock products
    console.log('📋 Creating mock products...');
    const products = await Promise.all([
      prisma.product.upsert({
        where: { id: 'PRD-001' },
        update: {},
        create: {
          id: 'PRD-001',
          name: 'A4 Paper 80gsm',
          description: 'High quality A4 paper, 80gsm weight, white',
          category: 'Office Supplies',
          unit: 'Ream',
          isActive: true
        }
      }),
      prisma.product.upsert({
        where: { id: 'PRD-002' },
        update: {},
        create: {
          id: 'PRD-002',
          name: 'Heavy Duty Stapler',
          description: 'Professional heavy duty stapler for office use',
          category: 'Office Equipment',
          unit: 'Unit',
          isActive: true
        }
      }),
      prisma.product.upsert({
        where: { id: 'PRD-003' },
        update: {},
        create: {
          id: 'PRD-003',
          name: 'Black Ink Cartridge',
          description: 'HP compatible black ink cartridge for printers',
          category: 'Electronics',
          unit: 'Cartridge',
          isActive: true
        }
      }),
      prisma.product.upsert({
        where: { id: 'PRD-004' },
        update: {},
        create: {
          id: 'PRD-004',
          name: 'Desk Chair Ergonomic',
          description: 'Ergonomic office chair with lumbar support',
          category: 'Furniture',
          unit: 'Unit',
          isActive: true
        }
      }),
      prisma.product.upsert({
        where: { id: 'PRD-005' },
        update: {},
        create: {
          id: 'PRD-005',
          name: 'Whiteboard 4x6 feet',
          description: 'Magnetic whiteboard for conference rooms',
          category: 'Office Equipment',
          unit: 'Unit',
          isActive: true
        }
      })
    ]);
    console.log(`✅ Created ${products.length} products`);

    // 3. Create mock warehouses
    console.log('🏢 Creating mock warehouses...');
    const warehouses = await Promise.all([
      prisma.warehouse.upsert({
        where: { code: 'WH-001' },
        update: {},
        create: {
          name: 'Main Warehouse',
          code: 'WH-001',
          address: '100 Warehouse Blvd, Industrial District',
          isActive: true
        }
      }),
      prisma.warehouse.upsert({
        where: { code: 'WH-002' },
        update: {},
        create: {
          name: 'Secondary Storage',
          code: 'WH-002',
          address: '200 Storage Ave, Business Park',
          isActive: true
        }
      })
    ]);
    console.log(`✅ Created ${warehouses.length} warehouses`);

    // 4. Get the purchase manager user ID
    const purchaseManager = await prisma.user.findUnique({
      where: { email: 'purchase.manager@galaxy.com' }
    });

    if (!purchaseManager) {
      throw new Error('Purchase manager user not found. Please run the user setup script first.');
    }

    // 5. Create sample RFQ
    console.log('📝 Creating sample RFQ...');
    const rfq = await prisma.rFQ.upsert({
      where: { rfqNumber: 'RFQ-001' },
      update: {},
      create: {
        rfqNumber: 'RFQ-001',
        vendorId: vendors[0].id,
        createdById: purchaseManager.id,
        orderDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        status: 'draft'
      }
    });

    // 6. Create RFQ items
    console.log('📋 Creating RFQ items...');
    const rfqItems = await Promise.all([
      prisma.rFQItem.upsert({
        where: { id: 'RFQ-ITEM-001' },
        update: {},
        create: {
          id: 'RFQ-ITEM-001',
          rfqId: rfq.id,
          productId: 'PRD-001',
          quantity: 100,
          unit: 'Ream'
        }
      }),
      prisma.rFQItem.upsert({
        where: { id: 'RFQ-ITEM-002' },
        update: {},
        create: {
          id: 'RFQ-ITEM-002',
          rfqId: rfq.id,
          productId: 'PRD-002',
          quantity: 10,
          unit: 'Unit'
        }
      }),
      prisma.rFQItem.upsert({
        where: { id: 'RFQ-ITEM-003' },
        update: {},
        create: {
          id: 'RFQ-ITEM-003',
          rfqId: rfq.id,
          productId: 'PRD-003',
          quantity: 50,
          unit: 'Cartridge'
        }
      })
    ]);
    console.log(`✅ Created ${rfqItems.length} RFQ items`);

    // 7. Skip quotes for now (no Quote model exists)

    // 8. Create inventory items for stock management
    console.log('📦 Creating inventory items...');
    const inventoryItems = await Promise.all([
      prisma.inventoryItem.upsert({
        where: { 
          productId_warehouseId: {
            productId: 'PRD-001',
            warehouseId: warehouses[0].id
          }
        },
        update: {},
        create: {
          productId: 'PRD-001',
          warehouseId: warehouses[0].id,
          quantity: 50,
          reserved: 0,
          available: 50,
          minLevel: 20,
          maxLevel: 200,
          location: 'A-01-01'
        }
      }),
      prisma.inventoryItem.upsert({
        where: { 
          productId_warehouseId: {
            productId: 'PRD-002',
            warehouseId: warehouses[0].id
          }
        },
        update: {},
        create: {
          productId: 'PRD-002',
          warehouseId: warehouses[0].id,
          quantity: 5,
          reserved: 0,
          available: 5,
          minLevel: 2,
          maxLevel: 20,
          location: 'A-02-01'
        }
      }),
      prisma.inventoryItem.upsert({
        where: { 
          productId_warehouseId: {
            productId: 'PRD-003',
            warehouseId: warehouses[0].id
          }
        },
        update: {},
        create: {
          productId: 'PRD-003',
          warehouseId: warehouses[0].id,
          quantity: 25,
          reserved: 0,
          available: 25,
          minLevel: 10,
          maxLevel: 100,
          location: 'B-01-01'
        }
      })
    ]);
    console.log(`✅ Created ${inventoryItems.length} inventory items`);

    console.log('\n🎉 Mock data added successfully!');
    console.log('\n📊 Summary:');
    console.log(`- ${vendors.length} vendors created`);
    console.log(`- ${suppliers.length} suppliers created`);
    console.log(`- ${products.length} products created`);
    console.log(`- ${warehouses.length} warehouses created`);
    console.log(`- 1 RFQ created (RFQ-001)`);
    console.log(`- ${rfqItems.length} RFQ items created`);
    console.log(`- ${inventoryItems.length} inventory items created`);
    
    console.log('\n🔗 You can now:');
    console.log('1. Login as purchase.manager@galaxy.com');
    console.log('2. Go to RFQs section to view RFQ-001');
    console.log('3. Create Purchase Orders from the RFQ');
    console.log('4. Test the complete purchase flow!');

  } catch (error) {
    console.error('❌ Error adding mock data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  try {
    await addMockData();
    console.log('\n✅ Mock data setup completed successfully!');
  } catch (error) {
    console.error('❌ Mock data setup failed:', error);
    process.exit(1);
  }
}

main();

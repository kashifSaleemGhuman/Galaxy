/**
 * Script to add warehouses and inventory items
 * Usage: node scripts/add-warehouses-and-inventory.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting warehouse and inventory setup...\n');

  try {
    // Step 1: Create warehouses
    console.log('📦 Creating warehouses...');
    
    const warehouses = [
      {
        name: 'Main Warehouse',
        code: 'WH-001',
        address: '123 Main Street, City, State 12345',
        isActive: true
      },
      {
        name: 'Secondary Warehouse',
        code: 'WH-002',
        address: '456 Second Avenue, City, State 12345',
        isActive: true
      },
      {
        name: 'Distribution Center',
        code: 'WH-003',
        address: '789 Distribution Blvd, City, State 12345',
        isActive: true
      }
    ];

    const createdWarehouses = [];
    for (const wh of warehouses) {
      const existing = await prisma.warehouse.findFirst({
        where: { code: wh.code }
      });

      if (existing) {
        console.log(`  ⚠️  Warehouse ${wh.code} already exists, skipping...`);
        createdWarehouses.push(existing);
      } else {
        const warehouse = await prisma.warehouse.create({
          data: wh
        });
        console.log(`  ✅ Created warehouse: ${warehouse.name} (${warehouse.code})`);
        createdWarehouses.push(warehouse);
      }
    }

    if (createdWarehouses.length === 0) {
      console.log('  ℹ️  No warehouses to create, all already exist.\n');
    } else {
      console.log(`\n✅ Created/Found ${createdWarehouses.length} warehouses\n`);
    }

    // Step 2: Get all products
    console.log('📋 Fetching products...');
    const products = await prisma.product.findMany({
      where: { isActive: true },
      take: 100 // Limit to first 100 products
    });

    if (products.length === 0) {
      console.log('  ⚠️  No active products found. Please create products first.\n');
      return;
    }

    console.log(`  ✅ Found ${products.length} active products\n`);

    // Step 3: Add inventory for each product in each warehouse
    console.log('📊 Adding inventory items...');
    let inventoryCount = 0;

    for (const product of products) {
      for (const warehouse of createdWarehouses) {
        // Check if inventory item already exists
        const existing = await prisma.inventoryItem.findUnique({
          where: {
            productId_warehouseId: {
              productId: product.id,
              warehouseId: warehouse.id
            }
          }
        });

        if (existing) {
          // Update existing inventory with some stock
          const newQuantity = existing.quantity + 50; // Add 50 units
          await prisma.inventoryItem.update({
            where: { id: existing.id },
            data: {
              quantity: newQuantity,
              available: newQuantity - existing.reserved,
              minLevel: 10,
              maxLevel: 1000
            }
          });
          console.log(`  ✅ Updated inventory: ${product.name} in ${warehouse.name} (${newQuantity} units)`);
          inventoryCount++;
        } else {
          // Create new inventory item with initial stock
          const initialQuantity = 100; // Default initial stock
          await prisma.inventoryItem.create({
            data: {
              productId: product.id,
              warehouseId: warehouse.id,
              quantity: initialQuantity,
              available: initialQuantity,
              reserved: 0,
              minLevel: 10,
              maxLevel: 1000
            }
          });
          console.log(`  ✅ Created inventory: ${product.name} in ${warehouse.name} (${initialQuantity} units)`);
          inventoryCount++;
        }
      }
    }

    console.log(`\n✅ Created/Updated ${inventoryCount} inventory items\n`);

    // Summary
    console.log('📊 Summary:');
    console.log(`  • Warehouses: ${createdWarehouses.length}`);
    console.log(`  • Products: ${products.length}`);
    console.log(`  • Inventory Items: ${inventoryCount}`);
    console.log('\n✅ Setup complete!\n');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

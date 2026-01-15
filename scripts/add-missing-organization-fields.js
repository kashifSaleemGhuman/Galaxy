#!/usr/bin/env node

/**
 * Script to add missing columns to Organization table
 * This adds columns that exist in Prisma schema but not in the database
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addMissingFields() {
  console.log('🔄 Adding missing Organization table columns...');
  
  try {
    // List of columns to add (field name -> SQL type)
    const columnsToAdd = [
      { name: 'siteNameLocalLanguage', type: 'TEXT' },
      { name: 'siteURN', type: 'TEXT' },
      { name: 'fullestScopeOfOperations', type: 'TEXT' },
      { name: 'abbreviations', type: 'JSONB', defaultValue: "'[]'::jsonb" },
      { name: 'companyRegistrationNumber', type: 'TEXT' },
      { name: 'latitude', type: 'TEXT' },
      { name: 'longitude', type: 'TEXT' },
      { name: 'country', type: 'TEXT' },
      { name: 'telephoneNumber', type: 'TEXT' },
      { name: 'principalContactName', type: 'TEXT' },
      { name: 'principalContactPosition', type: 'TEXT' },
      { name: 'principalContactEmail', type: 'TEXT' },
      { name: 'environmentalResponsibleName', type: 'TEXT' },
      { name: 'environmentalResponsiblePosition', type: 'TEXT' },
      { name: 'environmentalResponsibleEmail', type: 'TEXT' },
      { name: 'lwgCommunicationsMembers', type: 'JSONB', defaultValue: "'[]'::jsonb" },
      { name: 'website', type: 'TEXT' },
      { name: 'facilityDescription', type: 'TEXT' },
      { name: 'totalSiteArea', type: 'TEXT' },
      { name: 'siteAreaBoundaries', type: 'TEXT' },
      { name: 'directLabourShiftAM', type: 'INTEGER' },
      { name: 'directLabourShiftPM', type: 'INTEGER' },
      { name: 'directLabourShiftNight', type: 'INTEGER' },
      { name: 'directLabourCount', type: 'INTEGER' },
      { name: 'indirectLabourShiftAM', type: 'INTEGER' },
      { name: 'indirectLabourShiftPM', type: 'INTEGER' },
      { name: 'indirectLabourShiftNight', type: 'INTEGER' },
      { name: 'indirectLabourCount', type: 'INTEGER' },
      { name: 'shiftTotalAM', type: 'INTEGER' },
      { name: 'shiftTotalPM', type: 'INTEGER' },
      { name: 'shiftTotalNight', type: 'INTEGER' },
      { name: 'shiftTotal', type: 'INTEGER' },
      { name: 'workerDaysPerWeek', type: 'INTEGER' },
      { name: 'workerWeeksPerYear', type: 'INTEGER' },
      { name: 'workerDaysPerYear', type: 'INTEGER' },
      { name: 'manufacturingDaysPerWeek', type: 'INTEGER' },
      { name: 'manufacturingWeeksPerYear', type: 'INTEGER' },
      { name: 'manufacturingDaysPerYear', type: 'INTEGER' },
      { name: 'environmentalImpacts', type: 'TEXT' },
      { name: 'operationsForOtherOrganisations', type: 'TEXT' },
    ];

    for (const column of columnsToAdd) {
      try {
        const defaultValue = column.defaultValue 
          ? ` DEFAULT ${column.defaultValue}` 
          : '';
        
        await prisma.$executeRawUnsafe(
          `ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "${column.name}" ${column.type}${defaultValue};`
        );
        console.log(`✅ Added column: ${column.name}`);
      } catch (error) {
        // Check if column already exists
        if (error.message && error.message.includes('already exists')) {
          console.log(`⚠️  Column ${column.name} already exists, skipping...`);
        } else {
          console.error(`❌ Error adding column ${column.name}:`, error.message);
        }
      }
    }

    console.log('✅ All missing columns added successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addMissingFields()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


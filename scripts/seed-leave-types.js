/**
 * Seed Default Leave Types
 * Creates common leave types for all tenants
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Default leave types to create
const DEFAULT_LEAVE_TYPES = [
  {
    name: 'Casual Leave',
    code: 'CL',
    description: 'Casual leave for personal reasons',
    isPaid: true,
    requiresApproval: true,
    maxConsecutiveDays: 3,
    requiresMedicalCertificate: false
  },
  {
    name: 'Sick Leave',
    code: 'SL',
    description: 'Leave for medical reasons',
    isPaid: true,
    requiresApproval: true,
    maxConsecutiveDays: null,
    requiresMedicalCertificate: true
  },
  {
    name: 'Annual Leave',
    code: 'AL',
    description: 'Annual vacation leave',
    isPaid: true,
    requiresApproval: true,
    maxConsecutiveDays: null,
    requiresMedicalCertificate: false
  },
  {
    name: 'Emergency Leave',
    code: 'EL',
    description: 'Leave for emergency situations',
    isPaid: true,
    requiresApproval: true,
    maxConsecutiveDays: 5,
    requiresMedicalCertificate: false
  },
  {
    name: 'Maternity Leave',
    code: 'ML',
    description: 'Maternity leave for expecting mothers',
    isPaid: true,
    requiresApproval: true,
    maxConsecutiveDays: null,
    requiresMedicalCertificate: true
  },
  {
    name: 'Paternity Leave',
    code: 'PL',
    description: 'Paternity leave for new fathers',
    isPaid: true,
    requiresApproval: true,
    maxConsecutiveDays: 7,
    requiresMedicalCertificate: false
  },
  {
    name: 'Unpaid Leave',
    code: 'UL',
    description: 'Unpaid leave for extended absence',
    isPaid: false,
    requiresApproval: true,
    maxConsecutiveDays: null,
    requiresMedicalCertificate: false
  }
]

async function seedLeaveTypes() {
  try {
    console.log('🌱 Seeding leave types...\n')

    // Get all tenants or create default tenant
    let tenants = await prisma.tenant.findMany()
    
    if (tenants.length === 0) {
      console.log('⚠️  No tenants found. Creating default tenant...')
      const defaultTenant = await prisma.tenant.upsert({
        where: { domain: 'default' },
        update: {},
        create: {
          name: 'Default Company',
          domain: 'default',
          settings: {
            timezone: 'UTC',
            currency: 'USD',
            dateFormat: 'MM/DD/YYYY',
            features: {
              hrm: true
            }
          }
        }
      })
      tenants = [defaultTenant]
      console.log(`✅ Created default tenant: ${defaultTenant.name} (${defaultTenant.id})\n`)
    }

    let totalCreated = 0
    let totalSkipped = 0

    for (const tenant of tenants) {
      console.log(`📋 Processing tenant: ${tenant.name} (${tenant.id})`)
      
      for (const leaveTypeData of DEFAULT_LEAVE_TYPES) {
        try {
          // Check if leave type already exists
          const existing = await prisma.leaveType.findUnique({
            where: {
              tenantId_code: {
                tenantId: tenant.id,
                code: leaveTypeData.code
              }
            }
          })

          if (existing) {
            console.log(`   ⏭️  Skipped: ${leaveTypeData.name} (${leaveTypeData.code}) - already exists`)
            totalSkipped++
            continue
          }

          // Create leave type
          const leaveType = await prisma.leaveType.create({
            data: {
              tenantId: tenant.id,
              ...leaveTypeData
            }
          })

          console.log(`   ✅ Created: ${leaveType.name} (${leaveType.code})`)
          totalCreated++
        } catch (error) {
          console.error(`   ❌ Error creating ${leaveTypeData.name}:`, error.message)
        }
      }
    }

    console.log('\n📊 Summary:')
    console.log(`   ✅ Created: ${totalCreated} leave types`)
    console.log(`   ⏭️  Skipped: ${totalSkipped} leave types (already exist)`)
    console.log(`\n✅ Leave types seeding completed!`)

  } catch (error) {
    console.error('❌ Error seeding leave types:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
if (require.main === module) {
  seedLeaveTypes()
    .then(() => {
      console.log('\n🎉 Done!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n💥 Failed:', error)
      process.exit(1)
    })
}

module.exports = { seedLeaveTypes, DEFAULT_LEAVE_TYPES }


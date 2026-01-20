/**
 * HRM Mock Data Seeding Script
 * 
 * Creates comprehensive mock data for all HR modules:
 * - Employees
 * - Shifts
 * - Attendance (events and daily records)
 * - Leave Types & Policies
 * - Leave Policy Assignments
 * - Leave Requests
 * - Salary Structures
 * - Payroll Periods
 * - Bonuses
 * - Loans
 * 
 * Performance Optimizations:
 * - Idempotent: Can be run multiple times without creating duplicates
 * - Batch operations: Uses bulk creates where possible
 * - Pre-fetching: Loads existing data in bulk to avoid repeated queries
 * - Progress logging: Shows detailed progress for long-running operations
 * - Credentials file: Generates HRM_EMPLOYEE_CREDENTIALS.txt with all login info
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const fs = require('fs')
const path = require('path')
const prisma = new PrismaClient()

// Mock data configurations
const DEPARTMENTS = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations', 'IT', 'Customer Support']
const DESIGNATIONS = ['Manager', 'Senior Developer', 'Developer', 'Analyst', 'Executive', 'Coordinator', 'Specialist', 'Associate']
const SHIFTS = [
  { name: 'Morning Shift', startTime: '09:00', endTime: '18:00', gracePeriodMinutes: 15, breakDurationMinutes: 60 },
  { name: 'Evening Shift', startTime: '14:00', endTime: '23:00', gracePeriodMinutes: 15, breakDurationMinutes: 60 },
  { name: 'Night Shift', startTime: '22:00', endTime: '06:00', gracePeriodMinutes: 15, breakDurationMinutes: 60 }
]

// Employee data
const EMPLOYEES = [
  { name: 'John Smith', employeeId: 'EMP001', department: 'Engineering', designation: 'Senior Developer', salary: 75000, dateOfJoining: '2023-01-15' },
  { name: 'Sarah Johnson', employeeId: 'EMP002', department: 'Sales', designation: 'Manager', salary: 85000, dateOfJoining: '2022-06-01' },
  { name: 'Michael Brown', employeeId: 'EMP003', department: 'Marketing', designation: 'Specialist', salary: 55000, dateOfJoining: '2023-03-10' },
  { name: 'Emily Davis', employeeId: 'EMP004', department: 'HR', designation: 'Coordinator', salary: 50000, dateOfJoining: '2023-05-20' },
  { name: 'David Wilson', employeeId: 'EMP005', department: 'Finance', designation: 'Analyst', salary: 60000, dateOfJoining: '2022-11-15' },
  { name: 'Lisa Anderson', employeeId: 'EMP006', department: 'Operations', designation: 'Executive', salary: 48000, dateOfJoining: '2023-07-01' },
  { name: 'Robert Taylor', employeeId: 'EMP007', department: 'IT', designation: 'Developer', salary: 65000, dateOfJoining: '2023-02-14' },
  { name: 'Jennifer Martinez', employeeId: 'EMP008', department: 'Customer Support', designation: 'Associate', salary: 45000, dateOfJoining: '2023-08-10' },
  { name: 'James Garcia', employeeId: 'EMP009', department: 'Engineering', designation: 'Developer', salary: 70000, dateOfJoining: '2023-04-05' },
  { name: 'Mary Rodriguez', employeeId: 'EMP010', department: 'Sales', designation: 'Executive', salary: 52000, dateOfJoining: '2023-09-12' }
]

async function main() {
  try {
    console.log('🌱 Starting HRM Mock Data Seeding...\n')

    // 1. Get or create default tenant and admin user
    let tenant = await prisma.tenant.findFirst({
      where: { domain: 'default' }
    })

    if (!tenant) {
      tenant = await prisma.tenant.create({
        data: {
          name: 'Default Company',
          domain: 'default',
          settings: {
            timezone: 'UTC',
            currency: 'USD',
            dateFormat: 'MM/DD/YYYY',
            features: { hrm: true }
          }
        }
      })
      console.log('✅ Created default tenant')
    }

    // Get or create admin user for createdBy fields
    let adminUser = await prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' }
    })

    if (!adminUser) {
      const adminPasswordHash = await bcrypt.hash('admin123', 10)
      adminUser = await prisma.user.create({
        data: {
          email: 'admin@company.com',
          name: 'System Administrator',
          password: adminPasswordHash,
          role: 'SUPER_ADMIN',
          tenantId: tenant.id,
          isActive: true,
          isFirstLogin: false
        }
      })
      console.log('✅ Created admin user')
    }

    // 2. Create Shifts
    console.log('\n📅 Creating shifts...')
    const createdShifts = []
    for (const shiftData of SHIFTS) {
      let shift = await prisma.shift.findFirst({
        where: { name: shiftData.name }
      })
      
      if (!shift) {
        shift = await prisma.shift.create({
          data: shiftData
        })
      }
      
      createdShifts.push(shift)
      console.log(`   ✅ ${shift.name}`)
    }

    // 3. Create Employees with User accounts
    console.log('\n👥 Creating employees...')
    const createdEmployees = []
    const passwordHash = await bcrypt.hash('employee123', 10) // Hash once, reuse for all
    
    for (let i = 0; i < EMPLOYEES.length; i++) {
      const empData = EMPLOYEES[i]
      const email = `employee${i + 1}@company.com`
      console.log(`   📝 Processing ${i + 1}/${EMPLOYEES.length}: ${empData.name}...`)

      // Create user account
      const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
          email,
          name: empData.name,
          password: passwordHash,
          role: 'USER',
          tenantId: tenant.id,
          isActive: true,
          isFirstLogin: false
        }
      })

      // Create employee
      const employee = await prisma.employee.upsert({
        where: { employeeId: empData.employeeId },
        update: {},
        create: {
          employeeId: empData.employeeId,
          name: empData.name,
          department: empData.department,
          designation: empData.designation,
          salary: empData.salary,
          dateOfJoining: new Date(empData.dateOfJoining),
          contactNumber: `+1-555-${1000 + i}-${1000 + i}`,
          address: `${100 + i} Main Street, City, State`,
          gender: i % 2 === 0 ? 'Male' : 'Female',
          dob: new Date(1990 + (i % 10), i % 12, (i % 28) + 1),
          tenantId: tenant.id,
          userId: user.id
        }
      })

      // Assign shift to employee
      const shiftIndex = i % createdShifts.length
      const existingShift = await prisma.employeeShift.findFirst({
        where: {
          employeeId: employee.id,
          effectiveFrom: new Date(empData.dateOfJoining),
          isActive: true
        }
      })

      if (!existingShift) {
        await prisma.employeeShift.create({
          data: {
          employeeId: employee.id,
            shiftId: createdShifts[shiftIndex].id,
            effectiveFrom: new Date(empData.dateOfJoining),
            isActive: true
          }
        })
      }

      createdEmployees.push({ ...employee, user })
      console.log(`   ✅ ${employee.name} (${employee.employeeId})`)
    }

    // 4. Create Leave Types (if not exist)
    console.log('\n🏖️  Checking leave types...')
    const leaveTypes = await prisma.leaveType.findMany({
      where: { tenantId: tenant.id }
    })

    if (leaveTypes.length === 0) {
      console.log('   ⚠️  No leave types found. Run seed-leave-types.js first or create them manually.')
    } else {
      console.log(`   ✅ Found ${leaveTypes.length} leave types`)
    }

    // 5. Create Leave Policies and Assignments
    console.log('\n📋 Creating leave policies and assignments...')
    const casualLeaveType = leaveTypes.find(lt => lt.code === 'CL')
    const annualLeaveType = leaveTypes.find(lt => lt.code === 'AL')
    const sickLeaveType = leaveTypes.find(lt => lt.code === 'SL')

    if (casualLeaveType) {
      // Create Casual Leave Policy
      let casualPolicy = await prisma.leavePolicy.findFirst({
        where: {
          tenantId: tenant.id,
          leaveTypeId: casualLeaveType.id,
          isActive: true
        }
      })

      if (!casualPolicy) {
        casualPolicy = await prisma.leavePolicy.create({
          data: {
            tenantId: tenant.id,
            leaveTypeId: casualLeaveType.id,
            name: 'Standard Casual Leave Policy',
            accrualType: 'MONTHLY',
            accrualAmount: 1.25,
            maxBalance: 15,
            allowNegativeBalance: false,
            carryForwardEnabled: true,
            carryForwardLimit: 5,
            encashmentEnabled: false,
            effectiveFrom: new Date('2024-01-01'),
            isActive: true,
            createdBy: adminUser.id
          }
        })
      }

      // Assign to all employees
      for (const emp of createdEmployees) {
        const existingAssignment = await prisma.leavePolicyAssignment.findFirst({
          where: {
            employeeId: emp.id,
            policyId: casualPolicy.id,
            isActive: true
          }
        })

        if (!existingAssignment) {
          await prisma.leavePolicyAssignment.create({
            data: {
              policyId: casualPolicy.id,
              employeeId: emp.id,
              effectiveFrom: new Date(emp.dateOfJoining || '2024-01-01'),
              isActive: true
            }
          })
        }
      }
      console.log(`   ✅ Created and assigned Casual Leave policy to ${createdEmployees.length} employees`)
    }

    if (annualLeaveType) {
      // Create Annual Leave Policy
      let annualPolicy = await prisma.leavePolicy.findFirst({
        where: {
          tenantId: tenant.id,
          leaveTypeId: annualLeaveType.id,
          isActive: true
        }
      })

      if (!annualPolicy) {
        annualPolicy = await prisma.leavePolicy.create({
          data: {
            tenantId: tenant.id,
            leaveTypeId: annualLeaveType.id,
            name: 'Standard Annual Leave Policy',
            accrualType: 'MONTHLY',
            accrualAmount: 1.5,
            maxBalance: 30,
            allowNegativeBalance: false,
            carryForwardEnabled: true,
            carryForwardLimit: 10,
            encashmentEnabled: true,
            encashmentLimit: 5,
            effectiveFrom: new Date('2024-01-01'),
            isActive: true,
            createdBy: adminUser.id
          }
        })
      }

      // Assign to all employees
      for (const emp of createdEmployees) {
        const existingAssignment = await prisma.leavePolicyAssignment.findFirst({
          where: {
            employeeId: emp.id,
            policyId: annualPolicy.id,
            isActive: true
          }
        })

        if (!existingAssignment) {
          await prisma.leavePolicyAssignment.create({
            data: {
              policyId: annualPolicy.id,
              employeeId: emp.id,
              effectiveFrom: new Date(emp.dateOfJoining || '2024-01-01'),
              isActive: true
            }
          })
        }
      }
      console.log(`   ✅ Created and assigned Annual Leave policy to ${createdEmployees.length} employees`)
    }

    // 6. Create initial accruals for employees
    console.log('\n💰 Creating initial leave accruals...')
    if (casualLeaveType && annualLeaveType) {
      const today = new Date()
      
      // Pre-fetch policies once
      const casualPolicy = await prisma.leavePolicy.findFirst({
        where: {
          leaveTypeId: casualLeaveType.id,
          tenantId: tenant.id,
          isActive: true
        }
      })

      if (casualPolicy) {
        const periodStart = new Date(today.getFullYear(), today.getMonth(), 1)
        const periodEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)

        // Bulk fetch existing balances
        const existingBalances = await prisma.leaveBalance.findMany({
          where: {
            employeeId: { in: createdEmployees.map(e => e.id) },
            leaveTypeId: casualLeaveType.id,
            periodStart
          },
          select: { employeeId: true }
        })
        const existingBalanceEmployeeIds = new Set(existingBalances.map(b => b.employeeId))

        let accrualCount = 0
        for (let i = 0; i < createdEmployees.length; i++) {
          const emp = createdEmployees[i]
          
          if (i % 5 === 0) {
            console.log(`   📝 Processing accruals ${i + 1}/${createdEmployees.length}...`)
          }

          if (!existingBalanceEmployeeIds.has(emp.id)) {
            // Create initial balance
            await prisma.leaveBalance.create({
              data: {
                employeeId: emp.id,
                leaveTypeId: casualLeaveType.id,
                policyId: casualPolicy.id,
                periodStart,
                periodEnd,
                openingBalance: 0,
                accrued: Number(casualPolicy.accrualAmount),
                used: 0,
                encashed: 0,
                carriedForward: 0,
                closingBalance: Number(casualPolicy.accrualAmount)
              }
            })

            // Create accrual record
            await prisma.leaveAccrual.create({
              data: {
                employeeId: emp.id,
                leaveTypeId: casualLeaveType.id,
                policyId: casualPolicy.id,
                accrualDate: today,
                accrualAmount: Number(casualPolicy.accrualAmount),
                periodStart,
                periodEnd,
                balanceBefore: 0,
                balanceAfter: Number(casualPolicy.accrualAmount),
                notes: 'Initial accrual from mock data seeding',
                createdBy: adminUser.id
              }
            })
            accrualCount++
          }
        }
        console.log(`   ✅ Created initial accruals for ${accrualCount} employees (${createdEmployees.length - accrualCount} already had balances)`)
      }
    }

    // 7. Create Salary Structures
    console.log('\n💵 Creating salary structures...')
    let salaryStructureCount = 0
    let salaryStructureSkipped = 0
    
    for (let i = 0; i < createdEmployees.length; i++) {
      const emp = createdEmployees[i]
      const baseSalary = Number(emp.salary) || 50000
      const effectiveFrom = new Date(emp.dateOfJoining || '2024-01-01')

      if (i % 5 === 0) {
        console.log(`   📝 Processing salary structures ${i + 1}/${createdEmployees.length}...`)
      }

      // Check if structure already exists
      const existingStructure = await prisma.salaryStructure.findFirst({
        where: {
          employeeId: emp.id,
          effectiveFrom,
          isActive: true
        }
      })

      if (!existingStructure) {
        // Deactivate old structures
        await prisma.salaryStructure.updateMany({
          where: { employeeId: emp.id, isActive: true },
          data: { isActive: false, effectiveTo: new Date() }
        })

        // Create new structure
        const structure = await prisma.salaryStructure.create({
          data: {
            employeeId: emp.id,
            effectiveFrom,
            isActive: true,
            createdBy: adminUser.id,
            components: {
              create: [
                {
                  name: 'Basic Salary',
                  type: 'ALLOWANCE',
                  calculationType: 'FIXED',
                  amount: baseSalary * 0.6, // 60% basic
                  isTaxable: true,
                  priority: 1
                },
                {
                  name: 'House Allowance',
                  type: 'ALLOWANCE',
                  calculationType: 'PERCENTAGE',
                  amount: 50, // 50% of basic
                  baseComponentId: null, // Will use basic salary
                  isTaxable: true,
                  priority: 2
                },
                {
                  name: 'Transport Allowance',
                  type: 'ALLOWANCE',
                  calculationType: 'FIXED',
                  amount: 5000,
                  isTaxable: false,
                  priority: 3
                },
                {
                  name: 'Tax Deduction',
                  type: 'DEDUCTION',
                  calculationType: 'PERCENTAGE',
                  amount: 10, // 10% of gross
                  isTaxable: false,
                  priority: 10
                }
              ]
            }
          }
        })
        salaryStructureCount++
      } else {
        salaryStructureSkipped++
      }
    }
    console.log(`   ✅ Created ${salaryStructureCount} salary structures${salaryStructureSkipped > 0 ? ` (${salaryStructureSkipped} already existed)` : ''}`)

    // 8. Create Attendance Events (last 30 days)
    console.log('\n⏰ Creating attendance events...')
    const today = new Date()
    let attendanceCount = 0
    let skippedCount = 0

    // Pre-fetch all employee shifts to avoid repeated queries
    console.log('   📋 Loading employee shifts...')
    const employeeShiftsMap = new Map()
    for (const emp of createdEmployees) {
      const shiftAssignment = await prisma.employeeShift.findFirst({
        where: {
          employeeId: emp.id,
          isActive: true
        },
        include: { shift: true },
        orderBy: { effectiveFrom: 'desc' }
      })
      if (shiftAssignment) {
        employeeShiftsMap.set(emp.id, shiftAssignment.shift)
      }
    }
    console.log(`   ✅ Loaded shifts for ${employeeShiftsMap.size} employees`)

    // Calculate date range for bulk fetch
    const startDate = new Date(today)
    startDate.setDate(startDate.getDate() - 30)
    const endDate = new Date(today)

    // Bulk fetch existing attendance events for the date range
    console.log('   📋 Loading existing attendance events...')
    const existingEvents = await prisma.attendanceEvent.findMany({
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate
        },
        employeeId: {
          in: createdEmployees.map(e => e.id)
        }
      },
      select: {
        employeeId: true,
        eventType: true,
        timestamp: true
      }
    })

    // Create a Set for fast lookup: "employeeId|eventType|timestamp"
    const existingEventsSet = new Set()
    for (const event of existingEvents) {
      const key = `${event.employeeId}|${event.eventType}|${event.timestamp.toISOString()}`
      existingEventsSet.add(key)
    }
    console.log(`   ✅ Found ${existingEvents.length} existing events`)

    // Prepare all events to create
    console.log('   📝 Preparing attendance events...')
    const eventsToCreate = []
    let totalDaysProcessed = 0
    let totalDaysSkipped = 0

    for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
      const date = new Date(today)
      date.setDate(date.getDate() - dayOffset)

      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) {
        totalDaysSkipped++
        continue
      }

      totalDaysProcessed++
      if (dayOffset % 5 === 0) {
        console.log(`   📅 Processing day ${dayOffset + 1}/30 (${date.toISOString().split('T')[0]})...`)
      }

      for (const emp of createdEmployees) {
        const shift = employeeShiftsMap.get(emp.id)
        if (!shift) {
          skippedCount += 2 // Skip both check-in and check-out
          continue
        }

        const [startHour, startMinute] = shift.startTime.split(':').map(Number)
        const [endHour, endMinute] = shift.endTime.split(':').map(Number)

        // Create check-in time (deterministic)
        const checkInTime = new Date(date)
        const lateOffset = (emp.id.charCodeAt(0) + dayOffset) % 5 === 0 ? 20 : 0
        checkInTime.setHours(startHour, startMinute + lateOffset, 0, 0)

        // Check if check-in event already exists
        const checkInKey = `${emp.id}|CHECK_IN|${checkInTime.toISOString()}`
        if (!existingEventsSet.has(checkInKey)) {
          eventsToCreate.push({
            employeeId: emp.id,
            eventType: 'CHECK_IN',
            timestamp: checkInTime
          })
        } else {
          skippedCount++
        }

        // Create check-out time (deterministic)
        const checkOutTime = new Date(date)
        if (endHour < startHour) {
          checkOutTime.setDate(checkOutTime.getDate() + 1) // Next day for night shifts
        }
        const earlyOffset = (emp.id.charCodeAt(0) + dayOffset) % 10 === 0 ? 30 : 0
        checkOutTime.setHours(endHour, endMinute - earlyOffset, 0, 0)

        // Check if check-out event already exists
        const checkOutKey = `${emp.id}|CHECK_OUT|${checkOutTime.toISOString()}`
        if (!existingEventsSet.has(checkOutKey)) {
          eventsToCreate.push({
            employeeId: emp.id,
            eventType: 'CHECK_OUT',
            timestamp: checkOutTime
          })
        } else {
          skippedCount++
        }
      }
    }

    console.log(`   ✅ Prepared ${eventsToCreate.length} events to create (${totalDaysProcessed} workdays processed, ${totalDaysSkipped} weekends skipped)`)

    // Bulk create events in batches
    if (eventsToCreate.length > 0) {
      console.log(`   💾 Creating ${eventsToCreate.length} attendance events in batches...`)
      const batchSize = 100
      let batchCount = 0

      for (let i = 0; i < eventsToCreate.length; i += batchSize) {
        const batch = eventsToCreate.slice(i, i + batchSize)
        batchCount++
        
        try {
          await prisma.attendanceEvent.createMany({
            data: batch,
            skipDuplicates: true
          })
          attendanceCount += batch.length
          if (batchCount % 5 === 0 || i + batchSize >= eventsToCreate.length) {
            console.log(`   📊 Progress: ${Math.min(i + batchSize, eventsToCreate.length)}/${eventsToCreate.length} events processed...`)
          }
        } catch (error) {
          // If batch fails, try individual creates with skipDuplicates
          console.log(`   ⚠️  Batch ${batchCount} had some duplicates, creating individually...`)
          for (const event of batch) {
            try {
              await prisma.attendanceEvent.create({
                data: event
              })
              attendanceCount++
            } catch (err) {
              if (err.code !== 'P2002') { // Not a unique constraint error
                throw err
              }
              skippedCount++
            }
          }
        }
      }
    }

    console.log(`   ✅ Created ${attendanceCount} attendance events${skippedCount > 0 ? ` (skipped ${skippedCount} existing)` : ''}`)

    // 9. Create some Leave Requests
    console.log('\n📝 Creating leave requests...')
    let leaveRequestCount = 0
    let skippedLeaveRequestCount = 0
    for (let i = 0; i < 5; i++) {
      const emp = createdEmployees[i]
      if (!casualLeaveType) continue

      const startDate = new Date(today)
      startDate.setDate(startDate.getDate() + (i * 7) + 5) // Spread over weeks
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + (i % 3)) // 1-3 days

      // Check if leave request already exists
      const existingRequest = await prisma.leaveRequest.findFirst({
        where: {
          employeeId: emp.id,
          leaveTypeId: casualLeaveType.id,
          startDate,
          endDate
        }
      })

      if (!existingRequest) {
        const leaveRequest = await prisma.leaveRequest.create({
          data: {
            employeeId: emp.id,
            leaveTypeId: casualLeaveType.id,
            startDate,
            endDate,
            days: Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1,
            reason: `Personal leave request ${i + 1}`,
            status: i < 2 ? 'APPROVED' : 'PENDING', // First 2 approved, rest pending
            requestedBy: emp.user.id,
            isBackdated: false
          }
        })
        leaveRequestCount++
      } else {
        skippedLeaveRequestCount++
      }
    }
    console.log(`   ✅ Created ${leaveRequestCount} leave requests${skippedLeaveRequestCount > 0 ? ` (skipped ${skippedLeaveRequestCount} existing)` : ''}`)

    // 10. Create Payroll Period
    console.log('\n📊 Creating payroll period...')
    const periodStart = new Date(today.getFullYear(), today.getMonth(), 1)
    const periodEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    const periodName = `${today.toLocaleString('default', { month: 'long' })} ${today.getFullYear()}`

    let payrollPeriod = await prisma.payrollPeriod.findFirst({
      where: {
        periodStart,
        periodEnd
      }
    })

    if (!payrollPeriod) {
      payrollPeriod = await prisma.payrollPeriod.create({
        data: {
        periodName,
          periodStart,
          periodEnd,
          status: 'DRAFT',
          createdBy: adminUser.id
        }
      })
      console.log(`   ✅ Created payroll period: ${periodName}`)
    } else {
      console.log(`   ⏭️  Payroll period already exists: ${periodName}`)
    }

    // 11. Create some Bonuses
    console.log('\n🎁 Creating bonuses...')
    let bonusCount = 0
    let skippedBonusCount = 0
    for (let i = 0; i < 3; i++) {
      const emp = createdEmployees[i]
      const bonusName = `Performance Bonus ${i + 1}`

      // Check if bonus already exists
      const existingBonus = await prisma.bonus.findFirst({
        where: {
          employeeId: emp.id,
          name: bonusName
        }
      })

      if (!existingBonus) {
        await prisma.bonus.create({
          data: {
            employeeId: emp.id,
            name: bonusName,
            amount: 5000 + (i * 1000),
            type: 'ONE_TIME',
            status: 'APPROVED',
            approvedBy: adminUser.id,
            approvedAt: new Date(),
            notes: 'Quarterly performance bonus',
            createdBy: adminUser.id
          }
        })
        bonusCount++
      } else {
        skippedBonusCount++
      }
    }
    console.log(`   ✅ Created ${bonusCount} bonuses${skippedBonusCount > 0 ? ` (skipped ${skippedBonusCount} existing)` : ''}`)

    // 12. Create some Loans
    console.log('\n💳 Creating loans...')
    let loanCount = 0
    let skippedLoanCount = 0
    for (let i = 0; i < 2; i++) {
      const emp = createdEmployees[i + 5]
      const principalAmount = 10000 + (i * 5000)
      const installmentAmount = principalAmount / 12
      const endDate = new Date(today)
      endDate.setMonth(endDate.getMonth() + 12)
      const startDate = new Date(today.getFullYear(), today.getMonth() - 2, 1)
      const loanNumber = `LOAN-${emp.employeeId}-${startDate.getFullYear()}${String(startDate.getMonth() + 1).padStart(2, '0')}`

      // Check if loan already exists
      const existingLoan = await prisma.loan.findFirst({
        where: {
          employeeId: emp.id,
          loanNumber
        }
      })

      if (!existingLoan) {
        const loan = await prisma.loan.create({
          data: {
            employeeId: emp.id,
            loanNumber,
            principalAmount,
            interestRate: 5.0,
            totalAmount: principalAmount * 1.05,
            installmentAmount,
            totalInstallments: 12,
            remainingInstallments: 12,
            status: 'ACTIVE',
            startDate,
            endDate,
            notes: 'Employee loan',
            createdBy: adminUser.id,
            installments: {
              create: Array.from({ length: 12 }, (_, idx) => ({
                installmentNumber: idx + 1,
                amount: installmentAmount,
                status: idx < 2 ? 'DEDUCTED' : 'PENDING', // First 2 deducted
                dueDate: new Date(today.getFullYear(), today.getMonth() - 2 + idx + 1, 1)
              }))
            }
          }
        })
        console.log(`   ✅ Created loan for ${emp.name}: ${loan.loanNumber}`)
        loanCount++
      } else {
        console.log(`   ⏭️  Loan already exists for ${emp.name}: ${loanNumber}`)
        skippedLoanCount++
      }
    }
    if (skippedLoanCount > 0) {
      console.log(`   ⏭️  Skipped ${skippedLoanCount} existing loans`)
    }

    // 13. Generate credentials file
    console.log('\n📄 Generating credentials file...')
    const credentials = []
    credentials.push('='.repeat(60))
    credentials.push('HRM MOCK DATA - EMPLOYEE CREDENTIALS')
    credentials.push('='.repeat(60))
    credentials.push('')
    credentials.push('Admin Account:')
    credentials.push('  Email: admin@company.com')
    credentials.push('  Password: admin123')
    credentials.push('')
    credentials.push('Employee Accounts:')
    credentials.push('')
    
    for (let i = 0; i < createdEmployees.length; i++) {
      const emp = createdEmployees[i]
      const email = `employee${i + 1}@company.com`
      credentials.push(`${i + 1}. ${emp.name} (${emp.employeeId})`)
      credentials.push(`   Email: ${email}`)
      credentials.push(`   Password: employee123`)
      credentials.push(`   Department: ${emp.department}`)
      credentials.push(`   Designation: ${emp.designation}`)
      credentials.push('')
    }

    credentials.push('='.repeat(60))
    credentials.push(`Generated on: ${new Date().toISOString()}`)
    credentials.push('='.repeat(60))

    const credentialsPath = path.join(__dirname, '..', 'HRM_EMPLOYEE_CREDENTIALS.txt')
    fs.writeFileSync(credentialsPath, credentials.join('\n'), 'utf8')
    console.log(`   ✅ Credentials file created: ${credentialsPath}`)

    // Summary
    console.log('\n📊 Seeding Summary:')
    console.log('===================')
    console.log(`✅ Shifts: ${createdShifts.length}`)
    console.log(`✅ Employees: ${createdEmployees.length}`)
    console.log(`✅ Leave Types: ${leaveTypes.length}`)
    console.log(`✅ Attendance Events: ${attendanceCount}`)
    console.log(`✅ Leave Requests: ${leaveRequestCount}`)
    console.log(`✅ Payroll Periods: 1`)
    console.log(`✅ Bonuses: ${bonusCount}`)
    console.log(`✅ Loans: ${loanCount}`)
    console.log('\n🔑 Login Credentials:')
    console.log('====================')
    console.log('All employees use:')
    console.log('  Email: employee1@company.com to employee10@company.com')
    console.log('  Password: employee123')
    console.log(`\n📄 Full credentials saved to: ${credentialsPath}`)
    console.log('\n✅ HRM Mock Data Seeding Completed!')

  } catch (error) {
    console.error('❌ Error seeding HRM mock data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
if (require.main === module) {
  main()
    .then(() => {
      console.log('\n🎉 Done!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n💥 Failed:', error)
      process.exit(1)
    })
}

module.exports = { main }


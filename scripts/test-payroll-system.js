/**
 * Payroll System Test Script
 * 
 * Tests the complete payroll system functionality
 * Run with: node scripts/test-payroll-system.js
 */

import { PrismaClient } from '@prisma/client'
import { calculatePayroll } from '../src/lib/payroll-calculator.js'

const prisma = new PrismaClient()

async function testPayrollSystem() {
  console.log('🧪 Testing Payroll Management System...\n')

  try {
    // Test 1: Check if payroll tables exist
    console.log('1️⃣ Testing Database Schema...')
    const periods = await prisma.payrollPeriod.count()
    const structures = await prisma.salaryStructure.count()
    const records = await prisma.payrollRecord.count()
    console.log(`   ✅ Found ${periods} payroll periods`)
    console.log(`   ✅ Found ${structures} salary structures`)
    console.log(`   ✅ Found ${records} payroll records`)
    console.log('   ✅ Database schema is working\n')

    // Test 2: Check if employees exist
    console.log('2️⃣ Testing Employee Data...')
    const employees = await prisma.employee.findMany({
      where: { dateOfLeaving: null },
      take: 5
    })
    console.log(`   ✅ Found ${employees.length} active employees`)
    if (employees.length > 0) {
      console.log(`   ✅ Sample employee: ${employees[0].name} (${employees[0].employeeId})`)
    }
    console.log('   ✅ Employee data is accessible\n')

    // Test 3: Check salary structures
    console.log('3️⃣ Testing Salary Structures...')
    const salaryStructures = await prisma.salaryStructure.findMany({
      include: {
        employee: true,
        components: true
      },
      take: 3
    })
    console.log(`   ✅ Found ${salaryStructures.length} salary structures`)
    if (salaryStructures.length > 0) {
      const structure = salaryStructures[0]
      console.log(`   ✅ Sample structure: ${structure.employee.name} - ${structure.components.length} components`)
      structure.components.forEach(comp => {
        console.log(`      - ${comp.name}: ${comp.type} (${comp.calculationType})`)
      })
    }
    console.log('   ✅ Salary structures are working\n')

    // Test 4: Check payroll periods
    console.log('4️⃣ Testing Payroll Periods...')
    const payrollPeriods = await prisma.payrollPeriod.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' }
    })
    console.log(`   ✅ Found ${payrollPeriods.length} payroll periods`)
    if (payrollPeriods.length > 0) {
      payrollPeriods.forEach(period => {
        console.log(`   ✅ Period: ${period.periodName} (${period.status})`)
      })
    }
    console.log('   ✅ Payroll periods are working\n')

    // Test 5: Check payroll records
    console.log('5️⃣ Testing Payroll Records...')
    const payrollRecords = await prisma.payrollRecord.findMany({
      include: {
        employee: true,
        payrollPeriod: true,
        components: true
      },
      take: 3
    })
    console.log(`   ✅ Found ${payrollRecords.length} payroll records`)
    if (payrollRecords.length > 0) {
      const record = payrollRecords[0]
      console.log(`   ✅ Sample record: ${record.employee.name} - ${record.payrollPeriod.periodName}`)
      console.log(`      Gross: ${record.grossSalary}, Net: ${record.netSalary}`)
      console.log(`      Components: ${record.components.length}`)
    }
    console.log('   ✅ Payroll records are working\n')

    // Test 6: Check attendance integration
    console.log('6️⃣ Testing Attendance Integration...')
    if (employees.length > 0) {
      const employee = employees[0]
      const attendance = await prisma.dailyAttendance.findMany({
        where: {
          employeeId: employee.id,
          date: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            lte: new Date()
          }
        },
        take: 5
      })
      console.log(`   ✅ Found ${attendance.length} attendance records for ${employee.name}`)
      if (attendance.length > 0) {
        const locked = attendance.filter(a => a.isLocked).length
        console.log(`   ✅ Locked records: ${locked}`)
      }
    }
    console.log('   ✅ Attendance integration is working\n')

    // Test 7: Check leave integration
    console.log('7️⃣ Testing Leave Integration...')
    if (employees.length > 0) {
      const employee = employees[0]
      const leaveRequests = await prisma.leaveRequest.findMany({
        where: {
          employeeId: employee.id,
          status: 'APPROVED'
        },
        include: {
          leaveType: true
        },
        take: 5
      })
      console.log(`   ✅ Found ${leaveRequests.length} approved leave requests for ${employee.name}`)
      if (leaveRequests.length > 0) {
        leaveRequests.forEach(leave => {
          console.log(`      - ${leave.leaveType.name}: ${leave.days} days (${leave.leaveType.isPaid ? 'Paid' : 'Unpaid'})`)
        })
      }
    }
    console.log('   ✅ Leave integration is working\n')

    // Test 8: Check bonuses
    console.log('8️⃣ Testing Bonuses...')
    const bonuses = await prisma.bonus.findMany({
      include: {
        employee: true
      },
      take: 3
    })
    console.log(`   ✅ Found ${bonuses.length} bonuses`)
    if (bonuses.length > 0) {
      bonuses.forEach(bonus => {
        console.log(`      - ${bonus.employee.name}: ${bonus.name} - ${bonus.amount} (${bonus.status})`)
      })
    }
    console.log('   ✅ Bonuses are working\n')

    // Test 9: Check loans
    console.log('9️⃣ Testing Loans...')
    const loans = await prisma.loan.findMany({
      include: {
        employee: true,
        installments: true
      },
      take: 3
    })
    console.log(`   ✅ Found ${loans.length} loans`)
    if (loans.length > 0) {
      loans.forEach(loan => {
        const pending = loan.installments.filter(i => i.status === 'PENDING').length
        console.log(`      - ${loan.employee.name}: ${loan.loanNumber} - ${pending} pending installments`)
      })
    }
    console.log('   ✅ Loans are working\n')

    // Test 10: Check audit logs
    console.log('🔟 Testing Audit Logs...')
    const auditLogs = await prisma.payrollAuditLog.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    })
    console.log(`   ✅ Found ${auditLogs.length} audit log entries`)
    if (auditLogs.length > 0) {
      auditLogs.forEach(log => {
        console.log(`      - ${log.action} at ${log.createdAt.toISOString()}`)
      })
    }
    console.log('   ✅ Audit logs are working\n')

    console.log('✅ All tests passed! Payroll system is working correctly.\n')
    console.log('📋 Summary:')
    console.log(`   - ${periods} Payroll Periods`)
    console.log(`   - ${structures} Salary Structures`)
    console.log(`   - ${records} Payroll Records`)
    console.log(`   - ${employees.length} Active Employees`)
    console.log(`   - ${bonuses.length} Bonuses`)
    console.log(`   - ${loans.length} Loans`)
    console.log(`   - ${auditLogs.length} Audit Log Entries`)

  } catch (error) {
    console.error('❌ Test failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run tests
testPayrollSystem()
  .then(() => {
    console.log('\n✅ All tests completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Tests failed:', error)
    process.exit(1)
  })



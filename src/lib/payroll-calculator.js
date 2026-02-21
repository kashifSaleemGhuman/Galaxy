/**
 * Payroll Calculator
 * 
 * Deterministic payroll calculation engine
 * Integrates with attendance and leave modules
 */

import { prisma } from '@/lib/db'

/**
 * Calculate payroll for an employee for a given period
 * @param {Object} params - Calculation parameters
 * @param {string} params.employeeId - Employee ID
 * @param {string} params.payrollPeriodId - Payroll period ID
 * @param {string} params.calculatedBy - User ID who is calculating
 * @returns {Promise<Object>} Payroll calculation result
 */
export async function calculatePayroll({ employeeId, payrollPeriodId, calculatedBy }) {
  try {
    // 1. Get payroll period
    const payrollPeriod = await prisma.payrollPeriod.findUnique({
      where: { id: payrollPeriodId }
    })

    if (!payrollPeriod) {
      throw new Error('Payroll period not found')
    }

    if (payrollPeriod.status === 'FINALIZED' || payrollPeriod.status === 'PAID') {
      throw new Error('Cannot calculate payroll for finalized or paid period')
    }

    // 2. Get employee
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        salaryStructures: {
          where: {
            isActive: true,
            effectiveFrom: { lte: payrollPeriod.periodEnd },
            OR: [
              { effectiveTo: null },
              { effectiveTo: { gte: payrollPeriod.periodStart } }
            ]
          },
          include: {
            salaryComponents: {
              where: { isActive: true },
              orderBy: { priority: 'asc' }
            }
          },
          orderBy: { effectiveFrom: 'desc' },
          take: 1
        }
      }
    })

    if (!employee) {
      throw new Error('Employee not found')
    }

    let salaryStructure = employee.salaryStructures?.[0]
    if (!salaryStructure) {
      if (!employee.salary || Number(employee.salary) <= 0) {
        throw new Error('No active salary structure found and employee salary is not set')
      }
      // Fallback: allow HR to set monthly salary directly on employee profile.
      salaryStructure = {
        id: `employee-salary-${employee.id}`,
        salaryComponents: [
          {
            id: `basic-${employee.id}`,
            name: 'Basic Salary',
            type: 'ALLOWANCE',
            calculationType: 'FIXED',
            amount: employee.salary,
            baseComponentId: null,
            isTaxable: true,
            isActive: true,
            priority: 1
          }
        ]
      }
    }

    // 3. Get attendance data (only locked records)
    const attendanceData = await getAttendanceData(employeeId, payrollPeriod.periodStart, payrollPeriod.periodEnd)

    // 4. Get leave data
    const leaveData = await getLeaveData(employeeId, payrollPeriod.periodStart, payrollPeriod.periodEnd)

    // 5. Calculate base salary
    const baseSalaryCalculation = calculateBaseSalary({
      employee,
      salaryStructure,
      payrollPeriod,
      attendanceData,
      leaveData
    })

    // 6. Calculate allowances
    const allowancesCalculation = calculateAllowances({
      salaryStructure,
      baseSalary: baseSalaryCalculation.adjustedBaseSalary,
      attendanceData,
      leaveData
    })

    // 7. Calculate deductions
    const deductionsCalculation = await calculateDeductions({
      employeeId,
      salaryStructure,
      baseSalary: baseSalaryCalculation.adjustedBaseSalary,
      grossSalary: baseSalaryCalculation.adjustedBaseSalary + allowancesCalculation.totalAllowances,
      payrollPeriod,
      attendanceData
    })

    // 8. Get approved bonuses
    const bonuses = await getApprovedBonuses(employeeId, payrollPeriodId)

    // 8.5. Apply manual additions from HR
    const manualAdditions = await getManualSalaryAdditions(employeeId, payrollPeriodId)
    const allAllowanceComponents = [
      ...allowancesCalculation.components,
      ...manualAdditions.items.map((item) => ({
        name: `Manual Addition: ${item.reason}`,
        calculationType: 'FIXED',
        baseAmount: null,
        amount: Number(item.amount),
        isTaxable: false,
        priority: 996
      }))
    ]
    const totalAllowances = allowancesCalculation.totalAllowances + manualAdditions.totalAmount

    // 9. Calculate final amounts
    const grossSalary = baseSalaryCalculation.adjustedBaseSalary + totalAllowances + bonuses.totalAmount
    const totalDeductions = deductionsCalculation.totalDeductions
    const netSalary = grossSalary - totalDeductions

    // 10. Build calculation breakdown
    const calculationBreakdown = {
      baseSalary: {
        monthlySalary: Number(baseSalaryCalculation.monthlySalary),
        proRataFactor: baseSalaryCalculation.proRataFactor,
        adjustedBaseSalary: Number(baseSalaryCalculation.adjustedBaseSalary),
        unpaidLeaveDeduction: Number(baseSalaryCalculation.unpaidLeaveDeduction),
        calculation: baseSalaryCalculation.calculation
      },
      allowances: allAllowanceComponents,
      deductions: deductionsCalculation.components,
      bonuses: bonuses.components,
      totals: {
        grossSalary: Number(grossSalary),
        totalAllowances: Number(totalAllowances),
        totalDeductions: Number(totalDeductions),
        netSalary: Number(netSalary)
      }
    }

    // Serialize Date objects in summaries for JSON storage
    const serializeForJson = (obj) => {
      if (!obj) return obj
      return JSON.parse(JSON.stringify(obj, (key, value) => {
        if (value instanceof Date) {
          return value.toISOString()
        }
        return value
      }))
    }

    return {
      employeeId,
      payrollPeriodId,
      salaryStructureId: salaryStructure.id,
      grossSalary,
      totalAllowances,
      totalDeductions,
      netSalary,
      calculationBreakdown: serializeForJson(calculationBreakdown),
      attendanceSummary: serializeForJson(attendanceData.summary),
      leaveSummary: serializeForJson(leaveData.summary),
      components: [
        ...allAllowanceComponents.map(c => ({
          componentName: c.name,
          componentType: 'ALLOWANCE',
          calculationType: c.calculationType,
          baseAmount: c.baseAmount ? Number(c.baseAmount) : null,
          amount: Number(c.amount),
          isTaxable: c.isTaxable,
          priority: c.priority
        })),
        ...deductionsCalculation.components.map(c => ({
          componentName: c.name,
          componentType: 'DEDUCTION',
          calculationType: c.calculationType,
          baseAmount: c.baseAmount ? Number(c.baseAmount) : null,
          amount: Number(c.amount),
          isTaxable: false,
          priority: c.priority
        }))
      ]
    }
  } catch (error) {
    console.error('[PAYROLL_CALCULATOR]', error)
    throw error
  }
}

/**
 * Get attendance data for the period
 */
async function getAttendanceData(employeeId, periodStart, periodEnd) {
  const dailyAttendances = await prisma.dailyAttendance.findMany({
    where: {
      employeeId,
      date: {
        gte: periodStart,
        lte: periodEnd
      },
      isLocked: true // Only use locked attendance
    },
    orderBy: { date: 'asc' }
  })

  const summary = {
    totalDays: dailyAttendances.length,
    presentDays: dailyAttendances.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length,
    absentDays: dailyAttendances.filter(a => a.status === 'ABSENT').length,
    leaveDays: dailyAttendances.filter(a => a.status === 'LEAVE').length,
    halfDays: dailyAttendances.filter(a => a.status === 'HALF_DAY').length,
    totalOvertimeMinutes: dailyAttendances.reduce((sum, a) => sum + a.overtimeMinutes, 0),
    totalOvertimeHours: 0
  }

  summary.totalOvertimeHours = summary.totalOvertimeMinutes / 60

  return {
    records: dailyAttendances,
    summary
  }
}

/**
 * Get leave data for the period
 */
async function getLeaveData(employeeId, periodStart, periodEnd) {
  const leaveRequests = await prisma.leaveRequest.findMany({
    where: {
      employeeId,
      status: 'APPROVED',
      startDate: { lte: periodEnd },
      endDate: { gte: periodStart }
    },
    include: {
      leaveType: true
    }
  })

  let paidLeaveDays = 0
  let unpaidLeaveDays = 0
  const leaveDetails = []

  for (const leave of leaveRequests) {
    // Calculate overlapping days
    const overlapStart = new Date(Math.max(new Date(leave.startDate).getTime(), new Date(periodStart).getTime()))
    const overlapEnd = new Date(Math.min(new Date(leave.endDate).getTime(), new Date(periodEnd).getTime()))
    
    // Count working days in overlap (excluding weekends)
    const days = countWorkingDays(overlapStart, overlapEnd)
    
    if (leave.leaveType.isPaid) {
      paidLeaveDays += days
    } else {
      unpaidLeaveDays += days
    }

    leaveDetails.push({
      leaveType: leave.leaveType.name,
      startDate: leave.startDate instanceof Date ? leave.startDate.toISOString() : leave.startDate,
      endDate: leave.endDate instanceof Date ? leave.endDate.toISOString() : leave.endDate,
      days,
      isPaid: leave.leaveType.isPaid
    })
  }

  // Get leave encashments
  const encashments = await prisma.leaveEncashment.findMany({
    where: {
      employeeId,
      status: 'PROCESSED',
      encashmentDate: {
        gte: periodStart,
        lte: periodEnd
      }
    }
  })

  const encashmentAmount = encashments.reduce((sum, e) => sum + Number(e.totalAmount), 0)

  return {
    leaveRequests,
    paidLeaveDays,
    unpaidLeaveDays,
    leaveDetails,
    encashmentAmount,
    summary: {
      paidLeaveDays,
      unpaidLeaveDays,
      totalLeaveDays: paidLeaveDays + unpaidLeaveDays,
      encashmentAmount: Number(encashmentAmount),
      leaveDetails
    }
  }
}

/**
 * Calculate base salary
 */
function calculateBaseSalary({ employee, salaryStructure, payrollPeriod, attendanceData, leaveData }) {
  // Get base salary from first allowance component (typically basic salary)
  // If no component with "basic" in name, use the first allowance component
  let basicComponent = salaryStructure.salaryComponents.find(c => 
    c.type === 'ALLOWANCE' && c.name.toLowerCase().includes('basic')
  )

  // Fallback to first allowance component if no "basic" found
  if (!basicComponent) {
    basicComponent = salaryStructure.salaryComponents.find(c => c.type === 'ALLOWANCE')
  }

  if (!basicComponent) {
    throw new Error('No allowance component found in salary structure. At least one allowance component is required.')
  }

  let monthlySalary = 0
  if (basicComponent.calculationType === 'FIXED') {
    monthlySalary = Number(basicComponent.amount)
  } else {
    throw new Error('Basic salary must be fixed amount')
  }

  // Calculate pro-rata factor if employee joined mid-period
  let proRataFactor = 1
  let calculation = `Monthly Salary: ${monthlySalary}`

  if (employee.dateOfJoining) {
    const joiningDate = new Date(employee.dateOfJoining)
    const periodStart = new Date(payrollPeriod.periodStart)
    const periodEnd = new Date(payrollPeriod.periodEnd)

    if (joiningDate > periodStart) {
      // Employee joined mid-period
      const totalDays = countWorkingDays(periodStart, periodEnd)
      const daysAfterJoining = countWorkingDays(joiningDate, periodEnd)
      proRataFactor = daysAfterJoining / totalDays
      calculation += `\nPro-rata: Employee joined on ${joiningDate.toISOString().split('T')[0]}`
      calculation += `\nWorking days after joining: ${daysAfterJoining} / ${totalDays} = ${proRataFactor.toFixed(4)}`
    }
  }

  const proRataSalary = monthlySalary * proRataFactor

  // Calculate unpaid leave deduction
  const totalWorkingDays = countWorkingDays(
    new Date(payrollPeriod.periodStart),
    new Date(payrollPeriod.periodEnd)
  )
  const dailySalary = monthlySalary / totalWorkingDays
  const unpaidLeaveDeduction = dailySalary * leaveData.unpaidLeaveDays

  calculation += `\nUnpaid leave days: ${leaveData.unpaidLeaveDays}`
  calculation += `\nDaily salary: ${dailySalary.toFixed(2)}`
  calculation += `\nUnpaid leave deduction: ${unpaidLeaveDeduction.toFixed(2)}`

  const adjustedBaseSalary = Math.max(0, proRataSalary - unpaidLeaveDeduction)

  calculation += `\nAdjusted Base Salary: ${proRataSalary.toFixed(2)} - ${unpaidLeaveDeduction.toFixed(2)} = ${adjustedBaseSalary.toFixed(2)}`

  return {
    monthlySalary,
    proRataFactor,
    proRataSalary,
    dailySalary,
    unpaidLeaveDeduction,
    adjustedBaseSalary,
    calculation
  }
}

/**
 * Calculate allowances
 */
function calculateAllowances({ salaryStructure, baseSalary, attendanceData, leaveData }) {
  const allowanceComponents = salaryStructure.salaryComponents.filter(c => 
    c.type === 'ALLOWANCE' && !c.name.toLowerCase().includes('basic')
  )

  const components = []
  let totalAllowances = 0

  for (const component of allowanceComponents) {
    let amount = 0
    let baseAmount = null

    if (component.calculationType === 'FIXED') {
      amount = Number(component.amount)
    } else if (component.calculationType === 'PERCENTAGE') {
      if (!component.baseComponentId) {
        // Default to base salary
        baseAmount = baseSalary
        amount = (baseSalary * Number(component.amount)) / 100
      } else {
        // Find base component
        const baseComponent = salaryStructure.salaryComponents.find(c => c.id === component.baseComponentId)
        if (baseComponent) {
          baseAmount = Number(baseComponent.amount)
          amount = (baseAmount * Number(component.amount)) / 100
        }
      }
    }

    // Add overtime allowance if applicable
    if (component.name.toLowerCase().includes('overtime')) {
      const overtimeHours = attendanceData.summary.totalOvertimeHours
      const overtimeRate = amount // Use component amount as hourly rate
      amount = overtimeHours * overtimeRate
    }

    // Add leave encashment if applicable
    if (component.name.toLowerCase().includes('encashment')) {
      amount += leaveData.encashmentAmount
    }

    totalAllowances += amount

    components.push({
      name: component.name,
      calculationType: component.calculationType,
      baseAmount,
      amount,
      isTaxable: component.isTaxable,
      priority: component.priority
    })
  }

  return {
    components,
    totalAllowances
  }
}

/**
 * Calculate deductions
 */
async function calculateDeductions({ employeeId, salaryStructure, baseSalary, grossSalary, payrollPeriod, attendanceData }) {
  const deductionComponents = salaryStructure.salaryComponents.filter(c => c.type === 'DEDUCTION')

  const components = []
  let totalDeductions = 0

  for (const component of deductionComponents) {
    let amount = 0
    let baseAmount = null

    if (component.calculationType === 'FIXED') {
      amount = Number(component.amount)
    } else if (component.calculationType === 'PERCENTAGE') {
      if (!component.baseComponentId) {
        // Default to gross salary for deductions
        baseAmount = grossSalary
        amount = (grossSalary * Number(component.amount)) / 100
      } else {
        // Find base component
        const baseComponent = salaryStructure.salaryComponents.find(c => c.id === component.baseComponentId)
        if (baseComponent) {
          baseAmount = Number(baseComponent.amount)
          amount = (baseAmount * Number(component.amount)) / 100
        }
      }
    }

    totalDeductions += amount

    components.push({
      name: component.name,
      calculationType: component.calculationType,
      baseAmount,
      amount,
      priority: component.priority
    })
  }

  // Add loan installments
  const loanDeductions = await getLoanDeductions(employeeId, payrollPeriod.id)
  if (loanDeductions.totalAmount > 0) {
    components.push({
      name: 'Loan Installment',
      calculationType: 'FIXED',
      baseAmount: null,
      amount: loanDeductions.totalAmount,
      priority: 999
    })
    totalDeductions += loanDeductions.totalAmount
  }

  // Add automatic absent-day salary deduction
  const absentDays = Number(attendanceData?.summary?.absentDays || 0)
  if (absentDays > 0) {
    const periodStart = new Date(payrollPeriod.periodStart)
    const periodEnd = new Date(payrollPeriod.periodEnd)
    const totalWorkingDays = Math.max(1, countWorkingDays(periodStart, periodEnd))
    const dailyRate = Number(baseSalary) / totalWorkingDays
    const absentDeduction = dailyRate * absentDays

    components.push({
      name: `Absent Deduction (${absentDays} days)`,
      calculationType: 'FIXED',
      baseAmount: Number(dailyRate),
      amount: absentDeduction,
      priority: 995
    })
    totalDeductions += absentDeduction
  }

  // Add HR manual salary deductions (hardcoded cuts with reason)
  const manualDeductions = await getManualSalaryDeductions(employeeId, payrollPeriod.id)
  if (manualDeductions.totalAmount > 0) {
    for (const item of manualDeductions.items) {
      components.push({
        name: `Manual Deduction: ${item.reason}`,
        calculationType: 'FIXED',
        baseAmount: null,
        amount: item.amount,
        priority: 996
      })
    }
    totalDeductions += manualDeductions.totalAmount
  }

  return {
    components,
    totalDeductions
  }
}

async function getManualSalaryDeductions(employeeId, payrollPeriodId) {
  const logs = await prisma.payrollAuditLog.findMany({
    where: {
      OR: [{ action: 'MANUAL_DEDUCTION' }, { action: 'MANUAL_ADJUSTMENT' }],
      payrollPeriodId,
      employeeId
    },
    orderBy: { createdAt: 'asc' }
  })

  const items = logs
    .map((log) => {
      const details = log.details || {}
      const amount = Number(details.amount || 0)
      const reason = String(details.reason || '').trim()
      const isActive = details.isActive !== false
      const type = String(details.type || 'DEDUCTION').toUpperCase()
      if (!isActive || !reason || !(amount > 0) || type !== 'DEDUCTION') return null
      return { amount, reason }
    })
    .filter(Boolean)

  const totalAmount = items.reduce((sum, item) => sum + Number(item.amount), 0)
  return { items, totalAmount }
}

async function getManualSalaryAdditions(employeeId, payrollPeriodId) {
  const logs = await prisma.payrollAuditLog.findMany({
    where: {
      OR: [{ action: 'MANUAL_ADDITION' }, { action: 'MANUAL_ADJUSTMENT' }],
      payrollPeriodId,
      employeeId
    },
    orderBy: { createdAt: 'asc' }
  })

  const items = logs
    .map((log) => {
      const details = log.details || {}
      const amount = Number(details.amount || 0)
      const reason = String(details.reason || '').trim()
      const isActive = details.isActive !== false
      const type = String(details.type || 'ADDITION').toUpperCase()
      if (!isActive || !reason || !(amount > 0) || type !== 'ADDITION') return null
      return { amount, reason }
    })
    .filter(Boolean)

  const totalAmount = items.reduce((sum, item) => sum + Number(item.amount), 0)
  return { items, totalAmount }
}

/**
 * Get approved bonuses
 */
async function getApprovedBonuses(employeeId, payrollPeriodId) {
  const bonuses = await prisma.bonus.findMany({
    where: {
      employeeId,
      payrollPeriodId,
      status: 'APPROVED'
    }
  })

  const components = bonuses.map(b => ({
    name: b.name,
    calculationType: 'FIXED',
    baseAmount: null,
    amount: Number(b.amount),
    isTaxable: false,
    priority: 0
  }))

  const totalAmount = bonuses.reduce((sum, b) => sum + Number(b.amount), 0)

  return {
    components,
    totalAmount
  }
}

/**
 * Get loan deductions
 */
async function getLoanDeductions(employeeId, payrollPeriodId) {
  const loans = await prisma.loan.findMany({
    where: {
      employeeId,
      status: 'ACTIVE'
    },
    include: {
      installments: {
        where: {
          status: 'PENDING',
          payrollRecordId: null
        },
        orderBy: { installmentNumber: 'asc' },
        take: 1 // One installment per period
      }
    }
  })

  let totalAmount = 0
  const installments = []

  for (const loan of loans) {
    if (loan.installments.length > 0) {
      const installment = loan.installments[0]
      totalAmount += Number(installment.amount)
      installments.push({
        loanId: loan.id,
        loanNumber: loan.loanNumber,
        installmentId: installment.id,
        amount: Number(installment.amount)
      })
    }
  }

  return {
    totalAmount,
    installments
  }
}

/**
 * Count working days (excluding weekends)
 */
function countWorkingDays(startDate, endDate) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  let count = 0
  const current = new Date(start)

  while (current <= end) {
    const dayOfWeek = current.getDay()
    // Exclude weekends (Saturday = 6, Sunday = 0)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++
    }
    current.setDate(current.getDate() + 1)
  }

  return count
}


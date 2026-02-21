/**
 * Payslip Generator
 * 
 * Generates payslip data structure (PDF generation can be added later)
 */

/**
 * Generate payslip data for a payroll record
 * @param {Object} payrollRecord - Payroll record with relations
 * @param {Object} companyInfo - Company information (optional)
 * @returns {Object} Payslip data structure
 */
export function generatePayslipData(payrollRecord, companyInfo = {}) {
  const {
    employee,
    payrollPeriod,
    components,
    grossSalary,
    totalAllowances,
    totalDeductions,
    netSalary,
    calculationBreakdown,
    attendanceSummary,
    leaveSummary
  } = payrollRecord

  // Separate allowances and deductions
  const allowances = components.filter(c => c.componentType === 'ALLOWANCE')
  const deductions = components.filter(c => c.componentType === 'DEDUCTION')

  const payslip = {
    // Header
    company: {
      name: companyInfo.companyName || 'Company Name',
      address: companyInfo.address || '',
      logo: companyInfo.logo || null
    },
    theme: {
      themeColor: companyInfo.themeColor || '#1d4ed8',
      accentColor: companyInfo.accentColor || '#0f172a'
    },
    
    // Employee Information
    employee: {
      name: employee.name,
      employeeId: employee.employeeId,
      department: employee.department || 'N/A',
      designation: employee.designation || 'N/A'
    },

    // Payroll Period
    period: {
      name: payrollPeriod.periodName,
      startDate: payrollPeriod.periodStart,
      endDate: payrollPeriod.periodEnd,
      paymentDate: payrollRecord.paidAt || payrollRecord.finalizedAt || new Date()
    },

    // Earnings (Allowances)
    earnings: {
      items: allowances.map(comp => ({
        name: comp.componentName,
        amount: Number(comp.amount),
        isTaxable: comp.isTaxable
      })),
      total: Number(totalAllowances)
    },

    // Deductions
    deductions: {
      items: deductions.map(comp => ({
        name: comp.componentName,
        amount: Number(comp.amount)
      })),
      total: Number(totalDeductions)
    },

    // Summary
    summary: {
      grossSalary: Number(grossSalary),
      totalEarnings: Number(totalAllowances),
      totalDeductions: Number(totalDeductions),
      netSalary: Number(netSalary)
    },

    // Attendance Summary
    attendance: {
      workingDays: attendanceSummary?.totalDays || 0,
      presentDays: attendanceSummary?.presentDays || 0,
      absentDays: attendanceSummary?.absentDays || 0,
      leaveDays: attendanceSummary?.leaveDays || 0,
      overtimeHours: attendanceSummary?.totalOvertimeHours || 0
    },

    // Leave Summary
    leave: {
      paidLeaveDays: leaveSummary?.paidLeaveDays || 0,
      unpaidLeaveDays: leaveSummary?.unpaidLeaveDays || 0,
      totalLeaveDays: leaveSummary?.totalLeaveDays || 0
    },

    // Metadata
    metadata: {
      generatedAt: new Date(),
      payrollRecordId: payrollRecord.id,
      status: payrollRecord.status
    },
    footerNote: companyInfo.footerNote || 'This is a system-generated payslip.'
  }

  return payslip
}

/**
 * Format payslip as text (for plain text export)
 */
export function formatPayslipAsText(payslipData) {
  const lines = []
  
  lines.push('='.repeat(60))
  lines.push(payslipData.company.name.toUpperCase())
  if (payslipData.company.address) {
    lines.push(payslipData.company.address)
  }
  lines.push('='.repeat(60))
  lines.push('')
  lines.push('PAYSLIP')
  lines.push('')
  lines.push(`Period: ${payslipData.period.name}`)
  lines.push(`Payment Date: ${new Date(payslipData.period.paymentDate).toLocaleDateString()}`)
  lines.push('')
  lines.push('Employee Information:')
  lines.push(`  Name: ${payslipData.employee.name}`)
  lines.push(`  ID: ${payslipData.employee.employeeId}`)
  lines.push(`  Department: ${payslipData.employee.department}`)
  lines.push(`  Designation: ${payslipData.employee.designation}`)
  lines.push('')
  lines.push('-'.repeat(60))
  lines.push('EARNINGS')
  lines.push('-'.repeat(60))
  payslipData.earnings.items.forEach(item => {
    const name = item.name.padEnd(40)
    const amount = item.amount.toFixed(2).padStart(15)
    lines.push(`${name} ${amount}`)
  })
  const earningsTotal = `Total Earnings`.padEnd(40) + ` ${payslipData.earnings.total.toFixed(2).padStart(15)}`
  lines.push(earningsTotal)
  lines.push('')
  lines.push('-'.repeat(60))
  lines.push('DEDUCTIONS')
  lines.push('-'.repeat(60))
  payslipData.deductions.items.forEach(item => {
    const name = item.name.padEnd(40)
    const amount = item.amount.toFixed(2).padStart(15)
    lines.push(`${name} ${amount}`)
  })
  const deductionsTotal = `Total Deductions`.padEnd(40) + ` ${payslipData.deductions.total.toFixed(2).padStart(15)}`
  lines.push(deductionsTotal)
  lines.push('')
  lines.push('='.repeat(60))
  const netSalary = `NET SALARY`.padEnd(40) + ` ${payslipData.summary.netSalary.toFixed(2).padStart(15)}`
  lines.push(netSalary)
  lines.push('='.repeat(60))
  lines.push('')
  lines.push('Attendance Summary:')
  lines.push(`  Working Days: ${payslipData.attendance.workingDays}`)
  lines.push(`  Present Days: ${payslipData.attendance.presentDays}`)
  lines.push(`  Absent Days: ${payslipData.attendance.absentDays}`)
  lines.push(`  Leave Days: ${payslipData.attendance.leaveDays}`)
  lines.push(`  Overtime Hours: ${payslipData.attendance.overtimeHours.toFixed(2)}`)
  lines.push('')
  lines.push('Generated: ' + new Date().toLocaleString())
  lines.push(payslipData.footerNote || 'This is a system-generated payslip.')

  return lines.join('\n')
}


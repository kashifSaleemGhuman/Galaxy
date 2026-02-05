# Payroll Management System - Quick Start Guide

## Overview

The Payroll Management System is a complete, enterprise-grade solution for managing employee payroll. It integrates seamlessly with the Attendance and Leave modules.

## Prerequisites

1. **Database Migration**: Run the migration to create payroll tables
   ```bash
   npx prisma migrate dev
   ```

2. **Attendance Data**: Ensure attendance records exist and are locked for the payroll period

3. **Leave Data**: Approved leave requests are automatically considered

## Workflow

### Step 1: Create Salary Structure

First, create a salary structure for each employee:

```bash
POST /api/hrm/payroll/salary-structures
Content-Type: application/json

{
  "employeeId": "emp_123",
  "effectiveFrom": "2024-01-01",
  "components": [
    {
      "name": "Basic Salary",
      "type": "ALLOWANCE",
      "calculationType": "FIXED",
      "amount": 50000,
      "priority": 0
    },
    {
      "name": "House Allowance",
      "type": "ALLOWANCE",
      "calculationType": "PERCENTAGE",
      "amount": 20,
      "baseComponentId": null, // Will use base salary
      "isTaxable": true,
      "priority": 1
    },
    {
      "name": "Tax Deduction",
      "type": "DEDUCTION",
      "calculationType": "PERCENTAGE",
      "amount": 5,
      "priority": 0
    }
  ]
}
```

### Step 2: Create Payroll Period

Create a payroll period (typically monthly):

```bash
POST /api/hrm/payroll/periods
Content-Type: application/json

{
  "periodName": "January 2024",
  "periodStart": "2024-01-01",
  "periodEnd": "2024-01-31",
  "notes": "Monthly payroll for January"
}
```

### Step 3: Lock Attendance

Before generating payroll, lock attendance for the period:

```bash
POST /api/hrm/payroll/periods/{periodId}/lock-attendance
```

This ensures attendance data cannot be modified during payroll processing.

### Step 4: Generate Payroll

Generate payroll for all employees or specific employees:

```bash
POST /api/hrm/payroll/generate
Content-Type: application/json

{
  "payrollPeriodId": "period_123",
  "employeeIds": ["emp_1", "emp_2"] // Optional: omit for all employees
}
```

The system will:
- Calculate base salary (with pro-rata if needed)
- Apply allowances
- Apply deductions
- Include approved bonuses
- Deduct loan installments
- Consider attendance and leave data

### Step 5: Review Payroll Records

View generated payroll records:

```bash
GET /api/hrm/payroll/records?payrollPeriodId={periodId}
```

Each record includes:
- Complete calculation breakdown
- Attendance summary
- Leave summary
- All components (allowances/deductions)

### Step 6: Finalize Payroll

Once reviewed and approved, finalize the payroll period:

```bash
POST /api/hrm/payroll/periods/{periodId}/finalize
```

This:
- Marks all records as FINALIZED
- Makes records immutable
- Prevents further modifications

### Step 7: Mark as Paid

After payment is made:

```bash
POST /api/hrm/payroll/periods/{periodId}/mark-paid
```

### Step 8: Generate Payslips

Employees can download their payslips:

```bash
GET /api/hrm/payroll/payslips/{recordId}
GET /api/hrm/payroll/payslips/{recordId}?format=text
```

## API Endpoints Reference

### Salary Structures
- `GET /api/hrm/payroll/salary-structures` - List all structures
- `GET /api/hrm/payroll/salary-structures?employeeId={id}` - Get employee's structures
- `POST /api/hrm/payroll/salary-structures` - Create structure
- `GET /api/hrm/payroll/salary-structures/:id` - Get structure
- `PUT /api/hrm/payroll/salary-structures/:id` - Update structure
- `DELETE /api/hrm/payroll/salary-structures/:id` - Delete structure

### Payroll Periods
- `GET /api/hrm/payroll/periods` - List periods
- `POST /api/hrm/payroll/periods` - Create period
- `GET /api/hrm/payroll/periods/:id` - Get period
- `PUT /api/hrm/payroll/periods/:id` - Update period
- `POST /api/hrm/payroll/periods/:id/lock-attendance` - Lock attendance
- `POST /api/hrm/payroll/periods/:id/finalize` - Finalize period
- `POST /api/hrm/payroll/periods/:id/mark-paid` - Mark as paid
- `GET /api/hrm/payroll/periods/:id/summary` - Get summary

### Payroll Generation
- `POST /api/hrm/payroll/generate` - Generate payroll

### Payroll Records
- `GET /api/hrm/payroll/records` - List records
- `GET /api/hrm/payroll/records?employeeId={id}` - Filter by employee
- `GET /api/hrm/payroll/records?payrollPeriodId={id}` - Filter by period
- `GET /api/hrm/payroll/records/:id` - Get record
- `GET /api/hrm/payroll/records/employee/:employeeId` - Employee history

### Payslips
- `GET /api/hrm/payroll/payslips/:recordId` - Get payslip (JSON)
- `GET /api/hrm/payroll/payslips/:recordId?format=text` - Get payslip (text)

### Bonuses
- `GET /api/hrm/payroll/bonuses` - List bonuses
- `POST /api/hrm/payroll/bonuses` - Create bonus
- `POST /api/hrm/payroll/bonuses/:id/approve` - Approve bonus

### Loans
- `GET /api/hrm/payroll/loans` - List loans
- `POST /api/hrm/payroll/loans` - Create loan

## Calculation Logic

### Base Salary
- Monthly salary from salary structure
- Pro-rata calculation if employee joined mid-period
- Deduction for unpaid leave days

### Allowances
- Fixed: Direct amount
- Percentage: Calculated from base component
- Overtime: Based on overtime hours
- Leave encashment: Added if applicable

### Deductions
- Fixed: Direct amount
- Percentage: Calculated from base (usually gross salary)
- Tax: Percentage-based (if configured)
- Loans: Automatic installment deduction

### Final Calculation
```
Gross Salary = Base Salary + Allowances + Bonuses
Net Salary = Gross Salary - Deductions
```

## Permissions

### HR Permissions
- Full access to all payroll operations
- Can create, modify, finalize payroll
- Can view all employee payroll records

### Employee Permissions
- Can view own payroll history
- Can download own payslips
- Cannot modify any payroll data

## Important Notes

1. **Immutability**: Once finalized, payroll records cannot be modified
2. **Attendance Lock**: Attendance must be locked before payroll generation
3. **Versioning**: Salary structure changes create new versions
4. **Audit Trail**: All actions are logged in PayrollAuditLog
5. **Deterministic**: Calculations are reproducible with stored breakdowns

## Error Handling

Common errors and solutions:

- **"Attendance must be locked"**: Lock attendance before generating payroll
- **"No active salary structure"**: Create salary structure for employee
- **"Period overlaps"**: Check existing periods
- **"Cannot modify finalized payroll"**: Create adjustment period instead

## Example: Complete Payroll Cycle

```javascript
// 1. Create salary structure
const structure = await fetch('/api/hrm/payroll/salary-structures', {
  method: 'POST',
  body: JSON.stringify({
    employeeId: 'emp_123',
    effectiveFrom: '2024-01-01',
    components: [/* ... */]
  })
})

// 2. Create period
const period = await fetch('/api/hrm/payroll/periods', {
  method: 'POST',
  body: JSON.stringify({
    periodName: 'January 2024',
    periodStart: '2024-01-01',
    periodEnd: '2024-01-31'
  })
})

// 3. Lock attendance
await fetch(`/api/hrm/payroll/periods/${period.id}/lock-attendance`, {
  method: 'POST'
})

// 4. Generate payroll
const result = await fetch('/api/hrm/payroll/generate', {
  method: 'POST',
  body: JSON.stringify({
    payrollPeriodId: period.id
  })
})

// 5. Review records
const records = await fetch(`/api/hrm/payroll/records?payrollPeriodId=${period.id}`)

// 6. Finalize
await fetch(`/api/hrm/payroll/periods/${period.id}/finalize`, {
  method: 'POST'
})

// 7. Mark as paid
await fetch(`/api/hrm/payroll/periods/${period.id}/mark-paid`, {
  method: 'POST'
})
```

## Support

For issues or questions, refer to:
- `PAYROLL_MANAGEMENT_SYSTEM_DESIGN.md` - Complete design documentation
- `PAYROLL_SYSTEM_IMPLEMENTATION_STATUS.md` - Implementation status


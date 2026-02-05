# Payroll Management System Design Document

## Overview

This document describes the enterprise-grade Payroll Management system for the HRMS. The system is designed to be deterministic, auditable, policy-driven, and fully integrated with attendance and leave modules.

## Core Principles

1. **Deterministic Calculations**: Payroll calculations must be reproducible and deterministic
2. **Immutability**: Generated payroll records must never be modified once finalized
3. **Auditability**: All payroll calculations must be auditable with complete traceability
4. **Data Integrity**: Payroll must rely only on approved attendance and leave data
5. **Configurability**: Payroll logic must be configurable, not hardcoded
6. **Versioning**: Salary structure changes must be versioned and effective-date based

## Data Model

### 1. SalaryStructure
Defines employee salary structure with versioning support.

**Fields:**
- `id`: Unique identifier (CUID)
- `employeeId`: Reference to Employee
- `effectiveFrom`: Date when structure becomes effective
- `effectiveTo`: Date when structure ends (null for current)
- `isActive`: Whether this structure is currently active
- `createdAt`, `updatedAt`: Timestamps
- `createdBy`: User who created the structure

**Business Rules:**
- Only one active salary structure per employee at a time
- Structure changes create new version (old one marked inactive)
- Effective dates prevent overlap
- Cannot delete structures with historical payroll records

### 2. SalaryComponent
Defines individual salary components (allowances/deductions) within a structure.

**Fields:**
- `id`: Unique identifier (CUID)
- `salaryStructureId`: Reference to SalaryStructure
- `name`: Component name (e.g., "House Allowance", "Tax Deduction")
- `type`: ALLOWANCE or DEDUCTION
- `calculationType`: FIXED or PERCENTAGE
- `amount`: Fixed amount or percentage value
- `baseComponentId`: For percentage-based, reference to base component
- `isTaxable`: Whether component is taxable (for allowances)
- `priority`: Calculation order (lower = earlier)
- `isActive`: Whether component is active
- `createdAt`, `updatedAt`: Timestamps

**Business Rules:**
- Components are calculated in priority order
- Percentage-based components reference a base component
- Taxable status only applies to allowances
- Components can be enabled/disabled without deleting

### 3. PayrollPeriod
Defines payroll processing periods (typically monthly).

**Fields:**
- `id`: Unique identifier (CUID)
- `periodName`: Human-readable name (e.g., "January 2024")
- `periodStart`: Period start date
- `periodEnd`: Period end date
- `status`: DRAFT, FINALIZED, PAID
- `finalizedAt`: When period was finalized
- `finalizedBy`: User who finalized
- `paidAt`: When payroll was paid
- `paidBy`: User who marked as paid
- `notes`: Optional notes
- `createdAt`, `updatedAt`: Timestamps
- `createdBy`: User who created the period

**Business Rules:**
- Periods cannot overlap
- Once finalized, period cannot be modified
- Only DRAFT periods can be regenerated
- FINALIZED periods are locked for attendance/leave changes

### 4. PayrollRecord
Immutable payroll record per employee per period. **Never modified once finalized.**

**Fields:**
- `id`: Unique identifier (CUID)
- `employeeId`: Reference to Employee
- `payrollPeriodId`: Reference to PayrollPeriod
- `salaryStructureId`: Reference to SalaryStructure used
- `status`: GENERATED, FINALIZED, PAID
- `calculationDate`: When calculation was performed
- `calculatedBy`: User who calculated
- `finalizedAt`: When record was finalized
- `finalizedBy`: User who finalized
- `paidAt`: When payment was made
- `paidBy`: User who marked as paid
- `grossSalary`: Total gross salary
- `totalAllowances`: Sum of all allowances
- `totalDeductions`: Sum of all deductions
- `netSalary`: Final net salary (gross - deductions)
- `calculationBreakdown`: JSON field storing detailed calculation steps
- `attendanceSummary`: JSON field storing attendance data used
- `leaveSummary`: JSON field storing leave data used
- `notes`: Optional notes
- `createdAt`, `updatedAt`: Timestamps

**Business Rules:**
- One record per employee per period
- Cannot be modified once status is FINALIZED
- Calculation breakdown preserves all steps for audit
- Records are never deleted

### 5. PayrollComponent
Breakdown of individual components in a payroll record.

**Fields:**
- `id`: Unique identifier (CUID)
- `payrollRecordId`: Reference to PayrollRecord
- `componentName`: Name of the component
- `componentType`: ALLOWANCE or DEDUCTION
- `calculationType`: FIXED or PERCENTAGE
- `baseAmount`: Base amount used for percentage calculation
- `amount`: Final calculated amount
- `isTaxable`: Whether component is taxable
- `priority`: Calculation order
- `createdAt`: Timestamp

**Business Rules:**
- One record per component per payroll record
- Preserves exact calculation for audit
- Components are never modified

### 6. Bonus
One-time or recurring bonuses assigned to employees.

**Fields:**
- `id`: Unique identifier (CUID)
- `employeeId`: Reference to Employee
- `payrollPeriodId`: Reference to PayrollPeriod (null if not yet assigned)
- `name`: Bonus name/description
- `amount`: Bonus amount
- `type`: ONE_TIME or RECURRING
- `status`: PENDING, APPROVED, PAID, CANCELLED
- `approvedBy`: User who approved
- `approvedAt`: Approval timestamp
- `notes`: Optional notes
- `createdAt`, `updatedAt`: Timestamps
- `createdBy`: User who created

**Business Rules:**
- Bonuses must be approved before inclusion in payroll
- Only APPROVED bonuses are included in payroll calculation
- Bonus history is preserved for audit

### 7. Loan
Employee loans with installment tracking.

**Fields:**
- `id`: Unique identifier (CUID)
- `employeeId`: Reference to Employee
- `loanNumber`: Unique loan number
- `principalAmount`: Total loan amount
- `interestRate`: Interest rate (if applicable)
- `totalAmount`: Principal + interest
- `installmentAmount`: Monthly installment amount
- `totalInstallments`: Total number of installments
- `remainingInstallments`: Remaining installments
- `status`: ACTIVE, COMPLETED, CANCELLED
- `startDate`: Loan start date
- `endDate`: Expected completion date
- `notes`: Optional notes
- `createdAt`, `updatedAt`: Timestamps
- `createdBy`: User who created

**Business Rules:**
- Loans are tracked with installments
- Only ACTIVE loans are included in payroll deductions
- Installments are automatically deducted until completed

### 8. LoanInstallment
Individual loan installment records.

**Fields:**
- `id`: Unique identifier (CUID)
- `loanId`: Reference to Loan
- `payrollRecordId`: Reference to PayrollRecord (when deducted)
- `installmentNumber`: Installment sequence number
- `amount`: Installment amount
- `status`: PENDING, DEDUCTED, SKIPPED
- `dueDate`: Installment due date
- `deductedAt`: When deducted from payroll
- `createdAt`, `updatedAt`: Timestamps

**Business Rules:**
- One installment per loan per payroll period
- Installments are automatically created when loan is active
- Status tracks deduction status

### 9. PayrollAuditLog
Audit trail for all payroll actions.

**Fields:**
- `id`: Unique identifier (CUID)
- `action`: Action type (CALCULATED, FINALIZED, PAID, REGENERATED, etc.)
- `payrollRecordId`: Reference to PayrollRecord (if applicable)
- `payrollPeriodId`: Reference to PayrollPeriod (if applicable)
- `employeeId`: Reference to Employee (if applicable)
- `userId`: User who performed the action
- `details`: JSON field with action details
- `ipAddress`: IP address of user
- `userAgent`: User agent string
- `createdAt`: Timestamp

**Business Rules:**
- All payroll actions are logged
- Logs are never deleted
- Logs provide complete audit trail

## Payroll Calculation Logic

### Calculation Flow

1. **Get Employee Data**
   - Fetch active salary structure for the period
   - Get employee joining date (for pro-rata calculation)

2. **Get Attendance Data**
   - Fetch locked DailyAttendance records for the period
   - Calculate:
     - Total working days
     - Present days
     - Absent days
     - Leave days (from approved leave requests)
     - Overtime minutes

3. **Get Leave Data**
   - Fetch approved LeaveRequest records for the period
   - Separate paid and unpaid leave
   - Calculate leave encashment (if applicable)

4. **Calculate Base Salary**
   - Monthly salary from salary structure
   - Pro-rata calculation if employee joined mid-period
   - Adjust for unpaid leave days

5. **Calculate Allowances**
   - Process allowances in priority order
   - Fixed allowances: Add directly
   - Percentage allowances: Calculate from base component
   - Apply taxable/non-taxable flags

6. **Calculate Deductions**
   - Process deductions in priority order
   - Fixed deductions: Subtract directly
   - Percentage deductions: Calculate from base component
   - Tax calculations (if applicable)
   - Loan installments
   - Other statutory deductions

7. **Add Bonuses**
   - Include approved bonuses for the period

8. **Calculate Final Amounts**
   - Gross Salary = Base + Allowances + Bonuses
   - Total Deductions = Sum of all deductions
   - Net Salary = Gross - Deductions

9. **Store Calculation Breakdown**
   - Save all calculation steps in JSON format
   - Preserve attendance and leave summaries
   - Store for audit and explanation

### Pro-Rata Calculation

For employees joining mid-period:
```
Pro-rata Factor = (Days in period after joining) / (Total days in period)
Adjusted Base Salary = Base Salary × Pro-rata Factor
```

### Unpaid Leave Deduction

```
Daily Salary = Base Salary / Total Working Days in Period
Deduction = Daily Salary × Unpaid Leave Days
```

### Overtime Calculation

```
Overtime Hours = Overtime Minutes / 60
Overtime Rate = (Base Salary / (Working Days × Hours per Day)) × Overtime Multiplier
Overtime Amount = Overtime Hours × Overtime Rate
```

## Integration with Attendance

### Attendance Locking

1. Before payroll generation, attendance must be locked for the period
2. Locking prevents further modifications to DailyAttendance records
3. Locked attendance is used for payroll calculation
4. Once payroll is finalized, attendance lock cannot be removed

### Attendance Data Used

- `DailyAttendance.status`: PRESENT, ABSENT, LEAVE, LATE, HALF_DAY
- `DailyAttendance.workedMinutes`: For overtime calculation
- `DailyAttendance.overtimeMinutes`: Direct overtime data
- Only locked attendance records are used

## Integration with Leave

### Leave Data Used

1. **Approved Leave Requests**
   - Only `status = 'APPROVED'` leave requests are considered
   - Leave dates must fall within payroll period

2. **Paid vs Unpaid Leave**
   - `LeaveType.isPaid = true`: No salary deduction
   - `LeaveType.isPaid = false`: Salary deduction applies

3. **Leave Encashment**
   - `LeaveEncashment` records with `status = 'PROCESSED'`
   - Added as allowance in payroll

### Leave Calculation

```
For each approved leave request:
  If leaveType.isPaid:
    No deduction
  Else:
    Daily Salary = Base Salary / Total Working Days
    Deduction += Daily Salary × Leave Days
```

## Payroll Period Workflow

### 1. Create Period
- HR creates a new payroll period
- Status: DRAFT
- Period dates are validated (no overlap)

### 2. Lock Attendance
- HR locks attendance for the period
- DailyAttendance records are marked as locked
- AttendanceLock record is created

### 3. Generate Payroll
- System generates PayrollRecord for each active employee
- Status: GENERATED
- Calculations are performed
- Records can be reviewed and modified

### 4. Finalize Payroll
- HR reviews and finalizes payroll
- Status: FINALIZED
- Records become immutable
- Attendance lock cannot be removed
- Payslips can be generated

### 5. Mark as Paid
- After payment, HR marks period as PAID
- PayrollRecord status: PAID
- Payment date is recorded

## Payslip Generation

### Payslip Content

1. **Employee Information**
   - Name, Employee ID, Department
   - Payroll Period

2. **Salary Breakdown**
   - Base Salary
   - Allowances (with taxable/non-taxable flags)
   - Bonuses
   - Gross Salary

3. **Deductions**
   - Tax
   - Loans
   - Provident Fund
   - Other deductions
   - Total Deductions

4. **Summary**
   - Net Salary
   - Payment date
   - Payment method (if applicable)

5. **Attendance Summary**
   - Working days
   - Present days
   - Leave days
   - Absent days
   - Overtime hours

### Payslip Format

- PDF format for download
- Printable format
- Company branding
- Digital signature (optional)

## Edge Cases

### 1. Employee Joining Mid-Period
- Pro-rata calculation for base salary
- Attendance only from joining date
- Leave balance prorated

### 2. Salary Change During Period
- Use salary structure effective during the period
- Pro-rata calculation for each structure version
- Combine calculations

### 3. Leave Without Pay
- Deduct daily salary for each unpaid leave day
- Track in calculation breakdown

### 4. Retroactive Payroll Adjustments
- Create new payroll period for adjustments
- Link to original period
- Clearly marked as adjustment

### 5. Payroll Regeneration
- Only allowed for DRAFT periods
- Delete existing GENERATED records
- Regenerate with latest data

### 6. Attendance Corrections After Generation
- If period is DRAFT: Allow regeneration
- If period is FINALIZED: Create adjustment period

## Security & Permissions

### HR Permissions
- `hr.payroll.read`: View payroll records
- `hr.payroll.write`: Create/modify salary structures
- `hr.payroll.generate`: Generate payroll
- `hr.payroll.finalize`: Finalize payroll periods
- `hr.payroll.approve`: Approve bonuses

### Employee Permissions
- `employee.payroll.view`: View own payroll history
- `employee.payslip.download`: Download own payslips

### Restrictions
- Employees cannot view other employees' payroll
- Only HR can modify salary structures
- Only HR can finalize payroll
- Finalized payroll cannot be modified

## Audit & Compliance

### Audit Requirements

1. **Calculation Audit**
   - Every calculation step is logged
   - Calculation breakdown is preserved
   - Attendance and leave data snapshots are stored

2. **Action Audit**
   - All payroll actions are logged in PayrollAuditLog
   - User, timestamp, and details are recorded

3. **Change Audit**
   - Salary structure changes are versioned
   - Historical structures are preserved
   - Effective dates track changes

### Compliance Features

- Immutable finalized records
- Complete audit trail
- Data retention policies
- Export capabilities for accounting systems

## API Endpoints

### Salary Structure Management
- `GET /api/hrm/payroll/salary-structures` - List salary structures
- `POST /api/hrm/payroll/salary-structures` - Create salary structure
- `GET /api/hrm/payroll/salary-structures/:id` - Get salary structure
- `PUT /api/hrm/payroll/salary-structures/:id` - Update salary structure
- `DELETE /api/hrm/payroll/salary-structures/:id` - Delete salary structure

### Payroll Period Management
- `GET /api/hrm/payroll/periods` - List payroll periods
- `POST /api/hrm/payroll/periods` - Create payroll period
- `GET /api/hrm/payroll/periods/:id` - Get payroll period
- `PUT /api/hrm/payroll/periods/:id` - Update payroll period
- `POST /api/hrm/payroll/periods/:id/finalize` - Finalize period
- `POST /api/hrm/payroll/periods/:id/mark-paid` - Mark as paid

### Payroll Generation
- `POST /api/hrm/payroll/generate` - Generate payroll for period
- `GET /api/hrm/payroll/records` - List payroll records
- `GET /api/hrm/payroll/records/:id` - Get payroll record
- `GET /api/hrm/payroll/records/employee/:employeeId` - Get employee payroll history

### Payslip
- `GET /api/hrm/payroll/payslips/:recordId` - Generate payslip PDF
- `GET /api/hrm/payroll/payslips/:recordId/download` - Download payslip

### Bonuses
- `GET /api/hrm/payroll/bonuses` - List bonuses
- `POST /api/hrm/payroll/bonuses` - Create bonus
- `PUT /api/hrm/payroll/bonuses/:id` - Update bonus
- `POST /api/hrm/payroll/bonuses/:id/approve` - Approve bonus

### Loans
- `GET /api/hrm/payroll/loans` - List loans
- `POST /api/hrm/payroll/loans` - Create loan
- `GET /api/hrm/payroll/loans/:id` - Get loan
- `PUT /api/hrm/payroll/loans/:id` - Update loan

## Database Relationships

```
Employee
  ├── SalaryStructure (one-to-many, versioned)
  │     └── SalaryComponent (one-to-many)
  ├── PayrollRecord (one-to-many)
  │     └── PayrollComponent (one-to-many)
  ├── Bonus (one-to-many)
  └── Loan (one-to-many)
        └── LoanInstallment (one-to-many)

PayrollPeriod
  ├── PayrollRecord (one-to-many)
  └── Bonus (one-to-many)

DailyAttendance (locked for period)
  └── Used in PayrollRecord.attendanceSummary

LeaveRequest (approved)
  └── Used in PayrollRecord.leaveSummary
```

## Implementation Phases

### Phase 1: Core Models & Schema
- [x] Design document
- [ ] Database schema (Prisma models)
- [ ] Migration file

### Phase 2: Salary Structure Management
- [ ] Salary structure CRUD APIs
- [ ] Salary component management
- [ ] Versioning logic

### Phase 3: Payroll Calculation Engine
- [ ] Payroll calculator core logic
- [ ] Attendance integration
- [ ] Leave integration
- [ ] Pro-rata calculations
- [ ] Overtime calculations

### Phase 4: Payroll Period Management
- [ ] Period CRUD APIs
- [ ] Attendance locking integration
- [ ] Payroll generation API
- [ ] Finalization workflow

### Phase 5: Payslip Generation
- [ ] Payslip template
- [ ] PDF generation
- [ ] Download functionality

### Phase 6: Bonuses & Loans
- [ ] Bonus management APIs
- [ ] Loan management APIs
- [ ] Installment tracking
- [ ] Integration with payroll calculation

### Phase 7: Audit & Reporting
- [ ] Audit logging
- [ ] Payroll reports
- [ ] Export functionality


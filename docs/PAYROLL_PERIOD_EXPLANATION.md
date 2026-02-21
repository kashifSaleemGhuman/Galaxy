# Payroll Period - Complete Explanation & Testing Guide

## What is a Payroll Period?

A **Payroll Period** is a time frame (typically monthly) for which payroll is calculated and processed. It represents a specific date range during which employee attendance, leave, and work hours are tracked and used to calculate salaries.

### Key Characteristics:

1. **Time Range**: Defined by `periodStart` and `periodEnd` dates
2. **Status Lifecycle**: 
   - **DRAFT** → **FINALIZED** → **PAID**
3. **Immutability**: Once finalized, payroll records cannot be modified
4. **Attendance Lock**: Attendance must be locked before payroll generation
5. **No Overlap**: Periods cannot overlap with each other

### Example:
- **Period Name**: "January 2024"
- **Start Date**: 2024-01-01
- **End Date**: 2024-01-31
- **Status**: DRAFT (initially)

---

## Complete Payroll Flow - Step by Step

### Prerequisites

Before starting, ensure you have:
1. ✅ At least one employee with a user account
2. ✅ Employee has a salary structure defined
3. ✅ Attendance records exist for the period
4. ✅ (Optional) Leave requests approved

---

## Step-by-Step Testing Flow

### Step 1: Create Salary Structure

**Purpose**: Define how much each employee earns and what components make up their salary.

**Location**: `/dashboard/hrm/payroll/salary-structures`

**Steps**:
1. Navigate to Salary Structures page
2. Click "New Structure"
3. Select an employee
4. Set effective date (e.g., "2024-01-01")
5. Add components:
   - **Basic Salary** (ALLOWANCE, FIXED, e.g., 50,000 PKR)
   - **House Allowance** (ALLOWANCE, PERCENTAGE, 20% of Basic)
   - **Tax Deduction** (DEDUCTION, PERCENTAGE, 5% of Gross)
6. Save

**Expected Result**: 
- ✅ Structure created
- ✅ Employee now has an active salary structure

---

### Step 2: Create Payroll Period

**Purpose**: Define the time period for payroll processing.

**Location**: `/dashboard/hrm/payroll` → Click "New Period"

**Steps**:
1. Click "New Period" button
2. Fill in:
   - **Period Name**: "January 2024" (or any descriptive name)
   - **Start Date**: 2024-01-01
   - **End Date**: 2024-01-31
   - **Notes**: (Optional) "Monthly payroll for January"
3. Click "Create"

**Expected Result**:
- ✅ Period created with status **DRAFT**
- ✅ Appears in periods list
- ✅ Can view period details

**Important**: 
- Periods cannot overlap
- Start date must be before end date

---

### Step 3: Ensure Attendance Data Exists

**Purpose**: Payroll calculation needs attendance data.

**Steps**:
1. Employees should have checked in/out during the period
2. Or manually create attendance records if testing
3. Verify attendance records exist for the period dates

**Check**: Go to `/dashboard/hrm/attendance` and verify records exist

---

### Step 4: Lock Attendance

**Purpose**: Prevent modifications to attendance data during payroll processing.

**Location**: `/dashboard/hrm/payroll/periods/[id]` → Click "Lock Attendance"

**Steps**:
1. Open the payroll period you created
2. Click "Lock Attendance" button
3. Confirm the action

**Expected Result**:
- ✅ Attendance locked successfully
- ✅ `DailyAttendance` records marked as `isLocked = true`
- ✅ `AttendanceLock` record created
- ✅ Attendance cannot be modified for this period

**Important**: 
- ⚠️ This action cannot be undone easily
- ⚠️ Must be done before generating payroll

---

### Step 5: Generate Payroll

**Purpose**: Calculate and create payroll records for all employees.

**Location**: `/dashboard/hrm/payroll/periods/[id]` → Click "Generate Payroll"

**Steps**:
1. In the period details page
2. Click "Generate Payroll" button
3. Confirm the action
4. Wait for processing (may take a moment for many employees)

**What Happens**:
- System calculates payroll for each employee with:
  - Base salary (pro-rata if joined mid-period)
  - Allowances (fixed and percentage-based)
  - Deductions (tax, loans, unpaid leave)
  - Overtime (if applicable)
  - Bonuses (if approved)
- Creates `PayrollRecord` for each employee
- Status: **GENERATED**

**Expected Result**:
- ✅ Payroll records created for all employees
- ✅ Each record shows:
  - Gross Salary
  - Total Allowances
  - Total Deductions
  - Net Salary
- ✅ Records appear in the period details page

**Calculation Includes**:
- ✅ Attendance data (present days, late days, overtime)
- ✅ Leave data (paid/unpaid leave deductions)
- ✅ Salary structure components
- ✅ Loan installments
- ✅ Approved bonuses

---

### Step 6: Review Payroll Records

**Purpose**: Verify calculations are correct before finalizing.

**Location**: `/dashboard/hrm/payroll/periods/[id]`

**Steps**:
1. View the payroll records table
2. Click on a record to see details
3. Review:
   - Calculation breakdown
   - Attendance summary
   - Leave summary
   - Components (allowances/deductions)

**Expected Result**:
- ✅ All records visible
- ✅ Calculations look correct
- ✅ Breakdown shows all components
- ✅ Attendance and leave data included

**If Issues Found**:
- You can regenerate payroll (only if status is DRAFT)
- Or create manual adjustments via "Manual Adjustments" page

---

### Step 7: Finalize Payroll

**Purpose**: Lock payroll records permanently (cannot be modified after this).

**Location**: `/dashboard/hrm/payroll/periods/[id]` → Click "Finalize"

**Steps**:
1. Review all records carefully
2. Click "Finalize" button
3. Confirm the action

**Expected Result**:
- ✅ Period status changes to **FINALIZED**
- ✅ All payroll records status changes to **FINALIZED**
- ✅ Records become **immutable** (cannot be modified)
- ✅ Audit logs created
- ✅ Payslips can now be generated

**Important**: 
- ⚠️ **This action cannot be undone**
- ⚠️ Make sure all calculations are correct before finalizing

---

### Step 8: Mark as Paid

**Purpose**: Record that employees have been paid.

**Location**: `/dashboard/hrm/payroll/periods/[id]` → Click "Mark as Paid"

**Steps**:
1. After actual payment to employees
2. Click "Mark as Paid" button
3. Confirm

**Expected Result**:
- ✅ Period status changes to **PAID**
- ✅ All records status changes to **PAID**
- ✅ Payment date recorded
- ✅ `paidAt` and `paidBy` fields updated

---

### Step 9: Generate Payslips (Optional)

**Purpose**: Create payslip documents for employees.

**Location**: Individual payroll record page

**Steps**:
1. Open a finalized/paid payroll record
2. Click "Download Payslip"
3. Payslip downloads as text file

**Expected Result**:
- ✅ Payslip contains all payroll information
- ✅ Formatted correctly
- ✅ Can be printed or shared with employee

---

## Employee Side Testing

### View My Payroll

**Location**: `/dashboard/hrm/my-payroll`

**Steps**:
1. Login as employee (USER role)
2. Navigate to "My Payroll"
3. View payroll history

**Expected Result**:
- ✅ Only employee's own records visible
- ✅ Shows all periods
- ✅ Gross, deductions, net shown
- ✅ Status indicators visible

### View Payroll Details

**Steps**:
1. Click on a payroll record
2. View complete breakdown

**Expected Result**:
- ✅ Complete breakdown visible
- ✅ Allowances listed
- ✅ Deductions listed
- ✅ Attendance summary
- ✅ Leave summary
- ✅ Cannot see other employees' data

### Download Payslip

**Steps**:
1. Open a finalized/paid record
2. Click "Download Payslip"

**Expected Result**:
- ✅ Payslip downloads
- ✅ Contains employee's payroll info

---

## Complete Testing Checklist

### HR Side
- [ ] Create salary structure for employee
- [ ] Create payroll period
- [ ] Lock attendance for period
- [ ] Generate payroll
- [ ] Review payroll records
- [ ] Verify calculations
- [ ] Finalize payroll
- [ ] Mark as paid
- [ ] Download payslip

### Employee Side
- [ ] View my payroll list
- [ ] View payroll details
- [ ] Download payslip
- [ ] Verify access control (cannot see others)

### Edge Cases
- [ ] Test with no attendance data
- [ ] Test with unpaid leave
- [ ] Test with paid leave
- [ ] Test with overtime
- [ ] Test with loan deductions
- [ ] Test with bonuses
- [ ] Test mid-period joining (pro-rata)

---

## Common Issues & Solutions

### Issue: "No active salary structure"
**Solution**: Create salary structure for the employee first

### Issue: "Attendance must be locked"
**Solution**: Lock attendance before generating payroll

### Issue: "Period overlaps with existing period"
**Solution**: Check existing periods, adjust dates to avoid overlap

### Issue: "Cannot modify finalized payroll"
**Solution**: 
- Create a new adjustment period, OR
- Use "Manual Adjustments" feature for next period

### Issue: Employee cannot see payroll
**Solution**: 
- Verify employee has user account linked
- Verify payroll records exist
- Check employee ID matches

---

## API Endpoints Reference

### Periods
- `GET /api/hrm/payroll/periods` - List all periods
- `POST /api/hrm/payroll/periods` - Create period
- `GET /api/hrm/payroll/periods/[id]` - Get period details
- `POST /api/hrm/payroll/periods/[id]/lock-attendance` - Lock attendance
- `POST /api/hrm/payroll/periods/[id]/finalize` - Finalize period
- `POST /api/hrm/payroll/periods/[id]/mark-paid` - Mark as paid

### Generation
- `POST /api/hrm/payroll/generate` - Generate payroll

### Records
- `GET /api/hrm/payroll/records` - List records (HR sees all, employees see own)
- `GET /api/hrm/payroll/records/[id]` - Get record details

---

## Quick Test Script

For quick testing, you can use this flow:

1. **Create Employee** (if not exists)
2. **Create Salary Structure** for employee
3. **Create Payroll Period** (e.g., current month)
4. **Ensure Attendance** records exist (or create test records)
5. **Lock Attendance** for the period
6. **Generate Payroll** - should create record for employee
7. **Review Record** - check calculations
8. **Finalize** - lock the payroll
9. **Mark as Paid** - complete the cycle
10. **Login as Employee** - verify they can see their payroll

---

## Summary

A **Payroll Period** is the foundation of payroll processing. It:
- Defines the time frame for calculations
- Ensures data integrity through locking
- Provides audit trail through status tracking
- Enables systematic payroll processing

The complete flow ensures:
1. ✅ Data accuracy (attendance locked)
2. ✅ Calculation correctness (review before finalize)
3. ✅ Immutability (finalized records cannot change)
4. ✅ Audit trail (all actions logged)
5. ✅ Employee access (can view own payroll)

---

**Last Updated**: January 2025


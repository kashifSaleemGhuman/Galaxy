# Payroll System Testing Guide

## Overview

This guide provides comprehensive testing instructions for the Payroll Management System to ensure everything works correctly for both HR and Employee users.

## Pre-Testing Checklist

### 1. Database Setup
```bash
# Run migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate
```

### 2. Prerequisites
- ✅ At least one active employee exists
- ✅ Employee has a user account linked
- ✅ Attendance system is set up
- ✅ Leave system is set up

## Testing Scenarios

### HR Side Testing

#### Test 1: Create Salary Structure
**Steps:**
1. Login as HR Manager/Admin
2. Navigate to: `/dashboard/hrm/payroll/salary-structures`
3. Click "New Structure"
4. Select an employee
5. Add components:
   - Basic Salary (ALLOWANCE, FIXED, e.g., 50000)
   - House Allowance (ALLOWANCE, PERCENTAGE, 20%, base: Basic Salary)
   - Tax Deduction (DEDUCTION, PERCENTAGE, 5%)
6. Set effective date
7. Save

**Expected Result:**
- ✅ Structure created successfully
- ✅ Appears in list
- ✅ Components are saved correctly
- ✅ Old structure is deactivated

#### Test 2: Create Payroll Period
**Steps:**
1. Navigate to: `/dashboard/hrm/payroll`
2. Click "New Period"
3. Enter:
   - Period Name: "January 2024"
   - Start Date: 2024-01-01
   - End Date: 2024-01-31
4. Save

**Expected Result:**
- ✅ Period created
- ✅ Status is DRAFT
- ✅ Appears in periods list

#### Test 3: Lock Attendance
**Steps:**
1. Open period details
2. Click "Lock Attendance"
3. Confirm

**Expected Result:**
- ✅ Attendance locked successfully
- ✅ DailyAttendance records marked as locked
- ✅ AttendanceLock record created

#### Test 4: Generate Payroll
**Steps:**
1. In period details, click "Generate Payroll"
2. Wait for completion

**Expected Result:**
- ✅ Payroll records created for all employees
- ✅ Calculations are correct
- ✅ Components are saved
- ✅ Attendance and leave data included
- ✅ Status is GENERATED

#### Test 5: Review Payroll Records
**Steps:**
1. View payroll records in period details
2. Click on a record to view details

**Expected Result:**
- ✅ All records visible
- ✅ Breakdown shows correctly
- ✅ Allowances and deductions listed
- ✅ Attendance summary shown
- ✅ Leave summary shown

#### Test 6: Finalize Payroll
**Steps:**
1. Review all records
2. Click "Finalize"
3. Confirm

**Expected Result:**
- ✅ Period status changes to FINALIZED
- ✅ All records status changes to FINALIZED
- ✅ Records become immutable
- ✅ Audit logs created

#### Test 7: Mark as Paid
**Steps:**
1. After payment, click "Mark as Paid"
2. Confirm

**Expected Result:**
- ✅ Period status changes to PAID
- ✅ All records status changes to PAID
- ✅ Payment date recorded

#### Test 8: Download Payslip (HR)
**Steps:**
1. Open a payroll record
2. Click "Download Payslip"

**Expected Result:**
- ✅ Payslip text file downloads
- ✅ Contains all payroll information
- ✅ Formatted correctly

#### Test 9: Manage Bonuses
**Steps:**
1. Navigate to: `/dashboard/hrm/payroll/bonuses`
2. Click "New Bonus"
3. Select employee, enter amount
4. Save
5. Approve bonus

**Expected Result:**
- ✅ Bonus created
- ✅ Can be approved
- ✅ Appears in list
- ✅ Included in payroll when approved

#### Test 10: Manage Loans
**Steps:**
1. Navigate to: `/dashboard/hrm/payroll/loans`
2. Click "New Loan"
3. Enter loan details
4. Save

**Expected Result:**
- ✅ Loan created
- ✅ Installments generated
- ✅ Appears in list
- ✅ Deducted from payroll automatically

### Employee Side Testing

#### Test 11: View My Payroll (Employee)
**Steps:**
1. Login as Employee (USER role)
2. Navigate to: `/dashboard/hrm/my-payroll`
3. View payroll history

**Expected Result:**
- ✅ Only employee's own records visible
- ✅ List shows all periods
- ✅ Gross, deductions, net shown
- ✅ Status indicators visible

#### Test 12: View Payroll Details (Employee)
**Steps:**
1. Click on a payroll record
2. View details page

**Expected Result:**
- ✅ Complete breakdown visible
- ✅ Allowances listed
- ✅ Deductions listed
- ✅ Attendance summary shown
- ✅ Leave summary shown
- ✅ Cannot see other employees' data

#### Test 13: Download Payslip (Employee)
**Steps:**
1. Open a finalized/paid payroll record
2. Click "Download Payslip"

**Expected Result:**
- ✅ Payslip downloads
- ✅ Contains employee's payroll info
- ✅ Cannot download other employees' payslips

#### Test 14: Access Control (Employee)
**Steps:**
1. Try to access HR payroll pages directly
2. Try to access other employees' payroll records via URL

**Expected Result:**
- ✅ Access denied to HR pages
- ✅ Cannot view other employees' records
- ✅ Proper error messages shown

## API Testing

### Test Payroll APIs

#### Test Salary Structures API
```bash
# List structures
curl -X GET http://localhost:3000/api/hrm/payroll/salary-structures

# Create structure
curl -X POST http://localhost:3000/api/hrm/payroll/salary-structures \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "emp_id",
    "effectiveFrom": "2024-01-01",
    "components": [...]
  }'
```

#### Test Payroll Generation API
```bash
# Generate payroll
curl -X POST http://localhost:3000/api/hrm/payroll/generate \
  -H "Content-Type: application/json" \
  -d '{
    "payrollPeriodId": "period_id"
  }'
```

#### Test Employee Access API
```bash
# As employee - should only see own records
curl -X GET http://localhost:3000/api/hrm/payroll/records

# As HR - should see all records
curl -X GET http://localhost:3000/api/hrm/payroll/records
```

## Calculation Testing

### Test Calculation Scenarios

#### Scenario 1: Full Period Employee
- Employee works full month
- No leave
- Expected: Full salary

#### Scenario 2: Mid-Period Joining
- Employee joins mid-month
- Expected: Pro-rata salary

#### Scenario 3: Unpaid Leave
- Employee takes 2 days unpaid leave
- Expected: Salary deduction for 2 days

#### Scenario 4: Paid Leave
- Employee takes 3 days paid leave
- Expected: No salary deduction

#### Scenario 5: Overtime
- Employee has overtime hours
- Expected: Overtime allowance added

#### Scenario 6: Loan Deduction
- Employee has active loan
- Expected: Installment deducted

#### Scenario 7: Bonus
- Employee has approved bonus
- Expected: Bonus added to gross

## Edge Cases Testing

### Test Edge Cases

1. **No Salary Structure**
   - Employee without salary structure
   - Expected: Error message

2. **No Attendance Data**
   - Period with no attendance
   - Expected: Handled gracefully

3. **Overlapping Periods**
   - Try to create overlapping period
   - Expected: Error message

4. **Finalize Without Records**
   - Try to finalize empty period
   - Expected: Error message

5. **Modify Finalized Record**
   - Try to modify finalized record
   - Expected: Error message

6. **Generate Without Lock**
   - Try to generate without locking attendance
   - Expected: Error message

## Integration Testing

### Test Integrations

1. **Attendance Integration**
   - Verify locked attendance is used
   - Verify attendance summary in payroll

2. **Leave Integration**
   - Verify paid/unpaid leave calculation
   - Verify leave encashment

3. **Employee Integration**
   - Verify employee data in payroll
   - Verify pro-rata for mid-period joining

## Performance Testing

### Test Performance

1. **Generate Payroll for Many Employees**
   - Test with 100+ employees
   - Expected: Completes in reasonable time

2. **View Large Payroll History**
   - Test with many periods
   - Expected: Pagination works

## Security Testing

### Test Security

1. **Unauthorized Access**
   - Try to access without login
   - Expected: Redirected to login

2. **Employee Access Control**
   - Employee tries to access HR pages
   - Expected: Access denied

3. **Cross-Employee Access**
   - Employee tries to view other's payroll
   - Expected: Access denied

## Automated Testing

### Run Test Script
```bash
node scripts/test-payroll-system.js
```

This script tests:
- Database connectivity
- Schema validation
- Data accessibility
- Integration points

## Common Issues & Solutions

### Issue: "No active salary structure"
**Solution:** Create salary structure for employee

### Issue: "Attendance must be locked"
**Solution:** Lock attendance before generating payroll

### Issue: "Period overlaps"
**Solution:** Check existing periods, adjust dates

### Issue: "Cannot modify finalized payroll"
**Solution:** Create adjustment period instead

### Issue: Employee cannot see payroll
**Solution:** 
- Verify employee has user account
- Verify payroll records exist
- Check employee ID matches

## Test Results Template

```
✅ Salary Structure Creation: PASS
✅ Payroll Period Creation: PASS
✅ Attendance Locking: PASS
✅ Payroll Generation: PASS
✅ Finalization: PASS
✅ Employee Access: PASS
✅ Payslip Download: PASS
✅ Bonuses: PASS
✅ Loans: PASS
✅ Access Control: PASS
```

## Next Steps After Testing

1. Fix any issues found
2. Document any edge cases
3. Update user documentation
4. Train HR staff
5. Deploy to production

---

**Last Updated:** January 2025
**Version:** 1.0.0



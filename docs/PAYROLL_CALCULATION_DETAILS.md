# Payroll Calculation Details & HR Controls

## Important: Locking Attendance Does NOT Auto-Generate Payroll

### ❌ What Does NOT Happen Automatically

**Locking attendance does NOT:**
- ❌ Automatically generate payroll
- ❌ Automatically create payslips
- ❌ Automatically send payslips to employees

### ✅ What Actually Happens

**Locking attendance:**
- ✅ Locks attendance records (prevents modifications)
- ✅ Marks `DailyAttendance` records as `isLocked = true`
- ✅ Creates `AttendanceLock` record
- ✅ **Requires manual "Generate Payroll" action by HR**

**After locking, HR must:**
1. Click "Generate Payroll" button manually
2. Review the generated records
3. Finalize when ready
4. Mark as paid after payment
5. Employees can then download their payslips

---

## Complete Payroll Calculation Breakdown

### 1. Base Salary Calculation

**Formula:**
```
Base Salary = Monthly Salary from Salary Structure
```

**Adjustments:**

#### A. Pro-Rata (Mid-Period Joining)
```
If employee joined mid-period:
  Pro-Rata Factor = Working Days After Joining / Total Working Days in Period
  Adjusted Base = Base Salary × Pro-Rata Factor
```

**Example:**
- Employee joins on Jan 15 (mid-month)
- Total working days in January: 22
- Working days after joining: 12
- Pro-rata factor: 12/22 = 0.5455
- If base salary is 50,000 PKR
- Adjusted base: 50,000 × 0.5455 = 27,273 PKR

#### B. Unpaid Leave Deduction
```
Daily Salary = Base Salary / Total Working Days in Period
Unpaid Leave Deduction = Daily Salary × Unpaid Leave Days
Final Base = Adjusted Base - Unpaid Leave Deduction
```

**Example:**
- Base salary: 50,000 PKR
- Total working days: 22
- Daily salary: 50,000 / 22 = 2,273 PKR
- Unpaid leave days: 2
- Deduction: 2,273 × 2 = 4,546 PKR
- Final base: 50,000 - 4,546 = 45,454 PKR

#### C. Absent Days Deduction
```
Absent Deduction = (Base Salary / Total Working Days) × Absent Days
```

**Note:** This is added as a separate deduction component, not subtracted from base.

---

### 2. Allowances Calculation

**Types of Allowances:**

#### A. Fixed Allowances
```
Amount = Fixed value from salary structure
```

**Example:**
- House Allowance: 10,000 PKR (fixed)
- Transport Allowance: 5,000 PKR (fixed)

#### B. Percentage-Based Allowances
```
If no baseComponentId:
  Amount = Base Salary × (Percentage / 100)
  
If baseComponentId specified:
  Base Amount = Referenced Component Amount
  Amount = Base Amount × (Percentage / 100)
```

**Example:**
- Base Salary: 50,000 PKR
- House Allowance: 20% of base
- Amount: 50,000 × 20% = 10,000 PKR

#### C. Overtime Allowance

**How Overtime is Calculated:**

1. **Overtime Detection (in Attendance System):**
   ```
   Shift Duration = (Shift End - Shift Start) - Break Duration
   If Worked Minutes > Shift Duration:
     Overtime Minutes = Worked Minutes - Shift Duration
   ```

2. **Overtime Aggregation:**
   ```
   Total Overtime Minutes = Sum of all daily overtime minutes in period
   Total Overtime Hours = Total Overtime Minutes / 60
   ```

3. **Overtime Payment:**
   ```
   If salary structure has "Overtime" component:
     Overtime Rate = Component Amount (treated as hourly rate)
     Overtime Amount = Total Overtime Hours × Overtime Rate
   ```

**Example:**
- Overtime component in salary: 500 PKR/hour
- Total overtime hours in period: 10 hours
- Overtime allowance: 10 × 500 = 5,000 PKR

**Important:** Overtime is only paid if there's an "Overtime" component in the salary structure. The component amount is treated as the hourly rate.

#### D. Leave Encashment
```
If component name includes "encashment":
  Amount = Leave Encashment Amount from LeaveEncashment records
```

---

### 3. Deductions Calculation

**Types of Deductions:**

#### A. Fixed Deductions
```
Amount = Fixed value from salary structure
```

**Example:**
- Provident Fund: 2,000 PKR (fixed)

#### B. Percentage-Based Deductions
```
If no baseComponentId:
  Amount = Gross Salary × (Percentage / 100)
  
If baseComponentId specified:
  Base Amount = Referenced Component Amount
  Amount = Base Amount × (Percentage / 100)
```

**Example:**
- Gross Salary: 65,000 PKR
- Tax Deduction: 5% of gross
- Amount: 65,000 × 5% = 3,250 PKR

#### C. Loan Installments
```
For each active loan:
  Get next pending installment
  Deduct installment amount
```

**Example:**
- Active loan with monthly installment: 3,000 PKR
- Automatically deducted from payroll

#### D. Absent Days Deduction
```
Daily Rate = Base Salary / Total Working Days
Absent Deduction = Daily Rate × Absent Days
```

**Example:**
- Base salary: 50,000 PKR
- Working days: 22
- Daily rate: 2,273 PKR
- Absent days: 1
- Deduction: 2,273 PKR

#### E. Manual Deductions (HR Controlled)
```
HR can add manual deductions via "Manual Adjustments" page
Each deduction requires a reason
```

---

### 4. Bonuses

**Calculation:**
```
Total Bonuses = Sum of all approved bonuses for the period
```

**Example:**
- Performance Bonus: 5,000 PKR (approved)
- Festival Bonus: 2,000 PKR (approved)
- Total: 7,000 PKR

---

### 5. Final Calculation

```
Gross Salary = Base Salary + Total Allowances + Total Bonuses
Total Deductions = Sum of all deductions
Net Salary = Gross Salary - Total Deductions
```

**Complete Example:**

```
Base Salary: 50,000 PKR
  - Pro-rata adjustment: -2,273 PKR (joined mid-month)
  - Unpaid leave: -4,546 PKR (2 days)
  Adjusted Base: 43,181 PKR

Allowances:
  - House Allowance (20%): 8,636 PKR
  - Transport (Fixed): 5,000 PKR
  - Overtime (10 hours @ 500/hr): 5,000 PKR
  Total Allowances: 18,636 PKR

Bonuses:
  - Performance Bonus: 5,000 PKR
  Total Bonuses: 5,000 PKR

Gross Salary: 43,181 + 18,636 + 5,000 = 66,817 PKR

Deductions:
  - Tax (5% of gross): 3,341 PKR
  - Provident Fund (Fixed): 2,000 PKR
  - Loan Installment: 3,000 PKR
  - Absent Deduction (1 day): 2,273 PKR
  Total Deductions: 10,614 PKR

Net Salary: 66,817 - 10,614 = 56,203 PKR
```

---

## HR Control Over Calculation Rules

### ✅ What HR CAN Control

#### 1. Salary Structure Components

HR has **full control** over:
- **Basic Salary**: Fixed amount
- **Allowances**: 
  - Fixed amounts
  - Percentage of base salary
  - Percentage of other components
  - Taxable/non-taxable status
- **Deductions**:
  - Fixed amounts
  - Percentage of gross salary
  - Percentage of other components
- **Priority Order**: Which components calculate first
- **Component Names**: Can name components anything (e.g., "Overtime", "House Allowance")

#### 2. Manual Adjustments

HR can add:
- **Manual Additions**: Extra payments with reason
- **Manual Deductions**: Penalties/cuts with reason
- Both are added to payroll calculation

#### 3. Bonuses

HR can:
- Create bonuses for employees
- Approve/reject bonuses
- Link bonuses to specific payroll periods

#### 4. Leave Types

HR controls:
- **Paid vs Unpaid Leave**: Via `LeaveType.isPaid` flag
- Paid leave = No deduction
- Unpaid leave = Daily salary deduction

---

### ❌ What HR CANNOT Control (Hardcoded Logic)

The following calculation logic is **hardcoded** and cannot be changed by HR:

1. **Pro-Rata Calculation Formula**
   - Always: `Working Days After Joining / Total Working Days`
   - Cannot change the formula

2. **Overtime Detection**
   - Always: `Worked Minutes - Shift Duration`
   - Cannot change how overtime is detected

3. **Overtime Rate**
   - Uses the "Overtime" component amount as hourly rate
   - If no overtime component exists, no overtime is paid
   - Cannot set different rates for different hours

4. **Absent Day Deduction**
   - Always: `Base Salary / Working Days × Absent Days`
   - Automatically applied
   - Cannot disable or change formula

5. **Working Days Calculation**
   - Always excludes weekends (Saturday & Sunday)
   - Cannot change which days are considered working days

6. **Loan Deduction**
   - Always deducts one installment per period
   - Cannot change deduction logic

7. **Leave Encashment**
   - Uses processed `LeaveEncashment` records
   - Cannot change calculation method

---

## How to Configure Overtime Payment

### Step 1: Create Overtime Component in Salary Structure

1. Go to: `/dashboard/hrm/payroll/salary-structures`
2. Edit employee's salary structure
3. Add new component:
   - **Name**: "Overtime" (must include "overtime" in name)
   - **Type**: ALLOWANCE
   - **Calculation Type**: FIXED
   - **Amount**: Hourly rate (e.g., 500 PKR/hour)
   - **Priority**: Any (doesn't matter for overtime)

### Step 2: Overtime Calculation

The system will:
1. Sum all `overtimeMinutes` from locked attendance records
2. Convert to hours: `totalOvertimeHours = totalOvertimeMinutes / 60`
3. Multiply by component amount: `overtimeAmount = totalOvertimeHours × componentAmount`

**Example:**
- Overtime component: 500 PKR (hourly rate)
- Employee worked 10 hours overtime
- Overtime payment: 10 × 500 = 5,000 PKR

**Note:** If no "Overtime" component exists in salary structure, overtime hours are tracked but not paid.

---

## Calculation Priority Order

Components are calculated in **priority order** (lower number = calculated first):

1. **Base Salary** (always first)
2. **Allowances** (in priority order)
3. **Deductions** (in priority order)
4. **Bonuses** (added last)
5. **Manual Adjustments** (added last)

**Important for Percentage Calculations:**
- If Component B is 20% of Component A
- Component A must have lower priority than Component B
- Component A must be calculated first

---

## Summary

### What Happens When You Lock Attendance?

1. ✅ Attendance records are locked
2. ❌ Payroll is NOT generated automatically
3. ❌ Payslips are NOT created automatically
4. ❌ Employees are NOT notified automatically

**HR must manually:**
- Click "Generate Payroll"
- Review calculations
- Finalize when ready
- Mark as paid after payment

### Overtime Calculation

- **Detected automatically** from attendance (worked minutes > shift duration)
- **Paid only if** "Overtime" component exists in salary structure
- **Rate** = Component amount (treated as hourly rate)
- **Formula**: `Overtime Hours × Hourly Rate`

### HR Controls

**Can Control:**
- ✅ All salary components (amounts, percentages, types)
- ✅ Manual adjustments (additions/deductions)
- ✅ Bonuses
- ✅ Leave types (paid/unpaid)

**Cannot Control:**
- ❌ Calculation formulas (pro-rata, overtime detection, etc.)
- ❌ Working days definition (always excludes weekends)
- ❌ Automatic deductions logic (absent days, loans)

---

**Last Updated**: January 2025


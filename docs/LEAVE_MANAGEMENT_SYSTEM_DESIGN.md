# Leave Management System Design

## 1. CORE PRINCIPLES

### 1.1 Policy-Driven Architecture
- All leave behavior is controlled by **Leave Policies**, not hardcoded logic
- Policies define accrual rules, balance limits, carry-forward rules, and encashment eligibility
- Policies can be assigned at company, department, or employee level
- Policy changes do not corrupt historical data

### 1.2 Deterministic Balance Calculation
- Leave balances are **derived** from:
  - Accrued leaves (based on policy)
  - Approved leave usage
  - Carry-forward from previous periods
  - Encashments
- Balance calculation is **idempotent** and **recalculable**
- Historical balances are preserved and auditable

### 1.3 Audit Trail
- All leave actions are logged:
  - Leave requests (created, modified, cancelled)
  - Approvals/rejections (who, when, why)
  - Balance changes (accruals, usage, encashments)
  - Policy changes (versioned)

### 1.4 Integration Points
- **Attendance**: Approved leave overrides attendance status
- **Payroll**: Paid/unpaid leave affects payroll calculations
- **Policy Changes**: Recalculation triggers when policies change

---

## 2. DATA MODEL

### 2.1 LeaveType
Defines the types of leave available in the system.

```
- id: String (CUID)
- name: String (e.g., "Casual Leave", "Sick Leave")
- code: String (unique, e.g., "CL", "SL")
- description: String
- isPaid: Boolean (true for paid leave)
- isActive: Boolean
- requiresApproval: Boolean
- maxConsecutiveDays: Int? (optional limit)
- requiresMedicalCertificate: Boolean (for sick leave)
- createdAt, updatedAt
```

**Business Rules:**
- Leave types are company-wide but can be disabled per company
- Code must be unique within a tenant
- Cannot delete leave types with historical usage

### 2.2 LeavePolicy
Defines how leave accrues, balances, and can be used.

```
- id: String (CUID)
- name: String
- leaveTypeId: String (FK to LeaveType)
- tenantId: String (FK to Tenant)
- accrualType: Enum (NONE, MONTHLY, YEARLY, CUSTOM)
- accrualAmount: Decimal (days per accrual period)
- accrualFrequency: Int? (e.g., every N months)
- maxBalance: Decimal? (maximum balance allowed)
- allowNegativeBalance: Boolean
- carryForwardEnabled: Boolean
- carryForwardLimit: Decimal? (max days to carry forward)
- carryForwardExpiryMonths: Int? (when carry-forward expires)
- encashmentEnabled: Boolean
- encashmentLimit: Decimal? (max days encashable per period)
- effectiveFrom: DateTime
- effectiveTo: DateTime? (null for current policy)
- isActive: Boolean
- createdAt, updatedAt, createdBy
```

**Business Rules:**
- One active policy per leave type per tenant at a time
- Policy changes create new policy version (old one marked inactive)
- Effective dates prevent overlap
- Accrual calculations run based on accrualType and accrualFrequency

### 2.3 LeavePolicyAssignment
Assigns policies to employees or groups.

```
- id: String (CUID)
- policyId: String (FK to LeavePolicy)
- employeeId: String? (FK to Employee, null for group assignment)
- departmentId: String? (FK to Department, null for individual)
- effectiveFrom: DateTime
- effectiveTo: DateTime? (null for current assignment)
- isActive: Boolean
- createdAt, updatedAt
```

**Business Rules:**
- Individual assignment overrides group assignment
- Most recent active assignment applies
- Assignment changes trigger balance recalculation

### 2.4 LeaveRequest
Employee leave application.

```
- id: String (CUID)
- employeeId: String (FK to Employee)
- leaveTypeId: String (FK to LeaveType)
- startDate: Date
- endDate: Date
- days: Decimal (calculated: endDate - startDate + 1, excluding weekends/holidays)
- reason: String
- status: Enum (PENDING, APPROVED, REJECTED, CANCELLED)
- requestedBy: String (FK to User)
- requestedAt: DateTime
- approvedBy: String? (FK to User)
- approvedAt: DateTime?
- rejectedBy: String? (FK to User)
- rejectedAt: DateTime?
- rejectionReason: String?
- cancelledBy: String? (FK to User)
- cancelledAt: DateTime?
- cancellationReason: String?
- isBackdated: Boolean (requested after leave dates)
- createdAt, updatedAt
```

**Business Rules:**
- Only one pending request per date range per employee
- Cannot overlap with approved leave (unless policy allows)
- Backdated requests require special approval
- Cancelled requests don't affect balances
- Days calculation excludes weekends and holidays (configurable)

### 2.5 LeaveApproval
Approval workflow tracking.

```
- id: String (CUID)
- leaveRequestId: String (FK to LeaveRequest)
- approverId: String (FK to User)
- level: Int (1 = first level, 2 = second level, etc.)
- status: Enum (PENDING, APPROVED, REJECTED)
- remarks: String?
- approvedAt: DateTime?
- createdAt, updatedAt
```

**Business Rules:**
- Multi-level approval supported
- All levels must approve for final approval
- Any rejection rejects the entire request
- Approval order matters (sequential)

### 2.6 LeaveBalance
Calculated leave balance snapshot.

```
- id: String (CUID)
- employeeId: String (FK to Employee)
- leaveTypeId: String (FK to LeaveType)
- policyId: String (FK to LeavePolicy)
- periodStart: Date (accrual period start)
- periodEnd: Date (accrual period end)
- openingBalance: Decimal (balance at period start)
- accrued: Decimal (accrued during period)
- used: Decimal (approved leave used)
- encashed: Decimal (encashed during period)
- carriedForward: Decimal (from previous period)
- closingBalance: Decimal (calculated: opening + accrued - used - encashed)
- lastCalculatedAt: DateTime
- createdAt, updatedAt
```

**Business Rules:**
- One balance record per leave type per period per employee
- Balance is recalculated when:
  - New leave approved
  - Leave cancelled
  - Accrual runs
  - Policy changes
- Closing balance becomes opening balance for next period

### 2.7 LeaveAccrual
Records of leave accrual events.

```
- id: String (CUID)
- employeeId: String (FK to Employee)
- leaveTypeId: String (FK to LeaveType)
- policyId: String (FK to LeavePolicy)
- accrualDate: Date
- accrualAmount: Decimal
- periodStart: Date
- periodEnd: Date
- balanceBefore: Decimal
- balanceAfter: Decimal
- notes: String?
- createdAt, createdBy
```

**Business Rules:**
- Accruals are immutable (never modified, only created)
- Accrual runs based on policy accrualType
- Accrual cannot exceed maxBalance (if set)
- Accrual history is auditable

### 2.8 LeaveEncashment
Records of leave encashment.

```
- id: String (CUID)
- employeeId: String (FK to Employee)
- leaveTypeId: String (FK to LeaveType)
- policyId: String (FK to LeavePolicy)
- encashmentDate: Date
- daysEncashed: Decimal
- encashmentRate: Decimal (per day rate)
- totalAmount: Decimal (daysEncashed * encashmentRate)
- periodStart: Date
- periodEnd: Date
- balanceBefore: Decimal
- balanceAfter: Decimal
- status: Enum (PENDING, PROCESSED, CANCELLED)
- processedAt: DateTime?
- payrollEntryId: String? (FK to payroll entry)
- notes: String?
- createdAt, createdBy, approvedBy
```

**Business Rules:**
- Encashment reduces leave balance
- Only eligible leave types can be encashed
- Encashment limit per period enforced
- Encashment creates payroll entry
- Encashment is auditable

### 2.9 CompanyPolicy
Informational company policies visible to employees.

```
- id: String (CUID)
- tenantId: String (FK to Tenant)
- title: String
- description: String (rich text)
- category: Enum (LEAVE, ATTENDANCE, GENERAL)
- isActive: Boolean
- version: Int (for versioning)
- publishedAt: DateTime?
- publishedBy: String? (FK to User)
- createdAt, updatedAt, createdBy
```

**Business Rules:**
- Policies are read-only for employees
- Versioning allows tracking changes
- Only active policies are visible
- Policies can be categorized

---

## 3. BUSINESS RULES

### 3.1 Leave Accrual Rules

**Monthly Accrual:**
- Runs on 1st of each month (or configurable date)
- Accrues `accrualAmount` days per employee per leave type
- Cannot exceed `maxBalance` if set
- Creates `LeaveAccrual` record

**Yearly Accrual:**
- Runs on employee's joining anniversary or fiscal year start
- Accrues `accrualAmount` days once per year
- Handles prorated accrual for mid-year joiners

**Custom Accrual:**
- Manual accrual by HR
- Requires reason and approval

**No Accrual:**
- Leave type doesn't accrue (e.g., Unpaid Leave)
- Balance only changes through usage

### 3.2 Leave Balance Calculation

**Current Balance Formula:**
```
currentBalance = 
  openingBalance (from last period) +
  accrued (since period start) +
  carriedForward (from previous period) -
  used (approved leave) -
  encashed
```

**Period Transition:**
- At period end, closing balance becomes opening balance
- Carry-forward rules apply:
  - If `carryForwardEnabled` and `carryForwardLimit` set:
    - Carry forward = min(closingBalance, carryForwardLimit)
  - Else: carry forward = 0
- Expired carry-forward (based on `carryForwardExpiryMonths`) is removed

### 3.3 Leave Request Validation

**Before Submission:**
1. Check leave type is active
2. Check employee has active policy assignment
3. Check dates are valid (not in past unless backdated allowed)
4. Check no overlapping approved leave
5. Check balance availability (if paid leave and balance required)
6. Check consecutive days limit (if set)

**Balance Check:**
- If `isPaid = true` and `allowNegativeBalance = false`:
  - Current balance must be >= requested days
- If `isPaid = false` (unpaid leave):
  - No balance check required
- If `allowNegativeBalance = true`:
  - Allow request but flag for HR review

### 3.4 Approval Workflow

**Single-Level Approval:**
- HR Manager or Supervisor approves/rejects
- Status changes: PENDING → APPROVED/REJECTED

**Multi-Level Approval:**
- Sequential approval required
- Each level must approve before next level
- Any rejection rejects entire request
- Approval order: Level 1 → Level 2 → ... → Final Approval

**Approval Actions:**
- On approval:
  1. Update request status to APPROVED
  2. Create/update LeaveBalance (reduce used days)
  3. Update DailyAttendance records (mark as LEAVE)
  4. Trigger payroll recalculation (if applicable)
- On rejection:
  1. Update request status to REJECTED
  2. No balance change
  3. No attendance change

### 3.5 Leave Cancellation

**Employee Cancellation:**
- Can cancel only PENDING requests
- Status changes: PENDING → CANCELLED
- No balance impact

**HR Cancellation:**
- Can cancel APPROVED requests
- Status changes: APPROVED → CANCELLED
- Balance restored (used days returned)
- Attendance records updated
- Payroll recalculated

### 3.6 Overlap Detection

**Rules:**
- Cannot have overlapping approved leave requests
- Overlap check includes:
  - Same leave type
  - Different leave types (if policy restricts)
- Overlap tolerance: Same day = overlap

**Exception:**
- Policy can allow overlapping leave types (e.g., Sick + Casual)

### 3.7 Backdated Leave Requests

**Rules:**
- Requests submitted after leave dates are backdated
- Requires special approval (HR Manager or higher)
- `isBackdated` flag set to true
- Approval workflow may differ (faster track)

### 3.8 Holiday and Weekend Handling

**Configuration:**
- System can exclude weekends from leave days
- System can exclude holidays from leave days
- Holidays defined in company calendar

**Calculation:**
- Days = (endDate - startDate + 1) - weekends - holidays
- If all days are weekends/holidays, request rejected

---

## 4. INTEGRATION WITH ATTENDANCE

### 4.1 Approved Leave → Attendance

**When leave is approved:**
1. For each date in leave range:
   - Find or create DailyAttendance record
   - Set status = 'LEAVE'
   - Set leaveRequestId reference
   - Mark as paid/unpaid based on leave type
2. Recalculate attendance summary if needed

**When leave is cancelled:**
1. For each date in leave range:
   - Update DailyAttendance record
   - Recalculate status based on attendance events
   - Remove leaveRequestId reference

### 4.2 Attendance → Leave Validation

**When checking attendance:**
- If DailyAttendance.status = 'LEAVE':
  - Show leave type and request details
  - Do not show check-in/out options
  - Show as paid/unpaid leave

**When recording attendance:**
- If leave exists for date:
  - Attendance events still recorded (for tracking)
  - But status remains 'LEAVE'

---

## 5. INTEGRATION WITH PAYROLL

### 5.1 Paid Leave

**Calculation:**
- Approved paid leave = payable days
- Included in salary calculation
- No deduction from salary

**Payroll Entry:**
- Leave days counted as working days
- Salary = (base salary / total days) * (working days + paid leave days)

### 5.2 Unpaid Leave

**Calculation:**
- Approved unpaid leave = deduction days
- Deducted from salary

**Payroll Entry:**
- Leave days deducted from working days
- Salary = (base salary / total days) * (working days - unpaid leave days)

### 5.3 Leave Encashment

**Payroll Entry:**
- Encashment creates payroll credit entry
- Amount = daysEncashed * encashmentRate
- Added to gross salary
- Taxable as per tax rules

---

## 6. API ENDPOINTS

### 6.1 Leave Types
- `GET /api/hrm/leave/types` - List leave types
- `POST /api/hrm/leave/types` - Create leave type (HR only)
- `PUT /api/hrm/leave/types/[id]` - Update leave type (HR only)
- `DELETE /api/hrm/leave/types/[id]` - Deactivate leave type (HR only)

### 6.2 Leave Policies
- `GET /api/hrm/leave/policies` - List policies
- `POST /api/hrm/leave/policies` - Create policy (HR only)
- `PUT /api/hrm/leave/policies/[id]` - Update policy (HR only)
- `POST /api/hrm/leave/policies/[id]/assign` - Assign policy to employee/group (HR only)

### 6.3 Leave Requests
- `GET /api/hrm/leave/requests` - List requests (filtered by role)
- `POST /api/hrm/leave/requests` - Create leave request (Employee)
- `GET /api/hrm/leave/requests/[id]` - Get request details
- `PUT /api/hrm/leave/requests/[id]/cancel` - Cancel request (Employee/HR)
- `POST /api/hrm/leave/requests/[id]/approve` - Approve request (HR)
- `POST /api/hrm/leave/requests/[id]/reject` - Reject request (HR)

### 6.4 Leave Balances
- `GET /api/hrm/leave/balances` - Get employee balances
- `GET /api/hrm/leave/balances/[employeeId]` - Get specific employee balances (HR)
- `POST /api/hrm/leave/balances/recalculate` - Recalculate balances (HR only)

### 6.5 Leave Accruals
- `GET /api/hrm/leave/accruals` - List accruals (HR)
- `POST /api/hrm/leave/accruals/run` - Run accrual process (HR only)

### 6.6 Leave Encashment
- `GET /api/hrm/leave/encashments` - List encashments
- `POST /api/hrm/leave/encashments` - Request encashment (Employee)
- `POST /api/hrm/leave/encashments/[id]/approve` - Approve encashment (HR)

### 6.7 Company Policies
- `GET /api/hrm/policies` - List company policies
- `POST /api/hrm/policies` - Create policy (HR only)
- `PUT /api/hrm/policies/[id]` - Update policy (HR only)

---

## 7. EDGE CASES HANDLING

### 7.1 Employee Joining Mid-Cycle
- Prorated accrual based on joining date
- Opening balance = 0
- Accrual = (accrualAmount / periodDays) * daysRemaining

### 7.2 Policy Changes During Active Leave
- Policy change doesn't affect already approved leave
- New requests use new policy
- Balance recalculation uses new policy for future periods

### 7.3 Overlapping Leave Requests
- System prevents overlapping requests
- Exception: Different leave types if policy allows
- Validation runs before submission

### 7.4 Leave on Holidays/Weekends
- Configurable exclusion from leave days
- If all days are holidays/weekends, request rejected
- Employee informed during submission

### 7.5 Exhausted Leave Balance
- Request rejected if balance insufficient
- Exception: Unpaid leave or negative balance allowed
- HR can override with manual approval

### 7.6 Backdated Leave Requests
- Special approval required
- Flagged in system
- Faster approval workflow
- Audit trail maintained

### 7.7 Multiple Policies Across Periods
- Each period uses policy active at period start
- Balance transitions preserve policy context
- Historical balances maintain policy reference

---

## 8. AUDIT REQUIREMENTS

### 8.1 Leave Request Audit
- Who created/modified/cancelled
- When actions occurred
- What changed (before/after values)
- Reason for changes

### 8.2 Approval Audit
- Who approved/rejected
- When approval/rejection occurred
- Approval level
- Remarks/notes

### 8.3 Balance Audit
- Balance changes tracked
- Source of change (accrual, usage, encashment)
- Policy used for calculation
- Recalculation triggers logged

### 8.4 Policy Audit
- Policy creation/modification
- Policy assignment changes
- Effective date changes
- Version history

---

## 9. SECURITY & PERMISSIONS

### 9.1 Employee Permissions
- View own leave balances
- Create leave requests
- Cancel own pending requests
- View own request history
- View company policies (read-only)

### 9.2 HR Permissions
- All employee permissions +
- View all leave requests
- Approve/reject leave requests
- Create/modify leave types
- Create/modify leave policies
- Assign policies
- Run accrual process
- Recalculate balances
- View analytics

### 9.3 Super Admin Permissions
- All HR permissions +
- System-wide configuration
- Policy template management

---

## 10. IMPLEMENTATION PHASES

### Phase 1: Core Models & Basic CRUD
- Database schema
- Leave types management
- Basic leave request creation
- Simple approval workflow

### Phase 2: Policy Engine
- Leave policy creation
- Policy assignment
- Balance calculation
- Accrual process

### Phase 3: Advanced Features
- Multi-level approval
- Encashment
- Carry-forward
- Company policies

### Phase 4: Integration
- Attendance integration
- Payroll integration
- Analytics dashboard

### Phase 5: Optimization
- Balance recalculation optimization
- Bulk operations
- Reporting enhancements

---

## 11. TESTING STRATEGY

### 11.1 Unit Tests
- Balance calculation logic
- Accrual calculation
- Overlap detection
- Policy application

### 11.2 Integration Tests
- Leave → Attendance flow
- Leave → Payroll flow
- Approval workflow
- Balance recalculation

### 11.3 Edge Case Tests
- Mid-cycle joining
- Policy changes
- Overlapping requests
- Exhausted balance
- Backdated requests

---

## 12. FUTURE ENHANCEMENTS

- Leave calendar view
- Leave forecasting
- Automated accrual scheduling
- Leave analytics dashboard
- Mobile app support
- Email notifications
- Leave request templates
- Bulk leave operations
- Leave reports export


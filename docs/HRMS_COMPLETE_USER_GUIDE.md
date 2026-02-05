# HRMS Complete User Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Employee Management](#employee-management)
4. [Attendance Management](#attendance-management)
5. [Leave Management](#leave-management)
6. [Payroll Management](#payroll-management)
7. [Document Management](#document-management)
8. [Shift Management](#shift-management)
9. [Department Management](#department-management)
10. [Best Practices](#best-practices)
11. [Troubleshooting](#troubleshooting)

---

## Introduction

The Human Resource Management System (HRMS) is a comprehensive solution designed to streamline all HR operations, from employee onboarding to payroll processing. This guide explains how to use each module from both HR and employee perspectives.

### System Overview

The HRMS consists of the following core modules:

- **Employee Management**: Maintain employee records and profiles
- **Attendance Management**: Track daily attendance and work hours
- **Leave Management**: Handle leave requests, policies, and balances
- **Payroll Management**: Process salaries, bonuses, and deductions
- **Document Management**: Store and manage employee documents
- **Shift Management**: Define and assign work shifts
- **Department Management**: Organize employees by departments

### User Roles

- **HR Manager/Admin**: Full access to all HR modules
- **Employee**: Access to personal information, attendance, leave, payroll, and documents

---

## Getting Started

### For HR Managers

1. **Login**: Use your HR Manager credentials
2. **Navigation**: Access HRM module from the main dashboard
3. **Overview**: The HRM dashboard provides quick access to all modules

### For Employees

1. **Login**: Use your employee credentials (provided by HR)
2. **Navigation**: Access personal HRM features from the dashboard
3. **Profile**: Your employee profile is automatically linked to your account

---

## Employee Management

### HR Perspective

#### Creating a New Employee

1. Navigate to **HRM → Employees**
2. Click **"Create Employee"** button
3. Fill in the required information:
   - Employee ID (unique identifier)
   - Personal details (name, date of birth, contact information)
   - Employment details (date of joining, department, designation, salary)
   - Emergency contact information
4. Click **"Save"** to create the employee record

#### Editing Employee Information

1. Go to **HRM → Employees**
2. Find the employee in the list
3. Click the **Edit** icon next to their name
4. Update the required fields
5. Click **"Save Changes"**

#### Viewing Employee List

- The employee list shows all employees with their basic information
- You can filter by department, designation, or search by name/employee ID
- Click on an employee's name to view their complete profile

#### Linking Employee to User Account

1. Go to the employee's profile
2. Click **"Generate Credentials"** or **"Link Account"**
3. The system will create a user account for the employee
4. Share the login credentials securely with the employee

### Employee Perspective

#### Viewing Your Profile

1. Navigate to **HRM → Employees** (if you have access)
2. Your profile information is displayed
3. Contact HR if you notice any incorrect information

#### Updating Personal Information

- Most personal information can only be updated by HR
- Contact HR for any changes to your profile

---

## Attendance Management

### HR Perspective

#### Viewing All Employee Attendance

1. Navigate to **HRM → Attendance → Manage**
2. View attendance records for all employees
3. Filter by:
   - Employee name
   - Date range
   - Attendance status (Present, Absent, Late, Leave, Half Day)
4. Export attendance reports if needed

#### Reviewing Attendance Corrections

1. Go to **HRM → Attendance → Corrections → Manage**
2. View all pending correction requests
3. For each request:
   - Review the employee's reason
   - Check the requested check-in/out times
   - Approve or reject the request
   - Add review notes if needed

#### Locking Attendance for Payroll

1. Navigate to **HRM → Payroll → Periods**
2. Select the payroll period
3. Click **"Lock Attendance"**
4. This prevents further changes to attendance records for that period
5. Locked attendance is used for payroll calculations

### Employee Perspective

#### Checking In/Out

1. Navigate to **HRM → Attendance** (or **My Attendance**)
2. You'll see today's attendance status
3. Click **"Check In"** when you arrive at work
4. Click **"Check Out"** when you leave work
5. The system records the exact time of each action

**Important Notes:**
- You can only check in once per day
- You can only check out after checking in
- The system validates your check-in/out times

#### Viewing Attendance History

1. Go to **HRM → Attendance**
2. Scroll down to see your attendance history
3. The history shows:
   - Date
   - Check-in time
   - Check-out time
   - Worked hours
   - Status (Present, Late, Absent, etc.)
   - Overtime hours (if any)

#### Requesting Attendance Corrections

If you forgot to check in/out or need to correct your attendance:

1. Navigate to **HRM → Attendance → Corrections**
2. Click **"Request Correction"**
3. Select the date that needs correction
4. Enter the correct check-in and/or check-out times
5. Provide a reason for the correction
6. Submit the request
7. HR will review and approve/reject your request

---

## Leave Management

### HR Perspective

#### Managing Leave Types

1. Navigate to **HRM → Leave → Types**
2. View all available leave types (Casual Leave, Annual Leave, Sick Leave, etc.)
3. Create new leave types:
   - Click **"Create Leave Type"**
   - Enter name, code, and description
   - Set whether it's paid or unpaid
   - Configure approval requirements
   - Set maximum consecutive days allowed
4. Edit or deactivate leave types as needed

#### Creating Leave Policies

1. Go to **HRM → Leave → Policies**
2. Click **"Create Policy"**
3. Configure the policy:
   - Select the leave type
   - Set accrual type (Monthly, Yearly, Custom, or None)
   - Define accrual amount (days per period)
   - Set maximum balance limit
   - Enable/disable carry forward
   - Enable/disable encashment
   - Set effective dates
4. Save the policy

#### Assigning Leave Policies to Employees

1. Go to **HRM → Leave → Policies**
2. Find the policy you want to assign
3. Click **"Assign"** button
4. Select the employee
5. Set the effective date (when the policy becomes active)
6. Click **"Assign Policy"**
7. The system automatically creates initial leave balance for the employee

#### Managing Leave Requests

1. Navigate to **HRM → Leave → Manage**
2. View all leave requests (Pending, Approved, Rejected)
3. Filter by employee, leave type, or date range
4. For pending requests:
   - Click on a request to view details
   - Review the employee's leave balance
   - Check for conflicts with other requests
   - Approve or reject the request
   - Add approval notes if needed

#### Viewing Leave Balances

1. Go to **HRM → Leave → Manage**
2. Select an employee
3. View their leave balances for all leave types
4. See accrual history and usage history

### Employee Perspective

#### Viewing Leave Balances

1. Navigate to **HRM → Leave** (or **My Leave**)
2. View your current leave balances:
   - Available balance for each leave type
   - Accrued leave
   - Used leave
   - Encashed leave (if applicable)

#### Requesting Leave

1. Go to **HRM → Leave → Request** (or **My Leave**)
2. Click **"Request Leave"**
3. Fill in the leave request form:
   - Select leave type from dropdown
   - Choose start date
   - Choose end date
   - Enter reason for leave
4. The system will:
   - Check your available balance
   - Validate the dates
   - Show the number of days requested
5. Click **"Submit Request"**
6. Your request will be sent to HR for approval

#### Viewing Leave Request Status

1. Navigate to **HRM → Leave**
2. Scroll to **"My Leave Requests"** section
3. View all your leave requests with their status:
   - **Pending**: Awaiting HR approval
   - **Approved**: Your leave has been approved
   - **Rejected**: Your leave request was rejected (check rejection reason)

#### Understanding Leave Policies

- **Accrual**: Leave is automatically added to your balance based on your policy
- **Carry Forward**: Some leave types allow you to carry unused leave to the next period
- **Encashment**: Some leave types can be converted to cash
- **Maximum Balance**: Your leave balance cannot exceed the policy limit

---

## Payroll Management

### HR Perspective

#### Creating Salary Structures

1. Navigate to **HRM → Payroll → Salary Structures**
2. Click **"Create Salary Structure"**
3. Select the employee
4. Set effective date (when this structure becomes active)
5. Add salary components:
   - **Basic Salary**: Fixed amount (required)
   - **Allowances**: Fixed amount or percentage of basic
     - House Allowance
     - Transport Allowance
     - Medical Allowance
     - etc.
   - **Deductions**: Fixed amount or percentage
     - Tax Deduction
     - Provident Fund
     - Loan Installments
     - etc.
6. Set priority for each component (lower number = calculated first)
7. Mark components as taxable or non-taxable
8. Save the structure

**Important Notes:**
- Only one active salary structure per employee at a time
- When creating a new structure, the old one is automatically deactivated
- Priority determines calculation order (important for percentage-based components)

#### Creating Payroll Periods

1. Go to **HRM → Payroll → Periods**
2. Click **"Create Period"**
3. Enter:
   - Period name (e.g., "January 2024")
   - Start date
   - End date
4. Click **"Create"**
5. The period starts in **DRAFT** status

#### Generating Payroll

**Step 1: Lock Attendance**
1. Select the payroll period
2. Click **"Lock Attendance"**
3. This prevents changes to attendance records for that period

**Step 2: Generate Payroll**
1. Go to the payroll period details
2. Click **"Generate Payroll"**
3. Select employees (or generate for all)
4. The system will:
   - Calculate base salary (with pro-rata for mid-period joiners)
   - Apply allowances
   - Apply deductions
   - Include bonuses
   - Deduct loan installments
   - Calculate net salary
5. Review the generated payroll records

**Step 3: Review and Finalize**
1. Review each employee's payroll record
2. Check calculations and breakdowns
3. Click **"Finalize Period"** when ready
4. Finalized periods cannot be modified

**Step 4: Mark as Paid**
1. After processing payments
2. Click **"Mark as Paid"**
3. This updates the status to PAID

#### Managing Bonuses

1. Navigate to **HRM → Payroll → Bonuses**
2. Click **"Create Bonus"**
3. Select employee
4. Enter bonus details:
   - Bonus name/description
   - Amount
   - Type (One-time or Performance-based)
   - Notes
5. Submit for approval
6. Approve bonuses to include them in payroll

#### Managing Loans

1. Go to **HRM → Payroll → Loans**
2. Click **"Create Loan"**
3. Enter loan details:
   - Employee
   - Loan number
   - Principal amount
   - Interest rate
   - Number of installments
   - Start and end dates
4. The system automatically creates installment schedule
5. Loan installments are automatically deducted from payroll

### Employee Perspective

#### Viewing Payroll History

1. Navigate to **HRM → My Payroll**
2. View all your payroll records
3. Each record shows:
   - Payroll period
   - Gross salary
   - Total deductions
   - Net salary
   - Status (Generated, Finalized, Paid)

#### Viewing Payroll Details

1. Click on a payroll record
2. View detailed breakdown:
   - Base salary calculation
   - All allowances with amounts
   - All deductions with amounts
   - Bonuses (if any)
   - Loan deductions (if any)
   - Attendance summary
   - Leave summary
   - Final net salary

#### Downloading Payslips

1. Open a payroll record
2. Click **"Download Payslip"**
3. The payslip is generated in text format
4. Save or print for your records

#### Understanding Your Salary

- **Gross Salary**: Base salary + all allowances
- **Deductions**: Tax, loans, provident fund, etc.
- **Net Salary**: Gross salary - deductions
- **Pro-rata**: If you joined mid-period, your salary is calculated proportionally
- **Unpaid Leave**: Days taken as unpaid leave are deducted from salary

---

## Document Management

### HR Perspective

#### Uploading Employee Documents

1. Navigate to **HRM → Documents**
2. Click **"Upload Document"**
3. Select the employee
4. Choose document type:
   - Employment Contract
   - ID Card
   - Certificates
   - Performance Reviews
   - etc.
5. Upload the file
6. Add description/notes
7. Save

#### Generating Documents

1. Go to **HRM → Documents → Generate**
2. Select document template:
   - Employment Letter
   - Experience Certificate
   - Salary Certificate
   - etc.
3. Select employee
4. Fill in required information
5. Generate and download the document

#### Managing Documents

1. Navigate to **HRM → Documents**
2. View all employee documents
3. Filter by employee or document type
4. Download, update, or delete documents as needed

### Employee Perspective

#### Viewing Your Documents

1. Navigate to **HRM → My Documents**
2. View all documents associated with your profile
3. Documents are organized by type
4. Download any document you need

#### Requesting Documents

- Contact HR if you need a specific document
- HR can generate certificates and letters for you

---

## Shift Management

### HR Perspective

#### Creating Shifts

1. Navigate to **HRM → Shifts**
2. Click **"Create Shift"**
3. Enter shift details:
   - Shift name (e.g., "Morning Shift", "Night Shift")
   - Start time (HH:mm format)
   - End time (HH:mm format)
   - Grace period (minutes allowed for late arrival)
   - Break duration (minutes)
   - Half-day threshold (minimum hours for half-day)
4. Save the shift

#### Assigning Shifts to Employees

1. Go to **HRM → Shifts**
2. Find the shift you want to assign
3. Click **"Assign to Employee"**
4. Select the employee
5. Set effective date (when the shift assignment starts)
6. Optionally set end date
7. Save the assignment

#### Managing Shift Assignments

- View all shift assignments
- Edit assignment dates
- Deactivate assignments when employees change shifts
- Historical assignments are preserved for attendance calculations

### Employee Perspective

#### Viewing Your Shift

1. Go to **HRM → Attendance**
2. Your current shift is displayed
3. You can see:
   - Shift name
   - Start time
   - End time
   - Break duration

#### Understanding Shift Rules

- **Start Time**: When you should check in
- **End Time**: When you should check out
- **Grace Period**: Minutes you can be late without being marked as "Late"
- **Break Duration**: Deducted from your worked hours
- **Half-Day Threshold**: Minimum hours to be counted as present

---

## Department Management

### HR Perspective

#### Viewing Departments

1. Navigate to **HRM → Departments**
2. View all departments in the organization
3. See employee count per department

#### Managing Departments

- Departments are typically managed at the organization level
- When creating/editing employees, assign them to departments
- Use departments for:
  - Organizing employees
  - Filtering reports
  - Assigning department-wide policies

### Employee Perspective

- Your department is shown in your profile
- Contact HR if you need to change departments

---

## Best Practices

### For HR Managers

1. **Regular Updates**: Keep employee information up to date
2. **Attendance Locking**: Always lock attendance before generating payroll
3. **Leave Policies**: Assign leave policies to employees when they join
4. **Salary Structures**: Review and update salary structures annually
5. **Document Management**: Maintain all employee documents in the system
6. **Audit Trail**: The system maintains a complete audit trail of all changes

### For Employees

1. **Check-In/Out**: Always check in and out on time
2. **Leave Planning**: Request leave well in advance
3. **Document Requests**: Request documents before you need them
4. **Profile Updates**: Notify HR of any changes to your personal information
5. **Attendance Corrections**: Request corrections promptly if needed

---

## Troubleshooting

### Common Issues

#### "Cannot check in" Error
- **Solution**: You may have already checked in today, or there's a system issue. Contact HR.

#### "Insufficient leave balance" Error
- **Solution**: Check your leave balance. You may need to wait for accrual or use a different leave type.

#### "No active policy assignment found" Error
- **Solution**: Contact HR to assign a leave policy to your account.

#### Cannot view payroll records
- **Solution**: Payroll records are only available after they're generated. Contact HR if you believe records should exist.

#### Attendance correction not showing
- **Solution**: Corrections must be approved by HR. Check the status of your request.

### Getting Help

- **HR Support**: Contact your HR department for assistance
- **System Issues**: Report technical issues to IT support
- **Training**: Request training sessions for new features

---

## System Features Summary

### Security Features

- **Role-Based Access**: Employees can only access their own data
- **Audit Logging**: All actions are logged for compliance
- **Data Encryption**: Sensitive data is encrypted
- **Secure Authentication**: Password-protected access

### Automation Features

- **Automatic Calculations**: Payroll, attendance, and leave balances are calculated automatically
- **Accrual Processing**: Leave balances are updated automatically based on policies
- **Status Updates**: Attendance status is determined automatically based on worked hours

### Reporting Features

- **Attendance Reports**: Generate attendance reports by employee, department, or date range
- **Leave Reports**: View leave usage and balance reports
- **Payroll Reports**: Export payroll summaries and details
- **Employee Reports**: Generate employee directory and profile reports

---

## Conclusion

This HRMS provides a comprehensive solution for managing all HR operations. By following this guide, both HR managers and employees can effectively use the system to streamline HR processes and improve efficiency.

For additional support or feature requests, please contact your system administrator.

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Maintained By**: HRMS Development Team


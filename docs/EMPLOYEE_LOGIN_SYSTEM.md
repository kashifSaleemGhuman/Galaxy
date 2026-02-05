# Employee Login System Implementation

## Overview
This document describes the implementation of the employee login system for the HR module. Each employee now has their own user account with credentials that allow them to log in to the application.

## Features Implemented

### 1. Database Schema Updates
- **Employee-User Relationship**: Added one-to-one relationship between `Employee` and `User` models
- **New Field**: `userId` field added to `Employee` model (optional, unique)
- **New Relation**: `employee` relation added to `User` model

### 2. Automatic User Account Creation
- When an employee is created, a user account is automatically created
- Email format: `{employeeId}@employee.local` (sanitized)
- Password: Auto-generated 8-character random password
- Default role: `USER` (can be changed later)
- User account is linked to the employee record

### 3. Credentials Management
- **Super Admin Only**: Only super admin can view employee credentials
- **Show Credentials Button**: Added to employees list page (visible only to super admin)
- **Credentials Modal**: Modal component to display login credentials securely
- **Password Visibility**: Toggle to show/hide password
- **Copy to Clipboard**: Easy copy functionality for email and password

### 4. API Endpoints

#### GET `/api/organization/employees`
- Returns all employees with their user account information
- Includes user email, role, and active status

#### POST `/api/organization/employees`
- Creates employee and automatically creates user account
- Returns credentials in response (only for super admin)
- Returns employee data with user relation

#### GET `/api/organization/employees/[id]`
- Returns individual employee with user account information

#### PUT `/api/organization/employees/[id]`
- Updates employee information
- Automatically updates user name if employee name changes

#### GET `/api/organization/employees/[id]/credentials`
- **Super Admin Only**: Returns employee login credentials
- Returns email and role information
- Password cannot be retrieved (security feature)

### 5. UI Components

#### Employees List Page (`/dashboard/organization/employees`)
- Shows all employees with their information
- **Show Credentials** button (key icon) - visible only to super admin
- Edit button for each employee
- Displays user account status

#### Create Employee Page (`/dashboard/organization/employees/create`)
- Form to create new employee
- After creation, super admin sees credentials modal automatically
- Credentials are shown once and must be saved

#### Credentials Modal Component
- Displays employee login credentials
- Shows email and temporary password
- Password can be toggled visible/hidden
- Copy to clipboard functionality
- Warning message about saving password securely

## Security Features

1. **Password Hashing**: All passwords are hashed using bcryptjs
2. **Super Admin Only**: Credentials can only be viewed by super admin
3. **One-Time Display**: Password is only shown during creation
4. **Secure Storage**: Passwords cannot be retrieved after creation
5. **Role-Based Access**: Proper permission checks throughout

## Usage

### Creating an Employee
1. Navigate to `/dashboard/organization/employees`
2. Click "Add Employee"
3. Fill in employee details
4. Submit the form
5. If you're a super admin, credentials modal will appear
6. **Important**: Save the credentials securely - password won't be shown again

### Viewing Employee Credentials (Super Admin Only)
1. Navigate to `/dashboard/organization/employees`
2. Click the key icon next to any employee
3. Credentials modal will show email and role
4. Note: Password cannot be retrieved after creation

### Employee Login
1. Employee uses the email shown in credentials
2. Employee uses the temporary password (if available)
3. Employee will be prompted to change password on first login
4. Employee can then access the application based on their role permissions

## Database Migration

To apply the schema changes, run:

```bash
npm run db:migrate
```

Or manually:
```bash
npx prisma migrate dev --name add_employee_user_relationship
```

## Future Enhancements

1. **Password Reset**: Add functionality to reset employee passwords
2. **Role Assignment**: Allow assigning specific roles to employees during creation
3. **Bulk Import**: Import employees with credentials from CSV
4. **Email Notifications**: Send credentials via email to employees
5. **Activity Logging**: Track employee login activities

## Notes

- Employee email format can be customized in the future
- Default role is `USER` - can be changed after creation
- Employees can access all features based on their assigned role
- The system is designed to be extensible for future HR module features


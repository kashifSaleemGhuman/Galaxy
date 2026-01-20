# Permissions and Role-Based Access Control (RBAC) System

## Overview

This ERP system implements a comprehensive Role-Based Access Control (RBAC) system that manages user permissions across different modules (Purchase, Inventory, CRM, etc.). The system uses NextAuth.js for authentication and stores user roles in the database.

## Architecture

### 1. **Database Schema**

The `User` model in Prisma schema stores the role as a string:
```prisma
model User {
  id              String   @id @default(cuid())
  email           String   @unique
  name            String?
  password        String
  role            String   // Stores role like 'SUPER_ADMIN', 'PURCHASE_MANAGER', etc.
  isFirstLogin    Boolean  @default(true)
  isActive        Boolean  @default(true)
  // ... other fields
}
```

There's also a `Role` model (currently not fully utilized):
```prisma
model Role {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  permissions Json     // JSON object containing role permissions
  // ...
}
```

### 2. **Role Definitions**

The system has **two separate role definition files** that need to be synchronized:

#### A. `src/lib/constants/roles.js`
Defines role constants and permissions using a string-based permission system:
- **Roles**: `SUPER_ADMIN`, `ADMIN`, `PURCHASE_MANAGER`, `PURCHASE_USER`, `INVENTORY_MANAGER`, etc.
- **Permissions**: String-based like `'purchase.create_rfq'`, `'purchase.approve_rfq'`, `'inventory.manage_stock'`
- **ROLE_PERMISSIONS**: Maps roles to arrays of permission strings

#### B. `src/lib/permissions.js`
Defines roles and permissions using a different naming convention:
- **Roles**: `'Admin'`, `'Inventory Manager'`, `'Warehouse Operator'`, `'Purchase Manager'`
- **Permissions**: String-based like `'inventory:product:read'`, `'purchase:rfq:write'`
- **ROLE_PERMISSIONS**: Maps role names (not constants) to permission arrays

**Note**: There's a mapping issue between these two systems that the `usePermissions` hook attempts to resolve.

### 3. **Authentication Flow**

#### Login Process (`src/lib/auth.js`)

1. User logs in with credentials
2. `CredentialsProvider` validates email/password against database
3. On successful login:
   - Creates audit log entry
   - Returns user object (without password)
4. NextAuth JWT callback:
   - Stores user ID, role, and permissions in JWT token
   - Permissions are fetched from `ROLE_PERMISSIONS[user.role]` in `constants/roles.js`
5. Session callback:
   - Adds role and permissions to session object
   - Makes them available throughout the app via `useSession()`

```javascript
// JWT callback adds permissions to token
async jwt({ token, user }) {
  if (user) {
    token.role = user.role
    token.permissions = ROLE_PERMISSIONS[user.role] || []
    // ...
  }
  return token
}

// Session callback exposes permissions
async session({ session, token }) {
  if (session?.user) {
    session.user.role = token.role
    session.user.permissions = token.permissions
    // ...
  }
  return session
}
```

### 4. **Permission Checking Mechanisms**

#### A. **Client-Side (React Components)**

**1. `usePermissions` Hook** (`src/hooks/usePermissions.js`)
- Uses `useSession()` to get user role and permissions
- Provides helper functions:
  - `hasPermission(permission)` - Check single permission
  - `hasAnyPermission(permissions)` - Check if user has any of the permissions
  - `hasAllPermissions(permissions)` - Check if user has all permissions
- Handles role mapping between database roles and permission system roles

**2. `PermissionGuard` Component** (`src/components/guards/PermissionGuard.jsx`)
- Wraps UI elements that require specific permissions
- Hides/shows content based on user permissions
- Supports two modes:
  - `requireAll={false}` (default): User needs ANY of the specified permissions
  - `requireAll={true}`: User needs ALL specified permissions

```jsx
<PermissionGuard
  permissions={[PERMISSIONS.PURCHASE.APPROVE_RFQ]}
  fallback={null}
>
  <Button>Approve RFQ</Button>
</PermissionGuard>
```

**3. Direct Role Checks in Components**
- Components can directly check user role from session
- Example in `src/app/dashboard/layout.jsx`:
```javascript
const userRole = session?.user?.role || 'PURCHASE_MANAGER'
const isAdmin = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN'

// Show/hide navigation items based on role
if (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN') {
  // Show admin menu items
}
```

#### B. **Server-Side (API Routes)**

**1. Middleware** (`src/middleware.js`)
- Uses `withAuth` from NextAuth to protect routes
- Checks permissions for specific routes:
  - `/dashboard/purchase/approvals` - Requires `'purchase.approve_rfq'`
  - `/dashboard/users` - Requires `'admin.manage_users'`
- Redirects unauthorized users to dashboard
- Also handles first-login password change flow

**2. API Route Permission Checks**

**Method 1: Direct Role Checking**
```javascript
// Example from src/app/api/rfqs/route.js
const currentUser = await prisma.user.findUnique({
  where: { email: session.user.email }
})

if (![ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PURCHASE_MANAGER].includes(currentUser.role)) {
  // Regular users can only see their own RFQs
  where.createdById = currentUser.id
}
```

**Method 2: Permission Helper Function**
```javascript
// Example from src/app/api/users/route.js
const ALLOWED_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN]

async function checkPermission() {
  const session = await getServerSession()
  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email }
  })
  
  if (!ALLOWED_ROLES.includes(currentUser.role)) {
    return { allowed: false, error: 'Insufficient permissions' }
  }
  
  return { allowed: true, isSuperAdmin: currentUser.role === ROLES.SUPER_ADMIN }
}
```

**Method 3: Using Session Permissions**
```javascript
// From src/lib/auth.js
export async function checkPermission(permission) {
  const session = await getServerSession()
  if (!session) return false
  return session.user.permissions.includes(permission)
}
```

### 5. **Available Roles and Permissions**

#### Roles (from `constants/roles.js`):
- `SUPER_ADMIN` - Full system access
- `ADMIN` - Administrative access (can't manage super admins)
- `PURCHASE_MANAGER` - Can create and approve RFQs/POs
- `PURCHASE_USER` - Can create RFQs/POs but not approve
- `INVENTORY_MANAGER` - Full inventory management
- `INVENTORY_USER` - Limited inventory access
- `ACCOUNTS_MANAGER` - Accounting module access
- `CRM_MANAGER` - CRM module access
- `SALES_MANAGER` - Sales module access
- `HR_MANAGER` - HR module access
- `ACCOUNTANT` - Accounting access
- `VENDOR` - External vendor access
- `USER` - Basic user

#### Permission Categories:

**Purchase Permissions:**
- `purchase.view_all`
- `purchase.create_rfq`
- `purchase.approve_rfq`
- `purchase.create_po`
- `purchase.approve_po`
- `purchase.view_reports`
- `purchase.manage_vendors`
- `purchase.manage_settings`

**Inventory Permissions:**
- `inventory.view_all`
- `inventory.manage_stock`
- `inventory.approve_transfers`
- `inventory.view_reports`
- `inventory.manage_settings`

**Admin Permissions:**
- `admin.manage_users`
- `admin.manage_roles`
- `admin.view_audit_logs`
- `admin.manage_system_settings`

### 6. **Navigation Access Control**

The dashboard layout (`src/app/dashboard/layout.jsx`) dynamically builds navigation based on user role:

```javascript
// Purchase module - available to purchase-related roles
if (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN' || 
    userRole === 'PURCHASE_MANAGER' || userRole === 'PURCHASE_USER') {
  // Add Purchase menu items
}

// Inventory module - for inventory managers and admins
if (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN' || 
    userRole === 'INVENTORY_MANAGER') {
  // Add Inventory menu items
}
```

### 7. **Data Access Control**

**Row-Level Security:**
- Users can only see their own RFQs unless they're managers/admins
- Super admins can manage all users except other super admins
- Regular admins cannot manage super admin accounts

**Example from RFQ API:**
```javascript
// Managers see all RFQs, users see only their own
if (![ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PURCHASE_MANAGER].includes(currentUser.role)) {
  where.createdById = currentUser.id
}
```

### 8. **Current Issues and Inconsistencies**

1. **Dual Permission Systems**: Two separate permission definition files with different naming conventions
2. **Role Mapping**: The `usePermissions` hook attempts to map between database roles and permission system roles, but this mapping is incomplete
3. **Permission String Formats**: 
   - `constants/roles.js` uses: `'purchase.create_rfq'`
   - `permissions.js` uses: `'purchase:rfq:write'`
4. **Role Name Mismatch**: Database stores `'SUPER_ADMIN'` but some code expects `'Admin'`

### 9. **Best Practices for Adding New Permissions**

1. **Define Permission in `constants/roles.js`:**
```javascript
export const PERMISSIONS = {
  NEW_MODULE: {
    ACTION: 'new_module.action'
  }
}
```

2. **Add to ROLE_PERMISSIONS:**
```javascript
export const ROLE_PERMISSIONS = {
  [ROLES.ROLE_NAME]: [
    // ... existing permissions
    PERMISSIONS.NEW_MODULE.ACTION
  ]
}
```

3. **Use in Components:**
```jsx
import { PERMISSIONS } from '@/lib/constants/roles'
import PermissionGuard from '@/components/guards/PermissionGuard'

<PermissionGuard permissions={[PERMISSIONS.NEW_MODULE.ACTION]}>
  <ProtectedComponent />
</PermissionGuard>
```

4. **Check in API Routes:**
```javascript
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const session = await getServerSession(authOptions)
if (!session?.user?.permissions?.includes('new_module.action')) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
}
```

5. **Add to Middleware (if route-level protection needed):**
```javascript
if (path.startsWith('/dashboard/new-module')) {
  const hasPermission = token.permissions?.includes('new_module.action')
  if (!hasPermission) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }
}
```

### 10. **Testing Permissions**

To test different permission levels:
1. Create users with different roles via seed script or user management
2. Login as different users
3. Verify:
   - Navigation items appear/disappear correctly
   - API routes return appropriate errors
   - UI components show/hide based on permissions
   - Data filtering works (users see only their data)

### 11. **Security Considerations**

1. **Never trust client-side checks alone** - Always verify permissions server-side
2. **Use parameterized queries** - Prevent SQL injection
3. **Audit logging** - All permission-sensitive actions are logged
4. **Session validation** - Middleware validates sessions on every request
5. **Password requirements** - Enforced on first login
6. **Rate limiting** - Implemented on API routes (see Redis integration)

## Summary

The permission system works through multiple layers:
1. **Database**: Stores user roles
2. **Authentication**: NextAuth adds permissions to session
3. **Middleware**: Protects routes at the edge
4. **API Routes**: Verify permissions server-side
5. **Components**: Use hooks and guards for UI-level control

The system is functional but has some inconsistencies between the two permission definition files that should be consolidated for maintainability.



import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/constants/roles";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    const userRole = token?.role;

    // Redirect from root to dashboard if authenticated
    if (path === '/' && token) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Force password change on first login
    if (token?.isFirstLogin) {
      console.log('First login detected:', {
        path,
        isFirstLogin: token.isFirstLogin,
        user: token.email
      });
      
      // Allow access only to force-password-change page and its API
      const allowedPaths = [
        '/force-password-change',
        '/api/users/change-password',
        '/api/auth/signout'
      ];
      
      if (!allowedPaths.some(allowedPath => path.startsWith(allowedPath))) {
        console.log('Redirecting to force-password-change');
        return NextResponse.redirect(new URL('/force-password-change', req.url));
      }
    }

    // Check permissions for specific routes using unified permission system
    if (path.startsWith('/dashboard/purchase/approvals')) {
      // Only allow users with approval permissions
      const hasApprovalPermission = token.permissions?.includes(PERMISSIONS.PURCHASE.APPROVE_RFQ);
      if (!hasApprovalPermission) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    // Check permissions for user management
    if (path.startsWith('/dashboard/users')) {
      const hasUserManagePermission = token.permissions?.includes(PERMISSIONS.ADMIN.MANAGE_USERS);
      if (!hasUserManagePermission) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    // Check permissions for CRM module
    if (path.startsWith('/dashboard/crm')) {
      const hasCrmPermission = token.permissions?.includes(PERMISSIONS.CRM.VIEW_ALL) ||
                               token.permissions?.includes(PERMISSIONS.CRM.CUSTOMER_READ) ||
                               token.permissions?.includes(PERMISSIONS.CRM.LEAD_READ);
      if (!hasCrmPermission) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    // Check permissions for Inventory module
    // NOTE: WAREHOUSE_OPERATOR should NOT have access to inventory module, even if they have inventory permissions
    if (path.startsWith('/dashboard/inventory')) {
      // Block warehouse operators from accessing inventory module
      if (token.role === 'WAREHOUSE_OPERATOR') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
      
      const hasInventoryPermission = token.permissions?.includes(PERMISSIONS.INVENTORY.VIEW_ALL) ||
                                     token.permissions?.includes(PERMISSIONS.INVENTORY.PRODUCT_READ) ||
                                     token.permissions?.includes(PERMISSIONS.INVENTORY.STOCK_READ);
      if (!hasInventoryPermission) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    // Check permissions for Warehouse module
    if (path.startsWith('/dashboard/warehouse')) {
      // Allow warehouse operators and inventory users by role, or check permissions for others
      const isWarehouseOperator = token.role === 'WAREHOUSE_OPERATOR';
      const isInventoryUser = token.role === 'INVENTORY_USER';
      const hasWarehousePermission = token.permissions?.includes(PERMISSIONS.WAREHOUSE.VIEW_ALL) ||
                                     token.permissions?.includes(PERMISSIONS.WAREHOUSE.SHIPMENT_READ);
      
      // Allow access if user is warehouse operator, inventory user, or has warehouse permissions
      if (!isWarehouseOperator && !isInventoryUser && !hasWarehousePermission) {
        console.log('🚫 Warehouse access denied:', {
          role: token.role,
          hasPermission: hasWarehousePermission,
          permissions: token.permissions?.slice(0, 5)
        });
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
      
      // Debug logging
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Warehouse access granted:', {
          role: token.role,
          isWarehouseOperator,
          isInventoryUser,
          hasPermission: hasWarehousePermission,
          path
        });
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
);

// Protect all routes under /dashboard
export const config = {
  matcher: ['/dashboard/:path*']
};

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

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

    // Check if user is admin (super_admin or admin)
    const isAdmin = userRole === 'super_admin' || userRole === 'admin';
    
    // Check if user is purchase user or purchase manager
    const isPurchaseRole = userRole === 'purchase_user' || userRole === 'purchase_manager';

    // Route guards for purchase users and purchase managers
    // They can only access: Purchase, Analytics, Settings, and Dashboard
    if (isPurchaseRole && path.startsWith('/dashboard')) {
      // Normalize path (remove trailing slash for comparison)
      const normalizedPath = path.replace(/\/$/, '') || '/dashboard';
      
      // Check if accessing main dashboard
      if (normalizedPath === '/dashboard') {
        // Allow access to main dashboard
        return NextResponse.next();
      }

      // Allowed paths for purchase users/managers
      const allowedPaths = [
        '/dashboard/purchase', // All purchase routes
        '/dashboard/analytics',
        '/dashboard/settings'
      ];

      // Check if the current path starts with any allowed path
      const isAllowed = allowedPaths.some(allowedPath => path.startsWith(allowedPath));

      if (!isAllowed) {
        // Redirect to dashboard if trying to access unauthorized route
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    // Check permissions for specific routes
    if (path.startsWith('/dashboard/purchase/approvals')) {
      // Only allow users with approval permissions
      const hasApprovalPermission = token.permissions?.includes('purchase.approve_rfq');
      if (!hasApprovalPermission) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    // Check permissions for user management
    if (path.startsWith('/dashboard/users')) {
      const hasUserManagePermission = token.permissions?.includes('admin.manage_users');
      if (!hasUserManagePermission) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
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

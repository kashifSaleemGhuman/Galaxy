import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

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

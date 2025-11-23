import { getServerSession } from 'next-auth/next';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { ROLES, ROLE_PERMISSIONS } from './constants/roles';
import { prisma } from './db';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          // Find user in database
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });

          if (!user) return null;

          // Verify password
          const isValidPassword = await compare(credentials.password, user.password);
          
          if (isValidPassword) {
            // Create audit log for successful login
            await prisma.auditLog.create({
              data: {
                userId: user.id,
                action: 'LOGIN',
                details: 'User logged in successfully'
              }
            });

            // Never send the password
            const { password, ...userWithoutPass } = user;
            return userWithoutPass;
          }

          return null;
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.permissions = ROLE_PERMISSIONS[user.role] || [];
        token.userId = user.id;
        token.isFirstLogin = user.isFirstLogin;
        token.email = user.email;
        
        // Debug logging (remove in production)
        if (process.env.NODE_ENV === 'development') {
          const hasWarehouseViewAll = token.permissions?.includes('warehouse.view_all');
          const hasWarehouseShipmentRead = token.permissions?.includes('warehouse.shipment.read');
          console.log('🔐 Auth JWT Callback:', {
            userId: user.id,
            email: user.email,
            role: user.role,
            permissionsCount: token.permissions?.length || 0,
            hasWarehouseViewAll,
            hasWarehouseShipmentRead,
            firstFewPermissions: token.permissions?.slice(0, 5)
          });
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role;
        session.user.permissions = token.permissions;
        session.user.id = token.userId || token.id;
        session.user.isFirstLogin = token.isFirstLogin;
        session.user.email = token.email;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/error',
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key'
};

export const authConfig = authOptions;

// Middleware to check permissions
export async function checkPermission(permission) {
  const session = await getServerSession();
  if (!session) return false;
  
  return session.user.permissions.includes(permission);
}

// Get user's role
export async function getUserRole() {
  const session = await getServerSession();
  return session?.user?.role || null;
}

// Check if user is admin or manager
export async function isAdminOrManager() {
  const role = await getUserRole();
  return [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PURCHASE_MANAGER].includes(role);
}

// Navigation menu based on role
export function getNavigationMenu(role) {
  const baseMenu = [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: 'HomeIcon'
    }
  ];

  const roleBasedMenu = {
    [ROLES.SUPER_ADMIN]: [
      {
        title: 'User Management',
        path: '/dashboard/users',
        icon: 'UsersIcon'
      },
      {
        title: 'System Settings',
        path: '/dashboard/settings',
        icon: 'SettingsIcon'
      }
    ],
    [ROLES.PURCHASE_MANAGER]: [
      {
        title: 'Approvals',
        path: '/dashboard/purchase/approvals',
        icon: 'CheckCircleIcon',
        badge: 'pendingCount' // Dynamic badge for pending approvals
      },
      {
        title: 'Reports',
        path: '/dashboard/purchase/reports',
        icon: 'ChartBarIcon'
      }
    ],
    [ROLES.PURCHASE_USER]: [
      {
        title: 'My RFQs',
        path: '/dashboard/purchase/my-rfqs',
        icon: 'DocumentIcon'
      }
    ]
  };

  return [...baseMenu, ...(roleBasedMenu[role] || [])];
}
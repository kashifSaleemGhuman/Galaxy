import { getServerSession } from 'next-auth/next';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './db';
import { ROLES, ROLE_PERMISSIONS } from './constants/roles';

export const authConfig = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          })

          if (!user) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        } catch (error) {
          console.error('Authentication error:', error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.permissions = ROLE_PERMISSIONS[user.role] || [];
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.permissions = token.permissions;
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/error',
  }
};

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
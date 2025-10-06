import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { ROLES, ROLE_PERMISSIONS } from '@/lib/constants/roles';
import prisma from '@/lib/db';

// Mock users for demonstration (In real app, this would be your database)
export let users = [
  {
    id: 1,
    email: 'admin@galaxy.com',
    name: 'Admin User',
    password: 'admin123', // In real app, this would be hashed
    role: ROLES.SUPER_ADMIN,
    isFirstLogin: true
  },
  {
    id: 2,
    email: 'manager@galaxy.com',
    name: 'Purchase Manager',
    password: 'manager123',
    role: ROLES.PURCHASE_MANAGER,
    isFirstLogin: true
  },
  {
    id: 3,
    email: 'user@galaxy.com',
    name: 'Purchase User',
    password: 'user123',
    role: ROLES.PURCHASE_USER,
    isFirstLogin: true
  }
];

// Function to update user data (in real app, this would be a database update)
export const updateUser = (email, updates) => {
  const userIndex = users.findIndex(u => u.email === email);
  if (userIndex === -1) return null;
  
  users[userIndex] = { ...users[userIndex], ...updates };
  return users[userIndex];
};

const handler = NextAuth({
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
        token.role = user.role;
        token.permissions = ROLE_PERMISSIONS[user.role] || [];
        token.userId = user.id;
        token.isFirstLogin = user.isFirstLogin;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role;
        session.user.permissions = token.permissions;
        session.user.id = token.userId;
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
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key' // In production, use environment variable
});

export { handler as GET, handler as POST };
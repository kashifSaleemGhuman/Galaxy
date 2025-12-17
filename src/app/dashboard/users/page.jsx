'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import UserManagement from './_components/UserManagement';
import { ROLES } from '@/lib/constants/roles';

export default function UsersPage() {
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/login');
    },
  });

  useEffect(() => {
    if (session?.user && ![ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(session.user.role)) {
      router.push('/dashboard');
    }
  }, [session, router]);

  if (!session?.user || ![ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(session.user.role)) {
    return null;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
        <p className="mt-1 text-sm text-gray-600">
          Add, edit, and manage user accounts and their roles.
        </p>
      </div>
      <UserManagement />
    </div>
  );
}
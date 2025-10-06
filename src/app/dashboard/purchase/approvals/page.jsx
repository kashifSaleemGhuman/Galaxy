'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ROLES } from '@/lib/constants/roles';
import RFQApprovalsList from './_components/RFQApprovalsList';

export default function ApprovalsPage() {
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/login');
    },
  });

  useEffect(() => {
    if (session?.user && ![ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PURCHASE_MANAGER].includes(session.user.role)) {
      router.push('/dashboard');
    }
  }, [session, router]);

  if (!session?.user || ![ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PURCHASE_MANAGER].includes(session.user.role)) {
    return null;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">RFQ Approvals</h1>
        <p className="mt-1 text-sm text-gray-600">
          Review and approve/reject RFQs from vendors.
        </p>
      </div>
      <RFQApprovalsList />
    </div>
  );
}
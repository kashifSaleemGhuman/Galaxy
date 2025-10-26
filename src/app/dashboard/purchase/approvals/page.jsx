'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ROLES } from '@/lib/constants/roles';
import RFQApprovalsList from './_components/RFQApprovalsList';
import UserRFQStatusList from './_components/UserRFQStatusList';

export default function ApprovalsPage() {
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/login');
    },
  });

  const isManager = session?.user && [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PURCHASE_MANAGER].includes(session.user.role);

  if (!session?.user) {
    return null;
  }

  return (
    <div className="p-6">
      {isManager ? (
        <>
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">RFQ Approvals</h1>
            <p className="mt-1 text-sm text-gray-600">
              Review and approve/reject RFQs from vendors.
            </p>
          </div>
          <RFQApprovalsList />
        </>
      ) : (
        <>
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">My RFQ Status</h1>
            <p className="mt-1 text-sm text-gray-600">
              Track the status of your RFQs and manager responses.
            </p>
          </div>
          <UserRFQStatusList />
        </>
      )}
    </div>
  );
}
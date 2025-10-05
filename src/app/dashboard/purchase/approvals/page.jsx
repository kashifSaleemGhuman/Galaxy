import React from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { PERMISSIONS } from '@/lib/constants/roles';
import PendingApprovals from './_components/PendingApprovals';

export default async function ApprovalsPage() {
  const session = await getServerSession();
  
  // Check if user has approval permissions
  if (!session?.user?.permissions?.includes(PERMISSIONS.PURCHASE.APPROVE_RFQ)) {
    redirect('/dashboard');
  }

  return <PendingApprovals />;
}

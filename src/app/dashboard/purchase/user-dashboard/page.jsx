'use client';

import React from 'react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import Dasboard from '../_components/Dasboard';

export default function UserDashboardPage() {
  const breadcrumbs = [
    { key: "purchase", label: "Purchase" },
    { key: "user-dashboard", label: "User Dashboard" },
  ];

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <Dasboard />
    </>
  );
}

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

export default function ManagerDashboardPage() {
  const router = useRouter();

  const breadcrumbs = [
    { key: "purchase", label: "Purchase" },
    { key: "manager-dashboard", label: "Manager Dashboard" },
  ];

  return (
    <div className="p-6">
      <Breadcrumbs items={breadcrumbs} />
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Purchase Manager Dashboard</h1>
        <p className="text-gray-600">Manage RFQ approvals and purchase operations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/dashboard/purchase/approvals')}
              className="w-full bg-gradient-to-r from-blue-600 to-black hover:from-blue-700 hover:to-gray-900 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              View Pending Approvals
            </button>
            <button
              onClick={() => router.push('/dashboard/purchase')}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              View All RFQs
            </button>
            <button
              onClick={() => router.push('/dashboard/purchase/polling')}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Back to Polling
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Pending Approvals</span>
              <span className="font-semibold text-blue-600">0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Approved Today</span>
              <span className="font-semibold text-green-600">0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Rejected Today</span>
              <span className="font-semibold text-red-600">0</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="text-gray-500 text-sm">
            No recent activity
          </div>
        </div>
      </div>

      {/* Manager-specific content */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Manager Tools</h3>
        <p className="text-blue-700 text-sm mb-4">
          As a purchase manager, you have access to approval workflows and oversight tools.
        </p>
        <div className="flex space-x-3">
          <button
            onClick={() => router.push('/dashboard/purchase/approvals')}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors"
          >
            Manage Approvals
          </button>
          <button
            onClick={() => router.push('/dashboard/purchase')}
            className="bg-white hover:bg-gray-50 text-blue-600 border border-blue-600 text-sm font-medium py-2 px-4 rounded-md transition-colors"
          >
            View All RFQs
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { usePolling } from '@/hooks/usePolling';
import api from '@/lib/api/service';

export default function ManagerPollingPage() {
  const [pendingCount, setPendingCount] = useState(0);
  const [lastCheck, setLastCheck] = useState(new Date());
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  const checkForPendingApprovals = async () => {
    try {
      const data = await api.get('/api/rfqs/approvals', { status: 'pending', limit: 1 });
      const pendingRfqs = data.rfqs || [];
      
      setPendingCount(pendingRfqs.length);
      setLastCheck(new Date());
      
      // If there are pending approvals, redirect to approvals page
      if (pendingRfqs.length > 0) {
        setIsRedirecting(true);
        router.push('/dashboard/purchase/approvals');
      }
    } catch (error) {
      console.error('Error checking for pending approvals:', error);
    }
  };

  // Poll every 5 seconds for pending approvals
  const { isPolling, error: pollingError } = usePolling(
    checkForPendingApprovals,
    5000, // Poll every 5 seconds
    true // Enabled
  );

  // Check immediately on mount
  useEffect(() => {
    checkForPendingApprovals();
  }, []);

  const formatLastCheck = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Purchase Manager Dashboard
          </h1>
          <p className="text-gray-600">
            Monitoring for new RFQ approvals...
          </p>
        </div>

        {/* Polling Status */}
        <div className="mb-6">
          {isPolling && (
            <div className="flex items-center justify-center text-blue-600 mb-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              <span className="text-sm">Checking for new approvals...</span>
            </div>
          )}
          
          {pollingError && (
            <div className="text-red-600 text-sm mb-2">
              Connection error: {pollingError}
            </div>
          )}

          <div className="text-sm text-gray-500">
            Last checked: {formatLastCheck(lastCheck)}
          </div>
        </div>

        {/* Status Information */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="text-lg font-semibold text-gray-900 mb-2">
            {pendingCount} Pending Approval{pendingCount !== 1 ? 's' : ''}
          </div>
          <p className="text-sm text-gray-600">
            {pendingCount > 0 
              ? 'You will be redirected to the approvals page shortly...'
              : 'No pending approvals at the moment'
            }
          </p>
        </div>

        {/* Redirecting Message */}
        {isRedirecting && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-center text-blue-800">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              <span className="text-sm font-medium">Redirecting to approvals page...</span>
            </div>
          </div>
        )}

        {/* Manual Navigation */}
        <div className="space-y-2">
          <button
            onClick={() => router.push('/dashboard/purchase/approvals')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Go to Approvals Page
          </button>
          <button
            onClick={() => router.push('/dashboard/purchase')}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Go to Purchase Dashboard
          </button>
        </div>

        {/* User Info */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            Logged in as: <span className="font-medium">{session?.user?.name || session?.user?.email}</span>
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Role: {session?.user?.role || 'Purchase Manager'}
          </div>
        </div>
      </div>
    </div>
  );
}

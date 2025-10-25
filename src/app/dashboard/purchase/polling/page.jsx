'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useDebouncedPolling } from '@/hooks/useDebouncedPolling';
import api from '@/lib/api/service';
import PollingAnimation from '@/components/ui/PollingAnimation';

export default function ManagerPollingPage() {
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [lastCheck, setLastCheck] = useState(new Date());
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [redirectMessage, setRedirectMessage] = useState('');
  const router = useRouter();
  const { data: session } = useSession();

  // Only show this page for managers
  const isManager = ['super_admin', 'admin', 'purchase_manager'].includes(session?.user?.role);

  const checkForUpdates = async () => {
    try {
      setLastCheck(new Date());
      
      // Check for pending approvals (managers only)
      const approvalsData = await api.get('/api/rfqs/approvals', { status: 'pending', limit: 1 });
      const pendingApprovalsList = approvalsData.rfqs || [];
      setPendingApprovals(pendingApprovalsList.length);
      
      if (pendingApprovalsList.length > 0 && !isRedirecting) {
        setIsRedirecting(true);
        setRedirectMessage('New RFQ approvals pending! Redirecting...');
        setTimeout(() => {
          router.push('/dashboard/purchase/approvals');
        }, 2000);
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
    }
  };

  // Poll every 10 seconds with debounce
  const { isPolling, error: pollingError } = useDebouncedPolling(
    checkForUpdates,
    10000, // Poll every 10 seconds
    true, // Enabled
    2000 // Debounce for 2 seconds
  );

  // Check immediately on mount
  useEffect(() => {
    if (session?.user?.id && isManager) {
      checkForUpdates();
    }
  }, [session?.user?.id, isManager]);

  // Redirect non-managers to user dashboard
  useEffect(() => {
    if (session?.user?.id && !isManager) {
      router.push('/dashboard/purchase/user-dashboard');
    }
  }, [session?.user?.id, isManager, router]);

  const formatLastCheck = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Show loading if not a manager
  if (session?.user?.id && !isManager) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to user dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-2xl p-8 border-l-4 border-blue-500">
        <div className="text-center mb-8">
          {/* Polling Animation - Fixed height to prevent jittering */}
          <div className="flex justify-center mb-6 h-48 items-center">
            <PollingAnimation isPolling={isPolling} size="xlarge" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Purchase Manager Dashboard
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Monitoring for new RFQ approvals...
          </p>
          <p className="text-sm text-gray-500">
            You will be automatically redirected when new RFQs require approval
          </p>
        </div>

        {/* Polling Status - Fixed height to prevent jittering */}
        <div className="mb-8 min-h-[80px]">
          {isPolling && (
            <div className="flex items-center justify-center text-blue-600 mb-4">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
              <span className="text-sm font-medium">
                Checking for new approvals...
              </span>
            </div>
          )}
          
          {pollingError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <div className="text-red-800 text-sm">
                Connection error: {pollingError}
              </div>
            </div>
          )}

          <div className="text-sm text-gray-500 text-center">
            Last checked: {formatLastCheck(lastCheck)}
          </div>
        </div>

        {/* Status Information - Fixed height to prevent jittering */}
        <div className="bg-blue-50 rounded-lg p-6 mb-8 min-h-[120px] flex items-center">
          <div className="text-center w-full">
            <div className="text-2xl font-bold text-blue-900 mb-2">
              {pendingApprovals} Pending Approval{pendingApprovals !== 1 ? 's' : ''}
            </div>
            <p className="text-blue-700">
              {pendingApprovals > 0 
                ? 'You will be redirected to the approvals page shortly...'
                : 'No pending approvals at the moment'
              }
            </p>
          </div>
        </div>


        {/* Redirecting Message */}
        {isRedirecting && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center text-blue-800">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              <span className="text-sm font-medium">{redirectMessage}</span>
            </div>
          </div>
        )}


        {/* User Info */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-500 text-center">
            Logged in as: <span className="font-medium">{session?.user?.name || session?.user?.email}</span>
          </div>
          <div className="text-xs text-gray-400 text-center mt-1">
            Role: Purchase Manager
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useDebouncedPolling } from '@/hooks/useDebouncedPolling';
import api from '@/lib/api/service';

export default function UserPollingPage() {
  const [myRfqs, setMyRfqs] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastCheck, setLastCheck] = useState(new Date());
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  const checkForMyRfqs = async () => {
    try {
      // Get user's RFQs
      const data = await api.get('/api/rfqs', { status: 'all', limit: 100 });
      const allRfqs = data.rfqs || [];
      
      // Filter for current user's RFQs
      const userRfqs = allRfqs.filter(rfq => rfq.createdById === session?.user?.id);
      setMyRfqs(userRfqs);
      
      // Count pending RFQs (sent, received)
      const pendingRfqs = userRfqs.filter(rfq => 
        ['sent', 'received'].includes(rfq.status)
      );
      setPendingCount(pendingRfqs.length);
      setLastCheck(new Date());
      
      // If there are pending RFQs, redirect to dashboard
      if (pendingRfqs.length > 0) {
        setIsRedirecting(true);
        router.push('/dashboard/purchase');
      }
    } catch (error) {
      console.error('Error checking for user RFQs:', error);
    }
  };

  // Poll every 15 seconds for user's RFQs with debounce
  const { isPolling, error: pollingError } = useDebouncedPolling(
    checkForMyRfqs,
    15000, // Poll every 15 seconds
    true, // Enabled
    2000 // Debounce for 2 seconds
  );

  // Check immediately on mount
  useEffect(() => {
    if (session?.user?.id) {
      checkForMyRfqs();
    }
  }, [session?.user?.id]);

  const formatLastCheck = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'received': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'draft': return 'Draft';
      case 'sent': return 'Sent to Vendor';
      case 'received': return 'Quote Received';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Purchase User Dashboard
          </h1>
          <p className="text-gray-600">
            Monitoring your RFQ status...
          </p>
        </div>

        {/* Polling Status */}
        <div className="mb-6">
          {isPolling && (
            <div className="flex items-center justify-center text-green-600 mb-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
              <span className="text-sm">Checking for updates...</span>
            </div>
          )}
          
          {pollingError && (
            <div className="text-red-600 text-sm mb-2">
              Connection error: {pollingError}
            </div>
          )}

          <div className="text-sm text-gray-500 text-center">
            Last checked: {formatLastCheck(lastCheck)}
          </div>
        </div>

        {/* Status Information */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="text-lg font-semibold text-gray-900 mb-2">
            {pendingCount} Pending RFQ{pendingCount !== 1 ? 's' : ''}
          </div>
          <p className="text-sm text-gray-600">
            {pendingCount > 0 
              ? 'You will be redirected to the dashboard shortly...'
              : 'No pending RFQs at the moment'
            }
          </p>
        </div>

        {/* My RFQs List */}
        {myRfqs.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">My RFQs</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {myRfqs.map((rfq) => (
                <div key={rfq.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {rfq.rfqNumber || `RFQ-${rfq.id.slice(-6)}`}
                    </div>
                    <div className="text-sm text-gray-500">
                      {rfq.vendor?.name || 'Vendor'}
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(rfq.status)}`}>
                    {getStatusLabel(rfq.status)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Redirecting Message */}
        {isRedirecting && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center text-green-800">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
              <span className="text-sm font-medium">Redirecting to dashboard...</span>
            </div>
          </div>
        )}

        {/* Manual Navigation */}
        <div className="space-y-2">
          <button
            onClick={() => router.push('/dashboard/purchase')}
            className="w-full bg-gradient-to-r from-green-600 to-green-900 hover:from-green-700 hover:to-black text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Go to Purchase Dashboard
          </button>
          <button
            onClick={() => router.push('/dashboard/purchase')}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Create New RFQ
          </button>
        </div>

        {/* User Info */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-500 text-center">
            Logged in as: <span className="font-medium">{session?.user?.name || session?.user?.email}</span>
          </div>
          <div className="text-xs text-gray-400 text-center mt-1">
            Role: {session?.user?.role || 'Purchase User'}
          </div>
        </div>
      </div>
    </div>
  );
}

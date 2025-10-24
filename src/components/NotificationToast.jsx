'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { notificationService } from '@/lib/notifications';

const STATUS_COLORS = {
  approved: 'bg-green-100 border-green-200 text-green-800',
  rejected: 'bg-red-100 border-red-200 text-red-800',
  received: 'bg-yellow-100 border-yellow-200 text-yellow-800',
  sent: 'bg-blue-100 border-blue-200 text-blue-800'
};

export default function NotificationToast() {
  const [notifications, setNotifications] = useState([]);
  const { data: session } = useSession();

  useEffect(() => {
    const handleRfqUpdate = (data) => {
      console.log('RFQ update received:', data);
      
      // Determine current user's role
      const isManager = session?.user?.role && ['super_admin', 'admin', 'purchase_manager'].includes(session.user.role);
      const currentUserRole = isManager ? 'manager' : 'user';
      
      // Check if notification is targeted for this user's role
      if (data.targetRole && data.targetRole !== currentUserRole) {
        console.log('❌ Skipping notification - wrong target role:', data.targetRole, 'current:', currentUserRole);
        return;
      }
      
      // Create unique key for this specific status change
      const notificationKey = `${data.rfqId}-${data.previousStatus}-${data.status}`;
      
      // Check if we already have this exact notification visible
      const isAlreadyVisible = notifications.some(n => 
        n.data.rfqId === data.rfqId && 
        n.data.previousStatus === data.previousStatus && 
        n.data.status === data.status
      );
      
      // Check localStorage for recently processed notifications (last 30 seconds)
      const now = Date.now();
      const recentNotifications = JSON.parse(localStorage.getItem('recentNotifications') || '{}');
      const wasRecentlyProcessed = recentNotifications[notificationKey] && 
        (now - recentNotifications[notificationKey]) < 30000; // 30 seconds
      
      // Only process if not already visible AND not recently processed
      if (!isAlreadyVisible && !wasRecentlyProcessed) {
        console.log('✅ Showing notification:', notificationKey);
        const notificationId = Date.now();
        
        // Add to notifications list
        setNotifications(prev => [...prev, {
          id: notificationId,
          type: 'rfq_update',
          data: data,
          timestamp: new Date().toISOString()
        }]);

        // Mark this notification as recently processed in localStorage
        recentNotifications[notificationKey] = now;
        localStorage.setItem('recentNotifications', JSON.stringify(recentNotifications));

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== notificationId));
        }, 5000);

        // Show browser notification
        notificationService.showBrowserNotification(
          'RFQ Status Update',
          {
            body: `Your RFQ ${data.rfqNumber} has been ${data.status}`,
            tag: `rfq-${data.rfqId}`
          }
        );
      } else {
        console.log('❌ Skipping duplicate notification:', notificationKey, {
          isAlreadyVisible,
          wasRecentlyProcessed
        });
      }
    };

    // Subscribe to RFQ updates
    notificationService.subscribe('rfq_update', handleRfqUpdate);

    // Request notification permission
    notificationService.requestPermission();

    // Clean up old localStorage entries periodically
    const cleanup = setInterval(() => {
      const now = Date.now();
      const recentNotifications = JSON.parse(localStorage.getItem('recentNotifications') || '{}');
      const cleanedNotifications = {};
      
      // Keep only notifications from the last 5 minutes
      Object.entries(recentNotifications).forEach(([key, timestamp]) => {
        if (now - timestamp < 300000) { // 5 minutes
          cleanedNotifications[key] = timestamp;
        }
      });
      
      localStorage.setItem('recentNotifications', JSON.stringify(cleanedNotifications));
    }, 300000); // Clean every 5 minutes

    return () => {
      notificationService.unsubscribe('rfq_update', handleRfqUpdate);
      clearInterval(cleanup);
    };
  }, [session, notifications]);

  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`border rounded-lg shadow-xl p-4 animate-slide-in ${
            STATUS_COLORS[notification.data?.status] || 'bg-gray-100 border-gray-200 text-gray-800'
          }`}
          style={{
            animation: 'slideIn 0.3s ease-out'
          }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-1">
                {notification.data?.status === 'approved' && (
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {notification.data?.status === 'rejected' && (
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                {notification.data?.status === 'received' && (
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )}
                <h4 className="font-semibold text-sm">
                  {notification.data?.status === 'approved' && 'RFQ Approved ✓'}
                  {notification.data?.status === 'rejected' && 'RFQ Rejected'}
                  {notification.data?.status === 'received' && 'New Quote Received 📋'}
                  {notification.data?.status === 'sent' && 'RFQ Sent'}
                </h4>
              </div>
              <p className="text-xs mt-1">
                {notification.data?.status === 'received' 
                  ? `New quote for RFQ ${notification.data?.rfqNumber} - $${notification.data?.vendorPrice}`
                  : `RFQ ${notification.data?.rfqNumber} has been ${notification.data?.status}`
                }
              </p>
              <p className="text-xs mt-2 opacity-75 flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {new Date(notification.timestamp).toLocaleTimeString()}
              </p>
              <p className="text-xs mt-1 opacity-60">
                Auto-dismissing in 5 seconds...
              </p>
            </div>
            <button
              onClick={() => dismissNotification(notification.id)}
              className="ml-2 text-gray-500 hover:text-gray-700 font-bold text-lg leading-none"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        </div>
      ))}
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

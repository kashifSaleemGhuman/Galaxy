import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import RfqForm from './rfq/RfqForm';
import RfqList from './rfq/RfqList';
import RfqDetails from './rfq/RfqDetails';
import { RFQ_STATUS } from './rfq/constants';
import api from '@/lib/api/service';
import { useDebouncedPolling } from '@/hooks/useDebouncedPolling';
import { notificationService } from '@/lib/notifications';

// Stats card component for displaying RFQ metrics
const StatsCard = ({ title, value, onClick, isActive }) => (
  <div
    onClick={onClick}
    className={`${
      isActive ? 'bg-blue-600' : 'bg-black hover:bg-gray-800'
    } p-4 rounded-lg text-center cursor-pointer transition-colors duration-200`}
  >
    <div className="text-3xl font-bold text-white">{value}</div>
    <div className="text-sm text-gray-400">{title}</div>
  </div>
);

// Empty state component when no RFQs exist
const EmptyState = ({ onCreateNew }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <div className="mb-4">
      <img
        src="/file.svg"
        alt="No RFQs"
        className="w-24 h-24 opacity-50"
      />
    </div>
    <h3 className="text-xl font-semibold mb-2">
      No request for quotation found. Let's create one!
    </h3>
    <p className="text-gray-500 mb-4 max-w-md">
      Requests for quotation are documents that will be sent to your suppliers to request
      prices for different products you consider buying. Once an agreement has been found
      with the supplier, they will be confirmed and turned into purchase orders.
    </p>
    <Button onClick={onCreateNew} className="bg-gradient-to-r from-blue-600 to-black hover:from-blue-700 hover:to-gray-900">
      Create New RFQ
    </Button>
  </div>
);

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [rfqs, setRfqs] = useState([]);
  const [previousRfqs, setPreviousRfqs] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [redirectMessage, setRedirectMessage] = useState('');
  const [sentNotifications, setSentNotifications] = useState(new Set());
  const router = useRouter();
  const [stats, setStats] = useState({
    new: 0,
    rfqSent: 0,
    lateRFQ: 0,
    notAcknowledged: 0,
    lateReceipt: 0,
    daysToOrder: '0.00'
  });
  const [showForm, setShowForm] = useState(false);
  const [selectedRfq, setSelectedRfq] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  const fetchStats = useCallback(async () => {
    try {
      const data = await api.get('/api/purchase/stats');
      if (data?.stats) setStats(data.stats);
    } catch (e) {
      // Fallback to client-side calculation if stats API fails
      setStats((prev) => ({ ...prev }));
    }
  }, []);

  const fetchRfqs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get('/api/rfqs', { status: 'all', limit: 100 });
      const newRfqs = data.rfqs || [];
      
      // Detect status changes and emit notifications
      setPreviousRfqs(prevRfqs => {
        if (prevRfqs.length > 0) {
          newRfqs.forEach(newRfq => {
            const oldRfq = prevRfqs.find(r => r.id === newRfq.id);
            if (oldRfq && oldRfq.status !== newRfq.status) {
              // Create unique notification key to prevent duplicates
              const notificationKey = `${newRfq.id}-${oldRfq.status}-${newRfq.status}`;
              
              // Only emit notification if we haven't already sent this specific status change
              setSentNotifications(prevNotifications => {
                if (!prevNotifications.has(notificationKey)) {
                  console.log('RFQ status changed:', {
                    rfqNumber: newRfq.rfqNumber,
                    from: oldRfq.status,
                    to: newRfq.status
                  });
                  
                  notificationService.emit('rfq_update', {
                    rfqId: newRfq.id,
                    rfqNumber: newRfq.rfqNumber,
                    status: newRfq.status,
                    previousStatus: oldRfq.status,
                    targetRole: 'user' // Show to purchase user
                  });

                  // Check if manager responded (approved/rejected) - refresh the page
                  if ((oldRfq.status === 'sent' || oldRfq.status === 'received') && 
                      (newRfq.status === 'approved' || newRfq.status === 'rejected')) {
                    if (!isRedirecting) {
                      setIsRedirecting(true);
                      setRedirectMessage(`Manager ${newRfq.status} your RFQ ${newRfq.rfqNumber}! Refreshing page...`);
                      setTimeout(() => {
                        window.location.reload();
                      }, 2000);
                    }
                  }

                  // Mark this notification as sent
                  return new Set([...prevNotifications, notificationKey]);
                }
                return prevNotifications;
              });
            }
          });
        }
        return newRfqs;
      });
      
      setRfqs(newRfqs);
      setLastUpdated(new Date());
    } catch (e) {
      console.error('Error loading RFQs:', e);
    } finally {
      setLoading(false);
    }
  }, [isRedirecting]);

  useEffect(() => {
    fetchRfqs();
    fetchStats();
  }, [fetchRfqs, fetchStats]);

  // Clean up old notification tracking to prevent memory leaks
  useEffect(() => {
    const cleanup = setInterval(() => {
      setSentNotifications(new Set());
    }, 300000); // Clear every 5 minutes

    return () => clearInterval(cleanup);
  }, []);

  // Clear redirect state when component unmounts
  useEffect(() => {
    return () => {
      setIsRedirecting(false);
      setRedirectMessage('');
    };
  }, []);

  const calculateAverageDaysToOrder = (rfqs) => {
    const completedRfqs = rfqs.filter(rfq => rfq.status === RFQ_STATUS.ACCEPTED || rfq.status === 'approved');
    if (completedRfqs.length === 0) return '0.00';

    const totalDays = completedRfqs.reduce((sum, rfq) => {
      const start = rfq.sentDate ? new Date(rfq.sentDate) : new Date(rfq.createdAt);
      const end = new Date(rfq.approvedAt || rfq.acceptedDate || rfq.updatedAt);
      return sum + (end - start) / (1000 * 60 * 60 * 24);
    }, 0);

    return (totalDays / completedRfqs.length).toFixed(2);
  };

  const handleCreateNew = () => {
    setShowForm(true);
  };

  const handleCreateRfq = async (formData) => {
    try {
      setLoading(true);
      const { rfq } = await api.post('/api/rfqs', {
        vendorId: formData.vendorId,
        orderDeadline: formData.orderDeadline,
        items: formData.products.map(p => ({
          productId: p.productId,
          quantity: parseInt(p.quantity, 10),
          unit: p.unit
        }))
      });
      // Refresh list and stats from server to ensure consistency
      await Promise.all([fetchRfqs(), fetchStats()]);
      setShowForm(false);
      setActiveFilter('all');
      setSelectedRfq(rfq);
    } catch (error) {
      console.error('Error creating RFQ:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    await Promise.all([fetchRfqs(), fetchStats()]);
  }, [fetchRfqs, fetchStats]);

  // Set up polling for real-time updates - stop when redirecting
  const { isPolling, error: pollingError } = useDebouncedPolling(
    handleRefresh,
    15000, // Poll every 15 seconds
    !isRedirecting, // Disabled when redirecting
    2000 // Debounce for 2 seconds
  );


  if (loading && rfqs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Format last updated time
  const getTimeSinceUpdate = () => {
    const seconds = Math.floor((new Date() - lastUpdated) / 1000);
    if (seconds < 10) return 'just now';
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes === 1) return '1 minute ago';
    return `${minutes} minutes ago`;
  };

  return (
    <div className="p-6">
      {/* Polling Status Bar - Hide when redirecting */}
      {!isRedirecting && (
        <div className="mb-4 flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            {isPolling ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
                <span className="text-sm font-medium text-blue-800">Checking for updates...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm font-medium text-gray-700">Real-time monitoring active</span>
              </>
            )}
          </div>
          <span className="text-xs text-gray-500">Last updated: {getTimeSinceUpdate()}</span>
        </div>
      )}
      
      {pollingError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center text-red-800">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium">Update check failed: {pollingError}</span>
          </div>
        </div>
      )}

      {/* Redirect Message */}
      {isRedirecting && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-center text-green-800">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
            <span className="text-sm font-medium">{redirectMessage}</span>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatsCard 
          title="New" 
          value={stats.new} 
          onClick={() => setActiveFilter(RFQ_STATUS.DRAFT)}
          isActive={activeFilter === RFQ_STATUS.DRAFT}
        />
        <StatsCard 
          title="RFQ Sent" 
          value={stats.rfqSent} 
          onClick={() => setActiveFilter(RFQ_STATUS.SENT)}
          isActive={activeFilter === RFQ_STATUS.SENT}
        />
        <StatsCard 
          title="Late RFQ" 
          value={stats.lateRFQ} 
          onClick={() => setActiveFilter('late')}
          isActive={activeFilter === 'late'}
        />
        <StatsCard 
          title="Not Acknowledged" 
          value={stats.notAcknowledged} 
          onClick={() => setActiveFilter(RFQ_STATUS.SENT)}
          isActive={activeFilter === RFQ_STATUS.SENT}
        />
        <StatsCard 
          title="Late Receipt" 
          value={stats.lateReceipt}
          onClick={() => setActiveFilter('lateReceipt')}
          isActive={activeFilter === 'lateReceipt'}
        />
        <StatsCard 
          title="Days to Order" 
          value={stats.daysToOrder}
          onClick={() => setActiveFilter('all')}
          isActive={activeFilter === 'all'}
        />
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm">
        {rfqs.length === 0 && !showForm ? (
          <EmptyState onCreateNew={handleCreateNew} />
        ) : (
          <div className="p-4">
            {/* RFQ List or Form will be rendered here */}
            {showForm ? (
              <RfqForm 
                onSubmit={handleCreateRfq}
                onCancel={() => {
                  setShowForm(false);
                  setActiveFilter('all');
                }}
              />
            ) : selectedRfq ? (
              <RfqDetails
                rfq={selectedRfq}
                onBack={() => {
                  setSelectedRfq(null);
                }}
                onUpdateRfq={(updatedRfq) => {
                  setRfqs(prevRfqs => 
                    prevRfqs.map(rfq => 
                      rfq.id === updatedRfq.id ? updatedRfq : rfq
                    )
                  );
                	setSelectedRfq(updatedRfq);
                	fetchStats();
                }}
              />
            ) : (
              <RfqList 
                rfqs={rfqs}
                onCreateNew={handleCreateNew}
                onSelectRfq={setSelectedRfq}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
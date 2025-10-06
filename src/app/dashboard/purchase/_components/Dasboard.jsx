import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import RfqForm from './rfq/RfqForm';
import RfqList from './rfq/RfqList';
import RfqDetails from './rfq/RfqDetails';
import { RFQ_STATUS } from './rfq/constants';

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
    <Button onClick={onCreateNew} className="bg-blue-600 hover:bg-blue-700">
      Create New RFQ
    </Button>
  </div>
);

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [rfqs, setRfqs] = useState([]);
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

  const fetchRfqs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/rfqs?status=all&limit=100');
      if (!res.ok) {
        throw new Error('Failed to fetch RFQs');
      }
      const data = await res.json();
      setRfqs(data.rfqs || []);
    } catch (e) {
      console.error('Error loading RFQs:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRfqs();
  }, [fetchRfqs]);

  // Update stats whenever RFQs change
  useEffect(() => {
    const now = new Date();
    setStats({
      new: rfqs.filter(rfq => rfq.status === RFQ_STATUS.DRAFT || rfq.status === 'draft').length,
      rfqSent: rfqs.filter(rfq => rfq.status === RFQ_STATUS.SENT || rfq.status === 'sent').length,
      lateRFQ: rfqs.filter(rfq => {
        const deadline = new Date(rfq.orderDeadline);
        return deadline < now && !(rfq.status === RFQ_STATUS.ACCEPTED || rfq.status === 'accepted');
      }).length,
      notAcknowledged: rfqs.filter(rfq => rfq.status === RFQ_STATUS.SENT || rfq.status === 'sent').length,
      lateReceipt: 0,
      daysToOrder: calculateAverageDaysToOrder(rfqs)
    });
  }, [rfqs]);

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
      const res = await fetch('/api/rfqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId: formData.vendorId,
          orderDeadline: formData.orderDeadline,
          items: formData.products.map(p => ({
            productId: p.productId,
            quantity: parseInt(p.quantity, 10),
            unit: p.unit
          }))
        })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create RFQ');
      }
      const { rfq } = await res.json();
      // Refresh list from server to ensure consistency
      await fetchRfqs();
      setShowForm(false);
      setActiveFilter('all');
      // Optionally select created RFQ
      setSelectedRfq(rfq);
    } catch (error) {
      console.error('Error creating RFQ:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && rfqs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
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
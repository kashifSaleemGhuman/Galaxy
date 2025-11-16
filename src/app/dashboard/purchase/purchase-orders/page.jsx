'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Table } from '../_components/Table';
import { StatusBadge } from '../_components/StatusBadge';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';

export default function PurchaseOrdersPage() {
  const router = useRouter();
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [toast, setToast] = useState(null);

  const breadcrumbs = [
    { key: "purchase", label: "Purchase" },
    { key: "purchase-orders", label: "Purchase Orders" },
  ];

  useEffect(() => {
    fetchPurchaseOrders();
  }, [filter]);

  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.append('status', filter);
      }
      
      const response = await fetch(`/api/purchase/purchase-orders?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setPurchaseOrders(result.data);
      } else {
        setError(result.error || 'Failed to fetch purchase orders');
      }
    } catch (err) {
      setError('Failed to fetch purchase orders');
      console.error('Error fetching purchase orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFromRFQ = () => {
    router.push('/dashboard/purchase/purchase-orders/create-from-rfq');
  };

  const handleCreateStandalone = () => {
    router.push('/dashboard/purchase/purchase-orders/create');
  };

  const handleViewPO = (poId) => {
    router.push(`/dashboard/purchase/purchase-orders/${poId}`);
  };

  const handleSendPO = async (poId) => {
    try {
      const response = await fetch(`/api/purchase/purchase-orders/${poId}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes: 'Please process this purchase order',
          deliveryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setToast({
          type: 'success',
          message: 'Purchase Order sent to vendor successfully'
        });
        fetchPurchaseOrders(); // Refresh the list
      } else {
        setToast({
          type: 'error',
          message: result.error || 'Failed to send purchase order'
        });
      }
    } catch (err) {
      setToast({
        type: 'error',
        message: 'Failed to send purchase order'
      });
      console.error('Error sending purchase order:', err);
    }
  };

  const handleApprovePO = async (poId) => {
    try {
      const response = await fetch(`/api/purchase/purchase-orders/${poId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes: 'Purchase Order approved - creating incoming shipment'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setToast({
          type: 'success',
          message: `Purchase Order approved! Incoming shipment ${result.data.incomingShipment.shipmentNumber} created.`
        });
        fetchPurchaseOrders(); // Refresh the list
      } else {
        setToast({
          type: 'error',
          message: result.error || 'Failed to approve purchase order'
        });
      }
    } catch (err) {
      setToast({
        type: 'error',
        message: 'Failed to approve purchase order'
      });
      console.error('Error approving purchase order:', err);
    }
  };

  const getStatusColor = (status) => {
    const statusMap = {
      'draft': 'bg-gray-100 text-gray-700 border-gray-200',
      'sent': 'bg-blue-100 text-blue-700 border-blue-200',
      'approved': 'bg-green-100 text-green-700 border-green-200',
      'confirmed': 'bg-green-100 text-green-700 border-green-200',
      'received': 'bg-purple-100 text-purple-700 border-purple-200',
      'cancelled': 'bg-red-100 text-red-700 border-red-200',
    };
    return statusMap[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const columns = [
    { 
      key: 'po_id', 
      header: 'PO Number',
      cell: (row) => (
        <button 
          onClick={() => handleViewPO(row.po_id)}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          {row.po_id}
        </button>
      )
    },
    { key: 'supplier_name', header: 'Supplier' },
    { key: 'date_created', header: 'Date Created' },
    { 
      key: 'status', 
      header: 'Status', 
      cell: (row) => (
        <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(row.status)}`}>
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </span>
      )
    },
    { 
      key: 'total_amount', 
      header: 'Total Amount', 
      cell: (row) => `$${parseFloat(row.total_amount || 0).toFixed(2)}`
    },
    { 
      key: 'line_count', 
      header: 'Items',
      cell: (row) => `${row.line_count} items`
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleViewPO(row.po_id)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            View
          </button>
          {row.status === 'draft' && (
            <button
              onClick={() => handleSendPO(row.po_id)}
              className="text-green-600 hover:text-green-800 text-sm"
            >
              Send
            </button>
          )}
          {row.status === 'sent' && (
            <button
              onClick={() => handleApprovePO(row.po_id)}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Approve
            </button>
          )}
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbs} />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading purchase orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbs} />
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Purchase Orders</h2>
          <p className="text-gray-600 mt-1">Manage and track purchase orders</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            onClick={handleCreateFromRFQ}
            className="bg-gradient-to-r from-green-600 to-green-900 text-white hover:from-green-700 hover:to-black"
          >
            Create from RFQ
          </Button>
          <Button 
            onClick={handleCreateStandalone}
            className="bg-gradient-to-r from-blue-600 to-black text-white hover:from-blue-700 hover:to-gray-900"
          >
            New Purchase Order
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            filter === 'all' 
              ? 'bg-blue-100 text-blue-700 border border-blue-200' 
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('draft')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            filter === 'draft' 
              ? 'bg-blue-100 text-blue-700 border border-blue-200' 
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Draft
        </button>
        <button
          onClick={() => setFilter('sent')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            filter === 'sent' 
              ? 'bg-blue-100 text-blue-700 border border-blue-200' 
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Sent
        </button>
        <button
          onClick={() => setFilter('confirmed')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            filter === 'confirmed' 
              ? 'bg-blue-100 text-blue-700 border border-blue-200' 
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Confirmed
        </button>
        <button
          onClick={() => setFilter('received')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            filter === 'received' 
              ? 'bg-blue-100 text-blue-700 border border-blue-200' 
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Received
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {purchaseOrders.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No purchase orders found</h3>
          <p className="text-gray-500 mb-4">Get started by creating a new purchase order</p>
          <div className="flex justify-center space-x-3">
            <Button 
              onClick={handleCreateFromRFQ}
              className="bg-gradient-to-r from-green-600 to-green-900 text-white hover:from-green-700 hover:to-black"
            >
              Create from RFQ
            </Button>
            <Button 
              onClick={handleCreateStandalone}
              className="bg-gradient-to-r from-blue-600 to-black text-white hover:from-blue-700 hover:to-gray-900"
            >
              New Purchase Order
            </Button>
          </div>
        </div>
      ) : (
        <Table columns={columns} data={purchaseOrders} />
      )}

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}



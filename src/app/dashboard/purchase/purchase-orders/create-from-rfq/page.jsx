'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';

export default function CreatePOFromRFQPage() {
  const router = useRouter();
  const [approvedRFQs, setApprovedRFQs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [selectedRFQ, setSelectedRFQ] = useState(null);
  const [creating, setCreating] = useState(false);

  const breadcrumbs = [
    { key: "purchase", label: "Purchase" },
    { key: "purchase-orders", label: "Purchase Orders" },
    { key: "create-from-rfq", label: "Create from RFQ" },
  ];

  useEffect(() => {
    fetchApprovedRFQs();
  }, []);

  const fetchApprovedRFQs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/purchase/rfqs/approved');
      const result = await response.json();
      
      if (result.success) {
        setApprovedRFQs(result.data);
      } else {
        setError(result.error || 'Failed to fetch approved RFQs');
      }
    } catch (err) {
      setError('Failed to fetch approved RFQs');
      console.error('Error fetching approved RFQs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePO = async (rfq) => {
    try {
      setCreating(true);
      const response = await fetch('/api/purchase/purchase-orders/from-rfq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rfqId: rfq.rfqId,
          poNumber: `PO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
          notes: `Created from RFQ ${rfq.rfqNumber}`
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setToast({
          type: 'success',
          message: `Purchase Order ${result.data.poId} created successfully`
        });
        
        // Redirect to the created PO after a short delay
        setTimeout(() => {
          router.push(`/dashboard/purchase/purchase-orders/${result.data.poId}`);
        }, 2000);
      } else {
        setToast({
          type: 'error',
          message: result.error || 'Failed to create purchase order'
        });
      }
    } catch (err) {
      setToast({
        type: 'error',
        message: 'Failed to create purchase order'
      });
      console.error('Error creating purchase order:', err);
    } finally {
      setCreating(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbs} />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading approved RFQs...</p>
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
          <h2 className="text-2xl font-semibold text-gray-900">Create Purchase Order from RFQ</h2>
          <p className="text-gray-600 mt-1">Select an approved RFQ to create a purchase order</p>
        </div>
        <Button 
          onClick={() => router.push('/dashboard/purchase/purchase-orders')}
          className="bg-gray-600 hover:bg-gray-700 text-white"
        >
          Back to Purchase Orders
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {approvedRFQs.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No approved RFQs available</h3>
          <p className="text-gray-500 mb-4">There are no approved RFQs available for creating purchase orders</p>
          <Button 
            onClick={() => router.push('/dashboard/purchase/rfqs')}
            className="bg-gradient-to-r from-blue-600 to-black text-white hover:from-blue-700 hover:to-gray-900"
          >
            View RFQs
          </Button>
        </div>
      ) : (
        <div className="grid gap-6">
          {approvedRFQs.map((rfq) => (
            <div key={rfq.rfqId} className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{rfq.rfqNumber}</h3>
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        Approved
                      </span>
                      {rfq.hasPurchaseOrder && (
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          PO Created
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Vendor</p>
                        <p className="font-medium text-gray-900">{rfq.vendorName}</p>
                        <p className="text-sm text-gray-600">{rfq.vendorEmail}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Amount</p>
                        <p className="font-medium text-gray-900">{formatCurrency(rfq.totalAmount)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Items</p>
                        <p className="font-medium text-gray-900">{rfq.itemCount} items</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Approved Date</p>
                        <p className="font-medium text-gray-900">{formatDate(rfq.approvedAt)}</p>
                      </div>
                    </div>

                    {rfq.expectedDelivery && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-500">Expected Delivery</p>
                        <p className="font-medium text-gray-900">{formatDate(rfq.expectedDelivery)}</p>
                      </div>
                    )}

                    {rfq.vendorNotes && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-500">Vendor Notes</p>
                        <p className="text-gray-900">{rfq.vendorNotes}</p>
                      </div>
                    )}

                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-2">Items</p>
                      <div className="space-y-2">
                        {rfq.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                            <span className="font-medium">{item.productName}</span>
                            <span className="text-sm text-gray-600">{item.quantity} {item.unit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-6 flex flex-col space-y-2">
                    {rfq.hasPurchaseOrder ? (
                      <div className="text-center">
                        <p className="text-sm text-gray-500 mb-2">Purchase Order</p>
                        <p className="font-medium text-blue-600">{rfq.purchaseOrderId}</p>
                        <p className="text-xs text-gray-500 capitalize">{rfq.purchaseOrderStatus}</p>
                        <Button 
                          onClick={() => router.push(`/dashboard/purchase/purchase-orders/${rfq.purchaseOrderId}`)}
                          className="mt-2 bg-gradient-to-r from-blue-600 to-black text-white text-sm hover:from-blue-700 hover:to-gray-900"
                        >
                          View PO
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        onClick={() => handleCreatePO(rfq)}
                        disabled={creating}
                        className="bg-gradient-to-r from-green-600 to-green-900 text-white hover:from-green-700 hover:to-black"
                      >
                        {creating ? 'Creating...' : 'Create PO'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
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

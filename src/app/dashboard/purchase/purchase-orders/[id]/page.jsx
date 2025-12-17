'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';

export default function PurchaseOrderDetailPage({ params }) {
  const router = useRouter();
  const [purchaseOrder, setPurchaseOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [sending, setSending] = useState(false);

  const breadcrumbs = [
    { key: "purchase", label: "Purchase" },
    { key: "purchase-orders", label: "Purchase Orders" },
    { key: "detail", label: purchaseOrder?.po_id || "Loading..." },
  ];

  useEffect(() => {
    if (params.id) {
      fetchPurchaseOrder();
    }
  }, [params.id]);

  const fetchPurchaseOrder = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/purchase/purchase-orders/${params.id}`);
      const result = await response.json();
      
      if (result.success) {
        setPurchaseOrder(result.data);
      } else {
        setError(result.error || 'Failed to fetch purchase order');
      }
    } catch (err) {
      setError('Failed to fetch purchase order');
      console.error('Error fetching purchase order:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendPO = async () => {
    try {
      setSending(true);
      const response = await fetch(`/api/purchase/purchase-orders/${params.id}/send`, {
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
        fetchPurchaseOrder(); // Refresh the data
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
    } finally {
      setSending(false);
    }
  };

  const getStatusColor = (status) => {
    const statusMap = {
      'draft': 'bg-gray-100 text-gray-700 border-gray-200',
      'sent': 'bg-blue-100 text-blue-700 border-blue-200',
      'confirmed': 'bg-green-100 text-green-700 border-green-200',
      'received': 'bg-purple-100 text-purple-700 border-purple-200',
      'cancelled': 'bg-red-100 text-red-700 border-red-200',
    };
    return statusMap[status] || 'bg-gray-100 text-gray-700 border-gray-200';
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
            <p className="text-gray-600">Loading purchase order...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbs} />
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
        <Button 
          onClick={() => router.push('/dashboard/purchase/purchase-orders')}
          className="bg-gray-600 hover:bg-gray-700 text-white"
        >
          Back to Purchase Orders
        </Button>
      </div>
    );
  }

  if (!purchaseOrder) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbs} />
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Purchase Order not found</h3>
          <Button 
            onClick={() => router.push('/dashboard/purchase/purchase-orders')}
            className="bg-gray-600 hover:bg-gray-700 text-white"
          >
            Back to Purchase Orders
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbs} />
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">{purchaseOrder.po_id}</h2>
          <p className="text-gray-600 mt-1">Purchase Order Details</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            onClick={() => router.push('/dashboard/purchase/purchase-orders')}
            className="bg-gray-600 hover:bg-gray-700 text-white"
          >
            Back to List
          </Button>
          {purchaseOrder.status === 'draft' && (
            <Button 
              onClick={handleSendPO}
              disabled={sending}
              className="bg-gradient-to-r from-green-600 to-green-900 text-white hover:from-green-700 hover:to-black"
            >
              {sending ? 'Sending...' : 'Send to Vendor'}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Purchase Order Header */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Purchase Order Information</h3>
                <span className={`text-xs px-3 py-1 rounded-full border ${getStatusColor(purchaseOrder.status)}`}>
                  {purchaseOrder.status.charAt(0).toUpperCase() + purchaseOrder.status.slice(1)}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Order Details</h4>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm text-gray-500">PO Number</dt>
                      <dd className="font-medium text-gray-900">{purchaseOrder.po_id}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Date Created</dt>
                      <dd className="text-gray-900">{formatDate(purchaseOrder.date_created)}</dd>
                    </div>
                    {purchaseOrder.rfq_id && (
                      <div>
                        <dt className="text-sm text-gray-500">Source RFQ</dt>
                        <dd className="text-gray-900">{purchaseOrder.rfq_id}</dd>
                      </div>
                    )}
                  </dl>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Supplier Information</h4>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm text-gray-500">Supplier Name</dt>
                      <dd className="font-medium text-gray-900">{purchaseOrder.supplier_name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Email</dt>
                      <dd className="text-gray-900">{purchaseOrder.supplier_email}</dd>
                    </div>
                    {purchaseOrder.supplier_phone && (
                      <div>
                        <dt className="text-sm text-gray-500">Phone</dt>
                        <dd className="text-gray-900">{purchaseOrder.supplier_phone}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity Ordered
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity Received
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unit Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {purchaseOrder.lines.map((line, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{line.product_name}</div>
                            {line.product_description && (
                              <div className="text-sm text-gray-500">{line.product_description}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {line.quantity_ordered}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {line.quantity_received}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(line.price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(line.line_total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                        Total Amount:
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        {formatCurrency(purchaseOrder.total_amount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Current Status</span>
                  <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(purchaseOrder.status)}`}>
                    {purchaseOrder.status.charAt(0).toUpperCase() + purchaseOrder.status.slice(1)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Total Amount</span>
                  <span className="font-medium text-gray-900">{formatCurrency(purchaseOrder.total_amount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Items</span>
                  <span className="font-medium text-gray-900">{purchaseOrder.lines.length} items</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions Card */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                <Button 
                  onClick={() => router.push('/dashboard/purchase/purchase-orders')}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white"
                >
                  Back to List
                </Button>
                {purchaseOrder.status === 'draft' && (
                  <Button 
                    onClick={handleSendPO}
                    disabled={sending}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    {sending ? 'Sending...' : 'Send to Vendor'}
                  </Button>
                )}
                {purchaseOrder.status === 'sent' && (
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Waiting for vendor confirmation</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

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

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { StatusBadge } from '../../_components/StatusBadge';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api/service';
import PermissionGuard from '@/components/guards/PermissionGuard';
import { PERMISSIONS } from '@/lib/constants/roles';

const STATUS_LABELS = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800' },
  sent: { label: 'Sent', color: 'bg-blue-100 text-blue-800' },
  received: { label: 'Quote Received', color: 'bg-yellow-100 text-yellow-800' },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-800' }
};

export default function RFQDetailPage({ params }) {
  const [rfq, setRfq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchRFQ = async () => {
      try {
        setLoading(true);
        const data = await api.get(`/api/rfqs/${params.id}`);
        setRfq(data.rfq);
      } catch (err) {
        setError(err.error || err.message || 'Failed to load RFQ');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchRFQ();
    }
  }, [params.id]);

  const handleApprove = async () => {
    try {
      setActionLoading(true);
      await api.post(`/api/rfqs/${rfq.id}/approve`, { action: 'approve' });
      setRfq(prev => ({ ...prev, status: 'approved' }));
      router.push('/dashboard/purchase/approvals');
    } catch (err) {
      setError(err.error || err.message || 'Failed to approve RFQ');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      setActionLoading(true);
      await api.post(`/api/rfqs/${rfq.id}/approve`, { action: 'reject', comments: reason });
      setRfq(prev => ({ ...prev, status: 'rejected', rejectionReason: reason }));
      router.push('/dashboard/purchase/approvals');
    } catch (err) {
      setError(err.error || err.message || 'Failed to reject RFQ');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <Button onClick={() => router.push('/dashboard/purchase/approvals')} className="mt-2">
            Back to Approvals
          </Button>
        </div>
      </div>
    );
  }

  if (!rfq) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">RFQ not found</h2>
          <p className="text-gray-600 mb-4">The requested RFQ could not be found.</p>
          <Button onClick={() => router.push('/dashboard/purchase/approvals')}>
            Back to Approvals
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">{rfq.rfqNumber}</h2>
          <div className="text-sm text-gray-600 mt-1">
            Vendor: {rfq.vendor?.name || 'Unknown'} • Created: {formatDate(rfq.createdAt)}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_LABELS[rfq.status]?.color || 'bg-gray-100 text-gray-800'}`}>
            {STATUS_LABELS[rfq.status]?.label || rfq.status}
          </span>
          <PermissionGuard
            permissions={[PERMISSIONS.PURCHASE.APPROVE_RFQ]}
            fallback={null}
          >
            {rfq.status === 'received' && (
              <div className="flex gap-2">
                <Button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {actionLoading ? 'Approving...' : 'Approve'}
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={actionLoading}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {actionLoading ? 'Rejecting...' : 'Reject'}
                </Button>
              </div>
            )}
          </PermissionGuard>
        </div>
      </div>

      {/* RFQ Details */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">RFQ Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Vendor</label>
            <p className="mt-1 text-sm text-gray-900">{rfq.vendor?.name || 'N/A'}</p>
            <p className="text-sm text-gray-500">{rfq.vendor?.email || ''}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Created By</label>
            <p className="mt-1 text-sm text-gray-900">{rfq.createdBy?.name || 'N/A'}</p>
            <p className="text-sm text-gray-500">{rfq.createdBy?.email || ''}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Order Deadline</label>
            <p className="mt-1 text-sm text-gray-900">{formatDate(rfq.orderDeadline)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Quote Price</label>
            <p className="mt-1 text-sm text-gray-900 font-semibold">
              {rfq.vendorPrice ? formatCurrency(rfq.vendorPrice) : 'N/A'}
            </p>
          </div>
          {rfq.expectedDeliveryDate && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Expected Delivery</label>
              <p className="mt-1 text-sm text-gray-900">{formatDate(rfq.expectedDeliveryDate)}</p>
            </div>
          )}
          {rfq.vendorNotes && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Vendor Notes</label>
              <p className="mt-1 text-sm text-gray-900">{rfq.vendorNotes}</p>
            </div>
          )}
        </div>
      </div>

      {/* RFQ Items */}
      {rfq.items && rfq.items.length > 0 && (
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">RFQ Items</h3>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rfq.items.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.product?.name || 'Unknown Product'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.unit || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.unitPrice !== undefined && item.unitPrice !== null ? formatCurrency(item.unitPrice) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center">
        <Button
          onClick={() => router.push('/dashboard/purchase/approvals')}
          className="bg-gray-600 hover:bg-gray-700 text-white"
        >
          Back to Approvals
        </Button>
      </div>
    </div>
  );
}



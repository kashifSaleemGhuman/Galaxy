'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api/service';
import { useRouter } from 'next/navigation';

const STATUS_LABELS = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800' },
  sent: { label: 'Sent', color: 'bg-blue-100 text-blue-800' },
  received: { label: 'Quote Received', color: 'bg-yellow-100 text-yellow-800' },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-800' }
};

export default function RFQApprovalsList() {
  const [rfqs, setRfqs] = useState([]);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();

  const fetchApprovals = async (status = 'pending') => {
    try {
      setLoading(true);
      const data = await api.get('/api/rfqs/approvals', { status, limit: 50 });
      setRfqs(data.rfqs);
      setCounts(data.counts);
    } catch (err) {
      setError(err.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals(activeFilter);
  }, [activeFilter]);

  // Auto-redirect if no pending RFQs on initial load
  useEffect(() => {
    if (!loading && rfqs.length === 0 && activeFilter === 'pending' && !isRedirecting) {
      setIsRedirecting(true);
      setTimeout(() => {
        router.push('/dashboard/purchase/polling');
      }, 2000);
    }
  }, [loading, rfqs.length, activeFilter, isRedirecting, router]);

  // No polling on approvals page - manager works on current list

  const handleApprove = async (rfqId) => {
    try {
      setActionLoading(rfqId);
      await api.post(`/api/rfqs/${rfqId}/approve`, { action: 'approve' });
      await fetchApprovals(activeFilter);
      
      // Check if no more pending approvals
      const data = await api.get('/api/rfqs/approvals', { status: 'pending', limit: 1 });
      if (data.rfqs.length === 0) {
        // Set redirecting state and redirect back to polling page after a short delay
        setIsRedirecting(true);
        setTimeout(() => {
          router.push('/dashboard/purchase/polling');
        }, 2000);
      }
    } catch (err) {
      setError(err.error || err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (rfqId) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      setActionLoading(rfqId);
      await api.post(`/api/rfqs/${rfqId}/approve`, { action: 'reject', comments: reason });
      await fetchApprovals(activeFilter);
      
      // Check if no more pending approvals
      const data = await api.get('/api/rfqs/approvals', { status: 'pending', limit: 1 });
      if (data.rfqs.length === 0) {
        // Set redirecting state and redirect back to polling page after a short delay
        setIsRedirecting(true);
        setTimeout(() => {
          router.push('/dashboard/purchase/polling');
        }, 2000);
      }
    } catch (err) {
      setError(err.error || err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredRfqs = rfqs.filter(rfq => 
    rfq.rfqNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rfq.vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rfq.createdBy.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const handleViewDetails = (rfqId) => {
    router.push(`/dashboard/purchase/rfqs/${rfqId}`);
  };

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-800">{error}</p>
        <Button onClick={() => fetchApprovals(activeFilter)} className="mt-2">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Redirect Message */}
      {isRedirecting && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center text-green-800">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
            <span className="text-sm font-medium">All approvals completed! Redirecting to polling page...</span>
          </div>
        </div>
      )}


      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div 
          className={`p-4 rounded-lg cursor-pointer transition-colors ${
            activeFilter === 'pending' ? 'bg-blue-50 border-2 border-blue-200' : 'bg-white border border-gray-200'
          }`}
          onClick={() => setActiveFilter('pending')}
        >
          <div className="text-2xl font-bold text-gray-900">{counts.pending}</div>
          <div className="text-sm text-gray-600">Pending Approval</div>
        </div>
        <div 
          className={`p-4 rounded-lg cursor-pointer transition-colors ${
            activeFilter === 'approved' ? 'bg-green-50 border-2 border-green-200' : 'bg-white border border-gray-200'
          }`}
          onClick={() => setActiveFilter('approved')}
        >
          <div className="text-2xl font-bold text-gray-900">{counts.approved}</div>
          <div className="text-sm text-gray-600">Approved</div>
        </div>
        <div 
          className={`p-4 rounded-lg cursor-pointer transition-colors ${
            activeFilter === 'rejected' ? 'bg-red-50 border-2 border-red-200' : 'bg-white border border-gray-200'
          }`}
          onClick={() => setActiveFilter('rejected')}
        >
          <div className="text-2xl font-bold text-gray-900">{counts.rejected}</div>
          <div className="text-sm text-gray-600">Rejected</div>
        </div>
        <div 
          className={`p-4 rounded-lg cursor-pointer transition-colors ${
            activeFilter === 'all' ? 'bg-gray-50 border-2 border-gray-200' : 'bg-white border border-gray-200'
          }`}
          onClick={() => setActiveFilter('all')}
        >
          <div className="text-2xl font-bold text-gray-900">{counts.total}</div>
          <div className="text-sm text-gray-600">Total RFQs</div>
        </div>
      </div>

      {/* Search */}
      <div className="w-64">
        <Input
          type="text"
          placeholder="Search RFQs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>

      {/* RFQs List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  RFQ Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Deadline
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quote Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRfqs.map((rfq) => (
                <tr key={rfq.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleViewDetails(rfq.id)}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                    >
                      {rfq.rfqNumber}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{rfq.vendor.name}</div>
                    <div className="text-sm text-gray-500">{rfq.vendor.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{rfq.createdBy.name}</div>
                    <div className="text-sm text-gray-500">{rfq.createdBy.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(rfq.orderDeadline)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {rfq.vendorPrice ? formatCurrency(rfq.vendorPrice) : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${STATUS_LABELS[rfq.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                      {STATUS_LABELS[rfq.status]?.label || rfq.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2 justify-end">
                      <Button
                        onClick={() => handleViewDetails(rfq.id)}
                        className="bg-gradient-to-r from-blue-600 to-black hover:from-blue-700 hover:to-gray-900 text-white text-xs px-3 py-1"
                      >
                        View Details
                      </Button>
                      {rfq.status === 'received' ? (
                        <>
                          <Button
                            onClick={() => handleApprove(rfq.id)}
                            disabled={actionLoading === rfq.id}
                            className="bg-gradient-to-r from-green-600 to-green-900 hover:from-green-700 hover:to-black text-white text-xs px-3 py-1"
                          >
                            {actionLoading === rfq.id ? 'Approving...' : 'Approve'}
                          </Button>
                          <Button
                            onClick={() => handleReject(rfq.id)}
                            disabled={actionLoading === rfq.id}
                            className="bg-gradient-to-r from-red-600 to-red-900 text-white hover:from-red-700 hover:to-black text-xs px-3 py-1"
                          >
                            {actionLoading === rfq.id ? 'Rejecting...' : 'Reject'}
                          </Button>
                        </>
                      ) : (
                        <span className="text-gray-400 text-xs">
                          {rfq.approvedBy ? `By ${rfq.approvedBy.name}` : 'No action needed'}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredRfqs.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No RFQs found for the selected filter
            </div>
          )}
        </div>
      )}
    </div>
  );
}

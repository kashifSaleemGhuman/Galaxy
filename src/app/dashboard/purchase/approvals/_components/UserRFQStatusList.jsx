'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api/service';
import { useRouter } from 'next/navigation';

const STATUS_LABELS = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800' },
  sent: { label: 'Sent to Vendor', color: 'bg-blue-100 text-blue-800' },
  received: { label: 'Quote Received', color: 'bg-yellow-100 text-yellow-800' },
  approved: { label: 'Approved by Manager', color: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rejected by Manager', color: 'bg-red-100 text-red-800' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-800' }
};

export default function UserRFQStatusList() {
  const [rfqs, setRfqs] = useState([]);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const fetchUserRFQs = async (status = 'all') => {
    try {
      setLoading(true);
      const data = await api.get('/api/rfqs', { status, limit: 100 });
      setRfqs(data.rfqs || []);
      
      // Calculate counts
      const allRfqs = data.rfqs || [];
      const counts = {
        pending: allRfqs.filter(rfq => ['sent', 'received'].includes(rfq.status)).length,
        approved: allRfqs.filter(rfq => rfq.status === 'approved').length,
        rejected: allRfqs.filter(rfq => rfq.status === 'rejected').length,
        total: allRfqs.length
      };
      setCounts(counts);
    } catch (err) {
      setError(err.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRFQs(activeFilter);
  }, [activeFilter]);

  const filteredRfqs = rfqs.filter(rfq => 
    rfq.rfqNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rfq.vendor.name.toLowerCase().includes(searchTerm.toLowerCase())
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'rejected':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'received':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'sent':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-800">{error}</p>
        <Button onClick={() => fetchUserRFQs(activeFilter)} className="mt-2">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div 
          className={`p-4 rounded-lg cursor-pointer transition-colors ${
            activeFilter === 'pending' ? 'bg-blue-50 border-2 border-blue-200' : 'bg-white border border-gray-200'
          }`}
          onClick={() => setActiveFilter('pending')}
        >
          <div className="text-2xl font-bold text-gray-900">{counts.pending}</div>
          <div className="text-sm text-gray-600">Pending Review</div>
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
                  Order Deadline
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quote Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Manager Response
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(rfq.status)}
                      <span className="ml-2 text-sm text-gray-900">
                        {rfq.approvedBy ? `By ${rfq.approvedBy.name}` : 'Pending'}
                      </span>
                    </div>
                    {rfq.approvedAt && (
                      <div className="text-xs text-gray-500">
                        {formatDate(rfq.approvedAt)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      onClick={() => handleViewDetails(rfq.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1"
                    >
                      View Details
                    </Button>
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

      {/* Back to Dashboard Button */}
      <div className="flex justify-center pt-6">
        <Button
          onClick={() => router.push('/dashboard/purchase/user-dashboard')}
          className="bg-gray-600 hover:bg-gray-700 text-white"
        >
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}

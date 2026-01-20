'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import quotationService from './quotationService';

export default function QuotationList({ filters = {} }) {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
  const router = useRouter();

  useEffect(() => {
    fetchQuotations();
  }, [statusFilter]);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const data = await quotationService.getQuotations({ status: statusFilter });
      setQuotations(data.quotations || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch quotations');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      submitted: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      sent: 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-center py-8">{error}</div>;
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="pl-4 pr-8 py-2 border rounded bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="submitted">Submitted</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="sent">Sent</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quotation #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Validity Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {quotations.map((quotation) => (
              <tr key={quotation.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {quotation.quotationNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {quotation.customerName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {new Date(quotation.validityDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  ${parseFloat(quotation.finalNetPrice).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(quotation.status)}`}>
                    {quotation.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => router.push(`/dashboard/sales/quotations/${quotation.id}`)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {quotations.length === 0 && (
          <div className="text-center py-8 text-gray-500">No quotations found</div>
        )}
      </div>
    </div>
  );
}


'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import quotationService from './quotationService';

export default function QuotationApprovalsList() {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const data = await quotationService.getPendingApprovals();
      setQuotations(data.quotations || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch approvals');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (quotationId) => {
    const comments = prompt('Please provide any comments (optional):');
    if (comments === null) return; // User cancelled

    try {
      setActionLoading(quotationId);
      await quotationService.approveQuotation(quotationId, 'approve', comments || '');
      await fetchApprovals();
      
      // Check if no more pending approvals
      const data = await quotationService.getPendingApprovals({ limit: 1 });
      if (data.quotations.length === 0) {
        setIsRedirecting(true);
        setTimeout(() => {
          router.push('/dashboard/sales/polling');
        }, 2000);
      }
    } catch (err) {
      setError(err.message || 'Failed to approve quotation');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (quotationId) => {
    const comments = prompt('Please provide a reason for rejection:');
    if (!comments) return;

    try {
      setActionLoading(quotationId);
      await quotationService.approveQuotation(quotationId, 'reject', comments);
      await fetchApprovals();
      
      // Check if no more pending approvals
      const data = await quotationService.getPendingApprovals({ limit: 1 });
      if (data.quotations.length === 0) {
        setIsRedirecting(true);
        setTimeout(() => {
          router.push('/dashboard/sales/polling');
        }, 2000);
      }
    } catch (err) {
      setError(err.message || 'Failed to reject quotation');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-center py-8">{error}</div>;
  }

  if (isRedirecting) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">All approvals processed. Redirecting to polling page...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Pending Quotation Approvals</h1>
      
      {quotations.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-gray-600">No pending approvals at the moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {quotations.map((quotation) => (
            <div key={quotation.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold">{quotation.quotationNumber}</h3>
                  <p className="text-sm text-gray-600">
                    Customer: {quotation.customerName} ({quotation.customerEmail})
                  </p>
                  <p className="text-sm text-gray-600">
                    Created by: {quotation.createdBy?.name || 'Unknown'}
                  </p>
                  <p className="text-sm text-gray-600">
                    Validity: {new Date(quotation.validityDate).toLocaleDateString()}
                  </p>
                  <p className="text-lg font-semibold mt-2">
                    Total: ${parseFloat(quotation.finalNetPrice).toFixed(2)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(quotation.id)}
                    disabled={actionLoading === quotation.id}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {actionLoading === quotation.id ? 'Processing...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleReject(quotation.id)}
                    disabled={actionLoading === quotation.id}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    {actionLoading === quotation.id ? 'Processing...' : 'Reject'}
                  </button>
                </div>
              </div>
              
              <div className="mt-4">
                <h4 className="font-medium mb-2">Items:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {quotation.items?.map((item, index) => (
                    <li key={index} className="text-sm">
                      {item.productName} - Qty: {item.quantity} - ${parseFloat(item.finalNetPrice).toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


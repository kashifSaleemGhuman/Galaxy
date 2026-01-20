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
  const [modalState, setModalState] = useState({ isOpen: false, quotationId: null, action: null, comments: '' });
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

  const openModal = (quotationId, action) => {
    setModalState({
      isOpen: true,
      quotationId,
      action,
      comments: ''
    });
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      quotationId: null,
      action: null,
      comments: ''
    });
    setError(null); // Clear any errors when closing modal
  };

  const handleModalConfirm = async () => {
    const { quotationId, action, comments } = modalState;
    
    // For reject, comments are required
    if (action === 'reject' && !comments.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    try {
      setActionLoading(quotationId);
      closeModal();
      await quotationService.approveQuotation(quotationId, action, comments || '');
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
      setError(err.message || `Failed to ${action} quotation`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = (quotationId) => {
    openModal(quotationId, 'approve');
  };

  const handleReject = (quotationId) => {
    openModal(quotationId, 'reject');
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
    <>
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

      {/* Comment Modal */}
      {modalState.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {modalState.action === 'approve' ? 'Approve Quotation' : 'Reject Quotation'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {modalState.action === 'approve' 
                  ? 'Comments (optional):' 
                  : 'Reason for rejection (required):'}
              </label>
              <textarea
                value={modalState.comments}
                onChange={(e) => {
                  setModalState({ ...modalState, comments: e.target.value });
                  if (error) setError(null); // Clear error when user starts typing
                }}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={modalState.action === 'approve' 
                  ? 'Enter any comments...' 
                  : 'Please provide a reason for rejection...'}
              />
              {error && modalState.action === 'reject' && !modalState.comments.trim() && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={closeModal}
                disabled={actionLoading === modalState.quotationId}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleModalConfirm}
                disabled={actionLoading === modalState.quotationId}
                className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  modalState.action === 'approve'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {actionLoading === modalState.quotationId ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  modalState.action === 'approve' ? 'Approve' : 'Reject'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


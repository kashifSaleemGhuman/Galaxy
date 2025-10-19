import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { RFQ_STATUS, RFQ_STATUS_LABELS } from './constants';
import PurchaseOrder from '../po/PurchaseOrder';
import PermissionGuard from '@/components/guards/PermissionGuard';
import { PERMISSIONS } from '@/lib/constants/roles';
import api from '@/lib/api/service';
import { notificationService } from '@/lib/notifications';

export default function RfqDetails({ rfq, onUpdateRfq, onBack }) {
  const [quoteDetails, setQuoteDetails] = useState({
    vendorPrice: '',
    vendorNotes: '',
    expectedDeliveryDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  const handleSendToVendor = async () => {
    setLoading(true);
    clearMessages();
    
    try {
      const data = await api.post(`/api/rfqs/${rfq.id}/send`);
      setSuccessMessage('RFQ sent successfully to vendor');
      await onUpdateRfq({ ...rfq, ...data.rfq });
    } catch (err) {
      setError(err.error || err.message || 'Failed to send RFQ to vendor');
    } finally {
      setLoading(false);
    }
  };

  const handleQuoteReceived = async () => {
    setLoading(true);
    clearMessages();

    // Validate required fields
    if (!quoteDetails.vendorPrice) {
      setError('Vendor price is required');
      setLoading(false);
      return;
    }
    if (!quoteDetails.expectedDeliveryDate) {
      setError('Expected delivery date is required');
      setLoading(false);
      return;
    }

    try {
      const data = await api.post(`/api/rfqs/${rfq.id}/quote`, {
        vendorPrice: quoteDetails.vendorPrice,
        expectedDeliveryDate: quoteDetails.expectedDeliveryDate,
        vendorNotes: quoteDetails.vendorNotes,
      });
      setSuccessMessage('Vendor quote recorded successfully');
      await onUpdateRfq({ ...rfq, ...data.rfq });
      
      // Emit notification to alert managers only
      notificationService.emit('rfq_update', {
        rfqId: rfq.id,
        rfqNumber: rfq.rfqNumber,
        status: 'received',
        previousStatus: 'sent',
        message: `New quote received for RFQ ${rfq.rfqNumber} - $${quoteDetails.vendorPrice}`,
        vendorPrice: quoteDetails.vendorPrice,
        expectedDeliveryDate: quoteDetails.expectedDeliveryDate,
        targetRole: 'manager' // Only show to managers
      });
    } catch (err) {
      setError(err.error || err.message || 'Failed to record vendor quote');
    } finally {
      setLoading(false);
    }
  };

  const [showPurchaseOrder, setShowPurchaseOrder] = useState(false);

  const handleAcceptQuote = async () => {
    setLoading(true);
    clearMessages();
    try {
      const response = await api.post(`/api/rfqs/${rfq.id}/approve`, {
        action: 'approve'
      });
      
      setSuccessMessage('Quote approved successfully');
      await onUpdateRfq({
        ...rfq,
        ...response.rfq,
        status: 'approved',
        approvedAt: new Date().toISOString(),
      });
      
      // Emit notification to user
      notificationService.emit('rfq_update', {
        rfqId: rfq.id,
        rfqNumber: rfq.rfqNumber,
        status: 'approved',
        previousStatus: 'received',
        message: `RFQ ${rfq.rfqNumber} has been approved`,
        targetRole: 'user' // Show to purchase user
      });
      
      // Show PO generation interface
      setShowPurchaseOrder(true);
    } catch (err) {
      setError(err.error || err.message || 'Failed to approve quote');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectQuote = async () => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    setLoading(true);
    clearMessages();
    try {
      const response = await api.post(`/api/rfqs/${rfq.id}/approve`, {
        action: 'reject',
        comments: reason
      });
      
      setSuccessMessage('Quote rejected successfully');
      await onUpdateRfq({
        ...rfq,
        ...response.rfq,
        status: 'rejected',
        rejectionReason: reason,
        approvedAt: new Date().toISOString(),
      });
      
      // Emit notification to user
      notificationService.emit('rfq_update', {
        rfqId: rfq.id,
        rfqNumber: rfq.rfqNumber,
        status: 'rejected',
        previousStatus: 'received',
        message: `RFQ ${rfq.rfqNumber} has been rejected`,
        targetRole: 'user' // Show to purchase user
      });
    } catch (err) {
      setError(err.error || err.message || 'Failed to reject quote');
    } finally {
      setLoading(false);
    }
  };

  const renderActionButtons = () => {
    switch (rfq.status) {
      case RFQ_STATUS.DRAFT:
        return (
          <Button
            onClick={handleSendToVendor}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Send to Vendor
          </Button>
        );
      case RFQ_STATUS.SENT:
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Record Vendor Quote</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Vendor Price *
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={quoteDetails.vendorPrice}
                    onChange={(e) => setQuoteDetails(prev => ({ ...prev, vendorPrice: e.target.value }))}
                    className="pl-7"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Expected Delivery Date *
                </label>
                <Input
                  type="date"
                  value={quoteDetails.expectedDeliveryDate}
                  onChange={(e) => setQuoteDetails(prev => ({ ...prev, expectedDeliveryDate: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
                <p className="text-sm text-gray-500">
                  When will the vendor deliver the products?
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Vendor Notes
                </label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  placeholder="Additional terms, conditions, or notes from the vendor..."
                  value={quoteDetails.vendorNotes}
                  onChange={(e) => setQuoteDetails(prev => ({ ...prev, vendorNotes: e.target.value }))}
                  rows={3}
                />
                <p className="text-sm text-gray-500">
                  Include any special terms, conditions, or notes provided by the vendor
                </p>
              </div>
              <Button
                onClick={handleQuoteReceived}
                disabled={loading}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                Record Quote
              </Button>
            </div>
          </div>
        );
      case RFQ_STATUS.RECEIVED:
        return (
          <div className="space-x-4">
              <PermissionGuard
                permissions={[PERMISSIONS.PURCHASE.APPROVE_RFQ]}
                fallback={
                  <div className="text-sm text-gray-500">
                    Waiting for manager approval
                  </div>
                }
              >
                <Button
                  onClick={handleAcceptQuote}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Accept Quote
                </Button>
                <Button
                  onClick={handleRejectQuote}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Reject Quote
                </Button>
              </PermissionGuard>
          </div>
        );
      default:
        return null;
    }
  };

  if (showPurchaseOrder) {
    return (
      <PurchaseOrder
        rfq={rfq}
        onBack={() => setShowPurchaseOrder(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button onClick={onBack} className="bg-gray-100 hover:bg-gray-200">
            ← Back
          </Button>
          <h2 className="text-xl font-semibold">
            RFQ Details - {rfq.vendor?.name || rfq.vendor || 'Vendor'}
          </h2>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${RFQ_STATUS_LABELS[rfq.status]?.color || 'bg-gray-100 text-gray-800'}`}>
          {RFQ_STATUS_LABELS[rfq.status]?.label || rfq.status}
        </span>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-50 text-green-800 p-4 rounded-md">
          {successMessage}
        </div>
      )}
      {error && (
        <div className="bg-red-50 text-red-800 p-4 rounded-md">
          {error}
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2">RFQ Details</h3>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm text-gray-500">Vendor</dt>
                <dd>{rfq.vendor?.name || rfq.vendor}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Order Deadline</dt>
                <dd>{new Date(rfq.orderDeadline).toLocaleDateString()}</dd>
              </div>
              {rfq.sentDate && (
                <div>
                  <dt className="text-sm text-gray-500">Sent Date</dt>
                  <dd>{new Date(rfq.sentDate).toLocaleDateString()}</dd>
                </div>
              )}
            </dl>
          </div>

          {rfq.vendorQuote && (
            <div>
              <h3 className="font-medium mb-2">Vendor Quote</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm text-gray-500">Price</dt>
                  <dd>${rfq.vendorQuote.vendorPrice}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Expected Delivery</dt>
                  <dd>{new Date(rfq.vendorQuote.expectedDeliveryDate).toLocaleDateString()}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Notes</dt>
                  <dd>{rfq.vendorQuote.vendorNotes}</dd>
                </div>
              </dl>
            </div>
          )}
        </div>

        <div>
          <h3 className="font-medium mb-2">Products</h3>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(rfq.items || []).map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.product?.name || item.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pt-4 border-t">
          {renderActionButtons()}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { RFQ_STATUS, RFQ_STATUS_LABELS } from './constants';
import PurchaseOrder from '../po/PurchaseOrder';
import PermissionGuard from '@/components/guards/PermissionGuard';
import { PERMISSIONS } from '@/lib/constants/roles';
import api from '@/lib/api/service';
import { notificationService } from '@/lib/notifications';
import { Toast } from '@/components/ui/Toast';

export default function RfqDetails({ rfq, onUpdateRfq, onBack }) {
  // Initialize item prices from RFQ items
  const initializeItemPrices = () => {
    if (rfq.items && rfq.items.length > 0) {
      return rfq.items.map(item => ({
        productId: item.productId,
        productName: item.product?.name || item.name || 'Product',
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: '',
        lineTotal: 0,
        expectedDeliveryDate: ''
      }));
    }
    return [];
  };

  const [itemPrices, setItemPrices] = useState(initializeItemPrices());
  const [quoteDetails, setQuoteDetails] = useState({
    vendorPrice: '',
    vendorNotes: '',
    expectedDeliveryDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [creatingPO, setCreatingPO] = useState(false);
  const [toast, setToast] = useState(null);
  const [poInfo, setPoInfo] = useState({ exists: false, poId: null });

  const formatCurrency = (amount) => {
    const n = Number(amount || 0);
    return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  // Reinitialize item prices when RFQ changes
  useEffect(() => {
    if (rfq.items && rfq.items.length > 0) {
      setItemPrices(rfq.items.map(item => ({
        productId: item.productId,
        productName: item.product?.name || item.name || 'Product',
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: '',
        lineTotal: 0,
        expectedDeliveryDate: ''
      })));
    }
  }, [rfq.id, rfq.items]);

  // Check if a Purchase Order already exists for this RFQ
  useEffect(() => {
    const fetchPoForRfq = async () => {
      try {
        const res = await fetch(`/api/purchase/purchase-orders?rfqId=${rfq.id}`);
        if (res.ok) {
          const data = await res.json();
          const first = (data?.data || [])[0];
          if (first) {
            setPoInfo({ exists: true, poId: first.po_id || first.poId || first.po_id });
          } else {
            setPoInfo({ exists: false, poId: null });
          }
        }
      } catch (_) {
        // ignore silently
      }
    };
    if (rfq?.id) fetchPoForRfq();
  }, [rfq?.id]);

  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  const handleCreatePurchaseOrder = async () => {
    setCreatingPO(true);
    clearMessages();
    
    try {
      const response = await fetch('/api/purchase/purchase-orders/from-rfq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rfqId: rfq.id,
          poNumber: `PO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
          notes: `Created from RFQ ${rfq.rfqNumber}`
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setToast({
          type: 'success',
          message: `Purchase Order ${result.data.poId} created successfully! Redirecting to PO details...`
        });
        
        // Redirect to the created PO after a short delay
        setTimeout(() => {
          window.location.href = `/dashboard/purchase/purchase-orders/${result.data.poId}`;
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
      setCreatingPO(false);
    }
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

  // Calculate total price from item prices
  const calculateTotalPrice = () => {
    return itemPrices.reduce((sum, item) => {
      return sum + (item.lineTotal || 0);
    }, 0);
  };

  // Handle item price update
  const handleItemPriceChange = (index, value) => {
    const updatedItems = [...itemPrices];
    const unitPrice = parseFloat(value) || 0;
    updatedItems[index].unitPrice = value;
    updatedItems[index].lineTotal = unitPrice * updatedItems[index].quantity;
    setItemPrices(updatedItems);
    
    // Update total vendor price
    const total = updatedItems.reduce((sum, item) => sum + (item.lineTotal || 0), 0);
    setQuoteDetails(prev => ({ ...prev, vendorPrice: total.toFixed(2) }));
  };

  // Handle item delivery date update
  const handleItemDeliveryDateChange = (index, value) => {
    const updatedItems = [...itemPrices];
    updatedItems[index].expectedDeliveryDate = value;
    setItemPrices(updatedItems);
    
    // Update main expected delivery date to earliest date (for API compatibility)
    const dates = updatedItems
      .map(item => item.expectedDeliveryDate)
      .filter(date => date)
      .sort();
    if (dates.length > 0) {
      setQuoteDetails(prev => ({ ...prev, expectedDeliveryDate: dates[0] }));
    }
  };

  const handleQuoteReceived = async () => {
    setLoading(true);
    clearMessages();

    // Validate all items have prices
    const hasMissingPrices = itemPrices.some(item => !item.unitPrice || parseFloat(item.unitPrice) <= 0);
    if (hasMissingPrices) {
      setError('Please provide unit prices for all products');
      setLoading(false);
      return;
    }

    // Validate all items have delivery dates
    const hasMissingDates = itemPrices.some(item => !item.expectedDeliveryDate);
    if (hasMissingDates) {
      setError('Please provide expected delivery dates for all products');
      setLoading(false);
      return;
    }

    // Calculate total from items
    const totalPrice = calculateTotalPrice();
    if (totalPrice <= 0) {
      setError('Total price must be greater than zero');
      setLoading(false);
      return;
    }

    // Prepare items array with per-product pricing and delivery dates
    const items = itemPrices.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: parseFloat(item.unitPrice) || 0,
      expectedDeliveryDate: item.expectedDeliveryDate
    }));

    try {
      const data = await api.post(`/api/rfqs/${rfq.id}/quote`, {
        items: items,
        vendorNotes: quoteDetails.vendorNotes,
      });
      setSuccessMessage('Vendor quote recorded successfully');
      await onUpdateRfq({ ...rfq, ...data.rfq });
      
      // Emit notification to alert managers only
      const calculatedTotal = calculateTotalPrice();
      notificationService.emit('rfq_update', {
        rfqId: rfq.id,
        rfqNumber: rfq.rfqNumber,
        status: 'received',
        previousStatus: 'sent',
        message: `New quote received for RFQ ${rfq.rfqNumber} - $${calculatedTotal.toFixed(2)}`,
        vendorPrice: calculatedTotal,
        expectedDeliveryDate: itemPrices.map(i => i.expectedDeliveryDate).sort()[0],
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
          <div className="space-y-6">
            <h3 className="font-medium text-lg">Record Vendor Quote</h3>
            
            {/* Products with Pricing */}
            {itemPrices.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Product Pricing</h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price *</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Line Total</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expected Delivery Date *</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {itemPrices.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.productName}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {item.unit}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                <span className="text-gray-500 text-sm">$</span>
                              </div>
                              <Input
                                type="number"
                                placeholder="0.00"
                                value={item.unitPrice}
                                onChange={(e) => handleItemPriceChange(index, e.target.value)}
                                className="pl-6 w-32"
                                min="0"
                                step="0.01"
                                required
                              />
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            ${(item.lineTotal || 0).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <Input
                              type="date"
                              value={item.expectedDeliveryDate}
                              onChange={(e) => handleItemDeliveryDateChange(index, e.target.value)}
                              min={new Date().toISOString().split('T')[0]}
                              className="w-40"
                              required
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan="4" className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                          Total Price:
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900">
                          ${calculateTotalPrice().toFixed(2)}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
            
            <div className="space-y-4 border-t pt-4">
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
                {loading ? 'Recording...' : 'Record Quote'}
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
      case RFQ_STATUS.APPROVED:
        return (
          <div className="">
            {!poInfo.exists ? (
              <>
                <Button
                  onClick={handleCreatePurchaseOrder}
                  disabled={creatingPO}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {creatingPO ? 'Creating PO...' : 'Create Purchase Order'}
                </Button>
                <div className="text-sm text-gray-500 mt-3">
                  This RFQ has been approved and is ready for purchase order creation
                </div>
              </>
            ) : (
              <div className="text-sm text-green-700">
                Purchase Order created: <a className="underline" href={`/dashboard/purchase/purchase-orders/${poInfo.poId}`}>{poInfo.poId || 'View PO'}</a>
              </div>
            )}
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Line Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(rfq.items || []).map((item, index) => {
                const unitPrice = Number(item.unitPrice || 0);
                const lineTotal = unitPrice * Number(item.quantity || 0);
                return (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.product?.name || item.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.unit}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{unitPrice ? formatCurrency(unitPrice) : '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{unitPrice ? formatCurrency(lineTotal) : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan="4" className="px-6 py-3 text-right text-sm font-medium text-gray-700">Total</td>
                <td className="px-6 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                  {formatCurrency((rfq.items || []).reduce((sum, i) => sum + (Number(i.unitPrice || 0) * Number(i.quantity || 0)), 0))}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="pt-4 border-t">
          {renderActionButtons()}
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

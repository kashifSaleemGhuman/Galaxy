import React from 'react';
import { Button } from '@/components/ui/Button';

export default function PurchaseOrder({ rfq, onBack }) {
  const calculatePODetails = () => {
    // Calculate item prices and totals
    const items = rfq.products.map(product => {
      const unitPrice = parseFloat(rfq.vendorQuote.vendorPrice) || 0;
      const quantity = parseInt(product.quantity);
      return {
        ...product,
        unitPrice,
        total: unitPrice * quantity
      };
    });

    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

    return {
      poNumber: `PO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      vendor: rfq.vendor,
      orderDate: new Date().toISOString(),
      expectedDeliveryDate: rfq.vendorQuote.expectedDeliveryDate,
      items,
      totalAmount,
      terms: rfq.vendorQuote.vendorNotes || 'Standard terms and conditions apply'
    };
  };

  const poDetails = calculatePODetails();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button onClick={onBack} className="bg-gray-100 hover:bg-gray-200">
            ← Back
          </Button>
          <h2 className="text-xl font-semibold">Purchase Order</h2>
        </div>
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          Draft
        </span>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
        {/* PO Header */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-4">Purchase Order Details</h3>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm text-gray-500">PO Number</dt>
                <dd className="font-medium">{poDetails.poNumber}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Order Date</dt>
                <dd>{new Date(poDetails.orderDate).toLocaleDateString()}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Expected Delivery</dt>
                <dd>{new Date(poDetails.expectedDeliveryDate).toLocaleDateString()}</dd>
              </div>
            </dl>
          </div>
          <div>
            <h3 className="font-medium mb-4">Vendor Information</h3>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm text-gray-500">Vendor Name</dt>
                <dd className="font-medium">{poDetails.vendor}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Reference</dt>
                <dd>RFQ-{rfq.id}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Items Table */}
        <div>
          <h3 className="font-medium mb-4">Order Items</h3>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {poDetails.items.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.unit}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${item.unitPrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${item.total.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan="4" className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                  Total Amount:
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                  ${poDetails.totalAmount}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Terms and Conditions */}
        <div>
          <h3 className="font-medium mb-2">Terms and Conditions</h3>
          <p className="text-sm text-gray-600">{poDetails.terms}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-4 border-t">
          <Button className="bg-gray-100 hover:bg-gray-200">
            Save as Draft
          </Button>
          <Button className="bg-gray-100 hover:bg-gray-200">
            Preview
          </Button>
          <Button className="bg-gradient-to-r from-blue-600 to-black hover:from-blue-700 hover:to-gray-900 text-white">
            Send to Vendor
          </Button>
        </div>
      </div>
    </div>
  );
}

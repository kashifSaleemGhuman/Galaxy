import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function GoodsReceipt({ purchaseOrder, onBack, onSubmit }) {
  const [receiptDetails, setReceiptDetails] = useState(
    purchaseOrder.items.map(item => ({
      productId: item.productId,
      productName: item.name,
      orderedQty: item.quantity,
      receivedQty: item.quantity,
      unit: item.unit,
      notes: ''
    }))
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleQuantityChange = (index, value) => {
    const newDetails = [...receiptDetails];
    newDetails[index] = { ...newDetails[index], receivedQty: value };
    setReceiptDetails(newDetails);
  };

  const handleNotesChange = (index, value) => {
    const newDetails = [...receiptDetails];
    newDetails[index] = { ...newDetails[index], notes: value };
    setReceiptDetails(newDetails);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Validate received quantities
      const invalidItems = receiptDetails.filter(
        item => item.receivedQty > item.orderedQty || item.receivedQty < 0
      );

      if (invalidItems.length > 0) {
        throw new Error('Received quantity cannot exceed ordered quantity or be negative');
      }

      await onSubmit({
        poNumber: purchaseOrder.poNumber,
        receiptDate: new Date().toISOString(),
        items: receiptDetails,
        status: 'completed'
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button onClick={onBack} className="bg-gray-100 hover:bg-gray-200">
            ← Back
          </Button>
          <h2 className="text-xl font-semibold">Goods Receipt</h2>
        </div>
        <div className="text-sm text-gray-500">
          PO: {purchaseOrder.poNumber}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          {error}
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ordered Qty</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Received Qty</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {receiptDetails.map((item, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.productName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.orderedQty}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Input
                    type="number"
                    value={item.receivedQty}
                    onChange={(e) => handleQuantityChange(index, e.target.value)}
                    min="0"
                    max={item.orderedQty}
                    className="w-24"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.unit}
                </td>
                <td className="px-6 py-4">
                  <Input
                    type="text"
                    value={item.notes}
                    onChange={(e) => handleNotesChange(index, e.target.value)}
                    placeholder="Any issues or comments?"
                    className="w-full"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end space-x-4 pt-4 border-t">
          <Button
            onClick={onBack}
            className="bg-gray-100 hover:bg-gray-200"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-700 text-white"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Confirm Receipt'}
          </Button>
        </div>
      </div>
    </div>
  );
}

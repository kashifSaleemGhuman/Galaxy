import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function VendorPortal({ rfq, onQuoteSubmit }) {
  const [quoteDetails, setQuoteDetails] = useState({
    itemPrices: rfq.products.map(product => ({
      productId: product.productId,
      name: product.name,
      quantity: product.quantity,
      unit: product.unit,
      unitPrice: '',
      subtotal: 0
    })),
    totalPrice: 0,
    expectedDeliveryDate: '',
    termsAndConditions: '',
    attachments: []
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUnitPriceChange = (index, value) => {
    const newItemPrices = [...quoteDetails.itemPrices];
    newItemPrices[index] = {
      ...newItemPrices[index],
      unitPrice: value,
      subtotal: value * newItemPrices[index].quantity
    };

    const totalPrice = newItemPrices.reduce((sum, item) => sum + item.subtotal, 0);

    setQuoteDetails(prev => ({
      ...prev,
      itemPrices: newItemPrices,
      totalPrice
    }));
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setQuoteDetails(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!quoteDetails.expectedDeliveryDate) {
        throw new Error('Expected delivery date is required');
      }

      if (quoteDetails.itemPrices.some(item => !item.unitPrice)) {
        throw new Error('Please provide unit prices for all items');
      }

      // Format data for submission
      const formData = new FormData();
      formData.append('rfqId', rfq.id);
      formData.append('quoteDetails', JSON.stringify({
        itemPrices: quoteDetails.itemPrices,
        totalPrice: quoteDetails.totalPrice,
        expectedDeliveryDate: quoteDetails.expectedDeliveryDate,
        termsAndConditions: quoteDetails.termsAndConditions
      }));

      // Append attachments
      quoteDetails.attachments.forEach((file, index) => {
        formData.append(`attachment${index}`, file);
      });

      await onQuoteSubmit(formData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Submit Quote for RFQ #{rfq.id}</h2>
          <p className="text-sm text-gray-500 mt-1">Please provide your quotation details below</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 border-b">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Items Table */}
          <div>
            <h3 className="font-medium mb-4">Requested Items</h3>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {quoteDetails.itemPrices.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-sm">{item.name}</td>
                    <td className="px-4 py-3 text-sm">{item.quantity}</td>
                    <td className="px-4 py-3 text-sm">{item.unit}</td>
                    <td className="px-4 py-3">
                      <div className="relative rounded-md shadow-sm w-32">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <Input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => handleUnitPriceChange(index, e.target.value)}
                          className="pl-7"
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      ${item.subtotal.toFixed(2)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50">
                  <td colSpan="4" className="px-4 py-3 text-sm font-medium text-right">
                    Total Price:
                  </td>
                  <td className="px-4 py-3 text-sm font-bold">
                    ${quoteDetails.totalPrice.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Delivery Date */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Expected Delivery Date *
            </label>
            <Input
              type="date"
              value={quoteDetails.expectedDeliveryDate}
              onChange={(e) => setQuoteDetails(prev => ({
                ...prev,
                expectedDeliveryDate: e.target.value
              }))}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          {/* Terms and Conditions */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Terms and Conditions
            </label>
            <textarea
              value={quoteDetails.termsAndConditions}
              onChange={(e) => setQuoteDetails(prev => ({
                ...prev,
                termsAndConditions: e.target.value
              }))}
              rows={4}
              className="w-full border rounded-md p-2"
              placeholder="Enter any additional terms, conditions, or notes..."
            />
          </div>

          {/* File Attachments */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Attachments
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                    <span>Upload files</span>
                    <input
                      type="file"
                      multiple
                      className="sr-only"
                      onChange={handleFileUpload}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  PDF, DOC, XLS up to 10MB each
                </p>
              </div>
            </div>
            {quoteDetails.attachments.length > 0 && (
              <ul className="mt-4 space-y-2">
                {quoteDetails.attachments.map((file, index) => (
                  <li key={index} className="text-sm text-gray-500">
                    {file.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <Button
              type="button"
              className="bg-gray-100 hover:bg-gray-200"
              disabled={loading}
            >
              Save Draft
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-black text-white hover:from-blue-700 hover:to-gray-900"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Quote'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

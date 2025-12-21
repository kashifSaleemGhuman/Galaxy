'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api/service';
import quotationService from './quotationService';

export default function QuotationForm({ quotation, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    validityDate: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerCompanyName: '',
    termsAndConditions: '',
    items: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Product search states
  const [productSearch, setProductSearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const productRef = useRef(null);

  // Load quotation data if editing - ONLY ONCE
  useEffect(() => {
    if (quotation && !isInitialized) {
      // Recalculate tax for existing items to ensure it's 16% of ex-factory price
      const itemsWithRecalculatedTax = (quotation.items || []).map(item => {
        const exFactory = parseFloat(item.exFactoryPrice) || 0;
        const taxCharges = exFactory * 0.16; // Recalculate to ensure 16%
        const freight = parseFloat(item.freightCharges) || 0;
        const qty = parseInt(item.quantity) || 1;
        const finalNetPrice = (exFactory + taxCharges + freight) * qty;
        
        return {
          ...item,
          exFactoryPrice: exFactory,
          quantity: qty,
          freightCharges: freight,
          taxCharges: taxCharges,
          finalNetPrice: finalNetPrice
        };
      });
      
      setFormData({
        validityDate: quotation.validityDate ? new Date(quotation.validityDate).toISOString().split('T')[0] : '',
        customerName: quotation.customerName || '',
        customerEmail: quotation.customerEmail || '',
        customerPhone: quotation.customerPhone || '',
        customerCompanyName: quotation.customerCompanyName || '',
        termsAndConditions: quotation.termsAndConditions || '',
        items: itemsWithRecalculatedTax
      });
      setIsInitialized(true);
    }
  }, [quotation, isInitialized]);

  // Fetch products from inventory API
  const fetchProducts = async (q = '') => {
    try {
      const data = await api.get('/api/inventory/products', { search: q, limit: 20 });
      setFilteredProducts(data.products || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  // Initial prefetch
  useEffect(() => {
    fetchProducts('').catch(() => {});
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (productRef.current && !productRef.current.contains(event.target)) {
        setShowProductDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle product search
  const handleProductSearch = (value) => {
    setProductSearch(value);
    setShowProductDropdown(true);
    fetchProducts(value).catch(() => {});
  };

  // Add product to items
  const handleAddProduct = (product) => {
    const exFactoryPrice = product.exFactoryPrice || 0;
    const taxCharges = exFactoryPrice * 0.16; // Auto-calculate 16% tax
    const freightCharges = 0; // User will enter manually
    const discountAmount = 0;
    const quantity = 1;
    const finalNetPrice = (exFactoryPrice + taxCharges + freightCharges) * quantity;
    
    const newItem = {
      productId: product.id,
      productName: product.name,
      quantity: quantity,
      exFactoryPrice: exFactoryPrice,
      taxCharges: taxCharges,
      freightCharges: freightCharges,
      discountAmount: discountAmount,
      finalNetPrice: finalNetPrice
    };
    
    setFormData({
      ...formData,
      items: [...formData.items, newItem]
    });
    setProductSearch('');
    setShowProductDropdown(false);
  };

  // Remove item
  const handleRemoveItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  // Update item field
  const handleItemChange = (index, field, value) => {
    const items = [...formData.items];
    const item = items[index];
    
    // Update the field - parse values properly
    if (field === 'quantity') {
      const qty = value === '' ? '' : (parseInt(value) || 1);
      items[index] = {
        ...item,
        quantity: qty
      };
    } else if (field === 'exFactoryPrice') {
      const exFactory = value === '' ? '' : (parseFloat(value) || 0);
      const taxCharges = (exFactory === '' ? 0 : exFactory) * 0.16; // Auto-calculate 16% tax
      items[index] = {
        ...item,
        exFactoryPrice: exFactory,
        taxCharges: taxCharges // Auto-update tax when price changes
      };
    } else if (field === 'freightCharges') {
      const freight = value === '' ? '' : (parseFloat(value) || 0);
      items[index] = {
        ...item,
        freightCharges: freight
      };
    } else {
      items[index] = {
        ...item,
        [field]: value === '' ? '' : (parseFloat(value) || 0)
      };
    }
    
    // Recalculate final net price: price + tax + freight
    const updatedItem = items[index];
    const qty = updatedItem.quantity === '' ? 1 : (parseInt(updatedItem.quantity) || 1);
    const exFactory = updatedItem.exFactoryPrice === '' ? 0 : (parseFloat(updatedItem.exFactoryPrice) || 0);
    const tax = updatedItem.taxCharges || 0;
    const freight = updatedItem.freightCharges === '' ? 0 : (parseFloat(updatedItem.freightCharges) || 0);
    // Final price = (exFactoryPrice + tax + freight) * quantity
    items[index].finalNetPrice = (exFactory + tax + freight) * qty;
    
    setFormData({ ...formData, items });
  };

  // Calculate totals
  const calculateTotals = () => {
    let totalAmount = 0;
    let totalTax = 0;
    let totalFreight = 0;

    formData.items.forEach(item => {
      const qty = item.quantity === '' ? 1 : (parseInt(item.quantity) || 1);
      const exFactory = item.exFactoryPrice === '' ? 0 : (parseFloat(item.exFactoryPrice) || 0);
      const freight = item.freightCharges === '' ? 0 : (parseFloat(item.freightCharges) || 0);
      
      totalAmount += exFactory * qty;
      totalTax += (item.taxCharges || 0) * qty;
      totalFreight += freight * qty;
    });

    // Final price = totalAmount + totalTax + totalFreight
    const finalNetPrice = totalAmount + totalTax + totalFreight;

    return { totalAmount, totalTax, totalFreight, finalNetPrice };
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate
      if (!formData.validityDate || !formData.customerName || !formData.customerEmail || formData.items.length === 0) {
        throw new Error('Please fill in all required fields and add at least one item');
      }

      // Ensure all values are properly set before submission
      const submissionData = {
        ...formData,
        items: formData.items.map(item => ({
          ...item,
          quantity: item.quantity === '' ? 1 : parseInt(item.quantity),
          exFactoryPrice: item.exFactoryPrice === '' ? 0 : parseFloat(item.exFactoryPrice),
          freightCharges: item.freightCharges === '' ? 0 : parseFloat(item.freightCharges)
        }))
      };

      if (quotation) {
        // Update existing
        await quotationService.updateQuotation(quotation.id, submissionData);
      } else {
        // Create new
        await quotationService.createQuotation(submissionData);
      }
      
      onSubmit?.();
    } catch (err) {
      setError(err.message || 'Failed to save quotation');
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotals();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Customer Details */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Customer Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Customer Name *"
            value={formData.customerName}
            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
            required
          />
          <Input
            label="Customer Email *"
            type="email"
            value={formData.customerEmail}
            onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
            required
          />
          <Input
            label="Customer Phone"
            value={formData.customerPhone}
            onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
          />
          <Input
            label="Company Name"
            value={formData.customerCompanyName}
            onChange={(e) => setFormData({ ...formData, customerCompanyName: e.target.value })}
          />
          <Input
            label="Validity Date *"
            type="date"
            value={formData.validityDate}
            onChange={(e) => setFormData({ ...formData, validityDate: e.target.value })}
            required
          />
        </div>
      </div>

      {/* Products */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Products</h2>
        
        {/* Product Search */}
        <div className="relative mb-4" ref={productRef}>
          <Input
            label="Search Products"
            value={productSearch}
            onChange={(e) => handleProductSearch(e.target.value)}
            placeholder="Type to search products..."
          />
          {showProductDropdown && filteredProducts.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleAddProduct(product)}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  <div className="font-medium">{product.name}</div>
                  <div className="text-sm text-gray-500">
                    ${product.exFactoryPrice} - {product.category}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Items List */}
        {formData.items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ex-Factory</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tax (16%)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Freight</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">-</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {formData.items.map((item, index) => (
                  <tr key={`item-${index}-${item.productId || item.productName}`}>
                    <td className="px-4 py-3 text-sm">{item.productName}</td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity === '' ? '' : item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        onBlur={(e) => {
                          // Ensure minimum value on blur
                          if (!e.target.value || parseInt(e.target.value) < 1) {
                            handleItemChange(index, 'quantity', '1');
                          }
                        }}
                        className="w-20 px-2 py-1 border rounded"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.exFactoryPrice === '' ? '' : item.exFactoryPrice}
                        onChange={(e) => handleItemChange(index, 'exFactoryPrice', e.target.value)}
                        className="w-24 px-2 py-1 border rounded"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        step="0.01"
                        value={item.taxCharges ? item.taxCharges.toFixed(2) : '0.00'}
                        readOnly
                        className="w-24 px-2 py-1 border rounded bg-gray-100 cursor-not-allowed"
                        title="Tax is auto-calculated at 16% of Ex-Factory Price"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.freightCharges === '' ? '' : item.freightCharges}
                        onChange={(e) => handleItemChange(index, 'freightCharges', e.target.value)}
                        className="w-24 px-2 py-1 border rounded"
                        placeholder="0.00"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-500">-</span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      ${item.finalNetPrice.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Totals */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Price Summary</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal (Ex-Factory):</span>
            <span>${totals.totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax Charges:</span>
            <span>${totals.totalTax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Freight Charges:</span>
            <span>${totals.totalFreight.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xl font-bold border-t pt-2">
            <span>Final Net Price:</span>
            <span>${totals.finalNetPrice.toFixed(2)}</span>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            * Tax is automatically calculated at 16% of Ex-Factory Price
          </div>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Terms and Conditions</h2>
        <textarea
          value={formData.termsAndConditions}
          onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="Enter terms and conditions..."
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        {onCancel && (
          <Button type="button" onClick={onCancel} variant="secondary">
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : quotation ? 'Update Quotation' : 'Create Quotation'}
        </Button>
      </div>
    </form>
  );
}
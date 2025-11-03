'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';

export default function CreatePurchaseOrderPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  
  const [formData, setFormData] = useState({
    supplier_id: '',
    status: 'draft',
    lines: []
  });

  const [newLine, setNewLine] = useState({
    product_id: '',
    quantity_ordered: '',
    price: ''
  });

  const breadcrumbs = [
    { key: "purchase", label: "Purchase" },
    { key: "purchase-orders", label: "Purchase Orders" },
    { key: "create", label: "Create Purchase Order" },
  ];

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      // Fetch suppliers and products in parallel
      const [suppliersResponse, productsResponse] = await Promise.all([
        fetch('/api/purchase/suppliers'),
        fetch('/api/products')
      ]);

      const [suppliersResult, productsResult] = await Promise.all([
        suppliersResponse.json(),
        productsResponse.json()
      ]);

      if (suppliersResult.success) {
        setSuppliers(suppliersResult.data);
      }

      if (productsResult.success) {
        setProducts(productsResult.data);
      }
    } catch (err) {
      setError('Failed to load initial data');
      console.error('Error fetching initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLineInputChange = (field, value) => {
    setNewLine(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addLineItem = () => {
    if (!newLine.product_id || !newLine.quantity_ordered || !newLine.price) {
      setToast({
        type: 'error',
        message: 'Please fill in all line item fields'
      });
      return;
    }

    const product = products.find(p => p.id === newLine.product_id);
    if (!product) {
      setToast({
        type: 'error',
        message: 'Selected product not found'
      });
      return;
    }

    const lineItem = {
      product_id: newLine.product_id,
      quantity_ordered: parseInt(newLine.quantity_ordered),
      quantity_received: 0,
      price: parseFloat(newLine.price)
    };

    setFormData(prev => ({
      ...prev,
      lines: [...prev.lines, lineItem]
    }));

    setNewLine({
      product_id: '',
      quantity_ordered: '',
      price: ''
    });
  };

  const removeLineItem = (index) => {
    setFormData(prev => ({
      ...prev,
      lines: prev.lines.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.supplier_id) {
      setToast({
        type: 'error',
        message: 'Please select a supplier'
      });
      return;
    }

    if (formData.lines.length === 0) {
      setToast({
        type: 'error',
        message: 'Please add at least one line item'
      });
      return;
    }

    try {
      setSaving(true);
      const response = await fetch('/api/purchase/purchase-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      
      if (result.success) {
        setToast({
          type: 'success',
          message: `Purchase Order ${result.data.po_id} created successfully`
        });
        
        // Redirect to the created PO after a short delay
        setTimeout(() => {
          router.push(`/dashboard/purchase/purchase-orders/${result.data.po_id}`);
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
      setSaving(false);
    }
  };

  const calculateTotal = () => {
    return formData.lines.reduce((sum, line) => sum + (line.quantity_ordered * line.price), 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbs} />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading form data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbs} />
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Create Purchase Order</h2>
          <p className="text-gray-600 mt-1">Create a new purchase order manually</p>
        </div>
        <Button 
          onClick={() => router.push('/dashboard/purchase/purchase-orders')}
          className="bg-gray-600 hover:bg-gray-700 text-white"
        >
          Back to Purchase Orders
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Supplier *
                    </label>
                    <select
                      value={formData.supplier_id}
                      onChange={(e) => handleInputChange('supplier_id', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select a supplier</option>
                      {suppliers.map((supplier) => (
                        <option key={supplier.supplier_id} value={supplier.supplier_id}>
                          {supplier.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="draft">Draft</option>
                      <option value="sent">Sent</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Line Items</h3>
                
                {/* Add New Line Item */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product
                    </label>
                    <select
                      value={newLine.product_id}
                      onChange={(e) => handleLineInputChange('product_id', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a product</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity
                    </label>
                    <Input
                      type="number"
                      value={newLine.quantity_ordered}
                      onChange={(e) => handleLineInputChange('quantity_ordered', e.target.value)}
                      placeholder="0"
                      min="1"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit Price
                    </label>
                    <Input
                      type="number"
                      value={newLine.price}
                      onChange={(e) => handleLineInputChange('price', e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  
                  <div className="flex items-end">
                    <Button
                      type="button"
                      onClick={addLineItem}
                      className="w-full bg-gradient-to-r from-blue-600 to-black text-white hover:from-blue-700 hover:to-gray-900"
                    >
                      Add Item
                    </Button>
                  </div>
                </div>

                {/* Line Items List */}
                {formData.lines.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Product
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Unit Price
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {formData.lines.map((line, index) => {
                          const product = products.find(p => p.id === line.product_id);
                          return (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {product?.name || 'Unknown Product'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {line.quantity_ordered}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatCurrency(line.price)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatCurrency(line.quantity_ordered * line.price)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                <Button
                                  type="button"
                                  onClick={() => removeLineItem(index)}
                                  className="bg-gradient-to-r from-red-600 to-black text-white hover:from-red-700 hover:to-gray-900"
                                >
                                  Remove
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No line items added yet. Add items using the form above.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Items</span>
                    <span className="font-medium text-gray-900">{formData.lines.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Total Amount</span>
                    <span className="font-bold text-gray-900">{formatCurrency(calculateTotal())}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                <div className="space-y-3">
                  <Button
                    type="submit"
                    disabled={saving || formData.lines.length === 0}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {saving ? 'Creating...' : 'Create Purchase Order'}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => router.push('/dashboard/purchase/purchase-orders')}
                    className="w-full bg-gradient-to-r from-red-600 to-black text-white hover:from-red-700 hover:to-gray-900"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

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

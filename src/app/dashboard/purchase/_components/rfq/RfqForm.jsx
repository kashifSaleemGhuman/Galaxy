import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import ChevronIcon from './ChevronIcon';
import api from '@/lib/api/service';

export default function RfqForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    vendor: '',
    vendorId: null,
    orderDeadline: '',
    products: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Vendor search states
  const [vendorSearch, setVendorSearch] = useState('');
  const [showVendorDropdown, setShowVendorDropdown] = useState(false);
  const [filteredVendors, setFilteredVendors] = useState([]);
  
  // Product search and selection states
  const [productSearch, setProductSearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProductIds, setSelectedProductIds] = useState(new Set());
  
  const vendorRef = useRef(null);
  const productRef = useRef(null);

  // Fetch vendors from API (only active vendors for RFQ creation)
  const fetchVendors = async (q = '') => {
    const data = await api.get('/api/vendors', { q, limit: 20, activeOnly: true });
    setFilteredVendors(data.vendors || []);
  };

  // Fetch products from API (only active products for RFQ creation)
  const fetchProducts = async (q = '') => {
    const data = await api.get('/api/purchase/products', { q, limit: 50, activeOnly: true });
    setFilteredProducts(data.data || []);
  };

  // Initial prefetch
  useEffect(() => {
    fetchVendors('').catch(() => {});
    fetchProducts('').catch(() => {});
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (vendorRef.current && !vendorRef.current.contains(event.target)) {
        setShowVendorDropdown(false);
      }
      if (productRef.current && !productRef.current.contains(event.target)) {
        setShowProductDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle vendor search
  const handleVendorSearch = (value) => {
    setVendorSearch(value);
    setShowVendorDropdown(true);
    fetchVendors(value).catch(() => {});
  };

  // Handle vendor selection
  const handleVendorSelect = (vendor) => {
    setFormData({
      ...formData,
      vendor: vendor.name,
      vendorId: vendor.id
    });
    setVendorSearch(vendor.name);
    setShowVendorDropdown(false);
  };

  // Handle product search
  const handleProductSearch = (value) => {
    setProductSearch(value);
    setShowProductDropdown(true);
    fetchProducts(value).catch(() => {});
  };

  // Handle product checkbox toggle
  const handleProductToggle = (product) => {
    const newSelectedIds = new Set(selectedProductIds);
    
    if (newSelectedIds.has(product.id)) {
      // Remove product
      newSelectedIds.delete(product.id);
      setFormData({
        ...formData,
        products: formData.products.filter(p => p.productId !== product.id)
      });
    } else {
      // Add product
      newSelectedIds.add(product.id);
      setFormData({
        ...formData,
        products: [
          ...formData.products,
          {
            productId: product.id,
            name: product.name,
            quantity: '',
            unit: product.unit || product.defaultUnit || '',
            attributes: product.attributes || {}
          }
        ]
      });
    }
    setSelectedProductIds(newSelectedIds);
  };

  // Handle product update (quantity/unit)
  const handleProductUpdate = (productId, field, value) => {
    setFormData({
      ...formData,
      products: formData.products.map(p =>
        p.productId === productId ? { ...p, [field]: value } : p
      )
    });
  };

  // Remove product chip
  const removeProduct = (productId) => {
    const newSelectedIds = new Set(selectedProductIds);
    newSelectedIds.delete(productId);
    setSelectedProductIds(newSelectedIds);
    setFormData({
      ...formData,
      products: formData.products.filter(p => p.productId !== productId)
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'vendor') {
      handleVendorSearch(value);
    } else if (name === 'productSearch') {
      handleProductSearch(value);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Basic validations
      if (!formData.vendorId) throw new Error('Please select a vendor');
      if (!formData.orderDeadline) throw new Error('Please select order deadline');
      if (!formData.products.length || formData.products.some(p => !p.productId || !p.quantity || !p.unit)) {
        throw new Error('Please add at least one product with quantity and unit');
      }

      // Call parent onSubmit or default to API create
      if (onSubmit) {
        await onSubmit(formData);
      } else {
        const res = await fetch('/api/rfqs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vendorId: formData.vendorId,
            orderDeadline: formData.orderDeadline,
            items: formData.products.map(p => ({
              productId: p.productId,
              quantity: p.quantity,
              unit: p.unit
            }))
          })
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to create RFQ');
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to create RFQ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-6">Create New RFQ</h2>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vendor
            </label>
            <div ref={vendorRef} className="relative">
              <div className="relative">
                <Input
                  type="text"
                  name="vendor"
                  value={vendorSearch}
                  onChange={(e) => handleInputChange(e)}
                  required
                  placeholder="Search for vendor"
                  onFocus={() => setShowVendorDropdown(true)}
                  className="pr-10"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ChevronIcon isOpen={showVendorDropdown} />
                </div>
              </div>
              {showVendorDropdown && filteredVendors.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredVendors
                    .filter(vendor => vendor.isActive !== false) // Double-check: only show active vendors
                    .map((vendor) => (
                      <div
                        key={vendor.id}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleVendorSelect(vendor)}
                      >
                        <div className="font-medium">{vendor.name}</div>
                        <div className="text-sm text-gray-500">{vendor.email}</div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order Deadline
            </label>
            <Input
              type="date"
              name="orderDeadline"
              value={formData.orderDeadline}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Products
            </label>
            
            {/* Product Search and Selection */}
            <div ref={productRef} className="relative">
              <div className="relative">
                <Input
                  type="text"
                  name="productSearch"
                  value={productSearch}
                  onChange={handleInputChange}
                  placeholder="Search for products"
                  className="pr-10"
                  onFocus={() => setShowProductDropdown(true)}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ChevronIcon isOpen={showProductDropdown} />
                </div>
              </div>
              {showProductDropdown && filteredProducts.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3"
                    >
                      <input
                        type="checkbox"
                        checked={selectedProductIds.has(product.id)}
                        onChange={() => handleProductToggle(product)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1" onClick={() => handleProductToggle(product)}>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-500">
                          {product.description} {product.category ? `- ${product.category}` : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Products as Chips */}
            {formData.products.length > 0 && (
              <div className="space-y-3">
                <div className="text-sm font-medium text-gray-700">
                  Selected Products ({formData.products.length})
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {formData.products.map((product) => {
                    const attributes = product.attributes || {};
                    const attributeEntries = Object.entries(attributes);
                    
                    return (
                      <div
                        key={product.productId}
                        className="bg-blue-50 border border-blue-200 rounded-lg p-3 w-full"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="font-medium text-gray-900 text-sm flex-1">
                            {product.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeProduct(product.productId)}
                            className="text-red-600 hover:text-red-800 ml-2"
                          >
                            ×
                          </button>
                        </div>
                        
                        {/* Custom Attributes Display */}
                        {attributeEntries.length > 0 && (
                          <div className="mb-2 pb-2 border-b border-blue-200">
                            <div className="flex flex-wrap gap-1">
                              {attributeEntries.map(([key, value]) => (
                                <span
                                  key={key}
                                  className="px-2 py-0.5 bg-white border border-blue-300 rounded text-xs text-gray-700"
                                  title={`${key}: ${value}`}
                                >
                                  <span className="font-medium">{key}:</span> {value || '—'}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <label className="block text-xs text-gray-600 mb-1">Quantity</label>
                            <Input
                              type="number"
                              value={product.quantity}
                              onChange={(e) => handleProductUpdate(product.productId, 'quantity', e.target.value)}
                              placeholder="Qty"
                              required
                              min="1"
                              className="text-sm h-8"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-xs text-gray-600 mb-1">Unit</label>
                            <Input
                              type="text"
                              value={product.unit}
                              onChange={(e) => handleProductUpdate(product.productId, 'unit', e.target.value)}
                              placeholder="Unit"
                              required
                              className="text-sm h-8"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button
            type="button"
            onClick={onCancel}
            className="bg-gradient-to-r from-red-600 to-black text-white hover:from-red-700 hover:to-gray-900"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-gradient-to-r from-green-600 to-black text-white hover:from-green-700 hover:to-gray-900"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create RFQ'}
          </Button>
        </div>
      </div>
    </form>
  );
}

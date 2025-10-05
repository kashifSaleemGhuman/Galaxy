import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { mockVendors, mockProducts } from './mockData';
import ChevronIcon from './ChevronIcon';

export default function RfqForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    vendor: '',
    vendorId: null,
    orderDeadline: '',
    products: [{ productId: null, name: '', quantity: '', unit: '' }]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Search states
  const [vendorSearch, setVendorSearch] = useState('');
  const [showVendorDropdown, setShowVendorDropdown] = useState(false);
  const [filteredVendors, setFilteredVendors] = useState(mockVendors);
  const [productSearches, setProductSearches] = useState(['']);
  const [showProductDropdowns, setShowProductDropdowns] = useState([false]);
  const [filteredProducts, setFilteredProducts] = useState([mockProducts]);
  
  const vendorRef = useRef(null);
  const productRefs = useRef([]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (vendorRef.current && !vendorRef.current.contains(event.target)) {
        setShowVendorDropdown(false);
      }
      productRefs.current.forEach((ref, index) => {
        if (ref && !ref.contains(event.target)) {
          const newDropdowns = [...showProductDropdowns];
          newDropdowns[index] = false;
          setShowProductDropdowns(newDropdowns);
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProductDropdowns]);

  // Handle vendor search
  const handleVendorSearch = (value) => {
    setVendorSearch(value);
    setShowVendorDropdown(true);
    const filtered = mockVendors.filter(vendor => 
      vendor.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredVendors(filtered);
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
  const handleProductSearch = (value, index) => {
    const newSearches = [...productSearches];
    newSearches[index] = value;
    setProductSearches(newSearches);

    const newDropdowns = [...showProductDropdowns];
    newDropdowns[index] = true;
    setShowProductDropdowns(newDropdowns);

    const filtered = mockProducts.filter(product =>
      product.name.toLowerCase().includes(value.toLowerCase())
    );
    const newFilteredProducts = [...filteredProducts];
    newFilteredProducts[index] = filtered;
    setFilteredProducts(newFilteredProducts);
  };

  // Handle product selection
  const handleProductSelect = (product, index) => {
    const newProducts = [...formData.products];
    newProducts[index] = {
      ...newProducts[index],
      productId: product.id,
      name: product.name,
      unit: product.defaultUnit
    };
    setFormData({ ...formData, products: newProducts });
    
    const newSearches = [...productSearches];
    newSearches[index] = product.name;
    setProductSearches(newSearches);

    const newDropdowns = [...showProductDropdowns];
    newDropdowns[index] = false;
    setShowProductDropdowns(newDropdowns);
  };

  const handleInputChange = (e, index) => {
    const { name, value } = e.target;
    if (name === 'vendor') {
      handleVendorSearch(value);
    } else if (name.startsWith('product.name')) {
      handleProductSearch(value, index);
    } else if (name.startsWith('product')) {
      const field = name.split('.')[1];
      const newProducts = [...formData.products];
      newProducts[index] = {
        ...newProducts[index],
        [field]: value
      };
      setFormData({ ...formData, products: newProducts });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const addProduct = () => {
    setFormData({
      ...formData,
      products: [...formData.products, { name: '', quantity: '', unit: '' }]
    });
  };

  const removeProduct = (index) => {
    const newProducts = formData.products.filter((_, i) => i !== index);
    setFormData({ ...formData, products: newProducts });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSubmit(formData);
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
                  className="pr-10" // Make room for the chevron
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ChevronIcon isOpen={showVendorDropdown} />
                </div>
              </div>
              {showVendorDropdown && filteredVendors.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredVendors.map((vendor) => (
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
            {formData.products.map((product, index) => (
              <div key={index} className="flex gap-4 items-start">
                <div className="flex-1">
                  <div ref={el => productRefs.current[index] = el} className="relative">
                    <div className="relative">
                      <Input
                        type="text"
                        name={`product.name`}
                        value={productSearches[index]}
                        onChange={(e) => handleInputChange(e, index)}
                        placeholder="Search for product"
                        required
                        className="pr-10" // Make room for the chevron
                        onFocus={() => {
                          const newDropdowns = [...showProductDropdowns];
                          newDropdowns[index] = true;
                          setShowProductDropdowns(newDropdowns);
                        }}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <ChevronIcon isOpen={showProductDropdowns[index]} />
                      </div>
                    </div>
                    {showProductDropdowns[index] && filteredProducts[index]?.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                        {filteredProducts[index].map((product) => (
                          <div
                            key={product.id}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleProductSelect(product, index)}
                          >
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-gray-500">
                              {product.description} - {product.category}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="w-24">
                  <Input
                    type="number"
                    name={`product.quantity`}
                    value={product.quantity}
                    onChange={(e) => handleInputChange(e, index)}
                    placeholder="Qty"
                    required
                    min="1"
                  />
                </div>
                <div className="w-24">
                  <Input
                    type="text"
                    name={`product.unit`}
                    value={product.unit}
                    onChange={(e) => handleInputChange(e, index)}
                    placeholder="Unit"
                    required
                  />
                </div>
                {index > 0 && (
                  <Button
                    type="button"
                    onClick={() => removeProduct(index)}
                    className="bg-red-50 text-red-600 hover:bg-red-100"
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              onClick={addProduct}
              className="bg-gray-50 text-gray-600 hover:bg-gray-100"
            >
              Add Product
            </Button>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button
            type="button"
            onClick={onCancel}
            className="bg-gray-50 text-gray-600 hover:bg-gray-100"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create RFQ'}
          </Button>
        </div>
      </div>
    </form>
  );
}

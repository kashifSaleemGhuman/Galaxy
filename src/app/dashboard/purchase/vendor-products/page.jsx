"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Table } from '../_components/Table';

export default function VendorProductsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [vendorProducts, setVendorProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    vendorId: '',
    productId: '',
    price: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Check if user is purchase_manager or above
  const isAuthorized = session?.user?.role === 'purchase_manager' || 
                       session?.user?.role === 'admin' || 
                       session?.user?.role === 'super_admin';

  useEffect(() => {
    if (status === 'loading') return;
    
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    fetchData();
  }, [status, router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch vendors (only active vendors for linking)
      const vendorsRes = await fetch('/api/vendors?activeOnly=true');
      const vendorsData = await vendorsRes.json();
      if (vendorsData.vendors) {
        setVendors(vendorsData.vendors);
      }

      // Fetch products (only active products for linking)
      const productsRes = await fetch('/api/purchase/products?activeOnly=true');
      const productsData = await productsRes.json();
      if (productsData.success && productsData.data) {
        setProducts(productsData.data);
      }

      // Fetch vendor-products
      const vpRes = await fetch('/api/purchase/vendor-products');
      const vpData = await vpRes.json();
      if (vpData.success && vpData.data) {
        setVendorProducts(vpData.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const response = await fetch('/api/purchase/vendor-products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vendorId: formData.vendorId,
          productId: formData.productId,
          price: formData.price || null
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('Vendor-Product link created successfully!');
        setFormData({ vendorId: '', productId: '', price: '' });
        setShowForm(false);
        fetchData(); // Refresh the list
      } else {
        setError(data.error || 'Failed to link vendor and product');
      }
    } catch (error) {
      console.error('Error linking vendor and product:', error);
      setError('Failed to link vendor and product. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Vendor-Product Links</h2>
          <p className="text-sm text-gray-600 mt-1">Manage which vendors supply which products</p>
        </div>
        {isAuthorized && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-black hover:from-blue-700 hover:to-gray-900 text-white rounded-md text-sm"
          >
            {showForm ? 'Cancel' : 'Link Vendor & Product'}
          </button>
        )}
      </div>

      {isAuthorized && showForm && (
        <div className="bg-white shadow-md rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Link Vendor with Product</h3>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800 text-sm">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vendor *
              </label>
              <select
                name="vendorId"
                value={formData.vendorId}
                onChange={handleChange}
                className="w-full bg-gray-100 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a vendor</option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name} ({vendor.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product *
              </label>
              <select
                name="productId"
                value={formData.productId}
                onChange={handleChange}
                className="w-full bg-gray-100 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.unit})
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (Optional)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full bg-gray-100 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter price for this vendor-product combination"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty if price varies or will be set later
              </p>
            </div>

            <div className="sm:col-span-2 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-black hover:from-blue-700 hover:to-gray-900 text-white rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Linking...' : 'Link Vendor & Product'}
              </button>
            </div>
          </form>
        </div>
      )}

      {!isAuthorized && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-yellow-800 text-sm">
            You don't have permission to link vendors and products. Only purchase managers can manage these links.
          </p>
        </div>
      )}

      <div className="bg-white shadow-md rounded-xl overflow-hidden">
        {vendorProducts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No vendor-product links found. {isAuthorized && 'Click "Link Vendor & Product" to create one.'}</p>
          </div>
        ) : (
          <Table
            columns={[
              { 
                key: 'vendor', 
                header: 'Vendor', 
                cell: (row) => (
                  <div>
                    <div className="font-medium">{row.vendor.name}</div>
                    <div className="text-xs text-gray-500">{row.vendor.email}</div>
                  </div>
                )
              },
              { 
                key: 'product', 
                header: 'Product', 
                cell: (row) => (
                  <div>
                    <div className="font-medium">{row.product.name}</div>
                    <div className="text-xs text-gray-500">
                      {row.product.category && `${row.product.category} • `}
                      {row.product.unit}
                    </div>
                  </div>
                )
              },
              { 
                key: 'price', 
                header: 'Price', 
                cell: (row) => row.price ? `$${parseFloat(row.price).toFixed(2)}` : 'Not set'
              },
              { 
                key: 'isActive', 
                header: 'Status', 
                cell: (row) => (
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    row.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {row.isActive ? 'Active' : 'Inactive'}
                  </span>
                )
              },
            ]}
            data={vendorProducts}
          />
        )}
      </div>
    </div>
  );
}


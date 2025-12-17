"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Table } from '../_components/Table';
import { useToast } from '@/components/ui/Toast';

const generateTempId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `tmp-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

const createAttributeRow = (overrides = {}) => ({
  id: overrides.id || generateTempId(),
  key: overrides.key || '',
  value: overrides.value ?? ''
});

const toAttributeRows = (attributes) => {
  if (!attributes || typeof attributes !== 'object') {
    return [];
  }

  return Object.entries(attributes).map(([key, value]) =>
    createAttributeRow({
      id: generateTempId(),
      key,
      value: value ?? ''
    })
  );
};

const renderAttributeBadges = (attributes) => {
  if (!attributes || typeof attributes !== 'object') {
    return <span className="text-gray-400 text-xs">—</span>;
  }

  const entries = Object.entries(attributes);
  if (entries.length === 0) {
    return <span className="text-gray-400 text-xs">—</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {entries.slice(0, 3).map(([key, value]) => (
        <span
          key={key}
          className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs"
        >
          {key}: {value}
        </span>
      ))}
      {entries.length > 3 && (
        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
          +{entries.length - 3} more
        </span>
      )}
    </div>
  );
};

export default function VendorsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [deletingVendor, setDeletingVendor] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    bankName: '',
    bankAccountNumber: '',
    isActive: true
  });
  const [attributeRows, setAttributeRows] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { showToast, ToastContainer } = useToast();

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

    fetchVendors();
  }, [status, router]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/vendors');
      const data = await response.json();
      if (data.vendors) {
        setVendors(data.vendors);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
      setError('Failed to fetch vendors');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleAddAttribute = () => {
    setAttributeRows([...attributeRows, createAttributeRow()]);
  };

  const handleAttributeChange = (id, field, value) => {
    setAttributeRows(
      attributeRows.map((row) =>
        row.id === id ? { ...row, [field]: value } : row
      )
    );
  };

  const handleRemoveAttribute = (id) => {
    setAttributeRows(attributeRows.filter((row) => row.id !== id));
  };

  const resetFormState = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      bankName: '',
      bankAccountNumber: '',
      isActive: true
    });
    setAttributeRows([]);
    setEditingVendor(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    const attributesPayload = attributeRows
      .filter((row) => row.key.trim())
      .map((row) => ({
        key: row.key.trim(),
        value: typeof row.value === 'string' ? row.value.trim() : row.value ?? ''
      }));

    try {
      const url = editingVendor 
        ? `/api/vendors/${editingVendor.id}`
        : '/api/vendors';
      const method = editingVendor ? 'PUT' : 'POST';

      const payload = {
        ...formData,
        attributes: attributesPayload
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const message = editingVendor ? 'Vendor updated successfully!' : 'Vendor added successfully!';
        setSuccess(message);
        showToast(message, 'success');
        resetFormState();
        setShowForm(false);
        fetchVendors(); // Refresh the list
      } else {
        const errorMsg = data.error || `Failed to ${editingVendor ? 'update' : 'add'} vendor`;
        setError(errorMsg);
        showToast(errorMsg, 'error');
      }
    } catch (error) {
      console.error(`Error ${editingVendor ? 'updating' : 'adding'} vendor:`, error);
      const errorMsg = `Failed to ${editingVendor ? 'update' : 'add'} vendor. Please try again.`;
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (vendor) => {
    setEditingVendor(vendor);
    setFormData({
      name: vendor.name,
      email: vendor.email,
      phone: vendor.phone || '',
      address: vendor.address || '',
      bankName: vendor.bankName || '',
      bankAccountNumber: vendor.bankAccountNumber || '',
      isActive: vendor.isActive
    });
    setAttributeRows(toAttributeRows(vendor.attributes));
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const handleDelete = async (vendor) => {
    if (!confirm(`Are you sure you want to delete "${vendor.name}"? This will deactivate the vendor.`)) {
      return;
    }

    setDeletingVendor(vendor.id);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/vendors/${vendor.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const message = 'Vendor deleted successfully!';
        setSuccess(message);
        showToast(message, 'success');
        fetchVendors(); // Refresh the list
      } else {
        const errorMsg = data.error || 'Failed to delete vendor';
        setError(errorMsg);
        showToast(errorMsg, 'error');
      }
    } catch (error) {
      console.error('Error deleting vendor:', error);
      const errorMsg = 'Failed to delete vendor. Please try again.';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setDeletingVendor(null);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    resetFormState();
    setError('');
    setSuccess('');
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
      <ToastContainer />
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Vendors</h2>
        {isAuthorized && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-black hover:from-blue-700 hover:to-gray-900 text-white rounded-md text-sm"
          >
            {showForm ? 'Cancel' : 'New Vendor'}
          </button>
        )}
      </div>

      {isAuthorized && showForm && (
        <div className="bg-white shadow-md rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingVendor ? 'Edit Vendor' : 'Add New Vendor'}
          </h3>
          
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
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vendor Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-gray-100 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter vendor name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-gray-100 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="vendor@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-gray-100 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+1-555-123-4567"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className="w-full bg-gray-100 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter vendor address"
              />
            </div>

            <div className="sm:col-span-2 border-t border-gray-200 pt-4 mt-2">
              <h4 className="text-sm font-semibold text-gray-800 mb-3">Bank Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bank Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    className="w-full bg-gray-100 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Chase Bank"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    IBAN / Account Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="bankAccountNumber"
                    value={formData.bankAccountNumber}
                    onChange={handleChange}
                    className="w-full bg-gray-100 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., GB82 WEST 1234 5698 7654 32"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="sm:col-span-2 border-t border-gray-200 pt-4 mt-2">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-gray-800">Custom Fields</p>
                  <p className="text-xs text-gray-500">
                    Add optional vendor information such as tax ID, registration number, or other details.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddAttribute}
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700"
                >
                  Add Field
                </button>
              </div>

              {attributeRows.length === 0 ? (
                <p className="text-xs text-gray-500">No custom fields defined.</p>
              ) : (
                <div className="space-y-3">
                  {attributeRows.map((row) => (
                    <div
                      key={row.id}
                      className="flex flex-col sm:flex-row gap-2 sm:items-center"
                    >
                      <input
                        type="text"
                        value={row.key}
                        onChange={(e) => handleAttributeChange(row.id, 'key', e.target.value)}
                        className="flex-1 bg-gray-100 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Label (e.g., Tax ID)"
                      />
                      <input
                        type="text"
                        value={row.value}
                        onChange={(e) => handleAttributeChange(row.id, 'value', e.target.value)}
                        className="flex-1 bg-gray-100 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Value (e.g., 12-3456789)"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveAttribute(row.id)}
                        className="text-xs text-red-600 hover:text-red-800 px-2 py-1 rounded-md hover:bg-red-50"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {editingVendor && (
              <div className="sm:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
              </div>
            )}

            <div className="sm:col-span-2 pt-2 flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-black hover:from-blue-700 hover:to-gray-900 text-white rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (editingVendor ? 'Updating...' : 'Adding...') : (editingVendor ? 'Update Vendor' : 'Add Vendor')}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={submitting}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {!isAuthorized && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-yellow-800 text-sm">
            You don't have permission to add vendors. Only purchase managers can add vendors.
          </p>
        </div>
      )}

      {/* Active Vendors */}
      <div className="bg-white shadow-md rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Active Vendors</h3>
          <p className="text-sm text-gray-500 mt-1">These vendors can be used for creating new RFQs</p>
        </div>
        <Table
          columns={[
            { key: 'name', header: 'Name' },
            { key: 'email', header: 'Email' },
            { key: 'phone', header: 'Phone', cell: (row) => row.phone || 'N/A' },
            { 
              key: 'bankDetails', 
              header: 'Bank Details', 
              cell: (row) => (
                <div className="text-xs">
                  {row.bankName ? (
                    <div>
                      <div className="font-medium">{row.bankName}</div>
                      {row.bankAccountNumber && (
                        <div className="text-gray-500 mt-0.5">{row.bankAccountNumber}</div>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </div>
              )
            },
            { 
              key: 'customFields', 
              header: 'Custom Fields', 
              cell: (row) => renderAttributeBadges(row.attributes)
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
            {
              key: 'actions',
              header: 'Actions',
              cell: (row) => isAuthorized ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(row)}
                    className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(row)}
                    disabled={deletingVendor === row.id}
                    className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingVendor === row.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              ) : null
            },
          ]}
          data={vendors.filter(v => v.isActive)}
        />
      </div>

      {/* Inactive Vendors */}
      {vendors.filter(v => !v.isActive).length > 0 && (
        <div className="bg-white shadow-md rounded-xl overflow-hidden opacity-75">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-700">Inactive Vendors</h3>
            <p className="text-sm text-gray-500 mt-1">These vendors cannot be used for creating new RFQs</p>
          </div>
          <Table
            columns={[
              { key: 'name', header: 'Name', cell: (row) => <span className="text-gray-500">{row.name}</span> },
              { key: 'email', header: 'Email', cell: (row) => <span className="text-gray-500">{row.email}</span> },
              { key: 'phone', header: 'Phone', cell: (row) => <span className="text-gray-500">{row.phone || 'N/A'}</span> },
              { 
                key: 'bankDetails', 
                header: 'Bank Details', 
                cell: (row) => (
                  <div className="text-xs text-gray-500">
                    {row.bankName ? (
                      <div>
                        <div className="font-medium">{row.bankName}</div>
                        {row.bankAccountNumber && (
                          <div className="mt-0.5">{row.bankAccountNumber}</div>
                        )}
                      </div>
                    ) : (
                      <span>—</span>
                    )}
                  </div>
                )
              },
              { 
                key: 'customFields', 
                header: 'Custom Fields', 
                cell: (row) => (
                  <div className="text-gray-500">
                    {renderAttributeBadges(row.attributes)}
                  </div>
                )
              },
              { 
                key: 'isActive', 
                header: 'Status', 
                cell: (row) => (
                  <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                    Inactive
                  </span>
                )
              },
              {
                key: 'actions',
                header: 'Actions',
                cell: (row) => isAuthorized ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(row)}
                      className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(row)}
                      disabled={deletingVendor === row.id}
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deletingVendor === row.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                ) : null
              },
            ]}
            data={vendors.filter(v => !v.isActive)}
          />
        </div>
      )}
    </div>
  );
}


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

const createEmptyProductForm = () => ({
  name: '',
  description: '',
  category: '',
  unit: '',
  isActive: true
});

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

const createQuestionRow = (overrides = {}) => ({
  id: overrides.id || generateTempId(),
  prompt: overrides.prompt || '',
  placeholder: overrides.placeholder || '',
  required: overrides.required !== false,
  type: overrides.type || 'text'
});

const toQuestionRows = (questions) => {
  if (!Array.isArray(questions)) {
    return [];
  }

  return questions.map((question) =>
    createQuestionRow({
      id: question.id || generateTempId(),
      prompt: question.prompt || '',
      placeholder: question.placeholder || '',
      required: question.required !== false,
      type: question.type || 'text'
    })
  );
};

const TRACEABILITY_TYPE_OPTIONS = [
  { value: 'text', label: 'Short text' },
  { value: 'textarea', label: 'Paragraph' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
];

export default function ProductsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [formData, setFormData] = useState(createEmptyProductForm());
  const [attributeRows, setAttributeRows] = useState([]);
  const [questionRows, setQuestionRows] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { showToast, ToastContainer } = useToast();

  const renderAttributeBadges = (attributes) => {
    if (!attributes || typeof attributes !== 'object') {
      return <span className="text-gray-400 text-xs">—</span>;
    }

    const entries = Object.entries(attributes);
    if (entries.length === 0) {
      return <span className="text-gray-400 text-xs">—</span>;
    }

    const preview = entries.slice(0, 3);

    return (
      <div className="flex flex-wrap gap-1">
        {preview.map(([key, value]) => (
          <span
            key={key}
            className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs"
          >
            {key}: {value === undefined || value === null ? '' : String(value)}
          </span>
        ))}
        {entries.length > 3 && (
          <span className="text-xs text-gray-500">
            +{entries.length - 3} more
          </span>
        )}
      </div>
    );
  };

  const renderTraceabilitySummary = (questions) => {
    const list = Array.isArray(questions) ? questions : [];

    if (list.length === 0) {
      return <span className="text-gray-400 text-xs">—</span>;
    }

    const requiredCount = list.filter((q) => q.required !== false).length;

    return (
      <span className="text-xs font-medium text-gray-700">
        {requiredCount} of {list.length} required
      </span>
    );
  };

  const resetDynamicFields = () => {
    setAttributeRows([]);
    setQuestionRows([]);
  };

  const resetFormState = () => {
    setFormData(createEmptyProductForm());
    setEditingProduct(null);
    resetDynamicFields();
  };

  const handleAddAttribute = () => {
    setAttributeRows((rows) => [...rows, createAttributeRow()]);
    setError('');
    setSuccess('');
  };

  const handleAttributeChange = (id, field, value) => {
    setAttributeRows((rows) =>
      rows.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
    setError('');
    setSuccess('');
  };

  const handleRemoveAttribute = (id) => {
    setAttributeRows((rows) => rows.filter((row) => row.id !== id));
    setError('');
    setSuccess('');
  };

  const handleAddQuestion = () => {
    setQuestionRows((rows) => [...rows, createQuestionRow({ required: true })]);
    setError('');
    setSuccess('');
  };

  const handleQuestionChange = (id, field, value) => {
    setQuestionRows((rows) =>
      rows.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
    setError('');
    setSuccess('');
  };

  const handleRemoveQuestion = (id) => {
    setQuestionRows((rows) => rows.filter((row) => row.id !== id));
    setError('');
    setSuccess('');
  };

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

    fetchProducts();
  }, [status, router]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Fetch all products (both active and inactive) for management page
      const response = await fetch('/api/purchase/products?activeOnly=false');
      const data = await response.json();
      if (data.success && data.data) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to fetch products');
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

    const attributesPayload = attributeRows
      .filter((row) => row.key.trim())
      .map((row) => ({
        key: row.key.trim(),
        value: typeof row.value === 'string' ? row.value.trim() : row.value ?? ''
      }));

    const questionsPayload = questionRows
      .filter((row) => row.prompt.trim())
      .map((row) => ({
        id: row.id,
        prompt: row.prompt.trim(),
        type: row.type || 'text',
        required: row.required !== false,
        placeholder: row.placeholder?.trim() || undefined
      }));

    try {
      const payload = {
        ...formData,
        attributes: attributesPayload,
        traceabilityQuestions: questionsPayload
      };

      const url = editingProduct 
        ? `/api/purchase/products/${editingProduct.id}`
        : '/api/purchase/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const message = editingProduct ? 'Product updated successfully!' : 'Product added successfully!';
        setSuccess(message);
        showToast(message, 'success');
        resetFormState();
        setShowForm(false);
        fetchProducts(); // Refresh the list
      } else {
        const errorMsg = data.error || `Failed to ${editingProduct ? 'update' : 'add'} product`;
        setError(errorMsg);
        showToast(errorMsg, 'error');
      }
    } catch (error) {
      console.error(`Error ${editingProduct ? 'updating' : 'adding'} product:`, error);
      const errorMsg = `Failed to ${editingProduct ? 'update' : 'add'} product. Please try again.`;
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      category: product.category || '',
      unit: product.unit,
      isActive: product.isActive
    });
    setAttributeRows(toAttributeRows(product.attributes));
    setQuestionRows(toQuestionRows(product.traceabilityQuestions));
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const handleDelete = async (product) => {
    if (!confirm(`Are you sure you want to delete "${product.name}"? This will deactivate the product.`)) {
      return;
    }

    setDeletingProduct(product.id);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/purchase/products/${product.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const message = 'Product deleted successfully!';
        setSuccess(message);
        showToast(message, 'success');
        fetchProducts(); // Refresh the list
      } else {
        const errorMsg = data.error || 'Failed to delete product';
        setError(errorMsg);
        showToast(errorMsg, 'error');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      const errorMsg = 'Failed to delete product. Please try again.';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setDeletingProduct(null);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    resetFormState();
    setError('');
    setSuccess('');
  };

  const handleNewProductClick = () => {
    if (showForm) {
      handleCancel();
      return;
    }

    resetFormState();
    setShowForm(true);
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
        <h2 className="text-xl font-semibold text-gray-900">Products</h2>
        {isAuthorized && (
          <button
            onClick={handleNewProductClick}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-black hover:from-blue-700 hover:to-gray-900 text-white rounded-md text-sm"
          >
            {showForm ? 'Cancel' : 'New Product'}
          </button>
        )}
      </div>

      {isAuthorized && showForm && (
        <div className="bg-white shadow-md rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingProduct ? 'Edit Product' : 'Add New Product'}
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
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-gray-100 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter product name"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full bg-gray-100 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter product description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-gray-100 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Electronics, Office Supplies"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit *
              </label>
              <input
                type="text"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="w-full bg-gray-100 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., pcs, kg, box"
                required
              />
            </div>

            {editingProduct && (
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

            <div className="sm:col-span-2 border-t border-gray-200 pt-4 mt-2">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-gray-800">Custom Fields</p>
                  <p className="text-xs text-gray-500">
                    Add optional product attributes such as weight, color, or packaging.
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
                        placeholder="Label (e.g., Weight)"
                      />
                      <input
                        type="text"
                        value={row.value}
                        onChange={(e) => handleAttributeChange(row.id, 'value', e.target.value)}
                        className="flex-1 bg-gray-100 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Value (e.g., 10 kg)"
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

            <div className="sm:col-span-2 border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-gray-800">Traceability Questions</p>
                  <p className="text-xs text-gray-500">
                    Vendors must answer these before you can record a quote.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700"
                >
                  Add Question
                </button>
              </div>

              {questionRows.length === 0 ? (
                <p className="text-xs text-gray-500">No traceability questions defined.</p>
              ) : (
                <div className="space-y-4">
                  {questionRows.map((row) => (
                    <div key={row.id} className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3 border border-gray-200 rounded-lg">
                      <div className="sm:col-span-5">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Question *
                        </label>
                        <input
                          type="text"
                          value={row.prompt}
                          onChange={(e) => handleQuestionChange(row.id, 'prompt', e.target.value)}
                          className="w-full bg-gray-100 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., Country of origin"
                          required
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Answer Type
                        </label>
                        <select
                          value={row.type}
                          onChange={(e) => handleQuestionChange(row.id, 'type', e.target.value)}
                          className="w-full bg-gray-100 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {TRACEABILITY_TYPE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Placeholder
                        </label>
                        <input
                          type="text"
                          value={row.placeholder}
                          onChange={(e) => handleQuestionChange(row.id, 'placeholder', e.target.value)}
                          className="w-full bg-gray-100 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Optional hint"
                        />
                      </div>

                      <div className="sm:col-span-1 flex flex-col justify-between">
                        <label className="flex items-center text-xs font-medium text-gray-600">
                          <input
                            type="checkbox"
                            checked={row.required !== false}
                            onChange={(e) => handleQuestionChange(row.id, 'required', e.target.checked)}
                            className="mr-1"
                          />
                          Required
                        </label>
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(row.id)}
                          className="mt-2 text-xs text-red-600 hover:text-red-800 px-2 py-1 rounded-md hover:bg-red-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="sm:col-span-2 pt-2 flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-black hover:from-blue-700 hover:to-gray-900 text-white rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (editingProduct ? 'Updating...' : 'Adding...') : (editingProduct ? 'Update Product' : 'Add Product')}
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
            You don't have permission to add products. Only purchase managers can add products.
          </p>
        </div>
      )}

      {/* Active Products */}
      <div className="bg-white shadow-md rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Active Products</h3>
          <p className="text-sm text-gray-500 mt-1">These products can be used for creating new RFQs</p>
        </div>
        <Table
          columns={[
            { key: 'name', header: 'Name' },
            { key: 'description', header: 'Description', cell: (row) => row.description || 'N/A' },
            { key: 'category', header: 'Category', cell: (row) => row.category || 'N/A' },
            { key: 'unit', header: 'Unit' },
            { key: 'attributes', header: 'Custom Fields', cell: (row) => renderAttributeBadges(row.attributes) },
            { key: 'traceability', header: 'Traceability', cell: (row) => renderTraceabilitySummary(row.traceabilityQuestions) },
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
                    disabled={deletingProduct === row.id}
                    className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingProduct === row.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              ) : null
            },
          ]}
          data={products.filter(p => p.isActive)}
        />
      </div>

      {/* Inactive Products */}
      {products.filter(p => !p.isActive).length > 0 && (
        <div className="bg-white shadow-md rounded-xl overflow-hidden opacity-75">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-700">Inactive Products</h3>
            <p className="text-sm text-gray-500 mt-1">These products cannot be used for creating new RFQs. Edit to reactivate them.</p>
          </div>
          <Table
            columns={[
              { key: 'name', header: 'Name', cell: (row) => <span className="text-gray-500">{row.name}</span> },
              { key: 'description', header: 'Description', cell: (row) => <span className="text-gray-500">{row.description || 'N/A'}</span> },
              { key: 'category', header: 'Category', cell: (row) => <span className="text-gray-500">{row.category || 'N/A'}</span> },
              { key: 'unit', header: 'Unit', cell: (row) => <span className="text-gray-500">{row.unit}</span> },
            { key: 'attributes', header: 'Custom Fields', cell: (row) => renderAttributeBadges(row.attributes) },
            { key: 'traceability', header: 'Traceability', cell: (row) => renderTraceabilitySummary(row.traceabilityQuestions) },
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
                      title="Edit to reactivate"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(row)}
                      disabled={deletingProduct === row.id}
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deletingProduct === row.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                ) : null
              },
            ]}
            data={products.filter(p => !p.isActive)}
          />
        </div>
      )}
    </div>
  );
}



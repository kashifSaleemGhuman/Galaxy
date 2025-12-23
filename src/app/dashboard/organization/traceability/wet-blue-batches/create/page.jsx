'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

export default function CreateWetBlueBatchPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [rawBatches, setRawBatches] = useState([]);
  const [loadingRawBatches, setLoadingRawBatches] = useState(true);

  const [formData, setFormData] = useState({
    wbCode: '',
    rawBatchId: '',
    receivedDate: new Date().toISOString().split('T')[0],
    quantity: '',
    unit: '',
    status: 'pending'
  });

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'organization', label: 'Organization', href: '/dashboard/organization' },
    { key: 'traceability', label: 'Incoming Traceability', href: '/dashboard/organization/traceability' },
    { key: 'create', label: 'New Wet Blue Batch', href: '#' },
  ];

  useEffect(() => {
    fetchRawBatches();
  }, []);

  const fetchRawBatches = async () => {
    try {
      setLoadingRawBatches(true);
      const res = await fetch('/api/organization/traceability/raw-batches');
      if (res.ok) {
        const data = await res.json();
        setRawBatches(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching raw batches:', error);
    } finally {
      setLoadingRawBatches(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setToast(null);

    try {
      if (!formData.wbCode || !formData.rawBatchId || !formData.receivedDate) {
        throw new Error('W/B Code, Raw Batch, and Received Date are required');
      }

      const res = await fetch('/api/organization/traceability/wet-blue-batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create wet blue batch');
      }

      setToast({ type: 'success', message: 'Wet Blue batch created successfully' });
      
      setTimeout(() => {
        router.push('/dashboard/organization/traceability');
      }, 1000);
    } catch (error) {
      console.error(error);
      setToast({ type: 'error', message: error.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <Breadcrumbs items={breadcrumbs} />
      
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Wet Blue Batch</h1>
          <p className="mt-1 text-sm text-gray-500">
            Register a new wet blue batch from raw batch
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="W/B Code *"
            name="wbCode"
            value={formData.wbCode}
            onChange={handleChange}
            required
            placeholder="e.g., 10000, 10001"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Raw Batch *
            </label>
            <select
              name="rawBatchId"
              value={formData.rawBatchId}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            >
              <option value="">Select Raw Batch</option>
              {loadingRawBatches ? (
                <option>Loading raw batches...</option>
              ) : (
                rawBatches.map((batch) => (
                  <option key={batch.id} value={batch.id}>
                    {batch.batchCode} - {batch.supplierName}
                  </option>
                ))
              )}
            </select>
          </div>

          <Input
            label="Received Date *"
            name="receivedDate"
            type="date"
            value={formData.receivedDate}
            onChange={handleChange}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="pending">Pending</option>
              <option value="sorted">Sorted</option>
              <option value="measured">Measured</option>
              <option value="graded">Graded</option>
            </select>
          </div>

          <Input
            label="Quantity"
            name="quantity"
            type="number"
            step="0.01"
            value={formData.quantity}
            onChange={handleChange}
            placeholder="Quantity"
          />

          <Input
            label="Unit"
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            placeholder="e.g., kg, pieces, m²"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            Create Wet Blue Batch
          </Button>
        </div>
      </form>
    </div>
  );
}


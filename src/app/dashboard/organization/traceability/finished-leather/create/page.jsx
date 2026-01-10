'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

export default function CreateFinishedLeatherBatchPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [rtBatches, setRtBatches] = useState([]);
  const [loadingRtBatches, setLoadingRtBatches] = useState(true);

  const [formData, setFormData] = useState({
    batchNumber: '',
    rtBatchId: '',
    completionDate: new Date().toISOString().split('T')[0],
    quantity: '',
    unit: '',
    thickness: '',
    color: '',
    weight: '',
    pieces: '',
    areaM2: '',
    customerOrderNumber: '',
    vendorCode: '',
    status: 'pending'
  });

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'organization', label: 'Organization', href: '/dashboard/organization' },
    { key: 'traceability', label: 'Incoming Traceability', href: '/dashboard/organization/traceability' },
    { key: 'create', label: 'New Finished Leather Batch', href: '#' },
  ];

  useEffect(() => {
    fetchReTanningBatches();
  }, []);

  const fetchReTanningBatches = async () => {
    try {
      setLoadingRtBatches(true);
      const res = await fetch('/api/organization/traceability/re-tanning-batches');
      if (res.ok) {
        const data = await res.json();
        setRtBatches(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching re-tanning batches:', error);
    } finally {
      setLoadingRtBatches(false);
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
      if (!formData.batchNumber || !formData.rtBatchId || !formData.completionDate) {
        throw new Error('Batch Number, Re-tanning Batch, and Completion Date are required');
      }

      const res = await fetch('/api/organization/traceability/finished-leather', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create finished leather batch');
      }

      setToast({ type: 'success', message: 'Finished leather batch created successfully' });
      
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
          <h1 className="text-2xl font-bold text-gray-900">Create Finished Leather Batch</h1>
          <p className="mt-1 text-sm text-gray-500">
            Register finished leather batch - final product ready for dispatch
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Batch Number *"
            name="batchNumber"
            value={formData.batchNumber}
            onChange={handleChange}
            required
            placeholder="e.g., FIN-2024-001"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Re-tanning Batch *
            </label>
            <select
              name="rtBatchId"
              value={formData.rtBatchId}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            >
              <option value="">Select Re-tanning Batch</option>
              {loadingRtBatches ? (
                <option>Loading re-tanning batches...</option>
              ) : (
                rtBatches.map((batch) => (
                  <option key={batch.id} value={batch.id}>
                    {batch.rtCode} - {batch.wbCode}
                  </option>
                ))
              )}
            </select>
          </div>

          <Input
            label="Completion Date *"
            name="completionDate"
            type="date"
            value={formData.completionDate}
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
              <option value="completed">Completed</option>
              <option value="dispatched">Dispatched</option>
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

          <Input
            label="Thickness"
            name="thickness"
            type="number"
            step="0.01"
            value={formData.thickness}
            onChange={handleChange}
            placeholder="Thickness"
          />

          <Input
            label="Color"
            name="color"
            value={formData.color}
            onChange={handleChange}
            placeholder="Color"
          />

          <Input
            label="Weight"
            name="weight"
            type="number"
            step="0.01"
            value={formData.weight}
            onChange={handleChange}
            placeholder="Weight"
          />

          <Input
            label="Pieces"
            name="pieces"
            type="number"
            value={formData.pieces}
            onChange={handleChange}
            placeholder="Number of pieces"
          />

          <Input
            label="Area (m²)"
            name="areaM2"
            type="number"
            step="0.01"
            value={formData.areaM2}
            onChange={handleChange}
            placeholder="Area in square meters"
          />

          <Input
            label="Customer Order Number"
            name="customerOrderNumber"
            value={formData.customerOrderNumber}
            onChange={handleChange}
            placeholder="Customer order number"
          />

          <Input
            label="Vendor Code"
            name="vendorCode"
            value={formData.vendorCode}
            onChange={handleChange}
            placeholder="Vendor code"
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
            Create Finished Batch
          </Button>
        </div>
      </form>
    </div>
  );
}


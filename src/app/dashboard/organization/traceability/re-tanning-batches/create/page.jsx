'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

export default function CreateReTanningBatchPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [wbBatches, setWbBatches] = useState([]);
  const [loadingWbBatches, setLoadingWbBatches] = useState(true);

  const [formData, setFormData] = useState({
    rtCode: '',
    wbBatchId: '',
    receivedDate: new Date().toISOString().split('T')[0],
    quantity: '',
    unit: '',
    recipe: '',
    technicianId: '',
    technicianName: '',
    status: 'pending'
  });

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'organization', label: 'Organization', href: '/dashboard/organization' },
    { key: 'traceability', label: 'Incoming Traceability', href: '/dashboard/organization/traceability' },
    { key: 'create', label: 'New Re-tanning Batch', href: '#' },
  ];

  useEffect(() => {
    fetchWetBlueBatches();
  }, []);

  const fetchWetBlueBatches = async () => {
    try {
      setLoadingWbBatches(true);
      const res = await fetch('/api/organization/traceability/wet-blue-batches');
      if (res.ok) {
        const data = await res.json();
        setWbBatches(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching wet blue batches:', error);
    } finally {
      setLoadingWbBatches(false);
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
      if (!formData.rtCode || !formData.wbBatchId || !formData.receivedDate) {
        throw new Error('RT Code, Wet Blue Batch, and Received Date are required');
      }

      const res = await fetch('/api/organization/traceability/re-tanning-batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create re-tanning batch');
      }

      setToast({ type: 'success', message: 'Re-tanning batch created successfully' });
      
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
          <h1 className="text-2xl font-bold text-gray-900">Create Re-tanning Batch</h1>
          <p className="mt-1 text-sm text-gray-500">
            Register a new re-tanning batch from wet blue batch
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="RT Code *"
            name="rtCode"
            value={formData.rtCode}
            onChange={handleChange}
            required
            placeholder="e.g., RKRCRT00102"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Wet Blue Batch *
            </label>
            <select
              name="wbBatchId"
              value={formData.wbBatchId}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            >
              <option value="">Select Wet Blue Batch</option>
              {loadingWbBatches ? (
                <option>Loading wet blue batches...</option>
              ) : (
                wbBatches.map((batch) => (
                  <option key={batch.id} value={batch.id}>
                    {batch.wbCode} - {batch.rawBatchCode}
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
              <option value="in_process">In Process</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <Input
            label="Recipe"
            name="recipe"
            value={formData.recipe}
            onChange={handleChange}
            placeholder="Recipe used"
          />

          <Input
            label="Technician Name"
            name="technicianName"
            value={formData.technicianName}
            onChange={handleChange}
            placeholder="Technician in charge"
          />

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
            Create Re-tanning Batch
          </Button>
        </div>
      </form>
    </div>
  );
}


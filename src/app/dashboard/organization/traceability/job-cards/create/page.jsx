'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

export default function CreateJobCardPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [rawBatches, setRawBatches] = useState([]);
  const [wbBatches, setWbBatches] = useState([]);
  const [rtBatches, setRtBatches] = useState([]);
  const [finishedBatches, setFinishedBatches] = useState([]);
  const [batchType, setBatchType] = useState('');

  const [formData, setFormData] = useState({
    jobCardNumber: '',
    rawBatchId: '',
    wbBatchId: '',
    rtBatchId: '',
    finishedBatchId: '',
    recipe: '',
    technicianId: '',
    technicianName: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'organization', label: 'Organization', href: '/dashboard/organization' },
    { key: 'traceability', label: 'Incoming Traceability', href: '/dashboard/organization/traceability' },
    { key: 'create', label: 'New Job Card', href: '#' },
  ];

  useEffect(() => {
    if (batchType) {
      fetchBatches();
    }
  }, [batchType]);

  const fetchBatches = async () => {
    try {
      if (batchType === 'raw') {
        const res = await fetch('/api/organization/traceability/raw-batches');
        if (res.ok) {
          const data = await res.json();
          setRawBatches(data.data || []);
        }
      } else if (batchType === 'wet_blue') {
        const res = await fetch('/api/organization/traceability/wet-blue-batches');
        if (res.ok) {
          const data = await res.json();
          setWbBatches(data.data || []);
        }
      } else if (batchType === 're_tanning') {
        const res = await fetch('/api/organization/traceability/re-tanning-batches');
        if (res.ok) {
          const data = await res.json();
          setRtBatches(data.data || []);
        }
      } else if (batchType === 'finished') {
        const res = await fetch('/api/organization/traceability/finished-leather');
        if (res.ok) {
          const data = await res.json();
          setFinishedBatches(data.data || []);
        }
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBatchTypeChange = (e) => {
    const type = e.target.value;
    setBatchType(type);
    // Clear all batch IDs when changing type
    setFormData(prev => ({
      ...prev,
      rawBatchId: '',
      wbBatchId: '',
      rtBatchId: '',
      finishedBatchId: ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setToast(null);

    try {
      if (!formData.jobCardNumber || !formData.date) {
        throw new Error('Job Card Number and Date are required');
      }

      // At least one batch reference is required
      if (!formData.rawBatchId && !formData.wbBatchId && !formData.rtBatchId && !formData.finishedBatchId) {
        throw new Error('Please select a batch');
      }

      const res = await fetch('/api/organization/traceability/job-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create job card');
      }

      setToast({ type: 'success', message: 'Job card created successfully' });
      
      setTimeout(() => {
        router.push('/dashboard/organization/traceability/job-cards');
      }, 1000);
    } catch (error) {
      console.error(error);
      setToast({ type: 'error', message: error.message });
    } finally {
      setSaving(false);
    }
  };

  const renderBatchSelector = () => {
    if (!batchType) return null;

    if (batchType === 'raw') {
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Raw Batch *
          </label>
          <select
            name="rawBatchId"
            value={formData.rawBatchId}
            onChange={handleChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required={batchType === 'raw'}
          >
            <option value="">Select Raw Batch</option>
            {rawBatches.map((batch) => (
              <option key={batch.id} value={batch.id}>
                {batch.batchCode} - {batch.supplierName}
              </option>
            ))}
          </select>
        </div>
      );
    } else if (batchType === 'wet_blue') {
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Wet Blue Batch *
          </label>
          <select
            name="wbBatchId"
            value={formData.wbBatchId}
            onChange={handleChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required={batchType === 'wet_blue'}
          >
            <option value="">Select Wet Blue Batch</option>
            {wbBatches.map((batch) => (
              <option key={batch.id} value={batch.id}>
                {batch.wbCode} - {batch.rawBatchCode}
              </option>
            ))}
          </select>
        </div>
      );
    } else if (batchType === 're_tanning') {
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Re-tanning Batch *
          </label>
          <select
            name="rtBatchId"
            value={formData.rtBatchId}
            onChange={handleChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required={batchType === 're_tanning'}
          >
            <option value="">Select Re-tanning Batch</option>
            {rtBatches.map((batch) => (
              <option key={batch.id} value={batch.id}>
                {batch.rtCode} - {batch.wbCode}
              </option>
            ))}
          </select>
        </div>
      );
    } else if (batchType === 'finished') {
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Finished Leather Batch *
          </label>
          <select
            name="finishedBatchId"
            value={formData.finishedBatchId}
            onChange={handleChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required={batchType === 'finished'}
          >
            <option value="">Select Finished Batch</option>
            {finishedBatches.map((batch) => (
              <option key={batch.id} value={batch.id}>
                {batch.batchNumber} - {batch.rtCode}
              </option>
            ))}
          </select>
        </div>
      );
    }
    return null;
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
          <h1 className="text-2xl font-bold text-gray-900">Create Job Card</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create a new job card linked to a batch
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Job Card Number *"
            name="jobCardNumber"
            value={formData.jobCardNumber}
            onChange={handleChange}
            required
            placeholder="e.g., JC-2024-001"
          />

          <Input
            label="Date *"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Batch Type *
            </label>
            <select
              value={batchType}
              onChange={handleBatchTypeChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            >
              <option value="">Select Batch Type</option>
              <option value="raw">Raw Batch</option>
              <option value="wet_blue">Wet Blue Batch</option>
              <option value="re_tanning">Re-tanning Batch</option>
              <option value="finished">Finished Leather Batch</option>
            </select>
          </div>

          {renderBatchSelector()}

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
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={4}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Additional notes or comments"
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
            Create Job Card
          </Button>
        </div>
      </form>
    </div>
  );
}


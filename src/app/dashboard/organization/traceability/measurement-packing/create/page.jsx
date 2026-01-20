'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

export default function CreateMeasurementPackingPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [finishedBatches, setFinishedBatches] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(true);

  const [formData, setFormData] = useState({
    recordNumber: '',
    finishedBatchId: '',
    measurementDate: new Date().toISOString().split('T')[0],
    batchNumberMeas: '',
    customerOrderNumber: '',
    vendorCode: '',
    thickness: '',
    color: '',
    weight: '',
    pieces: '',
    areaDm2: '',
    areaM2: '',
    packedDate: '',
    packingStatus: 'pending',
    packingNotes: '',
    qcStatus: '',
    qcNotes: '',
    qcDate: '',
    status: 'pending'
  });

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'organization', label: 'Organization', href: '/dashboard/organization' },
    { key: 'traceability', label: 'Outgoing Traceability', href: '/dashboard/organization/traceability/outgoing' },
    { key: 'create', label: 'New Measurement & Packing', href: '#' },
  ];

  useEffect(() => {
    fetchFinishedBatches();
  }, []);

  const fetchFinishedBatches = async () => {
    try {
      setLoadingBatches(true);
      const res = await fetch('/api/organization/traceability/finished-leather');
      if (res.ok) {
        const data = await res.json();
        setFinishedBatches(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching finished batches:', error);
    } finally {
      setLoadingBatches(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-convert dm² to m²
    if (name === 'areaDm2' && value) {
      const areaM2 = parseFloat(value) / 100;
      setFormData(prev => ({ ...prev, areaM2: areaM2.toFixed(2) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setToast(null);

    try {
      if (!formData.recordNumber || !formData.finishedBatchId || !formData.measurementDate) {
        throw new Error('Record Number, Finished Batch, and Measurement Date are required');
      }

      const res = await fetch('/api/organization/traceability/measurement-packing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create measurement/packing record');
      }

      setToast({ type: 'success', message: 'Measurement/Packing record created successfully' });
      
      setTimeout(() => {
        router.push('/dashboard/organization/traceability/measurement-packing');
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
          <h1 className="text-2xl font-bold text-gray-900">Create Measurement & Packing Record</h1>
          <p className="mt-1 text-sm text-gray-500">
            Record measurement and packing details for finished leather batches
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Record Number *"
            name="recordNumber"
            value={formData.recordNumber}
            onChange={handleChange}
            required
            placeholder="e.g., MP-2024-001"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Finished Batch *
            </label>
            <select
              name="finishedBatchId"
              value={formData.finishedBatchId}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            >
              <option value="">Select Finished Batch</option>
              {loadingBatches ? (
                <option>Loading finished batches...</option>
              ) : (
                finishedBatches.map((batch) => (
                  <option key={batch.id} value={batch.id}>
                    {batch.batchNumber} - {batch.rtCode}
                  </option>
                ))
              )}
            </select>
          </div>

          <Input
            label="Measurement Date *"
            name="measurementDate"
            type="date"
            value={formData.measurementDate}
            onChange={handleChange}
            required
          />

          <Input
            label="Batch Number (Measurement)"
            name="batchNumberMeas"
            value={formData.batchNumberMeas}
            onChange={handleChange}
            placeholder="Batch number for measurement"
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
            label="Area (dm²)"
            name="areaDm2"
            type="number"
            step="0.01"
            value={formData.areaDm2}
            onChange={handleChange}
            placeholder="Area in square decimeters"
          />

          <Input
            label="Area (m²)"
            name="areaM2"
            type="number"
            step="0.01"
            value={formData.areaM2}
            onChange={handleChange}
            placeholder="Area in square meters (auto-calculated)"
            disabled
          />

          <Input
            label="Packed Date"
            name="packedDate"
            type="date"
            value={formData.packedDate}
            onChange={handleChange}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Packing Status
            </label>
            <select
              name="packingStatus"
              value={formData.packingStatus}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

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
              <option value="measured">Measured</option>
              <option value="packed">Packed</option>
              <option value="ready_for_dispatch">Ready for Dispatch</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Packing Notes
            </label>
            <textarea
              name="packingNotes"
              value={formData.packingNotes}
              onChange={handleChange}
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Packing notes"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              QC Status
            </label>
            <select
              name="qcStatus"
              value={formData.qcStatus}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Select QC Status</option>
              <option value="passed">Passed</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <Input
            label="QC Date"
            name="qcDate"
            type="date"
            value={formData.qcDate}
            onChange={handleChange}
          />

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              QC Notes
            </label>
            <textarea
              name="qcNotes"
              value={formData.qcNotes}
              onChange={handleChange}
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Quality control notes"
            />
          </div>
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
            Create Record
          </Button>
        </div>
      </form>
    </div>
  );
}


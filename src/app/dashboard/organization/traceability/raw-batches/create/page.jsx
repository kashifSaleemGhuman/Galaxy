'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

export default function CreateRawBatchPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [igps, setIgps] = useState([]);
  const [loadingIgps, setLoadingIgps] = useState(true);

  const [formData, setFormData] = useState({
    batchCode: '',
    igpId: '',
    supplierId: '',
    supplierName: '',
    region: '',
    receivedDate: new Date().toISOString().split('T')[0],
    quantity: '',
    unit: '',
    status: 'pending'
  });

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'organization', label: 'Organization', href: '/dashboard/organization' },
    { key: 'traceability', label: 'Incoming Traceability', href: '/dashboard/organization/traceability' },
    { key: 'create', label: 'New Raw Batch', href: '#' },
  ];

  useEffect(() => {
    fetchIGPs();
  }, []);

  const fetchIGPs = async () => {
    try {
      setLoadingIgps(true);
      const res = await fetch('/api/organization/traceability/igp');
      if (res.ok) {
        const data = await res.json();
        setIgps(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching IGPs:', error);
    } finally {
      setLoadingIgps(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // If IGP is selected, populate supplier info
    if (name === 'igpId' && value) {
      const igp = igps.find(i => i.id === value);
      if (igp) {
        setFormData(prev => ({
          ...prev,
          igpId: value,
          supplierId: igp.supplierId,
          supplierName: igp.supplierName,
          region: igp.region || prev.region
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setToast(null);

    try {
      if (!formData.batchCode || !formData.igpId || !formData.supplierName || !formData.receivedDate) {
        throw new Error('Batch Code, IGP, Supplier Name, and Received Date are required');
      }

      const res = await fetch('/api/organization/traceability/raw-batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create raw batch');
      }

      setToast({ type: 'success', message: 'Raw batch created successfully' });
      
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
          <h1 className="text-2xl font-bold text-gray-900">Create Raw Batch</h1>
          <p className="mt-1 text-sm text-gray-500">
            Register a new raw leather batch
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Batch Code *"
            name="batchCode"
            value={formData.batchCode}
            onChange={handleChange}
            required
            placeholder="e.g., 0001, 0002"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Inward Gate Pass (IGP) *
            </label>
            <select
              name="igpId"
              value={formData.igpId}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            >
              <option value="">Select IGP</option>
              {loadingIgps ? (
                <option>Loading IGPs...</option>
              ) : (
                igps.map((igp) => (
                  <option key={igp.id} value={igp.id}>
                    {igp.igpNumber} - {igp.supplierName}
                  </option>
                ))
              )}
            </select>
          </div>

          <Input
            label="Supplier Name *"
            name="supplierName"
            value={formData.supplierName}
            onChange={handleChange}
            required
            readOnly
            className="bg-gray-50"
          />

          <Input
            label="Region"
            name="region"
            value={formData.region}
            onChange={handleChange}
            placeholder="Region of origin"
          />

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
              <option value="tanned">Tanned</option>
              <option value="in_process">In Process</option>
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
            placeholder="e.g., kg, pieces"
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
            Create Raw Batch
          </Button>
        </div>
      </form>
    </div>
  );
}


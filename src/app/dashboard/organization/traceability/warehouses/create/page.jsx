'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

export default function CreateWarehousePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    warehouseName: '',
    supplierId: '',
    supplierName: '',
    location: '',
    region: '',
    lwgCertified: false,
    capacity: '',
    capacityUnit: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    notes: '',
    status: 'active'
  });

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'organization', label: 'Organization', href: '/dashboard/organization' },
    { key: 'traceability', label: 'Incoming Traceability', href: '/dashboard/organization/traceability' },
    { key: 'warehouses', label: 'Warehouses', href: '/dashboard/organization/traceability/warehouses' },
    { key: 'create', label: 'New Warehouse', href: '#' },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setToast(null);

    try {
      if (!formData.warehouseName) {
        throw new Error('Warehouse Name is required');
      }

      const res = await fetch('/api/organization/traceability/warehouses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create warehouse');
      }

      setToast({ type: 'success', message: 'Warehouse created successfully' });
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/dashboard/organization/traceability/warehouses');
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
          <h1 className="text-2xl font-bold text-gray-900">Create Supplier Leather Warehouse</h1>
          <p className="mt-1 text-sm text-gray-500">
            Register a new supplier leather warehouse
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Warehouse Name *"
            name="warehouseName"
            value={formData.warehouseName}
            onChange={handleChange}
            required
            placeholder="e.g., Warehouse-A, Main Storage"
          />

          <Input
            label="Supplier Name"
            name="supplierName"
            value={formData.supplierName}
            onChange={handleChange}
            placeholder="Enter supplier name (optional)"
          />

          <Input
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Warehouse address/location"
          />

          <Input
            label="Region"
            name="region"
            value={formData.region}
            onChange={handleChange}
            placeholder="Region"
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <Input
            label="Capacity"
            name="capacity"
            type="number"
            step="0.01"
            value={formData.capacity}
            onChange={handleChange}
            placeholder="Storage capacity"
          />

          <Input
            label="Capacity Unit"
            name="capacityUnit"
            value={formData.capacityUnit}
            onChange={handleChange}
            placeholder="e.g., kg, m², tons"
          />

          <Input
            label="Contact Person"
            name="contactPerson"
            value={formData.contactPerson}
            onChange={handleChange}
            placeholder="Contact person name"
          />

          <Input
            label="Contact Phone"
            name="contactPhone"
            value={formData.contactPhone}
            onChange={handleChange}
            placeholder="Phone number"
          />

          <Input
            label="Contact Email"
            name="contactEmail"
            type="email"
            value={formData.contactEmail}
            onChange={handleChange}
            placeholder="Email address"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="lwgCertified"
            id="lwgCertified"
            checked={formData.lwgCertified}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="lwgCertified" className="ml-2 block text-sm text-gray-900">
            LWG Certified Warehouse
          </label>
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
            Create Warehouse
          </Button>
        </div>
      </form>
    </div>
  );
}


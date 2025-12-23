'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

export default function CreateIGPPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);
  const [loadingWarehouses, setLoadingWarehouses] = useState(true);

  const [formData, setFormData] = useState({
    igpNumber: '',
    supplierId: '',
    supplierName: '',
    warehouseId: '',
    warehouseName: '',
    region: '',
    deliveryDate: new Date().toISOString().split('T')[0],
    truckLoadNumber: '',
    batchNumber: '',
    lwgCertified: false,
    notes: '',
    status: 'pending'
  });

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'organization', label: 'Organization', href: '/dashboard/organization' },
    { key: 'traceability', label: 'Incoming Traceability', href: '/dashboard/organization/traceability' },
    { key: 'create', label: 'New IGP', href: '#' },
  ];

  useEffect(() => {
    fetchSuppliers();
    fetchWarehouses();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoadingSuppliers(true);
      const res = await fetch('/api/purchase/suppliers');
      if (res.ok) {
        const data = await res.json();
        setSuppliers(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    } finally {
      setLoadingSuppliers(false);
    }
  };

  const fetchWarehouses = async () => {
    try {
      setLoadingWarehouses(true);
      const res = await fetch('/api/organization/traceability/warehouses');
      if (res.ok) {
        const data = await res.json();
        setWarehouses(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching warehouses:', error);
    } finally {
      setLoadingWarehouses(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // If supplier is selected from dropdown, update supplierName
    if (name === 'supplierId' && value) {
      const supplier = suppliers.find(s => s.supplierId === value);
      if (supplier) {
        setFormData(prev => ({
          ...prev,
          supplierId: value,
          supplierName: supplier.name,
          warehouseId: '', // Reset warehouse when supplier changes
          warehouseName: ''
        }));
      }
    }

    // If warehouse is selected from dropdown, update warehouseName and optionally supplier info
    if (name === 'warehouseId' && value) {
      const warehouse = warehouses.find(w => w.id === value);
      if (warehouse) {
        setFormData(prev => ({
          ...prev,
          warehouseId: value,
          warehouseName: warehouse.warehouseName,
          region: warehouse.region || prev.region,
          // If warehouse has supplier info and form doesn't, populate it
          supplierName: warehouse.supplierName && !prev.supplierName ? warehouse.supplierName : prev.supplierName,
          supplierId: warehouse.supplierId && !prev.supplierId ? warehouse.supplierId : prev.supplierId
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setToast(null);

    try {
      if (!formData.igpNumber || !formData.supplierName || !formData.deliveryDate) {
        throw new Error('IGP Number, Supplier Name, and Delivery Date are required');
      }

      const res = await fetch('/api/organization/traceability/igp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create IGP');
      }

      setToast({ type: 'success', message: 'IGP created successfully' });
      
      // Redirect after a short delay
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
          <h1 className="text-2xl font-bold text-gray-900">Create Inward Gate Pass (IGP)</h1>
          <p className="mt-1 text-sm text-gray-500">
            Register incoming material from supplier
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="IGP Number *"
            name="igpNumber"
            value={formData.igpNumber}
            onChange={handleChange}
            required
            placeholder="e.g., IGP-2024-001"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Supplier *
            </label>
            <select
              name="supplierId"
              value={formData.supplierId}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            >
              <option value="">Select Supplier</option>
              {loadingSuppliers ? (
                <option>Loading suppliers...</option>
              ) : (
                suppliers.map((supplier) => (
                  <option key={supplier.supplierId} value={supplier.supplierId}>
                    {supplier.name}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Supplier Leather Warehouse
            </label>
            <select
              name="warehouseId"
              value={formData.warehouseId}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Select Warehouse (Optional)</option>
              {loadingWarehouses ? (
                <option>Loading warehouses...</option>
              ) : warehouses.length === 0 ? (
                <option>No warehouses found. Create one first.</option>
              ) : (
                warehouses.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.warehouseName} {warehouse.supplierName ? `- ${warehouse.supplierName}` : ''} {warehouse.location ? `(${warehouse.location})` : ''}
                  </option>
                ))
              )}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Select a warehouse where the material is stored before delivery to tannery
            </p>
          </div>

          <Input
            label="Region"
            name="region"
            value={formData.region}
            onChange={handleChange}
            placeholder="Region of origin"
          />

          <Input
            label="Delivery Date *"
            name="deliveryDate"
            type="date"
            value={formData.deliveryDate}
            onChange={handleChange}
            required
          />

          <Input
            label="Truck Load Number"
            name="truckLoadNumber"
            value={formData.truckLoadNumber}
            onChange={handleChange}
            placeholder="Truck load identifier"
          />

          <Input
            label="Batch Number (from Supplier)"
            name="batchNumber"
            value={formData.batchNumber}
            onChange={handleChange}
            placeholder="Supplier batch number"
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
              <option value="received">Received</option>
              <option value="processed">Processed</option>
            </select>
          </div>
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
            LWG Certified Tannery
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
            Create IGP
          </Button>
        </div>
      </form>
    </div>
  );
}


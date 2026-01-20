'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

export default function CreateDispatchPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [finishedBatches, setFinishedBatches] = useState([]);
  const [measurementPackings, setMeasurementPackings] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(true);

  const [formData, setFormData] = useState({
    dispatchNumber: '',
    measurementPackingId: '',
    finishedBatchId: '',
    customerName: '',
    customerId: '',
    customerOrderNumber: '',
    vendorCode: '',
    dispatchDate: new Date().toISOString().split('T')[0],
    dispatchType: '',
    vehicleNumber: '',
    driverName: '',
    driverPhone: '',
    destination: '',
    deliveryAddress: '',
    quantity: '',
    unit: '',
    pieces: '',
    areaM2: '',
    status: 'pending'
  });

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'organization', label: 'Organization', href: '/dashboard/organization' },
    { key: 'traceability', label: 'Outgoing Traceability', href: '/dashboard/organization/traceability/outgoing' },
    { key: 'create', label: 'New Dispatch', href: '#' },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoadingBatches(true);
      const [finishedRes, measurementRes] = await Promise.all([
        fetch('/api/organization/traceability/finished-leather'),
        fetch('/api/organization/traceability/measurement-packing')
      ]);
      
      if (finishedRes.ok) {
        const data = await finishedRes.json();
        setFinishedBatches(data.data || []);
      }
      
      if (measurementRes.ok) {
        const data = await measurementRes.json();
        setMeasurementPackings(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setToast(null);

    try {
      if (!formData.dispatchNumber || !formData.finishedBatchId || !formData.customerName || !formData.dispatchDate) {
        throw new Error('Dispatch Number, Finished Batch, Customer Name, and Dispatch Date are required');
      }

      const res = await fetch('/api/organization/traceability/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create dispatch record');
      }

      setToast({ type: 'success', message: 'Dispatch record created successfully' });
      
      setTimeout(() => {
        router.push('/dashboard/organization/traceability/dispatch');
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
          <h1 className="text-2xl font-bold text-gray-900">Create Dispatch Record</h1>
          <p className="mt-1 text-sm text-gray-500">
            Record dispatch of finished leather to customers
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Dispatch Number *"
            name="dispatchNumber"
            value={formData.dispatchNumber}
            onChange={handleChange}
            required
            placeholder="e.g., DISP-2024-001"
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Measurement/Packing Record (Optional)
            </label>
            <select
              name="measurementPackingId"
              value={formData.measurementPackingId}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Select Measurement/Packing Record</option>
              {measurementPackings.map((record) => (
                <option key={record.id} value={record.id}>
                  {record.recordNumber} - {record.batchNumber}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Customer Name *"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            required
            placeholder="Customer name"
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
            label="Dispatch Date *"
            name="dispatchDate"
            type="date"
            value={formData.dispatchDate}
            onChange={handleChange}
            required
          />

          <Input
            label="Dispatch Type"
            name="dispatchType"
            value={formData.dispatchType}
            onChange={handleChange}
            placeholder="e.g., direct, warehouse"
          />

          <Input
            label="Vehicle Number"
            name="vehicleNumber"
            value={formData.vehicleNumber}
            onChange={handleChange}
            placeholder="Vehicle number"
          />

          <Input
            label="Driver Name"
            name="driverName"
            value={formData.driverName}
            onChange={handleChange}
            placeholder="Driver name"
          />

          <Input
            label="Driver Phone"
            name="driverPhone"
            value={formData.driverPhone}
            onChange={handleChange}
            placeholder="Driver phone"
          />

          <Input
            label="Destination"
            name="destination"
            value={formData.destination}
            onChange={handleChange}
            placeholder="Destination"
          />

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Delivery Address
            </label>
            <textarea
              name="deliveryAddress"
              value={formData.deliveryAddress}
              onChange={handleChange}
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Delivery address"
            />
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
              <option value="dispatched">Dispatched</option>
              <option value="in_transit">In Transit</option>
              <option value="delivered">Delivered</option>
            </select>
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
            Create Dispatch
          </Button>
        </div>
      </form>
    </div>
  );
}


'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { 
  PlusIcon, 
  ClipboardDocumentCheckIcon,
  TruckIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function OutgoingTraceabilityPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  
  // Statistics
  const [stats, setStats] = useState({
    finishedBatches: 0,
    measurementPackings: 0,
    dispatches: 0,
    deliveries: 0
  });

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'organization', label: 'Organization', href: '/dashboard/organization' },
    { key: 'traceability', label: 'Outgoing Traceability', href: '/dashboard/organization/traceability/outgoing' },
  ];

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Fetch counts for each entity type
      const [finishedRes, measurementRes, dispatchRes, deliveryRes] = await Promise.all([
        fetch('/api/organization/traceability/finished-leather'),
        fetch('/api/organization/traceability/measurement-packing'),
        fetch('/api/organization/traceability/dispatch'),
        fetch('/api/organization/traceability/customer-delivery')
      ]);

      const finished = await finishedRes.json();
      const measurement = await measurementRes.json();
      const dispatch = await dispatchRes.json();
      const delivery = await deliveryRes.json();

      setStats({
        finishedBatches: finished.success ? finished.data?.length || 0 : 0,
        measurementPackings: measurement.success ? measurement.data?.length || 0 : 0,
        dispatches: dispatch.success ? dispatch.data?.length || 0 : 0,
        deliveries: delivery.success ? delivery.data?.length || 0 : 0
      });
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbs} />
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbs} />
      
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Outgoing Traceability</h1>
            <p className="mt-1 text-sm text-gray-500">
              Track finished leather from measurement and packing through dispatch to customer delivery
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => router.push('/dashboard/organization/traceability/measurement-packing/create')}
              className="flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              New Measurement
            </Button>
            <Button
              onClick={() => router.push('/dashboard/organization/traceability/dispatch/create')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              New Dispatch
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-teal-900">{stats.finishedBatches}</div>
            <div className="text-sm text-teal-700">Finished Batches</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-900">{stats.measurementPackings}</div>
            <div className="text-sm text-blue-700">Measurement & Packing</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-900">{stats.dispatches}</div>
            <div className="text-sm text-purple-700">Dispatches</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-900">{stats.deliveries}</div>
            <div className="text-sm text-green-700">Customer Deliveries</div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/organization/traceability/finished-leather')}
          className="flex flex-col items-center gap-2 p-6 h-auto"
        >
          <CheckCircleIcon className="h-8 w-8 text-teal-600" />
          <span className="font-semibold">Finished Leather</span>
          <span className="text-sm text-gray-500">Manage finished batches</span>
        </Button>
        
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/organization/traceability/measurement-packing')}
          className="flex flex-col items-center gap-2 p-6 h-auto"
        >
          <ClipboardDocumentCheckIcon className="h-8 w-8 text-blue-600" />
          <span className="font-semibold">Measurement & Packing</span>
          <span className="text-sm text-gray-500">Manage measurement records</span>
        </Button>
        
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/organization/traceability/dispatch')}
          className="flex flex-col items-center gap-2 p-6 h-auto"
        >
          <TruckIcon className="h-8 w-8 text-purple-600" />
          <span className="font-semibold">Dispatch</span>
          <span className="text-sm text-gray-500">Manage dispatch records</span>
        </Button>
        
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/organization/traceability/customer-delivery')}
          className="flex flex-col items-center gap-2 p-6 h-auto"
        >
          <CheckCircleIcon className="h-8 w-8 text-green-600" />
          <span className="font-semibold">Customer Delivery</span>
          <span className="text-sm text-gray-500">Manage deliveries</span>
        </Button>
      </div>
    </div>
  );
}


'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  CubeIcon,
  BeakerIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function TraceabilityPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [searchCode, setSearchCode] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searching, setSearching] = useState(false);
  
  // Statistics
  const [stats, setStats] = useState({
    warehouses: 0,
    igps: 0,
    rawBatches: 0,
    wetBlueBatches: 0,
    reTanningBatches: 0,
    finishedBatches: 0
  });

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'organization', label: 'Organization', href: '/dashboard/organization' },
    { key: 'traceability', label: 'Incoming Traceability', href: '/dashboard/organization/traceability' },
  ];

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Fetch counts for each entity type
      const [warehousesRes, igpsRes, rawBatchesRes, wbBatchesRes, rtBatchesRes, finishedRes] = await Promise.all([
        fetch('/api/organization/traceability/warehouses'),
        fetch('/api/organization/traceability/igp'),
        fetch('/api/organization/traceability/raw-batches'),
        fetch('/api/organization/traceability/wet-blue-batches'),
        fetch('/api/organization/traceability/re-tanning-batches'),
        fetch('/api/organization/traceability/finished-leather')
      ]);

      const warehouses = await warehousesRes.json();
      const igps = await igpsRes.json();
      const rawBatches = await rawBatchesRes.json();
      const wbBatches = await wbBatchesRes.json();
      const rtBatches = await rtBatchesRes.json();
      const finished = await finishedRes.json();

      setStats({
        warehouses: warehouses.success ? warehouses.data?.length || 0 : 0,
        igps: igps.success ? igps.data?.length || 0 : 0,
        rawBatches: rawBatches.success ? rawBatches.data?.length || 0 : 0,
        wetBlueBatches: wbBatches.success ? wbBatches.data?.length || 0 : 0,
        reTanningBatches: rtBatches.success ? rtBatches.data?.length || 0 : 0,
        finishedBatches: finished.success ? finished.data?.length || 0 : 0
      });
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchCode.trim()) {
      setToast({ type: 'error', message: 'Please enter a batch code' });
      return;
    }

    try {
      setSearching(true);
      setSearchResult(null);
      
      const res = await fetch(`/api/organization/traceability/batch-tracking?batchCode=${encodeURIComponent(searchCode.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Batch not found');
      }

      setSearchResult(data.data);
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', message: err.message });
      setSearchResult(null);
    } finally {
      setSearching(false);
    }
  };

  const renderTraceabilityChain = (data) => {
    if (!data) return null;

    const { type, batch, upstream, downstream } = data;

    return (
      <div className="space-y-6">
        {/* Upstream Traceability */}
        {upstream && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upstream Traceability</h3>
            <div className="space-y-4">
              {upstream.igp && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-blue-900">IGP: {upstream.igp.igpNumber}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="font-medium">Supplier:</span> {upstream.igp.supplierName}</div>
                    <div><span className="font-medium">Region:</span> {upstream.igp.region || 'N/A'}</div>
                    <div><span className="font-medium">Delivery Date:</span> {new Date(upstream.igp.deliveryDate).toLocaleDateString()}</div>
                    <div><span className="font-medium">LWG Certified:</span> {upstream.igp.lwgCertified ? 'Yes' : 'No'}</div>
                  </div>
                </div>
              )}
              
              {upstream.rawBatch && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CubeIcon className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-900">Raw Batch: {upstream.rawBatch.batchCode}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="font-medium">Received Date:</span> {new Date(upstream.rawBatch.receivedDate).toLocaleDateString()}</div>
                    <div><span className="font-medium">Status:</span> {upstream.rawBatch.status}</div>
                  </div>
                </div>
              )}

              {upstream.wbBatch && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BeakerIcon className="h-5 w-5 text-purple-600" />
                    <span className="font-semibold text-purple-900">Wet Blue Batch: {upstream.wbBatch.wbCode}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="font-medium">Received Date:</span> {new Date(upstream.wbBatch.receivedDate).toLocaleDateString()}</div>
                    <div><span className="font-medium">Status:</span> {upstream.wbBatch.status}</div>
                  </div>
                </div>
              )}

              {upstream.rtBatch && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowPathIcon className="h-5 w-5 text-orange-600" />
                    <span className="font-semibold text-orange-900">Re-tanning Batch: {upstream.rtBatch.rtCode}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="font-medium">Received Date:</span> {new Date(upstream.rtBatch.receivedDate).toLocaleDateString()}</div>
                    <div><span className="font-medium">Status:</span> {upstream.rtBatch.status}</div>
                    {upstream.rtBatch.recipe && <div><span className="font-medium">Recipe:</span> {upstream.rtBatch.recipe}</div>}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Current Batch */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Batch</h3>
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              {type === 'raw' && <CubeIcon className="h-5 w-5 text-green-600" />}
              {type === 'wet_blue' && <BeakerIcon className="h-5 w-5 text-purple-600" />}
              {type === 're_tanning' && <ArrowPathIcon className="h-5 w-5 text-orange-600" />}
              {type === 'finished' && <CheckCircleIcon className="h-5 w-5 text-blue-600" />}
              <span className="font-semibold text-gray-900">
                {type === 'raw' && `Raw Batch: ${batch.batchCode}`}
                {type === 'wet_blue' && `Wet Blue Batch: ${batch.wbCode}`}
                {type === 're_tanning' && `Re-tanning Batch: ${batch.rtCode}`}
                {type === 'finished' && `Finished Batch: ${batch.batchNumber}`}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm mt-2">
              <div><span className="font-medium">Status:</span> {batch.status}</div>
              {batch.quantity && <div><span className="font-medium">Quantity:</span> {batch.quantity} {batch.unit || ''}</div>}
            </div>
          </div>
        </div>

        {/* Downstream Traceability */}
        {downstream && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Downstream Traceability</h3>
            <div className="space-y-4">
              {downstream.wetBlueBatches && downstream.wetBlueBatches.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Wet Blue Batches:</h4>
                  {downstream.wetBlueBatches.map((wb) => (
                    <div key={wb.id} className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-2">
                      <div className="font-semibold text-purple-900">W/B Code: {wb.wbCode}</div>
                      <div className="text-sm">Status: {wb.status}</div>
                    </div>
                  ))}
                </div>
              )}

              {downstream.reTanningBatches && downstream.reTanningBatches.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Re-tanning Batches:</h4>
                  {downstream.reTanningBatches.map((rt) => (
                    <div key={rt.id} className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-2">
                      <div className="font-semibold text-orange-900">RT Code: {rt.rtCode}</div>
                      <div className="text-sm">Status: {rt.status}</div>
                    </div>
                  ))}
                </div>
              )}

              {downstream.finishedBatches && downstream.finishedBatches.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Finished Leather Batches:</h4>
                  {downstream.finishedBatches.map((finished) => (
                    <div key={finished.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-2">
                      <div className="font-semibold text-blue-900">Batch: {finished.batchNumber}</div>
                      <div className="text-sm">Status: {finished.status}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
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
            <h1 className="text-2xl font-bold text-gray-900">Incoming Traceability</h1>
            <p className="mt-1 text-sm text-gray-500">
              Track raw leather from incoming material supplier through all production stages
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => router.push('/dashboard/organization/traceability/warehouses/create')}
              className="flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              New Warehouse
            </Button>
            <Button
              onClick={() => router.push('/dashboard/organization/traceability/igp/create')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              New IGP
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-indigo-900">{stats.warehouses}</div>
            <div className="text-sm text-indigo-700">Supplier Warehouses</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-900">{stats.igps}</div>
            <div className="text-sm text-blue-700">Inward Gate Passes</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-900">{stats.rawBatches}</div>
            <div className="text-sm text-green-700">Raw Batches</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-900">{stats.wetBlueBatches}</div>
            <div className="text-sm text-purple-700">Wet Blue Batches</div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-orange-900">{stats.reTanningBatches}</div>
            <div className="text-sm text-orange-700">Re-tanning Batches</div>
          </div>
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-teal-900">{stats.finishedBatches}</div>
            <div className="text-sm text-teal-700">Finished Batches</div>
          </div>
        </div>

        {/* Batch Search */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Batch Tracking</h2>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter batch code (Raw, W/B, RT, or Finished batch number)"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <Button
              onClick={handleSearch}
              loading={searching}
              className="flex items-center gap-2"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
              Search
            </Button>
          </div>

          {searchResult && (
            <div className="mt-6 bg-white border border-gray-300 rounded-lg p-6">
              {renderTraceabilityChain(searchResult)}
            </div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/organization/traceability/warehouses')}
          className="flex flex-col items-center gap-2 p-6 h-auto"
        >
          <CubeIcon className="h-8 w-8 text-indigo-600" />
          <span className="font-semibold">Supplier Warehouses</span>
          <span className="text-sm text-gray-500">Manage warehouses</span>
        </Button>
        
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/organization/traceability/igp')}
          className="flex flex-col items-center gap-2 p-6 h-auto"
        >
          <DocumentTextIcon className="h-8 w-8 text-blue-600" />
          <span className="font-semibold">Inward Gate Passes</span>
          <span className="text-sm text-gray-500">Manage IGPs</span>
        </Button>
        
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/organization/traceability/raw-batches')}
          className="flex flex-col items-center gap-2 p-6 h-auto"
        >
          <CubeIcon className="h-8 w-8 text-green-600" />
          <span className="font-semibold">Raw Batches</span>
          <span className="text-sm text-gray-500">Manage raw batches</span>
        </Button>
        
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/organization/traceability/wet-blue-batches')}
          className="flex flex-col items-center gap-2 p-6 h-auto"
        >
          <BeakerIcon className="h-8 w-8 text-purple-600" />
          <span className="font-semibold">Wet Blue Batches</span>
          <span className="text-sm text-gray-500">Manage W/B batches</span>
        </Button>
        
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/organization/traceability/re-tanning-batches')}
          className="flex flex-col items-center gap-2 p-6 h-auto"
        >
          <ArrowPathIcon className="h-8 w-8 text-orange-600" />
          <span className="font-semibold">Re-tanning Batches</span>
          <span className="text-sm text-gray-500">Manage RT batches</span>
        </Button>
        
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
          onClick={() => router.push('/dashboard/organization/traceability/job-cards')}
          className="flex flex-col items-center gap-2 p-6 h-auto"
        >
          <DocumentTextIcon className="h-8 w-8 text-orange-600" />
          <span className="font-semibold">Job Cards</span>
          <span className="text-sm text-gray-500">Manage job cards</span>
        </Button>
      </div>
    </div>
  );
}


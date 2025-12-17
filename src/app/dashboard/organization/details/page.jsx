'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { PencilIcon } from '@heroicons/react/24/outline';

export default function OrganizationDetailsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'organization', label: 'Organization', href: '/dashboard/organization' },
    { key: 'details', label: 'Details', href: '/dashboard/organization/details' },
  ];

  useEffect(() => {
    fetchOrganization();
  }, []);

  const fetchOrganization = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/organization');
      if (!res.ok) throw new Error('Failed to fetch organization details');
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const handleNavigate = (index, item) => {
    if (item.href) router.push(item.href);
  };

  if (loading) {
    return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  if (!data) {
    return (
        <div className="p-6 text-center">
            <p className="text-gray-500 mb-4">No organization details found.</p>
            <Button onClick={() => router.push('/dashboard/organization')}>
                Set Up Organization
            </Button>
        </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organization Details</h1>
          <Breadcrumbs items={breadcrumbs} onNavigate={handleNavigate} className="mt-2" />
        </div>
        <Button onClick={() => router.push('/dashboard/organization')}>
          <PencilIcon className="h-4 w-4 mr-2" />
          Edit Details
        </Button>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        {/* Header / Logo */}
        <div className="bg-gray-50 px-6 py-8 border-b border-gray-200 flex items-center space-x-6">
            <div className="w-24 h-24 bg-white rounded-lg border border-gray-200 flex items-center justify-center p-2 shadow-sm">
                {data.companyLogo ? (
                    <img src={data.companyLogo} alt="Logo" className="max-w-full max-h-full object-contain" />
                ) : (
                    <span className="text-gray-400 text-xs">No Logo</span>
                )}
            </div>
            <div>
                <h2 className="text-2xl font-bold text-gray-900">{data.companyName || 'Company Name'}</h2>
                <p className="text-gray-500">{data.shortName ? `(${data.shortName})` : ''}</p>
            </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8 p-8">
            
            <div className="space-y-6">
                <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Contact Information</h3>
                    <div className="space-y-3 bg-gray-50 p-4 rounded-md">
                        <div>
                            <span className="block text-xs text-gray-500">Email</span>
                            <span className="text-sm font-medium text-gray-900">{data.email || '-'}</span>
                        </div>
                        <div>
                            <span className="block text-xs text-gray-500">Factory Contact</span>
                            <span className="text-sm font-medium text-gray-900">{data.factoryContactNo || '-'}</span>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Location</h3>
                    <div className="space-y-3 bg-gray-50 p-4 rounded-md">
                        <div>
                            <span className="block text-xs text-gray-500">Address</span>
                            <span className="text-sm font-medium text-gray-900 whitespace-pre-wrap">{data.address || '-'}</span>
                        </div>
                        <div>
                            <span className="block text-xs text-gray-500">Full Address</span>
                            <span className="text-sm font-medium text-gray-900 whitespace-pre-wrap">{data.fullAddress || '-'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Audit Information</h3>
                    <div className="space-y-3 bg-gray-50 p-4 rounded-md">
                        <div>
                            <span className="block text-xs text-gray-500">Internal Auditor</span>
                            <span className="text-sm font-medium text-gray-900">{data.internalAuditorName || '-'}</span>
                        </div>
                        <div>
                            <span className="block text-xs text-gray-500">Audit Date</span>
                            <span className="text-sm font-medium text-gray-900">{formatDate(data.auditDate)}</span>
                        </div>
                        <div>
                            <span className="block text-xs text-gray-500">Data From</span>
                            <span className="text-sm font-medium text-gray-900">{formatDate(data.dataFrom)}</span>
                        </div>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}


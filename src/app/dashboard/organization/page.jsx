'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';

export default function OrganizationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    companyName: '',
    companyLogo: '', // Base64 string
    shortName: '',
    address: '',
    factoryContactNo: '',
    email: '',
    fullAddress: '',
    auditDate: '',
    internalAuditorName: '',
    dataFrom: ''
  });

  useEffect(() => {
    fetchOrganization();
  }, []);

  const fetchOrganization = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/organization');
      if (!res.ok) throw new Error('Failed to fetch organization details');
      const data = await res.json();
      if (data && data.id) {
        // Format dates for input type="date"
        const formatDate = (dateString) => {
            if (!dateString) return '';
            return new Date(dateString).toISOString().split('T')[0];
        };

        setFormData({
          companyName: data.companyName || '',
          companyLogo: data.companyLogo || '',
          shortName: data.shortName || '',
          address: data.address || '',
          factoryContactNo: data.factoryContactNo || '',
          email: data.email || '',
          fullAddress: data.fullAddress || '',
          auditDate: formatDate(data.auditDate),
          internalAuditorName: data.internalAuditorName || '',
          dataFrom: formatDate(data.dataFrom)
        });
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, companyLogo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    
    try {
      const res = await fetch('/api/organization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save organization details');
      }

      setToast({ type: 'success', message: 'Organization details saved successfully' });
      
      // Redirect to details page after successful save
      setTimeout(() => {
        router.push('/dashboard/organization/details');
      }, 1000);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setToast({ type: 'error', message: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
      
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Organization Details</h1>

      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Logo Section */}
          <div className="flex items-start space-x-6 mb-6">
            <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50">
              {formData.companyLogo ? (
                <img src={formData.companyLogo} alt="Logo" className="max-w-full max-h-full object-contain" />
              ) : (
                <span className="text-gray-400 text-sm text-center p-2">No Logo</span>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              <p className="mt-1 text-sm text-gray-500">PNG, JPG, GIF up to 5MB</p>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Company Name"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              required
            />
            <Input
              label="Short Name"
              name="shortName"
              value={formData.shortName}
              onChange={handleChange}
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
            <Input
              label="Factory Contact No"
              name="factoryContactNo"
              value={formData.factoryContactNo}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                    name="address"
                    rows={3}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    value={formData.address}
                    onChange={handleChange}
                />
            </div>
             <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
                <textarea
                    name="fullAddress"
                    rows={3}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    value={formData.fullAddress}
                    onChange={handleChange}
                />
            </div>
          </div>

          {/* Audit & Data Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label="Internal Auditor Name"
              name="internalAuditorName"
              value={formData.internalAuditorName}
              onChange={handleChange}
            />
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Audit Date</label>
                <input
                    type="date"
                    name="auditDate"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    value={formData.auditDate}
                    onChange={handleChange}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data From</label>
                <input
                    type="date"
                    name="dataFrom"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    value={formData.dataFrom}
                    onChange={handleChange}
                />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button type="submit" loading={saving}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}


'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function TraceabilityPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [productInfo, setProductInfo] = useState(null);
  
  // Form state organized by sections
  const [formData, setFormData] = useState({
    farm: {
      farmId: '',
      animalType: '',
      location: '',
      certifications: []
    },
    slaughterHouse: {
      supplier: '',
      animalType: '',
      origin: '',
      hideSkinType: '',
      hideSkinId: '',
      slaughterDate: '',
      location: '',
      certifications: []
    },
    tannery: {
      tanneryName: '',
      tanneryLocation: '',
      tanningType: '',
      article: '',
      vehicleNumber: '',
      processedLotNumber: '',
      envParameters: {},
      certifications: []
    },
    factory: {
      factoryName: '',
      factoryLocation: '',
      materialType: '',
      product: '',
      finishDate: '',
      hardLabourUsed: '',
      care: '',
      brand: '',
      certification: ''
    }
  });

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'organization', label: 'Organization', href: '/dashboard/organization' },
    { key: 'raw-purchases', label: 'Purchases', href: '/dashboard/organization/raw-purchases' },
    { key: 'traceability', label: 'Traceability', href: '#' },
  ];

  useEffect(() => {
    if (params.id) {
      fetchTraceabilityData();
    }
  }, [params.id]);

  const fetchTraceabilityData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`/api/organization/raw-purchases/${params.id}/traceability`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to fetch traceability data');
      }
      const result = await res.json();
      
      if (result.data) {
        // Map database fields to form structure
        setFormData({
          farm: {
            farmId: result.data.farmId || '',
            animalType: result.data.animalType || '',
            location: result.data.farmLocation || '',
            certifications: Array.isArray(result.data.farmCertifications) 
              ? result.data.farmCertifications 
              : []
          },
          slaughterHouse: {
            supplier: result.data.supplier || '',
            animalType: result.data.slaughterAnimalType || '',
            origin: result.data.origin || '',
            hideSkinType: result.data.hideSkinType || '',
            hideSkinId: result.data.hideSkinId || '',
            slaughterDate: result.data.slaughterDate 
              ? new Date(result.data.slaughterDate).toISOString().split('T')[0]
              : '',
            location: result.data.slaughterLocation || '',
            certifications: Array.isArray(result.data.slaughterCertifications)
              ? result.data.slaughterCertifications
              : []
          },
          tannery: {
            tanneryName: result.data.tanneryName || '',
            tanneryLocation: result.data.tanneryLocation || '',
            tanningType: result.data.tanningType || '',
            article: result.data.article || '',
            vehicleNumber: result.data.vehicleNumber || '',
            processedLotNumber: result.data.processedLotNumber || '',
            envParameters: result.data.envParameters && typeof result.data.envParameters === 'object'
              ? result.data.envParameters
              : {},
            certifications: Array.isArray(result.data.tanneryCertifications)
              ? result.data.tanneryCertifications
              : []
          },
          factory: {
            factoryName: result.data.factoryName || '',
            factoryLocation: result.data.factoryLocation || '',
            materialType: result.data.materialType || '',
            product: result.data.product || '',
            finishDate: result.data.finishDate
              ? new Date(result.data.finishDate).toISOString().split('T')[0]
              : '',
            hardLabourUsed: result.data.hardLabourUsed || '',
            care: result.data.care || '',
            brand: result.data.brand || '',
            certification: result.data.factoryCertification || ''
          }
        });
      }
      
      if (result.poLine) {
        setProductInfo({
          productName: result.poLine.product?.name || 'Unknown Product',
          invoiceNo: result.poLine.purchaseOrder?.poId || 'N/A',
          supplier: result.poLine.purchaseOrder?.supplier?.name || 'N/A'
        });
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
      setToast({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleCertificationAdd = (section) => {
    const cert = prompt('Enter certification:');
    if (cert && cert.trim()) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          certifications: [...prev[section].certifications, cert.trim()]
        }
      }));
    }
  };

  const handleCertificationRemove = (section, index) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        certifications: prev[section].certifications.filter((_, i) => i !== index)
      }
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      
      const res = await fetch(`/api/organization/raw-purchases/${params.id}/traceability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save traceability data');
      }

      setToast({ type: 'success', message: 'Traceability data saved successfully!' });
      
      // Optionally redirect after a delay
      setTimeout(() => {
        router.push(`/dashboard/organization/raw-purchases/${params.id}`);
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setToast({ type: 'error', message: err.message });
    } finally {
      setSaving(false);
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

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Traceability</h1>
          <p className="mt-1 text-sm text-gray-500">
            {productInfo ? `Traceability information for ${productInfo.productName}` : 'Supply chain traceability data'}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push(`/dashboard/organization/raw-purchases/${params.id}`)}
          className="flex items-center gap-2"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      {/* Farm Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Farm</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Farm ID</label>
            <input
              type="text"
              value={formData.farm.farmId}
              onChange={(e) => handleInputChange('farm', 'farmId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Animal Type</label>
            <input
              type="text"
              value={formData.farm.animalType}
              onChange={(e) => handleInputChange('farm', 'animalType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              value={formData.farm.location}
              onChange={(e) => handleInputChange('farm', 'location', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Certifications</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.farm.certifications.map((cert, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {cert}
                  <button
                    onClick={() => handleCertificationRemove('farm', index)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <button
              type="button"
              onClick={() => handleCertificationAdd('farm')}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              + Add Certification
            </button>
          </div>
        </div>
      </div>

      {/* Slaughter House Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Slaughter House</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
            <input
              type="text"
              value={formData.slaughterHouse.supplier}
              onChange={(e) => handleInputChange('slaughterHouse', 'supplier', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Animal Type</label>
            <input
              type="text"
              value={formData.slaughterHouse.animalType}
              onChange={(e) => handleInputChange('slaughterHouse', 'animalType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Origin</label>
            <input
              type="text"
              value={formData.slaughterHouse.origin}
              onChange={(e) => handleInputChange('slaughterHouse', 'origin', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hide/Skin Type</label>
            <input
              type="text"
              value={formData.slaughterHouse.hideSkinType}
              onChange={(e) => handleInputChange('slaughterHouse', 'hideSkinType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hide/Skin ID</label>
            <input
              type="text"
              value={formData.slaughterHouse.hideSkinId}
              onChange={(e) => handleInputChange('slaughterHouse', 'hideSkinId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slaughter Date</label>
            <input
              type="date"
              value={formData.slaughterHouse.slaughterDate}
              onChange={(e) => handleInputChange('slaughterHouse', 'slaughterDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              value={formData.slaughterHouse.location}
              onChange={(e) => handleInputChange('slaughterHouse', 'location', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Certifications</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.slaughterHouse.certifications.map((cert, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {cert}
                  <button
                    onClick={() => handleCertificationRemove('slaughterHouse', index)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <button
              type="button"
              onClick={() => handleCertificationAdd('slaughterHouse')}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              + Add Certification
            </button>
          </div>
        </div>
      </div>

      {/* Tannery Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Tannery</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tannery Name</label>
            <input
              type="text"
              value={formData.tannery.tanneryName}
              onChange={(e) => handleInputChange('tannery', 'tanneryName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tannery Location</label>
            <input
              type="text"
              value={formData.tannery.tanneryLocation}
              onChange={(e) => handleInputChange('tannery', 'tanneryLocation', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanning Type</label>
            <input
              type="text"
              value={formData.tannery.tanningType}
              onChange={(e) => handleInputChange('tannery', 'tanningType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Article</label>
            <input
              type="text"
              value={formData.tannery.article}
              onChange={(e) => handleInputChange('tannery', 'article', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number</label>
            <input
              type="text"
              value={formData.tannery.vehicleNumber}
              onChange={(e) => handleInputChange('tannery', 'vehicleNumber', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Processed Lot Number</label>
            <input
              type="text"
              value={formData.tannery.processedLotNumber}
              onChange={(e) => handleInputChange('tannery', 'processedLotNumber', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Environmental Parameters (JSON format)</label>
            <textarea
              value={JSON.stringify(formData.tannery.envParameters, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  handleInputChange('tannery', 'envParameters', parsed);
                } catch (err) {
                  // Invalid JSON, ignore
                }
              }}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder='{"key": "value"}'
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Certifications</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tannery.certifications.map((cert, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {cert}
                  <button
                    onClick={() => handleCertificationRemove('tannery', index)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <button
              type="button"
              onClick={() => handleCertificationAdd('tannery')}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              + Add Certification
            </button>
          </div>
        </div>
      </div>

      {/* Factory Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Factory</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Factory Name</label>
            <input
              type="text"
              value={formData.factory.factoryName}
              onChange={(e) => handleInputChange('factory', 'factoryName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Factory Location</label>
            <input
              type="text"
              value={formData.factory.factoryLocation}
              onChange={(e) => handleInputChange('factory', 'factoryLocation', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Material Type</label>
            <input
              type="text"
              value={formData.factory.materialType}
              onChange={(e) => handleInputChange('factory', 'materialType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
            <input
              type="text"
              value={formData.factory.product}
              onChange={(e) => handleInputChange('factory', 'product', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Finish Date</label>
            <input
              type="date"
              value={formData.factory.finishDate}
              onChange={(e) => handleInputChange('factory', 'finishDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hard Labour Used</label>
            <input
              type="text"
              value={formData.factory.hardLabourUsed}
              onChange={(e) => handleInputChange('factory', 'hardLabourUsed', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Care</label>
            <input
              type="text"
              value={formData.factory.care}
              onChange={(e) => handleInputChange('factory', 'care', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
            <input
              type="text"
              value={formData.factory.brand}
              onChange={(e) => handleInputChange('factory', 'brand', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Certification</label>
            <input
              type="text"
              value={formData.factory.certification}
              onChange={(e) => handleInputChange('factory', 'certification', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={() => router.push(`/dashboard/organization/raw-purchases/${params.id}`)}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {saving ? 'Saving...' : 'Save Traceability Data'}
        </Button>
      </div>
    </div>
  );
}


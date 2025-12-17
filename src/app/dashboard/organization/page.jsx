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
    internalAuditorNames: [],
    dataFrom: '',
    // Section 1
    siteNameLocalLanguage: '',
    siteURN: '',
    fullestScopeOfOperations: '',
    abbreviations: [],
    // Section 2
    companyRegistrationNumber: '',
    // Section 3
    latitude: '',
    longitude: '',
    // Section 4
    country: '',
    // Section 5
    telephoneNumber: '',
    // Section 6a
    principalContactName: '',
    principalContactPosition: '',
    principalContactEmail: '',
    // Section 6b
    environmentalResponsibleName: '',
    environmentalResponsiblePosition: '',
    environmentalResponsibleEmail: '',
    // Additional
    lwgCommunicationsMembers: [],
    website: '',
    facilityDescription: '',
    totalSiteArea: '',
    siteAreaBoundaries: '',
    // Workforce - Direct Labour
    directLabourShiftAM: '',
    directLabourShiftPM: '',
    directLabourShiftNight: '',
    directLabourCount: '',
    // Workforce - Indirect Labour
    indirectLabourShiftAM: '',
    indirectLabourShiftPM: '',
    indirectLabourShiftNight: '',
    indirectLabourCount: '',
    // Workforce - Shift Total
    shiftTotalAM: '',
    shiftTotalPM: '',
    shiftTotalNight: '',
    shiftTotal: '',
    // Operating Schedule - Worker
    workerDaysPerWeek: '',
    workerWeeksPerYear: '',
    workerDaysPerYear: '',
    // Operating Schedule - Manufacturing operations
    manufacturingDaysPerWeek: '',
    manufacturingWeeksPerYear: '',
    manufacturingDaysPerYear: '',
    // Environmental
    environmentalImpacts: '',
    operationsForOtherOrganisations: ''
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
          internalAuditorNames: Array.isArray(data.internalAuditorNames) ? data.internalAuditorNames : (data.internalAuditorName ? [data.internalAuditorName] : []),
          dataFrom: formatDate(data.dataFrom),
          // Section 1
          siteNameLocalLanguage: data.siteNameLocalLanguage || '',
          siteURN: data.siteURN || '',
          fullestScopeOfOperations: data.fullestScopeOfOperations || '',
          abbreviations: Array.isArray(data.abbreviations) ? data.abbreviations : [],
          // Section 2
          companyRegistrationNumber: data.companyRegistrationNumber || '',
          // Section 3
          latitude: data.latitude || '',
          longitude: data.longitude || '',
          // Section 4
          country: data.country || '',
          // Section 5
          telephoneNumber: data.telephoneNumber || '',
          // Section 6a
          principalContactName: data.principalContactName || '',
          principalContactPosition: data.principalContactPosition || '',
          principalContactEmail: data.principalContactEmail || '',
          // Section 6b
          environmentalResponsibleName: data.environmentalResponsibleName || '',
          environmentalResponsiblePosition: data.environmentalResponsiblePosition || '',
          environmentalResponsibleEmail: data.environmentalResponsibleEmail || '',
          // Additional
          lwgCommunicationsMembers: Array.isArray(data.lwgCommunicationsMembers) ? data.lwgCommunicationsMembers : [],
          website: data.website || '',
          facilityDescription: data.facilityDescription || '',
          totalSiteArea: data.totalSiteArea || '',
          siteAreaBoundaries: data.siteAreaBoundaries || '',
          // Workforce - Direct Labour
          directLabourShiftAM: data.directLabourShiftAM?.toString() || (data.shiftAM?.toString() || ''),
          directLabourShiftPM: data.directLabourShiftPM?.toString() || (data.shiftPM?.toString() || ''),
          directLabourShiftNight: data.directLabourShiftNight?.toString() || (data.shiftNight?.toString() || ''),
          directLabourCount: data.directLabourCount?.toString() || '',
          // Workforce - Indirect Labour
          indirectLabourShiftAM: data.indirectLabourShiftAM?.toString() || (data.shiftAM?.toString() || ''),
          indirectLabourShiftPM: data.indirectLabourShiftPM?.toString() || (data.shiftPM?.toString() || ''),
          indirectLabourShiftNight: data.indirectLabourShiftNight?.toString() || (data.shiftNight?.toString() || ''),
          indirectLabourCount: data.indirectLabourCount?.toString() || '',
          // Workforce - Shift Total
          shiftTotalAM: data.shiftTotalAM?.toString() || (data.shiftAM?.toString() || ''),
          shiftTotalPM: data.shiftTotalPM?.toString() || (data.shiftPM?.toString() || ''),
          shiftTotalNight: data.shiftTotalNight?.toString() || (data.shiftNight?.toString() || ''),
          shiftTotal: data.shiftTotal?.toString() || '',
          // Operating Schedule - Worker
          workerDaysPerWeek: data.workerDaysPerWeek?.toString() || (data.daysPerWeek?.toString() || ''),
          workerWeeksPerYear: data.workerWeeksPerYear?.toString() || (data.weeksPerYear?.toString() || ''),
          workerDaysPerYear: data.workerDaysPerYear?.toString() || (data.daysPerYear?.toString() || ''),
          // Operating Schedule - Manufacturing operations
          manufacturingDaysPerWeek: data.manufacturingDaysPerWeek?.toString() || (data.daysPerWeek?.toString() || ''),
          manufacturingWeeksPerYear: data.manufacturingWeeksPerYear?.toString() || (data.weeksPerYear?.toString() || ''),
          manufacturingDaysPerYear: data.manufacturingDaysPerYear?.toString() || (data.daysPerYear?.toString() || ''),
          // Environmental
          environmentalImpacts: data.environmentalImpacts || '',
          operationsForOtherOrganisations: data.operationsForOtherOrganisations || ''
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

  const handleArrayChange = (arrayName, index, field, value) => {
    setFormData(prev => {
      const newArray = [...(prev[arrayName] || [])];
      if (!newArray[index]) newArray[index] = {};
      newArray[index][field] = value;
      return { ...prev, [arrayName]: newArray };
    });
  };

  const addArrayItem = (arrayName) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: arrayName === 'internalAuditorNames' 
        ? [...(prev[arrayName] || []), ''] 
        : [...(prev[arrayName] || []), {}]
    }));
  };

  const removeArrayItem = (arrayName, index) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index)
    }));
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
        <form onSubmit={handleSubmit} className="space-y-8">
          
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
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
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
            </div>
          </div>

          {/* Section 1: General Facility Details */}
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Section 1: General Facility Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Site Name (Local Language)"
                name="siteNameLocalLanguage"
                value={formData.siteNameLocalLanguage}
                onChange={handleChange}
              />
              <Input
                label="Site URN"
                name="siteURN"
                value={formData.siteURN}
                onChange={handleChange}
              />
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Fullest Scope of Operations</label>
                <select
                  name="fullestScopeOfOperations"
                  value={formData.fullestScopeOfOperations}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="">Select Category</option>
                  <option value="A - Raw hide/skin to tanned">A - Raw hide/skin to tanned</option>
                  <option value="B - Raw hide/skin to crust">B - Raw hide/skin to crust</option>
                  <option value="C - Raw hide/skin to finished leather">C - Raw hide/skin to finished leather</option>
                  <option value="D - Tanned hide/skin to finished leather">D - Tanned hide/skin to finished leather</option>
                  <option value="E - Crust hide/skin to finished leather">E - Crust hide/skin to finished leather</option>
                  <option value="F - Tanned hide/skin to crust leather">F - Tanned hide/skin to crust leather</option>
                  <option value="G - Raw hide/skin to pickled/pre-tanned material">G - Raw hide/skin to pickled/pre-tanned material</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Abbreviations</label>
                {formData.abbreviations.map((item, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <Input
                      placeholder="Abbreviation"
                      value={item.abbreviation || ''}
                      onChange={(e) => handleArrayChange('abbreviations', idx, 'abbreviation', e.target.value)}
                    />
                    <Input
                      placeholder="Full Title"
                      value={item.fullTitle || ''}
                      onChange={(e) => handleArrayChange('abbreviations', idx, 'fullTitle', e.target.value)}
                    />
                    <Button type="button" onClick={() => removeArrayItem('abbreviations', idx)} variant="destructive" size="sm">
                      Remove
                    </Button>
                  </div>
                ))}
                <Button type="button" onClick={() => addArrayItem('abbreviations')} className="mt-2">
                  Add Abbreviation
                </Button>
              </div>
            </div>
          </div>

          {/* Section 2: Company Registration */}
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Section 2: Company Registration</h2>
            <Input
              label="Company Registration/Identification Number"
              name="companyRegistrationNumber"
              value={formData.companyRegistrationNumber}
              onChange={handleChange}
            />
          </div>

          {/* Section 3: Geographical Coordinates */}
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Section 3: Geographical Coordinates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Latitude"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
              />
              <Input
                label="Longitude"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Section 4: Location */}
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Section 4: Location</h2>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  name="address"
                  rows={3}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
                <textarea
                  name="fullAddress"
                  rows={3}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={formData.fullAddress}
                  onChange={handleChange}
                />
              </div>
              <Input
                label="Country"
                name="country"
                value={formData.country}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Section 5: Contact Information */}
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Section 5: Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
              <Input
                label="Telephone Number"
                name="telephoneNumber"
                value={formData.telephoneNumber}
                onChange={handleChange}
              />
              <Input
                label="Factory Contact No"
                name="factoryContactNo"
                value={formData.factoryContactNo}
                onChange={handleChange}
              />
              <Input
                label="Website"
                name="website"
                type="url"
                value={formData.website}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Section 6a: Principal Contact */}
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Section 6a: Principal Contact Name and Position</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                label="Name"
                name="principalContactName"
                value={formData.principalContactName}
                onChange={handleChange}
              />
              <Input
                label="Position"
                name="principalContactPosition"
                value={formData.principalContactPosition}
                onChange={handleChange}
              />
              <Input
                label="Email"
                name="principalContactEmail"
                type="email"
                value={formData.principalContactEmail}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Section 6b: Environmental Responsible */}
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Section 6b: Environmental Responsible</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                label="Name"
                name="environmentalResponsibleName"
                value={formData.environmentalResponsibleName}
                onChange={handleChange}
              />
              <Input
                label="Position"
                name="environmentalResponsiblePosition"
                value={formData.environmentalResponsiblePosition}
                onChange={handleChange}
              />
              <Input
                label="Email"
                name="environmentalResponsibleEmail"
                type="email"
                value={formData.environmentalResponsibleEmail}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* LWG Communications Members */}
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">LWG Communications Members</h2>
            {formData.lwgCommunicationsMembers.map((item, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <Input
                  placeholder="Email Address"
                  type="email"
                  value={item.email || ''}
                  onChange={(e) => handleArrayChange('lwgCommunicationsMembers', idx, 'email', e.target.value)}
                />
                <Input
                  placeholder="Communication Required"
                  value={item.communicationRequired || ''}
                  onChange={(e) => handleArrayChange('lwgCommunicationsMembers', idx, 'communicationRequired', e.target.value)}
                />
                <Button type="button" onClick={() => removeArrayItem('lwgCommunicationsMembers', idx)} variant="destructive" size="sm">
                  Remove
                </Button>
              </div>
            ))}
            <Button type="button" onClick={() => addArrayItem('lwgCommunicationsMembers')} className="mt-2">
              Add LWG Communication Member
            </Button>
          </div>

          {/* Facility Description */}
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Facility Description</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description of the facility (e.g. purpose-built leather manufacturer constructed 1995) site setting and environmental receptors</label>
              <textarea
                name="facilityDescription"
                rows={5}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={formData.facilityDescription}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Site Area */}
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Site Area</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Total Site Area (m²)"
                name="totalSiteArea"
                value={formData.totalSiteArea}
                onChange={handleChange}
              />
              <Input
                label="Boundaries (Single or Multiple)"
                name="siteAreaBoundaries"
                value={formData.siteAreaBoundaries}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Workforce Information */}
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Workforce Information</h2>
            <div className="bg-gray-50 p-4 rounded-md overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-2 px-4 font-medium text-gray-700 bg-white"></th>
                    <th className="text-center py-2 px-4 font-medium text-gray-700 bg-white">A.M. Shift</th>
                    <th className="text-center py-2 px-4 font-medium text-gray-700 bg-white">P.M. Shift</th>
                    <th className="text-center py-2 px-4 font-medium text-gray-700 bg-white">Night Shift</th>
                    <th className="text-center py-2 px-4 font-medium text-gray-700 bg-white">Overall Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 font-medium text-gray-900 bg-white">Direct Labour</td>
                    <td className="py-2 px-4">
                      <input
                        type="number"
                        name="directLabourShiftAM"
                        value={formData.directLabourShiftAM}
                        onChange={handleChange}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-center focus:border-blue-500 focus:ring-blue-500"
                      />
                    </td>
                    <td className="py-2 px-4">
                      <input
                        type="number"
                        name="directLabourShiftPM"
                        value={formData.directLabourShiftPM}
                        onChange={handleChange}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-center focus:border-blue-500 focus:ring-blue-500"
                      />
                    </td>
                    <td className="py-2 px-4">
                      <input
                        type="number"
                        name="directLabourShiftNight"
                        value={formData.directLabourShiftNight}
                        onChange={handleChange}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-center focus:border-blue-500 focus:ring-blue-500"
                      />
                    </td>
                    <td className="py-2 px-4">
                      <input
                        type="number"
                        name="directLabourCount"
                        value={formData.directLabourCount}
                        onChange={handleChange}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-center font-medium focus:border-blue-500 focus:ring-blue-500"
                      />
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 font-medium text-gray-900 bg-white">Indirect Labour</td>
                    <td className="py-2 px-4">
                      <input
                        type="number"
                        name="indirectLabourShiftAM"
                        value={formData.indirectLabourShiftAM}
                        onChange={handleChange}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-center focus:border-blue-500 focus:ring-blue-500"
                      />
                    </td>
                    <td className="py-2 px-4">
                      <input
                        type="number"
                        name="indirectLabourShiftPM"
                        value={formData.indirectLabourShiftPM}
                        onChange={handleChange}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-center focus:border-blue-500 focus:ring-blue-500"
                      />
                    </td>
                    <td className="py-2 px-4">
                      <input
                        type="number"
                        name="indirectLabourShiftNight"
                        value={formData.indirectLabourShiftNight}
                        onChange={handleChange}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-center focus:border-blue-500 focus:ring-blue-500"
                      />
                    </td>
                    <td className="py-2 px-4">
                      <input
                        type="number"
                        name="indirectLabourCount"
                        value={formData.indirectLabourCount}
                        onChange={handleChange}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-center font-medium focus:border-blue-500 focus:ring-blue-500"
                      />
                    </td>
                  </tr>
                  <tr className="border-b-2 border-gray-300">
                    <td className="py-2 px-4 font-medium text-gray-900 bg-white">Shift Total</td>
                    <td className="py-2 px-4">
                      <input
                        type="number"
                        name="shiftTotalAM"
                        value={formData.shiftTotalAM}
                        onChange={handleChange}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-center font-medium focus:border-blue-500 focus:ring-blue-500"
                      />
                    </td>
                    <td className="py-2 px-4">
                      <input
                        type="number"
                        name="shiftTotalPM"
                        value={formData.shiftTotalPM}
                        onChange={handleChange}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-center font-medium focus:border-blue-500 focus:ring-blue-500"
                      />
                    </td>
                    <td className="py-2 px-4">
                      <input
                        type="number"
                        name="shiftTotalNight"
                        value={formData.shiftTotalNight}
                        onChange={handleChange}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-center font-medium focus:border-blue-500 focus:ring-blue-500"
                      />
                    </td>
                    <td className="py-2 px-4">
                      <input
                        type="number"
                        name="shiftTotal"
                        value={formData.shiftTotal}
                        onChange={handleChange}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-center font-bold focus:border-blue-500 focus:ring-blue-500"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Operating Schedule */}
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Operating Schedule</h2>
            <div className="bg-gray-50 p-4 rounded-md overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-2 px-4 font-medium text-gray-700 bg-white"></th>
                    <th className="text-center py-2 px-4 font-medium text-gray-700 bg-white">Days per Week</th>
                    <th className="text-center py-2 px-4 font-medium text-gray-700 bg-white">Weeks per Year</th>
                    <th className="text-center py-2 px-4 font-medium text-gray-700 bg-white">Days per Year</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 font-medium text-gray-900 bg-white">Worker</td>
                    <td className="py-2 px-4">
                      <input
                        type="number"
                        name="workerDaysPerWeek"
                        value={formData.workerDaysPerWeek}
                        onChange={handleChange}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-center focus:border-blue-500 focus:ring-blue-500"
                      />
                    </td>
                    <td className="py-2 px-4">
                      <input
                        type="number"
                        name="workerWeeksPerYear"
                        value={formData.workerWeeksPerYear}
                        onChange={handleChange}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-center focus:border-blue-500 focus:ring-blue-500"
                      />
                    </td>
                    <td className="py-2 px-4">
                      <input
                        type="number"
                        name="workerDaysPerYear"
                        value={formData.workerDaysPerYear}
                        onChange={handleChange}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-center focus:border-blue-500 focus:ring-blue-500"
                      />
                    </td>
                  </tr>
                  <tr className="border-b-2 border-gray-300">
                    <td className="py-2 px-4 font-medium text-gray-900 bg-white">Manufacturing operations</td>
                    <td className="py-2 px-4">
                      <input
                        type="number"
                        name="manufacturingDaysPerWeek"
                        value={formData.manufacturingDaysPerWeek}
                        onChange={handleChange}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-center focus:border-blue-500 focus:ring-blue-500"
                      />
                    </td>
                    <td className="py-2 px-4">
                      <input
                        type="number"
                        name="manufacturingWeeksPerYear"
                        value={formData.manufacturingWeeksPerYear}
                        onChange={handleChange}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-center focus:border-blue-500 focus:ring-blue-500"
                      />
                    </td>
                    <td className="py-2 px-4">
                      <input
                        type="number"
                        name="manufacturingDaysPerYear"
                        value={formData.manufacturingDaysPerYear}
                        onChange={handleChange}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-center focus:border-blue-500 focus:ring-blue-500"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Environmental Impacts */}
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Environmental Impacts</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Environmental impacts based upon specific planning/development requirements</label>
              <textarea
                name="environmentalImpacts"
                rows={5}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={formData.environmentalImpacts}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Operations for Other Organisations */}
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Operations for Other Organisations</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Are any operations undertaken on behalf of other organisations?</label>
              <textarea
                name="operationsForOtherOrganisations"
                rows={5}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={formData.operationsForOtherOrganisations}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Audit & Data Info */}
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Audit Information</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Internal Auditors</label>
                {formData.internalAuditorNames.map((name, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <Input
                      placeholder="Internal Auditor Name"
                      value={name || ''}
                      onChange={(e) => {
                        const newArray = [...formData.internalAuditorNames];
                        newArray[idx] = e.target.value;
                        setFormData(prev => ({ ...prev, internalAuditorNames: newArray }));
                      }}
                    />
                    <Button type="button" onClick={() => removeArrayItem('internalAuditorNames', idx)} variant="destructive" size="sm">
                      Remove
                    </Button>
                  </div>
                ))}
                <Button type="button" onClick={() => addArrayItem('internalAuditorNames')} className="mt-2">
                  Add Internal Auditor
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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


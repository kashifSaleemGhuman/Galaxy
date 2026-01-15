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
        <div className="p-8 space-y-8">
          {/* Section 1: General Facility Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Section 1: General Facility Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <span className="block text-xs text-gray-500 mb-1">Site Name (Local Language)</span>
                <span className="text-sm font-medium text-gray-900">{data.siteNameLocalLanguage || '-'}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 mb-1">Site URN</span>
                <span className="text-sm font-medium text-gray-900">{data.siteURN || '-'}</span>
              </div>
              <div className="md:col-span-2">
                <span className="block text-xs text-gray-500 mb-1">Fullest Scope of Operations</span>
                <span className="text-sm font-medium text-gray-900">{data.fullestScopeOfOperations || '-'}</span>
              </div>
              {data.abbreviations && Array.isArray(data.abbreviations) && data.abbreviations.length > 0 && (
                <div className="md:col-span-2">
                  <span className="block text-xs text-gray-500 mb-2">Abbreviations</span>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-2 font-medium text-gray-700">Abbreviation</th>
                          <th className="text-left py-2 px-2 font-medium text-gray-700">Full Title</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.abbreviations.map((item, idx) => (
                          <tr key={idx} className="border-b">
                            <td className="py-2 px-2">{item.abbreviation || '-'}</td>
                            <td className="py-2 px-2">{item.fullTitle || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Company Registration */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Section 2: Company Registration</h3>
            <div>
              <span className="block text-xs text-gray-500 mb-1">Company Registration/Identification Number</span>
              <span className="text-sm font-medium text-gray-900">{data.companyRegistrationNumber || '-'}</span>
            </div>
          </div>

          {/* Section 3: Geographical Coordinates */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Section 3: Geographical Coordinates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <span className="block text-xs text-gray-500 mb-1">Latitude</span>
                <span className="text-sm font-medium text-gray-900">{data.latitude || '-'}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 mb-1">Longitude</span>
                <span className="text-sm font-medium text-gray-900">{data.longitude || '-'}</span>
              </div>
            </div>
          </div>

          {/* Section 4 & 5: Location & Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Section 4: Location</h3>
              <div className="space-y-3 bg-gray-50 p-4 rounded-md">
                <div>
                  <span className="block text-xs text-gray-500 mb-1">Address</span>
                  <span className="text-sm font-medium text-gray-900 whitespace-pre-wrap">{data.address || '-'}</span>
                </div>
                <div>
                  <span className="block text-xs text-gray-500 mb-1">Full Address</span>
                  <span className="text-sm font-medium text-gray-900 whitespace-pre-wrap">{data.fullAddress || '-'}</span>
                </div>
                <div>
                  <span className="block text-xs text-gray-500 mb-1">Country</span>
                  <span className="text-sm font-medium text-gray-900">{data.country || '-'}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Section 5: Contact Information</h3>
              <div className="space-y-3 bg-gray-50 p-4 rounded-md">
                <div>
                  <span className="block text-xs text-gray-500 mb-1">Email</span>
                  <span className="text-sm font-medium text-gray-900">{data.email || '-'}</span>
                </div>
                <div>
                  <span className="block text-xs text-gray-500 mb-1">Telephone Number</span>
                  <span className="text-sm font-medium text-gray-900">{data.telephoneNumber || '-'}</span>
                </div>
                <div>
                  <span className="block text-xs text-gray-500 mb-1">Factory Contact</span>
                  <span className="text-sm font-medium text-gray-900">{data.factoryContactNo || '-'}</span>
                </div>
                <div>
                  <span className="block text-xs text-gray-500 mb-1">Website</span>
                  <span className="text-sm font-medium text-gray-900">
                    {data.website ? (
                      <a href={data.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {data.website}
                      </a>
                    ) : '-'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 6a: Principal Contact */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Section 6a: Principal Contact Name and Position</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 p-4 rounded-md">
              <div>
                <span className="block text-xs text-gray-500 mb-1">Name</span>
                <span className="text-sm font-medium text-gray-900">{data.principalContactName || '-'}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 mb-1">Position</span>
                <span className="text-sm font-medium text-gray-900">{data.principalContactPosition || '-'}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 mb-1">Email</span>
                <span className="text-sm font-medium text-gray-900">{data.principalContactEmail || '-'}</span>
              </div>
            </div>
          </div>

          {/* Section 6b: Environmental Responsible */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Section 6b: Environmental Responsible</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 p-4 rounded-md">
              <div>
                <span className="block text-xs text-gray-500 mb-1">Name</span>
                <span className="text-sm font-medium text-gray-900">{data.environmentalResponsibleName || '-'}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 mb-1">Position</span>
                <span className="text-sm font-medium text-gray-900">{data.environmentalResponsiblePosition || '-'}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 mb-1">Email</span>
                <span className="text-sm font-medium text-gray-900">{data.environmentalResponsibleEmail || '-'}</span>
              </div>
            </div>
          </div>

          {/* LWG Communications Members */}
          {data.lwgCommunicationsMembers && Array.isArray(data.lwgCommunicationsMembers) && data.lwgCommunicationsMembers.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">LWG Communications Members</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2 font-medium text-gray-700">Email Address</th>
                      <th className="text-left py-2 px-2 font-medium text-gray-700">Communication Required</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.lwgCommunicationsMembers.map((item, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="py-2 px-2">{item.email || '-'}</td>
                        <td className="py-2 px-2">{item.communicationRequired || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Facility Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Facility Description</h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <span className="text-sm text-gray-900 whitespace-pre-wrap">{data.facilityDescription || '-'}</span>
            </div>
          </div>

          {/* Site Area */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Site Area</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-md">
              <div>
                <span className="block text-xs text-gray-500 mb-1">Total Site Area (m²)</span>
                <span className="text-sm font-medium text-gray-900">{data.totalSiteArea || '-'}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 mb-1">Boundaries</span>
                <span className="text-sm font-medium text-gray-900">{data.siteAreaBoundaries || '-'}</span>
              </div>
            </div>
          </div>

          {/* Workforce Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Workforce Information</h3>
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
                    <td className="py-2 px-4 text-center text-gray-900">{data.directLabourShiftAM ?? '-'}</td>
                    <td className="py-2 px-4 text-center text-gray-900">{data.directLabourShiftPM ?? '-'}</td>
                    <td className="py-2 px-4 text-center text-gray-900">{data.directLabourShiftNight ?? '-'}</td>
                    <td className="py-2 px-4 text-center text-gray-900 font-medium">{data.directLabourCount ?? '-'}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 font-medium text-gray-900 bg-white">Indirect Labour</td>
                    <td className="py-2 px-4 text-center text-gray-900">{data.indirectLabourShiftAM ?? '-'}</td>
                    <td className="py-2 px-4 text-center text-gray-900">{data.indirectLabourShiftPM ?? '-'}</td>
                    <td className="py-2 px-4 text-center text-gray-900">{data.indirectLabourShiftNight ?? '-'}</td>
                    <td className="py-2 px-4 text-center text-gray-900 font-medium">{data.indirectLabourCount ?? '-'}</td>
                  </tr>
                  <tr className="border-b-2 border-gray-300">
                    <td className="py-2 px-4 font-medium text-gray-900 bg-white">Shift Total</td>
                    <td className="py-2 px-4 text-center text-gray-900 font-medium">{data.shiftTotalAM ?? '-'}</td>
                    <td className="py-2 px-4 text-center text-gray-900 font-medium">{data.shiftTotalPM ?? '-'}</td>
                    <td className="py-2 px-4 text-center text-gray-900 font-medium">{data.shiftTotalNight ?? '-'}</td>
                    <td className="py-2 px-4 text-center text-gray-900 font-bold">{data.shiftTotal ?? '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Operating Schedule */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Operating Schedule</h3>
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
                    <td className="py-2 px-4 text-center text-gray-900">{data.workerDaysPerWeek ?? '-'}</td>
                    <td className="py-2 px-4 text-center text-gray-900">{data.workerWeeksPerYear ?? '-'}</td>
                    <td className="py-2 px-4 text-center text-gray-900">{data.workerDaysPerYear ?? '-'}</td>
                  </tr>
                  <tr className="border-b-2 border-gray-300">
                    <td className="py-2 px-4 font-medium text-gray-900 bg-white">Manufacturing operations</td>
                    <td className="py-2 px-4 text-center text-gray-900">{data.manufacturingDaysPerWeek ?? '-'}</td>
                    <td className="py-2 px-4 text-center text-gray-900">{data.manufacturingWeeksPerYear ?? '-'}</td>
                    <td className="py-2 px-4 text-center text-gray-900">{data.manufacturingDaysPerYear ?? '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Environmental Impacts */}
          {data.environmentalImpacts && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Environmental Impacts</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <span className="text-sm text-gray-900 whitespace-pre-wrap">{data.environmentalImpacts}</span>
              </div>
            </div>
          )}

          {/* Operations for Other Organisations */}
          {data.operationsForOtherOrganisations && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Operations for Other Organisations</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <span className="text-sm text-gray-900 whitespace-pre-wrap">{data.operationsForOtherOrganisations}</span>
              </div>
            </div>
          )}

          {/* Audit Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Audit Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 p-4 rounded-md">
              <div>
                <span className="block text-xs text-gray-500 mb-1">Internal Auditors</span>
                {data.internalAuditorNames && Array.isArray(data.internalAuditorNames) && data.internalAuditorNames.length > 0 ? (
                  <div className="space-y-1">
                    {data.internalAuditorNames.map((auditor, idx) => (
                      <span key={idx} className="block text-sm font-medium text-gray-900">
                        {auditor || '-'}
                      </span>
                    ))}
                  </div>
                ) : data.internalAuditorName ? (
                  <span className="text-sm font-medium text-gray-900">{data.internalAuditorName}</span>
                ) : (
                  <span className="text-sm font-medium text-gray-900">-</span>
                )}
              </div>
              <div>
                <span className="block text-xs text-gray-500 mb-1">Audit Date</span>
                <span className="text-sm font-medium text-gray-900">{formatDate(data.auditDate)}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 mb-1">Data From</span>
                <span className="text-sm font-medium text-gray-900">{formatDate(data.dataFrom)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


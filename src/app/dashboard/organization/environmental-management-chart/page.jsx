'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { Input } from '@/components/ui/Input';

export default function EnvironmentalManagementChartPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [documentInfo, setDocumentInfo] = useState(null);
  const [migrationRequired, setMigrationRequired] = useState(false);
  
  // Chart data structure matching the image - ENVIRONMENTAL MANAGEMENT CHART
  const [chartData, setChartData] = useState({
    chairman: { value: '0' },
    managingDirector: { value: '0' },
    factoryManager: { value: '0' },
    managementRepresentative: { value: '0' },
    legalRequirements: {
      energy: { value: '0' },
      effluentTreatment: { value: '0' }
    },
    socialAudit: {
      water: { value: '0' },
      airNoise: { value: '0' }
    },
    traceability: {
      chemicalManagement: { value: '0' },
      wasteManagement: { value: '0' }
    },
    environmentalManagementSystem: {
      hsEmergencyPlans: { value: '0' }
    },
    rslRequirements: { value: '0' }
  });

  const isAdmin = session?.user?.role === 'SUPER_ADMIN' || session?.user?.role === 'ADMIN';

  useEffect(() => {
    fetchDocumentContent();
  }, []);

  const fetchDocumentContent = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/organization/documents/content?documentName=ENVIRONMENTAL MANAGEMENT CHART');
      const data = await res.json();
      
      if (res.ok) {
        if (data.data?.migrationRequired) {
          setMigrationRequired(true);
        } else if (data.data?.content) {
          setChartData(data.data.content.content);
          setDocumentInfo({
            docNo: data.data.document.docNo || 'ESF-EMS-CHT-04',
            revDate: data.data.document.revDate || 'Rev.No-01/Date-01-01-2024',
            revisionNo: data.data.content.revisionNo,
            revisionDate: data.data.content.revisionDate
          });
        } else {
          setDocumentInfo({
            docNo: 'ESF-EMS-CHT-04',
            revDate: 'Rev.No-01/Date-01-01-2024',
            revisionNo: 1,
            revisionDate: new Date()
          });
        }
      } else if (res.status === 503 && data.migrationRequired) {
        setMigrationRequired(true);
      }
    } catch (error) {
      console.error('Error fetching document content:', error);
      if (error.message && (
        error.message.includes('does not exist') ||
        error.message.includes('DocumentContent') ||
        error.message.includes('migration')
      )) {
        setMigrationRequired(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleValueChange = async (path, newValue) => {
    console.log('handleValueChange called:', path, newValue);
    try {
      // Update the nested value
      const keys = path.split('.');
      const updatedData = JSON.parse(JSON.stringify(chartData)); // Deep clone
      let current = updatedData;
      
      // Navigate to the parent object, ensuring each level is an object
      for (let i = 0; i < keys.length - 1; i++) {
        // If current level is a string or doesn't exist, convert to object
        if (typeof current[keys[i]] !== 'object' || current[keys[i]] === null || Array.isArray(current[keys[i]])) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      // Set the value property on the last key
      const lastKey = keys[keys.length - 1];
      // If the last key exists but is a string, convert it to object
      if (typeof current[lastKey] !== 'object' || current[lastKey] === null || Array.isArray(current[lastKey])) {
        current[lastKey] = {};
      }
      current[lastKey].value = String(newValue);
      
      // Update local state immediately
      setChartData(updatedData);

      console.log('Making API call to save...');
      // Save to database
      const res = await fetch('/api/organization/documents/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentName: 'ENVIRONMENTAL MANAGEMENT CHART',
          content: updatedData,
          changeDescription: `Updated ${path} value`
        })
      });

      const data = await res.json();
      console.log('API response:', res.status, data);

      if (!res.ok) {
        if (res.status === 503 && data.migrationRequired) {
          setMigrationRequired(true);
          setToast({ 
            type: 'error', 
            message: 'Database migration required. Please apply the migration to enable editing.' 
          });
          return;
        }
        throw new Error(data.error || 'Failed to save changes');
      }

      if (data.data) {
        setDocumentInfo({
          ...documentInfo,
          revisionNo: data.data.revisionNo,
          revisionDate: data.data.revisionDate
        });
      }

      setToast({ type: 'success', message: 'Value updated successfully. Revision number incremented.' });
    } catch (error) {
      console.error('Error saving value:', error);
      if (error.message && (
        error.message.includes('migration') ||
        error.message.includes('does not exist')
      )) {
        setMigrationRequired(true);
        setToast({ 
          type: 'error', 
          message: 'Database migration required. Please apply the migration to enable editing.' 
        });
      } else {
        setToast({ 
          type: 'error', 
          message: error.message || 'Failed to save changes' 
        });
      }
    }
  };

  const ChartBox = ({ title, value, path, editable = true, className = '' }) => {
    // Ensure value is always a string, not an object
    const displayValue = typeof value === 'string' ? value : (value?.value || '0');
    const [localValue, setLocalValue] = useState(displayValue);
    
    // Update local value when prop changes
    useEffect(() => {
      setLocalValue(displayValue);
    }, [displayValue]);
    
    return (
      <div className={`flex flex-col items-center ${className}`}>
        <div className="bg-purple-50 border-2 border-dashed border-blue-500 rounded-lg p-2 min-w-[100px] text-center">
          {title && (
            <div className="font-semibold text-xs text-gray-800 mb-1 leading-tight">{title}</div>
          )}
          {editable && isAdmin ? (
            <Input
              type="text"
              value={localValue}
              onChange={(e) => {
                const newValue = e.target.value;
                setLocalValue(newValue);
              }}
              onBlur={async (e) => {
                const newValue = e.target.value;
                // Only save if value actually changed
                if (newValue !== displayValue) {
                  console.log('Saving value:', path, newValue);
                  await handleValueChange(path, newValue);
                }
              }}
              onKeyDown={(e) => {
                // Save on Enter key
                if (e.key === 'Enter') {
                  e.target.blur();
                }
              }}
              className="text-center text-xs font-medium w-12 mx-auto h-6"
            />
          ) : (
            <div className="text-xs font-medium text-gray-700">{displayValue}</div>
          )}
        </div>
      </div>
    );
  };

  const ArrowDown = ({ className = '' }) => (
    <div className={`flex justify-center ${className}`}>
      <div className="w-0.5 h-6 bg-gray-400"></div>
    </div>
  );

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'organization', label: 'Organization', href: '/dashboard/organization' },
    { key: 'documents', label: 'Document Details', href: '/dashboard/organization/documents' },
    { key: 'environmental-management-chart', label: 'Environmental Management Chart', href: '#' },
  ];

  const handleNavigate = (index, item) => {
    if (item.href) router.push(item.href);
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-10">
        <Breadcrumbs items={breadcrumbs} onNavigate={handleNavigate} />
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <Breadcrumbs items={breadcrumbs} onNavigate={handleNavigate} />
      
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {migrationRequired && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-red-800">
                Database migration required. The DocumentContent table does not exist. Please apply the migration to enable document editing.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => router.push('/dashboard/organization/documents')}
          >
            Back to Documents
          </Button>
        </div>
      )}
      
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Environmental Management Chart
              </h1>
              <p className="text-sm text-gray-600 mt-1">ESF-EMS-CHT-04 - Environmental Management System</p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/organization/documents')}
            >
              Back to Documents
            </Button>
          </div>
          
          {documentInfo && (
            <div className="mt-4 flex gap-6 text-sm text-gray-600">
              <div>
                <span className="font-medium">Doc No:</span> {documentInfo.docNo}
              </div>
              <div>
                <span className="font-medium">Rev/Date:</span> {documentInfo.revDate}
              </div>
              {documentInfo.revisionNo && (
                <div>
                  <span className="font-medium">Revision:</span> {documentInfo.revisionNo} ({new Date(documentInfo.revisionDate).toLocaleDateString()})
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-8 overflow-x-auto bg-gray-50">
          <div className="min-w-[1200px] mx-auto">
            {/* Top Level: CHAIRMAN and MANAGING DIRECTOR */}
            <div className="flex justify-center gap-24 mb-4">
              <ChartBox 
                title="CHAIRMAN" 
                value={chartData?.chairman?.value || chartData?.chairman || '0'} 
                path="chairman.value"
              />
              <ChartBox 
                title="MANAGING DIRECTOR" 
                value={chartData?.managingDirector?.value || chartData?.managingDirector || '0'} 
                path="managingDirector.value"
              />
            </div>

            {/* Arrows down from top level */}
            <div className="flex justify-center mb-4">
              <div className="flex gap-24">
                <ArrowDown />
                <ArrowDown />
              </div>
            </div>

            {/* Horizontal connector line */}
            <div className="flex justify-center mb-4">
              <div className="relative w-64 h-0.5 bg-gray-400">
                <div className="absolute left-1/2 top-0 w-0.5 h-6 bg-gray-400 transform -translate-x-1/2"></div>
              </div>
            </div>

            {/* FACTORY MANAGER */}
            <div className="flex justify-center mb-4">
              <ChartBox 
                title="FACTORY MANAGER" 
                value={chartData?.factoryManager?.value || chartData?.factoryManager || '0'} 
                path="factoryManager.value"
              />
            </div>

            {/* Arrow down */}
            <ArrowDown className="mb-4" />

            {/* MANAGEMENT REPRESENTATIVE */}
            <div className="flex justify-center mb-6">
              <ChartBox 
                title="MANAGEMENT REPRESENTATIVE" 
                value={chartData?.managementRepresentative?.value || chartData?.managementRepresentative || '0'} 
                path="managementRepresentative.value"
              />
            </div>

            {/* Arrows down to five divisions */}
            <div className="flex justify-center mb-6">
              <div className="relative w-full max-w-6xl">
                <div className="absolute left-[10%] top-0 w-0.5 h-6 bg-gray-400"></div>
                <div className="absolute left-[30%] top-0 w-0.5 h-6 bg-gray-400"></div>
                <div className="absolute left-[50%] top-0 w-0.5 h-6 bg-gray-400"></div>
                <div className="absolute left-[70%] top-0 w-0.5 h-6 bg-gray-400"></div>
                <div className="absolute left-[90%] top-0 w-0.5 h-6 bg-gray-400"></div>
              </div>
            </div>

            {/* Five Main Divisions */}
            <div className="flex justify-between gap-4">
              {/* LEGAL REQUIREMENTS */}
              <div className="flex-1 flex flex-col items-center">
                <div className="mb-3">
                  <ChartBox 
                    title="LEGAL REQUIREMENTS" 
                    value="" 
                    path=""
                    editable={false}
                  />
                </div>
                <ArrowDown className="mb-2" />
                <div className="flex flex-col gap-2">
                  <ChartBox 
                    title="ENERGY" 
                    value={chartData?.legalRequirements?.energy?.value || chartData?.legalRequirements?.energy || '0'} 
                    path="legalRequirements.energy.value"
                  />
                  <ChartBox 
                    title="EFFLUENT TREATMENT" 
                    value={chartData?.legalRequirements?.effluentTreatment?.value || chartData?.legalRequirements?.effluentTreatment || '0'} 
                    path="legalRequirements.effluentTreatment.value"
                  />
                </div>
              </div>

              {/* SOCIAL AUDIT */}
              <div className="flex-1 flex flex-col items-center">
                <div className="mb-3">
                  <ChartBox 
                    title="SOCIAL AUDIT" 
                    value="" 
                    path=""
                    editable={false}
                  />
                </div>
                <ArrowDown className="mb-2" />
                <div className="flex flex-col gap-2">
                  <ChartBox 
                    title="WATER" 
                    value={chartData?.socialAudit?.water?.value || chartData?.socialAudit?.water || '0'} 
                    path="socialAudit.water.value"
                  />
                  <ChartBox 
                    title="AIR & NOISE" 
                    value={chartData?.socialAudit?.airNoise?.value || chartData?.socialAudit?.airNoise || '0'} 
                    path="socialAudit.airNoise.value"
                  />
                </div>
              </div>

              {/* TRACEABILITY */}
              <div className="flex-1 flex flex-col items-center">
                <div className="mb-3">
                  <ChartBox 
                    title="TRACEABILITY" 
                    value="" 
                    path=""
                    editable={false}
                  />
                </div>
                <ArrowDown className="mb-2" />
                <div className="flex flex-col gap-2">
                  <ChartBox 
                    title="CHEMICAL MANAGEMENT" 
                    value={chartData?.traceability?.chemicalManagement?.value || chartData?.traceability?.chemicalManagement || '0'} 
                    path="traceability.chemicalManagement.value"
                  />
                  <ChartBox 
                    title="WASTE MANAGEMENT" 
                    value={chartData?.traceability?.wasteManagement?.value || chartData?.traceability?.wasteManagement || '0'} 
                    path="traceability.wasteManagement.value"
                  />
                </div>
              </div>

              {/* ENVIRONMENTAL MANAGEMENT SYSTEM */}
              <div className="flex-1 flex flex-col items-center">
                <div className="mb-3">
                  <ChartBox 
                    title="ENVIRONMENTAL MANAGEMENT SYSTEM" 
                    value="" 
                    path=""
                    editable={false}
                  />
                </div>
                <ArrowDown className="mb-2" />
                <div className="flex flex-col gap-2">
                  <ChartBox 
                    title="H & S EMERGENCY PLANS" 
                    value={chartData?.environmentalManagementSystem?.hsEmergencyPlans?.value || chartData?.environmentalManagementSystem?.hsEmergencyPlans || '0'} 
                    path="environmentalManagementSystem.hsEmergencyPlans.value"
                  />
                </div>
              </div>

              {/* RSL REQUIREMENTS */}
              <div className="flex-1 flex flex-col items-center">
                <div className="mb-3">
                  <ChartBox 
                    title="RSL REQUIREMENTS" 
                    value={chartData?.rslRequirements?.value || chartData?.rslRequirements || '0'} 
                    path="rslRequirements.value"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


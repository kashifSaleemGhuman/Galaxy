'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { Input } from '@/components/ui/Input';

export default function OrganisationChartPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [documentInfo, setDocumentInfo] = useState(null);
  const [migrationRequired, setMigrationRequired] = useState(false);
  
  // Chart data structure matching the image
  const [chartData, setChartData] = useState({
    chairman: { value: '0' },
    managingDirector: { value: '0' },
    factoryManager: { value: '0' },
    managementRepresentative: { value: '0' },
    administration: {
      office: {
        accounts: { value: '0' },
        edp: { value: '0' },
        hr: { value: '0' }
      },
      maintenance: {
        mechanical: { value: '0' },
        electrical: { value: '0' },
        environment: { value: '0' }
      },
      stores: {
        chemical: { value: '0' },
        material: { value: '0' }
      }
    },
    production: {
      machineryOperation: {
        sammyingSplittingShaving: { value: '0' },
        samSettingVacuum: { value: '0' },
        hookingConditioning: { value: '0' },
        buffing: { value: '0' }
      },
      dyeing: { value: '0' },
      finishing: {
        level1: { value: '0' },
        level2: { value: '0' },
        level3: { value: '0' }
      }
    },
    qualityControl: {
      leather: {
        wetblueControl: { value: '0' },
        crustControl: { value: '0' },
        finalControl: { value: '0' }
      },
      rndCell: {
        chemicalPhysicalLab: { value: '0' },
        sampleDevelopment: { value: '0' },
        etpLab: { value: '0' }
      }
    }
  });

  const isAdmin = session?.user?.role === 'SUPER_ADMIN' || session?.user?.role === 'ADMIN';

  useEffect(() => {
    fetchDocumentContent();
  }, []);

  const fetchDocumentContent = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/organization/documents/content?documentName=ENVIRONMENTAL ORGANISATION CHART → PERSONNEL COMPETENCY');
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
          documentName: 'ENVIRONMENTAL ORGANISATION CHART → PERSONNEL COMPETENCY',
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

  const ArrowUp = ({ className = '' }) => (
    <div className={`flex justify-center ${className}`}>
      <div className="w-0.5 h-6 bg-gray-400"></div>
    </div>
  );

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'organization', label: 'Organization', href: '/dashboard/organization' },
    { key: 'documents', label: 'Document Details', href: '/dashboard/organization/documents' },
    { key: 'organisation-chart', label: 'Organisation Chart', href: '#' },
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
                Organisation Chart
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

            {/* Arrows down to three divisions */}
            <div className="flex justify-center mb-6">
              <div className="relative w-full max-w-5xl">
                <div className="absolute left-1/4 top-0 w-0.5 h-6 bg-gray-400 transform -translate-x-1/2"></div>
                <div className="absolute left-1/2 top-0 w-0.5 h-6 bg-gray-400 transform -translate-x-1/2"></div>
                <div className="absolute left-3/4 top-0 w-0.5 h-6 bg-gray-400 transform -translate-x-1/2"></div>
              </div>
            </div>

            {/* Three Main Divisions */}
            <div className="flex justify-between gap-6">
              {/* ADMINISTRATION */}
              <div className="flex-1 flex flex-col items-center">
                <div className="mb-3">
                  <ChartBox 
                    title="ADMINISTRATION" 
                    value="" 
                    path=""
                    editable={false}
                  />
                </div>
                
                <ArrowDown className="mb-2" />
                
                {/* OFFICE */}
                <div className="mb-2">
                  <ChartBox 
                    title="OFFICE" 
                    value="" 
                    path=""
                    editable={false}
                  />
                </div>
                <ArrowDown className="mb-2" />
                <div className="flex justify-center gap-2 mb-4">
                  <ChartBox 
                    title="ACCOUNTS" 
                    value={chartData?.administration?.office?.accounts?.value || chartData?.administration?.office?.accounts || '0'} 
                    path="administration.office.accounts.value"
                  />
                  <ChartBox 
                    title="EDP" 
                    value={chartData?.administration?.office?.edp?.value || chartData?.administration?.office?.edp || '0'} 
                    path="administration.office.edp.value"
                  />
                  <ChartBox 
                    title="HR" 
                    value={chartData?.administration?.office?.hr?.value || chartData?.administration?.office?.hr || '0'} 
                    path="administration.office.hr.value"
                  />
                </div>

                {/* MAINTENANCE */}
                <div className="mb-2">
                  <ChartBox 
                    title="MAINTENANCE" 
                    value="" 
                    path=""
                    editable={false}
                  />
                </div>
                <ArrowDown className="mb-2" />
                <div className="flex justify-center gap-2 mb-4">
                  <ChartBox 
                    title="MECHANICAL" 
                    value={chartData?.administration?.maintenance?.mechanical?.value || chartData?.administration?.maintenance?.mechanical || '0'} 
                    path="administration.maintenance.mechanical.value"
                  />
                  <ChartBox 
                    title="ELECTRICAL" 
                    value={chartData?.administration?.maintenance?.electrical?.value || chartData?.administration?.maintenance?.electrical || '0'} 
                    path="administration.maintenance.electrical.value"
                  />
                  <ChartBox 
                    title="ENVIRONMENT" 
                    value={chartData?.administration?.maintenance?.environment?.value || chartData?.administration?.maintenance?.environment || '0'} 
                    path="administration.maintenance.environment.value"
                  />
                </div>

                {/* STORES */}
                <div className="mb-2">
                  <ChartBox 
                    title="STORES" 
                    value="" 
                    path=""
                    editable={false}
                  />
                </div>
                <ArrowDown className="mb-2" />
                <div className="flex justify-center gap-2">
                  <ChartBox 
                    title="CHEMICAL" 
                    value={chartData?.administration?.stores?.chemical?.value || chartData?.administration?.stores?.chemical || '0'} 
                    path="administration.stores.chemical.value"
                  />
                  <ChartBox 
                    title="MATERIAL" 
                    value={chartData?.administration?.stores?.material?.value || chartData?.administration?.stores?.material || '0'} 
                    path="administration.stores.material.value"
                  />
                </div>
              </div>

              {/* PRODUCTION */}
              <div className="flex-1 flex flex-col items-center">
                <div className="mb-3">
                  <ChartBox 
                    title="PRODUCTION" 
                    value="" 
                    path=""
                    editable={false}
                  />
                </div>
                
                <ArrowDown className="mb-2" />
                
                {/* MACHINERY OPERATION */}
                <div className="mb-2">
                  <ChartBox 
                    title="MACHINERY OPERATION" 
                    value="" 
                    path=""
                    editable={false}
                  />
                </div>
                <ArrowDown className="mb-2" />
                <div className="flex justify-center gap-1 mb-4 flex-wrap">
                  <ChartBox 
                    title="SAMMYING/ SPLITTING/ SHAVING" 
                    value={chartData?.production?.machineryOperation?.sammyingSplittingShaving?.value || chartData?.production?.machineryOperation?.sammyingSplittingShaving || '0'} 
                    path="production.machineryOperation.sammyingSplittingShaving.value"
                    className="min-w-[80px]"
                  />
                  <ChartBox 
                    title="SAM-SETTING/ VACUUM" 
                    value={chartData?.production?.machineryOperation?.samSettingVacuum?.value || chartData?.production?.machineryOperation?.samSettingVacuum || '0'} 
                    path="production.machineryOperation.samSettingVacuum.value"
                    className="min-w-[80px]"
                  />
                  <ChartBox 
                    title="HOOKING/ CONDITIONING" 
                    value={chartData?.production?.machineryOperation?.hookingConditioning?.value || chartData?.production?.machineryOperation?.hookingConditioning || '0'} 
                    path="production.machineryOperation.hookingConditioning.value"
                    className="min-w-[80px]"
                  />
                  <ChartBox 
                    title="BUFFING" 
                    value={chartData?.production?.machineryOperation?.buffing?.value || chartData?.production?.machineryOperation?.buffing || '0'} 
                    path="production.machineryOperation.buffing.value"
                    className="min-w-[80px]"
                  />
                </div>

                {/* DYEING */}
                <div className="mb-4">
                  <ChartBox 
                    title="DYEING" 
                    value={chartData?.production?.dyeing?.value || chartData?.production?.dyeing || '0'} 
                    path="production.dyeing.value"
                  />
                </div>

                {/* FINISHING */}
                <div className="mb-2">
                  <ChartBox 
                    title="FINISHING" 
                    value="" 
                    path=""
                    editable={false}
                  />
                </div>
                <ArrowDown className="mb-2" />
                <div className="flex justify-center gap-2">
                  <ChartBox 
                    title="" 
                    value={chartData?.production?.finishing?.level1?.value || chartData?.production?.finishing?.level1 || '0'} 
                    path="production.finishing.level1.value"
                  />
                  <ChartBox 
                    title="" 
                    value={chartData?.production?.finishing?.level2?.value || chartData?.production?.finishing?.level2 || '0'} 
                    path="production.finishing.level2.value"
                  />
                  <ChartBox 
                    title="" 
                    value={chartData?.production?.finishing?.level3?.value || chartData?.production?.finishing?.level3 || '0'} 
                    path="production.finishing.level3.value"
                  />
                </div>
              </div>

              {/* QUALITY CONTROL */}
              <div className="flex-1 flex flex-col items-center">
                <div className="mb-3">
                  <ChartBox 
                    title="QUALITY CONTROL" 
                    value="" 
                    path=""
                    editable={false}
                  />
                </div>
                
                <ArrowDown className="mb-2" />
                
                {/* LEATHER */}
                <div className="mb-2">
                  <ChartBox 
                    title="LEATHER" 
                    value="" 
                    path=""
                    editable={false}
                  />
                </div>
                <ArrowDown className="mb-2" />
                <div className="flex justify-center gap-2 mb-4">
                  <ChartBox 
                    title="WETBLUE CONTROL" 
                    value={chartData?.qualityControl?.leather?.wetblueControl?.value || chartData?.qualityControl?.leather?.wetblueControl || '0'} 
                    path="qualityControl.leather.wetblueControl.value"
                  />
                  <ChartBox 
                    title="CRUST CONTROL" 
                    value={chartData?.qualityControl?.leather?.crustControl?.value || chartData?.qualityControl?.leather?.crustControl || '0'} 
                    path="qualityControl.leather.crustControl.value"
                  />
                  <ChartBox 
                    title="FINAL CONTROL" 
                    value={chartData?.qualityControl?.leather?.finalControl?.value || chartData?.qualityControl?.leather?.finalControl || '0'} 
                    path="qualityControl.leather.finalControl.value"
                  />
                </div>

                {/* R & D CELL */}
                <div className="mb-2">
                  <ChartBox 
                    title="R & D CELL" 
                    value="" 
                    path=""
                    editable={false}
                  />
                </div>
                <ArrowDown className="mb-2" />
                <div className="flex justify-center gap-1 flex-wrap">
                  <ChartBox 
                    title="CHEMICAL / PHYSICAL LAB" 
                    value={chartData?.qualityControl?.rndCell?.chemicalPhysicalLab?.value || chartData?.qualityControl?.rndCell?.chemicalPhysicalLab || '0'} 
                    path="qualityControl.rndCell.chemicalPhysicalLab.value"
                    className="min-w-[80px]"
                  />
                  <ChartBox 
                    title="SAMPLE DEVELOPMENT" 
                    value={chartData?.qualityControl?.rndCell?.sampleDevelopment?.value || chartData?.qualityControl?.rndCell?.sampleDevelopment || '0'} 
                    path="qualityControl.rndCell.sampleDevelopment.value"
                    className="min-w-[80px]"
                  />
                  <ChartBox 
                    title="ETP-LAB" 
                    value={chartData?.qualityControl?.rndCell?.etpLab?.value || chartData?.qualityControl?.rndCell?.etpLab || '0'} 
                    path="qualityControl.rndCell.etpLab.value"
                    className="min-w-[80px]"
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


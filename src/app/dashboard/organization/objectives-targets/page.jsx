'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import EditableSection from '@/components/documents/EditableSection';

export default function ObjectivesTargetsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [documentInfo, setDocumentInfo] = useState(null);

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'organization', label: 'Organization', href: '/dashboard/organization' },
    { key: 'documents', label: 'Document Details', href: '/dashboard/organization/documents' },
    { key: 'objectives-targets', label: 'Objectives & Targets', href: '#' },
  ];

  const handleNavigate = (index, item) => {
    if (item.href) router.push(item.href);
  };

  const [objectives, setObjectives] = useState([
    {
      empCode: 'EMP1',
      objective: 'Reduction in energy consumption',
      result: 'Target set at 5% Achieved - %',
      targetYears: '2021-2023 Targets',
      aspectImpactRef: '21',
      kpis: [
        'Based on production issue',
        'Monthly EB, diesel bills',
        'Internal Audits',
        'Clamp meter monitoring',
        'Training from EB office officials',
        'Self-Energy audit and training'
      ]
    },
    {
      empCode: 'EMP2',
      objective: 'RO Water increased use and reduction of overall water usage',
      result: 'Target set at 50% recycled water Achieved - 63%',
      targetYears: '2021-2023 Targets',
      aspectImpactRef: '06',
      kpis: [
        'Process control, pipe diameter reduction',
        'Recipe setting to RO water & softner levels',
        'Aqua mix control',
        'Reducing number of washes'
      ]
    },
    {
      empCode: 'EMP3',
      objective: 'Reduction of Raw Trimmings',
      result: 'Raw hide trimming reduction target set at 1% achieved 1.93%',
      targetYears: '2021-2023 Targets',
      aspectImpactRef: '05',
      kpis: [
        'Reducing number of washes',
        'Training Employees to do Proper trimming',
        'Storage and disposal best practices',
        'Quarterly comparison on trimming against production quantity'
      ]
    },
    {
      empCode: 'EMP4',
      objective: 'Reduction of Wet Blue Trimmings',
      result: 'Target set at 5% Achieved - %',
      targetYears: '2021-2023 Targets',
      aspectImpactRef: '02',
      kpis: [
        'Training Employees to do Proper trimming',
        'Storage and disposal best practices',
        'Quarterly comparison on trimming against production quantity'
      ]
    },
    {
      empCode: 'EMP5',
      objective: 'Reduction of Crust Trimmings',
      result: 'Target set at 3% Achieved - 5.27%',
      targetYears: '2021-2023 Targets',
      aspectImpactRef: '19',
      kpis: [
        'Training Employees to do Proper trimming',
        'Storage and disposal best practices',
        'Quarterly comparison on trimming against production quantity'
      ]
    },
    {
      empCode: 'EMP6',
      objective: 'Reduction of Coal and increase of Bio mass briquettes',
      result: 'Planned to purchase of Biomass in Maximum possible quantity',
      targetYears: '2021-2023 Targets',
      aspectImpactRef: '',
      kpis: [
        'Biomass consumption record',
        'Coal consumption record'
      ]
    },
    {
      empCode: 'EMP7',
      objective: 'Rework Lots Reduction',
      result: 'Target set at 8 lots per year Achieved -',
      targetYears: '2021-2023 Targets',
      aspectImpactRef: '10',
      kpis: [
        'Monitoring Rework Lots Log Book',
        'Colour Consistency',
        'Dyeing Time, Etc'
      ]
    },
    {
      empCode: 'EMP8',
      objective: 'Reduction in Parameters of Effluent Treatment Water',
      subObjectives: [
        '1. Total Dissolve Solids',
        '2. Total Suspended Solids',
        '3. Total Chromium'
      ],
      result: 'Target set at 3% Achieved TDS - TSS - Chr -',
      targetYears: '2021-2023 Targets',
      aspectImpactRef: '33',
      kpis: [
        'Ultra Filtrations',
        'Constant ETP Monitoring Report'
      ]
    },
    {
      empCode: 'EMP9',
      objective: 'Sludge collection efficiency improvement',
      result: 'Target set at 10-15% Achieved - %',
      targetYears: '2021-2023 Targets',
      aspectImpactRef: '',
      kpis: [
        'Screening Machine SS mesh replaced to 300 microns from 500 microns',
        'Monthly Comparison'
      ]
    }
  ]);

  const isAdmin = session?.user?.role === 'SUPER_ADMIN' || session?.user?.role === 'ADMIN';

  useEffect(() => {
    fetchDocumentContent();
  }, []);

  const fetchDocumentContent = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/organization/documents/content?documentName=OBJECTIVES & TARGETS → ENVIRONMENTAL IMPROVEMENT');
      const data = await res.json();
      
      if (res.ok) {
        if (data.data?.content) {
          setObjectives(data.data.content.content.objectives || objectives);
          setDocumentInfo({
            docNo: data.data.document.docNo || 'ESF-EMS-OBT-03',
            revDate: data.data.document.revDate || 'Rev.No-03/Date-01-01-2024',
            revisionNo: data.data.content.revisionNo,
            revisionDate: data.data.content.revisionDate
          });
        } else {
          setDocumentInfo({
            docNo: 'ESF-EMS-OBT-03',
            revDate: 'Rev.No-03/Date-01-01-2024',
            revisionNo: 1,
            revisionDate: new Date()
          });
        }
      }
    } catch (error) {
      console.error('Error fetching document content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveObjective = async (index, updatedObjective) => {
    try {
      const updatedObjectives = [...objectives];
      updatedObjectives[index] = updatedObjective;

      const res = await fetch('/api/organization/documents/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentName: 'OBJECTIVES & TARGETS → ENVIRONMENTAL IMPROVEMENT',
          content: { objectives: updatedObjectives },
          changeDescription: `Updated ${updatedObjective.empCode} objective`
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save changes');
      }

      setObjectives(updatedObjectives);
      
      if (data.data) {
        const revDateStr = new Date(data.data.revisionDate).toLocaleDateString('en-GB', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric' 
        }).replace(/\//g, '-');
        
        setDocumentInfo({
          docNo: 'ESF-EMS-OBT-03',
          revDate: `Rev.No-${String(data.data.revisionNo).padStart(2, '0')}/Date-${revDateStr}`,
          revisionNo: data.data.revisionNo,
          revisionDate: data.data.revisionDate
        });
      }

      setToast({ type: 'success', message: data.message || 'Document updated successfully. Revision number incremented.' });
    } catch (error) {
      console.error('Error saving objective:', error);
      setToast({ type: 'error', message: error.message || 'Failed to save changes' });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-10">
        <Breadcrumbs items={breadcrumbs} onNavigate={handleNavigate} />
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
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

      
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-amber-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Environmental Objectives, Targets and Programs</h1>
                <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                  <span className="font-medium">ESF Leather Consultancy</span>
                  <span>•</span>
                  <span>Document ID: {documentInfo?.docNo || 'ESF-EMS-OBT-03'}</span>
                  <span>•</span>
                  <span>{documentInfo?.revDate || 'Rev.No-03/Date-01-01-2024'}</span>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/organization/documents')}
            >
              Back to Documents
            </Button>
          </div>
        </div>

        {/* Objectives Content */}
        <div className="p-8 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Objective Period:</strong> 2021-2023 Targets
            </p>
          </div>

          {objectives.map((obj, index) => (
            <div key={obj.empCode} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg font-bold text-orange-700">{obj.empCode}</span>
                </div>
                <div className="flex-1">
                  {isAdmin ? (
                    <EditableSection
                      title=""
                      content={obj.objective}
                      onSave={(key, val) => handleSaveObjective(index, { ...obj, objective: val })}
                      canEdit={isAdmin}
                      sectionKey={`objective-${index}`}
                      contentType="text"
                    />
                  ) : (
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{obj.objective}</h3>
                  )}
                  {obj.subObjectives && (
                    isAdmin ? (
                      <EditableSection
                        title=""
                        content={obj.subObjectives}
                        onSave={(key, val) => handleSaveObjective(index, { ...obj, subObjectives: val })}
                        canEdit={isAdmin}
                        sectionKey={`subObjectives-${index}`}
                        contentType="list"
                      />
                    ) : (
                      <ul className="list-disc pl-6 mb-2 text-gray-700">
                        {obj.subObjectives.map((sub, idx) => (
                          <li key={idx}>{sub}</li>
                        ))}
                      </ul>
                    )
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-600 mb-1">Target & Achieved Status</p>
                  {isAdmin ? (
                    <EditableSection
                      title=""
                      content={obj.result}
                      onSave={(key, val) => handleSaveObjective(index, { ...obj, result: val })}
                      canEdit={isAdmin}
                      sectionKey={`result-${index}`}
                      contentType="text"
                    />
                  ) : (
                    <p className="text-base text-gray-900">{obj.result}</p>
                  )}
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-600 mb-1">Target Years</p>
                  <p className="text-base text-gray-900">{obj.targetYears}</p>
                </div>
              </div>

              {obj.aspectImpactRef && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-600 mb-1">Aspect Impact Reference</p>
                  <p className="text-base text-gray-900">
                    Refer Aspect Impact Significant No - {obj.aspectImpactRef}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Key Performance Indicators (KPIs) & Activities</p>
                {isAdmin ? (
                  <EditableSection
                    title=""
                    content={obj.kpis}
                    onSave={(key, val) => handleSaveObjective(index, { ...obj, kpis: val })}
                    canEdit={isAdmin}
                    sectionKey={`kpis-${index}`}
                    contentType="list"
                  />
                ) : (
                  <ul className="list-disc pl-6 space-y-1">
                    {obj.kpis.map((kpi, idx) => (
                      <li key={idx} className="text-gray-700">{kpi}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}

          {/* Summary Section */}
          <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border-2 border-green-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Summary of Achievements</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-600">Energy Consumption</p>
                <p className="text-lg font-semibold text-gray-900">Target: 5%</p>
                <p className="text-xs text-gray-500">In Progress</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-600">RO Water Usage</p>
                <p className="text-lg font-semibold text-green-600">Achieved: 63%</p>
                <p className="text-xs text-green-600">Exceeded Target (50%)</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-600">Raw Trimmings</p>
                <p className="text-lg font-semibold text-green-600">Achieved: 1.93%</p>
                <p className="text-xs text-green-600">Exceeded Target (1%)</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-600">Crust Trimmings</p>
                <p className="text-lg font-semibold text-green-600">Achieved: 5.27%</p>
                <p className="text-xs text-green-600">Exceeded Target (3%)</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-600">Wet Blue Trimmings</p>
                <p className="text-lg font-semibold text-gray-900">Target: 5%</p>
                <p className="text-xs text-gray-500">In Progress</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-600">Rework Lots</p>
                <p className="text-lg font-semibold text-gray-900">Target: 8 lots/year</p>
                <p className="text-xs text-gray-500">In Progress</p>
              </div>
            </div>
          </div>

          {/* Approval Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-2">Prepared By</p>
                <p className="text-lg font-semibold text-gray-900">MANAGEMENT REPRESENTATIVE</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-2">Approved By</p>
                <p className="text-lg font-semibold text-gray-900">GENERAL MANAGER</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


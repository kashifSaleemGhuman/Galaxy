'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import EditableSection from '@/components/documents/EditableSection';

export default function KPIPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [documentInfo, setDocumentInfo] = useState(null);
  const [content, setContent] = useState({
    energyConsumption: {
      summary: 'Reduction of energy consumption - 12.57% achieved',
      description: 'Monthly production data tracked in MJ and MJ/M² for 2022 and 2023, showing significant improvement in energy efficiency.'
    },
    coalBriquettes: {
      summary: 'Reduction of Coal is Achieved - 7.8%',
      description: 'Monthly tracking of coal production, coal/sq.m, briquettes production, and briquettes/sq.m for 2022 and 2023.'
    },
    effluentDischarge: {
      parameters: ['Total Dissolve Solids (TDS)', 'Total Suspended Solids (TSS)', 'Chromium Total'],
      reductions: {
        tds: '3.21%',
        chromium: '0.63%',
        tss: '3.46%'
      },
      description: 'Monthly monitoring of effluent quality parameters showing consistent improvement in water discharge quality.'
    },
    sludgeConsumption: {
      before: 'Average: 3,355 kg',
      after: 'Average: 4,357 kg',
      reduction: '23%',
      description: 'Significant improvement in sludge management through screening mesh installation.'
    },
    rawTrimming: {
      summary: 'Reduction in Raw Trimming Achieved - 1.93%',
      description: 'Monthly tracking of raw pieces, raw trimming in Kgs, and trimming Kg/Pcs for 2022 and 2023, showing improved material efficiency.'
    },
    semiFinishedTrimming: {
      summary: 'Reduction in Semifinished Leather Trimming Achieved - 1.5%',
      description: 'Monthly production data in Pcs, wet blue trimming in Kgs, and trimming Kg/Pcs for 2022 and 2023.'
    },
    crustTrimming: {
      summary: 'Reduction in Crust Trimming Achieved - 2.9%',
      description: 'Monthly production in Pcs, crust trimming in Kgs, and trimming Pcs/Sqm for 2022 and 2023.'
    },
    reworkLots: {
      year2022: { total: '1,510 lots', rework: '90 lots', avg: '5.96 rework lots' },
      year2023: { total: '1,460 lots', rework: '59 lots', avg: '4.04 rework lots' },
      reduction: 'Average 5 rework lots per year reduction',
      description: 'Quarterly tracking showing significant improvement in quality control and reduction in rework requirements.'
    }
  });

  const isAdmin = session?.user?.role === 'SUPER_ADMIN' || session?.user?.role === 'ADMIN';

  useEffect(() => {
    fetchDocumentContent();
  }, []);

  const fetchDocumentContent = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/organization/documents/content?documentName=KPI → PRODUCTION CONSUMPTION RECORD');
      if (res.ok) {
        const data = await res.json();
        if (data.data?.content) {
          setContent(data.data.content.content);
          setDocumentInfo({
            revisionNo: data.data.content.revisionNo,
            revisionDate: data.data.content.revisionDate
          });
        }
      }
    } catch (error) {
      console.error('Error fetching document content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSection = async (sectionKey, sectionContent) => {
    try {
      const updatedContent = {
        ...content,
        [sectionKey]: sectionContent
      };

      const res = await fetch('/api/organization/documents/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentName: 'KPI → PRODUCTION CONSUMPTION RECORD',
          content: updatedContent,
          changeDescription: `Updated ${sectionKey} section`
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save changes');
      }

      setContent(updatedContent);
      
      if (data.data) {
        setDocumentInfo({
          revisionNo: data.data.revisionNo,
          revisionDate: data.data.revisionDate
        });
      }

      setToast({ type: 'success', message: data.message || 'Document updated successfully. Revision number incremented.' });
    } catch (error) {
      console.error('Error saving section:', error);
      setToast({ 
        type: 'error', 
        message: error.message || 'Failed to save changes' 
      });
    }
  };

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'organization', label: 'Organization', href: '/dashboard/organization' },
    { key: 'documents', label: 'Document Details', href: '/dashboard/organization/documents' },
    { key: 'kpi', label: 'Key Performance Indicators', href: '#' },
  ];

  const handleNavigate = (index, item) => {
    if (item.href) router.push(item.href);
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-10">
        <Breadcrumbs items={breadcrumbs} onNavigate={handleNavigate} />
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
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
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Key Performance Indicators (KPI)</h1>
                <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                  <span className="font-medium">ESF Leather Consultancy - Production Consumption Records</span>
                  {documentInfo && (
                    <>
                      <span>•</span>
                      <span>Rev.No-{String(documentInfo.revisionNo || 1).padStart(2, '0')}</span>
                    </>
                  )}
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

        {/* KPI Content */}
        <div className="p-8 space-y-10">
          {/* Energy Consumption */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 border-b-2 border-purple-600 pb-2">
              Energy Consumption Evaluation Data (ESF-KPI-ENERG)
            </h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <EditableSection
                title="Summary"
                content={content.energyConsumption?.summary || 'Reduction of energy consumption - 12.57% achieved'}
                onSave={(key, val) => handleSaveSection('energyConsumption', { ...content.energyConsumption, summary: val })}
                canEdit={isAdmin}
                sectionKey="energyConsumptionSummary"
                contentType="text"
              />
              <EditableSection
                title="Description"
                content={content.energyConsumption?.description || 'Monthly production data tracked in MJ and MJ/M² for 2022 and 2023, showing significant improvement in energy efficiency.'}
                onSave={(key, val) => handleSaveSection('energyConsumption', { ...content.energyConsumption, description: val })}
                canEdit={isAdmin}
                sectionKey="energyConsumptionDescription"
                contentType="text"
              />
            </div>
          </section>

          {/* Coal & Briquettes */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 border-b-2 border-purple-600 pb-2">
              Coal & Briquettes Evaluation Data (ESF-KPI-C&B)
            </h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <EditableSection
                title="Summary"
                content={content.coalBriquettes?.summary || 'Reduction of Coal is Achieved - 7.8%'}
                onSave={(key, val) => handleSaveSection('coalBriquettes', { ...content.coalBriquettes, summary: val })}
                canEdit={isAdmin}
                sectionKey="coalBriquettesSummary"
                contentType="text"
              />
              <EditableSection
                title="Description"
                content={content.coalBriquettes?.description || 'Monthly tracking of coal production, coal/sq.m, briquettes production, and briquettes/sq.m for 2022 and 2023.'}
                onSave={(key, val) => handleSaveSection('coalBriquettes', { ...content.coalBriquettes, description: val })}
                canEdit={isAdmin}
                sectionKey="coalBriquettesDescription"
                contentType="text"
              />
            </div>
          </section>

          {/* Effluent Discharge Water */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 border-b-2 border-purple-600 pb-2">
              Effluent Discharge Water Evaluation Data (ESF-KPI-EFP)
            </h2>
            <div className="bg-gray-50 rounded-lg p-6 space-y-3">
              <EditableSection
                title="Parameters Tracked"
                content={content.effluentDischarge?.parameters || ['Total Dissolve Solids (TDS)', 'Total Suspended Solids (TSS)', 'Chromium Total']}
                onSave={(key, val) => handleSaveSection('effluentDischarge', { ...content.effluentDischarge, parameters: val })}
                canEdit={isAdmin}
                sectionKey="effluentDischargeParameters"
                contentType="list"
              />
              <div className="mt-4 space-y-2">
                <EditableSection
                  title="Reduction in Total Dissolve Solids Achieved"
                  content={content.effluentDischarge?.reductions?.tds || '3.21%'}
                  onSave={(key, val) => handleSaveSection('effluentDischarge', { 
                    ...content.effluentDischarge, 
                    reductions: { ...content.effluentDischarge?.reductions, tds: val }
                  })}
                  canEdit={isAdmin}
                  sectionKey="effluentDischargeTDS"
                  contentType="text"
                />
                <EditableSection
                  title="Reduction in Total Chromium Achieved"
                  content={content.effluentDischarge?.reductions?.chromium || '0.63%'}
                  onSave={(key, val) => handleSaveSection('effluentDischarge', { 
                    ...content.effluentDischarge, 
                    reductions: { ...content.effluentDischarge?.reductions, chromium: val }
                  })}
                  canEdit={isAdmin}
                  sectionKey="effluentDischargeChromium"
                  contentType="text"
                />
                <EditableSection
                  title="Reduction in Total Suspended Solids Achieved"
                  content={content.effluentDischarge?.reductions?.tss || '3.46%'}
                  onSave={(key, val) => handleSaveSection('effluentDischarge', { 
                    ...content.effluentDischarge, 
                    reductions: { ...content.effluentDischarge?.reductions, tss: val }
                  })}
                  canEdit={isAdmin}
                  sectionKey="effluentDischargeTSS"
                  contentType="text"
                />
              </div>
              <EditableSection
                title="Description"
                content={content.effluentDischarge?.description || 'Monthly monitoring of effluent quality parameters showing consistent improvement in water discharge quality.'}
                onSave={(key, val) => handleSaveSection('effluentDischarge', { ...content.effluentDischarge, description: val })}
                canEdit={isAdmin}
                sectionKey="effluentDischargeDescription"
                contentType="text"
              />
            </div>
          </section>

          {/* Sludge Consumption */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 border-b-2 border-purple-600 pb-2">
              Sludge Consumption Evaluation Data (ESF-KPI-SLUDGE)
            </h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700 mb-2">
                <strong>Screening Mesh Before and After Installation</strong>
              </p>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-sm text-gray-600">Before (May-22)</p>
                  <EditableSection
                    title=""
                    content={content.sludgeConsumption?.before || 'Average: 3,355 kg'}
                    onSave={(key, val) => handleSaveSection('sludgeConsumption', { ...content.sludgeConsumption, before: val })}
                    canEdit={isAdmin}
                    sectionKey="sludgeConsumptionBefore"
                    contentType="text"
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-600">After (Nov-22)</p>
                  <EditableSection
                    title=""
                    content={content.sludgeConsumption?.after || 'Average: 4,357 kg'}
                    onSave={(key, val) => handleSaveSection('sludgeConsumption', { ...content.sludgeConsumption, after: val })}
                    canEdit={isAdmin}
                    sectionKey="sludgeConsumptionAfter"
                    contentType="text"
                  />
                </div>
              </div>
              <EditableSection
                title="Reduction of Sludge Achieved"
                content={content.sludgeConsumption?.reduction || '23%'}
                onSave={(key, val) => handleSaveSection('sludgeConsumption', { ...content.sludgeConsumption, reduction: val })}
                canEdit={isAdmin}
                sectionKey="sludgeConsumptionReduction"
                contentType="text"
              />
              <EditableSection
                title="Description"
                content={content.sludgeConsumption?.description || 'Significant improvement in sludge management through screening mesh installation.'}
                onSave={(key, val) => handleSaveSection('sludgeConsumption', { ...content.sludgeConsumption, description: val })}
                canEdit={isAdmin}
                sectionKey="sludgeConsumptionDescription"
                contentType="text"
              />
            </div>
          </section>

          {/* Raw Trimming */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 border-b-2 border-purple-600 pb-2">
              Raw Trimming Evaluation Data (ESF-KPI-WATER)
            </h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <EditableSection
                title="Summary"
                content={content.rawTrimming?.summary || 'Reduction in Raw Trimming Achieved - 1.93%'}
                onSave={(key, val) => handleSaveSection('rawTrimming', { ...content.rawTrimming, summary: val })}
                canEdit={isAdmin}
                sectionKey="rawTrimmingSummary"
                contentType="text"
              />
              <EditableSection
                title="Description"
                content={content.rawTrimming?.description || 'Monthly tracking of raw pieces, raw trimming in Kgs, and trimming Kg/Pcs for 2022 and 2023, showing improved material efficiency.'}
                onSave={(key, val) => handleSaveSection('rawTrimming', { ...content.rawTrimming, description: val })}
                canEdit={isAdmin}
                sectionKey="rawTrimmingDescription"
                contentType="text"
              />
            </div>
          </section>

          {/* Semi Finished Trimming */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 border-b-2 border-purple-600 pb-2">
              Semi Finished Trimming Evaluation Data (ESF-KPI-RWT)
            </h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <EditableSection
                title="Summary"
                content={content.semiFinishedTrimming?.summary || 'Reduction in Semifinished Leather Trimming Achieved - 1.5%'}
                onSave={(key, val) => handleSaveSection('semiFinishedTrimming', { ...content.semiFinishedTrimming, summary: val })}
                canEdit={isAdmin}
                sectionKey="semiFinishedTrimmingSummary"
                contentType="text"
              />
              <EditableSection
                title="Description"
                content={content.semiFinishedTrimming?.description || 'Monthly production data in Pcs, wet blue trimming in Kgs, and trimming Kg/Pcs for 2022 and 2023.'}
                onSave={(key, val) => handleSaveSection('semiFinishedTrimming', { ...content.semiFinishedTrimming, description: val })}
                canEdit={isAdmin}
                sectionKey="semiFinishedTrimmingDescription"
                contentType="text"
              />
            </div>
          </section>

          {/* Crust/Finished Trimming */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 border-b-2 border-purple-600 pb-2">
              Crust/Finished Trimming Evaluation Data
            </h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <EditableSection
                title="Summary"
                content={content.crustTrimming?.summary || 'Reduction in Crust Trimming Achieved - 2.9%'}
                onSave={(key, val) => handleSaveSection('crustTrimming', { ...content.crustTrimming, summary: val })}
                canEdit={isAdmin}
                sectionKey="crustTrimmingSummary"
                contentType="text"
              />
              <EditableSection
                title="Description"
                content={content.crustTrimming?.description || 'Monthly production in Pcs, crust trimming in Kgs, and trimming Pcs/Sqm for 2022 and 2023.'}
                onSave={(key, val) => handleSaveSection('crustTrimming', { ...content.crustTrimming, description: val })}
                canEdit={isAdmin}
                sectionKey="crustTrimmingDescription"
                contentType="text"
              />
            </div>
          </section>

          {/* Rework Lots */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 border-b-2 border-purple-600 pb-2">
              Rework Lots Evaluation Data (ESF-KPI-RL)
            </h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">2022 Data</p>
                  <EditableSection
                    title=""
                    content={content.reworkLots?.year2022?.avg || 'Average: 5.96 rework lots'}
                    onSave={(key, val) => handleSaveSection('reworkLots', { 
                      ...content.reworkLots, 
                      year2022: { ...content.reworkLots?.year2022, avg: val }
                    })}
                    canEdit={isAdmin}
                    sectionKey="reworkLots2022"
                    contentType="text"
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    {content.reworkLots?.year2022?.total || 'Total: 1,510 lots'} | {content.reworkLots?.year2022?.rework || 'Rework: 90 lots'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">2023 Data</p>
                  <EditableSection
                    title=""
                    content={content.reworkLots?.year2023?.avg || 'Average: 4.04 rework lots'}
                    onSave={(key, val) => handleSaveSection('reworkLots', { 
                      ...content.reworkLots, 
                      year2023: { ...content.reworkLots?.year2023, avg: val }
                    })}
                    canEdit={isAdmin}
                    sectionKey="reworkLots2023"
                    contentType="text"
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    {content.reworkLots?.year2023?.total || 'Total: 1,460 lots'} | {content.reworkLots?.year2023?.rework || 'Rework: 59 lots'}
                  </p>
                </div>
              </div>
              <EditableSection
                title="Reduction in Rework Lot Achieved"
                content={content.reworkLots?.reduction || 'Average 5 rework lots per year reduction'}
                onSave={(key, val) => handleSaveSection('reworkLots', { ...content.reworkLots, reduction: val })}
                canEdit={isAdmin}
                sectionKey="reworkLotsReduction"
                contentType="text"
              />
              <EditableSection
                title="Description"
                content={content.reworkLots?.description || 'Quarterly tracking showing significant improvement in quality control and reduction in rework requirements.'}
                onSave={(key, val) => handleSaveSection('reworkLots', { ...content.reworkLots, description: val })}
                canEdit={isAdmin}
                sectionKey="reworkLotsDescription"
                contentType="text"
              />
            </div>
          </section>

          {/* Overall Performance Summary */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 border-b-2 border-purple-600 pb-2">
              Overall Performance Summary
            </h2>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border-2 border-green-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Achievements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-sm text-gray-600">Energy Consumption</p>
                  <p className="text-2xl font-bold text-green-600">12.57%</p>
                  <p className="text-xs text-gray-500">Reduction Achieved</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-sm text-gray-600">Coal Consumption</p>
                  <p className="text-2xl font-bold text-green-600">7.8%</p>
                  <p className="text-xs text-gray-500">Reduction Achieved</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-sm text-gray-600">Sludge Generation</p>
                  <p className="text-2xl font-bold text-green-600">23%</p>
                  <p className="text-xs text-gray-500">Reduction Achieved</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-sm text-gray-600">Rework Lots</p>
                  <p className="text-2xl font-bold text-green-600">32%</p>
                  <p className="text-xs text-gray-500">Reduction (5.96 to 4.04)</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-sm text-gray-600">Effluent TDS</p>
                  <p className="text-2xl font-bold text-green-600">3.21%</p>
                  <p className="text-xs text-gray-500">Reduction Achieved</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-sm text-gray-600">Effluent Chromium</p>
                  <p className="text-2xl font-bold text-green-600">0.63%</p>
                  <p className="text-xs text-gray-500">Reduction Achieved</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}


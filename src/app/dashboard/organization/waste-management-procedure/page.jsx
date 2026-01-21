'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { Input } from '@/components/ui/Input';
import EditableSection from '@/components/documents/EditableSection';

export default function WasteManagementProcedurePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [documentInfo, setDocumentInfo] = useState(null);
  const [migrationRequired, setMigrationRequired] = useState(false);
  
  // Waste Management Procedure data structure
  const [content, setContent] = useState({
    policy: [
      'ESF LEATHER is committed to ensuring that all hazardous material (waste) is properly and safely managed from generation to preparation for disposal.',
      'Responsibilities of individuals generating waste.',
      'Reference to national, regional, and local laws in the waste management plan.',
      'Internal technical team coordinating collection of Hazardous and Non-Hazardous waste.',
      'Encouragement for reuse or recycling of wastes.',
      'Guidance for proper disposal of hazardous waste at Tannery.',
      'Contact information for the Environmental manager/Management Representative for questions regarding hazardous material disposal.'
    ],
    application: 'These rules shall apply to the management of hazardous and other Wastes as specified in the Schedules to the Hazardous and Other Wastes (Management and Tran\'s boundary Movement) Rules, 2016.',
    definitions: {
      hazardousWaste: '"Hazardous Waste" means any waste which by reason of characteristics such as physical, chemical, biological, reactive, toxic, flammable, explosive or corrosive, causes danger or is likely to cause danger to health or environment, whether alone or in contact with other wastes or substances, and shall include - (i) waste specified under column (3) of Schedule I; (ii) waste having equal to or more than the concentration limits specified for the constituents in class A and class B of Schedule II or any of the characteristics as specified in class C of Schedule II.',
      otherWastes: '"Other Wastes" means wastes specified in Part B and Part D of Schedule III for import or export and includes all such waste generated Indigenously within the country.',
      occupier: '"Occupier" in relation to any factory or premises, means a person who has, control over the affairs of the factory or the premises and includes in relation to any hazardous and other wastes, the person in possession of The hazardous or other waste.',
      actualUser: '"Actual User" means an occupier who procures and processes hazardous and other waste for reuse, recycling, recovery, pre-processing, utilisation including co-processing.',
      commonFacility: '"Common Treatment, Storage and Disposal Facility" means a common facility identified and established individually or jointly or severally by the state Government, occupier, operator of a facility or any association of occupiers that shall be used as common facility by multiple occupiers or actual users for treatment, storage and disposal of hazardous and other wastes.',
      preProcessing: '"Pre-processing" means the treatment of waste to make it suitable for co processing or recycling or for any further processing.',
      coProcessing: '"Co-processing" means the use of waste materials in manufacturing processes for the purpose of energy or resource recovery or both and resultant reduction in the use of conventional fuels or raw materials or both through substitution.',
      recycling: '"Recycling" means reclamation and processing of hazardous or other wastes in an environmentally sound manner for the originally intended purpose or for other purposes.',
      reuse: '"Reuse" means use of hazardous or other waste for the purpose of its original use or other use.',
      recovery: '"Recovery" means any operation or activity wherein specific materials are recovered.',
      utilisation: '"Utilisation" means use of hazardous or other waste as a resource.',
      storage: '"Storage" mean storing any hazardous or other waste for a temporary period, at the end of which such waste is processed or disposed of.',
      transport: '"Transport" means off-site movement of hazardous or other wastes by air, rail, road or water.',
      manifest: '"Manifest" means transporting document prepared and signed by the sender authorised in accordance with the provisions of these.',
      treatment: '"Treatment" means a method, technique or process, designed to modify the physical, chemical or biological characteristics or composition of any hazardous or other waste so as to reduce its potential to cause harm.',
      disposal: '"Disposal" means any operation which does not lead to reuse, recycling, recovery, utilisation including co-processing and includes physic chemical treatment, biological treatment, incineration and.',
      authorisation: '"Authorisation" means permission for generation, handling, collection, reception, treatment, transport, storage, reuse, recycling, recovery, pre-processing, utilisation including co-processing and disposal of hazardous wastes granted under sub-rule (2) of rule 6.'
    },
    responsibilities: {
      point1: 'The occupier shall be responsible for safe and environmentally sound management of hazardous and other wastes.',
      point2: 'The occupier shall follow the following steps for the management of hazardous and other wastes:',
      steps: [
        'A. prevention.',
        'B. minimization.',
        'C. reuse.',
        'D. recycling.',
        'E. recovery, utilisation including co-processing.',
        'F. safe disposal.'
      ],
      point3: 'The hazardous and other wastes generated in the establishment of an occupier shall be sent or sold to an authorised actual user or shall be disposed of in an authorised disposal facility.'
    },
    rule6: {
      point1: '(1) Every occupier of the facility who is engaged in handling, generation, collection, storage, packaging, transportation, use, treatment, processing, recycling, recovery, pre-processing, co-processing, utilisation, offering for sale, transfer or disposal of the hazardous and other wastes shall make an application in Form 1 to the State Pollution Control Board.',
      point2: '(2) An authorisation in Form 2 shall be granted by the State Control Board with validity period of five years after through site inspection and after ensuring technical capabilities and equipment complying with the standard operating procedure or other guidelines within a period of one hundred and twenty days.',
      point3: '(3) Every occupier authorised under these rules, shall maintain a record of hazardous and other wastes managed by him in Form 3 and prepare and submit to the State Pollution Control Board, an annual return containing the details specified in Form 4 on or before the 30th day of June following the financial year to which that return relates',
      point4: '(4) An application for renewal of authorisation shall be made three months in advance before its expiry'
    },
    rule8: 'The occupiers of facilities may store the hazardous and other wastes for a period not exceeding ninety days and shall maintain a record of sale, transfer, storage, recycling, recovery, pre-processing, co-processing, and utilisation of such wastes and makes these records available for inspection.',
    rule9: 'The utilisation of hazardous and other wastes as a resource or after pre-processing either for co-processing or for any other use, including within the premises of the generator (if it is not part of process), shall be carried out only after obtaining authorisation from the State Pollution Control Board in respect of waste based on standard operating procedures or guidelines provided by the Central Pollution Control Board.',
    rule16: {
      point1: '(1) The State Government, occupier, operator of a facility or any Association of occupiers shall individually or jointly or severally be Responsible for identification of sites for establishing the facility for treatment, storage, and disposal of the hazardous and other waste in the State.',
      point2: '(2) The operator of common facility or occupier of a captive facility, shall design and set up the treatment, storage, and disposal facility as per technical guidelines issued by the Central Pollution Control Board in this regard from time to time and shall obtain approval from the State Pollution Control Board for design and layout in this regard',
      point3: '(3) The State Pollution Control Board shall monitor the setting up and operation of the common or captive treatment, storage and Disposal facility, regularly.',
      point4: '(4) The operator of common facility or occupier of a captive facility Shall be responsible for safe and environmentally sound operation Of the facility and its closure and post closure phase, as per Guidelines or standard operating procedures issued by the Central Pollution Control Board from time to time',
      point5: '(5) The operator of common facility or occupier of a captive facility Shall maintain records of hazardous and other wastes handled by Him in Form 3.',
      point6: '(6) The operator of common facility or occupier of a captive facility Shall file an annual return in Form 4 to the State Pollution Control Board on or before the 30th day of June following the financial year to which that return relates.'
    },
    rule17: {
      description: 'The hazardous and other wastes shall be packaged in a manner suitable for safe handling, storage, and transport as per the guidelines issued by the Central Pollution Control Board from time to time.',
      labelling: 'The labelling shall be done as per Form 8. The label shall be of non-washable material, weatherproof and easily visible.'
    },
    rule18: 'The transport of the hazardous and other waste shall be in accordance with the provisions of these rules and the rules made by the Central Government under the Motor Vehicles Act, 1988 and the guidelines issued by the Central Pollution Control Board from time to time in this regard. The occupier shall provide the transporter with information in Form 9 regarding hazardous nature and emergency measures.',
    rule19: {
      manifest: 'The manifest system (Movement Document) for hazardous waste within the country. The sender must prepare seven copies of the manifest in Form 10, comprising a color code, and all copies must be signed.',
      noObjection: 'For inter-state transport, a "No Objection Certificate" from both State Pollution Control Boards is required.'
    },
    rule20: 'Occupiers handling hazardous waste and operators of disposal facilities must maintain records of their operations. They must also send annual returns to the State Pollution Control Board in Form 4.',
    rule21: 'Authorities specified in column (2) of Schedule VII must perform duties as per column (3) of the said Schedule, subject to the rules.',
    rule22: 'Where an accident occurs at the facility of the occupier handling Hazardous or other wastes and operator of the disposal facility or during Transportation, the occupier or the operator or the transporter shall immediately intimate the State Pollution Control Board through telephone, e-mail about the accident and subsequently send a report in Form 11.',
    rule23: 'The occupier, importer or exporter and operator of the disposal facility shall be liable for all damages caused to the environment or third party due to improper handling and management of the hazardous and other Waste shall be liable to pay financial penalties as levied for any violation of the provisions under these rules by the State Pollution Control Board With the prior approval of the Central Pollution Control Board.',
    rule24: 'Any person aggrieved by an order of suspension or cancellation or refusal of authorisation or its renewal passed by the State Pollution Control Board may, prefer an appeal in Form 12 to the Appellate Authority, Namely, the Environment Secretary of the State within a period of thirty Days.',
    typesOfWastes: [
      'Raw Trimmings & Fleshing',
      'Wet Blue Trimmings & Shaving Dust',
      'Empty Chemical Cans',
      'Empty Chemical Bags',
      'Crust Trimmings',
      'Buffing Dust',
      'Crust / Finished Leather Trimmings',
      'Sludge',
      'Salt',
      'Waste Oil',
      'Admin Office Paper Waste',
      'General Waste'
    ],
    procedureForStoringWaste: {
      rawTrimming: 'Raw trimming and Fleshing is collected and stored in a covered shed for storage with sealed bags and sent to Leather Meals Production',
      wetBlueTrimming: 'Wet blue trimming and shaving dust is collected and stored in a covered shed with sealed bags for storage and sent to Leather board manufacture',
      wetBlueShavingDust: 'Wet blue trimming and shaving dust is collected and stored in a covered shed with sealed bags for storage and sent to Leather board manufacture Procedures and norms are set to reduce the trimmings and records are maintained Kgs per m2 which is checked with the disposal quantity and internal audits.',
      emptyChemicalBarrels: 'Accumulated washed follow 3R System.',
      emptyChemicalBags: 'Accumulated and disposed to warehouse or used to store other wastes',
      crustLeatherTrimmings: 'Crust leather trimmings are stored in a shed to avoid getting wet and with sealed bags and meeting with free environment. The crust and finished leather trimmings are sent to small leather manufacturing industries to be made into watch straps or wallet parts etc.',
      buffingDust: 'Buffing dusts are stored in a shed to avoid getting wet and meeting with free environment with sealed bags. The Buffing dust sent to authorised cement manufacturing vendor.',
      finishedLeatherTrimmings: 'Finished leather trimmings are stored in a shed to avoid getting wet and meeting with free environment with sealed bags. The Finished leather trimmings are sent to small leather manufacturing industries to be made into watch straps or wallet parts etc.',
      filterPressSludge: 'Following all TNPCB norms for collection and Disposal to SLF with Form 10.',
      salt: 'Salt Generating from MEE evaporator is stored with closed shed to avoid wetting with free environment and accumulated Salt kept with inside the factory premises.',
      drainsSludges: 'Drains cleaned and safely disposed with a carrying trolly which is covered to avoid spillages.',
      generalWaste: 'Accumulated leaves used for composting and paper cups etc collected in bins and sent to municipal collection system.',
      adminOfficePaper: 'One side printed paper reused and then torn and disposed to municipality once both sides are used.'
    },
    rolesAndResponsibilities: [
      { type: 'Sludge', primaryResponsibility: '', location: 'ETP' },
      { type: 'Chemical Cans and Bags', primaryResponsibility: '', location: 'Chemical Store' },
      { type: 'Raw Trimming & Fleshing', primaryResponsibility: '', location: 'Dye House Backside' },
      { type: 'Crust/Finish Leather Trimming', primaryResponsibility: '', location: 'Dye House Backside' },
      { type: 'Shaving/ Trimming Dust', primaryResponsibility: '', location: 'Dye House Backside' },
      { type: 'Buffing Dust', primaryResponsibility: '', location: 'Buffing Hall' },
      { type: 'Metal Scraps', primaryResponsibility: '', location: 'Maintenance Backside' },
      { type: 'Salt', primaryResponsibility: '', location: 'MEE Plant Backside' },
      { type: 'Auto spray waste', primaryResponsibility: '', location: 'ETP' }
    ],
    formsDetails: [
      { formNumber: 'Form 1', usage: 'Application Form for apply for Authorisation under HWM Rules, 2016' },
      { formNumber: 'Form 2', usage: 'Form for grant or renewal of Authorisation by State Pollution Control Board' },
      { formNumber: 'Form 3', usage: 'Format for maintaining records of Hazardous and Other Wastes' },
      { formNumber: 'Form 4', usage: 'Form for filing Annual Returns' },
      { formNumber: 'Form 5', usage: 'Application for Import or Export of Hazardous and Other Waste for reuse or recycling or recovery or co-processing or utilisation' },
      { formNumber: 'Form 6', usage: 'Transboundary Movement - Movement Document' },
      { formNumber: 'Form 7', usage: 'Application form for ONE TIME Authorisation of Traders for Part-D of Schedule III, Waste.' },
      { formNumber: 'Form 8', usage: 'Labelling of Containers of Hazardous and Other Waste' },
      { formNumber: 'Form 9', usage: 'Transport Emergency (TREM) Card' },
      { formNumber: 'Form 10', usage: 'Manifest for Hazardous and Other Waste' },
      { formNumber: 'Form 11', usage: 'Format for Reporting Accident' }
    ]
  });

  const isAdmin = session?.user?.role === 'SUPER_ADMIN' || session?.user?.role === 'ADMIN';

  useEffect(() => {
    fetchDocumentContent();
  }, []);

  const fetchDocumentContent = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/organization/documents/content?documentName=WASTE MANAGEMENT');
      const data = await res.json();
      
      if (res.ok) {
        if (data.data?.migrationRequired) {
          setMigrationRequired(true);
        } else if (data.data?.content) {
          const loadedData = data.data.content.content || content;
          setContent(loadedData);
          setDocumentInfo({
            docNo: data.data.document.docNo || 'ESF-EMS-PRO-01',
            revDate: data.data.document.revDate || 'Rev.No-02/Date-20-01-2021',
            revisionNo: data.data.content.revisionNo,
            revisionDate: data.data.content.revisionDate
          });
        } else {
          setDocumentInfo({
            docNo: 'ESF-EMS-PRO-01',
            revDate: 'Rev.No-02/Date-20-01-2021',
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
          documentName: 'WASTE MANAGEMENT',
          content: updatedContent,
          changeDescription: `Updated ${sectionKey} section`
        })
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 503 && data.migrationRequired) {
          setMigrationRequired(true);
          throw new Error('Database migration required');
        }
        throw new Error(data.error || 'Failed to save changes');
      }

      setContent(updatedContent);
      if (data.data) {
        setDocumentInfo({
          ...documentInfo,
          revisionNo: data.data.revisionNo,
          revisionDate: data.data.revisionDate
        });
      }
      setToast({ type: 'success', message: 'Section updated successfully. Revision number incremented.' });
    } catch (error) {
      console.error('Error saving section:', error);
      setToast({ type: 'error', message: error.message || 'Failed to save changes' });
      throw error;
    }
  };

  const handleTableChange = (tableName, index, field, value) => {
    const updatedContent = {
      ...content,
      [tableName]: content[tableName].map((row, i) => 
        i === index ? { ...row, [field]: value } : row
      )
    };
    setContent(updatedContent);
  };

  const handleAddTableRow = (tableName, defaultRow) => {
    const updatedContent = {
      ...content,
      [tableName]: [...content[tableName], defaultRow]
    };
    setContent(updatedContent);
  };

  const handleDeleteTableRow = (tableName, index) => {
    if (content[tableName].length > 1) {
      const updatedContent = {
        ...content,
        [tableName]: content[tableName].filter((_, i) => i !== index)
      };
      setContent(updatedContent);
    }
  };

  const handleSaveAll = async () => {
    try {
      const res = await fetch('/api/organization/documents/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentName: 'WASTE MANAGEMENT',
          content: content,
          changeDescription: 'Updated waste management procedure'
        })
      });

      const data = await res.json();

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

      setToast({ type: 'success', message: 'Waste management procedure saved successfully. Revision number incremented.' });
    } catch (error) {
      console.error('Error saving procedure:', error);
      if (error.message && (
        error.message.includes('migration') ||
        error.message.includes('does not exist')
      )) {
        setMigrationRequired(true);
        setToast({ 
          type: 'error', 
          message: 'Database migration required. Please contact your administrator.' 
        });
      } else {
        setToast({ type: 'error', message: 'Failed to save changes. Please try again.' });
      }
    }
  };

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'organization', label: 'Organization', href: '/dashboard/organization' },
    { key: 'documents', label: 'Document Details', href: '/dashboard/organization/documents' },
    { key: 'waste-management', label: 'Waste Management Procedure', href: '#' },
  ];

  const handleNavigate = (index, item) => {
    if (item.href && item.href !== '#') router.push(item.href);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbs} onNavigate={handleNavigate} />
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading document...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbs} onNavigate={handleNavigate} />

      {migrationRequired && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Database Migration Required
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>This feature requires a database migration. Please contact your administrator.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Waste Management Procedure
            </h1>
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
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/organization/documents')}
          >
            Back to Documents
          </Button>
        </div>

        <div className="p-6 space-y-8">
          {/* Save Button */}
          {isAdmin && (
            <div className="flex justify-end">
              <Button
                onClick={handleSaveAll}
                className="px-6"
              >
                Save All Changes
              </Button>
            </div>
          )}

          {/* POLICY */}
          <EditableSection
            title="POLICY"
            content={content.policy}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="policy"
            contentType="list"
          />

          {/* Application (Rule 2) */}
          <EditableSection
            title="Application (Rule 2)"
            content={content.application}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="application"
            contentType="text"
          />

          {/* Definitions (Rule 3) */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 border-b-2 border-green-600 pb-2">
              Definitions (Rule 3)
            </h2>
            {Object.entries(content.definitions).map(([key, value]) => (
              <EditableSection
                key={key}
                title={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                content={value}
                onSave={(sectionKey, sectionContent) => {
                  handleSaveSection('definitions', {
                    ...content.definitions,
                    [key]: sectionContent
                  });
                }}
                canEdit={isAdmin}
                sectionKey={`definitions.${key}`}
                contentType="text"
              />
            ))}
          </div>

          {/* Responsibilities */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 border-b-2 border-green-600 pb-2">
              Responsibilities of the occupier for management
            </h2>
            <EditableSection
              title="Point 1"
              content={content.responsibilities.point1}
              onSave={(sectionKey, sectionContent) => {
                handleSaveSection('responsibilities', {
                  ...content.responsibilities,
                  point1: sectionContent
                });
              }}
              canEdit={isAdmin}
              sectionKey="responsibilities.point1"
              contentType="text"
            />
            <EditableSection
              title="Point 2"
              content={content.responsibilities.point2}
              onSave={(sectionKey, sectionContent) => {
                handleSaveSection('responsibilities', {
                  ...content.responsibilities,
                  point2: sectionContent
                });
              }}
              canEdit={isAdmin}
              sectionKey="responsibilities.point2"
              contentType="text"
            />
            <EditableSection
              title="Steps"
              content={content.responsibilities.steps}
              onSave={(sectionKey, sectionContent) => {
                handleSaveSection('responsibilities', {
                  ...content.responsibilities,
                  steps: sectionContent
                });
              }}
              canEdit={isAdmin}
              sectionKey="responsibilities.steps"
              contentType="list"
            />
            <EditableSection
              title="Point 3"
              content={content.responsibilities.point3}
              onSave={(sectionKey, sectionContent) => {
                handleSaveSection('responsibilities', {
                  ...content.responsibilities,
                  point3: sectionContent
                });
              }}
              canEdit={isAdmin}
              sectionKey="responsibilities.point3"
              contentType="text"
            />
          </div>

          {/* Rule 6 */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 border-b-2 border-green-600 pb-2">
              Grant of authorization for managing hazardous and other wastes (Rule 6)
            </h2>
            {Object.entries(content.rule6).map(([key, value]) => (
              <EditableSection
                key={key}
                title={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                content={value}
                onSave={(sectionKey, sectionContent) => {
                  handleSaveSection('rule6', {
                    ...content.rule6,
                    [key]: sectionContent
                  });
                }}
                canEdit={isAdmin}
                sectionKey={`rule6.${key}`}
                contentType="text"
              />
            ))}
          </div>

          {/* Rule 8 */}
          <EditableSection
            title="Storage of Hazardous and other wastes (Rule 8)"
            content={content.rule8}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="rule8"
            contentType="text"
          />

          {/* Rule 9 */}
          <EditableSection
            title="Utilisation of Hazardous and other wastes (Rule 9)"
            content={content.rule9}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="rule9"
            contentType="text"
          />

          {/* Rule 16 */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 border-b-2 border-green-600 pb-2">
              Treatment, Storage, and disposal facility for hazardous and other wastes (Rule 16)
            </h2>
            {Object.entries(content.rule16).map(([key, value]) => (
              <EditableSection
                key={key}
                title={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                content={value}
                onSave={(sectionKey, sectionContent) => {
                  handleSaveSection('rule16', {
                    ...content.rule16,
                    [key]: sectionContent
                  });
                }}
                canEdit={isAdmin}
                sectionKey={`rule16.${key}`}
                contentType="text"
              />
            ))}
          </div>

          {/* Rule 17 */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 border-b-2 border-green-600 pb-2">
              Packing and Labelling (Rule 17)
            </h2>
            <EditableSection
              title="Description"
              content={content.rule17.description}
              onSave={(sectionKey, sectionContent) => {
                handleSaveSection('rule17', {
                  ...content.rule17,
                  description: sectionContent
                });
              }}
              canEdit={isAdmin}
              sectionKey="rule17.description"
              contentType="text"
            />
            <EditableSection
              title="Labelling"
              content={content.rule17.labelling}
              onSave={(sectionKey, sectionContent) => {
                handleSaveSection('rule17', {
                  ...content.rule17,
                  labelling: sectionContent
                });
              }}
              canEdit={isAdmin}
              sectionKey="rule17.labelling"
              contentType="text"
            />
          </div>

          {/* Rule 18 */}
          <EditableSection
            title="Transportation of hazardous and other wastes (Rule 18)"
            content={content.rule18}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="rule18"
            contentType="text"
          />

          {/* Rule 19 */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 border-b-2 border-green-600 pb-2">
              Manifest System (Rule 19)
            </h2>
            <EditableSection
              title="Manifest"
              content={content.rule19.manifest}
              onSave={(sectionKey, sectionContent) => {
                handleSaveSection('rule19', {
                  ...content.rule19,
                  manifest: sectionContent
                });
              }}
              canEdit={isAdmin}
              sectionKey="rule19.manifest"
              contentType="text"
            />
            <EditableSection
              title="No Objection Certificate"
              content={content.rule19.noObjection}
              onSave={(sectionKey, sectionContent) => {
                handleSaveSection('rule19', {
                  ...content.rule19,
                  noObjection: sectionContent
                });
              }}
              canEdit={isAdmin}
              sectionKey="rule19.noObjection"
              contentType="text"
            />
          </div>

          {/* Rule 20 */}
          <EditableSection
            title="Records and Returns (Rule 20)"
            content={content.rule20}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="rule20"
            contentType="text"
          />

          {/* Rule 21 */}
          <EditableSection
            title="Responsibility of Authorities (Rule 21)"
            content={content.rule21}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="rule21"
            contentType="text"
          />

          {/* Rule 22 */}
          <EditableSection
            title="Accident Report (Rule 22)"
            content={content.rule22}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="rule22"
            contentType="text"
          />

          {/* Rule 23 */}
          <EditableSection
            title="Liability of occupier, importer or exporter and operator of a disposal (Rule 23)"
            content={content.rule23}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="rule23"
            contentType="text"
          />

          {/* Rule 24 */}
          <EditableSection
            title="Appeal (Rule 24)"
            content={content.rule24}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="rule24"
            contentType="text"
          />

          {/* Types of Wastes */}
          <EditableSection
            title="Types of Wastes"
            content={content.typesOfWastes}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="typesOfWastes"
            contentType="list"
          />

          {/* Procedure for Storing Waste */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 border-b-2 border-green-600 pb-2">
              Procedure for Storing Waste
            </h2>
            {Object.entries(content.procedureForStoringWaste).map(([key, value]) => (
              <EditableSection
                key={key}
                title={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                content={value}
                onSave={(sectionKey, sectionContent) => {
                  handleSaveSection('procedureForStoringWaste', {
                    ...content.procedureForStoringWaste,
                    [key]: sectionContent
                  });
                }}
                canEdit={isAdmin}
                sectionKey={`procedureForStoringWaste.${key}`}
                contentType="text"
              />
            ))}
          </div>

          {/* Roles and Responsibilities Table */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold text-gray-900 border-b-2 border-green-600 pb-2">
                Roles and Responsibilities of various wastes
              </h2>
              {isAdmin && (
                <Button
                  variant="outline"
                  onClick={() => handleAddTableRow('rolesAndResponsibilities', { type: '', primaryResponsibility: '', location: '' })}
                  className="px-4"
                >
                  + Add Row
                </Button>
              )}
            </div>
            <div className="overflow-x-auto border border-gray-300 rounded-md mt-4">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                      Type of Hazardous & Other Material (Waste)
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                      Primary Responsibility
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                      Location
                    </th>
                    {isAdmin && (
                      <th className="border border-gray-300 px-3 py-2 text-center text-xs font-semibold text-gray-700">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {content.rolesAndResponsibilities.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-2 py-1">
                        {isAdmin ? (
                          <Input
                            type="text"
                            value={row.type}
                            onChange={(e) => handleTableChange('rolesAndResponsibilities', index, 'type', e.target.value)}
                            className="w-full text-sm"
                          />
                        ) : (
                          <span className="text-sm">{row.type || '-'}</span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {isAdmin ? (
                          <Input
                            type="text"
                            value={row.primaryResponsibility}
                            onChange={(e) => handleTableChange('rolesAndResponsibilities', index, 'primaryResponsibility', e.target.value)}
                            className="w-full text-sm"
                          />
                        ) : (
                          <span className="text-sm">{row.primaryResponsibility || '-'}</span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {isAdmin ? (
                          <Input
                            type="text"
                            value={row.location}
                            onChange={(e) => handleTableChange('rolesAndResponsibilities', index, 'location', e.target.value)}
                            className="w-full text-sm"
                          />
                        ) : (
                          <span className="text-sm">{row.location || '-'}</span>
                        )}
                      </td>
                      {isAdmin && (
                        <td className="border border-gray-300 px-2 py-1 text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteTableRow('rolesAndResponsibilities', index)}
                            disabled={content.rolesAndResponsibilities.length === 1}
                            className="text-red-600 hover:text-red-700"
                          >
                            Delete
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Forms and their Details Table */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold text-gray-900 border-b-2 border-green-600 pb-2">
                Forms and their Details
              </h2>
              {isAdmin && (
                <Button
                  variant="outline"
                  onClick={() => handleAddTableRow('formsDetails', { formNumber: '', usage: '' })}
                  className="px-4"
                >
                  + Add Row
                </Button>
              )}
            </div>
            <div className="overflow-x-auto border border-gray-300 rounded-md mt-4">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                      Form Number
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                      Their Usage
                    </th>
                    {isAdmin && (
                      <th className="border border-gray-300 px-3 py-2 text-center text-xs font-semibold text-gray-700">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {content.formsDetails.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-2 py-1">
                        {isAdmin ? (
                          <Input
                            type="text"
                            value={row.formNumber}
                            onChange={(e) => handleTableChange('formsDetails', index, 'formNumber', e.target.value)}
                            className="w-full text-sm"
                          />
                        ) : (
                          <span className="text-sm">{row.formNumber || '-'}</span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {isAdmin ? (
                          <Input
                            type="text"
                            value={row.usage}
                            onChange={(e) => handleTableChange('formsDetails', index, 'usage', e.target.value)}
                            className="w-full text-sm"
                          />
                        ) : (
                          <span className="text-sm">{row.usage || '-'}</span>
                        )}
                      </td>
                      {isAdmin && (
                        <td className="border border-gray-300 px-2 py-1 text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteTableRow('formsDetails', index)}
                            disabled={content.formsDetails.length === 1}
                            className="text-red-600 hover:text-red-700"
                          >
                            Delete
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


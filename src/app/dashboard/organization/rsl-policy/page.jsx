'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { Input } from '@/components/ui/Input';
import EditableSection from '@/components/documents/EditableSection';

export default function RSLPolicyPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [documentInfo, setDocumentInfo] = useState(null);
  const [migrationRequired, setMigrationRequired] = useState(false);
  
  // RSL Policy data structure
  const [content, setContent] = useState({
    documentTitle: 'RESTRICTED SUBSTANCE POLICY',
    documentId: 'ESF-RSL-PRO-01',
    versionNo: '3',
    date: '10/16/2023',
    preparedBy: 'Management Representative',
    approvedBy: 'Managing Partner',
    preparedDate: '10/18/2023',
    approvedDate: '10/20/2023',
    commitment: 'We are committed to sustainable business practices and pursuit of continual improvement ensuring compliance with customer requirements. The tannery will check with customers at the beginning of each season or once in 6 months for any change in RSL leather specifications. The company will select suppliers of chemicals to meet the RSL specifications. Suppliers of input material (Semi finished leather) are expected to give test reports and declare the material meets the minimum set requirements before supplying.',
    reviewStatement: 'The tannery will review its restricted substances once in 6 months.',
    batchwiseTesting: 'Batchwise testing will be done depending on customer requirements / LWG requirements. For all RSL Specifications and for Cr6 with aging will be tested according to the latest LWG requirements.',
    communication: 'The Policy and Specification will be communicated to all existing and new Suppliers (Input material and Chemicals), when changes are made to the policy and specifications informal and formal communication by Hardcopy or e-mail will be sent out within two months from the revision date. MRSL and RSL requirements will be communicated with customers and chemical suppliers',
    supplierRequirements: 'If a new chemical is substituted or a new process is introduced, the supplier of chemicals is expected to declare the chemical at the time of supply, risk analysis will be done, if risk seems high the product line will be tested after approval from management. All chemical suppliers are expected to declare REACH declaration, Tannery RSL specifications and all Materials Safety Data Sheets (MSDS) for the safe handling of their products.',
    vendorRequirements: 'Similarly, if semi-finished leather is procured from a new vendor the vendor is expected to give a formal declaration along with a leather test report. If the supplier is unable to provide a test report, then ESF Leather will do the testing in its approved labs.',
    approvedLaboratories: 'certified laboratories will be used for testing leather. Testing is done at least One time per year for at least 3 major articles and articles that constitute more than 50% of the total annual output, for conformance to the restricted substances limits set out in Annexure 1a. If a customer requires its purchases from ESF LEATHER to conform to more stringent limits for certain product lines, additional restricted substances testing will be done for those product lines for those customers. If a product line does not meet customer requirements, the tanning process will be further improved to meet the requirements or will be discontinued/suspended if they fail to meet the customer The tannery will review its restricted substances once in 6 months.',
    chemicalProperties: [
      {
        slNo: 1,
        property: 'Chrome 6 with aging',
        testMethod: 'ISO 10195:2018, ISO 17075-1:2017 Analysis using UV/VIS Spectrometry',
        requirement: '<3 PPM'
      },
      {
        slNo: 2,
        property: 'Formaldehyde',
        testMethod: 'EN ISO 17226-1:2021',
        requirement: '< 75 PPM'
      },
      {
        slNo: 3,
        property: 'Short Chain Chlorinated paraffins SCCP (C10-C13)',
        testMethod: 'ISO 18219-1:2021',
        requirement: '<1000 PPM'
      },
      {
        slNo: 4,
        property: 'Alkyl phenol (AP)',
        testMethod: 'ISO 18218-1:2015',
        requirement: '<100MG/KG'
      },
      {
        slNo: 5,
        property: 'Alkyl phenol ethoxylate (APEQ)',
        testMethod: 'ISO 18218-1:2015',
        requirement: '<100MG/KG'
      },
      {
        slNo: 6,
        property: 'Dimethyl fumarate (DMF)',
        testMethod: 'ISO/TS 16186 Analysis by GCMS',
        requirement: '<0.1 PPM'
      },
      {
        slNo: 7,
        property: 'Azo dyestuffs',
        testMethod: 'ISO 17234:-1:2015',
        requirement: '< 20 PPM'
      }
    ],
    heavyMetals: [
      {
        slNo: 1,
        property: 'Antimony (extractable)',
        testMethod: '',
        requirement: '< 30'
      },
      {
        slNo: 2,
        property: 'Arsenic (extractable)',
        testMethod: '',
        requirement: '< 0.2'
      },
      {
        slNo: 3,
        property: 'Barium (extractable)',
        testMethod: '',
        requirement: '< 1000'
      },
      {
        slNo: 4,
        property: 'Extractable cadmium',
        testMethod: '',
        requirement: '< 0.1'
      },
      {
        slNo: 5,
        property: 'Cobalt extractable',
        testMethod: 'DIN EN ISO 17072-1:2017 / Analysis by ICP - MS',
        requirement: '< 4'
      },
      {
        slNo: 6,
        property: 'Copper extractable',
        testMethod: 'DIN EN ISO 17072-1:2017 / Analysis by ICP - MS',
        requirement: '< 50'
      },
      {
        slNo: 7,
        property: 'Lead extractable',
        testMethod: '',
        requirement: '< 1'
      },
      {
        slNo: 8,
        property: 'Mercury extractable',
        testMethod: '',
        requirement: '< 0.02'
      },
      {
        slNo: 9,
        property: 'Nickel',
        testMethod: '',
        requirement: '< 1'
      },
      {
        slNo: 10,
        property: 'Selenium',
        testMethod: '',
        requirement: '< 500'
      }
    ]
  });

  const isAdmin = session?.user?.role === 'SUPER_ADMIN' || session?.user?.role === 'ADMIN';

  useEffect(() => {
    fetchDocumentContent();
  }, []);

  const fetchDocumentContent = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/organization/documents/content?documentName=RSL POLICY');
      const data = await res.json();
      
      if (res.ok) {
        if (data.data?.migrationRequired) {
          setMigrationRequired(true);
        } else if (data.data?.content) {
          const loadedData = data.data.content.content || content;
          // Ensure arrays are initialized
          if (!loadedData.chemicalProperties || !Array.isArray(loadedData.chemicalProperties)) {
            loadedData.chemicalProperties = content.chemicalProperties;
          }
          if (!loadedData.heavyMetals || !Array.isArray(loadedData.heavyMetals)) {
            loadedData.heavyMetals = content.heavyMetals;
          }
          setContent(loadedData);
          setDocumentInfo({
            docNo: data.data.document.docNo || 'ESF-RSL-PRO-01',
            revDate: data.data.document.revDate || 'Rev.No-01/Date-21-01-2026',
            revisionNo: data.data.content.revisionNo,
            revisionDate: data.data.content.revisionDate
          });
        } else {
          setDocumentInfo({
            docNo: 'ESF-RSL-PRO-01',
            revDate: 'Rev.No-01/Date-21-01-2026',
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

  const handleTableChange = (tableName, index, field, value) => {
    const updatedContent = {
      ...content,
      [tableName]: content[tableName].map((record, i) => 
        i === index ? { ...record, [field]: value } : record
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
      const updatedRecords = content[tableName].filter((_, i) => i !== index);
      // Re-number the serial numbers
      const renumberedRecords = updatedRecords.map((record, i) => ({
        ...record,
        slNo: i + 1
      }));
      setContent({
        ...content,
        [tableName]: renumberedRecords
      });
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
          documentName: 'RSL POLICY',
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

  const handleSaveAll = async () => {
    try {
      const res = await fetch('/api/organization/documents/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentName: 'RSL POLICY',
          content: content,
          changeDescription: 'Updated RSL Policy'
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

      setToast({ type: 'success', message: 'RSL Policy saved successfully. Revision number incremented.' });
    } catch (error) {
      console.error('Error saving policy:', error);
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
    { key: 'rsl-policy', label: 'RSL Policy', href: '#' },
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
              Restricted Substances Policy
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

          {/* Document Details */}
          <div className="grid grid-cols-3 gap-4 border border-gray-300 rounded-md p-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Document No</label>
              {isAdmin ? (
                <Input
                  type="text"
                  value={content.documentId}
                  onChange={(e) => setContent({ ...content, documentId: e.target.value })}
                  className="w-full"
                />
              ) : (
                <p className="text-sm text-gray-900">{content.documentId}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Version No</label>
              {isAdmin ? (
                <Input
                  type="text"
                  value={content.versionNo}
                  onChange={(e) => setContent({ ...content, versionNo: e.target.value })}
                  className="w-full"
                />
              ) : (
                <p className="text-sm text-gray-900">{content.versionNo}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              {isAdmin ? (
                <Input
                  type="text"
                  value={content.date}
                  onChange={(e) => setContent({ ...content, date: e.target.value })}
                  className="w-full"
                />
              ) : (
                <p className="text-sm text-gray-900">{content.date}</p>
              )}
            </div>
          </div>

          {/* Approval Section */}
          <div className="border border-gray-300 rounded-md p-4">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prepared & Issue By</label>
                {isAdmin ? (
                  <Input
                    type="text"
                    value={content.preparedBy}
                    onChange={(e) => setContent({ ...content, preparedBy: e.target.value })}
                    className="w-full mb-2"
                  />
                ) : (
                  <p className="text-sm text-gray-900 mb-2">{content.preparedBy}</p>
                )}
                {isAdmin ? (
                  <Input
                    type="text"
                    value={content.preparedDate}
                    onChange={(e) => setContent({ ...content, preparedDate: e.target.value })}
                    className="w-full"
                    placeholder="Date"
                  />
                ) : (
                  <p className="text-sm text-gray-900">{content.preparedDate}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Approved By</label>
                {isAdmin ? (
                  <Input
                    type="text"
                    value={content.approvedBy}
                    onChange={(e) => setContent({ ...content, approvedBy: e.target.value })}
                    className="w-full mb-2"
                  />
                ) : (
                  <p className="text-sm text-gray-900 mb-2">{content.approvedBy}</p>
                )}
                {isAdmin ? (
                  <Input
                    type="text"
                    value={content.approvedDate}
                    onChange={(e) => setContent({ ...content, approvedDate: e.target.value })}
                    className="w-full"
                    placeholder="Date"
                  />
                ) : (
                  <p className="text-sm text-gray-900">{content.approvedDate}</p>
                )}
              </div>
            </div>
          </div>

          {/* 9.1.A: ESF LEATHER: our commitment */}
          <EditableSection
            title="9.1.A: ESF LEATHER: our commitment"
            content={content.commitment}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="commitment"
            contentType="text"
          />

          {/* Review Statement */}
          <EditableSection
            title="Review Statement"
            content={content.reviewStatement}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="reviewStatement"
            contentType="text"
          />

          {/* Batchwise Testing */}
          <EditableSection
            title="Batchwise Testing"
            content={content.batchwiseTesting}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="batchwiseTesting"
            contentType="text"
          />

          {/* 9.1.C: Approved Laboratories */}
          <EditableSection
            title="9.1.C: ESF LEATHER: Approved Laboratories and testing frequency"
            content={content.approvedLaboratories}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="approvedLaboratories"
            contentType="text"
          />

          {/* 9.1.D, E: Communication */}
          <EditableSection
            title="9.1.D, E: ESF Leather Communication"
            content={content.communication}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="communication"
            contentType="text"
          />

          {/* 9.1.F, G: Supplier Requirements */}
          <EditableSection
            title="9.1.F, G: ESF Leather RSL Control requirements on suppliers and Recipe changes"
            content={content.supplierRequirements}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="supplierRequirements"
            contentType="text"
          />

          {/* Vendor Requirements */}
          <EditableSection
            title="Vendor Requirements"
            content={content.vendorRequirements}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="vendorRequirements"
            contentType="text"
          />

          {/* Chemical Properties Table */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold text-gray-900 border-b-2 border-green-600 pb-2">
                Chemical Properties
              </h2>
              {isAdmin && (
                <Button
                  variant="outline"
                  onClick={() => handleAddTableRow('chemicalProperties', {
                    slNo: content.chemicalProperties.length + 1,
                    property: '',
                    testMethod: '',
                    requirement: ''
                  })}
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
                    <th className="border border-gray-300 px-3 py-2 text-center text-xs font-semibold text-gray-700 min-w-[60px]">
                      S.no
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700 min-w-[250px]">
                      property
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700 min-w-[300px]">
                      Test Method
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700 min-w-[150px]">
                      Requirement Of ESF LEATHER
                    </th>
                    {isAdmin && (
                      <th className="border border-gray-300 px-3 py-2 text-center text-xs font-semibold text-gray-700 min-w-[80px]">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {content.chemicalProperties.map((record, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-3 py-2 text-center text-sm text-gray-900">
                        {record.slNo}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {isAdmin ? (
                          <Input
                            type="text"
                            value={record.property}
                            onChange={(e) => handleTableChange('chemicalProperties', index, 'property', e.target.value)}
                            className="w-full text-sm"
                          />
                        ) : (
                          <span className="text-sm text-gray-700">{record.property || '-'}</span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {isAdmin ? (
                          <Input
                            type="text"
                            value={record.testMethod}
                            onChange={(e) => handleTableChange('chemicalProperties', index, 'testMethod', e.target.value)}
                            className="w-full text-sm"
                          />
                        ) : (
                          <span className="text-sm text-gray-700">{record.testMethod || '-'}</span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {isAdmin ? (
                          <Input
                            type="text"
                            value={record.requirement}
                            onChange={(e) => handleTableChange('chemicalProperties', index, 'requirement', e.target.value)}
                            className="w-full text-sm"
                          />
                        ) : (
                          <span className="text-sm text-gray-700">{record.requirement || '-'}</span>
                        )}
                      </td>
                      {isAdmin && (
                        <td className="border border-gray-300 px-2 py-1 text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteTableRow('chemicalProperties', index)}
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

          {/* Heavy Metals Table */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold text-gray-900 border-b-2 border-green-600 pb-2">
                Heavy Metals RSL limits and RSL requirements
              </h2>
              {isAdmin && (
                <Button
                  variant="outline"
                  onClick={() => handleAddTableRow('heavyMetals', {
                    slNo: content.heavyMetals.length + 1,
                    property: '',
                    testMethod: '',
                    requirement: ''
                  })}
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
                    <th className="border border-gray-300 px-3 py-2 text-center text-xs font-semibold text-gray-700 min-w-[60px]">
                      S.no
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700 min-w-[250px]">
                      property
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700 min-w-[300px]">
                      Test Method
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700 min-w-[150px]">
                      Requirement Of ESF LEATHER
                    </th>
                    {isAdmin && (
                      <th className="border border-gray-300 px-3 py-2 text-center text-xs font-semibold text-gray-700 min-w-[80px]">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {content.heavyMetals.map((record, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-3 py-2 text-center text-sm text-gray-900">
                        {record.slNo}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {isAdmin ? (
                          <Input
                            type="text"
                            value={record.property}
                            onChange={(e) => handleTableChange('heavyMetals', index, 'property', e.target.value)}
                            className="w-full text-sm"
                          />
                        ) : (
                          <span className="text-sm text-gray-700">{record.property || '-'}</span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {isAdmin ? (
                          <Input
                            type="text"
                            value={record.testMethod}
                            onChange={(e) => handleTableChange('heavyMetals', index, 'testMethod', e.target.value)}
                            className="w-full text-sm"
                          />
                        ) : (
                          <span className="text-sm text-gray-700">{record.testMethod || '-'}</span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {isAdmin ? (
                          <Input
                            type="text"
                            value={record.requirement}
                            onChange={(e) => handleTableChange('heavyMetals', index, 'requirement', e.target.value)}
                            className="w-full text-sm"
                          />
                        ) : (
                          <span className="text-sm text-gray-700">{record.requirement || '-'}</span>
                        )}
                      </td>
                      {isAdmin && (
                        <td className="border border-gray-300 px-2 py-1 text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteTableRow('heavyMetals', index)}
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


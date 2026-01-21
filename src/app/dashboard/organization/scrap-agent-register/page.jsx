'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { Input } from '@/components/ui/Input';
import EditableSection from '@/components/documents/EditableSection';

export default function ScrapAgentRegisterPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [documentInfo, setDocumentInfo] = useState(null);
  const [migrationRequired, setMigrationRequired] = useState(false);
  
  // Scrap Agent Register data structure
  const [content, setContent] = useState({
    documentTitle: 'ESF LEATHER CONSULTANCY',
    documentId: 'ESF-WM-SCR-0B',
    purpose: 'Identify Disposal Agents and Carriers that indicate that wastes are removed from the site and disposed of in a suitable and legal manner',
    subHeading: 'Names of Vendors who take the Scraps from tannery',
    scrapRecords: [
      {
        slNo: 1,
        scrap: 'Empty Chemical Barrels',
        disposalAgentOrCarrier: '',
        companyRegistrationNumber: '',
        permitNumber: '',
        permitExpiry: '',
        letterFromAgent: ''
      },
      {
        slNo: 2,
        scrap: 'Empty Chemical Bags',
        disposalAgentOrCarrier: '',
        companyRegistrationNumber: '',
        permitNumber: '',
        permitExpiry: '',
        letterFromAgent: ''
      },
      {
        slNo: 3,
        scrap: 'Raw Hide Fleshings',
        disposalAgentOrCarrier: '',
        companyRegistrationNumber: '',
        permitNumber: '',
        permitExpiry: '',
        letterFromAgent: ''
      },
      {
        slNo: 4,
        scrap: 'Raw Hide Trimmings',
        disposalAgentOrCarrier: '',
        companyRegistrationNumber: '',
        permitNumber: '',
        permitExpiry: '',
        letterFromAgent: ''
      },
      {
        slNo: 5,
        scrap: 'Buffing Dust',
        disposalAgentOrCarrier: '',
        companyRegistrationNumber: '',
        permitNumber: '',
        permitExpiry: '',
        letterFromAgent: ''
      },
      {
        slNo: 6,
        scrap: 'Lime Hide Fleshing',
        disposalAgentOrCarrier: '',
        companyRegistrationNumber: '',
        permitNumber: '',
        permitExpiry: '',
        letterFromAgent: ''
      },
      {
        slNo: 7,
        scrap: 'Lime Hide Splits & Trimmings',
        disposalAgentOrCarrier: '',
        companyRegistrationNumber: '',
        permitNumber: '',
        permitExpiry: '',
        letterFromAgent: ''
      },
      {
        slNo: 8,
        scrap: 'Hair',
        disposalAgentOrCarrier: '',
        companyRegistrationNumber: '',
        permitNumber: '',
        permitExpiry: '',
        letterFromAgent: ''
      },
      {
        slNo: 9,
        scrap: 'Wet Blue Trimmings',
        disposalAgentOrCarrier: '',
        companyRegistrationNumber: '',
        permitNumber: '',
        permitExpiry: '',
        letterFromAgent: ''
      },
      {
        slNo: 10,
        scrap: 'Crust Trimmings',
        disposalAgentOrCarrier: '',
        companyRegistrationNumber: '',
        permitNumber: '',
        permitExpiry: '',
        letterFromAgent: ''
      },
      {
        slNo: 11,
        scrap: 'WWTP Salt',
        disposalAgentOrCarrier: '',
        companyRegistrationNumber: '',
        permitNumber: '',
        permitExpiry: '',
        letterFromAgent: ''
      },
      {
        slNo: 12,
        scrap: 'Finishing Wastes',
        disposalAgentOrCarrier: '',
        companyRegistrationNumber: '',
        permitNumber: '',
        permitExpiry: '',
        letterFromAgent: ''
      },
      {
        slNo: 13,
        scrap: 'Waste Oil',
        disposalAgentOrCarrier: '',
        companyRegistrationNumber: '',
        permitNumber: '',
        permitExpiry: '',
        letterFromAgent: ''
      },
      {
        slNo: 14,
        scrap: 'ETP Sludge',
        disposalAgentOrCarrier: '',
        companyRegistrationNumber: '',
        permitNumber: '',
        permitExpiry: '',
        letterFromAgent: ''
      },
      {
        slNo: 15,
        scrap: 'Batteries',
        disposalAgentOrCarrier: '',
        companyRegistrationNumber: '',
        permitNumber: '',
        permitExpiry: '',
        letterFromAgent: ''
      },
      {
        slNo: 16,
        scrap: 'Lights',
        disposalAgentOrCarrier: '',
        companyRegistrationNumber: '',
        permitNumber: '',
        permitExpiry: '',
        letterFromAgent: ''
      },
      {
        slNo: 17,
        scrap: 'Pallets',
        disposalAgentOrCarrier: '',
        companyRegistrationNumber: '',
        permitNumber: '',
        permitExpiry: '',
        letterFromAgent: ''
      },
      {
        slNo: 18,
        scrap: 'Metal Containers',
        disposalAgentOrCarrier: '',
        companyRegistrationNumber: '',
        permitNumber: '',
        permitExpiry: '',
        letterFromAgent: ''
      },
      {
        slNo: 19,
        scrap: 'Paper Waste',
        disposalAgentOrCarrier: '',
        companyRegistrationNumber: '',
        permitNumber: '',
        permitExpiry: '',
        letterFromAgent: ''
      },
      {
        slNo: 20,
        scrap: 'Food Waste',
        disposalAgentOrCarrier: '',
        companyRegistrationNumber: '',
        permitNumber: '',
        permitExpiry: '',
        letterFromAgent: ''
      },
      {
        slNo: 21,
        scrap: 'Others',
        disposalAgentOrCarrier: '',
        companyRegistrationNumber: '',
        permitNumber: '',
        permitExpiry: '',
        letterFromAgent: ''
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
      const res = await fetch('/api/organization/documents/content?documentName=SCRAP AGENT REGISTER');
      const data = await res.json();
      
      if (res.ok) {
        if (data.data?.migrationRequired) {
          setMigrationRequired(true);
        } else if (data.data?.content) {
          const loadedData = data.data.content.content || content;
          // Ensure scrapRecords is an array
          if (!loadedData.scrapRecords || !Array.isArray(loadedData.scrapRecords)) {
            loadedData.scrapRecords = content.scrapRecords;
          }
          setContent(loadedData);
          setDocumentInfo({
            docNo: data.data.document.docNo || 'ESF-WM-SCR-0B',
            revDate: data.data.document.revDate || 'Rev.No-01/Date-21-01-2026',
            revisionNo: data.data.content.revisionNo,
            revisionDate: data.data.content.revisionDate
          });
        } else {
          setDocumentInfo({
            docNo: 'ESF-WM-SCR-0B',
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

  const handleTableChange = (index, field, value) => {
    const updatedContent = {
      ...content,
      scrapRecords: content.scrapRecords.map((record, i) => 
        i === index ? { ...record, [field]: value } : record
      )
    };
    setContent(updatedContent);
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
          documentName: 'SCRAP AGENT REGISTER',
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

  const handleAddRow = () => {
    const newSlNo = content.scrapRecords.length > 0 
      ? Math.max(...content.scrapRecords.map(r => r.slNo)) + 1 
      : 1;
    
    const newRecord = {
      slNo: newSlNo,
      scrap: '',
      disposalAgentOrCarrier: '',
      companyRegistrationNumber: '',
      permitNumber: '',
      permitExpiry: '',
      letterFromAgent: ''
    };

    setContent({
      ...content,
      scrapRecords: [...content.scrapRecords, newRecord]
    });
  };

  const handleDeleteRow = (index) => {
    if (content.scrapRecords.length > 1) {
      const updatedRecords = content.scrapRecords.filter((_, i) => i !== index);
      // Re-number the serial numbers
      const renumberedRecords = updatedRecords.map((record, i) => ({
        ...record,
        slNo: i + 1
      }));
      setContent({
        ...content,
        scrapRecords: renumberedRecords
      });
    }
  };

  const handleSaveAll = async () => {
    try {
      const res = await fetch('/api/organization/documents/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentName: 'SCRAP AGENT REGISTER',
          content: content,
          changeDescription: 'Updated scrap agent register'
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

      setToast({ type: 'success', message: 'Scrap agent register saved successfully. Revision number incremented.' });
    } catch (error) {
      console.error('Error saving register:', error);
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
    { key: 'scrap-agent-register', label: 'Scrap Agent Register', href: '#' },
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
              Scrap Agent Register
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

        <div className="p-6 space-y-6">
          {/* Document Title and ID */}
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{content.documentTitle || 'ESF LEATHER CONSULTANCY'}</h2>
              <p className="text-sm text-gray-600">Document ID: {content.documentId || 'ESF-WM-SCR-0B'}</p>
            </div>
            {isAdmin && (
              <Button
                onClick={handleSaveAll}
                className="px-6"
              >
                Save All Changes
              </Button>
            )}
          </div>

          {/* Purpose Statement */}
          <div className="mb-4 space-y-3">
            <div className="text-center">
              <EditableSection
                title=""
                content={content.purpose || 'Identify Disposal Agents and Carriers that indicate that wastes are removed from the site and disposed of in a suitable and legal manner'}
                onSave={handleSaveSection}
                canEdit={isAdmin}
                sectionKey="purpose"
                contentType="text"
              />
            </div>
            <div className="text-center">
              <EditableSection
                title=""
                content={content.subHeading || 'Names of Vendors who take the Scraps from tannery'}
                onSave={handleSaveSection}
                canEdit={isAdmin}
                sectionKey="subHeading"
                contentType="text"
              />
            </div>
          </div>

          {/* Scrap Agent Register Table */}
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden border border-gray-300 rounded-md">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border border-gray-300 px-3 py-2 text-center text-xs font-semibold text-gray-700 min-w-[60px]">
                        Sl. No
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700 min-w-[180px]">
                        Scrap
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700 min-w-[200px]">
                        Disposal agent or carrier
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700 min-w-[180px]">
                        Company registration number
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700 min-w-[150px]">
                        Permit number
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700 min-w-[120px]">
                        Permit expiry
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700 min-w-[200px]">
                        Letter from Agent stating its end use
                      </th>
                      {isAdmin && (
                        <th className="border border-gray-300 px-3 py-2 text-center text-xs font-semibold text-gray-700 min-w-[80px]">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {content.scrapRecords.map((record, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-3 py-2 text-center text-sm text-gray-900">
                          {record.slNo}
                        </td>
                        <td className="border border-gray-300 px-2 py-1">
                          {isAdmin ? (
                            <Input
                              type="text"
                              value={record.scrap}
                              onChange={(e) => handleTableChange(index, 'scrap', e.target.value)}
                              className="w-full text-sm"
                              placeholder="Enter scrap type"
                            />
                          ) : (
                            <span className="text-sm text-gray-700">{record.scrap || '-'}</span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-1">
                          {isAdmin ? (
                            <Input
                              type="text"
                              value={record.disposalAgentOrCarrier}
                              onChange={(e) => handleTableChange(index, 'disposalAgentOrCarrier', e.target.value)}
                              className="w-full text-sm"
                              placeholder="Enter disposal agent or carrier"
                            />
                          ) : (
                            <span className="text-sm text-gray-700">{record.disposalAgentOrCarrier || '-'}</span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-1">
                          {isAdmin ? (
                            <Input
                              type="text"
                              value={record.companyRegistrationNumber}
                              onChange={(e) => handleTableChange(index, 'companyRegistrationNumber', e.target.value)}
                              className="w-full text-sm"
                              placeholder="Enter company registration number"
                            />
                          ) : (
                            <span className="text-sm text-gray-700">{record.companyRegistrationNumber || '-'}</span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-1">
                          {isAdmin ? (
                            <Input
                              type="text"
                              value={record.permitNumber}
                              onChange={(e) => handleTableChange(index, 'permitNumber', e.target.value)}
                              className="w-full text-sm"
                              placeholder="Enter permit number"
                            />
                          ) : (
                            <span className="text-sm text-gray-700">{record.permitNumber || '-'}</span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-1">
                          {isAdmin ? (
                            <Input
                              type="text"
                              value={record.permitExpiry}
                              onChange={(e) => handleTableChange(index, 'permitExpiry', e.target.value)}
                              className="w-full text-sm"
                              placeholder="Enter permit expiry date"
                            />
                          ) : (
                            <span className="text-sm text-gray-700">{record.permitExpiry || '-'}</span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-1">
                          {isAdmin ? (
                            <Input
                              type="text"
                              value={record.letterFromAgent}
                              onChange={(e) => handleTableChange(index, 'letterFromAgent', e.target.value)}
                              className="w-full text-sm"
                              placeholder="Enter letter details"
                            />
                          ) : (
                            <span className="text-sm text-gray-700">{record.letterFromAgent || '-'}</span>
                          )}
                        </td>
                        {isAdmin && (
                          <td className="border border-gray-300 px-2 py-1 text-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteRow(index)}
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

          {/* Add Row Button */}
          {isAdmin && (
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={handleAddRow}
                className="px-4"
              >
                + Add Row
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


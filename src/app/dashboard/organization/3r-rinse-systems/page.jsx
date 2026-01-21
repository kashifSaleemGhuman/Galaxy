'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { Input } from '@/components/ui/Input';
import EditableSection from '@/components/documents/EditableSection';

export default function ThreeRRinseSystemsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [documentInfo, setDocumentInfo] = useState(null);
  const [migrationRequired, setMigrationRequired] = useState(false);
  
  // 3(R) RINSE Systems data structure
  const [content, setContent] = useState({
    rinsingInstructions: 'All Chemical containers, liquid or solid must be rinsed 3 times before being discharged. A rinse should consist of minimal water being sloshed around the container. The first rinse should be collected as chemicals the second and third rinse can then go down the drain.',
    disposalInstructions: 'Ensure that plenty of water is used to flush the material down the drain. After the containers are rinsed they can be discharged appropriately as described below. All caps should be left off the discarded containers, containers should be labeled with "empty" labels (Provided at racks), and the chemical name should be crossed or blacked out prior to being discarded.',
    rinseRecords: [
      {
        date: '',
        containerType: '',
        chemicalName: '',
        firstRinseCollected: '',
        secondRinseDisposed: '',
        thirdRinseDisposed: '',
        disposedBy: '',
        remarks: ''
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
      const res = await fetch('/api/organization/documents/content?documentName=3R PROCEDURE');
      const data = await res.json();
      
      if (res.ok) {
        if (data.data?.migrationRequired) {
          setMigrationRequired(true);
        } else if (data.data?.content) {
          const loadedData = data.data.content.content || content;
          setContent(loadedData);
          setDocumentInfo({
            docNo: data.data.document.docNo || 'ESF-EMS-3R-01',
            revDate: data.data.document.revDate || 'Rev.No-01/Date-21-01-2026',
            revisionNo: data.data.content.revisionNo,
            revisionDate: data.data.content.revisionDate
          });
        } else {
          setDocumentInfo({
            docNo: 'ESF-EMS-3R-01',
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
          documentName: '3R PROCEDURE',
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
          documentName: '3R PROCEDURE',
          content: content,
          changeDescription: 'Updated 3R RINSE Systems procedure'
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

      setToast({ type: 'success', message: '3R RINSE Systems procedure saved successfully. Revision number incremented.' });
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
    { key: '3r-rinse', label: '3(R) RINSE Systems', href: '#' },
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
              3(R) RINSE Systems Disposal of Empty Chemical Containers
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

          {/* Rinsing Instructions */}
          <EditableSection
            title="Rinsing Instructions"
            content={content.rinsingInstructions}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="rinsingInstructions"
            contentType="text"
          />

          {/* Disposal Instructions */}
          <EditableSection
            title="Disposal Instructions"
            content={content.disposalInstructions}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="disposalInstructions"
            contentType="text"
          />

          {/* Rinse Records Table */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold text-gray-900 border-b-2 border-green-600 pb-2">
                3R Rinse Records
              </h2>
              {isAdmin && (
                <Button
                  variant="outline"
                  onClick={() => handleAddTableRow('rinseRecords', { 
                    date: '', 
                    containerType: '', 
                    chemicalName: '', 
                    firstRinseCollected: '', 
                    secondRinseDisposed: '', 
                    thirdRinseDisposed: '', 
                    disposedBy: '', 
                    remarks: '' 
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
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                      Date
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                      Container Type
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                      Chemical Name
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                      First Rinse Collected
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                      Second Rinse Disposed
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                      Third Rinse Disposed
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                      Disposed By
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                      Remarks
                    </th>
                    {isAdmin && (
                      <th className="border border-gray-300 px-3 py-2 text-center text-xs font-semibold text-gray-700">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {content.rinseRecords.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-2 py-1">
                        {isAdmin ? (
                          <Input
                            type="date"
                            value={row.date}
                            onChange={(e) => handleTableChange('rinseRecords', index, 'date', e.target.value)}
                            className="w-full text-sm"
                          />
                        ) : (
                          <span className="text-sm">{row.date || '-'}</span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {isAdmin ? (
                          <Input
                            type="text"
                            value={row.containerType}
                            onChange={(e) => handleTableChange('rinseRecords', index, 'containerType', e.target.value)}
                            className="w-full text-sm"
                            placeholder="e.g., Barrel, Can, Bag"
                          />
                        ) : (
                          <span className="text-sm">{row.containerType || '-'}</span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {isAdmin ? (
                          <Input
                            type="text"
                            value={row.chemicalName}
                            onChange={(e) => handleTableChange('rinseRecords', index, 'chemicalName', e.target.value)}
                            className="w-full text-sm"
                          />
                        ) : (
                          <span className="text-sm">{row.chemicalName || '-'}</span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {isAdmin ? (
                          <Input
                            type="text"
                            value={row.firstRinseCollected}
                            onChange={(e) => handleTableChange('rinseRecords', index, 'firstRinseCollected', e.target.value)}
                            className="w-full text-sm"
                            placeholder="Yes/No"
                          />
                        ) : (
                          <span className="text-sm">{row.firstRinseCollected || '-'}</span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {isAdmin ? (
                          <Input
                            type="text"
                            value={row.secondRinseDisposed}
                            onChange={(e) => handleTableChange('rinseRecords', index, 'secondRinseDisposed', e.target.value)}
                            className="w-full text-sm"
                            placeholder="Yes/No"
                          />
                        ) : (
                          <span className="text-sm">{row.secondRinseDisposed || '-'}</span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {isAdmin ? (
                          <Input
                            type="text"
                            value={row.thirdRinseDisposed}
                            onChange={(e) => handleTableChange('rinseRecords', index, 'thirdRinseDisposed', e.target.value)}
                            className="w-full text-sm"
                            placeholder="Yes/No"
                          />
                        ) : (
                          <span className="text-sm">{row.thirdRinseDisposed || '-'}</span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {isAdmin ? (
                          <Input
                            type="text"
                            value={row.disposedBy}
                            onChange={(e) => handleTableChange('rinseRecords', index, 'disposedBy', e.target.value)}
                            className="w-full text-sm"
                          />
                        ) : (
                          <span className="text-sm">{row.disposedBy || '-'}</span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {isAdmin ? (
                          <Input
                            type="text"
                            value={row.remarks}
                            onChange={(e) => handleTableChange('rinseRecords', index, 'remarks', e.target.value)}
                            className="w-full text-sm"
                          />
                        ) : (
                          <span className="text-sm">{row.remarks || '-'}</span>
                        )}
                      </td>
                      {isAdmin && (
                        <td className="border border-gray-300 px-2 py-1 text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteTableRow('rinseRecords', index)}
                            disabled={content.rinseRecords.length === 1}
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


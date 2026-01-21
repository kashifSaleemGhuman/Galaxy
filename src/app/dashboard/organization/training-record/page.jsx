'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { Input } from '@/components/ui/Input';

export default function TrainingRecordPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [documentInfo, setDocumentInfo] = useState(null);
  const [migrationRequired, setMigrationRequired] = useState(false);
  
  // Training record data structure
  const [trainingRecord, setTrainingRecord] = useState({
    trainingTitle: 'EMS Policy Awareness',
    trainerFaculty: 'Mr. Zain Akber (SLF Auditor, ISO 14001 Lead Auditor)',
    location: 'Safe Assembly Point',
    dateTiming: '',
    tableData: Array.from({ length: 31 }, (_, i) => ({
      slNo: i + 1,
      name: '',
      signature: '',
      trainingContents: i === 0 ? [
        '1. Introduction about company\'s environmental policy',
        '2. Different types of pollution minimization',
        '3. EMS Compliance',
        '4. Regarding pollution prevention and resource management',
        '5. Regarding conservation to reduce environmental impact',
        '6. Waste Management',
        '7. Contamination',
        '8. EMS Training',
        '9. Continual Improvement'
      ].join('\n') : ''
    }))
  });

  const isAdmin = session?.user?.role === 'SUPER_ADMIN' || session?.user?.role === 'ADMIN';

  useEffect(() => {
    fetchDocumentContent();
  }, []);

  const fetchDocumentContent = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/organization/documents/content?documentName=EMS → TRANNING RECORD');
      const data = await res.json();
      
      if (res.ok) {
        if (data.data?.migrationRequired) {
          setMigrationRequired(true);
        } else if (data.data?.content) {
          const loadedData = data.data.content.content || trainingRecord;
          // Ensure tableData array has 31 items
          if (loadedData.tableData && loadedData.tableData.length < 31) {
            const existingData = loadedData.tableData;
            const newTableData = Array.from({ length: 31 }, (_, i) => 
              existingData[i] || { slNo: i + 1, name: '', signature: '', trainingContents: '' }
            );
            loadedData.tableData = newTableData;
          } else if (!loadedData.tableData) {
            // Migrate old structure if needed
            if (loadedData.attendees) {
              const trainingContentsStr = (loadedData.trainingContents || []).join('\n');
              loadedData.tableData = Array.from({ length: 31 }, (_, i) => ({
                slNo: i + 1,
                name: loadedData.attendees[i]?.name || '',
                signature: loadedData.attendees[i]?.signature || '',
                trainingContents: i === 0 ? trainingContentsStr : ''
              }));
            } else {
              loadedData.tableData = Array.from({ length: 31 }, (_, i) => ({
                slNo: i + 1,
                name: '',
                signature: '',
                trainingContents: ''
              }));
            }
          }
          setTrainingRecord(loadedData);
          setDocumentInfo({
            docNo: data.data.document.docNo || 'ESF-EMS-TRR-09',
            revDate: data.data.document.revDate || 'Rev.No-01/Date-01-01-2024',
            revisionNo: data.data.content.revisionNo,
            revisionDate: data.data.content.revisionDate
          });
        } else {
          setDocumentInfo({
            docNo: 'ESF-EMS-TRR-09',
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

  const handleFieldChange = (field, value) => {
    setTrainingRecord({
      ...trainingRecord,
      [field]: value
    });
  };

  const handleTableDataChange = (index, field, value) => {
    setTrainingRecord({
      ...trainingRecord,
      tableData: trainingRecord.tableData.map((row, i) => 
        i === index ? { ...row, [field]: value } : row
      )
    });
  };

  const handleSave = async () => {
    try {
      const res = await fetch('/api/organization/documents/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentName: 'EMS → TRANNING RECORD',
          content: trainingRecord,
          changeDescription: 'Updated training record'
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

      setToast({ type: 'success', message: 'Training record saved successfully. Revision number incremented.' });
    } catch (error) {
      console.error('Error saving training record:', error);
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

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'organization', label: 'Organization', href: '/dashboard/organization' },
    { key: 'documents', label: 'Document Details', href: '/dashboard/organization/documents' },
    { key: 'training-record', label: 'Training Record', href: '#' },
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Training Record
              </h1>
              <p className="text-sm text-gray-600 mt-1">ESF-EMS-TRR-09 - Environmental Management System</p>
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

        <div className="p-6 space-y-6">
          {/* Training Information Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                TRAINING TITLE
              </label>
              {isAdmin ? (
                <Input
                  type="text"
                  value={trainingRecord.trainingTitle}
                  onChange={(e) => handleFieldChange('trainingTitle', e.target.value)}
                  className="w-full"
                />
              ) : (
                <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                  {trainingRecord.trainingTitle}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                TRAINER / FACULTY
              </label>
              {isAdmin ? (
                <Input
                  type="text"
                  value={trainingRecord.trainerFaculty}
                  onChange={(e) => handleFieldChange('trainerFaculty', e.target.value)}
                  className="w-full"
                />
              ) : (
                <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                  {trainingRecord.trainerFaculty}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                LOCATION
              </label>
              {isAdmin ? (
                <Input
                  type="text"
                  value={trainingRecord.location}
                  onChange={(e) => handleFieldChange('location', e.target.value)}
                  className="w-full"
                />
              ) : (
                <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                  {trainingRecord.location}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                DATE / TIMING
              </label>
              {isAdmin ? (
                <Input
                  type="text"
                  value={trainingRecord.dateTiming}
                  onChange={(e) => handleFieldChange('dateTiming', e.target.value)}
                  className="w-full"
                  placeholder="e.g., 5/10/2022"
                />
              ) : (
                <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                  {trainingRecord.dateTiming || '-'}
                </div>
              )}
            </div>
          </div>

          {/* Save Button */}
          {isAdmin && (
            <div className="flex justify-end">
              <Button
                onClick={handleSave}
                className="px-6"
              >
                Save
              </Button>
            </div>
          )}

          {/* Combined Table with 4 columns */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              TRAINING RECORD
            </label>
            <div className="overflow-x-auto border border-gray-300 rounded-md">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-center text-xs font-semibold text-gray-700">
                      SL. NO
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-xs font-semibold text-gray-700">
                      NAME
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-xs font-semibold text-gray-700">
                      SIGNATURE
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-xs font-semibold text-gray-700">
                      TRAINING CONTENTS
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {trainingRecord.tableData.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 text-center text-sm">
                        {row.slNo}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {isAdmin ? (
                          <Input
                            type="text"
                            value={row.name}
                            onChange={(e) => handleTableDataChange(index, 'name', e.target.value)}
                            className="w-full text-sm"
                            placeholder="Enter name"
                          />
                        ) : (
                          <span className="text-sm">{row.name || '-'}</span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {isAdmin ? (
                          <Input
                            type="text"
                            value={row.signature}
                            onChange={(e) => handleTableDataChange(index, 'signature', e.target.value)}
                            className="w-full text-sm"
                            placeholder="Enter signature"
                          />
                        ) : (
                          <span className="text-sm">{row.signature || '-'}</span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {isAdmin ? (
                          <textarea
                            value={row.trainingContents}
                            onChange={(e) => handleTableDataChange(index, 'trainingContents', e.target.value)}
                            className="w-full text-sm border border-gray-300 rounded px-2 py-1 min-h-[80px]"
                            placeholder="Enter training contents (one per line or numbered list)"
                            rows={4}
                          />
                        ) : (
                          <div className="text-sm whitespace-pre-wrap">{row.trainingContents || '-'}</div>
                        )}
                      </td>
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


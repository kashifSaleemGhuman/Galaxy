'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { Input } from '@/components/ui/Input';

export default function InternalAuditObservationSheetPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [documentInfo, setDocumentInfo] = useState(null);
  const [migrationRequired, setMigrationRequired] = useState(false);
  
  // Internal Audit Observation Sheet data structure
  const [observationData, setObservationData] = useState({
    auditDate: '',
    auditDepartment: 'Tanning + Retanning + Finishing + Chemical Godowns',
    auditTime: '',
    internalAuditorName: '',
    auditeeName: 'All Departments',
    tableData: [
      {
        sNo: 1,
        question: '',
        yesNo: '',
        responsiblePerson: '',
        targetDate: '',
        auditTime: ''
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
      const res = await fetch('/api/organization/documents/content?documentName=EMS → OBSERVATION SHEET INTERNAL AUDIT');
      const data = await res.json();
      
      if (res.ok) {
        if (data.data?.migrationRequired) {
          setMigrationRequired(true);
        } else if (data.data?.content) {
          const loadedData = data.data.content.content || observationData;
          // Ensure tableData exists and has at least one row
          if (!loadedData.tableData || loadedData.tableData.length === 0) {
            loadedData.tableData = [{
              sNo: 1,
              question: '',
              yesNo: '',
              responsiblePerson: '',
              targetDate: '',
              auditTime: ''
            }];
          }
          // Ensure sNo is set for all rows
          loadedData.tableData = loadedData.tableData.map((row, index) => ({
            ...row,
            sNo: row.sNo || index + 1
          }));
          setObservationData(loadedData);
          setDocumentInfo({
            docNo: data.data.document.docNo || 'ESF-EMS-IAR-12',
            revDate: data.data.document.revDate || 'Rev.No-01/Date-01-01-2024',
            revisionNo: data.data.content.revisionNo,
            revisionDate: data.data.content.revisionDate
          });
        } else {
          setDocumentInfo({
            docNo: 'ESF-EMS-IAR-12',
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
    setObservationData({
      ...observationData,
      [field]: value
    });
  };

  const handleTableDataChange = (index, field, value) => {
    setObservationData({
      ...observationData,
      tableData: observationData.tableData.map((row, i) => 
        i === index ? { ...row, [field]: value } : row
      )
    });
  };

  const handleAddRow = () => {
    setObservationData({
      ...observationData,
      tableData: [
        ...observationData.tableData,
        {
          sNo: observationData.tableData.length + 1,
          question: '',
          yesNo: '',
          responsiblePerson: '',
          targetDate: '',
          auditTime: ''
        }
      ]
    });
  };

  const handleDeleteRow = (index) => {
    if (observationData.tableData.length > 1) {
      const newTableData = observationData.tableData.filter((_, i) => i !== index);
      // Re-number the rows
      const renumberedData = newTableData.map((row, i) => ({
        ...row,
        sNo: i + 1
      }));
      setObservationData({
        ...observationData,
        tableData: renumberedData
      });
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch('/api/organization/documents/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentName: 'EMS → OBSERVATION SHEET INTERNAL AUDIT',
          content: observationData,
          changeDescription: 'Updated internal audit observation sheet'
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

      setToast({ type: 'success', message: 'Internal audit observation sheet saved successfully. Revision number incremented.' });
    } catch (error) {
      console.error('Error saving internal audit observation sheet:', error);
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
    { key: 'internal-audit-observation-sheet', label: 'Internal Audit Observation Sheet', href: '#' },
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
                Internal Audit Observation Sheet
              </h1>
              <p className="text-sm text-gray-600 mt-1">ESF-EMS-IAR-12 - Environmental Management System</p>
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
          {/* Audit Information Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Audit Date
              </label>
              {isAdmin ? (
                <Input
                  type="text"
                  value={observationData.auditDate}
                  onChange={(e) => handleFieldChange('auditDate', e.target.value)}
                  className="w-full"
                  placeholder="e.g., 1/6/2022"
                />
              ) : (
                <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                  {observationData.auditDate || '-'}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Audit Department
              </label>
              {isAdmin ? (
                <Input
                  type="text"
                  value={observationData.auditDepartment}
                  onChange={(e) => handleFieldChange('auditDepartment', e.target.value)}
                  className="w-full"
                  placeholder="Enter audit department"
                />
              ) : (
                <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                  {observationData.auditDepartment || '-'}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Audit Time
              </label>
              {isAdmin ? (
                <Input
                  type="text"
                  value={observationData.auditTime}
                  onChange={(e) => handleFieldChange('auditTime', e.target.value)}
                  className="w-full"
                  placeholder="e.g., 11:00"
                />
              ) : (
                <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                  {observationData.auditTime || '-'}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Internal Auditor Name
              </label>
              {isAdmin ? (
                <Input
                  type="text"
                  value={observationData.internalAuditorName}
                  onChange={(e) => handleFieldChange('internalAuditorName', e.target.value)}
                  className="w-full"
                  placeholder="Enter auditor name"
                />
              ) : (
                <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                  {observationData.internalAuditorName || '-'}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Auditee Name
              </label>
              {isAdmin ? (
                <Input
                  type="text"
                  value={observationData.auditeeName}
                  onChange={(e) => handleFieldChange('auditeeName', e.target.value)}
                  className="w-full"
                  placeholder="Enter auditee name"
                />
              ) : (
                <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                  {observationData.auditeeName || '-'}
                </div>
              )}
            </div>
          </div>

          {/* Save and Add Row Buttons */}
          {isAdmin && (
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={handleAddRow}
                className="px-4"
              >
                + Add Row
              </Button>
              <Button
                onClick={handleSave}
                className="px-6"
              >
                Save
              </Button>
            </div>
          )}

          {/* Observation Sheet Table */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              INTERNAL AUDIT OBSERVATION SHEET
            </label>
            <div className="overflow-x-auto border border-gray-300 rounded-md">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-center text-xs font-semibold text-gray-700">
                      S.No
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-xs font-semibold text-gray-700">
                      Question
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-center text-xs font-semibold text-gray-700">
                      Yes/No
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-xs font-semibold text-gray-700">
                      Responsible Person
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-center text-xs font-semibold text-gray-700">
                      Target Date
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-center text-xs font-semibold text-gray-700">
                      Audit Time
                    </th>
                    {isAdmin && (
                      <th className="border border-gray-300 px-4 py-2 text-center text-xs font-semibold text-gray-700">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {observationData.tableData.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 text-center text-sm">
                        {row.sNo}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {isAdmin ? (
                          <Input
                            type="text"
                            value={row.question}
                            onChange={(e) => handleTableDataChange(index, 'question', e.target.value)}
                            className="w-full text-sm"
                            placeholder="Enter question"
                          />
                        ) : (
                          <span className="text-sm">{row.question || '-'}</span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {isAdmin ? (
                          <select
                            value={row.yesNo}
                            onChange={(e) => handleTableDataChange(index, 'yesNo', e.target.value)}
                            className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </select>
                        ) : (
                          <span className="text-sm text-center block">{row.yesNo || '-'}</span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {isAdmin ? (
                          <Input
                            type="text"
                            value={row.responsiblePerson}
                            onChange={(e) => handleTableDataChange(index, 'responsiblePerson', e.target.value)}
                            className="w-full text-sm"
                            placeholder="Enter responsible person"
                          />
                        ) : (
                          <span className="text-sm">{row.responsiblePerson || '-'}</span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {isAdmin ? (
                          <Input
                            type="text"
                            value={row.targetDate}
                            onChange={(e) => handleTableDataChange(index, 'targetDate', e.target.value)}
                            className="w-full text-sm text-center"
                            placeholder="e.g., 01-01-2024"
                          />
                        ) : (
                          <span className="text-sm text-center block">{row.targetDate || '-'}</span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {isAdmin ? (
                          <Input
                            type="text"
                            value={row.auditTime}
                            onChange={(e) => handleTableDataChange(index, 'auditTime', e.target.value)}
                            className="w-full text-sm text-center"
                            placeholder="e.g., 11:00"
                          />
                        ) : (
                          <span className="text-sm text-center block">{row.auditTime || '-'}</span>
                        )}
                      </td>
                      {isAdmin && (
                        <td className="border border-gray-300 px-2 py-1 text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteRow(index)}
                            disabled={observationData.tableData.length === 1}
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


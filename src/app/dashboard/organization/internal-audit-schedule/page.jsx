'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { Input } from '@/components/ui/Input';

export default function InternalAuditSchedulePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [documentInfo, setDocumentInfo] = useState(null);
  const [migrationRequired, setMigrationRequired] = useState(false);
  
  // Internal Audit Schedule data structure
  const [scheduleData, setScheduleData] = useState({
    tableData: [
      {
        actual: '',
        location: 'Tanning and Retanning and Finishing and Chemical Internal Audit for Name: MR. BIN All Departments.',
        auditor: 'MR. SA.',
        auditee: 'All Departments.'
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
      const res = await fetch('/api/organization/documents/content?documentName=Internal Audit Schedule');
      const data = await res.json();
      
      if (res.ok) {
        if (data.data?.migrationRequired) {
          setMigrationRequired(true);
        } else if (data.data?.content) {
          const loadedData = data.data.content.content || scheduleData;
          // Ensure tableData exists and has at least one row
          if (!loadedData.tableData || loadedData.tableData.length === 0) {
            loadedData.tableData = [{
              actual: '',
              location: 'Tanning and Retanning and Finishing and Chemical Internal Audit for Name: MR. BIN All Departments.',
              auditor: 'MR. SA.',
              auditee: 'All Departments.'
            }];
          }
          setScheduleData(loadedData);
          setDocumentInfo({
            docNo: data.data.document.docNo || 'ESF-MSM-IAC-11',
            revDate: data.data.document.revDate || 'Rev.No-01/Date-01-01-2024',
            revisionNo: data.data.content.revisionNo,
            revisionDate: data.data.content.revisionDate
          });
        } else {
          setDocumentInfo({
            docNo: 'ESF-MSM-IAC-11',
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

  const handleTableDataChange = (index, field, value) => {
    setScheduleData({
      ...scheduleData,
      tableData: scheduleData.tableData.map((row, i) => 
        i === index ? { ...row, [field]: value } : row
      )
    });
  };

  const handleAddRow = () => {
    setScheduleData({
      ...scheduleData,
      tableData: [
        ...scheduleData.tableData,
        {
          actual: '',
          location: 'Tanning and Retanning and Finishing and Chemical Internal Audit for Name: MR. BIN All Departments.',
          auditor: 'MR. SA.',
          auditee: 'All Departments.'
        }
      ]
    });
  };

  const handleDeleteRow = (index) => {
    if (scheduleData.tableData.length > 1) {
      setScheduleData({
        ...scheduleData,
        tableData: scheduleData.tableData.filter((_, i) => i !== index)
      });
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch('/api/organization/documents/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentName: 'Internal Audit Schedule',
          content: scheduleData,
          changeDescription: 'Updated internal audit schedule'
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

      setToast({ type: 'success', message: 'Internal audit schedule saved successfully. Revision number incremented.' });
    } catch (error) {
      console.error('Error saving internal audit schedule:', error);
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
    { key: 'internal-audit-schedule', label: 'Internal Audit Schedule', href: '#' },
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Internal Audit Schedule
              </h1>
              <p className="text-sm text-gray-600 mt-1">ESF-MSM-IAC-11 - Environmental Management System</p>
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

          {/* Internal Audit Schedule Table */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              INTERNAL AUDIT SCHEDULE
            </label>
            <div className="overflow-x-auto border border-gray-300 rounded-md">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-center text-xs font-semibold text-gray-700">
                      ACTUAL
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-xs font-semibold text-gray-700">
                      LOCATION
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-xs font-semibold text-gray-700">
                      AUDITOR
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-xs font-semibold text-gray-700">
                      AUDITEE
                    </th>
                    {isAdmin && (
                      <th className="border border-gray-300 px-4 py-2 text-center text-xs font-semibold text-gray-700">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {scheduleData.tableData.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-2 py-1">
                        {isAdmin ? (
                          <Input
                            type="text"
                            value={row.actual}
                            onChange={(e) => handleTableDataChange(index, 'actual', e.target.value)}
                            className="w-full text-sm text-center"
                            placeholder="e.g., 1/1/2023"
                          />
                        ) : (
                          <span className="text-sm text-center block">{row.actual || '-'}</span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {isAdmin ? (
                          <Input
                            type="text"
                            value={row.location}
                            onChange={(e) => handleTableDataChange(index, 'location', e.target.value)}
                            className="w-full text-sm"
                            placeholder="Enter location"
                          />
                        ) : (
                          <span className="text-sm">{row.location || '-'}</span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {isAdmin ? (
                          <Input
                            type="text"
                            value={row.auditor}
                            onChange={(e) => handleTableDataChange(index, 'auditor', e.target.value)}
                            className="w-full text-sm"
                            placeholder="Enter auditor"
                          />
                        ) : (
                          <span className="text-sm">{row.auditor || '-'}</span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {isAdmin ? (
                          <Input
                            type="text"
                            value={row.auditee}
                            onChange={(e) => handleTableDataChange(index, 'auditee', e.target.value)}
                            className="w-full text-sm"
                            placeholder="Enter auditee"
                          />
                        ) : (
                          <span className="text-sm">{row.auditee || '-'}</span>
                        )}
                      </td>
                      {isAdmin && (
                        <td className="border border-gray-300 px-2 py-1 text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteRow(index)}
                            disabled={scheduleData.tableData.length === 1}
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


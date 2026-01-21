'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { Input } from '@/components/ui/Input';

export default function EnvironmentalAspectImpactRegisterPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [documentInfo, setDocumentInfo] = useState(null);
  const [migrationRequired, setMigrationRequired] = useState(false);
  
  // Environmental Aspect & Impact Register data structure
  const [registerData, setRegisterData] = useState({
    tableData: [
      {
        slNo: 1,
        department: '',
        process: '',
        condition: '',
        aspect: '',
        aspectType: '',
        impact: '',
        scaleOfImpact: '',
        probability: '',
        severity: '',
        control: '',
        totalScore: '',
        legalRequirement: '',
        currentControls: ''
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
      const res = await fetch('/api/organization/documents/content?documentName=EMS → ASPECT & IMPACT REGISTER');
      const data = await res.json();
      
      if (res.ok) {
        if (data.data?.migrationRequired) {
          setMigrationRequired(true);
        } else if (data.data?.content) {
          const loadedData = data.data.content.content || registerData;
          // Ensure tableData exists and has at least one row
          if (!loadedData.tableData || loadedData.tableData.length === 0) {
            loadedData.tableData = [{
              slNo: 1,
              department: '',
              process: '',
              condition: '',
              aspect: '',
              aspectType: '',
              impact: '',
              scaleOfImpact: '',
              probability: '',
              severity: '',
              control: '',
              totalScore: '',
              legalRequirement: '',
              currentControls: ''
            }];
          }
          // Ensure slNo is set for all rows
          loadedData.tableData = loadedData.tableData.map((row, index) => ({
            ...row,
            slNo: row.slNo || index + 1
          }));
          setRegisterData(loadedData);
          setDocumentInfo({
            docNo: data.data.document.docNo || 'ESF-EMS-EIA-15',
            revDate: data.data.document.revDate || 'Rev.No-01/Date-01-01-2024',
            revisionNo: data.data.content.revisionNo,
            revisionDate: data.data.content.revisionDate
          });
        } else {
          setDocumentInfo({
            docNo: 'ESF-EMS-EIA-15',
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
    setRegisterData({
      ...registerData,
      tableData: registerData.tableData.map((row, i) => {
        if (i === index) {
          const updatedRow = { ...row, [field]: value };
          // Auto-calculate total score if probability, severity, and control are numbers
          if (field === 'probability' || field === 'severity' || field === 'control') {
            const prob = parseFloat(updatedRow.probability) || 0;
            const sev = parseFloat(updatedRow.severity) || 0;
            const ctrl = parseFloat(updatedRow.control) || 0;
            updatedRow.totalScore = (prob * sev * ctrl).toString();
          }
          return updatedRow;
        }
        return row;
      })
    });
  };

  const handleAddRow = () => {
    setRegisterData({
      ...registerData,
      tableData: [
        ...registerData.tableData,
        {
          slNo: registerData.tableData.length + 1,
          department: '',
          process: '',
          condition: '',
          aspect: '',
          aspectType: '',
          impact: '',
          scaleOfImpact: '',
          probability: '',
          severity: '',
          control: '',
          totalScore: '',
          legalRequirement: '',
          currentControls: ''
        }
      ]
    });
  };

  const handleDeleteRow = (index) => {
    if (registerData.tableData.length > 1) {
      const newTableData = registerData.tableData.filter((_, i) => i !== index);
      // Re-number the rows
      const renumberedData = newTableData.map((row, i) => ({
        ...row,
        slNo: i + 1
      }));
      setRegisterData({
        ...registerData,
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
          documentName: 'EMS → ASPECT & IMPACT REGISTER',
          content: registerData,
          changeDescription: 'Updated environmental aspect & impact register'
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

      setToast({ type: 'success', message: 'Environmental aspect & impact register saved successfully. Revision number incremented.' });
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
    { key: 'register', label: 'Environmental Aspect & Impact Register', href: '#' },
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
              Environmental Aspect & Impact Register
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

          {/* Main Table */}
          <div className="overflow-x-auto border border-gray-300 rounded-md">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-3 py-2 text-center text-xs font-semibold text-gray-700">
                    Sl.No
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                    DEPARTMENT
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                    PROCESS
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                    CONDITION
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                    ASPECT
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                    ASPECT TYPE
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                    IMPACT
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-center text-xs font-semibold text-gray-700">
                    SCALE OF IMPACT
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-center text-xs font-semibold text-gray-700">
                    PROBABILITY
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-center text-xs font-semibold text-gray-700">
                    SEVERITY
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-center text-xs font-semibold text-gray-700">
                    CONTROL
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-center text-xs font-semibold text-gray-700">
                    TOTAL SCORE
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                    LEGAL REQUIREMENT
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                    CURRENT CONTROLS
                  </th>
                  {isAdmin && (
                    <th className="border border-gray-300 px-3 py-2 text-center text-xs font-semibold text-gray-700">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {registerData.tableData.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-3 py-2 text-center text-sm">
                      {row.slNo}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      {isAdmin ? (
                        <Input
                          type="text"
                          value={row.department}
                          onChange={(e) => handleTableDataChange(index, 'department', e.target.value)}
                          className="w-full text-sm"
                          placeholder="e.g., Raw Godown"
                        />
                      ) : (
                        <span className="text-sm">{row.department || '-'}</span>
                      )}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      {isAdmin ? (
                        <Input
                          type="text"
                          value={row.process}
                          onChange={(e) => handleTableDataChange(index, 'process', e.target.value)}
                          className="w-full text-sm"
                          placeholder="e.g., Unloading"
                        />
                      ) : (
                        <span className="text-sm">{row.process || '-'}</span>
                      )}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      {isAdmin ? (
                        <Input
                          type="text"
                          value={row.condition}
                          onChange={(e) => handleTableDataChange(index, 'condition', e.target.value)}
                          className="w-full text-sm"
                          placeholder="e.g., Normal"
                        />
                      ) : (
                        <span className="text-sm">{row.condition || '-'}</span>
                      )}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      {isAdmin ? (
                        <Input
                          type="text"
                          value={row.aspect}
                          onChange={(e) => handleTableDataChange(index, 'aspect', e.target.value)}
                          className="w-full text-sm"
                          placeholder="e.g., Salt Spillage"
                        />
                      ) : (
                        <span className="text-sm">{row.aspect || '-'}</span>
                      )}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      {isAdmin ? (
                        <Input
                          type="text"
                          value={row.aspectType}
                          onChange={(e) => handleTableDataChange(index, 'aspectType', e.target.value)}
                          className="w-full text-sm"
                          placeholder="e.g., Environmental"
                        />
                      ) : (
                        <span className="text-sm">{row.aspectType || '-'}</span>
                      )}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      {isAdmin ? (
                        <Input
                          type="text"
                          value={row.impact}
                          onChange={(e) => handleTableDataChange(index, 'impact', e.target.value)}
                          className="w-full text-sm"
                          placeholder="e.g., LP"
                        />
                      ) : (
                        <span className="text-sm">{row.impact || '-'}</span>
                      )}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      {isAdmin ? (
                        <Input
                          type="text"
                          value={row.scaleOfImpact}
                          onChange={(e) => handleTableDataChange(index, 'scaleOfImpact', e.target.value)}
                          className="w-full text-sm text-center"
                          placeholder="e.g., 3"
                        />
                      ) : (
                        <span className="text-sm text-center block">{row.scaleOfImpact || '-'}</span>
                      )}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      {isAdmin ? (
                        <Input
                          type="number"
                          value={row.probability}
                          onChange={(e) => handleTableDataChange(index, 'probability', e.target.value)}
                          className="w-full text-sm text-center"
                          placeholder="e.g., 3"
                        />
                      ) : (
                        <span className="text-sm text-center block">{row.probability || '-'}</span>
                      )}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      {isAdmin ? (
                        <Input
                          type="number"
                          value={row.severity}
                          onChange={(e) => handleTableDataChange(index, 'severity', e.target.value)}
                          className="w-full text-sm text-center"
                          placeholder="e.g., 2"
                        />
                      ) : (
                        <span className="text-sm text-center block">{row.severity || '-'}</span>
                      )}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      {isAdmin ? (
                        <Input
                          type="number"
                          value={row.control}
                          onChange={(e) => handleTableDataChange(index, 'control', e.target.value)}
                          className="w-full text-sm text-center"
                          placeholder="e.g., 2"
                        />
                      ) : (
                        <span className="text-sm text-center block">{row.control || '-'}</span>
                      )}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      <span className="text-sm text-center block font-medium">{row.totalScore || '-'}</span>
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      {isAdmin ? (
                        <Input
                          type="text"
                          value={row.legalRequirement}
                          onChange={(e) => handleTableDataChange(index, 'legalRequirement', e.target.value)}
                          className="w-full text-sm"
                          placeholder="e.g., MMDA"
                        />
                      ) : (
                        <span className="text-sm">{row.legalRequirement || '-'}</span>
                      )}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      {isAdmin ? (
                        <Input
                          type="text"
                          value={row.currentControls}
                          onChange={(e) => handleTableDataChange(index, 'currentControls', e.target.value)}
                          className="w-full text-sm"
                          placeholder="e.g., SOP"
                        />
                      ) : (
                        <span className="text-sm">{row.currentControls || '-'}</span>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="border border-gray-300 px-2 py-1 text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteRow(index)}
                          disabled={registerData.tableData.length === 1}
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
  );
}


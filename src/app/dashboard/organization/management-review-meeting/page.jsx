'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { Input } from '@/components/ui/Input';

export default function ManagementReviewMeetingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [documentInfo, setDocumentInfo] = useState(null);
  const [migrationRequired, setMigrationRequired] = useState(false);
  
  // Management Review Meeting data structure
  const [mrmData, setMrmData] = useState({
    documentNo: 'ESF-EMS-MRM-14',
    date: '',
    meetingReference: '',
    membersPresent: [
      { role: 'Managing Director', present: false },
      { role: 'Production Manager & MR', present: false },
      { role: 'Administration', present: false },
      { role: 'ETP Supervisor', present: false },
      { role: 'Maintenance Department', present: false },
      { role: 'Health & Safety Engineer', present: false },
      { role: 'Chemical Supervisor', present: false },
      { role: 'Dyeing Technician', present: false },
      { role: 'Finishing Technician', present: false }
    ],
    // Section 1: Review of Previous Management Meeting
    previousMeetingDate: '',
    previousMeetingNote: 'All previous action plans are reviewed and implemented.',
    previousActionPlans: [
      { sNo: 1, actionPlan: '', byWhom: '', targetDate: '' }
    ],
    previousMRMReport: 'Refer - Previous MRM Report',
    previousFindings: 'All findings were discussed in details',
    // Section 2: Results of EMS Audits
    auditDates: [''],
    auditReport: 'Refer - EMS Audit Report',
    auditFindings: 'All findings were discussed in details',
    // Section 3: Evaluation of Compliance with Legal Requirements
    legalCompliance: 'All Legals and Compliance Register reviewed as per procedure',
    // Section 4: Complaints / Communications
    complaints: 'Nil',
    stakeholderRegister: 'Stake Holder Register is available at the gate',
    // Section 5: Environmental Aspects
    environmentalAspects: 'Environmental Aspects were reviewed and discussed in details.',
    environmentalAspectRegister: 'Environmental Aspect and Impact Register',
    environmentalAspectDocNo: 'ESF-EMS-EIA-15',
    // Section 6: Objectives and Environmental Management Programs
    objectivesNote: 'EMP\'s progress and their action plans were discussed in detail.',
    objectivesTargets: 'Refer EMS Objectives & Targets',
    objectivesDocNo: 'ESF-EMS-OBT-03',
    keyPerformanceIndicator: 'Key Performance Indicator',
    kpiDocNo: 'ESF-EMS-KPI',
    // Section 7: Corrective and Preventive Action
    correctiveAction: 'Nil',
    // Section 8: Performance Indicators
    performanceIndicators: 'Performance Indicators was reviewed and discussed in details',
    // Section 9: Critical Training Needs
    criticalTrainingNeeds: 'Awareness training on Environmental Management System and its policy.',
    // Section 10: Changing Circumstances on Legal Requirements
    changingCircumstances: 'Nil',
    // Section 11: Recommendations and Action Plans
    recommendationsActionPlans: [
      { sNo: 1, actionPlan: '', byWhom: '', targetDate: '' }
    ],
    // Section 12: Responsibility Plan and Resources Allocation
    responsibilityPlan: 'Refer EMS Management Structure',
    // Section 13: Budget Allocation
    budgetAllocation: [
      { sNo: 1, item: '', cost: '', approvalStatus: '' }
    ]
  });

  const isAdmin = session?.user?.role === 'SUPER_ADMIN' || session?.user?.role === 'ADMIN';

  useEffect(() => {
    fetchDocumentContent();
  }, []);

  const fetchDocumentContent = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/organization/documents/content?documentName=EMS → INTERNAL AUDIT & MRM');
      const data = await res.json();
      
      if (res.ok) {
        if (data.data?.migrationRequired) {
          setMigrationRequired(true);
        } else if (data.data?.content) {
          const loadedData = data.data.content.content || mrmData;
          // Ensure arrays exist
          if (!loadedData.membersPresent) {
            loadedData.membersPresent = mrmData.membersPresent;
          }
          if (!loadedData.previousActionPlans || loadedData.previousActionPlans.length === 0) {
            loadedData.previousActionPlans = [{ sNo: 1, actionPlan: '', byWhom: '', targetDate: '' }];
          }
          if (!loadedData.auditDates || loadedData.auditDates.length === 0) {
            loadedData.auditDates = [''];
          }
          if (!loadedData.recommendationsActionPlans || loadedData.recommendationsActionPlans.length === 0) {
            loadedData.recommendationsActionPlans = [{ sNo: 1, actionPlan: '', byWhom: '', targetDate: '' }];
          }
          if (!loadedData.budgetAllocation || loadedData.budgetAllocation.length === 0) {
            loadedData.budgetAllocation = [{ sNo: 1, item: '', cost: '', approvalStatus: '' }];
          }
          setMrmData(loadedData);
          setDocumentInfo({
            docNo: data.data.document.docNo || 'ESF-EMS-MRM-14',
            revDate: data.data.document.revDate || 'Rev.No-01/Date-01-01-2024',
            revisionNo: data.data.content.revisionNo,
            revisionDate: data.data.content.revisionDate
          });
        } else {
          setDocumentInfo({
            docNo: 'ESF-EMS-MRM-14',
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
    setMrmData({
      ...mrmData,
      [field]: value
    });
  };

  const handleArrayFieldChange = (field, index, subField, value) => {
    setMrmData({
      ...mrmData,
      [field]: mrmData[field].map((item, i) => 
        i === index ? { ...item, [subField]: value } : item
      )
    });
  };

  const handleAddRow = (field) => {
    const newRow = field === 'previousActionPlans' || field === 'recommendationsActionPlans' 
      ? { sNo: mrmData[field].length + 1, actionPlan: '', byWhom: '', targetDate: '' }
      : field === 'budgetAllocation'
      ? { sNo: mrmData[field].length + 1, item: '', cost: '', approvalStatus: '' }
      : field === 'auditDates'
      ? ''
      : null;
    
    if (newRow !== null) {
      setMrmData({
        ...mrmData,
        [field]: [...mrmData[field], newRow]
      });
    }
  };

  const handleDeleteRow = (field, index) => {
    if (mrmData[field].length > 1) {
      const newArray = mrmData[field].filter((_, i) => i !== index);
      // Re-number if it's a table with sNo
      if (field === 'previousActionPlans' || field === 'recommendationsActionPlans' || field === 'budgetAllocation') {
        const renumbered = newArray.map((row, i) => ({ ...row, sNo: i + 1 }));
        setMrmData({
          ...mrmData,
          [field]: renumbered
        });
      } else {
        setMrmData({
          ...mrmData,
          [field]: newArray
        });
      }
    }
  };

  const handleMemberPresentChange = (index, value) => {
    setMrmData({
      ...mrmData,
      membersPresent: mrmData.membersPresent.map((member, i) => 
        i === index ? { ...member, present: value } : member
      )
    });
  };

  const handleSave = async () => {
    try {
      const res = await fetch('/api/organization/documents/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentName: 'EMS → INTERNAL AUDIT & MRM',
          content: mrmData,
          changeDescription: 'Updated management review meeting'
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

      setToast({ type: 'success', message: 'Management review meeting saved successfully. Revision number incremented.' });
    } catch (error) {
      console.error('Error saving management review meeting:', error);
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
    { key: 'management-review-meeting', label: 'Management Review Meeting', href: '#' },
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Management Review Meeting
              </h1>
              <p className="text-sm text-gray-600 mt-1">ESF-EMS-MRM-14 - Environmental Management System</p>
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
          {/* Header Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Document No
              </label>
              {isAdmin ? (
                <Input
                  type="text"
                  value={mrmData.documentNo}
                  onChange={(e) => handleFieldChange('documentNo', e.target.value)}
                  className="w-full"
                />
              ) : (
                <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                  {mrmData.documentNo}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              {isAdmin ? (
                <Input
                  type="text"
                  value={mrmData.date}
                  onChange={(e) => handleFieldChange('date', e.target.value)}
                  className="w-full"
                  placeholder="e.g., 3/12/2022"
                />
              ) : (
                <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                  {mrmData.date || '-'}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meeting Reference
              </label>
              {isAdmin ? (
                <Input
                  type="text"
                  value={mrmData.meetingReference}
                  onChange={(e) => handleFieldChange('meetingReference', e.target.value)}
                  className="w-full"
                  placeholder="e.g., MRM - 01"
                />
              ) : (
                <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                  {mrmData.meetingReference || '-'}
                </div>
              )}
            </div>
          </div>

          {/* Member Present Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              MEMBER PRESENT:
            </label>
            <div className="border border-gray-300 rounded-md p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {mrmData.membersPresent.map((member, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {isAdmin ? (
                      <input
                        type="checkbox"
                        checked={member.present}
                        onChange={(e) => handleMemberPresentChange(index, e.target.checked)}
                        className="w-4 h-4"
                      />
                    ) : (
                      <span className="w-4 h-4 flex items-center justify-center">
                        {member.present ? '✓' : '○'}
                      </span>
                    )}
                    <span className="text-sm">{member.role}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 1: Review of Previous Management Meeting */}
          <div className="border border-gray-300 rounded-md p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">1. REVIEW OF PREVIOUS MANAGEMENT MEETING:</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  EMS Management Review Meeting was previously conducted on
                </label>
                {isAdmin ? (
                  <Input
                    type="text"
                    value={mrmData.previousMeetingDate}
                    onChange={(e) => handleFieldChange('previousMeetingDate', e.target.value)}
                    className="w-full"
                    placeholder="e.g., 3/12/2022"
                  />
                ) : (
                  <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                    {mrmData.previousMeetingDate || '-'}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note
                </label>
                {isAdmin ? (
                  <Input
                    type="text"
                    value={mrmData.previousMeetingNote}
                    onChange={(e) => handleFieldChange('previousMeetingNote', e.target.value)}
                    className="w-full"
                  />
                ) : (
                  <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                    {mrmData.previousMeetingNote}
                  </div>
                )}
              </div>
              
              {/* Previous Action Plans Table */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Action Plans</label>
                  {isAdmin && (
                    <Button variant="outline" size="sm" onClick={() => handleAddRow('previousActionPlans')}>
                      + Add Row
                    </Button>
                  )}
                </div>
                <div className="overflow-x-auto border border-gray-300 rounded-md">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2 text-center text-xs font-semibold">S.NO</th>
                        <th className="border border-gray-300 px-4 py-2 text-left text-xs font-semibold">ACTION PLAN</th>
                        <th className="border border-gray-300 px-4 py-2 text-left text-xs font-semibold">BY WHOM</th>
                        <th className="border border-gray-300 px-4 py-2 text-center text-xs font-semibold">TARGET DATE</th>
                        {isAdmin && <th className="border border-gray-300 px-4 py-2 text-center text-xs font-semibold">Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {mrmData.previousActionPlans.map((row, index) => (
                        <tr key={index}>
                          <td className="border border-gray-300 px-4 py-2 text-center text-sm">{row.sNo}</td>
                          <td className="border border-gray-300 px-2 py-1">
                            {isAdmin ? (
                              <Input
                                type="text"
                                value={row.actionPlan}
                                onChange={(e) => handleArrayFieldChange('previousActionPlans', index, 'actionPlan', e.target.value)}
                                className="w-full text-sm"
                              />
                            ) : (
                              <span className="text-sm">{row.actionPlan || '-'}</span>
                            )}
                          </td>
                          <td className="border border-gray-300 px-2 py-1">
                            {isAdmin ? (
                              <Input
                                type="text"
                                value={row.byWhom}
                                onChange={(e) => handleArrayFieldChange('previousActionPlans', index, 'byWhom', e.target.value)}
                                className="w-full text-sm"
                              />
                            ) : (
                              <span className="text-sm">{row.byWhom || '-'}</span>
                            )}
                          </td>
                          <td className="border border-gray-300 px-2 py-1">
                            {isAdmin ? (
                              <Input
                                type="text"
                                value={row.targetDate}
                                onChange={(e) => handleArrayFieldChange('previousActionPlans', index, 'targetDate', e.target.value)}
                                className="w-full text-sm text-center"
                              />
                            ) : (
                              <span className="text-sm text-center block">{row.targetDate || '-'}</span>
                            )}
                          </td>
                          {isAdmin && (
                            <td className="border border-gray-300 px-2 py-1 text-center">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteRow('previousActionPlans', index)}
                                disabled={mrmData.previousActionPlans.length === 1}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Previous MRM Report
                </label>
                {isAdmin ? (
                  <Input
                    type="text"
                    value={mrmData.previousMRMReport}
                    onChange={(e) => handleFieldChange('previousMRMReport', e.target.value)}
                    className="w-full"
                  />
                ) : (
                  <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                    {mrmData.previousMRMReport}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Findings
                </label>
                {isAdmin ? (
                  <Input
                    type="text"
                    value={mrmData.previousFindings}
                    onChange={(e) => handleFieldChange('previousFindings', e.target.value)}
                    className="w-full"
                  />
                ) : (
                  <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                    {mrmData.previousFindings}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Results of EMS Audits */}
          <div className="border border-gray-300 rounded-md p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">2. RESULTS OF EMS AUDITS:</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  EMS Internal Audit was conducted on
                </label>
                <div className="space-y-2">
                  {mrmData.auditDates.map((date, index) => (
                    <div key={index} className="flex items-center gap-2">
                      {isAdmin ? (
                        <>
                          <Input
                            type="text"
                            value={date}
                            onChange={(e) => {
                              const newDates = [...mrmData.auditDates];
                              newDates[index] = e.target.value;
                              handleFieldChange('auditDates', newDates);
                            }}
                            className="flex-1"
                            placeholder="e.g., 1/6/2022"
                          />
                          {mrmData.auditDates.length > 1 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteRow('auditDates', index)}
                              className="text-red-600"
                            >
                              Delete
                            </Button>
                          )}
                        </>
                      ) : (
                        <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 flex-1">
                          {date || '-'}
                        </div>
                      )}
                    </div>
                  ))}
                  {isAdmin && (
                    <Button variant="outline" size="sm" onClick={() => handleAddRow('auditDates')}>
                      + Add Date
                    </Button>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Audit Report
                </label>
                {isAdmin ? (
                  <Input
                    type="text"
                    value={mrmData.auditReport}
                    onChange={(e) => handleFieldChange('auditReport', e.target.value)}
                    className="w-full"
                  />
                ) : (
                  <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                    {mrmData.auditReport}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Findings
                </label>
                {isAdmin ? (
                  <Input
                    type="text"
                    value={mrmData.auditFindings}
                    onChange={(e) => handleFieldChange('auditFindings', e.target.value)}
                    className="w-full"
                  />
                ) : (
                  <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                    {mrmData.auditFindings}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Evaluation of Compliance with Legal Requirements */}
          <div className="border border-gray-300 rounded-md p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">3. EVALUATION OF COMPLIANCE WITH LEGAL REQUIREMENTS:</h3>
            {isAdmin ? (
              <Input
                type="text"
                value={mrmData.legalCompliance}
                onChange={(e) => handleFieldChange('legalCompliance', e.target.value)}
                className="w-full"
              />
            ) : (
              <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                {mrmData.legalCompliance}
              </div>
            )}
          </div>

          {/* Section 4: Complaints / Communications */}
          <div className="border border-gray-300 rounded-md p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">4. COMPLAINTS / COMMUNICATIONS:</h3>
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Complaints</label>
                {isAdmin ? (
                  <Input
                    type="text"
                    value={mrmData.complaints}
                    onChange={(e) => handleFieldChange('complaints', e.target.value)}
                    className="w-full"
                  />
                ) : (
                  <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                    {mrmData.complaints}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stakeholder Register</label>
                {isAdmin ? (
                  <Input
                    type="text"
                    value={mrmData.stakeholderRegister}
                    onChange={(e) => handleFieldChange('stakeholderRegister', e.target.value)}
                    className="w-full"
                  />
                ) : (
                  <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                    {mrmData.stakeholderRegister}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 5: Environmental Aspects */}
          <div className="border border-gray-300 rounded-md p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">5. ENVIRONMENTAL ASPECTS (CHANGING CIRCUMSTANCES IF ANY):</h3>
            <div className="space-y-2">
              <div>
                {isAdmin ? (
                  <Input
                    type="text"
                    value={mrmData.environmentalAspects}
                    onChange={(e) => handleFieldChange('environmentalAspects', e.target.value)}
                    className="w-full"
                  />
                ) : (
                  <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                    {mrmData.environmentalAspects}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">{mrmData.environmentalAspectRegister}</span>
                {isAdmin ? (
                  <Input
                    type="text"
                    value={mrmData.environmentalAspectDocNo}
                    onChange={(e) => handleFieldChange('environmentalAspectDocNo', e.target.value)}
                    className="w-48"
                  />
                ) : (
                  <span className="text-sm font-medium">{mrmData.environmentalAspectDocNo}</span>
                )}
              </div>
            </div>
          </div>

          {/* Section 6: Objectives and Environmental Management Programs */}
          <div className="border border-gray-300 rounded-md p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">6. OBJECTIVES AND ENVIRONMENTAL MANAGEMENT PROGRAMS:</h3>
            <div className="space-y-2">
              <div>
                {isAdmin ? (
                  <Input
                    type="text"
                    value={mrmData.objectivesNote}
                    onChange={(e) => handleFieldChange('objectivesNote', e.target.value)}
                    className="w-full"
                  />
                ) : (
                  <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                    {mrmData.objectivesNote}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">{mrmData.objectivesTargets}</span>
                {isAdmin ? (
                  <Input
                    type="text"
                    value={mrmData.objectivesDocNo}
                    onChange={(e) => handleFieldChange('objectivesDocNo', e.target.value)}
                    className="w-48"
                  />
                ) : (
                  <span className="text-sm font-medium">{mrmData.objectivesDocNo}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">{mrmData.keyPerformanceIndicator}</span>
                {isAdmin ? (
                  <Input
                    type="text"
                    value={mrmData.kpiDocNo}
                    onChange={(e) => handleFieldChange('kpiDocNo', e.target.value)}
                    className="w-48"
                  />
                ) : (
                  <span className="text-sm font-medium">{mrmData.kpiDocNo}</span>
                )}
              </div>
            </div>
          </div>

          {/* Section 7: Corrective and Preventive Action */}
          <div className="border border-gray-300 rounded-md p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">7. CORRECTIVE AND PREVENTIVE ACTION:</h3>
            {isAdmin ? (
              <Input
                type="text"
                value={mrmData.correctiveAction}
                onChange={(e) => handleFieldChange('correctiveAction', e.target.value)}
                className="w-full"
              />
            ) : (
              <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                {mrmData.correctiveAction}
              </div>
            )}
          </div>

          {/* Section 8: Performance Indicators */}
          <div className="border border-gray-300 rounded-md p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">8. PERFORMANCE INDICATORS:</h3>
            {isAdmin ? (
              <Input
                type="text"
                value={mrmData.performanceIndicators}
                onChange={(e) => handleFieldChange('performanceIndicators', e.target.value)}
                className="w-full"
              />
            ) : (
              <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                {mrmData.performanceIndicators}
              </div>
            )}
          </div>

          {/* Section 9: Critical Training Needs */}
          <div className="border border-gray-300 rounded-md p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">9. CRITICAL TRAINING NEEDS (EMS):</h3>
            {isAdmin ? (
              <Input
                type="text"
                value={mrmData.criticalTrainingNeeds}
                onChange={(e) => handleFieldChange('criticalTrainingNeeds', e.target.value)}
                className="w-full"
              />
            ) : (
              <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                {mrmData.criticalTrainingNeeds}
              </div>
            )}
          </div>

          {/* Section 10: Changing Circumstances */}
          <div className="border border-gray-300 rounded-md p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">10. CHANGING CIRCUMSTANCES ON LEGAL AND OTHER REQUIREMENTS:</h3>
            {isAdmin ? (
              <Input
                type="text"
                value={mrmData.changingCircumstances}
                onChange={(e) => handleFieldChange('changingCircumstances', e.target.value)}
                className="w-full"
              />
            ) : (
              <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                {mrmData.changingCircumstances}
              </div>
            )}
          </div>

          {/* Section 11: Recommendations and Action Plans */}
          <div className="border border-gray-300 rounded-md p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">11. RECOMMENDATIONS AND ACTION PLANS:</h3>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Action Plans</span>
              {isAdmin && (
                <Button variant="outline" size="sm" onClick={() => handleAddRow('recommendationsActionPlans')}>
                  + Add Row
                </Button>
              )}
            </div>
            <div className="overflow-x-auto border border-gray-300 rounded-md">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-center text-xs font-semibold">S.NO</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-xs font-semibold">ACTION PLAN</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-xs font-semibold">BY WHOM</th>
                    <th className="border border-gray-300 px-4 py-2 text-center text-xs font-semibold">TARGET DATE</th>
                    {isAdmin && <th className="border border-gray-300 px-4 py-2 text-center text-xs font-semibold">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {mrmData.recommendationsActionPlans.map((row, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 px-4 py-2 text-center text-sm">{row.sNo}</td>
                      <td className="border border-gray-300 px-2 py-1">
                        {isAdmin ? (
                          <Input
                            type="text"
                            value={row.actionPlan}
                            onChange={(e) => handleArrayFieldChange('recommendationsActionPlans', index, 'actionPlan', e.target.value)}
                            className="w-full text-sm"
                          />
                        ) : (
                          <span className="text-sm">{row.actionPlan || '-'}</span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {isAdmin ? (
                          <Input
                            type="text"
                            value={row.byWhom}
                            onChange={(e) => handleArrayFieldChange('recommendationsActionPlans', index, 'byWhom', e.target.value)}
                            className="w-full text-sm"
                          />
                        ) : (
                          <span className="text-sm">{row.byWhom || '-'}</span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {isAdmin ? (
                          <Input
                            type="text"
                            value={row.targetDate}
                            onChange={(e) => handleArrayFieldChange('recommendationsActionPlans', index, 'targetDate', e.target.value)}
                            className="w-full text-sm text-center"
                          />
                        ) : (
                          <span className="text-sm text-center block">{row.targetDate || '-'}</span>
                        )}
                      </td>
                      {isAdmin && (
                        <td className="border border-gray-300 px-2 py-1 text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteRow('recommendationsActionPlans', index)}
                            disabled={mrmData.recommendationsActionPlans.length === 1}
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

          {/* Section 12: Responsibility Plan */}
          <div className="border border-gray-300 rounded-md p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">12. RESPONSIBILITY PLAN AND RESOURCES ALLOCATION:</h3>
            {isAdmin ? (
              <Input
                type="text"
                value={mrmData.responsibilityPlan}
                onChange={(e) => handleFieldChange('responsibilityPlan', e.target.value)}
                className="w-full"
              />
            ) : (
              <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                {mrmData.responsibilityPlan}
              </div>
            )}
          </div>

          {/* Section 13: Budget Allocation */}
          <div className="border border-gray-300 rounded-md p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">13. BUDGET ALLOCATION:</h3>
            <div className="space-y-2 mb-4">
              <label className="block text-sm font-medium text-gray-700">Budget allocation for</label>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Items</span>
              {isAdmin && (
                <Button variant="outline" size="sm" onClick={() => handleAddRow('budgetAllocation')}>
                  + Add Row
                </Button>
              )}
            </div>
            <div className="overflow-x-auto border border-gray-300 rounded-md">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-center text-xs font-semibold">S.NO</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-xs font-semibold">Item</th>
                    <th className="border border-gray-300 px-4 py-2 text-center text-xs font-semibold">Cost</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-xs font-semibold">Approval Status</th>
                    {isAdmin && <th className="border border-gray-300 px-4 py-2 text-center text-xs font-semibold">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {mrmData.budgetAllocation.map((row, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 px-4 py-2 text-center text-sm">{row.sNo}</td>
                      <td className="border border-gray-300 px-2 py-1">
                        {isAdmin ? (
                          <Input
                            type="text"
                            value={row.item}
                            onChange={(e) => handleArrayFieldChange('budgetAllocation', index, 'item', e.target.value)}
                            className="w-full text-sm"
                          />
                        ) : (
                          <span className="text-sm">{row.item || '-'}</span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {isAdmin ? (
                          <Input
                            type="text"
                            value={row.cost}
                            onChange={(e) => handleArrayFieldChange('budgetAllocation', index, 'cost', e.target.value)}
                            className="w-full text-sm text-center"
                            placeholder="e.g., 20,000.00"
                          />
                        ) : (
                          <span className="text-sm text-center block">{row.cost || '-'}</span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {isAdmin ? (
                          <Input
                            type="text"
                            value={row.approvalStatus}
                            onChange={(e) => handleArrayFieldChange('budgetAllocation', index, 'approvalStatus', e.target.value)}
                            className="w-full text-sm"
                            placeholder="e.g., Approved by Management"
                          />
                        ) : (
                          <span className="text-sm">{row.approvalStatus || '-'}</span>
                        )}
                      </td>
                      {isAdmin && (
                        <td className="border border-gray-300 px-2 py-1 text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteRow('budgetAllocation', index)}
                            disabled={mrmData.budgetAllocation.length === 1}
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

          {/* Save Button */}
          {isAdmin && (
            <div className="flex justify-end">
              <Button onClick={handleSave} className="px-6">
                Save
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


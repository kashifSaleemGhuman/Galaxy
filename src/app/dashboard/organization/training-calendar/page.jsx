'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { Input } from '@/components/ui/Input';

export default function TrainingCalendarPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [documentInfo, setDocumentInfo] = useState(null);
  const [migrationRequired, setMigrationRequired] = useState(false);
  
  // Training calendar data structure - using 2026, 2027, 2028
  const [trainings, setTrainings] = useState([
    {
      sNo: 1,
      trainingTitle: 'EMS Policy Awareness Training',
      dates: {} // Will store dates by month key like 'May-26': { plan: '5/7/2026', actual: '5/10/2026' }
    },
    {
      sNo: 2,
      trainingTitle: 'EMS Awareness Training',
      dates: {}
    },
    {
      sNo: 3,
      trainingTitle: 'PPE awareness Training',
      dates: {}
    },
    {
      sNo: 4,
      trainingTitle: 'EMS Aspect & Impact Training',
      dates: {}
    },
    {
      sNo: 5,
      trainingTitle: 'Chemical Handling & Compatibility Training',
      dates: {}
    },
    {
      sNo: 6,
      trainingTitle: 'Fire Safety & Mock Drill Training',
      dates: {}
    },
    {
      sNo: 7,
      trainingTitle: 'First Aid Training',
      dates: {}
    },
    {
      sNo: 8,
      trainingTitle: 'Energy Electricity Training',
      dates: {}
    },
    {
      sNo: 9,
      trainingTitle: 'Leather Trimming Training',
      dates: {}
    },
    {
      sNo: 10,
      trainingTitle: 'Work Place Safety, H2S Safety training',
      dates: {}
    },
    {
      sNo: 11,
      trainingTitle: 'Water Consumption Training',
      dates: {}
    }
  ]);

  // Generate months for current year (2026) and next 2 years (2027, 2028)
  const currentYear = new Date().getFullYear();
  const generateMonths = (year) => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthNames.map(month => `${month}-${year.toString().slice(-2)}`);
  };
  const months2026 = generateMonths(currentYear);
  const months2027 = generateMonths(currentYear + 1);
  const months2028 = generateMonths(currentYear + 2);
  const allMonths = [...months2026, ...months2027, ...months2028];

  const isAdmin = session?.user?.role === 'SUPER_ADMIN' || session?.user?.role === 'ADMIN';

  useEffect(() => {
    fetchDocumentContent();
  }, []);

  const fetchDocumentContent = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/organization/documents/content?documentName=EMS → TRANNING CALENDAR');
      const data = await res.json();
      
      if (res.ok) {
        if (data.data?.migrationRequired) {
          setMigrationRequired(true);
        } else if (data.data?.content) {
          const loadedTrainings = data.data.content.content || trainings;
          // Ensure all trainings have the dates structure
          const normalizedTrainings = loadedTrainings.map(training => ({
            ...training,
            dates: training.dates || {}
          }));
          setTrainings(normalizedTrainings);
          setDocumentInfo({
            docNo: data.data.document.docNo || 'ESF-EMS-TC-08',
            revDate: data.data.document.revDate || 'Rev.No-01/Date-01-01-2024',
            revisionNo: data.data.content.revisionNo,
            revisionDate: data.data.content.revisionDate
          });
        } else {
          setDocumentInfo({
            docNo: 'ESF-EMS-TC-08',
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

  const handleFieldChange = async (index, field, value) => {
    const updatedTrainings = [...trainings];
    updatedTrainings[index] = {
      ...updatedTrainings[index],
      [field]: value
    };
    setTrainings(updatedTrainings);

    // Save to database
    try {
      const res = await fetch('/api/organization/documents/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentName: 'EMS → TRANNING CALENDAR',
          content: updatedTrainings,
          changeDescription: `Updated training ${index + 1} - ${field}`
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

      setToast({ type: 'success', message: 'Value updated successfully. Revision number incremented.' });
    } catch (error) {
      console.error('Error saving value:', error);
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

  const handleDateChange = async (index, month, type, date) => {
    const updatedTrainings = [...trainings];
    if (!updatedTrainings[index].dates) {
      updatedTrainings[index].dates = {};
    }
    if (!updatedTrainings[index].dates[month]) {
      updatedTrainings[index].dates[month] = {};
    }
    updatedTrainings[index].dates[month][type] = date;
    setTrainings(updatedTrainings);

    // Save to database
    try {
      const res = await fetch('/api/organization/documents/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentName: 'EMS → TRANNING CALENDAR',
          content: updatedTrainings,
          changeDescription: `Updated training ${index + 1} - ${month} ${type} date`
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

      setToast({ type: 'success', message: 'Date updated successfully. Revision number incremented.' });
    } catch (error) {
      console.error('Error saving date:', error);
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
    { key: 'training-calendar', label: 'Training Calendar', href: '#' },
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
                Training Calendar
              </h1>
              <p className="text-sm text-gray-600 mt-1">ESF-EMS-TC-08 - Environmental Management System</p>
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

        <div className="p-6 overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead>
              <tr className="bg-orange-100">
                <th rowSpan={2} className="border border-gray-300 px-4 py-3 text-center text-xs font-semibold text-gray-700">
                  ESF-EMS-TC-08
                </th>
                <th rowSpan={2} className="border border-gray-300 px-4 py-3 text-center text-xs font-semibold text-gray-700">
                  ESF LEATHER CONSULTANCY
                </th>
                <th colSpan={allMonths.length} className="border border-gray-300 px-4 py-3 text-center text-xs font-semibold text-gray-700">
                  TRAINING CALENDAR
                </th>
              </tr>
              <tr className="bg-orange-100">
                <th className="border border-gray-300 px-2 py-2 text-center text-xs font-semibold text-gray-700">
                  S.No
                </th>
                <th className="border border-gray-300 px-2 py-2 text-center text-xs font-semibold text-gray-700">
                  Training Title
                </th>
                <th className="border border-gray-300 px-2 py-2 text-center text-xs font-semibold text-gray-700">
                  Plan / Actual
                </th>
                {allMonths.map((month, idx) => (
                  <th key={idx} className="border border-gray-300 px-2 py-2 text-center text-xs font-semibold text-gray-700">
                    {month}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trainings.map((training, index) => (
                <React.Fragment key={index}>
                  {/* Plan Row */}
                  <tr className="hover:bg-gray-50">
                    <td rowSpan={2} className="border border-gray-300 px-4 py-2 text-center text-sm">
                      {training.sNo}
                    </td>
                    <td rowSpan={2} className="border border-gray-300 px-4 py-2 text-sm">
                      {isAdmin ? (
                        <Input
                          type="text"
                          value={training.trainingTitle}
                          onChange={(e) => handleFieldChange(index, 'trainingTitle', e.target.value)}
                          onBlur={(e) => handleFieldChange(index, 'trainingTitle', e.target.value)}
                          className="w-full text-sm"
                        />
                      ) : (
                        <span>{training.trainingTitle}</span>
                      )}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-center text-xs font-medium">
                      P
                    </td>
                    {allMonths.map((month, idx) => {
                      const monthData = training.dates?.[month] || {};
                      const planDate = monthData.plan || '';
                      return (
                        <td key={idx} className="border border-gray-300 px-2 py-1 text-center text-xs min-w-[60px]">
                          {isAdmin ? (
                            <Input
                              type="text"
                              value={planDate}
                              onChange={(e) => handleDateChange(index, month, 'plan', e.target.value)}
                              onBlur={(e) => handleDateChange(index, month, 'plan', e.target.value)}
                              className="w-full text-xs text-center h-6"
                              placeholder=""
                            />
                          ) : planDate ? (
                            <span className="text-xs font-medium">{planDate}</span>
                          ) : (
                            ''
                          )}
                        </td>
                      );
                    })}
                  </tr>
                  {/* Actual Row */}
                  <tr className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-2 py-1 text-center text-xs font-medium">
                      A
                    </td>
                    {allMonths.map((month, idx) => {
                      const monthData = training.dates?.[month] || {};
                      const actualDate = monthData.actual || '';
                      return (
                        <td key={idx} className="border border-gray-300 px-2 py-1 text-center text-xs min-w-[60px]">
                          {isAdmin ? (
                            <Input
                              type="text"
                              value={actualDate}
                              onChange={(e) => handleDateChange(index, month, 'actual', e.target.value)}
                              onBlur={(e) => handleDateChange(index, month, 'actual', e.target.value)}
                              className="w-full text-xs text-center h-6"
                              placeholder=""
                            />
                          ) : actualDate ? (
                            <span className="text-xs font-medium">{actualDate}</span>
                          ) : (
                            ''
                          )}
                        </td>
                      );
                    })}
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


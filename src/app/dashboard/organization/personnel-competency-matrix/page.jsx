'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { Input } from '@/components/ui/Input';

export default function PersonnelCompetencyMatrixPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [documentInfo, setDocumentInfo] = useState(null);
  const [migrationRequired, setMigrationRequired] = useState(false);
  
  // Table data structure matching the images
  const [tableData, setTableData] = useState([
    {
      sNo: 1,
      name: '0',
      designation: 'Factory Manager',
      qualification: '0',
      experience: '0',
      jobRelatedSkills: 'Factory Incharge, Administration, Customer Relationship, Process Control, Raw Material Purchase'
    },
    {
      sNo: 2,
      name: '0',
      designation: 'Management Representative',
      qualification: '0',
      experience: '0',
      jobRelatedSkills: 'EMS Manuals, Distribution, Legals, Management Review Meeting, Internal Audits'
    },
    {
      sNo: 3,
      name: '0',
      designation: 'Legal Requirements',
      qualification: '0',
      experience: '0',
      jobRelatedSkills: 'All Legals and Operating Permits, Submission of Renewal Consents'
    },
    {
      sNo: 4,
      name: '0',
      designation: 'Social Audit',
      qualification: '0',
      experience: '0',
      jobRelatedSkills: 'Following up Social Audit Requirements, Social Compliance'
    },
    {
      sNo: 5,
      name: '0',
      designation: 'Traceability',
      qualification: '0',
      experience: '0',
      jobRelatedSkills: 'Incoming and Outgoing Traceability'
    },
    {
      sNo: 6,
      name: '0',
      designation: 'Environmental Management',
      qualification: '0',
      experience: '0',
      jobRelatedSkills: 'EMS Policy, EMS Procedures, EMS Trainings, EMS Objectives and Targets, EMS Aspect and Impact'
    },
    {
      sNo: 7,
      name: '0',
      designation: 'RSL Requirement',
      qualification: '0',
      experience: '0',
      jobRelatedSkills: 'Own RSL Updation, Customer Requirements, Chemical and Physical Test, Third Party Test Reports follow up, Internal Testing'
    },
    {
      sNo: 8,
      name: '0',
      designation: 'Energy',
      qualification: '0',
      experience: '0',
      jobRelatedSkills: 'Electricity Monitoring, Diesel Consumption Records'
    },
    {
      sNo: 9,
      name: '0',
      designation: 'Water',
      qualification: '0',
      experience: '0',
      jobRelatedSkills: 'Water Savings, Water Meters Calibration, Monitoring of Effluent Treatment Water'
    },
    {
      sNo: 10,
      name: '0',
      designation: 'Air & Noise',
      qualification: '0',
      experience: '0',
      jobRelatedSkills: 'Air and Noise Monitoring, Stack Monitoring, Third Party Testing'
    },
    {
      sNo: 11,
      name: '0',
      designation: 'Waste Management',
      qualification: '0',
      experience: '0',
      jobRelatedSkills: 'Handling of Hazardous and Non Hazardous Wastes, Form-10 follow up, Scrap Agents Updations'
    },
    {
      sNo: 12,
      name: '0',
      designation: 'Effluent Treatment',
      qualification: '0',
      experience: '0',
      jobRelatedSkills: 'Effluent Water Monitoring, Internal Testing'
    },
    {
      sNo: 13,
      name: '0',
      designation: 'Chemical Management',
      qualification: '0',
      experience: '0',
      jobRelatedSkills: 'Policy, Handling Procedures, Stock Monitoring, Arrival and Issue Register, MSDS follow up, Proper Segregation of Hazardous Chemicals as per Compatibility Chart'
    },
    {
      sNo: 14,
      name: '0',
      designation: 'H&S / Emergency Plans',
      qualification: '0',
      experience: '0',
      jobRelatedSkills: 'Fire Fighting, Emergency Contacts, Risk Assessments, Aisle Markings, Proper Housekeeping'
    },
    {
      sNo: 15,
      name: '0',
      designation: 'Electrical Maintenance',
      qualification: '0',
      experience: '0',
      jobRelatedSkills: 'EB panel Monitoring, EB Reading & Electrical Related Works carried out'
    },
    {
      sNo: 16,
      name: '0',
      designation: 'Environmental Engineer',
      qualification: '0',
      experience: '0',
      jobRelatedSkills: 'ETP Monitoring Outlet Water Reading, Pumping and ETP Related work Carried out'
    },
    {
      sNo: 17,
      name: '0',
      designation: 'Dyeing Technician',
      qualification: '0',
      experience: '0',
      jobRelatedSkills: 'Colour Matching, Drum Planning & Chemical Planning'
    },
    {
      sNo: 18,
      name: '0',
      designation: 'Finishing Technician',
      qualification: '0',
      experience: '0',
      jobRelatedSkills: 'Colour Matching, Finishing work Planning & Chemical Planning'
    },
    {
      sNo: 19,
      name: '0',
      designation: 'WetBlue Control',
      qualification: '0',
      experience: '0',
      jobRelatedSkills: 'Wetblue grade wise assortment and measurement'
    },
    {
      sNo: 20,
      name: '0',
      designation: 'Crust Control',
      qualification: '0',
      experience: '0',
      jobRelatedSkills: 'Crust Colour Matching Assortment'
    },
    {
      sNo: 21,
      name: '0',
      designation: 'Final Control',
      qualification: '0',
      experience: '0',
      jobRelatedSkills: 'Satra Standard & Grade Wise Assortment'
    },
    {
      sNo: 22,
      name: '0',
      designation: 'Sample Development',
      qualification: '0',
      experience: '0',
      jobRelatedSkills: 'Sample followup'
    },
    {
      sNo: 23,
      name: '0',
      designation: 'Physical Lab',
      qualification: '0',
      experience: '0',
      jobRelatedSkills: 'Physical Testing'
    },
    {
      sNo: 24,
      name: '0',
      designation: 'Maintenance Material Store',
      qualification: '0',
      experience: '0',
      jobRelatedSkills: 'Maintenance Material Purchase plan, Inventory maintain, Stock follow up'
    },
    {
      sNo: 25,
      name: '0',
      designation: 'Chemical Store',
      qualification: '0',
      experience: '0',
      jobRelatedSkills: 'Chemical Purchase plan, Inventory maintain, Stock follow up'
    }
  ]);

  const isAdmin = session?.user?.role === 'SUPER_ADMIN' || session?.user?.role === 'ADMIN';

  useEffect(() => {
    fetchDocumentContent();
  }, []);

  const fetchDocumentContent = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/organization/documents/content?documentName=ENVIRONMENTAL PERSONNEL COMPETENCY MATRIX');
      const data = await res.json();
      
      if (res.ok) {
        if (data.data?.migrationRequired) {
          setMigrationRequired(true);
        } else if (data.data?.content) {
          setTableData(data.data.content.content || tableData);
          setDocumentInfo({
            docNo: data.data.document.docNo || 'ESF-EMS-PCM-01',
            revDate: data.data.document.revDate || 'Rev.No-01/Date-01-01-2024',
            revisionNo: data.data.content.revisionNo,
            revisionDate: data.data.content.revisionDate
          });
        } else {
          setDocumentInfo({
            docNo: 'ESF-EMS-PCM-01',
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
    const updatedData = [...tableData];
    updatedData[index] = {
      ...updatedData[index],
      [field]: value
    };
    setTableData(updatedData);

    // Save to database
    try {
      const res = await fetch('/api/organization/documents/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentName: 'ENVIRONMENTAL PERSONNEL COMPETENCY MATRIX',
          content: updatedData,
          changeDescription: `Updated row ${index + 1} - ${field}`
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

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'organization', label: 'Organization', href: '/dashboard/organization' },
    { key: 'documents', label: 'Document Details', href: '/dashboard/organization/documents' },
    { key: 'personnel-competency-matrix', label: 'Personnel Competency Matrix', href: '#' },
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
                Environmental Personnel Competency Matrix
              </h1>
              <p className="text-sm text-gray-600 mt-1">ESF-EMS-PCM-01 - Environmental Management System</p>
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
          <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
            <thead className="bg-orange-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border border-gray-300">
                  S. No
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border border-gray-300">
                  NAME
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border border-gray-300">
                  DESIGNATION
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border border-gray-300">
                  QUALIFICATION
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border border-gray-300">
                  EXPERIENCE
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border border-gray-300">
                  JOB RELATED SKILLS
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tableData.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900 border border-gray-300 text-center">
                    {row.sNo}
                  </td>
                  <td className="px-4 py-3 border border-gray-300">
                    {isAdmin ? (
                      <Input
                        type="text"
                        value={row.name}
                        onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
                        onBlur={(e) => handleFieldChange(index, 'name', e.target.value)}
                        className="w-full text-sm"
                      />
                    ) : (
                      <span className="text-sm text-gray-900">{row.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 border border-gray-300">
                    {isAdmin ? (
                      <Input
                        type="text"
                        value={row.designation}
                        onChange={(e) => handleFieldChange(index, 'designation', e.target.value)}
                        onBlur={(e) => handleFieldChange(index, 'designation', e.target.value)}
                        className="w-full text-sm"
                      />
                    ) : (
                      <span>{row.designation}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 border border-gray-300">
                    {isAdmin ? (
                      <Input
                        type="text"
                        value={row.qualification}
                        onChange={(e) => handleFieldChange(index, 'qualification', e.target.value)}
                        onBlur={(e) => handleFieldChange(index, 'qualification', e.target.value)}
                        className="w-full text-sm"
                      />
                    ) : (
                      <span className="text-sm text-gray-900">{row.qualification}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 border border-gray-300">
                    {isAdmin ? (
                      <Input
                        type="text"
                        value={row.experience}
                        onChange={(e) => handleFieldChange(index, 'experience', e.target.value)}
                        onBlur={(e) => handleFieldChange(index, 'experience', e.target.value)}
                        className="w-full text-sm"
                      />
                    ) : (
                      <span className="text-sm text-gray-900">{row.experience}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 border border-gray-300">
                    {isAdmin ? (
                      <textarea
                        value={row.jobRelatedSkills}
                        onChange={(e) => handleFieldChange(index, 'jobRelatedSkills', e.target.value)}
                        onBlur={(e) => handleFieldChange(index, 'jobRelatedSkills', e.target.value)}
                        className="w-full text-sm border border-gray-300 rounded px-2 py-1 min-h-[60px]"
                        rows={2}
                      />
                    ) : (
                      <span className="text-sm text-gray-900">{row.jobRelatedSkills}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


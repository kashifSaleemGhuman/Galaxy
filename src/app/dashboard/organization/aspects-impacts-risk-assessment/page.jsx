'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { Input } from '@/components/ui/Input';

export default function AspectsImpactsRiskAssessmentPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [documentInfo, setDocumentInfo] = useState(null);
  const [migrationRequired, setMigrationRequired] = useState(false);
  
  // Risk Assessment Procedure data structure
  const [riskAssessmentData, setRiskAssessmentData] = useState({
    scaleTable: [
      { ratingScore: 1, scale: '', exposureToPerson: '1', physicalBoundary: 'Within Working Station' },
      { ratingScore: 2, scale: '', exposureToPerson: '1 - 2', physicalBoundary: 'Within Department' },
      { ratingScore: 3, scale: '', exposureToPerson: '5 - 15', physicalBoundary: 'Within Factory Building' },
      { ratingScore: 4, scale: '', exposureToPerson: '15 - 25', physicalBoundary: 'Within Factory Premises' },
      { ratingScore: 5, scale: '', exposureToPerson: 'Above 25', physicalBoundary: 'Outside Factory Premises' }
    ],
    severityTable: [
      {
        ratingScore: 1,
        temperature: '25 - 35°C',
        physicalInjury: 'Small cuts / injury requiring first aid and person can return to work within 1/2 hours',
        noise: '≤ 40 dB',
        illnessGeneral: 'Momentary discomfort / nuisance e.g., Headache, burning of eyes, giddiness a person can return back to work after rest',
        fumesVapourDust: 'Momentary discomfort / odour / nuisance and cough / eye irritation',
        ergonomics: 'Stress & strain'
      },
      {
        ratingScore: 2,
        temperature: '35 - 40°C / 19 - 25 °C',
        physicalInjury: 'Oral injury requiring nurse or doctor\'s attention and person can return to work within 8 hours',
        noise: '40 - 65 dB',
        illnessGeneral: 'Minor health impact requiring nurse / doctors\' attention and person can return to work within 8 hours',
        fumesVapourDust: 'Suffocation, burning of eyes / strain, mild dizziness, headache, skin irritation',
        ergonomics: 'Effect on vision, mild ache, body / back pain'
      }
    ],
    probabilityTable: [
      { ratingScore: 1, probability: 'More than six Months' },
      { ratingScore: 2, probability: 'Once in a month to six month' },
      { ratingScore: 3, probability: 'once in a week to month' },
      { ratingScore: 4, probability: 'once in a day to week' }
    ],
    presentControlTable: [
      { ratingScore: 1, control: 'Control applicable, available, and effective' },
      { ratingScore: 2, control: 'Control applicable, fully, or partially available, not effective' },
      { ratingScore: 3, control: 'Controls not available' },
      { ratingScore: 4, control: 'Not possible to control' }
    ],
    classificationTable: [
      { rpn: '1 - 8', classification: 'LOW', description: 'Less significant hazards / risks requiring monitoring for existing controls. No additional controls are required.' },
      { rpn: '9 - 27', classification: 'Medium', description: 'Hazards or risk requiring control methods to be assigned and control methods should be monitored. Minimum OCP is required to Monitor / Measure the Process. If possible, Take Objective & Target to reduce the Severity to Low Risk.' },
      { rpn: '>48', classification: 'High (Intolerable / Unacceptable Risk)', description: 'Work to be stopped immediately. OHSAS objectives, Targets & Management Programs to be initiated to reduce the risk to Medium / Low Risk. Temporarily, Additional Controls to be depolyed until obejctive & Targets are completed.' }
    ]
  });

  const isAdmin = session?.user?.role === 'SUPER_ADMIN' || session?.user?.role === 'ADMIN';

  useEffect(() => {
    fetchDocumentContent();
  }, []);

  const fetchDocumentContent = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/organization/documents/content?documentName=Aspects & Impacts Risk Assessment Procedure');
      const data = await res.json();
      
      if (res.ok) {
        if (data.data?.migrationRequired) {
          setMigrationRequired(true);
        } else if (data.data?.content) {
          const loadedData = data.data.content.content || riskAssessmentData;
          setRiskAssessmentData(loadedData);
          setDocumentInfo({
            docNo: data.data.document.docNo || 'ESF-EMS-EAIP-13',
            revDate: data.data.document.revDate || 'Rev.No-01/Date-01-01-2024',
            revisionNo: data.data.content.revisionNo,
            revisionDate: data.data.content.revisionDate
          });
        } else {
          setDocumentInfo({
            docNo: 'ESF-EMS-EAIP-13',
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

  const handleTableChange = (tableName, index, field, value) => {
    setRiskAssessmentData({
      ...riskAssessmentData,
      [tableName]: riskAssessmentData[tableName].map((row, i) => 
        i === index ? { ...row, [field]: value } : row
      )
    });
  };

  const handleAddRow = (tableName) => {
    const newRow = getDefaultRowForTable(tableName);
    setRiskAssessmentData({
      ...riskAssessmentData,
      [tableName]: [...riskAssessmentData[tableName], newRow]
    });
  };

  const handleDeleteRow = (tableName, index) => {
    if (riskAssessmentData[tableName].length > 1) {
      setRiskAssessmentData({
        ...riskAssessmentData,
        [tableName]: riskAssessmentData[tableName].filter((_, i) => i !== index)
      });
    }
  };

  const getDefaultRowForTable = (tableName) => {
    switch (tableName) {
      case 'scaleTable':
        return { ratingScore: riskAssessmentData.scaleTable.length + 1, scale: '', exposureToPerson: '', physicalBoundary: '' };
      case 'severityTable':
        return { ratingScore: riskAssessmentData.severityTable.length + 1, temperature: '', physicalInjury: '', noise: '', illnessGeneral: '', fumesVapourDust: '', ergonomics: '' };
      case 'probabilityTable':
        return { ratingScore: riskAssessmentData.probabilityTable.length + 1, probability: '' };
      case 'presentControlTable':
        return { ratingScore: riskAssessmentData.presentControlTable.length + 1, control: '' };
      case 'classificationTable':
        return { rpn: '', classification: '', description: '' };
      default:
        return {};
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch('/api/organization/documents/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentName: 'Aspects & Impacts Risk Assessment Procedure',
          content: riskAssessmentData,
          changeDescription: 'Updated aspects & impacts risk assessment procedure'
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

      setToast({ type: 'success', message: 'Risk assessment procedure saved successfully. Revision number incremented.' });
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
    { key: 'risk-assessment', label: 'Aspects & Impacts Risk Assessment Procedure', href: '#' },
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
              Aspects & Impacts Risk Assessment Procedure
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
                onClick={handleSave}
                className="px-6"
              >
                Save
              </Button>
            </div>
          )}

          {/* Scale Table */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-gray-900">Scale can be derived from the below table</h2>
              {isAdmin && (
                <Button
                  variant="outline"
                  onClick={() => handleAddRow('scaleTable')}
                  className="px-4"
                >
                  + Add Row
                </Button>
              )}
            </div>
            <div className="overflow-x-auto border border-gray-300 rounded-md">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-3 py-2 text-center text-xs font-semibold text-gray-700">
                      Rating Score
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                      Scale
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                      Exposure To Number Of Person
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                      Physical Boundary
                    </th>
                    {isAdmin && (
                      <th className="border border-gray-300 px-3 py-2 text-center text-xs font-semibold text-gray-700">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {riskAssessmentData.scaleTable.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-3 py-2 text-center text-sm">
                        {isAdmin ? (
                          <Input
                            type="number"
                            value={row.ratingScore}
                            onChange={(e) => handleTableChange('scaleTable', index, 'ratingScore', e.target.value)}
                            className="w-20 text-sm text-center"
                          />
                        ) : (
                          <span>{row.ratingScore}</span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {isAdmin ? (
                          <Input
                            type="text"
                            value={row.scale}
                            onChange={(e) => handleTableChange('scaleTable', index, 'scale', e.target.value)}
                            className="w-full text-sm"
                          />
                        ) : (
                          <span className="text-sm">{row.scale || '-'}</span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {isAdmin ? (
                          <Input
                            type="text"
                            value={row.exposureToPerson}
                            onChange={(e) => handleTableChange('scaleTable', index, 'exposureToPerson', e.target.value)}
                            className="w-full text-sm"
                          />
                        ) : (
                          <span className="text-sm">{row.exposureToPerson || '-'}</span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {isAdmin ? (
                          <Input
                            type="text"
                            value={row.physicalBoundary}
                            onChange={(e) => handleTableChange('scaleTable', index, 'physicalBoundary', e.target.value)}
                            className="w-full text-sm"
                          />
                        ) : (
                          <span className="text-sm">{row.physicalBoundary || '-'}</span>
                        )}
                      </td>
                      {isAdmin && (
                        <td className="border border-gray-300 px-2 py-1 text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteRow('scaleTable', index)}
                            disabled={riskAssessmentData.scaleTable.length === 1}
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

          {/* Severity Of Risk Table */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-gray-900">Severity can be derived from the below table</h2>
              {isAdmin && (
                <Button
                  variant="outline"
                  onClick={() => handleAddRow('severityTable')}
                  className="px-4"
                >
                  + Add Row
                </Button>
              )}
            </div>
            <div className="overflow-x-auto border border-gray-300 rounded-md">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-3 py-2 text-center text-xs font-semibold text-gray-700">
                      Rating Score
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                      Temperature
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                      Physical Injury
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                      Noise
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                      Illness (General)
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                      Fumes/Vapour/Dust
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                      Ergonomics
                    </th>
                    {isAdmin && (
                      <th className="border border-gray-300 px-3 py-2 text-center text-xs font-semibold text-gray-700">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {riskAssessmentData.severityTable.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-3 py-2 text-center text-sm">
                        {isAdmin ? (
                          <Input
                            type="number"
                            value={row.ratingScore}
                            onChange={(e) => handleTableChange('severityTable', index, 'ratingScore', e.target.value)}
                            className="w-20 text-sm text-center"
                          />
                        ) : (
                          <span>{row.ratingScore}</span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {isAdmin ? (
                          <Input
                            type="text"
                            value={row.temperature}
                            onChange={(e) => handleTableChange('severityTable', index, 'temperature', e.target.value)}
                            className="w-full text-sm"
                          />
                        ) : (
                          <span className="text-sm">{row.temperature || '-'}</span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {isAdmin ? (
                          <textarea
                            value={row.physicalInjury}
                            onChange={(e) => handleTableChange('severityTable', index, 'physicalInjury', e.target.value)}
                            className="w-full text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={2}
                          />
                        ) : (
                          <span className="text-sm">{row.physicalInjury || '-'}</span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {isAdmin ? (
                          <Input
                            type="text"
                            value={row.noise}
                            onChange={(e) => handleTableChange('severityTable', index, 'noise', e.target.value)}
                            className="w-full text-sm"
                          />
                        ) : (
                          <span className="text-sm">{row.noise || '-'}</span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {isAdmin ? (
                          <textarea
                            value={row.illnessGeneral}
                            onChange={(e) => handleTableChange('severityTable', index, 'illnessGeneral', e.target.value)}
                            className="w-full text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={2}
                          />
                        ) : (
                          <span className="text-sm">{row.illnessGeneral || '-'}</span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {isAdmin ? (
                          <textarea
                            value={row.fumesVapourDust}
                            onChange={(e) => handleTableChange('severityTable', index, 'fumesVapourDust', e.target.value)}
                            className="w-full text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={2}
                          />
                        ) : (
                          <span className="text-sm">{row.fumesVapourDust || '-'}</span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {isAdmin ? (
                          <Input
                            type="text"
                            value={row.ergonomics}
                            onChange={(e) => handleTableChange('severityTable', index, 'ergonomics', e.target.value)}
                            className="w-full text-sm"
                          />
                        ) : (
                          <span className="text-sm">{row.ergonomics || '-'}</span>
                        )}
                      </td>
                      {isAdmin && (
                        <td className="border border-gray-300 px-2 py-1 text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteRow('severityTable', index)}
                            disabled={riskAssessmentData.severityTable.length === 1}
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

          {/* Probability of Occurrence Table */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-gray-900">Probability of occurrence can be derived from below table</h2>
              {isAdmin && (
                <Button
                  variant="outline"
                  onClick={() => handleAddRow('probabilityTable')}
                  className="px-4"
                >
                  + Add Row
                </Button>
              )}
            </div>
            <div className="overflow-x-auto border border-gray-300 rounded-md">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-3 py-2 text-center text-xs font-semibold text-gray-700">
                      Rating Score
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                      Probability of occurrence
                    </th>
                    {isAdmin && (
                      <th className="border border-gray-300 px-3 py-2 text-center text-xs font-semibold text-gray-700">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {riskAssessmentData.probabilityTable.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-3 py-2 text-center text-sm">
                        {isAdmin ? (
                          <Input
                            type="number"
                            value={row.ratingScore}
                            onChange={(e) => handleTableChange('probabilityTable', index, 'ratingScore', e.target.value)}
                            className="w-20 text-sm text-center"
                          />
                        ) : (
                          <span>{row.ratingScore}</span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {isAdmin ? (
                          <Input
                            type="text"
                            value={row.probability}
                            onChange={(e) => handleTableChange('probabilityTable', index, 'probability', e.target.value)}
                            className="w-full text-sm"
                          />
                        ) : (
                          <span className="text-sm">{row.probability || '-'}</span>
                        )}
                      </td>
                      {isAdmin && (
                        <td className="border border-gray-300 px-2 py-1 text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteRow('probabilityTable', index)}
                            disabled={riskAssessmentData.probabilityTable.length === 1}
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

          {/* Present Control Table */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-gray-900">Present control can be derived from below table</h2>
              {isAdmin && (
                <Button
                  variant="outline"
                  onClick={() => handleAddRow('presentControlTable')}
                  className="px-4"
                >
                  + Add Row
                </Button>
              )}
            </div>
            <div className="overflow-x-auto border border-gray-300 rounded-md">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-3 py-2 text-center text-xs font-semibold text-gray-700">
                      Rating Score
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                      Present Control
                    </th>
                    {isAdmin && (
                      <th className="border border-gray-300 px-3 py-2 text-center text-xs font-semibold text-gray-700">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {riskAssessmentData.presentControlTable.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-3 py-2 text-center text-sm">
                        {isAdmin ? (
                          <Input
                            type="number"
                            value={row.ratingScore}
                            onChange={(e) => handleTableChange('presentControlTable', index, 'ratingScore', e.target.value)}
                            className="w-20 text-sm text-center"
                          />
                        ) : (
                          <span>{row.ratingScore}</span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {isAdmin ? (
                          <Input
                            type="text"
                            value={row.control}
                            onChange={(e) => handleTableChange('presentControlTable', index, 'control', e.target.value)}
                            className="w-full text-sm"
                          />
                        ) : (
                          <span className="text-sm">{row.control || '-'}</span>
                        )}
                      </td>
                      {isAdmin && (
                        <td className="border border-gray-300 px-2 py-1 text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteRow('presentControlTable', index)}
                            disabled={riskAssessmentData.presentControlTable.length === 1}
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

          {/* Classification of Risk / Score Table */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-gray-900">Classification of Risk / Score</h2>
              {isAdmin && (
                <Button
                  variant="outline"
                  onClick={() => handleAddRow('classificationTable')}
                  className="px-4"
                >
                  + Add Row
                </Button>
              )}
            </div>
            <div className="overflow-x-auto border border-gray-300 rounded-md">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                      RPN (Risk Priority Number)
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                      Classification
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                      Description
                    </th>
                    {isAdmin && (
                      <th className="border border-gray-300 px-3 py-2 text-center text-xs font-semibold text-gray-700">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {riskAssessmentData.classificationTable.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-2 py-1">
                        {isAdmin ? (
                          <Input
                            type="text"
                            value={row.rpn}
                            onChange={(e) => handleTableChange('classificationTable', index, 'rpn', e.target.value)}
                            className="w-full text-sm"
                          />
                        ) : (
                          <span className="text-sm">{row.rpn || '-'}</span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {isAdmin ? (
                          <Input
                            type="text"
                            value={row.classification}
                            onChange={(e) => handleTableChange('classificationTable', index, 'classification', e.target.value)}
                            className="w-full text-sm"
                          />
                        ) : (
                          <span className="text-sm">{row.classification || '-'}</span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {isAdmin ? (
                          <textarea
                            value={row.description}
                            onChange={(e) => handleTableChange('classificationTable', index, 'description', e.target.value)}
                            className="w-full text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={3}
                          />
                        ) : (
                          <span className="text-sm">{row.description || '-'}</span>
                        )}
                      </td>
                      {isAdmin && (
                        <td className="border border-gray-300 px-2 py-1 text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteRow('classificationTable', index)}
                            disabled={riskAssessmentData.classificationTable.length === 1}
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


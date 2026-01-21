'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { Input } from '@/components/ui/Input';

export default function EnvironmentalAspectsRegisterPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [documentInfo, setDocumentInfo] = useState(null);
  const [migrationRequired, setMigrationRequired] = useState(false);
  
  // Register of Environmental Aspects data structure - separate sections
  const [registerData, setRegisterData] = useState({
    section1: [
      {
        slNo: 1,
        contents: '',
        aspects: '',
        significant: ''
      }
    ],
    section2: [
      {
        slNo: 1,
        docNo: '',
        ocp: ''
      }
    ],
    section3: [
      {
        slNo: 1,
        docNo: '',
        sop: ''
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
      const res = await fetch('/api/organization/documents/content?documentName=ASPECT & IMPACT');
      const data = await res.json();
      
      if (res.ok) {
        if (data.data?.migrationRequired) {
          setMigrationRequired(true);
        } else if (data.data?.content) {
          const loadedData = data.data.content.content || registerData;
          // Migrate old structure if needed
          if (loadedData.tableData && !loadedData.section1) {
            loadedData.section1 = loadedData.tableData.map((row, index) => ({
              slNo: index + 1,
              contents: row.contents || '',
              aspects: row.aspects || '',
              significant: row.significant || ''
            }));
            // Migrate section2 from old docNoOCP field
            loadedData.section2 = loadedData.tableData.map((row, index) => {
              const ocpValue = row.docNoOCP || '';
              // Try to split "OCP 01 Noise Monitoring program" into "OCP 01" and "Noise Monitoring program"
              const parts = ocpValue.split(' ');
              const docNo = parts.length > 0 ? parts[0] : '';
              const ocp = parts.length > 1 ? parts.slice(1).join(' ') : '';
              return {
                slNo: index + 1,
                docNo: docNo,
                ocp: ocp
              };
            });
            // Migrate section3 from old docNoSOP field
            loadedData.section3 = loadedData.tableData.map((row, index) => {
              const sopValue = row.docNoSOP || '';
              // Try to split "SOP 01 Water measurement" into "SOP 01" and "Water measurement"
              const parts = sopValue.split(' ');
              const docNo = parts.length > 0 ? parts[0] : '';
              const sop = parts.length > 1 ? parts.slice(1).join(' ') : '';
              return {
                slNo: index + 1,
                docNo: docNo,
                sop: sop
              };
            });
          }
          // Migrate old section2 structure (docNoOCP/docNoSOP) to new structure
          if (loadedData.section2 && loadedData.section2.length > 0 && loadedData.section2[0].docNoOCP !== undefined) {
            loadedData.section2 = loadedData.section2.map((row) => {
              const ocpValue = row.docNoOCP || '';
              const parts = ocpValue.split(' ');
              const docNo = parts.length > 0 ? parts[0] : '';
              const ocp = parts.length > 1 ? parts.slice(1).join(' ') : '';
              return {
                slNo: row.slNo || 1,
                docNo: docNo,
                ocp: ocp
              };
            });
          }
          // Ensure section1 exists and has at least one row
          if (!loadedData.section1 || loadedData.section1.length === 0) {
            loadedData.section1 = [{
              slNo: 1,
              contents: '',
              aspects: '',
              significant: ''
            }];
          }
          // Ensure section2 exists and has at least one row
          if (!loadedData.section2 || loadedData.section2.length === 0) {
            loadedData.section2 = [{
              slNo: 1,
              docNo: '',
              ocp: ''
            }];
          }
          // Ensure section3 exists and has at least one row
          if (!loadedData.section3 || loadedData.section3.length === 0) {
            loadedData.section3 = [{
              slNo: 1,
              docNo: '',
              sop: ''
            }];
          }
          // Ensure slNo is set for all rows in all sections
          loadedData.section1 = loadedData.section1.map((row, index) => ({
            ...row,
            slNo: row.slNo || index + 1
          }));
          loadedData.section2 = loadedData.section2.map((row, index) => ({
            ...row,
            slNo: row.slNo || index + 1
          }));
          loadedData.section3 = loadedData.section3.map((row, index) => ({
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

  const handleSection1Change = (index, field, value) => {
    setRegisterData({
      ...registerData,
      section1: registerData.section1.map((row, i) => 
        i === index ? { ...row, [field]: value } : row
      )
    });
  };

  const handleSection2Change = (index, field, value) => {
    setRegisterData({
      ...registerData,
      section2: registerData.section2.map((row, i) => 
        i === index ? { ...row, [field]: value } : row
      )
    });
  };

  const handleAddRowSection1 = () => {
    setRegisterData({
      ...registerData,
      section1: [
        ...registerData.section1,
        {
          slNo: registerData.section1.length + 1,
          contents: '',
          aspects: '',
          significant: ''
        }
      ]
    });
  };

  const handleAddRowSection2 = () => {
    setRegisterData({
      ...registerData,
      section2: [
        ...registerData.section2,
        {
          slNo: registerData.section2.length + 1,
          docNo: '',
          ocp: ''
        }
      ]
    });
  };

  const handleSection3Change = (index, field, value) => {
    setRegisterData({
      ...registerData,
      section3: registerData.section3.map((row, i) => 
        i === index ? { ...row, [field]: value } : row
      )
    });
  };

  const handleAddRowSection3 = () => {
    setRegisterData({
      ...registerData,
      section3: [
        ...registerData.section3,
        {
          slNo: registerData.section3.length + 1,
          docNo: '',
          sop: ''
        }
      ]
    });
  };

  const handleDeleteRowSection1 = (index) => {
    if (registerData.section1.length > 1) {
      const newSection1 = registerData.section1.filter((_, i) => i !== index);
      // Re-number the rows
      const renumberedData = newSection1.map((row, i) => ({
        ...row,
        slNo: i + 1
      }));
      setRegisterData({
        ...registerData,
        section1: renumberedData
      });
    }
  };

  const handleDeleteRowSection2 = (index) => {
    if (registerData.section2.length > 1) {
      const newSection2 = registerData.section2.filter((_, i) => i !== index);
      // Re-number the rows
      const renumberedData = newSection2.map((row, i) => ({
        ...row,
        slNo: i + 1
      }));
      setRegisterData({
        ...registerData,
        section2: renumberedData
      });
    }
  };

  const handleDeleteRowSection3 = (index) => {
    if (registerData.section3.length > 1) {
      const newSection3 = registerData.section3.filter((_, i) => i !== index);
      // Re-number the rows
      const renumberedData = newSection3.map((row, i) => ({
        ...row,
        slNo: i + 1
      }));
      setRegisterData({
        ...registerData,
        section3: renumberedData
      });
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch('/api/organization/documents/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentName: 'ASPECT & IMPACT',
          content: registerData,
          changeDescription: 'Updated register of environmental aspects'
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

      setToast({ type: 'success', message: 'Register of environmental aspects saved successfully. Revision number incremented.' });
    } catch (error) {
      console.error('Error saving register:', error);
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
    { key: 'environmental-aspects-register', label: 'Register of Environmental Aspects', href: '#' },
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
                Register of Environmental Aspects
              </h1>
              <p className="text-sm text-gray-600 mt-1">ESF-EMS-EIA-15 - Environmental Management System</p>
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

          {/* Section 1: Register Table with 4 columns */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                REGISTER OF ENVIRONMENTAL ASPECTS - SECTION 1
              </label>
              {isAdmin && (
                <Button
                  variant="outline"
                  onClick={handleAddRowSection1}
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
                    <th className="border border-gray-300 px-4 py-2 text-center text-xs font-semibold text-gray-700">
                      Sl.No
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-xs font-semibold text-gray-700">
                      Contents of Register of Environmental Aspects
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-center text-xs font-semibold text-gray-700">
                      Aspects
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-center text-xs font-semibold text-gray-700">
                      Significant
                    </th>
                    {isAdmin && (
                      <th className="border border-gray-300 px-4 py-2 text-center text-xs font-semibold text-gray-700">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {registerData.section1.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 text-center text-sm">
                        {row.slNo}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {isAdmin ? (
                          <Input
                            type="text"
                            value={row.contents}
                            onChange={(e) => handleSection1Change(index, 'contents', e.target.value)}
                            className="w-full text-sm"
                            placeholder="e.g., Raw Godown"
                          />
                        ) : (
                          <span className="text-sm">{row.contents || '-'}</span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {isAdmin ? (
                          <Input
                            type="text"
                            value={row.aspects}
                            onChange={(e) => handleSection1Change(index, 'aspects', e.target.value)}
                            className="w-full text-sm text-center"
                            placeholder="e.g., 9"
                          />
                        ) : (
                          <span className="text-sm text-center block">{row.aspects || '-'}</span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {isAdmin ? (
                          <Input
                            type="text"
                            value={row.significant}
                            onChange={(e) => handleSection1Change(index, 'significant', e.target.value)}
                            className="w-full text-sm text-center"
                            placeholder="e.g., 4"
                          />
                        ) : (
                          <span className="text-sm text-center block">{row.significant || '-'}</span>
                        )}
                      </td>
                      {isAdmin && (
                        <td className="border border-gray-300 px-2 py-1 text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteRowSection1(index)}
                            disabled={registerData.section1.length === 1}
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

          {/* Section 2: Document Numbers OCP Table with 2 columns */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                REGISTER OF ENVIRONMENTAL ASPECTS - SECTION 2
              </label>
              {isAdmin && (
                <Button
                  variant="outline"
                  onClick={handleAddRowSection2}
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
                    <th className="border border-gray-300 px-4 py-2 text-center text-xs font-semibold text-gray-700">
                      Sl.No
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-xs font-semibold text-gray-700">
                      Doc No
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-xs font-semibold text-gray-700">
                      OCP
                    </th>
                    {isAdmin && (
                      <th className="border border-gray-300 px-4 py-2 text-center text-xs font-semibold text-gray-700">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {registerData.section2.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 text-center text-sm">
                        {row.slNo}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {isAdmin ? (
                          <Input
                            type="text"
                            value={row.docNo}
                            onChange={(e) => handleSection2Change(index, 'docNo', e.target.value)}
                            className="w-full text-sm"
                            placeholder="e.g., OCP 01"
                          />
                        ) : (
                          <span className="text-sm">{row.docNo || '-'}</span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {isAdmin ? (
                          <Input
                            type="text"
                            value={row.ocp}
                            onChange={(e) => handleSection2Change(index, 'ocp', e.target.value)}
                            className="w-full text-sm"
                            placeholder="e.g., Noise Monitoring program"
                          />
                        ) : (
                          <span className="text-sm">{row.ocp || '-'}</span>
                        )}
                      </td>
                      {isAdmin && (
                        <td className="border border-gray-300 px-2 py-1 text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteRowSection2(index)}
                            disabled={registerData.section2.length === 1}
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

          {/* Section 3: Document Numbers SOP Table with 2 columns */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                REGISTER OF ENVIRONMENTAL ASPECTS - SECTION 3
              </label>
              {isAdmin && (
                <Button
                  variant="outline"
                  onClick={handleAddRowSection3}
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
                    <th className="border border-gray-300 px-4 py-2 text-center text-xs font-semibold text-gray-700">
                      Sl.No
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-xs font-semibold text-gray-700">
                      Doc No
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-xs font-semibold text-gray-700">
                      SOP
                    </th>
                    {isAdmin && (
                      <th className="border border-gray-300 px-4 py-2 text-center text-xs font-semibold text-gray-700">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {registerData.section3.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 text-center text-sm">
                        {row.slNo}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {isAdmin ? (
                          <Input
                            type="text"
                            value={row.docNo}
                            onChange={(e) => handleSection3Change(index, 'docNo', e.target.value)}
                            className="w-full text-sm"
                            placeholder="e.g., SOP 01"
                          />
                        ) : (
                          <span className="text-sm">{row.docNo || '-'}</span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {isAdmin ? (
                          <Input
                            type="text"
                            value={row.sop}
                            onChange={(e) => handleSection3Change(index, 'sop', e.target.value)}
                            className="w-full text-sm"
                            placeholder="e.g., Water measurement"
                          />
                        ) : (
                          <span className="text-sm">{row.sop || '-'}</span>
                        )}
                      </td>
                      {isAdmin && (
                        <td className="border border-gray-300 px-2 py-1 text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteRowSection3(index)}
                            disabled={registerData.section3.length === 1}
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


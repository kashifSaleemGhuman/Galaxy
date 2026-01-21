'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { Input } from '@/components/ui/Input';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function WasteGenerationPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [documentInfo, setDocumentInfo] = useState(null);
  const [migrationRequired, setMigrationRequired] = useState(false);
  const [isAddMonthModalOpen, setIsAddMonthModalOpen] = useState(false);
  const [newMonthName, setNewMonthName] = useState('');
  
  // Waste Generation data structure - monthly records (no predefined months)
  const [content, setContent] = useState({
    documentTitle: 'ESF LEATHER CONSULTANCY',
    documentId: 'ESF-WM-REG-001',
    monthlyRecords: []
  });

  const isAdmin = session?.user?.role === 'SUPER_ADMIN' || session?.user?.role === 'ADMIN';

  // Waste categories with their units
  const wasteCategories = [
    { key: 'emptyChemicalPlasticBarrels', label: 'Empty Chemical Plastic Barrels', unit: 'Nos' },
    { key: 'emptyChemicalBags', label: 'Empty Chemical Bags', unit: 'Nos' },
    { key: 'desaltedSalt', label: 'Desalted Salt', unit: 'Kgs' },
    { key: 'rawTrimmings', label: 'Raw Trimmings', unit: 'Kgs' },
    { key: 'limeHideFleshing', label: 'Lime Hide Fleshing', unit: 'Kgs' },
    { key: 'hair', label: 'Hair', unit: 'Kgs' },
    { key: 'tannedTrimmings', label: 'Tanned Trimmings', unit: 'Kgs' },
    { key: 'tannedShavingDust', label: 'Tanned Shaving Dust', unit: 'Kgs' },
    { key: 'buffingDust', label: 'Buffing Dust', unit: 'Kgs' },
    { key: 'crustFinishedLeatherTrimmings', label: 'Crust / Finished Leather Trimmings', unit: 'Kgs' },
    { key: 'wwtpSalt', label: 'WWTP Salt', unit: 'Kgs' },
    { key: 'wasteOil', label: 'Waste Oil', unit: 'Litres' },
    { key: 'etpSludgeWwtp', label: 'ETP Sludge (WWTP)', unit: 'Kgs' },
    { key: 'pallets', label: 'Pallets (1 Pallet = 25 Kg)', unit: 'Nos' },
    { key: 'paperWaste', label: 'Paper waste', unit: 'Kgs' },
    { key: 'foodWasteGeneral', label: 'Food waste / General', unit: 'Kgs' }
  ];

  useEffect(() => {
    fetchDocumentContent();
  }, []);

  const fetchDocumentContent = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/organization/documents/content?documentName=WASTE GENERATION');
      const data = await res.json();
      
      if (res.ok) {
        if (data.data?.migrationRequired) {
          setMigrationRequired(true);
        } else if (data.data?.content) {
          const loadedData = data.data.content.content || content;
          // Ensure monthlyRecords is an array
          if (!loadedData.monthlyRecords || !Array.isArray(loadedData.monthlyRecords)) {
            loadedData.monthlyRecords = [];
          }
          setContent(loadedData);
          setDocumentInfo({
            docNo: data.data.document.docNo || 'ESF-WM-REG-001',
            revDate: data.data.document.revDate || 'Rev.No-01/Date-21-01-2026',
            revisionNo: data.data.content.revisionNo,
            revisionDate: data.data.content.revisionDate
          });
        } else {
          setDocumentInfo({
            docNo: 'ESF-WM-REG-001',
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

  const handleTableChange = (monthIndex, field, value) => {
    const updatedContent = {
      ...content,
      monthlyRecords: content.monthlyRecords.map((record, i) => 
        i === monthIndex ? { ...record, [field]: value } : record
      )
    };
    setContent(updatedContent);
  };

  const handleAddMonthClick = () => {
    setNewMonthName('');
    setIsAddMonthModalOpen(true);
  };

  const handleAddMonth = () => {
    if (!newMonthName.trim()) {
      setToast({ type: 'error', message: 'Please enter a month name' });
      return;
    }

    // Check if month already exists
    const monthExists = content.monthlyRecords.some(
      record => record.month.toLowerCase() === newMonthName.trim().toLowerCase()
    );

    if (monthExists) {
      setToast({ type: 'error', message: 'This month already exists' });
      return;
    }

    const newRecord = {
      month: newMonthName.trim(),
      emptyChemicalPlasticBarrels: '',
      emptyChemicalBags: '',
      desaltedSalt: '',
      rawTrimmings: '',
      limeHideFleshing: '',
      hair: '',
      tannedTrimmings: '',
      tannedShavingDust: '',
      buffingDust: '',
      crustFinishedLeatherTrimmings: '',
      wwtpSalt: '',
      wasteOil: '',
      etpSludgeWwtp: '',
      pallets: '',
      paperWaste: '',
      foodWasteGeneral: ''
    };

    setContent({
      ...content,
      monthlyRecords: [...content.monthlyRecords, newRecord]
    });

    setIsAddMonthModalOpen(false);
    setNewMonthName('');
    setToast({ type: 'success', message: 'Month added successfully' });
  };

  const handleDeleteMonth = (monthIndex) => {
    if (content.monthlyRecords.length > 1) {
      setContent({
        ...content,
        monthlyRecords: content.monthlyRecords.filter((_, i) => i !== monthIndex)
      });
    }
  };

  const calculateTotal = (categoryKey) => {
    return content.monthlyRecords.reduce((sum, record) => {
      const value = parseFloat(record[categoryKey]) || 0;
      return sum + value;
    }, 0);
  };

  const handleSaveAll = async () => {
    try {
      const res = await fetch('/api/organization/documents/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentName: 'WASTE GENERATION',
          content: content,
          changeDescription: 'Updated waste generation records'
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

      setToast({ type: 'success', message: 'Waste generation records saved successfully. Revision number incremented.' });
    } catch (error) {
      console.error('Error saving records:', error);
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
    { key: 'waste-generation', label: 'Waste Generation', href: '#' },
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
              Waste Generation Register
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
          {/* Document Title and ID */}
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{content.documentTitle || 'ESF LEATHER CONSULTANCY'}</h2>
              <p className="text-sm text-gray-600">Document ID: {content.documentId || 'ESF-WM-REG-001'}</p>
            </div>
            {isAdmin && (
              <Button
                onClick={handleSaveAll}
                className="px-6"
              >
                Save All Changes
              </Button>
            )}
          </div>

          {/* Waste Generation Table */}
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden border border-gray-300 rounded-md">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="sticky left-0 z-10 bg-gray-100 border-r border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700 min-w-[100px]">
                        Month
                      </th>
                      {wasteCategories.map((category) => (
                        <th key={category.key} className="border border-gray-300 px-2 py-2 text-center text-xs font-semibold text-gray-700 min-w-[120px]">
                          <div className="font-medium">{category.label}</div>
                          <div className="text-xs text-gray-500 mt-1">({category.unit})</div>
                        </th>
                      ))}
                      {isAdmin && (
                        <th className="border border-gray-300 px-3 py-2 text-center text-xs font-semibold text-gray-700 min-w-[80px]">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {content.monthlyRecords.length === 0 ? (
                      <tr>
                        <td 
                          colSpan={wasteCategories.length + (isAdmin ? 2 : 1)} 
                          className="px-6 py-8 text-center text-gray-500"
                        >
                          No months added yet. Click "Add Month" to start adding waste generation records.
                        </td>
                      </tr>
                    ) : (
                      content.monthlyRecords.map((record, monthIndex) => (
                      <tr key={monthIndex} className="hover:bg-gray-50">
                        <td className="sticky left-0 z-10 bg-white border-r border-gray-300 px-2 py-1">
                          {isAdmin ? (
                            <Input
                              type="text"
                              value={record.month}
                              onChange={(e) => handleTableChange(monthIndex, 'month', e.target.value)}
                              className="w-full text-sm font-medium"
                            />
                          ) : (
                            <span className="text-sm font-medium text-gray-900">{record.month}</span>
                          )}
                        </td>
                        {wasteCategories.map((category) => (
                          <td key={category.key} className="border border-gray-300 px-2 py-1">
                            {isAdmin ? (
                              <Input
                                type="text"
                                value={record[category.key] || ''}
                                onChange={(e) => handleTableChange(monthIndex, category.key, e.target.value)}
                                className="w-full text-sm text-center"
                                placeholder="0"
                              />
                            ) : (
                              <span className="text-sm text-gray-700 block text-center">
                                {record[category.key] || '-'}
                              </span>
                            )}
                          </td>
                        ))}
                        {isAdmin && (
                          <td className="border border-gray-300 px-2 py-1 text-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteMonth(monthIndex)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Delete
                            </Button>
                          </td>
                        )}
                      </tr>
                      ))
                    )}
                    {/* TOTAL Row - Only show if there are records */}
                    {content.monthlyRecords.length > 0 && (
                      <tr className="bg-gray-100 font-semibold">
                      <td className="sticky left-0 z-10 bg-gray-100 border-r border-gray-300 px-3 py-2 text-sm font-bold text-gray-900">
                        TOTAL
                      </td>
                      {wasteCategories.map((category) => {
                        const total = calculateTotal(category.key);
                        return (
                          <td key={category.key} className="border border-gray-300 px-2 py-2 text-sm font-bold text-gray-900 text-center">
                            {total > 0 ? total : '-'}
                          </td>
                        );
                      })}
                      {isAdmin && (
                        <td className="border border-gray-300 px-2 py-1"></td>
                      )}
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Add Month Button */}
          {isAdmin && (
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={handleAddMonthClick}
                className="px-4"
              >
                + Add Month
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Add Month Modal */}
      <Dialog 
        open={isAddMonthModalOpen} 
        onClose={() => {
          setIsAddMonthModalOpen(false);
          setNewMonthName('');
        }}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-md w-full bg-white rounded-xl shadow-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <Dialog.Title className="text-lg font-semibold text-gray-900">
                Add New Month
              </Dialog.Title>
              <button
                onClick={() => {
                  setIsAddMonthModalOpen(false);
                  setNewMonthName('');
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleAddMonth();
              }} 
              className="p-6 space-y-4"
            >
              <div>
                <label htmlFor="monthName" className="block text-sm font-medium text-gray-700 mb-1">
                  Month Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="monthName"
                  type="text"
                  value={newMonthName}
                  onChange={(e) => setNewMonthName(e.target.value)}
                  placeholder="e.g., Jan-2022, Feb-2023"
                  required
                  autoFocus
                />
                <p className="mt-1 text-xs text-gray-500">
                  Enter the month name in any format (e.g., Jan-2022, February 2023, etc.)
                </p>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddMonthModalOpen(false);
                    setNewMonthName('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                >
                  Add Month
                </Button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}


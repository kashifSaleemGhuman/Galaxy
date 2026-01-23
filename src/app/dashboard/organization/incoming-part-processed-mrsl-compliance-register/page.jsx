'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Toast } from '@/components/ui/Toast'
import { Input } from '@/components/ui/Input'

export default function IncomingPartProcessedMRSLComplianceRegisterPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [documentInfo, setDocumentInfo] = useState(null)

  const isAdmin = session?.user?.role === 'SUPER_ADMIN' || session?.user?.role === 'ADMIN' || session?.user?.role === 'super_admin' || session?.user?.role === 'admin'

  // Incoming Part-Processed MRSL Compliance Register data structure - organized by year
  const [content, setContent] = useState({
    records: {
      '2023': [
        {
          id: 1,
          slNo: 1,
          supplier: 'KAS',
          dateContacted: '04/02/22',
          typeOfCommunication: 'Telephonic / Email',
          dateOfResponse: '05/02/22',
          clientSpecificationNumber: 'RSL Report WBC',
          clientAcceptanceToTanneryRSL: 'Email',
          amountOfMaterialUsedAnnually: '',
          nextReviewDate: '04/08/22'
        }
      ],
      '2022': [
        {
          id: 1,
          slNo: 1,
          supplier: 'KAS',
          dateContacted: '04/02/22',
          typeOfCommunication: 'Telephonic / Email',
          dateOfResponse: '05/02/22',
          clientSpecificationNumber: 'RSL Report WBC',
          clientAcceptanceToTanneryRSL: 'Email',
          amountOfMaterialUsedAnnually: '41.360',
          nextReviewDate: '04/08/22'
        }
      ]
    }
  })

  useEffect(() => {
    fetchDocumentContent()
  }, [])

  const fetchDocumentContent = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/organization/documents/content?documentName=Incoming Part-Processed MRSL Compliance Register')
      const data = await res.json()
      
      if (res.ok) {
        if (data.data?.content) {
          const loadedData = data.data.content.content || content
          // Ensure records structure exists
          if (!loadedData.records || Object.keys(loadedData.records).length === 0) {
            const currentYear = new Date().getFullYear().toString()
            const previousYear = (new Date().getFullYear() - 1).toString()
            loadedData.records = {
              [currentYear]: [],
              [previousYear]: []
            }
          }
          setContent(loadedData)
          setDocumentInfo({
            docNo: data.data.document.docNo || 'ESF-RSL-CMP-06',
            revDate: data.data.document.revDate || '',
            revisionNo: data.data.content.revisionNo,
            revisionDate: data.data.content.revisionDate
          })
        } else {
          // Initialize with current and previous year
          const currentYear = new Date().getFullYear().toString()
          const previousYear = (new Date().getFullYear() - 1).toString()
          setContent({
            records: {
              [currentYear]: [],
              [previousYear]: []
            }
          })
          setDocumentInfo({
            docNo: 'ESF-RSL-CMP-06',
            revDate: '',
            revisionNo: 1,
            revisionDate: new Date()
          })
        }
      }
    } catch (error) {
      console.error('Error fetching document content:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTableChange = (year, index, field, value) => {
    const updatedContent = {
      ...content,
      records: {
        ...content.records,
        [year]: content.records[year].map((row, i) => 
          i === index ? { ...row, [field]: value } : row
        )
      }
    }
    setContent(updatedContent)
  }

  const handleAddTableRow = (year) => {
    const currentRecords = content.records[year] || []
    const newRow = {
      id: Date.now(),
      slNo: currentRecords.length + 1,
      supplier: '',
      dateContacted: '',
      typeOfCommunication: '',
      dateOfResponse: '',
      clientSpecificationNumber: '',
      clientAcceptanceToTanneryRSL: '',
      amountOfMaterialUsedAnnually: '',
      nextReviewDate: ''
    }

    const updatedContent = {
      ...content,
      records: {
        ...content.records,
        [year]: [...currentRecords, newRow]
      }
    }
    setContent(updatedContent)
  }

  const handleDeleteTableRow = (year, index) => {
    const currentRecords = content.records[year] || []
    if (currentRecords.length > 0) {
      const updatedContent = {
        ...content,
        records: {
          ...content.records,
          [year]: currentRecords.filter((_, i) => i !== index).map((row, i) => ({
            ...row,
            slNo: i + 1
          }))
        }
      }
      setContent(updatedContent)
    }
  }

  const handleSaveAll = async () => {
    try {
      const res = await fetch('/api/organization/documents/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentName: 'Incoming Part-Processed MRSL Compliance Register',
          content: content,
          changeDescription: 'Updated Incoming Part-Processed MRSL Compliance Register'
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save changes')
      }

      if (data.data) {
        setDocumentInfo({
          ...documentInfo,
          revisionNo: data.data.revisionNo,
          revisionDate: data.data.revisionDate
        })
      }

      setToast({ type: 'success', message: 'Incoming Part-Processed MRSL Compliance Register saved successfully. Revision number incremented.' })
    } catch (error) {
      console.error('Error saving register:', error)
      setToast({ type: 'error', message: 'Failed to save changes. Please try again.' })
    }
  }

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'organization', label: 'Organization', href: '/dashboard/organization' },
    { key: 'documents', label: 'Document Details', href: '/dashboard/organization/documents' },
    { key: 'incoming-part-processed-mrsl', label: 'Incoming Part-Processed MRSL Compliance Register', href: '#' }
  ]

  const handleNavigate = (index, item) => {
    if (item.href && item.href !== '#') router.push(item.href)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbs} onNavigate={handleNavigate} />
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading document...</p>
        </div>
      </div>
    )
  }

  // Get available years (sorted descending)
  const availableYears = Object.keys(content.records || {}).sort((a, b) => parseInt(b) - parseInt(a))

  // Render table for a specific year
  const renderYearTable = (year) => {
    const yearRecords = content.records[year] || []
    
    return (
      <div key={year} className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 uppercase">
            INCOMING PART PROCESSED MATERIAL COMPLIANCE REGISTER - {year}
          </h2>
          {isAdmin && (
            <Button
              variant="outline"
              onClick={() => handleAddTableRow(year)}
              className="px-4"
            >
              + Add Row
            </Button>
          )}
        </div>
        
        <div className="overflow-x-auto border border-gray-300 rounded-md">
          <table className="min-w-full">
            <thead>
              <tr className="bg-blue-100">
                <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                  Sl. No
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                  Supplier
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                  Date Contacted
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                  Type of Communication
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                  Date of Response
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                  Client Specification Number
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                  Client Acceptance to tannery RSL
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                  Amount of Material used Annually in Sq.m
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                  Next Review Date
                </th>
                {isAdmin && (
                  <th className="border border-gray-300 px-3 py-2 text-center text-xs font-semibold text-gray-700">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {yearRecords.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 10 : 9} className="border border-gray-300 px-3 py-4 text-center text-gray-500">
                    No records found. Click "+ Add Row" to add a new entry.
                  </td>
                </tr>
              ) : (
                yearRecords.map((row, index) => (
                  <tr key={row.id || index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-2 py-1">
                      {isAdmin ? (
                        <Input
                          type="number"
                          value={row.slNo || ''}
                          onChange={(e) => handleTableChange(year, index, 'slNo', parseInt(e.target.value) || 0)}
                          className="w-16 text-sm"
                        />
                      ) : (
                        <span className="text-sm">{row.slNo || '-'}</span>
                      )}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      {isAdmin ? (
                        <Input
                          type="text"
                          value={row.supplier || ''}
                          onChange={(e) => handleTableChange(year, index, 'supplier', e.target.value)}
                          className="w-full text-sm"
                          placeholder="Supplier name"
                        />
                      ) : (
                        <span className="text-sm">{row.supplier || '-'}</span>
                      )}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      {isAdmin ? (
                        <Input
                          type="text"
                          value={row.dateContacted || ''}
                          onChange={(e) => handleTableChange(year, index, 'dateContacted', e.target.value)}
                          className="w-full text-sm"
                          placeholder="DD/MM/YY"
                        />
                      ) : (
                        <span className="text-sm">{row.dateContacted || '-'}</span>
                      )}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      {isAdmin ? (
                        <Input
                          type="text"
                          value={row.typeOfCommunication || ''}
                          onChange={(e) => handleTableChange(year, index, 'typeOfCommunication', e.target.value)}
                          className="w-full text-sm"
                          placeholder="Telephonic / Email"
                        />
                      ) : (
                        <span className="text-sm">{row.typeOfCommunication || '-'}</span>
                      )}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      {isAdmin ? (
                        <Input
                          type="text"
                          value={row.dateOfResponse || ''}
                          onChange={(e) => handleTableChange(year, index, 'dateOfResponse', e.target.value)}
                          className="w-full text-sm"
                          placeholder="DD/MM/YY"
                        />
                      ) : (
                        <span className="text-sm">{row.dateOfResponse || '-'}</span>
                      )}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      {isAdmin ? (
                        <Input
                          type="text"
                          value={row.clientSpecificationNumber || ''}
                          onChange={(e) => handleTableChange(year, index, 'clientSpecificationNumber', e.target.value)}
                          className="w-full text-sm"
                          placeholder="RSL Report WBC"
                        />
                      ) : (
                        <span className="text-sm">{row.clientSpecificationNumber || '-'}</span>
                      )}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      {isAdmin ? (
                        <Input
                          type="text"
                          value={row.clientAcceptanceToTanneryRSL || ''}
                          onChange={(e) => handleTableChange(year, index, 'clientAcceptanceToTanneryRSL', e.target.value)}
                          className="w-full text-sm"
                          placeholder="Email"
                        />
                      ) : (
                        <span className="text-sm">{row.clientAcceptanceToTanneryRSL || '-'}</span>
                      )}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      {isAdmin ? (
                        <Input
                          type="text"
                          value={row.amountOfMaterialUsedAnnually || ''}
                          onChange={(e) => handleTableChange(year, index, 'amountOfMaterialUsedAnnually', e.target.value)}
                          className="w-full text-sm"
                          placeholder="41.360"
                        />
                      ) : (
                        <span className="text-sm">{row.amountOfMaterialUsedAnnually || '-'}</span>
                      )}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      {isAdmin ? (
                        <Input
                          type="text"
                          value={row.nextReviewDate || ''}
                          onChange={(e) => handleTableChange(year, index, 'nextReviewDate', e.target.value)}
                          className="w-full text-sm"
                          placeholder="DD/MM/YY"
                        />
                      ) : (
                        <span className="text-sm">{row.nextReviewDate || '-'}</span>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="border border-gray-300 px-2 py-1 text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteTableRow(year, index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Delete
                        </Button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  const handleAddYear = () => {
    const newYear = prompt('Enter year (e.g., 2024):')
    if (newYear && /^\d{4}$/.test(newYear)) {
      const updatedContent = {
        ...content,
        records: {
          ...content.records,
          [newYear]: []
        }
      }
      setContent(updatedContent)
    } else if (newYear) {
      alert('Please enter a valid 4-digit year')
    }
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbs} onNavigate={handleNavigate} />

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
              ESF LEATHER CONSULTANCY
            </h1>
            <h2 className="text-xl font-bold text-gray-900 uppercase mt-2">
              INCOMING PART PROCESSED MATERIAL COMPLIANCE REGISTER
            </h2>
            {documentInfo && (
              <div className="mt-4 flex gap-6 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Doc No:</span> {documentInfo.docNo}
                </div>
                {documentInfo.revDate && (
                  <div>
                    <span className="font-medium">Rev/Date:</span> {documentInfo.revDate}
                  </div>
                )}
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
          {/* Save Button and Year Selector */}
          <div className="flex justify-between items-center">
            {isAdmin && (
              <div className="flex gap-4 items-center">
                <Button
                  variant="outline"
                  onClick={handleAddYear}
                  className="px-3"
                >
                  + Add Year
                </Button>
              </div>
            )}
            {isAdmin && (
              <Button
                onClick={handleSaveAll}
                className="px-6"
              >
                Save All Changes
              </Button>
            )}
          </div>

          {/* Render tables for all years */}
          {Object.keys(content.records || {}).sort((a, b) => parseInt(b) - parseInt(a)).map(year => renderYearTable(year))}
        </div>
      </div>
    </div>
  )
}


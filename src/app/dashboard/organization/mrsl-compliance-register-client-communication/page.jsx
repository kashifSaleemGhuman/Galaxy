'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Toast } from '@/components/ui/Toast'
import { Input } from '@/components/ui/Input'

export default function MRSLComplianceRegisterClientCommunicationPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [documentInfo, setDocumentInfo] = useState(null)

  const isAdmin = session?.user?.role === 'SUPER_ADMIN' || session?.user?.role === 'ADMIN' || session?.user?.role === 'super_admin' || session?.user?.role === 'admin'

  // MRSL Compliance Register data structure - organized by year
  const [content, setContent] = useState({
    records: {
      '2023': [
        {
          id: 1,
          slNo: 1,
          client: 'Client Name',
          dateContacted: '12.06.22',
          typeOfCommunication: 'Email',
          dateOfResponse: '28.08.22',
          clientSpecRefNo: 'Version 2.2',
          clientAcceptanceOfTanneryRSL: 'Yes',
          assessmentForCapabilityOfClientMRSL: 'Yes',
          reviewDate: '25.01.23',
          reviewFrequencyNumber: '2',
          rslComparisonWithMRSLDeclarations: 'Compliant'
        }
      ],
      '2022': [
        {
          id: 1,
          slNo: 1,
          client: 'Client Name',
          dateContacted: '12.06.22',
          typeOfCommunication: 'Email',
          dateOfResponse: '28.08.22',
          clientSpecRefNo: 'Version 2.2',
          clientAcceptanceOfTanneryRSL: 'Yes',
          assessmentForCapabilityOfClientMRSL: 'Yes',
          reviewDate: '25.01.23',
          reviewFrequencyNumber: '2',
          rslComparisonWithMRSLDeclarations: 'Compliant'
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
      const res = await fetch('/api/organization/documents/content?documentName=MRSL COMPLAINCE REGISTER - CLIENT COMMUNCATION')
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
            docNo: data.data.document.docNo || 'ESF-RSL-CMP-04',
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
            docNo: 'ESF-RSL-CMP-04',
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
      client: '',
      dateContacted: '',
      typeOfCommunication: '',
      dateOfResponse: '',
      clientSpecRefNo: '',
      clientAcceptanceOfTanneryRSL: '',
      assessmentForCapabilityOfClientMRSL: '',
      reviewDate: '',
      reviewFrequencyNumber: '',
      rslComparisonWithMRSLDeclarations: ''
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
          documentName: 'MRSL COMPLAINCE REGISTER - CLIENT COMMUNCATION',
          content: content,
          changeDescription: 'Updated MRSL Compliance Register - Client Communication'
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

      setToast({ type: 'success', message: 'MRSL Compliance Register saved successfully. Revision number incremented.' })
    } catch (error) {
      console.error('Error saving register:', error)
      setToast({ type: 'error', message: 'Failed to save changes. Please try again.' })
    }
  }

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'organization', label: 'Organization', href: '/dashboard/organization' },
    { key: 'documents', label: 'Document Details', href: '/dashboard/organization/documents' },
    { key: 'mrsl-compliance', label: 'MRSL Compliance Register - Client Communication', href: '#' }
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
          <h2 className="text-xl font-bold text-red-600 uppercase">
            RSL & MRSL COMPLIANCE REGISTER - CLIENT COMMUNICATION [{year}]
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
                  SL, NO
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                  CLIENT
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                  DATE CONTACTED
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                  TYPE OF COMMUNICATION
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                  DATE OF RESPONSE
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                  CLIENT SPECIFICATION REFERENCE NUMBER
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                  CLIENT ACCEPTANCE OF TANNERY RSL
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                  ASSESSMENT FOR CAPABILITY OF CLIENT'S MRSL REQUIREMENTS
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                  REVIEW DATE
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                  REVIEW FREQUENCY NUMBER
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                  RSL Comparison with MRSL declarations
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
                  <td colSpan={isAdmin ? 12 : 11} className="border border-gray-300 px-3 py-4 text-center text-gray-500">
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
                          value={row.client || ''}
                          onChange={(e) => handleTableChange(year, index, 'client', e.target.value)}
                          className="w-full text-sm"
                          placeholder="Client Name"
                        />
                      ) : (
                        <span className="text-sm">{row.client || '-'}</span>
                      )}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      {isAdmin ? (
                        <Input
                          type="text"
                          value={row.dateContacted || ''}
                          onChange={(e) => handleTableChange(year, index, 'dateContacted', e.target.value)}
                          className="w-full text-sm"
                          placeholder="DD.MM.YY"
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
                          placeholder="Email, Phone, etc."
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
                          placeholder="DD.MM.YY"
                        />
                      ) : (
                        <span className="text-sm">{row.dateOfResponse || '-'}</span>
                      )}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      {isAdmin ? (
                        <Input
                          type="text"
                          value={row.clientSpecRefNo || ''}
                          onChange={(e) => handleTableChange(year, index, 'clientSpecRefNo', e.target.value)}
                          className="w-full text-sm"
                          placeholder="Version 2.2"
                        />
                      ) : (
                        <span className="text-sm">{row.clientSpecRefNo || '-'}</span>
                      )}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      {isAdmin ? (
                        <Input
                          type="text"
                          value={row.clientAcceptanceOfTanneryRSL || ''}
                          onChange={(e) => handleTableChange(year, index, 'clientAcceptanceOfTanneryRSL', e.target.value)}
                          className="w-full text-sm"
                          placeholder="Yes/No"
                        />
                      ) : (
                        <span className="text-sm">{row.clientAcceptanceOfTanneryRSL || '-'}</span>
                      )}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      {isAdmin ? (
                        <Input
                          type="text"
                          value={row.assessmentForCapabilityOfClientMRSL || ''}
                          onChange={(e) => handleTableChange(year, index, 'assessmentForCapabilityOfClientMRSL', e.target.value)}
                          className="w-full text-sm"
                          placeholder="Yes/No"
                        />
                      ) : (
                        <span className="text-sm">{row.assessmentForCapabilityOfClientMRSL || '-'}</span>
                      )}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      {isAdmin ? (
                        <Input
                          type="text"
                          value={row.reviewDate || ''}
                          onChange={(e) => handleTableChange(year, index, 'reviewDate', e.target.value)}
                          className="w-full text-sm"
                          placeholder="DD.MM.YY"
                        />
                      ) : (
                        <span className="text-sm">{row.reviewDate || '-'}</span>
                      )}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      {isAdmin ? (
                        <Input
                          type="text"
                          value={row.reviewFrequencyNumber || ''}
                          onChange={(e) => handleTableChange(year, index, 'reviewFrequencyNumber', e.target.value)}
                          className="w-full text-sm"
                          placeholder="Number"
                        />
                      ) : (
                        <span className="text-sm">{row.reviewFrequencyNumber || '-'}</span>
                      )}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      {isAdmin ? (
                        <Input
                          type="text"
                          value={row.rslComparisonWithMRSLDeclarations || ''}
                          onChange={(e) => handleTableChange(year, index, 'rslComparisonWithMRSLDeclarations', e.target.value)}
                          className="w-full text-sm"
                          placeholder="Compliant/Non-Compliant"
                        />
                      ) : (
                        <span className="text-sm">{row.rslComparisonWithMRSLDeclarations || '-'}</span>
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
            <h2 className="text-xl font-bold text-red-600 uppercase mt-2">
              RSL & MRSL COMPLIANCE REGISTER - CLIENT COMMUNICATION
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


'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Toast } from '@/components/ui/Toast'
import { Input } from '@/components/ui/Input'

export default function CETPEffluentTreatedWaterRegisterPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [documentInfo, setDocumentInfo] = useState(null)

  const isAdmin = session?.user?.role === 'SUPER_ADMIN' || session?.user?.role === 'ADMIN' || session?.user?.role === 'super_admin' || session?.user?.role === 'admin'

  // Parameters list from the image
  const parameters = [
    { name: 'pH', unit: '-' },
    { name: 'Total Dissolve Solids', unit: 'mg/l' },
    { name: 'Total Suspended Solids', unit: 'mg/l' },
    { name: 'Chloride', unit: 'mg/l' },
    { name: 'Sulphate', unit: 'mg/l' },
    { name: 'BOD', unit: 'mg/l' },
    { name: 'COD', unit: 'mg/l' },
    { name: 'Oil & Grease', unit: 'mg/l' },
    { name: 'Sulphide', unit: 'mg/l' },
    { name: 'Phenolic Compound as Pher', unit: 'mg/l' },
    { name: 'Chromium', unit: 'mg/l' },
    { name: 'Hexavalent Chromium as', unit: 'mg/l' },
    { name: 'Ammonical Nitrogen as N', unit: 'mg/l' },
    { name: 'Percent Sodium', unit: 'mg/l' }
  ]

  // Initialize content structure
  const initializeContent = () => {
    const reports = [
      { id: 1, reportNumber: '006843-184', date: '8/18/2021' },
      { id: 2, reportNumber: '006866-067', date: '9/15/2021' },
      { id: 3, reportNumber: '6931', date: '10/20/2021' },
      { id: 4, reportNumber: '015939-193', date: '11/18/2021' },
      { id: 5, reportNumber: '8465', date: '12/15/2021' },
      { id: 6, reportNumber: 'W015988', date: '1/18/2022' },
      { id: 7, reportNumber: '3222', date: '2/18/2022' },
      { id: 8, reportNumber: '3918', date: '3/18/2022' },
      { id: 9, reportNumber: '5428', date: '4/18/2022' },
      { id: 10, reportNumber: '03492-228', date: '5/18/2022' },
      { id: 11, reportNumber: '03503-238', date: '6/18/2022' },
      { id: 12, reportNumber: '9151', date: '7/18/2022' }
    ]

    const reportData = {}
    reports.forEach(report => {
      reportData[report.id] = {
        reportNumber: report.reportNumber,
        date: report.date,
        values: {}
      }
      parameters.forEach(param => {
        reportData[report.id].values[param.name] = ''
      })
    })

    return { reports, reportData }
  }

  // CETP Effluent Treated Water Register Data Structure
  const [content, setContent] = useState({
    cetpName: 'CETP NAME / OWN ETP',
    ...initializeContent()
  })

  useEffect(() => {
    fetchDocumentContent()
  }, [])

  const fetchDocumentContent = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/organization/documents/content?documentName=CETP Effluent Treated Water Register')
      const data = await res.json()
      
      if (res.ok) {
        if (data.data?.content) {
          const loadedData = data.data.content.content || content
          // Ensure structure exists
          if (!loadedData.reports || !loadedData.reportData) {
            const initialized = initializeContent()
            loadedData.reports = initialized.reports
            loadedData.reportData = initialized.reportData
          }
          setContent(loadedData)
          setDocumentInfo({
            docNo: data.data.document.docNo || '',
            revDate: data.data.document.revDate || '',
            revisionNo: data.data.content.revisionNo,
            revisionDate: data.data.content.revisionDate
          })
        } else {
          setDocumentInfo({
            docNo: '',
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

  // Calculate average for a parameter
  const calculateAverage = (paramName) => {
    const values = content.reports
      .map(report => {
        const value = content.reportData[report.id]?.values[paramName]
        if (!value || value.trim() === '' || value === 'BDL' || value === '<0.01') {
          return null
        }
        // Handle special cases
        if (value.includes('<')) {
          return null
        }
        const numValue = parseFloat(value)
        return isNaN(numValue) ? null : numValue
      })
      .filter(v => v !== null)

    if (values.length === 0) {
      return '-'
    }

    const sum = values.reduce((acc, val) => acc + val, 0)
    const avg = sum / values.length
    return avg.toFixed(2)
  }

  const handleParameterValueChange = (reportId, paramName, value) => {
    setContent(prev => ({
      ...prev,
      reportData: {
        ...prev.reportData,
        [reportId]: {
          ...prev.reportData[reportId],
          values: {
            ...prev.reportData[reportId].values,
            [paramName]: value
          }
        }
      }
    }))
  }

  const handleReportChange = (reportId, field, value) => {
    setContent(prev => ({
      ...prev,
      reportData: {
        ...prev.reportData,
        [reportId]: {
          ...prev.reportData[reportId],
          [field]: value
        }
      }
    }))
  }

  const handleAddReport = () => {
    const newReportId = Date.now()
    const newReport = {
      id: newReportId,
      reportNumber: '',
      date: ''
    }

    const newReportData = {}
    parameters.forEach(param => {
      newReportData[param.name] = ''
    })

    setContent(prev => ({
      ...prev,
      reports: [...prev.reports, newReport],
      reportData: {
        ...prev.reportData,
        [newReportId]: {
          reportNumber: '',
          date: '',
          values: newReportData
        }
      }
    }))
  }

  const handleRemoveReport = (reportId) => {
    if (content.reports.length <= 1) {
      alert('At least one report is required')
      return
    }
    const reports = content.reports.filter(r => r.id !== reportId)
    const reportData = { ...content.reportData }
    delete reportData[reportId]
    setContent(prev => ({
      ...prev,
      reports,
      reportData
    }))
  }

  const handleInputChange = (field, value) => {
    setContent(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveAll = async () => {
    try {
      const res = await fetch('/api/organization/documents/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentName: 'CETP Effluent Treated Water Register',
          content: content,
          changeDescription: 'Updated CETP Effluent Treated Water Register'
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

      setToast({ type: 'success', message: 'CETP Effluent Treated Water Register saved successfully. Revision number incremented.' })
    } catch (error) {
      console.error('Error saving register:', error)
      setToast({ type: 'error', message: 'Failed to save changes. Please try again.' })
    }
  }

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'organization', label: 'Organization', href: '/dashboard/organization' },
    { key: 'documents', label: 'Document Details', href: '/dashboard/organization/documents' },
    { key: 'cetp-effluent', label: 'CETP Effluent Treated Water Register', href: '#' }
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
              CETP EFFLUENT TREATED WATER REGISTER
            </h2>
            <div className="mt-4 flex gap-6 text-sm text-gray-600">
              <div>
                <span className="font-medium">CETP Name:</span>{' '}
                {isAdmin ? (
                  <Input
                    type="text"
                    value={content.cetpName}
                    onChange={(e) => handleInputChange('cetpName', e.target.value)}
                    className="inline-block w-64 ml-2"
                  />
                ) : (
                  <span className="ml-2">{content.cetpName}</span>
                )}
              </div>
              {documentInfo && (
                <>
                  {documentInfo.docNo && (
                    <div>
                      <span className="font-medium">Doc No:</span> {documentInfo.docNo}
                    </div>
                  )}
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
                </>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/organization/documents')}
          >
            Back to Documents
          </Button>
        </div>

        <div className="p-6 space-y-8">
          {/* Save Button and Controls */}
          {isAdmin && (
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={handleAddReport}
                className="px-4"
              >
                + Add Report
              </Button>
              <Button
                onClick={handleSaveAll}
                className="px-6"
              >
                Save All Changes
              </Button>
            </div>
          )}

          {/* CETP Register Table */}
          <div className="relative w-full">
            <div className="w-full overflow-x-auto overflow-y-visible scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200" style={{ maxWidth: '100%', scrollbarWidth: 'thin' }}>
              <div className="border border-gray-300 rounded-md inline-block min-w-full">
                <table className="min-w-full" style={{ minWidth: 'max-content', tableLayout: 'auto' }}>
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700 sticky left-0 bg-gray-100 z-10 min-w-[200px]">
                        Details
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700 min-w-[80px]">
                        Unit
                      </th>
                      {content.reports?.map((report, index) => (
                        <th key={report.id} className="border border-gray-300 px-2 py-2 text-center text-xs font-semibold text-gray-700 relative group min-w-[120px]">
                          <div className="flex flex-col items-center gap-1">
                            {isAdmin && (
                              <button
                                onClick={() => handleRemoveReport(report.id)}
                                className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-800 text-xs absolute top-1 right-1"
                                title="Remove report"
                              >
                                ×
                              </button>
                            )}
                            <div className="font-semibold">Report Number</div>
                            {isAdmin ? (
                              <Input
                                type="text"
                                value={content.reportData[report.id]?.reportNumber || ''}
                                onChange={(e) => handleReportChange(report.id, 'reportNumber', e.target.value)}
                                className="w-full text-xs text-center"
                                placeholder="Report No"
                              />
                            ) : (
                              <div className="text-xs">{content.reportData[report.id]?.reportNumber || '-'}</div>
                            )}
                            <div className="text-xs font-normal mt-1">Date</div>
                            {isAdmin ? (
                              <Input
                                type="text"
                                value={content.reportData[report.id]?.date || ''}
                                onChange={(e) => handleReportChange(report.id, 'date', e.target.value)}
                                className="w-full text-xs text-center"
                                placeholder="MM/DD/YYYY"
                              />
                            ) : (
                              <div className="text-xs">{content.reportData[report.id]?.date || '-'}</div>
                            )}
                          </div>
                        </th>
                      ))}
                      <th className="border border-gray-300 px-3 py-2 text-center text-xs font-semibold text-gray-700 bg-blue-50 min-w-[100px]">
                        Average
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {parameters.map((param, index) => (
                      <tr key={param.name} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 sticky left-0 z-10 min-w-[200px]">
                          {param.name}
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-sm text-gray-700 bg-gray-50 min-w-[80px]">
                          {param.unit}
                        </td>
                        {content.reports?.map((report) => (
                          <td key={report.id} className="border border-gray-300 px-1 py-1 text-center min-w-[120px]">
                            {isAdmin ? (
                              <Input
                                type="text"
                                value={content.reportData[report.id]?.values[param.name] || ''}
                                onChange={(e) => handleParameterValueChange(report.id, param.name, e.target.value)}
                                className="w-full text-xs text-center"
                                placeholder="Value"
                              />
                            ) : (
                              <span className="text-xs">
                                {content.reportData[report.id]?.values[param.name] || '-'}
                              </span>
                            )}
                          </td>
                        ))}
                        <td className="border border-gray-300 px-2 py-1 text-center text-sm font-medium text-gray-700 bg-blue-50 min-w-[100px]">
                          {calculateAverage(param.name)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {content.reports && content.reports.length > 5 && (
              <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white px-2 py-1 rounded shadow-sm">
                Scroll horizontally to see more reports →
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


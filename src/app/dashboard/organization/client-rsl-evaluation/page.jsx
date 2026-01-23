'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Toast } from '@/components/ui/Toast'
import { Input } from '@/components/ui/Input'

export default function ClientRSLEvaluationPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [documentInfo, setDocumentInfo] = useState(null)

  const isAdmin = session?.user?.role === 'SUPER_ADMIN' || session?.user?.role === 'ADMIN' || session?.user?.role === 'super_admin' || session?.user?.role === 'admin'

  // Client RSL Evaluation data structure
  const [content, setContent] = useState({
    evaluationRecords: [
      {
        id: 1,
        slNo: 1,
        property: 'Chrome VI without ageing (optional) / Chrome 6 with ageing',
        testMethod: 'EN ISO 17075-2:2017',
        leatherRSL: '<3 ppm',
        clientT1: '<3 ppm',
        clientT2: '<3 ppm',
        clientT3: '<3 ppm',
        clientT4: '3 ppm',
        clientT5: '3 ppm',
        rslTestDone: 'yes'
      },
      {
        id: 2,
        slNo: 2,
        property: 'Formaldehyde',
        testMethod: 'ISO 17226-1:2019 / Analysis using HPLC-DAD',
        leatherRSL: '<75 ppm',
        clientT1: '<300 ppm',
        clientT2: '<75 ppm',
        clientT3: '<75 ppm',
        clientT4: '16 ppm',
        clientT5: '16 ppm',
        rslTestDone: 'yes'
      },
      {
        id: 3,
        slNo: 3,
        property: 'Chlorinated paraffins (C10-C13)',
        testMethod: 'ISO/DIS 18219:2015',
        leatherRSL: '<1000 ppm',
        clientT1: '<1000 ppm',
        clientT2: '<1000 ppm',
        clientT3: '<1000 ppm',
        clientT4: 'N/A',
        clientT5: '<1000 ppm',
        rslTestDone: 'yes'
      },
      {
        id: 4,
        slNo: 4,
        property: 'Alkyl phenol Total',
        testMethod: 'ISO 18218-1:2015',
        leatherRSL: '<100 mg/kg',
        clientT1: '<100 mg/kg',
        clientT2: '<100 mg/kg',
        clientT3: '<100 mg/kg',
        clientT4: '<100 mg/kg',
        clientT5: '<100 mg/kg',
        rslTestDone: 'yes'
      },
      {
        id: 5,
        slNo: 5,
        property: 'Alkyl phenol ethoxylate (APEO)',
        testMethod: 'ISO 18218-1:2015',
        leatherRSL: '<100 mg/kg',
        clientT1: '<100 mg/kg',
        clientT2: '<100 mg/kg',
        clientT3: '<100 mg/kg',
        clientT4: '<100 mg/kg',
        clientT5: '<100 mg/kg',
        rslTestDone: 'yes'
      },
      {
        id: 6,
        slNo: 6,
        property: 'Dimethyl fumarate (DMF)',
        testMethod: 'ISO/TS 16186:2012, GC-MS',
        leatherRSL: '<0.1 ppm',
        clientT1: '<0.1 ppm',
        clientT2: '<0.1 ppm',
        clientT3: '<0.1 ppm',
        clientT4: '<0.1 ppm',
        clientT5: '<0.1 ppm',
        rslTestDone: 'yes'
      },
      {
        id: 7,
        slNo: 7,
        property: 'Chlorinated fungicides (TeCP, PCP, TCP)',
        testMethod: 'ISO 17070-1:2017, KOH Extraction',
        leatherRSL: '<0.5 PCP, <0.1 TeCP, <0.5 TCP',
        clientT1: '<0.5 PCP, <0.1 TeCP, <0.5 TCP',
        clientT2: 'ND PCP, ND TeCP, ND TCP',
        clientT3: '<0.5 PCP, <0.1 TeCP, <0.5 TCP',
        clientT4: 'ND PCP, ND TeCP, ND TCP',
        clientT5: '<0.5 PCP, <0.1 TeCP, <0.5 TCP',
        rslTestDone: 'yes'
      }
    ]
  })

  useEffect(() => {
    fetchDocumentContent()
  }, [])

  const fetchDocumentContent = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/organization/documents/content?documentName=Client RSL Evaluation')
      const data = await res.json()
      
      if (res.ok) {
        if (data.data?.content) {
          const loadedData = data.data.content.content || content
          // Ensure evaluationRecords structure exists
          if (!loadedData.evaluationRecords || loadedData.evaluationRecords.length === 0) {
            loadedData.evaluationRecords = content.evaluationRecords
          }
          setContent(loadedData)
          setDocumentInfo({
            docNo: data.data.document.docNo || 'ESF-RSL-CMP-04',
            revDate: data.data.document.revDate || '',
            revisionNo: data.data.content.revisionNo,
            revisionDate: data.data.content.revisionDate
          })
        } else {
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

  const handleTableChange = (index, field, value) => {
    const updatedContent = {
      ...content,
      evaluationRecords: content.evaluationRecords.map((row, i) => 
        i === index ? { ...row, [field]: value } : row
      )
    }
    setContent(updatedContent)
  }

  const handleAddTableRow = () => {
    const newRow = {
      id: Date.now(),
      slNo: content.evaluationRecords.length + 1,
      property: '',
      testMethod: '',
      leatherRSL: '',
      clientT1: '',
      clientT2: '',
      clientT3: '',
      clientT4: '',
      clientT5: '',
      rslTestDone: ''
    }

    const updatedContent = {
      ...content,
      evaluationRecords: [...content.evaluationRecords, newRow]
    }
    setContent(updatedContent)
  }

  const handleDeleteTableRow = (index) => {
    if (content.evaluationRecords.length > 0) {
      const updatedContent = {
        ...content,
        evaluationRecords: content.evaluationRecords.filter((_, i) => i !== index).map((row, i) => ({
          ...row,
          slNo: i + 1
        }))
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
          documentName: 'Client RSL Evaluation',
          content: content,
          changeDescription: 'Updated Client RSL Evaluation'
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

      setToast({ type: 'success', message: 'Client RSL Evaluation saved successfully. Revision number incremented.' })
    } catch (error) {
      console.error('Error saving evaluation:', error)
      setToast({ type: 'error', message: 'Failed to save changes. Please try again.' })
    }
  }

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'organization', label: 'Organization', href: '/dashboard/organization' },
    { key: 'documents', label: 'Document Details', href: '/dashboard/organization/documents' },
    { key: 'client-rsl-evaluation', label: 'Client RSL Evaluation', href: '#' }
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
              CLIENT RESTRICTED SUBSTANCES EVALUATION
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
          {/* Save Button */}
          {isAdmin && (
            <div className="flex justify-end">
              <Button
                onClick={handleSaveAll}
                className="px-6"
              >
                Save All Changes
              </Button>
            </div>
          )}

          {/* Evaluation Records Table */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold text-gray-900 border-b-2 border-green-600 pb-2">
                Client RSL Evaluation Records
              </h2>
              {isAdmin && (
                <Button
                  variant="outline"
                  onClick={handleAddTableRow}
                  className="px-4"
                >
                  + Add Row
                </Button>
              )}
            </div>
            <div className="overflow-x-auto border border-gray-300 rounded-md mt-4">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                      SL.NO
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                      PROPERTY
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                      TEST METHOD
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                      LEATHER RSL
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                      CLIENT T1
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                      CLIENT T2
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                      CLIENT T3
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                      CLIENT T4
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                      CLIENT T5
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                      RSL TEST DONE
                    </th>
                    {isAdmin && (
                      <th className="border border-gray-300 px-3 py-2 text-center text-xs font-semibold text-gray-700">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {content.evaluationRecords.length === 0 ? (
                    <tr>
                      <td colSpan={isAdmin ? 11 : 10} className="border border-gray-300 px-3 py-4 text-center text-gray-500">
                        No records found. Click "+ Add Row" to add a new entry.
                      </td>
                    </tr>
                  ) : (
                    content.evaluationRecords.map((row, index) => (
                      <tr key={row.id || index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-2 py-1">
                          {isAdmin ? (
                            <Input
                              type="number"
                              value={row.slNo || ''}
                              onChange={(e) => handleTableChange(index, 'slNo', parseInt(e.target.value) || 0)}
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
                              value={row.property || ''}
                              onChange={(e) => handleTableChange(index, 'property', e.target.value)}
                              className="w-full text-sm"
                              placeholder="Property name"
                            />
                          ) : (
                            <span className="text-sm">{row.property || '-'}</span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-1">
                          {isAdmin ? (
                            <Input
                              type="text"
                              value={row.testMethod || ''}
                              onChange={(e) => handleTableChange(index, 'testMethod', e.target.value)}
                              className="w-full text-sm"
                              placeholder="Test method"
                            />
                          ) : (
                            <span className="text-sm">{row.testMethod || '-'}</span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-1">
                          {isAdmin ? (
                            <Input
                              type="text"
                              value={row.leatherRSL || ''}
                              onChange={(e) => handleTableChange(index, 'leatherRSL', e.target.value)}
                              className="w-full text-sm"
                              placeholder="<3 ppm"
                            />
                          ) : (
                            <span className="text-sm">{row.leatherRSL || '-'}</span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-1">
                          {isAdmin ? (
                            <Input
                              type="text"
                              value={row.clientT1 || ''}
                              onChange={(e) => handleTableChange(index, 'clientT1', e.target.value)}
                              className="w-full text-sm"
                              placeholder="Client T1 value"
                            />
                          ) : (
                            <span className="text-sm">{row.clientT1 || '-'}</span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-1">
                          {isAdmin ? (
                            <Input
                              type="text"
                              value={row.clientT2 || ''}
                              onChange={(e) => handleTableChange(index, 'clientT2', e.target.value)}
                              className="w-full text-sm"
                              placeholder="Client T2 value"
                            />
                          ) : (
                            <span className="text-sm">{row.clientT2 || '-'}</span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-1">
                          {isAdmin ? (
                            <Input
                              type="text"
                              value={row.clientT3 || ''}
                              onChange={(e) => handleTableChange(index, 'clientT3', e.target.value)}
                              className="w-full text-sm"
                              placeholder="Client T3 value"
                            />
                          ) : (
                            <span className="text-sm">{row.clientT3 || '-'}</span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-1">
                          {isAdmin ? (
                            <Input
                              type="text"
                              value={row.clientT4 || ''}
                              onChange={(e) => handleTableChange(index, 'clientT4', e.target.value)}
                              className="w-full text-sm"
                              placeholder="Client T4 value"
                            />
                          ) : (
                            <span className="text-sm">{row.clientT4 || '-'}</span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-1">
                          {isAdmin ? (
                            <Input
                              type="text"
                              value={row.clientT5 || ''}
                              onChange={(e) => handleTableChange(index, 'clientT5', e.target.value)}
                              className="w-full text-sm"
                              placeholder="Client T5 value"
                            />
                          ) : (
                            <span className="text-sm">{row.clientT5 || '-'}</span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-1">
                          {isAdmin ? (
                            <Input
                              type="text"
                              value={row.rslTestDone || ''}
                              onChange={(e) => handleTableChange(index, 'rslTestDone', e.target.value)}
                              className="w-full text-sm"
                              placeholder="yes/no"
                            />
                          ) : (
                            <span className="text-sm">{row.rslTestDone || '-'}</span>
                          )}
                        </td>
                        {isAdmin && (
                          <td className="border border-gray-300 px-2 py-1 text-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteTableRow(index)}
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
        </div>
      </div>
    </div>
  )
}


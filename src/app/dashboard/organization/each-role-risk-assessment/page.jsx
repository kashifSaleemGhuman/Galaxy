'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Toast } from '@/components/ui/Toast'
import { Input } from '@/components/ui/Input'

export default function EachRoleRiskAssessmentPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [documentInfo, setDocumentInfo] = useState(null)

  const isAdmin = session?.user?.role === 'SUPER_ADMIN' || session?.user?.role === 'ADMIN' || session?.user?.role === 'super_admin' || session?.user?.role === 'admin'

  // Initialize content structure
  const initializeContent = () => {
    return {
      preparedBy: 'ESF LEATHER CONSULTANCY',
      documentId: 'ESF-HS-CHE-02',
      date: '20/01/2023',
      contactInfo: 'esfleather@gmail.com +91-98408 20288',
      hazards: []
    }
  }

  // Health & Safety Data Structure
  const [content, setContent] = useState(initializeContent())

  useEffect(() => {
    fetchDocumentContent()
  }, [])

  const fetchDocumentContent = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/organization/documents/content?documentName=EACH ROLE RISK ASSESSMENT')
      const data = await res.json()
      
      if (res.ok) {
        if (data.data?.content) {
          const loadedData = data.data.content.content || content
          // Ensure structure exists
          if (!loadedData.hazards) {
            loadedData.hazards = []
          }
          setContent(loadedData)
          setDocumentInfo({
            docNo: data.data.document.docNo || 'ESF-HS-CHE-02',
            revDate: data.data.document.revDate || '',
            revisionNo: data.data.content.revisionNo,
            revisionDate: data.data.content.revisionDate
          })
        } else {
          setDocumentInfo({
            docNo: 'ESF-HS-CHE-02',
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

  const handleHazardChange = (hazardId, field, value) => {
    setContent(prev => ({
      ...prev,
      hazards: prev.hazards.map(hazard =>
        hazard.id === hazardId
          ? { ...hazard, [field]: value }
          : hazard
      )
    }))
  }

  const handleHazardClassificationChange = (hazardId, classification, checked) => {
    setContent(prev => ({
      ...prev,
      hazards: prev.hazards.map(hazard => {
        if (hazard.id === hazardId) {
          const classifications = { ...hazard.hazardClassification }
          classifications[classification] = checked
          return { ...hazard, hazardClassification: classifications }
        }
        return hazard
      })
    }))
  }

  const handleControlMeasureChange = (hazardId, measure, checked) => {
    setContent(prev => ({
      ...prev,
      hazards: prev.hazards.map(hazard =>
        hazard.id === hazardId
          ? { ...hazard, [measure]: checked }
          : hazard
      )
    }))
  }

  const handleAddHazard = () => {
    const newHazard = {
      id: Date.now(),
      serialNo: content.hazards.length + 1,
      areaActivity: '',
      functionTask: '',
      hazard: '',
      condition: 'R', // R or NR
      hazardClassification: {
        PHY: false,
        CHE: false,
        BIO: false,
        ERG: false
      },
      risk: '',
      criteria: {
        EX: '',
        POC: '',
        SV: '',
        PC: '',
        ttlRating: ''
      },
      legalOtherRequirement: false,
      elimination: false,
      substitution: false,
      engineeringControl: false,
      adminControl: false,
      ppe: false
    }
    setContent(prev => ({
      ...prev,
      hazards: [...prev.hazards, newHazard]
    }))
  }

  const handleDeleteHazard = (hazardId) => {
    setContent(prev => ({
      ...prev,
      hazards: prev.hazards
        .filter(h => h.id !== hazardId)
        .map((h, index) => ({ ...h, serialNo: index + 1 }))
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
          documentName: 'EACH ROLE RISK ASSESSMENT',
          content: content,
          changeDescription: 'Updated Each Role Risk Assessment'
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

      setToast({ type: 'success', message: 'Each Role Risk Assessment saved successfully. Revision number incremented.' })
    } catch (error) {
      console.error('Error saving assessment:', error)
      setToast({ type: 'error', message: 'Failed to save changes. Please try again.' })
    }
  }

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'organization', label: 'Organization', href: '/dashboard/organization' },
    { key: 'documents', label: 'Document Details', href: '/dashboard/organization/documents' },
    { key: 'each-role-risk-assessment', label: 'Each Role Risk Assessment', href: '#' }
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
              OCCUPATIONAL HEALTH & SAFETY HAZARDS RECORD
            </h2>
            <h3 className="text-lg font-semibold text-gray-800 mt-1">
              LIST OF HAZARDS & RISKS AND RISK ASSESSEMENT
            </h3>
            <div className="mt-4 flex gap-6 text-sm text-gray-600">
              <div>
                <span className="font-medium">Prepared By:</span>{' '}
                {isAdmin ? (
                  <Input
                    type="text"
                    value={content.preparedBy}
                    onChange={(e) => handleInputChange('preparedBy', e.target.value)}
                    className="inline-block w-64 ml-2"
                  />
                ) : (
                  <span className="ml-2">{content.preparedBy}</span>
                )}
              </div>
              <div>
                <span className="font-medium">Document ID:</span>{' '}
                {isAdmin ? (
                  <Input
                    type="text"
                    value={content.documentId}
                    onChange={(e) => handleInputChange('documentId', e.target.value)}
                    className="inline-block w-48 ml-2"
                  />
                ) : (
                  <span className="ml-2">{content.documentId}</span>
                )}
              </div>
              <div>
                <span className="font-medium">Date:</span>{' '}
                {isAdmin ? (
                  <Input
                    type="text"
                    value={content.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="inline-block w-32 ml-2"
                  />
                ) : (
                  <span className="ml-2">{content.date}</span>
                )}
              </div>
              {documentInfo && documentInfo.revisionNo && (
                <div>
                  <span className="font-medium">Revision:</span> {documentInfo.revisionNo} ({new Date(documentInfo.revisionDate).toLocaleDateString()})
                </div>
              )}
            </div>
            {content.contactInfo && (
              <div className="mt-2 text-sm text-gray-600">
                {content.contactInfo}
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
          {/* Save Button and Controls */}
          {isAdmin && (
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={handleAddHazard}
                className="px-4"
              >
                + Add Hazard Entry
              </Button>
              <Button
                onClick={handleSaveAll}
                className="px-6"
              >
                Save All Changes
              </Button>
            </div>
          )}

          {/* Hazards Table */}
          <div className="relative w-full">
            <div className="w-full overflow-x-auto overflow-y-visible scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200" style={{ maxWidth: '100%', scrollbarWidth: 'thin' }}>
              <div className="border border-gray-300 rounded-md inline-block min-w-full">
                <table className="min-w-full" style={{ minWidth: 'max-content', tableLayout: 'auto' }}>
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-2 py-2 text-center text-xs font-semibold text-gray-700 sticky left-0 bg-gray-100 z-10 min-w-[50px]">
                        S.NO
                      </th>
                      <th className="border border-gray-300 px-2 py-2 text-left text-xs font-semibold text-gray-700 min-w-[150px]">
                        AREA / ACTIVITY
                      </th>
                      <th className="border border-gray-300 px-2 py-2 text-left text-xs font-semibold text-gray-700 min-w-[150px]">
                        FUNCTION / TASK
                      </th>
                      <th className="border border-gray-300 px-2 py-2 text-left text-xs font-semibold text-gray-700 min-w-[200px]">
                        HAZARD
                      </th>
                      <th className="border border-gray-300 px-2 py-2 text-center text-xs font-semibold text-gray-700 min-w-[80px]">
                        CONDITION
                      </th>
                      <th className="border border-gray-300 px-2 py-2 text-center text-xs font-semibold text-gray-700 min-w-[200px]">
                        HAZARD CLASSIFICATION
                      </th>
                      <th className="border border-gray-300 px-2 py-2 text-left text-xs font-semibold text-gray-700 min-w-[200px]">
                        RISK
                      </th>
                      <th className="border border-gray-300 px-2 py-2 text-center text-xs font-semibold text-gray-700 min-w-[300px]">
                        CRITERIA
                      </th>
                      <th className="border border-gray-300 px-2 py-2 text-center text-xs font-semibold text-gray-700 min-w-[120px]">
                        LEGAL / OTHER REQUIREMENT
                      </th>
                      <th className="border border-gray-300 px-2 py-2 text-center text-xs font-semibold text-gray-700 min-w-[100px]">
                        ELIMINATION
                      </th>
                      <th className="border border-gray-300 px-2 py-2 text-center text-xs font-semibold text-gray-700 min-w-[100px]">
                        SUBSTITUTION
                      </th>
                      <th className="border border-gray-300 px-2 py-2 text-center text-xs font-semibold text-gray-700 min-w-[120px]">
                        ENGINEERING CONTROL
                      </th>
                      <th className="border border-gray-300 px-2 py-2 text-center text-xs font-semibold text-gray-700 min-w-[100px]">
                        ADMIN. CONTROL
                      </th>
                      <th className="border border-gray-300 px-2 py-2 text-center text-xs font-semibold text-gray-700 min-w-[80px]">
                        PPE
                      </th>
                      {isAdmin && (
                        <th className="border border-gray-300 px-2 py-2 text-center text-xs font-semibold text-gray-700 min-w-[100px] sticky right-0 bg-gray-100 z-10">
                          Actions
                        </th>
                      )}
                    </tr>
                    <tr className="bg-gray-50">
                      <th colSpan="5" className="border border-gray-300 px-2 py-1 text-xs text-gray-600"></th>
                      <th className="border border-gray-300 px-1 py-1 text-center text-xs text-gray-600">
                        <div className="flex flex-col gap-1">
                          <span>PHY</span>
                          <span>CHE</span>
                          <span>BIO</span>
                          <span>ERG</span>
                        </div>
                      </th>
                      <th className="border border-gray-300 px-2 py-1 text-xs text-gray-600"></th>
                      <th className="border border-gray-300 px-1 py-1 text-center text-xs text-gray-600">
                        <div className="flex flex-col gap-1">
                          <span>EX</span>
                          <span>POC</span>
                          <span>SV</span>
                          <span>PC</span>
                          <span>TTL RATING</span>
                        </div>
                      </th>
                      <th colSpan="6" className="border border-gray-300 px-2 py-1 text-xs text-gray-600"></th>
                      {isAdmin && <th className="border border-gray-300"></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {content.hazards?.map((hazard, index) => (
                      <tr key={hazard.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-2 py-2 text-center text-sm font-medium text-gray-700 bg-gray-50 sticky left-0 z-10">
                          {isAdmin ? (
                            <Input
                              type="number"
                              value={hazard.serialNo}
                              onChange={(e) => handleHazardChange(hazard.id, 'serialNo', parseInt(e.target.value) || 0)}
                              className="w-16 text-center text-sm"
                            />
                          ) : (
                            <span>{hazard.serialNo || index + 1}</span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-2 min-w-[150px]">
                          {isAdmin ? (
                            <Input
                              type="text"
                              value={hazard.areaActivity || ''}
                              onChange={(e) => handleHazardChange(hazard.id, 'areaActivity', e.target.value)}
                              className="w-full text-sm"
                              placeholder="Area/Activity"
                            />
                          ) : (
                            <span className="text-sm text-gray-700">{hazard.areaActivity || '-'}</span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-2 min-w-[150px]">
                          {isAdmin ? (
                            <Input
                              type="text"
                              value={hazard.functionTask || ''}
                              onChange={(e) => handleHazardChange(hazard.id, 'functionTask', e.target.value)}
                              className="w-full text-sm"
                              placeholder="Function/Task"
                            />
                          ) : (
                            <span className="text-sm text-gray-700">{hazard.functionTask || '-'}</span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-2 min-w-[200px]">
                          {isAdmin ? (
                            <textarea
                              value={hazard.hazard || ''}
                              onChange={(e) => handleHazardChange(hazard.id, 'hazard', e.target.value)}
                              className="w-full text-sm rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              rows={2}
                              placeholder="Hazard description"
                            />
                          ) : (
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{hazard.hazard || '-'}</p>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-2 text-center min-w-[80px]">
                          {isAdmin ? (
                            <select
                              value={hazard.condition || 'R'}
                              onChange={(e) => handleHazardChange(hazard.id, 'condition', e.target.value)}
                              className="w-full text-sm rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="R">R</option>
                              <option value="NR">NR</option>
                            </select>
                          ) : (
                            <span className="text-sm text-gray-700">{hazard.condition || 'R'}</span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-2 text-center min-w-[200px]">
                          <div className="flex flex-col gap-1">
                            {['PHY', 'CHE', 'BIO', 'ERG'].map((classType) => (
                              <label key={classType} className="flex items-center justify-center gap-1">
                                {isAdmin ? (
                                  <input
                                    type="checkbox"
                                    checked={hazard.hazardClassification?.[classType] || false}
                                    onChange={(e) => handleHazardClassificationChange(hazard.id, classType, e.target.checked)}
                                    className="w-4 h-4"
                                  />
                                ) : (
                                  <span className="text-sm">{hazard.hazardClassification?.[classType] ? 'X' : ''}</span>
                                )}
                                <span className="text-xs text-gray-600">{classType}</span>
                              </label>
                            ))}
                          </div>
                        </td>
                        <td className="border border-gray-300 px-2 py-2 min-w-[200px]">
                          {isAdmin ? (
                            <textarea
                              value={hazard.risk || ''}
                              onChange={(e) => handleHazardChange(hazard.id, 'risk', e.target.value)}
                              className="w-full text-sm rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              rows={2}
                              placeholder="Risk description"
                            />
                          ) : (
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{hazard.risk || '-'}</p>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-2 min-w-[300px]">
                          <div className="flex flex-col gap-1">
                            {['EX', 'POC', 'SV', 'PC'].map((criteria) => (
                              <div key={criteria} className="flex items-center gap-1">
                                <span className="text-xs text-gray-600 w-8">{criteria}:</span>
                                {isAdmin ? (
                                  <Input
                                    type="text"
                                    value={hazard.criteria?.[criteria] || ''}
                                    onChange={(e) => {
                                      const newCriteria = { ...hazard.criteria, [criteria]: e.target.value }
                                      handleHazardChange(hazard.id, 'criteria', newCriteria)
                                    }}
                                    className="w-16 text-sm text-center"
                                    placeholder="0"
                                  />
                                ) : (
                                  <span className="text-sm text-gray-700">{hazard.criteria?.[criteria] || '-'}</span>
                                )}
                              </div>
                            ))}
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-xs text-gray-600 w-8">TTL:</span>
                              {isAdmin ? (
                                <Input
                                  type="text"
                                  value={hazard.criteria?.ttlRating || ''}
                                  onChange={(e) => {
                                    const newCriteria = { ...hazard.criteria, ttlRating: e.target.value }
                                    handleHazardChange(hazard.id, 'criteria', newCriteria)
                                  }}
                                  className="w-16 text-sm text-center"
                                  placeholder="0"
                                />
                              ) : (
                                <span className="text-sm text-gray-700 font-medium">{hazard.criteria?.ttlRating || '-'}</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="border border-gray-300 px-2 py-2 text-center min-w-[120px]">
                          {isAdmin ? (
                            <input
                              type="checkbox"
                              checked={hazard.legalOtherRequirement || false}
                              onChange={(e) => handleControlMeasureChange(hazard.id, 'legalOtherRequirement', e.target.checked)}
                              className="w-4 h-4"
                            />
                          ) : (
                            <span className="text-sm">{hazard.legalOtherRequirement ? 'L' : ''}</span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-2 text-center min-w-[100px]">
                          {isAdmin ? (
                            <input
                              type="checkbox"
                              checked={hazard.elimination || false}
                              onChange={(e) => handleControlMeasureChange(hazard.id, 'elimination', e.target.checked)}
                              className="w-4 h-4"
                            />
                          ) : (
                            <span className="text-sm">{hazard.elimination ? 'Y' : ''}</span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-2 text-center min-w-[100px]">
                          {isAdmin ? (
                            <input
                              type="checkbox"
                              checked={hazard.substitution || false}
                              onChange={(e) => handleControlMeasureChange(hazard.id, 'substitution', e.target.checked)}
                              className="w-4 h-4"
                            />
                          ) : (
                            <span className="text-sm">{hazard.substitution ? 'Y' : ''}</span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-2 text-center min-w-[120px]">
                          {isAdmin ? (
                            <input
                              type="checkbox"
                              checked={hazard.engineeringControl || false}
                              onChange={(e) => handleControlMeasureChange(hazard.id, 'engineeringControl', e.target.checked)}
                              className="w-4 h-4"
                            />
                          ) : (
                            <span className="text-sm">{hazard.engineeringControl ? 'Y' : ''}</span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-2 text-center min-w-[100px]">
                          {isAdmin ? (
                            <input
                              type="checkbox"
                              checked={hazard.adminControl || false}
                              onChange={(e) => handleControlMeasureChange(hazard.id, 'adminControl', e.target.checked)}
                              className="w-4 h-4"
                            />
                          ) : (
                            <span className="text-sm">{hazard.adminControl ? 'Y' : ''}</span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-2 text-center min-w-[80px]">
                          {isAdmin ? (
                            <input
                              type="checkbox"
                              checked={hazard.ppe || false}
                              onChange={(e) => handleControlMeasureChange(hazard.id, 'ppe', e.target.checked)}
                              className="w-4 h-4"
                            />
                          ) : (
                            <span className="text-sm">{hazard.ppe ? 'Y' : ''}</span>
                          )}
                        </td>
                        {isAdmin && (
                          <td className="border border-gray-300 px-2 py-2 text-center sticky right-0 bg-white z-10 min-w-[100px]">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteHazard(hazard.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Delete
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))}
                    {(!content.hazards || content.hazards.length === 0) && (
                      <tr>
                        <td colSpan={isAdmin ? 14 : 13} className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                          No hazard entries found. {isAdmin && 'Click "Add Hazard Entry" to add a new entry.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            {content.hazards && content.hazards.length > 0 && (
              <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white px-2 py-1 rounded shadow-sm">
                Scroll horizontally to see all columns →
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


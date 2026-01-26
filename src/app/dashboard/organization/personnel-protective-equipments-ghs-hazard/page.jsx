'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Toast } from '@/components/ui/Toast'
import { Input } from '@/components/ui/Input'

export default function PersonnelProtectiveEquipmentsGHSHazardPage() {
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
      documentId: 'ESF-HS-PPE-03',
      date: '20/01/2023',
      contactInfo: 'esfleather@gmail.com, +91 98408 20288',
      ghsHazards: [
        {
          id: 1,
          serialNo: 1,
          ghsCode: 'GHS-01',
          ghsName: 'EXPLOSIVE',
          hazardDescription: 'Explosive, Self-Reactive, Organic Peroxide',
          requiredPPE: [
            { id: 1, type: 'Protective clothing', description: 'Protective clothing must be worn in this area' },
            { id: 2, type: 'Face shield', description: 'Wear face shield' },
            { id: 3, type: 'Hand protection', description: 'Hand protection must be worn' },
            { id: 4, type: 'Foot protection', description: 'Foot protection must be worn' }
          ],
          targetOrgans: ['Lungs', 'Foot']
        },
        {
          id: 2,
          serialNo: 2,
          ghsCode: 'GHS-02',
          ghsName: 'FLAMMABLE',
          hazardDescription: 'Flammable, Self-Reactive, Organic Peroxide, Pyrophoric, Self-Heating',
          requiredPPE: [
            { id: 1, type: 'Respirator', description: 'Respirators must be worn in this area' },
            { id: 2, type: 'Eye protection', description: 'Eye protection must be worn' },
            { id: 3, type: 'Hand protection', description: 'Hand protection must be worn' },
            { id: 4, type: 'Protective clothing', description: 'Protective clothing must be worn in this area' }
          ],
          targetOrgans: ['Lungs', 'Eye']
        },
        {
          id: 3,
          serialNo: 3,
          ghsCode: 'GHS-03',
          ghsName: 'OXIDIZING',
          hazardDescription: 'Oxidizing',
          requiredPPE: [
            { id: 1, type: 'Protective clothing', description: 'Protective clothing must be worn in this area' },
            { id: 2, type: 'Face shield', description: 'Wear face shield' },
            { id: 3, type: 'Hand protection', description: 'Hand protection must be worn' },
            { id: 4, type: 'Foot protection', description: 'Foot protection must be worn' }
          ],
          targetOrgans: ['Hand', 'Foot']
        },
        {
          id: 4,
          serialNo: 4,
          ghsCode: 'GHS-04',
          ghsName: 'COMPRESSED GAS',
          hazardDescription: 'Gas Under Pressure',
          requiredPPE: [
            { id: 1, type: 'Face shield', description: 'Wear face shield' },
            { id: 2, type: 'Hand protection', description: 'Hand protection must be worn' },
            { id: 3, type: 'Foot protection', description: 'Foot protection must be worn' }
          ],
          targetOrgans: ['Foot', 'Hand']
        },
        {
          id: 5,
          serialNo: 5,
          ghsCode: 'GHS-05',
          ghsName: 'CORROSIVE',
          hazardDescription: 'Serious Eye Damage Skin Corrosion Corrosive to Metals',
          requiredPPE: [
            { id: 1, type: 'Face shield', description: 'Wear face shield' },
            { id: 2, type: 'Eye protection', description: 'Eye protection must be worn' },
            { id: 3, type: 'Hand protection', description: 'Hand protection must be worn' },
            { id: 4, type: 'Mask', description: 'Wear mask' }
          ],
          targetOrgans: ['Eye', 'Hand']
        },
        {
          id: 6,
          serialNo: 6,
          ghsCode: 'GHS-06',
          ghsName: 'TOXIC',
          hazardDescription: 'Acute Toxicity (Fatal or Toxic)',
          requiredPPE: [
            { id: 1, type: 'Mask', description: 'Wear mask' },
            { id: 2, type: 'Hand protection', description: 'Hand protection must be worn' },
            { id: 3, type: 'Foot protection', description: 'Foot protection must be worn' },
            { id: 4, type: 'Respirator', description: 'Respirators must be worn in this area' }
          ],
          targetOrgans: ['Hand', 'Foot', 'Lungs']
        },
        {
          id: 7,
          serialNo: 7,
          ghsCode: 'GHS-07',
          ghsName: 'HARMFUL',
          hazardDescription: 'Irritation, Skin Sensitisation, Specific Target Organ, Hazardous to Ozone',
          requiredPPE: [
            { id: 1, type: 'Hand protection', description: 'Hand protection must be worn' },
            { id: 2, type: 'Eye protection', description: 'Eye protection must be worn' },
            { id: 3, type: 'Foot protection', description: 'Foot protection must be worn' },
            { id: 4, type: 'Mask', description: 'Wear mask' }
          ],
          targetOrgans: ['Eye', 'Hand']
        },
        {
          id: 8,
          serialNo: 8,
          ghsCode: 'GHS-08',
          ghsName: 'HEALTH HAZARD',
          hazardDescription: 'Resp. Sensitization, Reproductive Toxicity, Germ Cell Mutagenicity, Aspiration Hazard',
          requiredPPE: [
            { id: 1, type: 'Hand protection', description: 'Hand protection must be worn' },
            { id: 2, type: 'Protective clothing', description: 'Protective clothing must be worn in this area' },
            { id: 3, type: 'Face shield', description: 'Wear face shield' },
            { id: 4, type: 'Foot protection', description: 'Foot protection must be worn' }
          ],
          targetOrgans: ['Full body', 'Hand']
        },
        {
          id: 9,
          serialNo: 9,
          ghsCode: 'GHS-09',
          ghsName: 'ENVIRONMENTAL HAZARD',
          hazardDescription: 'Aquatic Toxicity',
          requiredPPE: [
            { id: 1, type: 'Hand protection', description: 'Hand protection must be worn' },
            { id: 2, type: 'Respirator', description: 'Respirators must be worn in this area' },
            { id: 3, type: 'Foot protection', description: 'Foot protection must be worn' }
          ],
          targetOrgans: ['Hand', 'Lungs']
        }
      ]
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
      const res = await fetch('/api/organization/documents/content?documentName=Personnel Protective Equipments - GHS Hazard')
      const data = await res.json()
      
      if (res.ok) {
        if (data.data?.content) {
          const loadedData = data.data.content.content || content
          // Ensure structure exists
          if (!loadedData.ghsHazards) {
            loadedData.ghsHazards = initializeContent().ghsHazards
          }
          setContent(loadedData)
          setDocumentInfo({
            docNo: data.data.document.docNo || 'ESF-HS-PPE-03',
            revDate: data.data.document.revDate || '',
            revisionNo: data.data.content.revisionNo,
            revisionDate: data.data.content.revisionDate
          })
        } else {
          setDocumentInfo({
            docNo: 'ESF-HS-PPE-03',
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

  const handleGHSHazardChange = (hazardId, field, value) => {
    setContent(prev => ({
      ...prev,
      ghsHazards: prev.ghsHazards.map(hazard =>
        hazard.id === hazardId
          ? { ...hazard, [field]: value }
          : hazard
      )
    }))
  }

  const handlePPEChange = (hazardId, ppeId, field, value) => {
    setContent(prev => ({
      ...prev,
      ghsHazards: prev.ghsHazards.map(hazard => {
        if (hazard.id === hazardId) {
          return {
            ...hazard,
            requiredPPE: hazard.requiredPPE.map(ppe =>
              ppe.id === ppeId
                ? { ...ppe, [field]: value }
                : ppe
            )
          }
        }
        return hazard
      })
    }))
  }

  const handleAddPPE = (hazardId) => {
    setContent(prev => ({
      ...prev,
      ghsHazards: prev.ghsHazards.map(hazard => {
        if (hazard.id === hazardId) {
          const newPPE = {
            id: Date.now(),
            type: '',
            description: ''
          }
          return {
            ...hazard,
            requiredPPE: [...hazard.requiredPPE, newPPE]
          }
        }
        return hazard
      })
    }))
  }

  const handleDeletePPE = (hazardId, ppeId) => {
    setContent(prev => ({
      ...prev,
      ghsHazards: prev.ghsHazards.map(hazard => {
        if (hazard.id === hazardId) {
          return {
            ...hazard,
            requiredPPE: hazard.requiredPPE.filter(ppe => ppe.id !== ppeId)
          }
        }
        return hazard
      })
    }))
  }

  const handleTargetOrganChange = (hazardId, organIndex, value) => {
    setContent(prev => ({
      ...prev,
      ghsHazards: prev.ghsHazards.map(hazard => {
        if (hazard.id === hazardId) {
          const newOrgans = [...(hazard.targetOrgans || [])]
          newOrgans[organIndex] = value
          return { ...hazard, targetOrgans: newOrgans }
        }
        return hazard
      })
    }))
  }

  const handleAddTargetOrgan = (hazardId) => {
    setContent(prev => ({
      ...prev,
      ghsHazards: prev.ghsHazards.map(hazard => {
        if (hazard.id === hazardId) {
          return {
            ...hazard,
            targetOrgans: [...(hazard.targetOrgans || []), '']
          }
        }
        return hazard
      })
    }))
  }

  const handleDeleteTargetOrgan = (hazardId, organIndex) => {
    setContent(prev => ({
      ...prev,
      ghsHazards: prev.ghsHazards.map(hazard => {
        if (hazard.id === hazardId) {
          const newOrgans = [...(hazard.targetOrgans || [])]
          newOrgans.splice(organIndex, 1)
          return { ...hazard, targetOrgans: newOrgans }
        }
        return hazard
      })
    }))
  }

  const handleAddGHSHazard = () => {
    const newHazard = {
      id: Date.now(),
      serialNo: content.ghsHazards.length + 1,
      ghsCode: '',
      ghsName: '',
      hazardDescription: '',
      requiredPPE: [],
      targetOrgans: []
    }
    setContent(prev => ({
      ...prev,
      ghsHazards: [...prev.ghsHazards, newHazard]
    }))
  }

  const handleDeleteGHSHazard = (hazardId) => {
    setContent(prev => ({
      ...prev,
      ghsHazards: prev.ghsHazards
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
          documentName: 'Personnel Protective Equipments - GHS Hazard',
          content: content,
          changeDescription: 'Updated Personnel Protective Equipments - GHS Hazard'
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

      setToast({ type: 'success', message: 'Personnel Protective Equipments - GHS Hazard saved successfully. Revision number incremented.' })
    } catch (error) {
      console.error('Error saving assessment:', error)
      setToast({ type: 'error', message: 'Failed to save changes. Please try again.' })
    }
  }

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'organization', label: 'Organization', href: '/dashboard/organization' },
    { key: 'documents', label: 'Document Details', href: '/dashboard/organization/documents' },
    { key: 'ppe-ghs-hazard', label: 'Personnel Protective Equipments - GHS Hazard', href: '#' }
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
              Personnel Protective Equipments - GHS Hazard
            </h2>
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
                onClick={handleAddGHSHazard}
                className="px-4"
              >
                + Add GHS Hazard Entry
              </Button>
              <Button
                onClick={handleSaveAll}
                className="px-6"
              >
                Save All Changes
              </Button>
            </div>
          )}

          {/* GHS Hazards Table */}
          <div className="relative w-full">
            <div className="w-full overflow-x-auto overflow-y-visible scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200" style={{ maxWidth: '100%', scrollbarWidth: 'thin' }}>
              <div className="border border-gray-300 rounded-md inline-block min-w-full">
                <table className="min-w-full" style={{ minWidth: 'max-content', tableLayout: 'auto' }}>
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-2 py-2 text-center text-xs font-semibold text-gray-700 sticky left-0 bg-gray-100 z-10 min-w-[60px]">
                        S.No
                      </th>
                      <th className="border border-gray-300 px-2 py-2 text-left text-xs font-semibold text-gray-700 min-w-[200px]">
                        General Hazard System (GHS) No & Symbols
                      </th>
                      <th className="border border-gray-300 px-2 py-2 text-left text-xs font-semibold text-gray-700 min-w-[250px]">
                        GHS Number And Hazard Description
                      </th>
                      <th className="border border-gray-300 px-2 py-2 text-left text-xs font-semibold text-gray-700 min-w-[300px]">
                        Required PPE Must Be Worn
                      </th>
                      <th className="border border-gray-300 px-2 py-2 text-left text-xs font-semibold text-gray-700 min-w-[200px]">
                        Target Organs
                      </th>
                      {isAdmin && (
                        <th className="border border-gray-300 px-2 py-2 text-center text-xs font-semibold text-gray-700 min-w-[100px] sticky right-0 bg-gray-100 z-10">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {content.ghsHazards?.map((hazard, index) => (
                      <tr key={hazard.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-2 py-2 text-center text-sm font-medium text-gray-700 bg-gray-50 sticky left-0 z-10">
                          {isAdmin ? (
                            <Input
                              type="number"
                              value={hazard.serialNo}
                              onChange={(e) => handleGHSHazardChange(hazard.id, 'serialNo', parseInt(e.target.value) || 0)}
                              className="w-16 text-center text-sm"
                            />
                          ) : (
                            <span>{hazard.serialNo || index + 1}</span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-2 min-w-[200px]">
                          <div className="space-y-2">
                            {isAdmin ? (
                              <>
                                <Input
                                  type="text"
                                  value={hazard.ghsCode || ''}
                                  onChange={(e) => handleGHSHazardChange(hazard.id, 'ghsCode', e.target.value)}
                                  className="w-full text-sm font-semibold"
                                  placeholder="GHS-01"
                                />
                                <Input
                                  type="text"
                                  value={hazard.ghsName || ''}
                                  onChange={(e) => handleGHSHazardChange(hazard.id, 'ghsName', e.target.value)}
                                  className="w-full text-sm font-semibold"
                                  placeholder="EXPLOSIVE"
                                />
                              </>
                            ) : (
                              <div>
                                <div className="text-sm font-semibold text-gray-900">{hazard.ghsCode || ''}</div>
                                <div className="text-sm font-semibold text-gray-900">{hazard.ghsName || ''}</div>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="border border-gray-300 px-2 py-2 min-w-[250px]">
                          {isAdmin ? (
                            <textarea
                              value={hazard.hazardDescription || ''}
                              onChange={(e) => handleGHSHazardChange(hazard.id, 'hazardDescription', e.target.value)}
                              className="w-full text-sm rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              rows={3}
                              placeholder="Hazard description"
                            />
                          ) : (
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{hazard.hazardDescription || '-'}</p>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-2 min-w-[300px]">
                          <div className="space-y-2">
                            {hazard.requiredPPE?.map((ppe, ppeIndex) => (
                              <div key={ppe.id} className="flex items-center gap-2 p-2 bg-blue-50 rounded border border-blue-200">
                                {isAdmin ? (
                                  <>
                                    <Input
                                      type="text"
                                      value={ppe.type || ''}
                                      onChange={(e) => handlePPEChange(hazard.id, ppe.id, 'type', e.target.value)}
                                      className="flex-1 text-sm"
                                      placeholder="PPE Type"
                                    />
                                    <Input
                                      type="text"
                                      value={ppe.description || ''}
                                      onChange={(e) => handlePPEChange(hazard.id, ppe.id, 'description', e.target.value)}
                                      className="flex-1 text-sm"
                                      placeholder="Description"
                                    />
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDeletePPE(hazard.id, ppe.id)}
                                      className="text-red-600 hover:text-red-700 px-2"
                                    >
                                      ×
                                    </Button>
                                  </>
                                ) : (
                                  <span className="text-sm text-gray-700">{ppe.description || ppe.type || '-'}</span>
                                )}
                              </div>
                            ))}
                            {isAdmin && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAddPPE(hazard.id)}
                                className="w-full text-xs"
                              >
                                + Add PPE
                              </Button>
                            )}
                            {(!hazard.requiredPPE || hazard.requiredPPE.length === 0) && !isAdmin && (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </div>
                        </td>
                        <td className="border border-gray-300 px-2 py-2 min-w-[200px]">
                          <div className="space-y-1">
                            {hazard.targetOrgans?.map((organ, organIndex) => (
                              <div key={organIndex} className="flex items-center gap-2">
                                {isAdmin ? (
                                  <>
                                    <Input
                                      type="text"
                                      value={organ || ''}
                                      onChange={(e) => handleTargetOrganChange(hazard.id, organIndex, e.target.value)}
                                      className="flex-1 text-sm"
                                      placeholder="Target organ"
                                    />
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDeleteTargetOrgan(hazard.id, organIndex)}
                                      className="text-red-600 hover:text-red-700 px-2"
                                    >
                                      ×
                                    </Button>
                                  </>
                                ) : (
                                  <span className="text-sm text-gray-700">{organ || '-'}</span>
                                )}
                              </div>
                            ))}
                            {isAdmin && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAddTargetOrgan(hazard.id)}
                                className="w-full text-xs"
                              >
                                + Add Target Organ
                              </Button>
                            )}
                            {(!hazard.targetOrgans || hazard.targetOrgans.length === 0) && !isAdmin && (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </div>
                        </td>
                        {isAdmin && (
                          <td className="border border-gray-300 px-2 py-2 text-center sticky right-0 bg-white z-10 min-w-[100px]">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteGHSHazard(hazard.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Delete
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))}
                    {(!content.ghsHazards || content.ghsHazards.length === 0) && (
                      <tr>
                        <td colSpan={isAdmin ? 6 : 5} className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                          No GHS hazard entries found. {isAdmin && 'Click "Add GHS Hazard Entry" to add a new entry.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            {content.ghsHazards && content.ghsHazards.length > 0 && (
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


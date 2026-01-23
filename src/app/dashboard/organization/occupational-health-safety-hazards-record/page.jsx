'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Toast } from '@/components/ui/Toast'
import { Input } from '@/components/ui/Input'

export default function OccupationalHealthSafetyHazardsRecordPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [documentInfo, setDocumentInfo] = useState(null)

  const isAdmin = session?.user?.role === 'SUPER_ADMIN' || session?.user?.role === 'ADMIN' || session?.user?.role === 'super_admin' || session?.user?.role === 'admin'

  // Initialize content structure with sample data from images
  const initializeContent = () => {
    return {
      preparedBy: 'ESF LEATHER CONSULTANCY',
      contactInfo: 'esfleather@gmail.com +91-98408 20288',
      documentId: 'ESF-HS-CHE-02',
      date: '20/01/2023',
      revision: '0',
      hazards: [
        {
          id: 1,
          serialNo: 1,
          areaActivity: 'SHAVING / FEEDING',
          functionTask: '',
          hazard: 'TRAPPING OF ARMS & FINGERS IN KNIFE ROLL',
          conditionR: true,
          conditionNR: false,
          hazardPHY: false,
          hazardCHE: false,
          hazardBIO: false,
          hazardERG: true,
          risk: 'CUTS, DISABLEMENT',
          criteriaEX: 5,
          criteriaPOC: 2,
          criteriaSV: 3,
          criteriaPC: 1,
          ttlRating: 30,
          legalOtherRequirement: '',
          elimination: false,
          substitution: false,
          engineeringControl: true,
          adminControl: false,
          ppe: false
        },
        {
          id: 2,
          serialNo: 2,
          areaActivity: 'MOVEMENT',
          functionTask: 'MANUAL CARRYING',
          hazard: '',
          conditionR: false,
          conditionNR: true,
          hazardPHY: false,
          hazardCHE: false,
          hazardBIO: false,
          hazardERG: true,
          risk: 'MUSKELETOL INJURIES',
          criteriaEX: 5,
          criteriaPOC: 2,
          criteriaSV: 2,
          criteriaPC: 1,
          ttlRating: 20,
          legalOtherRequirement: '',
          elimination: false,
          substitution: false,
          engineeringControl: false,
          adminControl: true,
          ppe: false
        },
        {
          id: 3,
          serialNo: 3,
          areaActivity: 'OPERATING',
          functionTask: 'PROLONGED WORK IN STANDING POSTURE',
          hazard: '',
          conditionR: true,
          conditionNR: false,
          hazardPHY: false,
          hazardCHE: false,
          hazardBIO: false,
          hazardERG: true,
          risk: 'LOWER BACK PAIN,LEG PAIN',
          criteriaEX: 5,
          criteriaPOC: 2,
          criteriaSV: 2,
          criteriaPC: 2,
          ttlRating: 40,
          legalOtherRequirement: '',
          elimination: false,
          substitution: false,
          engineeringControl: false,
          adminControl: true,
          ppe: false
        },
        {
          id: 4,
          serialNo: 4,
          areaActivity: 'OPERATING',
          functionTask: 'ACCIDENTAL ACCESS TO UNGUARDED MOVING PARTS',
          hazard: '',
          conditionR: false,
          conditionNR: true,
          hazardPHY: false,
          hazardCHE: false,
          hazardBIO: false,
          hazardERG: true,
          risk: 'INUIRIES',
          criteriaEX: 5,
          criteriaPOC: 2,
          criteriaSV: 3,
          criteriaPC: 1,
          ttlRating: 30,
          legalOtherRequirement: '',
          elimination: false,
          substitution: false,
          engineeringControl: true,
          adminControl: false,
          ppe: false
        },
        {
          id: 5,
          serialNo: 5,
          areaActivity: 'OPERATING',
          functionTask: 'EXPOSURE TO HIGH NOISE LEVELS',
          hazard: '',
          conditionR: true,
          conditionNR: false,
          hazardPHY: true,
          hazardCHE: false,
          hazardBIO: false,
          hazardERG: false,
          risk: 'HEARING IMPAIRMENT',
          criteriaEX: 5,
          criteriaPOC: 2,
          criteriaSV: 2,
          criteriaPC: 2,
          ttlRating: 40,
          legalOtherRequirement: '',
          elimination: false,
          substitution: false,
          engineeringControl: false,
          adminControl: true,
          ppe: false
        },
        {
          id: 6,
          serialNo: 6,
          areaActivity: 'OPERATING',
          functionTask: 'EXPOSURE TO FINE DUST',
          hazard: '',
          conditionR: true,
          conditionNR: false,
          hazardPHY: false,
          hazardCHE: true,
          hazardBIO: false,
          hazardERG: false,
          risk: 'LUNGS DISEASES',
          criteriaEX: 5,
          criteriaPOC: 3,
          criteriaSV: 2,
          criteriaPC: 1,
          ttlRating: 30,
          legalOtherRequirement: '',
          elimination: false,
          substitution: false,
          engineeringControl: false,
          adminControl: false,
          ppe: true
        },
        {
          id: 7,
          serialNo: 7,
          areaActivity: 'OPERATING',
          functionTask: 'GRINDING WHEEL MISALIGNMENT',
          hazard: '',
          conditionR: true,
          conditionNR: false,
          hazardPHY: false,
          hazardCHE: false,
          hazardBIO: false,
          hazardERG: true,
          risk: 'INUIRIES',
          criteriaEX: 5,
          criteriaPOC: 2,
          criteriaSV: 2,
          criteriaPC: 1,
          ttlRating: 20,
          legalOtherRequirement: '',
          elimination: false,
          substitution: false,
          engineeringControl: true,
          adminControl: false,
          ppe: false
        },
        {
          id: 8,
          serialNo: 8,
          areaActivity: 'OPERATION',
          functionTask: 'ELECTROCUTION',
          hazard: '',
          conditionR: true,
          conditionNR: false,
          hazardPHY: true,
          hazardCHE: false,
          hazardBIO: false,
          hazardERG: false,
          risk: 'FATAL, UNCONSIOUSNESS',
          criteriaEX: 5,
          criteriaPOC: 2,
          criteriaSV: 4,
          criteriaPC: 1,
          ttlRating: 40,
          legalOtherRequirement: '',
          elimination: false,
          substitution: false,
          engineeringControl: true,
          adminControl: false,
          ppe: false
        },
        {
          id: 9,
          serialNo: 9,
          areaActivity: 'OPERATION',
          functionTask: 'FIRE HAZARD IN SUCTION VALVES',
          hazard: '',
          conditionR: true,
          conditionNR: false,
          hazardPHY: true,
          hazardCHE: false,
          hazardBIO: false,
          hazardERG: false,
          risk: 'CASULATIES, PROPERTY DAMAGE',
          criteriaEX: 5,
          criteriaPOC: 2,
          criteriaSV: 4,
          criteriaPC: 1,
          ttlRating: 40,
          legalOtherRequirement: '',
          elimination: false,
          substitution: false,
          engineeringControl: true,
          adminControl: false,
          ppe: false
        },
        {
          id: 10,
          serialNo: 10,
          areaActivity: 'KNIFE FITTING',
          functionTask: 'LIFTING OF KNIFE ROLLERS',
          hazard: '',
          conditionR: false,
          conditionNR: true,
          hazardPHY: false,
          hazardCHE: false,
          hazardBIO: false,
          hazardERG: true,
          risk: 'CUTS, TEMPORARY DISABLEMENT',
          criteriaEX: 3,
          criteriaPOC: 2,
          criteriaSV: 3,
          criteriaPC: 1,
          ttlRating: 18,
          legalOtherRequirement: '',
          elimination: false,
          substitution: false,
          engineeringControl: false,
          adminControl: true,
          ppe: false
        },
        {
          id: 11,
          serialNo: 11,
          areaActivity: 'KNIFE FITTING',
          functionTask: 'KNIFE FITTING IN CYLINDERS',
          hazard: '',
          conditionR: false,
          conditionNR: true,
          hazardPHY: false,
          hazardCHE: false,
          hazardBIO: false,
          hazardERG: true,
          risk: 'CUTS, STAB',
          criteriaEX: 3,
          criteriaPOC: 2,
          criteriaSV: 3,
          criteriaPC: 2,
          ttlRating: 36,
          legalOtherRequirement: '',
          elimination: false,
          substitution: false,
          engineeringControl: false,
          adminControl: true,
          ppe: false
        },
        {
          id: 12,
          serialNo: 12,
          areaActivity: 'KNIFE FITTING',
          functionTask: 'SPARKS WHILE HITTING BLADES',
          hazard: '',
          conditionR: false,
          conditionNR: true,
          hazardPHY: true,
          hazardCHE: false,
          hazardBIO: false,
          hazardERG: false,
          risk: 'EYE INJURY',
          criteriaEX: 5,
          criteriaPOC: 2,
          criteriaSV: 3,
          criteriaPC: 1,
          ttlRating: 30,
          legalOtherRequirement: '',
          elimination: false,
          substitution: false,
          engineeringControl: false,
          adminControl: false,
          ppe: true
        },
        {
          id: 13,
          serialNo: 13,
          areaActivity: 'DUST COLLECTION',
          functionTask: 'DUST',
          hazard: '',
          conditionR: true,
          conditionNR: false,
          hazardPHY: false,
          hazardCHE: true,
          hazardBIO: false,
          hazardERG: false,
          risk: 'LUNGS DISEASES',
          criteriaEX: 5,
          criteriaPOC: 3,
          criteriaSV: 2,
          criteriaPC: 2,
          ttlRating: 60,
          legalOtherRequirement: '',
          elimination: false,
          substitution: false,
          engineeringControl: false,
          adminControl: false,
          ppe: true
        },
        {
          id: 14,
          serialNo: 14,
          areaActivity: 'DUST COLLECTION',
          functionTask: 'FIRE HAZARD IN SUCTION VALVES',
          hazard: '',
          conditionR: true,
          conditionNR: false,
          hazardPHY: true,
          hazardCHE: false,
          hazardBIO: false,
          hazardERG: false,
          risk: 'CASULATIES, PROPERTY DAMAGE',
          criteriaEX: 5,
          criteriaPOC: 2,
          criteriaSV: 4,
          criteriaPC: 2,
          ttlRating: 80,
          legalOtherRequirement: '',
          elimination: false,
          substitution: false,
          engineeringControl: true,
          adminControl: false,
          ppe: false
        },
        {
          id: 15,
          serialNo: 15,
          areaActivity: 'OPERATION',
          functionTask: 'EXPOSURE TO HIGH NOISE LEVELS',
          hazard: '',
          conditionR: false,
          conditionNR: true,
          hazardPHY: true,
          hazardCHE: false,
          hazardBIO: false,
          hazardERG: false,
          risk: 'HEARING IMPAIRMENT',
          criteriaEX: 5,
          criteriaPOC: 3,
          criteriaSV: 3,
          criteriaPC: 2,
          ttlRating: 90,
          legalOtherRequirement: '',
          elimination: false,
          substitution: false,
          engineeringControl: false,
          adminControl: true,
          ppe: false
        },
        {
          id: 16,
          serialNo: 16,
          areaActivity: 'OPERATION',
          functionTask: 'DUST FUMES / FIRE HAZARD',
          hazard: '',
          conditionR: false,
          conditionNR: true,
          hazardPHY: true,
          hazardCHE: false,
          hazardBIO: false,
          hazardERG: false,
          risk: 'PROPERTY DAMAGE',
          criteriaEX: 5,
          criteriaPOC: 3,
          criteriaSV: 2,
          criteriaPC: 2,
          ttlRating: 60,
          legalOtherRequirement: '',
          elimination: false,
          substitution: false,
          engineeringControl: true,
          adminControl: false,
          ppe: false
        },
        {
          id: 17,
          serialNo: 17,
          areaActivity: 'DISPOSAL',
          functionTask: 'MANUAL CARRYING',
          hazard: '',
          conditionR: false,
          conditionNR: true,
          hazardPHY: false,
          hazardCHE: false,
          hazardBIO: false,
          hazardERG: true,
          risk: 'MUSKELETOL INJURIES',
          criteriaEX: 5,
          criteriaPOC: 2,
          criteriaSV: 2,
          criteriaPC: 1,
          ttlRating: 20,
          legalOtherRequirement: '',
          elimination: false,
          substitution: false,
          engineeringControl: false,
          adminControl: true,
          ppe: true
        },
        {
          id: 18,
          serialNo: 18,
          areaActivity: 'DISPOSAL',
          functionTask: 'FALL FROM LOADING PLATFORM',
          hazard: '',
          conditionR: false,
          conditionNR: true,
          hazardPHY: false,
          hazardCHE: false,
          hazardBIO: false,
          hazardERG: true,
          risk: 'INJURIES',
          criteriaEX: 5,
          criteriaPOC: 2,
          criteriaSV: 2,
          criteriaPC: 3,
          ttlRating: 60,
          legalOtherRequirement: '',
          elimination: false,
          substitution: false,
          engineeringControl: false,
          adminControl: true,
          ppe: false
        },
        {
          id: 19,
          serialNo: 19,
          areaActivity: 'OPERATION',
          functionTask: 'ELECTROCUTION',
          hazard: '',
          conditionR: true,
          conditionNR: false,
          hazardPHY: true,
          hazardCHE: false,
          hazardBIO: false,
          hazardERG: false,
          risk: 'FATAL, UNCONSIOUSNESS',
          criteriaEX: 5,
          criteriaPOC: 2,
          criteriaSV: 4,
          criteriaPC: 1,
          ttlRating: 40,
          legalOtherRequirement: '',
          elimination: false,
          substitution: false,
          engineeringControl: true,
          adminControl: false,
          ppe: false
        },
        {
          id: 20,
          serialNo: 20,
          areaActivity: 'GENERAL',
          functionTask: 'OPERATION',
          hazard: 'SPREAD OF CORONA',
          conditionR: false,
          conditionNR: true,
          hazardPHY: false,
          hazardCHE: false,
          hazardBIO: true,
          hazardERG: false,
          risk: 'FATAL, CAN SPREAD TO OTHERS',
          criteriaEX: 5,
          criteriaPOC: 3,
          criteriaSV: 5,
          criteriaPC: 2,
          ttlRating: 150,
          legalOtherRequirement: 'L',
          elimination: false,
          substitution: false,
          engineeringControl: false,
          adminControl: true,
          ppe: false
        }
      ]
    }
  }

  // Occupational Health & Safety Hazards Record Data Structure
  const [content, setContent] = useState(initializeContent())

  useEffect(() => {
    fetchDocumentContent()
  }, [])

  const fetchDocumentContent = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/organization/documents/content?documentName=OCCUPATIONAL HEALTH & SAFETY HAZARDS RECORD')
      const data = await res.json()
      
      if (res.ok) {
        if (data.data?.content) {
          const loadedData = data.data.content.content || content
          // Ensure structure exists
          if (!loadedData.hazards) {
            loadedData.hazards = initializeContent().hazards
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

  // Calculate TTL Rating
  const calculateTTLRating = (ex, poc, sv, pc) => {
    return ex * poc * sv * pc
  }

  const handleHazardChange = (hazardId, field, value) => {
    setContent(prev => ({
      ...prev,
      hazards: prev.hazards.map(hazard => {
        if (hazard.id === hazardId) {
          const updated = { ...hazard, [field]: value }
          // Auto-calculate TTL Rating if criteria changed
          if (['criteriaEX', 'criteriaPOC', 'criteriaSV', 'criteriaPC'].includes(field)) {
            updated.ttlRating = calculateTTLRating(
              field === 'criteriaEX' ? value : updated.criteriaEX,
              field === 'criteriaPOC' ? value : updated.criteriaPOC,
              field === 'criteriaSV' ? value : updated.criteriaSV,
              field === 'criteriaPC' ? value : updated.criteriaPC
            )
          }
          return updated
        }
        return hazard
      })
    }))
  }

  const handleAddHazard = () => {
    const newHazard = {
      id: Date.now(),
      serialNo: content.hazards.length + 1,
      areaActivity: '',
      functionTask: '',
      hazard: '',
      conditionR: false,
      conditionNR: false,
      hazardPHY: false,
      hazardCHE: false,
      hazardBIO: false,
      hazardERG: false,
      risk: '',
      criteriaEX: 1,
      criteriaPOC: 1,
      criteriaSV: 1,
      criteriaPC: 1,
      ttlRating: 1,
      legalOtherRequirement: '',
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
    if (content.hazards.length <= 1) {
      alert('At least one hazard is required')
      return
    }
    const updatedHazards = content.hazards.filter(h => h.id !== hazardId)
    // Re-number serial numbers
    updatedHazards.forEach((h, index) => {
      h.serialNo = index + 1
    })
    setContent(prev => ({
      ...prev,
      hazards: updatedHazards
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
          documentName: 'OCCUPATIONAL HEALTH & SAFETY HAZARDS RECORD',
          content: content,
          changeDescription: 'Updated Occupational Health & Safety Hazards Record'
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

      setToast({ type: 'success', message: 'Occupational Health & Safety Hazards Record saved successfully. Revision number incremented.' })
    } catch (error) {
      console.error('Error saving record:', error)
      setToast({ type: 'error', message: 'Failed to save changes. Please try again.' })
    }
  }

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'organization', label: 'Organization', href: '/dashboard/organization' },
    { key: 'documents', label: 'Document Details', href: '/dashboard/organization/documents' },
    { key: 'ohs-hazards', label: 'Occupational Health & Safety Hazards Record', href: '#' }
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
            <div className="mt-4 flex gap-6 text-sm text-gray-600 flex-wrap">
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
                <span className="font-medium">Contact:</span>{' '}
                {isAdmin ? (
                  <Input
                    type="text"
                    value={content.contactInfo}
                    onChange={(e) => handleInputChange('contactInfo', e.target.value)}
                    className="inline-block w-64 ml-2"
                  />
                ) : (
                  <span className="ml-2">{content.contactInfo}</span>
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
                + Add Hazard
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
                      <th rowSpan={2} className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700 sticky left-0 bg-gray-100 z-10 min-w-[60px]">
                        S.NO
                      </th>
                      <th rowSpan={2} className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700 sticky left-[60px] bg-gray-100 z-10 min-w-[150px]">
                        AREA / ACTIVITY
                      </th>
                      <th rowSpan={2} className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700 sticky left-[210px] bg-gray-100 z-10 min-w-[150px]">
                        FUNCTION / TASK
                      </th>
                      <th rowSpan={2} className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700 sticky left-[360px] bg-gray-100 z-10 min-w-[200px]">
                        HAZARD
                      </th>
                      <th colSpan={2} className="border border-gray-300 px-2 py-1 text-center text-xs font-semibold text-gray-700 min-w-[120px]">
                        CONDITION
                      </th>
                      <th colSpan={4} className="border border-gray-300 px-2 py-1 text-center text-xs font-semibold text-gray-700 min-w-[160px]">
                        HAZARD CLASSIFICATION
                      </th>
                      <th rowSpan={2} className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700 min-w-[200px]">
                        RISK
                      </th>
                      <th colSpan={4} className="border border-gray-300 px-2 py-1 text-center text-xs font-semibold text-gray-700 min-w-[200px]">
                        CRITERIA
                      </th>
                      <th rowSpan={2} className="border border-gray-300 px-3 py-2 text-center text-xs font-semibold text-gray-700 min-w-[100px]">
                        TTL RATING
                      </th>
                      <th rowSpan={2} className="border border-gray-300 px-3 py-2 text-center text-xs font-semibold text-gray-700 min-w-[120px]">
                        LEGAL / OTHER REQUIREMENT
                      </th>
                      <th rowSpan={2} className="border border-gray-300 px-3 py-2 text-center text-xs font-semibold text-gray-700 min-w-[100px]">
                        ELIMINATION
                      </th>
                      <th rowSpan={2} className="border border-gray-300 px-3 py-2 text-center text-xs font-semibold text-gray-700 min-w-[100px]">
                        SUBSTITUTION
                      </th>
                      <th rowSpan={2} className="border border-gray-300 px-3 py-2 text-center text-xs font-semibold text-gray-700 min-w-[120px]">
                        ENGINEERING CONTROL
                      </th>
                      <th rowSpan={2} className="border border-gray-300 px-3 py-2 text-center text-xs font-semibold text-gray-700 min-w-[120px]">
                        ADMIN. CONTROL
                      </th>
                      <th rowSpan={2} className="border border-gray-300 px-3 py-2 text-center text-xs font-semibold text-gray-700 min-w-[80px]">
                        PPE
                      </th>
                      {isAdmin && (
                        <th rowSpan={2} className="border border-gray-300 px-3 py-2 text-center text-xs font-semibold text-gray-700 min-w-[100px]">
                          Actions
                        </th>
                      )}
                    </tr>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-2 py-1 text-center text-xs font-semibold text-gray-700 min-w-[60px]">
                        R
                      </th>
                      <th className="border border-gray-300 px-2 py-1 text-center text-xs font-semibold text-gray-700 min-w-[60px]">
                        NR
                      </th>
                      <th className="border border-gray-300 px-2 py-1 text-center text-xs font-semibold text-gray-700 min-w-[40px]">
                        PHY
                      </th>
                      <th className="border border-gray-300 px-2 py-1 text-center text-xs font-semibold text-gray-700 min-w-[40px]">
                        CHE
                      </th>
                      <th className="border border-gray-300 px-2 py-1 text-center text-xs font-semibold text-gray-700 min-w-[40px]">
                        BIO
                      </th>
                      <th className="border border-gray-300 px-2 py-1 text-center text-xs font-semibold text-gray-700 min-w-[40px]">
                        ERG
                      </th>
                      <th className="border border-gray-300 px-2 py-1 text-center text-xs font-semibold text-gray-700 min-w-[50px]">
                        EX
                      </th>
                      <th className="border border-gray-300 px-2 py-1 text-center text-xs font-semibold text-gray-700 min-w-[50px]">
                        POC
                      </th>
                      <th className="border border-gray-300 px-2 py-1 text-center text-xs font-semibold text-gray-700 min-w-[50px]">
                        SV
                      </th>
                      <th className="border border-gray-300 px-2 py-1 text-center text-xs font-semibold text-gray-700 min-w-[50px]">
                        PC
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {content.hazards?.map((hazard, index) => (
                      <tr key={hazard.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-3 py-2 text-sm text-center text-gray-700 bg-gray-50 sticky left-0 z-10 min-w-[60px]">
                          {isAdmin ? (
                            <Input
                              type="number"
                              value={hazard.serialNo}
                              onChange={(e) => handleHazardChange(hazard.id, 'serialNo', parseInt(e.target.value) || 0)}
                              className="w-full text-sm text-center"
                            />
                          ) : (
                            <span>{hazard.serialNo}</span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-2 text-sm text-gray-700 bg-gray-50 sticky left-[60px] z-10 min-w-[150px]">
                          {isAdmin ? (
                            <Input
                              type="text"
                              value={hazard.areaActivity}
                              onChange={(e) => handleHazardChange(hazard.id, 'areaActivity', e.target.value)}
                              className="w-full text-sm"
                              placeholder="Area/Activity"
                            />
                          ) : (
                            <span>{hazard.areaActivity || '-'}</span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-2 text-sm text-gray-700 bg-gray-50 sticky left-[210px] z-10 min-w-[150px]">
                          {isAdmin ? (
                            <Input
                              type="text"
                              value={hazard.functionTask}
                              onChange={(e) => handleHazardChange(hazard.id, 'functionTask', e.target.value)}
                              className="w-full text-sm"
                              placeholder="Function/Task"
                            />
                          ) : (
                            <span>{hazard.functionTask || '-'}</span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-2 text-sm text-gray-700 bg-gray-50 sticky left-[360px] z-10 min-w-[200px]">
                          {isAdmin ? (
                            <Input
                              type="text"
                              value={hazard.hazard}
                              onChange={(e) => handleHazardChange(hazard.id, 'hazard', e.target.value)}
                              className="w-full text-sm"
                              placeholder="Hazard"
                            />
                          ) : (
                            <span>{hazard.hazard || '-'}</span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-2 text-center min-w-[60px]">
                          {isAdmin ? (
                            <input
                              type="checkbox"
                              checked={hazard.conditionR}
                              onChange={(e) => {
                                handleHazardChange(hazard.id, 'conditionR', e.target.checked)
                                if (e.target.checked) {
                                  handleHazardChange(hazard.id, 'conditionNR', false)
                                }
                              }}
                              className="w-4 h-4"
                            />
                          ) : (
                            <span>{hazard.conditionR ? 'X' : ''}</span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-2 text-center min-w-[60px]">
                          {isAdmin ? (
                            <input
                              type="checkbox"
                              checked={hazard.conditionNR}
                              onChange={(e) => {
                                handleHazardChange(hazard.id, 'conditionNR', e.target.checked)
                                if (e.target.checked) {
                                  handleHazardChange(hazard.id, 'conditionR', false)
                                }
                              }}
                              className="w-4 h-4"
                            />
                          ) : (
                            <span>{hazard.conditionNR ? 'X' : ''}</span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-2 text-center min-w-[40px]">
                          {isAdmin ? (
                            <input
                              type="checkbox"
                              checked={hazard.hazardPHY}
                              onChange={(e) => handleHazardChange(hazard.id, 'hazardPHY', e.target.checked)}
                              className="w-4 h-4"
                            />
                          ) : (
                            <span>{hazard.hazardPHY ? 'X' : ''}</span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-2 text-center min-w-[40px]">
                          {isAdmin ? (
                            <input
                              type="checkbox"
                              checked={hazard.hazardCHE}
                              onChange={(e) => handleHazardChange(hazard.id, 'hazardCHE', e.target.checked)}
                              className="w-4 h-4"
                            />
                          ) : (
                            <span>{hazard.hazardCHE ? 'X' : ''}</span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-2 text-center min-w-[40px]">
                          {isAdmin ? (
                            <input
                              type="checkbox"
                              checked={hazard.hazardBIO}
                              onChange={(e) => handleHazardChange(hazard.id, 'hazardBIO', e.target.checked)}
                              className="w-4 h-4"
                            />
                          ) : (
                            <span>{hazard.hazardBIO ? 'X' : ''}</span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-2 text-center min-w-[40px]">
                          {isAdmin ? (
                            <input
                              type="checkbox"
                              checked={hazard.hazardERG}
                              onChange={(e) => handleHazardChange(hazard.id, 'hazardERG', e.target.checked)}
                              className="w-4 h-4"
                            />
                          ) : (
                            <span>{hazard.hazardERG ? 'X' : ''}</span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-2 min-w-[200px]">
                          {isAdmin ? (
                            <Input
                              type="text"
                              value={hazard.risk}
                              onChange={(e) => handleHazardChange(hazard.id, 'risk', e.target.value)}
                              className="w-full text-sm"
                              placeholder="Risk"
                            />
                          ) : (
                            <span className="text-sm">{hazard.risk || '-'}</span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-1 py-2 text-center min-w-[50px]">
                          {isAdmin ? (
                            <Input
                              type="number"
                              min="1"
                              max="5"
                              value={hazard.criteriaEX}
                              onChange={(e) => handleHazardChange(hazard.id, 'criteriaEX', parseInt(e.target.value) || 1)}
                              className="w-full text-sm text-center"
                            />
                          ) : (
                            <span className="text-sm">{hazard.criteriaEX}</span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-1 py-2 text-center min-w-[50px]">
                          {isAdmin ? (
                            <Input
                              type="number"
                              min="1"
                              max="5"
                              value={hazard.criteriaPOC}
                              onChange={(e) => handleHazardChange(hazard.id, 'criteriaPOC', parseInt(e.target.value) || 1)}
                              className="w-full text-sm text-center"
                            />
                          ) : (
                            <span className="text-sm">{hazard.criteriaPOC}</span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-1 py-2 text-center min-w-[50px]">
                          {isAdmin ? (
                            <Input
                              type="number"
                              min="1"
                              max="5"
                              value={hazard.criteriaSV}
                              onChange={(e) => handleHazardChange(hazard.id, 'criteriaSV', parseInt(e.target.value) || 1)}
                              className="w-full text-sm text-center"
                            />
                          ) : (
                            <span className="text-sm">{hazard.criteriaSV}</span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-1 py-2 text-center min-w-[50px]">
                          {isAdmin ? (
                            <Input
                              type="number"
                              min="1"
                              max="5"
                              value={hazard.criteriaPC}
                              onChange={(e) => handleHazardChange(hazard.id, 'criteriaPC', parseInt(e.target.value) || 1)}
                              className="w-full text-sm text-center"
                            />
                          ) : (
                            <span className="text-sm">{hazard.criteriaPC}</span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-2 text-center text-sm font-medium text-gray-700 bg-blue-50 min-w-[100px]">
                          {hazard.ttlRating}
                        </td>
                        <td className="border border-gray-300 px-2 py-2 text-center min-w-[120px]">
                          {isAdmin ? (
                            <Input
                              type="text"
                              value={hazard.legalOtherRequirement}
                              onChange={(e) => handleHazardChange(hazard.id, 'legalOtherRequirement', e.target.value)}
                              className="w-full text-sm text-center"
                              placeholder="L"
                            />
                          ) : (
                            <span className="text-sm">{hazard.legalOtherRequirement || '-'}</span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-2 text-center min-w-[100px]">
                          {isAdmin ? (
                            <input
                              type="checkbox"
                              checked={hazard.elimination}
                              onChange={(e) => handleHazardChange(hazard.id, 'elimination', e.target.checked)}
                              className="w-4 h-4"
                            />
                          ) : (
                            <span>{hazard.elimination ? 'Y' : ''}</span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-2 text-center min-w-[100px]">
                          {isAdmin ? (
                            <input
                              type="checkbox"
                              checked={hazard.substitution}
                              onChange={(e) => handleHazardChange(hazard.id, 'substitution', e.target.checked)}
                              className="w-4 h-4"
                            />
                          ) : (
                            <span>{hazard.substitution ? 'Y' : ''}</span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-2 text-center min-w-[120px]">
                          {isAdmin ? (
                            <input
                              type="checkbox"
                              checked={hazard.engineeringControl}
                              onChange={(e) => handleHazardChange(hazard.id, 'engineeringControl', e.target.checked)}
                              className="w-4 h-4"
                            />
                          ) : (
                            <span>{hazard.engineeringControl ? 'Y' : ''}</span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-2 text-center min-w-[120px]">
                          {isAdmin ? (
                            <input
                              type="checkbox"
                              checked={hazard.adminControl}
                              onChange={(e) => handleHazardChange(hazard.id, 'adminControl', e.target.checked)}
                              className="w-4 h-4"
                            />
                          ) : (
                            <span>{hazard.adminControl ? 'Y' : ''}</span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-2 text-center min-w-[80px]">
                          {isAdmin ? (
                            <input
                              type="checkbox"
                              checked={hazard.ppe}
                              onChange={(e) => handleHazardChange(hazard.id, 'ppe', e.target.checked)}
                              className="w-4 h-4"
                            />
                          ) : (
                            <span>{hazard.ppe ? 'Y' : ''}</span>
                          )}
                        </td>
                        {isAdmin && (
                          <td className="border border-gray-300 px-2 py-2 text-center min-w-[100px]">
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

          {/* Footer */}
          <div className="text-center text-sm text-gray-600 mt-6">
            Done by ESF leather consultancy.
          </div>
        </div>
      </div>
    </div>
  )
}


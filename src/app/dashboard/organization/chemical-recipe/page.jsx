'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Toast } from '@/components/ui/Toast'
import { Input } from '@/components/ui/Input'
import EditableSection from '@/components/documents/EditableSection'

export default function ChemicalRecipePage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [documentInfo, setDocumentInfo] = useState(null)

  const isAdmin = session?.user?.role === 'SUPER_ADMIN' || session?.user?.role === 'ADMIN' || session?.user?.role === 'super_admin' || session?.user?.role === 'admin'

  // Chemical Recipe Data Structure
  const [content, setContent] = useState({
    descriptionOfChange: '',
    alternationTypes: {
      processChange: false,
      documented: false,
      informationDyeingChemical: false,
      finishingChemical: false,
      waterBase: false,
      solventBase: false
    },
    personRecommendingChange: '',
    personRecommendingDate: '',
    supervisorConcurrence: '',
    supervisorConcurrenceDate: '',
    evaluation: 'Description of evaluation undertaken. Will the change affect existing products or services? Is the change necessary? Is there any impact to existing documents (procedures, policies, forms, etc.)? Is personnel training / re-training required? What risks or business impacts are associated with the proposed change?',
    technicianName: '',
    technicianDate: '',
    directorName: '',
    directorDate: ''
  })

  useEffect(() => {
    fetchDocumentContent()
  }, [])

  const fetchDocumentContent = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/organization/documents/content?documentName=Chemical Recipe')
      const data = await res.json()
      
      if (res.ok) {
        if (data.data?.content) {
          const loadedData = data.data.content.content || content
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

  const handleSaveSection = async (sectionKey, sectionContent) => {
    try {
      const updatedContent = {
        ...content,
        [sectionKey]: sectionContent
      }

      const res = await fetch('/api/organization/documents/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentName: 'Chemical Recipe',
          content: updatedContent,
          changeDescription: `Updated ${sectionKey} section`
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save changes')
      }

      setContent(updatedContent)
      if (data.data) {
        setDocumentInfo({
          ...documentInfo,
          revisionNo: data.data.revisionNo,
          revisionDate: data.data.revisionDate
        })
      }
      setToast({ type: 'success', message: 'Section updated successfully. Revision number incremented.' })
    } catch (error) {
      console.error('Error saving section:', error)
      setToast({ type: 'error', message: error.message || 'Failed to save changes' })
      throw error
    }
  }

  const handleInputChange = (field, value) => {
    setContent(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAlternationTypeChange = (type, checked) => {
    setContent(prev => ({
      ...prev,
      alternationTypes: {
        ...prev.alternationTypes,
        [type]: checked
      }
    }))
  }

  const handleSaveAll = async () => {
    try {
      const res = await fetch('/api/organization/documents/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentName: 'Chemical Recipe',
          content: content,
          changeDescription: 'Updated Chemical Recipe'
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

      setToast({ type: 'success', message: 'Chemical Recipe saved successfully. Revision number incremented.' })
    } catch (error) {
      console.error('Error saving recipe:', error)
      setToast({ type: 'error', message: 'Failed to save changes. Please try again.' })
    }
  }

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'organization', label: 'Organization', href: '/dashboard/organization' },
    { key: 'documents', label: 'Document Details', href: '/dashboard/organization/documents' },
    { key: 'chemical-recipe', label: 'Chemical Recipe', href: '#' }
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
            <h1 className="text-2xl font-bold text-blue-600 underline flex items-center gap-2">
              ESF LEATHER CONSULTANCY
            </h1>
            <h2 className="text-xl font-bold text-blue-600 underline mt-2">
              Chemical Recipe Change Form
            </h2>
            {documentInfo && (
              <div className="mt-4 flex gap-6 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Doc No:</span> {documentInfo.docNo || 'ESF-RSL-CRC-07'}
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

          {/* Description Of Change Section */}
          <div className="bg-white border border-gray-300 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 text-center mb-4 border-b-2 border-green-600 pb-2">
              Description Of Change
            </h2>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason That the change is necessary:
              </label>
              {isAdmin ? (
                <EditableSection
                  title=""
                  content={content.descriptionOfChange}
                  onSave={handleSaveSection}
                  canEdit={isAdmin}
                  sectionKey="descriptionOfChange"
                  contentType="text"
                />
              ) : (
                <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 min-h-[100px]">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{content.descriptionOfChange || '-'}</p>
                </div>
              )}
            </div>
          </div>

          {/* Alternation Type Section */}
          <div className="bg-white border border-gray-300 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 text-center mb-4 border-b-2 border-green-600 pb-2">
              Alternation Type
            </h2>
            
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={content.alternationTypes.processChange}
                    onChange={(e) => handleAlternationTypeChange('processChange', e.target.checked)}
                    disabled={!isAdmin}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Process Change</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={content.alternationTypes.documented}
                    onChange={(e) => handleAlternationTypeChange('documented', e.target.checked)}
                    disabled={!isAdmin}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Documented</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={content.alternationTypes.informationDyeingChemical}
                    onChange={(e) => handleAlternationTypeChange('informationDyeingChemical', e.target.checked)}
                    disabled={!isAdmin}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Information Dyeing Chemical</span>
                </label>
              </div>
              <div className="space-y-3">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={content.alternationTypes.finishingChemical}
                    onChange={(e) => handleAlternationTypeChange('finishingChemical', e.target.checked)}
                    disabled={!isAdmin}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Finishing Chemical</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={content.alternationTypes.waterBase}
                    onChange={(e) => handleAlternationTypeChange('waterBase', e.target.checked)}
                    disabled={!isAdmin}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">water Base</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={content.alternationTypes.solventBase}
                    onChange={(e) => handleAlternationTypeChange('solventBase', e.target.checked)}
                    disabled={!isAdmin}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Solvent Base</span>
                </label>
              </div>
            </div>
          </div>

          {/* Recommendation and Concurrence Section */}
          <div className="bg-white border border-gray-300 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 text-center mb-4 border-b-2 border-green-600 pb-2">
              Recommendation and Concurrence
            </h2>

            <div className="space-y-4 mt-4">
              {/* Person Recommending Change */}
              <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-4">
                  <label className="text-sm font-medium text-gray-700">Person recommending the change:</label>
                </div>
                <div className="col-span-4">
                  {isAdmin ? (
                    <Input
                      type="text"
                      value={content.personRecommendingChange}
                      onChange={(e) => handleInputChange('personRecommendingChange', e.target.value)}
                      className="w-full"
                      placeholder="Enter name"
                    />
                  ) : (
                    <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                      <span className="text-sm text-gray-700">{content.personRecommendingChange || '-'}</span>
                    </div>
                  )}
                </div>
                <div className="col-span-1">
                  <label className="text-sm font-medium text-gray-700">Date:</label>
                </div>
                <div className="col-span-3">
                  {isAdmin ? (
                    <Input
                      type="text"
                      value={content.personRecommendingDate}
                      onChange={(e) => handleInputChange('personRecommendingDate', e.target.value)}
                      className="w-full"
                      placeholder="DD/MM/YYYY"
                    />
                  ) : (
                    <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                      <span className="text-sm text-gray-700">{content.personRecommendingDate || '-'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Supervisor's Concurrence */}
              <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-4">
                  <label className="text-sm font-medium text-gray-700">Supervisor's concurrence that the change is necessary:</label>
                </div>
                <div className="col-span-4">
                  {isAdmin ? (
                    <Input
                      type="text"
                      value={content.supervisorConcurrence}
                      onChange={(e) => handleInputChange('supervisorConcurrence', e.target.value)}
                      className="w-full"
                      placeholder="Enter name"
                    />
                  ) : (
                    <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                      <span className="text-sm text-gray-700">{content.supervisorConcurrence || '-'}</span>
                    </div>
                  )}
                </div>
                <div className="col-span-1">
                  <label className="text-sm font-medium text-gray-700">Date:</label>
                </div>
                <div className="col-span-3">
                  {isAdmin ? (
                    <Input
                      type="text"
                      value={content.supervisorConcurrenceDate}
                      onChange={(e) => handleInputChange('supervisorConcurrenceDate', e.target.value)}
                      className="w-full"
                      placeholder="DD/MM/YYYY"
                    />
                  ) : (
                    <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                      <span className="text-sm text-gray-700">{content.supervisorConcurrenceDate || '-'}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Evaluation Section */}
          <div className="bg-white border border-gray-300 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 text-center mb-4 border-b-2 border-green-600 pb-2">
              Evaluation
            </h2>
            
            <EditableSection
              title=""
              content={content.evaluation}
              onSave={handleSaveSection}
              canEdit={isAdmin}
              sectionKey="evaluation"
              contentType="text"
            />
          </div>

          {/* Approval Section */}
          <div className="bg-white border border-gray-300 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 text-center mb-4 border-b-2 border-green-600 pb-2">
              Approval
            </h2>

            <div className="space-y-4">
              {/* Technician Approval */}
              <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-700">Technician :</label>
                </div>
                <div className="col-span-5">
                  {isAdmin ? (
                    <Input
                      type="text"
                      value={content.technicianName}
                      onChange={(e) => handleInputChange('technicianName', e.target.value)}
                      className="w-full"
                      placeholder="Enter technician name"
                    />
                  ) : (
                    <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                      <span className="text-sm text-gray-700">{content.technicianName || '-'}</span>
                    </div>
                  )}
                </div>
                <div className="col-span-1 border-l-2 border-dashed border-gray-400"></div>
                <div className="col-span-1">
                  <label className="text-sm font-medium text-gray-700">Date :</label>
                </div>
                <div className="col-span-3">
                  {isAdmin ? (
                    <Input
                      type="text"
                      value={content.technicianDate}
                      onChange={(e) => handleInputChange('technicianDate', e.target.value)}
                      className="w-full"
                      placeholder="DD/MM/YYYY"
                    />
                  ) : (
                    <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                      <span className="text-sm text-gray-700">{content.technicianDate || '-'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Director Approval */}
              <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-700">Director :</label>
                </div>
                <div className="col-span-5">
                  {isAdmin ? (
                    <Input
                      type="text"
                      value={content.directorName}
                      onChange={(e) => handleInputChange('directorName', e.target.value)}
                      className="w-full"
                      placeholder="Enter director name"
                    />
                  ) : (
                    <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                      <span className="text-sm text-gray-700">{content.directorName || '-'}</span>
                    </div>
                  )}
                </div>
                <div className="col-span-1 border-l-2 border-dashed border-gray-400"></div>
                <div className="col-span-1">
                  <label className="text-sm font-medium text-gray-700">Date :</label>
                </div>
                <div className="col-span-3">
                  {isAdmin ? (
                    <Input
                      type="text"
                      value={content.directorDate}
                      onChange={(e) => handleInputChange('directorDate', e.target.value)}
                      className="w-full"
                      placeholder="DD/MM/YYYY"
                    />
                  ) : (
                    <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                      <span className="text-sm text-gray-700">{content.directorDate || '-'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Authorization Note */}
              <div className="mt-6 pt-4 border-t border-gray-300">
                <p className="text-sm text-gray-600 italic">
                  The signed Change Form is the necessary authorization to perform the change as recommended and/or modified during evaluation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


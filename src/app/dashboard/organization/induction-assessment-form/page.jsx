'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Toast } from '@/components/ui/Toast'
import { Input } from '@/components/ui/Input'

export default function InductionAssessmentFormPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [documentInfo, setDocumentInfo] = useState(null)

  const isAdmin = session?.user?.role === 'SUPER_ADMIN' || session?.user?.role === 'ADMIN' || session?.user?.role === 'super_admin' || session?.user?.role === 'admin'

  // Initialize content structure with all sections from images
  const initializeContent = () => {
    return {
      companyName: 'ESF LEATHER CONSULTANCY',
      formTitle: 'INDUCTION ASSESSMENT FORM',
      formSubtitle: 'FOR NEW EMPLOYEES',
      documentId: 'ESF-HS-IAF-01',
      
      // Section Header
      sectionHeader: 'General information about the company for employees.',
      
      // Questions with English and Tamil
      questions: [
        {
          id: 1,
          english: 'How many emergency exits are there in the company?',
          tamil: 'நமது நிறுவனத்தில்அவசரகால வெளியேற்றங்கள்எத்தனைஉள்ளன?',
          answer: ''
        },
        {
          id: 2,
          english: 'Who is the key person to be contacted during emergency?',
          tamil: 'அவசரகாலத்தில்கூப்பிடவேண்டியமுக்கியநபர்கள்யாவர்?',
          answer: ''
        },
        {
          id: 3,
          english: 'When alarm rings, what will you do? Explain',
          tamil: 'அலாரம்ஒலிக்கும்போதுஎன்னசெய்யவேண்டும்? விளக்கவும்,',
          answer: ''
        },
        {
          id: 4,
          english: 'Did you get your copy of emergency manual? Show what are all evacuation exits and emission points at the company?',
          tamil: 'உங்களக்கானஅவசரகாலகையேடுகுடுக்கப்பட்டதா? எத்தனைஉள்ளது? எங்கெங்கேஉள்ளது?',
          answer: ''
        },
        {
          id: 5,
          english: 'What are spill kits? How many are there in our company? Do you know how to use?',
          tamil: 'இரசாயணசிதறல்பெட்டிஎன்றால்என்ன? எத்தனைஉள்ளது? எங்கெங்கேஉள்ளது?',
          answer: ''
        },
        {
          id: 6,
          english: 'Are you aware about Traffic Management Procedure of our Company kindly explain?',
          tamil: 'நமது நிறுவனத்தில் போக்குவரத்து வழிமுறைகள் பற்றிய விழிப்புணர்வு உள்ளதா?',
          answer: ''
        }
      ],

      // Induction Fields
      dateOfInduction: '',
      safetyInductionConductedBy: '',

      // Acknowledgment
      acknowledgment: 'I acknowledge the Safety requirements for ESF and that failure to comply may result in disciplinary or review of contract',

      // Signature Fields
      employeeName: '',
      employeeSignature: '',
      employeeDate: ''
    }
  }

  const [content, setContent] = useState(initializeContent())

  useEffect(() => {
    fetchDocumentContent()
  }, [])

  const fetchDocumentContent = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/organization/documents/content?documentName=Induction Assessment Form')
      const data = await res.json()
      
      if (res.ok) {
        if (data.data?.content) {
          const loadedData = data.data.content.content || content
          // Ensure structure exists
          if (!loadedData.questions) {
            loadedData.questions = initializeContent().questions
          }
          setContent(loadedData)
          setDocumentInfo({
            docNo: data.data.document.docNo || 'ESF-HS-IAF-01',
            revDate: data.data.document.revDate || '',
            revisionNo: data.data.content.revisionNo,
            revisionDate: data.data.content.revisionDate
          })
        } else {
          setDocumentInfo({
            docNo: 'ESF-HS-IAF-01',
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

  const handleQuestionChange = (questionId, field, value) => {
    setContent(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId ? { ...q, [field]: value } : q
      )
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
          documentName: 'Induction Assessment Form',
          content: content,
          changeDescription: 'Updated Induction Assessment Form'
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

      setToast({ type: 'success', message: 'Induction Assessment Form saved successfully. Revision number incremented.' })
    } catch (error) {
      console.error('Error saving record:', error)
      setToast({ type: 'error', message: 'Failed to save changes. Please try again.' })
    }
  }

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'organization', label: 'Organization', href: '/dashboard/organization' },
    { key: 'documents', label: 'Document Details', href: '/dashboard/organization/documents' },
    { key: 'induction-assessment-form', label: 'Induction Assessment Form', href: '#' }
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
            <h1 className="text-2xl font-bold text-gray-900 text-center">
              {isAdmin ? (
                <Input
                  type="text"
                  value={content.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  className="inline-block w-64 text-center"
                />
              ) : (
                content.companyName
              )}
            </h1>
            <h2 className="text-xl font-bold text-gray-900 text-center uppercase mt-2">
              {isAdmin ? (
                <Input
                  type="text"
                  value={content.formTitle}
                  onChange={(e) => handleInputChange('formTitle', e.target.value)}
                  className="inline-block w-80 text-center"
                />
              ) : (
                content.formTitle
              )}
            </h2>
            <h3 className="text-lg font-semibold text-gray-800 text-center mt-1">
              {isAdmin ? (
                <Input
                  type="text"
                  value={content.formSubtitle}
                  onChange={(e) => handleInputChange('formSubtitle', e.target.value)}
                  className="inline-block w-64 text-center"
                />
              ) : (
                content.formSubtitle
              )}
            </h3>
            <div className="mt-2 flex gap-6 text-sm text-gray-600 justify-center flex-wrap">
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
              {documentInfo && documentInfo.revisionNo && (
                <div>
                  <span className="font-medium">Revision:</span> {documentInfo.revisionNo} ({new Date(documentInfo.revisionDate).toLocaleDateString()})
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {isAdmin && (
              <Button
                onClick={handleSaveAll}
                className="px-6"
              >
                Save All Changes
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/organization/documents')}
            >
              Back to Documents
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Section Header */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {isAdmin ? (
                <Input
                  type="text"
                  value={content.sectionHeader}
                  onChange={(e) => handleInputChange('sectionHeader', e.target.value)}
                  className="w-full"
                />
              ) : (
                content.sectionHeader
              )}
            </h3>
          </div>

          {/* Questions Section */}
          <div className="space-y-6">
            {content.questions?.map((question, index) => (
              <div key={question.id} className="border border-gray-300 rounded-md p-4 space-y-3">
                <div className="font-semibold text-gray-900">
                  {index + 1}. {question.english}
                </div>
                <div className="text-sm text-gray-600 italic">
                  {question.tamil}
                </div>
                {isAdmin ? (
                  <div className="space-y-2 mt-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">English Question:</label>
                      <Input
                        type="text"
                        value={question.english}
                        onChange={(e) => handleQuestionChange(question.id, 'english', e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tamil Question:</label>
                      <Input
                        type="text"
                        value={question.tamil}
                        onChange={(e) => handleQuestionChange(question.id, 'tamil', e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Answer:</label>
                      <textarea
                        value={question.answer}
                        onChange={(e) => handleQuestionChange(question.id, 'answer', e.target.value)}
                        rows={4}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        placeholder="Enter answer here..."
                      />
                    </div>
                  </div>
                ) : (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Answer:</label>
                    <textarea
                      value={question.answer}
                      onChange={(e) => handleQuestionChange(question.id, 'answer', e.target.value)}
                      rows={4}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder="Enter answer here..."
                      readOnly={!isAdmin}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Induction Fields */}
          <div className="space-y-4 border-t pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Induction:</label>
                {isAdmin ? (
                  <Input
                    type="text"
                    value={content.dateOfInduction}
                    onChange={(e) => handleInputChange('dateOfInduction', e.target.value)}
                    className="w-full"
                    placeholder="Enter date"
                  />
                ) : (
                  <div className="text-sm text-gray-900 border-b-2 border-dotted border-gray-400 pb-1 min-h-[24px]">
                    {content.dateOfInduction || '....................................................'}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Safety Induction conducted by:</label>
                {isAdmin ? (
                  <Input
                    type="text"
                    value={content.safetyInductionConductedBy}
                    onChange={(e) => handleInputChange('safetyInductionConductedBy', e.target.value)}
                    className="w-full"
                    placeholder="Enter name"
                  />
                ) : (
                  <div className="text-sm text-gray-900 border-b-2 border-dotted border-gray-400 pb-1 min-h-[24px]">
                    {content.safetyInductionConductedBy || '....................................................'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Acknowledgment Section */}
          <div className="space-y-4 border-t pt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Acknowledgment:</label>
              {isAdmin ? (
                <textarea
                  value={content.acknowledgment}
                  onChange={(e) => handleInputChange('acknowledgment', e.target.value)}
                  rows={2}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              ) : (
                <div className="text-sm text-gray-900 border-b-2 border-dotted border-gray-400 pb-1 min-h-[48px]">
                  {content.acknowledgment}
                </div>
              )}
            </div>
          </div>

          {/* Signature Section */}
          <div className="space-y-4 border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900">Employee Signature</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name:</label>
                {isAdmin ? (
                  <Input
                    type="text"
                    value={content.employeeName}
                    onChange={(e) => handleInputChange('employeeName', e.target.value)}
                    className="w-full"
                    placeholder="Enter name"
                  />
                ) : (
                  <div className="text-sm text-gray-900 border-b-2 border-dotted border-gray-400 pb-1 min-h-[24px]">
                    {content.employeeName || '....................................................'}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Signature:</label>
                {isAdmin ? (
                  <Input
                    type="text"
                    value={content.employeeSignature}
                    onChange={(e) => handleInputChange('employeeSignature', e.target.value)}
                    className="w-full"
                    placeholder="Enter signature"
                  />
                ) : (
                  <div className="text-sm text-gray-900 border-b-2 border-dotted border-gray-400 pb-1 min-h-[24px]">
                    {content.employeeSignature || '....................................................'}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date:</label>
                {isAdmin ? (
                  <Input
                    type="text"
                    value={content.employeeDate}
                    onChange={(e) => handleInputChange('employeeDate', e.target.value)}
                    className="w-full"
                    placeholder="Enter date"
                  />
                ) : (
                  <div className="text-sm text-gray-900 border-b-2 border-dotted border-gray-400 pb-1 min-h-[24px]">
                    {content.employeeDate || '....................................................'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-600 mt-6">
            Prepared by ESF Leather Consultancy.
          </div>
        </div>
      </div>
    </div>
  )
}


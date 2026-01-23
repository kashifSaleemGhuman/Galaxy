'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Toast } from '@/components/ui/Toast'
import { Input } from '@/components/ui/Input'

export default function PersonnelProtectiveEquipmentsCrustPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [documentInfo, setDocumentInfo] = useState(null)

  const isAdmin = session?.user?.role === 'SUPER_ADMIN' || session?.user?.role === 'ADMIN' || session?.user?.role === 'super_admin' || session?.user?.role === 'admin'

  // PPE Types based on the image
  const ppeTypes = [
    { key: 'apron', label: 'APRON', code: '5915:1970, 4501:1981' },
    { key: 'mask', label: 'MASK', code: '16289:2014' },
    { key: 'handGloves', label: 'HAND GLOVES', code: '2573:1986, 6994:1973, 4770:1991, 4501:1981' },
    { key: 'safetyHelmet', label: 'SAFETY HELMET', code: '2925:1984' },
    { key: 'earProtection', label: 'EAR PROTECTION', code: '9167:1979, 6229:1980' },
    { key: 'respiratorOrMask', label: 'RESPIRATOR OR MASK', code: '8522:1977' },
    { key: 'goggle', label: 'GOGGLE', code: '5980:1984, 7524:1980' },
    { key: 'safetyBoots', label: 'SAFETY BOOTS', code: '1989:1986' },
    { key: 'h2sPortable', label: 'H2S PORTABLE', code: '' },
    { key: 'electricalGloves', label: 'ELECTRICAL GLOVES', code: '4770:1991' },
    { key: 'gumBoots', label: 'GUM BOOTS', code: '3738:1998' }
  ]

  // Initialize content structure with sample data from images
  const initializeContent = () => {
    return {
      preparedBy: 'ESF LEATHER CONSULTANCY',
      contactInfo: 'esfleather@gmail.com, +91 98408 20288',
      documentId: 'ESF-HS-PPE-03',
      date: '20/01/2023',
      sections: [
        {
          id: 1,
          serialNo: 1,
          sectionName: 'CRUST SECTION',
          ppe: {
            apron: true,
            mask: true,
            handGloves: true,
            safetyHelmet: false,
            earProtection: false,
            respiratorOrMask: false,
            goggle: false,
            safetyBoots: true,
            h2sPortable: false,
            electricalGloves: false,
            gumBoots: true
          }
        },
        {
          id: 2,
          serialNo: 2,
          sectionName: 'FINISHING CHEMICAL STORE',
          ppe: {
            apron: true,
            mask: true,
            handGloves: true,
            safetyHelmet: false,
            earProtection: false,
            respiratorOrMask: true,
            goggle: true,
            safetyBoots: true,
            h2sPortable: false,
            electricalGloves: false,
            gumBoots: true
          }
        },
        {
          id: 3,
          serialNo: 3,
          sectionName: 'AUTOSPRAY',
          ppe: {
            apron: true,
            mask: true,
            handGloves: true,
            safetyHelmet: false,
            earProtection: true,
            respiratorOrMask: true,
            goggle: true,
            safetyBoots: true,
            h2sPortable: false,
            electricalGloves: false,
            gumBoots: false
          }
        },
        {
          id: 4,
          serialNo: 4,
          sectionName: 'DRY DRUM',
          ppe: {
            apron: true,
            mask: true,
            handGloves: true,
            safetyHelmet: false,
            earProtection: true,
            respiratorOrMask: true,
            goggle: true,
            safetyBoots: true,
            h2sPortable: false,
            electricalGloves: false,
            gumBoots: false
          }
        },
        {
          id: 5,
          serialNo: 5,
          sectionName: 'PLATING',
          ppe: {
            apron: true,
            mask: true,
            handGloves: true,
            safetyHelmet: false,
            earProtection: true,
            respiratorOrMask: true,
            goggle: true,
            safetyBoots: true,
            h2sPortable: false,
            electricalGloves: false,
            gumBoots: false
          }
        },
        {
          id: 6,
          serialNo: 6,
          sectionName: 'MEASURING',
          ppe: {
            apron: true,
            mask: true,
            handGloves: true,
            safetyHelmet: false,
            earProtection: false,
            respiratorOrMask: false,
            goggle: false,
            safetyBoots: true,
            h2sPortable: false,
            electricalGloves: false,
            gumBoots: false
          }
        },
        {
          id: 7,
          serialNo: 7,
          sectionName: 'ETP COLLECTION TANK',
          ppe: {
            apron: true,
            mask: true,
            handGloves: true,
            safetyHelmet: true,
            earProtection: false,
            respiratorOrMask: true,
            goggle: true,
            safetyBoots: true,
            h2sPortable: true,
            electricalGloves: false,
            gumBoots: true
          }
        },
        {
          id: 8,
          serialNo: 8,
          sectionName: 'WASTE HANDLING',
          ppe: {
            apron: true,
            mask: true,
            handGloves: true,
            safetyHelmet: true,
            earProtection: false,
            respiratorOrMask: true,
            goggle: true,
            safetyBoots: true,
            h2sPortable: false,
            electricalGloves: false,
            gumBoots: true
          }
        },
        {
          id: 9,
          serialNo: 9,
          sectionName: 'SLUDGE HANDLING',
          ppe: {
            apron: true,
            mask: true,
            handGloves: true,
            safetyHelmet: true,
            earProtection: false,
            respiratorOrMask: true,
            goggle: true,
            safetyBoots: true,
            h2sPortable: false,
            electricalGloves: false,
            gumBoots: true
          }
        },
        {
          id: 10,
          serialNo: 10,
          sectionName: 'OFFICE',
          ppe: {
            apron: false,
            mask: true,
            handGloves: false,
            safetyHelmet: false,
            earProtection: false,
            respiratorOrMask: false,
            goggle: false,
            safetyBoots: false,
            h2sPortable: false,
            electricalGloves: false,
            gumBoots: false
          }
        },
        {
          id: 11,
          serialNo: 11,
          sectionName: 'EB ROOM/EB PANELS',
          ppe: {
            apron: false,
            mask: false,
            handGloves: false,
            safetyHelmet: false,
            earProtection: false,
            respiratorOrMask: false,
            goggle: false,
            safetyBoots: true,
            h2sPortable: false,
            electricalGloves: true,
            gumBoots: false
          }
        }
      ]
    }
  }

  const [content, setContent] = useState(initializeContent())

  useEffect(() => {
    fetchDocumentContent()
  }, [])

  const fetchDocumentContent = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/organization/documents/content?documentName=Personnel Protective Equipments -CRUST')
      const data = await res.json()
      
      if (res.ok) {
        if (data.data?.content) {
          const loadedData = data.data.content.content || content
          // Ensure structure exists
          if (!loadedData.sections) {
            loadedData.sections = initializeContent().sections
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

  const handleSectionChange = (sectionId, field, value) => {
    setContent(prev => ({
      ...prev,
      sections: prev.sections.map(section => {
        if (section.id === sectionId) {
          if (field === 'sectionName') {
            return { ...section, sectionName: value }
          } else if (field.startsWith('ppe.')) {
            const ppeKey = field.replace('ppe.', '')
            return {
              ...section,
              ppe: {
                ...section.ppe,
                [ppeKey]: value
              }
            }
          }
          return { ...section, [field]: value }
        }
        return section
      })
    }))
  }

  const handleAddSection = () => {
    const newSection = {
      id: Date.now(),
      serialNo: content.sections.length + 1,
      sectionName: '',
      ppe: {
        apron: false,
        mask: false,
        handGloves: false,
        safetyHelmet: false,
        earProtection: false,
        respiratorOrMask: false,
        goggle: false,
        safetyBoots: false,
        h2sPortable: false,
        electricalGloves: false,
        gumBoots: false
      }
    }
    setContent(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }))
  }

  const handleDeleteSection = (sectionId) => {
    if (content.sections.length <= 1) {
      alert('At least one section is required')
      return
    }
    const updatedSections = content.sections.filter(s => s.id !== sectionId)
    // Re-number serial numbers
    updatedSections.forEach((s, index) => {
      s.serialNo = index + 1
    })
    setContent(prev => ({
      ...prev,
      sections: updatedSections
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
          documentName: 'Personnel Protective Equipments -CRUST',
          content: content,
          changeDescription: 'Updated Personnel Protective Equipments -CRUST'
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

      setToast({ type: 'success', message: 'Personnel Protective Equipments -CRUST saved successfully. Revision number incremented.' })
    } catch (error) {
      console.error('Error saving record:', error)
      setToast({ type: 'error', message: 'Failed to save changes. Please try again.' })
    }
  }

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'organization', label: 'Organization', href: '/dashboard/organization' },
    { key: 'documents', label: 'Document Details', href: '/dashboard/organization/documents' },
    { key: 'ppe-crust', label: 'Personnel Protective Equipments -CRUST', href: '#' }
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
              Personnel Protective Equipments -CRUST
            </h2>
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
                onClick={handleAddSection}
                className="px-4"
              >
                + Add Section
              </Button>
              <Button
                onClick={handleSaveAll}
                className="px-6"
              >
                Save All Changes
              </Button>
            </div>
          )}

          {/* PPE Table */}
          <div className="relative w-full">
            <div className="w-full overflow-x-auto overflow-y-visible scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200" style={{ maxWidth: '100%', scrollbarWidth: 'thin' }}>
              <div className="border border-gray-300 rounded-md inline-block min-w-full">
                <table className="min-w-full" style={{ minWidth: 'max-content', tableLayout: 'auto' }}>
                  <thead>
                    <tr className="bg-gray-100">
                      <th rowSpan={2} className="border border-gray-300 px-3 py-2 text-center text-xs font-semibold text-gray-700 sticky left-0 bg-gray-100 z-10 min-w-[60px]">
                        S.No
                      </th>
                      <th rowSpan={2} className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700 sticky left-[60px] bg-gray-100 z-10 min-w-[200px]">
                        SECTION
                      </th>
                      {ppeTypes.map((ppe, index) => (
                        <th key={ppe.key} rowSpan={2} className="border border-gray-300 px-2 py-2 text-center text-xs font-semibold text-gray-700 min-w-[120px]">
                          <div className="flex flex-col items-center">
                            <span className="font-semibold mb-1">{ppe.label}</span>
                            {ppe.code && (
                              <span className="text-[10px] text-gray-500 mt-1">
                                IS CODE: {ppe.code}
                              </span>
                            )}
                          </div>
                        </th>
                      ))}
                      {isAdmin && (
                        <th rowSpan={2} className="border border-gray-300 px-3 py-2 text-center text-xs font-semibold text-gray-700 min-w-[100px]">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {content.sections?.map((section, index) => (
                      <tr key={section.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-3 py-2 text-sm text-center text-gray-700 bg-gray-50 sticky left-0 z-10 min-w-[60px]">
                          {isAdmin ? (
                            <Input
                              type="number"
                              value={section.serialNo}
                              onChange={(e) => handleSectionChange(section.id, 'serialNo', parseInt(e.target.value) || 0)}
                              className="w-full text-sm text-center"
                            />
                          ) : (
                            <span>{section.serialNo}</span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-2 text-sm text-gray-700 bg-gray-50 sticky left-[60px] z-10 min-w-[200px]">
                          {isAdmin ? (
                            <Input
                              type="text"
                              value={section.sectionName}
                              onChange={(e) => handleSectionChange(section.id, 'sectionName', e.target.value)}
                              className="w-full text-sm"
                              placeholder="Section Name"
                            />
                          ) : (
                            <span>{section.sectionName || '-'}</span>
                          )}
                        </td>
                        {ppeTypes.map((ppe) => (
                          <td key={ppe.key} className="border border-gray-300 px-2 py-2 text-center min-w-[120px]">
                            {isAdmin ? (
                              <input
                                type="checkbox"
                                checked={section.ppe[ppe.key] || false}
                                onChange={(e) => handleSectionChange(section.id, `ppe.${ppe.key}`, e.target.checked)}
                                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                            ) : (
                              <span className="text-lg">{section.ppe[ppe.key] ? '✓' : ''}</span>
                            )}
                          </td>
                        ))}
                        {isAdmin && (
                          <td className="border border-gray-300 px-2 py-2 text-center min-w-[100px]">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteSection(section.id)}
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
            {content.sections && content.sections.length > 0 && (
              <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white px-2 py-1 rounded shadow-sm">
                Scroll horizontally to see all columns →
              </div>
            )}
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


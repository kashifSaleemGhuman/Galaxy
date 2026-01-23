'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Toast } from '@/components/ui/Toast'
import { Input } from '@/components/ui/Input'

export default function PPERegisterPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [documentInfo, setDocumentInfo] = useState(null)

  const isAdmin = session?.user?.role === 'SUPER_ADMIN' || session?.user?.role === 'ADMIN' || session?.user?.role === 'super_admin' || session?.user?.role === 'admin'

  // Department structure based on images
  const departments = [
    {
      name: 'RAW SECTION',
      ppeItems: ['APRON', 'MASK', 'HAND GLOVES', 'GUM BOOTS']
    },
    {
      name: 'WETBLUE SECTION',
      ppeItems: ['APRON', 'MASK', 'HAND GLOVES', 'SAFETY BOOTS']
    },
    {
      name: 'SHAVING SECTION',
      ppeItems: ['MASK', 'GOGGLES', 'HAND GLOVES', 'SAFETY BOOTS', 'EAR PLUGS']
    },
    {
      name: 'DRUM SECTION',
      ppeItems: ['APRON', 'MASK', 'HAND GLOVES', 'EAR PLUG', 'GUM BOOTS']
    },
    {
      name: 'CHEMICAL STORE',
      ppeItems: ['APRON', 'HAND GLOVES', 'RESPIRATORY MASK', 'SAFETY BOOTS', 'GOGGLE']
    },
    {
      name: 'BUFFING SECTION',
      ppeItems: ['APRON', 'RESPIRATORY MASK', 'SAFETY BOOTS', 'HAND GLOVES', 'GOGGLE']
    },
    {
      name: 'FINISHING DEPARTMENT',
      ppeItems: ['APRON', 'MASK', 'HAND GLOVES', 'SAFETY BOOTS', 'EAR PLUG']
    },
    {
      name: 'EFFLUENT TREATMENT',
      ppeItems: ['APRON', 'MASK', 'RESPIRATORY MASK', 'HAND GLOVES', 'EAR PLUG']
    }
  ]

  // Total sections for summary
  const totalSections = [
    {
      name: 'TOTAL OPENING STOCK',
      ppeItems: ['APRON', 'MASK', 'RESPIRATORY MASK', 'EAR PLUG', 'HAND GLOVES', 'ELECTRICAL GLOVES', 'SAFETY BOOTS', 'GUM BOOTS', 'H2S PORTABLE', 'GOGGLES', 'SAFETY HELMET', 'FACE SHIELD', 'WELDING GOGGLES', 'GRINDING GOGGLES']
    },
    {
      name: 'TOTAL ISSUED',
      ppeItems: ['APRON', 'MASK', 'RESPIRATORY MASK', 'EAR PLUG', 'HAND GLOVES', 'ELECTRICAL GLOVES', 'SAFETY BOOTS', 'GUM BOOTS', 'H2S PORTABLE', 'GOGGLES', 'SAFETY HELMET', 'FACE SHIELD', 'WELDING GOGGLES', 'GRINDING GOGGLES']
    },
    {
      name: 'TOTAL PURCHASE',
      ppeItems: ['APRON', 'MASK', 'RESPIRATORY MASK', 'EAR PLUG', 'HAND GLOVES', 'ELECTRICAL GLOVES', 'SAFETY BOOTS', 'GUM BOOTS', 'H2S PORTABLE', 'GOGGLES', 'SAFETY HELMET', 'FACE SHIELD', 'WELDING GOGGLES', 'GRINDING GOGGLES']
    },
    {
      name: 'TOTAL CLOSING STOCK',
      ppeItems: ['APRON', 'MASK', 'RESPIRATORY MASK', 'EAR PLUG', 'HAND GLOVES', 'ELECTRICAL GLOVES', 'SAFETY BOOTS', 'GUM BOOTS', 'H2S PORTABLE', 'GOGGLES', 'SAFETY HELMET', 'FACE SHIELD', 'WELDING GOGGLES', 'GRINDING GOGGLES']
    }
  ]

  // Initialize content structure with sample data from images
  const initializeContent = () => {
    const entries = [
      { id: 1, date: '1/1/2022', description: '' },
      { id: 2, date: '1/2/2022', description: '' },
      { id: 3, date: '1/3/2022', description: '' },
      { id: 4, date: '1/4/2022', description: '' },
      { id: 5, date: '1/5/2022', description: '' },
      { id: 6, date: '1/6/2022', description: '' },
      { id: 7, date: '1/7/2022', description: '' },
      { id: 8, date: '1/8/2022', description: '' },
      { id: 9, date: '1/9/2022', description: '' },
      { id: 10, date: '1/10/2022', description: '' },
      { id: 11, date: '1/11/2022', description: '' }
    ]

    // Initialize data structure for each entry
    const entryData = {}
    entries.forEach(entry => {
      entryData[entry.id] = {
        date: entry.date,
        description: entry.description,
        departments: {},
        totals: {
          totalopeningstock: {},
          totalissued: {},
          totalpurchase: {},
          totalclosingstock: {}
        }
      }

      // Initialize department data
      departments.forEach(dept => {
        entryData[entry.id].departments[dept.name] = {}
        dept.ppeItems.forEach(item => {
          entryData[entry.id].departments[dept.name][item] = ''
        })
      })

      // Initialize total sections with correct keys
      totalSections.forEach(section => {
        const sectionKey = section.name.toLowerCase().replace(/\s+/g, '')
        // Initialize the section object if it doesn't exist
        if (!entryData[entry.id].totals[sectionKey]) {
          entryData[entry.id].totals[sectionKey] = {}
        }
        section.ppeItems.forEach(item => {
          entryData[entry.id].totals[sectionKey][item] = ''
        })
      })
    })

    // Add sample data for first entry (1/1/2022)
    entryData[1].departments['WETBLUE SECTION']['SAFETY BOOTS'] = '3'
    entryData[1].departments['SHAVING SECTION']['GOGGLES'] = '2'
    entryData[1].departments['SHAVING SECTION']['SAFETY BOOTS'] = '2'
    entryData[1].departments['SHAVING SECTION']['EAR PLUGS'] = '4'
    entryData[1].departments['DRUM SECTION']['EAR PLUG'] = '4'
    entryData[1].departments['DRUM SECTION']['GUM BOOTS'] = '4'
    entryData[1].departments['CHEMICAL STORE']['RESPIRATORY MASK'] = '2'
    entryData[1].departments['CHEMICAL STORE']['SAFETY BOOTS'] = '2'
    entryData[1].departments['CHEMICAL STORE']['GOGGLE'] = '2'
    entryData[1].departments['EFFLUENT TREATMENT']['APRON'] = '3'
    entryData[1].departments['EFFLUENT TREATMENT']['RESPIRATORY MASK'] = '3'

    // Add sample totals for first entry
    entryData[1].totals.totalopeningstock = {
      'GOGGLE': '3',
      'APRON': '50',
      'MASK': '100',
      'RESPIRATORY MASK': '75',
      'EAR PLUG': '50',
      'HAND GLOVES': '50',
      'ELECTRICAL GLOVES': '10',
      'SAFETY BOOTS': '20',
      'GUM BOOTS': '20',
      'H2S PORTABLE': '0',
      'GOGGLES': '50',
      'SAFETY HELMET': '10',
      'FACE SHIELD': '15',
      'WELDING GOGGLES': '20',
      'GRINDING GOGGLES': '20'
    }
    entryData[1].totals.totalissued = {
      'APRON': '17',
      'MASK': '65',
      'RESPIRATORY MASK': '5',
      'EAR PLUG': '17',
      'HAND GLOVES': '61',
      'ELECTRICAL GLOVES': '2',
      'SAFETY BOOTS': '19',
      'GUM BOOTS': '8',
      'H2S PORTABLE': '2',
      'GOGGLES': '10',
      'SAFETY HELMET': '4',
      'FACE SHIELD': '3',
      'WELDING GOGGLES': '2',
      'GRINDING GOGGLES': '2'
    }
    entryData[1].totals.totalpurchase = {
      'APRON': '10',
      'MASK': '250',
      'RESPIRATORY MASK': '30',
      'EAR PLUG': '30',
      'HAND GLOVES': '200',
      'ELECTRICAL GLOVES': '5',
      'SAFETY BOOTS': '20',
      'GUM BOOTS': '20',
      'H2S PORTABLE': '5',
      'GOGGLES': '10',
      'SAFETY HELMET': '5',
      'FACE SHIELD': '5',
      'WELDING GOGGLES': '10',
      'GRINDING GOGGLES': '10'
    }
    entryData[1].totals.totalclosingstock = {
      'APRON': '43',
      'MASK': '285',
      'RESPIRATORY MASK': '100',
      'EAR PLUG': '63',
      'HAND GLOVES': '189',
      'ELECTRICAL GLOVES': '13',
      'SAFETY BOOTS': '21',
      'GUM BOOTS': '32',
      'H2S PORTABLE': '3',
      'GOGGLES': '50',
      'SAFETY HELMET': '11',
      'FACE SHIELD': '17',
      'WELDING GOGGLES': '28',
      'GRINDING GOGGLES': '28'
    }

    return {
      companyName: 'ESF LEATHER CONSULTANCY',
      location: 'VANIYAMBADI',
      documentId: 'ESF-HS-REG-04',
      entries: entries,
      entryData: entryData
    }
  }

  const [content, setContent] = useState(initializeContent())

  useEffect(() => {
    fetchDocumentContent()
  }, [])

  const fetchDocumentContent = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/organization/documents/content?documentName=PPE REGISTER')
      const data = await res.json()
      
      if (res.ok) {
        if (data.data?.content) {
          const loadedData = data.data.content.content || content
          // Ensure structure exists
          if (!loadedData.entries || !loadedData.entryData) {
            const initialized = initializeContent()
            loadedData.entries = initialized.entries
            loadedData.entryData = initialized.entryData
          }
          setContent(loadedData)
          setDocumentInfo({
            docNo: data.data.document.docNo || 'ESF-HS-REG-04',
            revDate: data.data.document.revDate || '',
            revisionNo: data.data.content.revisionNo,
            revisionDate: data.data.content.revisionDate
          })
        } else {
          setDocumentInfo({
            docNo: 'ESF-HS-REG-04',
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

  // Calculate closing stock (Opening Stock + Purchase - Issued)
  const calculateClosingStock = (entryId, ppeItem) => {
    const entry = content.entryData[entryId]
    if (!entry || !entry.totals) return ''

    const opening = parseFloat(entry.totals.totalopeningstock?.[ppeItem] || 0)
    const purchase = parseFloat(entry.totals.totalpurchase?.[ppeItem] || 0)
    const issued = parseFloat(entry.totals.totalissued?.[ppeItem] || 0)

    const closing = opening + purchase - issued
    return isNaN(closing) ? '' : Math.max(0, closing).toString()
  }

  const handleEntryChange = (entryId, field, value) => {
    setContent(prev => ({
      ...prev,
      entryData: {
        ...prev.entryData,
        [entryId]: {
          ...prev.entryData[entryId],
          [field]: value
        }
      }
    }))
  }

  const handleDepartmentValueChange = (entryId, departmentName, ppeItem, value) => {
    setContent(prev => ({
      ...prev,
      entryData: {
        ...prev.entryData,
        [entryId]: {
          ...prev.entryData[entryId],
          departments: {
            ...prev.entryData[entryId].departments,
            [departmentName]: {
              ...prev.entryData[entryId].departments[departmentName],
              [ppeItem]: value
            }
          }
        }
      }
    }))
  }

  const handleTotalValueChange = (entryId, sectionName, ppeItem, value) => {
    setContent(prev => {
      const updated = {
        ...prev,
        entryData: {
          ...prev.entryData,
          [entryId]: {
            ...prev.entryData[entryId],
            totals: {
              ...prev.entryData[entryId].totals,
              [sectionName]: {
                ...prev.entryData[entryId].totals[sectionName],
                [ppeItem]: value
              }
            }
          }
        }
      }

      // Auto-calculate closing stock if opening stock, purchase, or issued changed
      if (sectionName === 'totalopeningstock' || sectionName === 'totalpurchase' || sectionName === 'totalissued') {
        const entry = updated.entryData[entryId]
        if (entry && entry.totals) {
          const opening = parseFloat(entry.totals.totalopeningstock?.[ppeItem] || 0)
          const purchase = parseFloat(entry.totals.totalpurchase?.[ppeItem] || 0)
          const issued = parseFloat(entry.totals.totalissued?.[ppeItem] || 0)
          const closing = opening + purchase - issued
          if (!isNaN(closing)) {
            if (!entry.totals.totalclosingstock) {
              entry.totals.totalclosingstock = {}
            }
            entry.totals.totalclosingstock[ppeItem] = Math.max(0, closing).toString()
          }
        }
      }

      return updated
    })
  }

  const handleAddEntry = () => {
    const newEntry = {
      id: Date.now(),
      date: new Date().toLocaleDateString('en-GB'),
      description: ''
    }

    const newEntryData = {
      date: newEntry.date,
      description: '',
      departments: {},
      totals: {
        totalopeningstock: {},
        totalissued: {},
        totalpurchase: {},
        totalclosingstock: {}
      }
    }

    // Initialize department data
    departments.forEach(dept => {
      newEntryData.departments[dept.name] = {}
      dept.ppeItems.forEach(item => {
        newEntryData.departments[dept.name][item] = ''
      })
    })

    // Initialize total sections with correct keys
    totalSections.forEach(section => {
      const sectionKey = section.name.toLowerCase().replace(/\s+/g, '')
      // Initialize the section object if it doesn't exist
      if (!newEntryData.totals[sectionKey]) {
        newEntryData.totals[sectionKey] = {}
      }
      section.ppeItems.forEach(item => {
        newEntryData.totals[sectionKey][item] = ''
      })
    })

    setContent(prev => ({
      ...prev,
      entries: [...prev.entries, newEntry],
      entryData: {
        ...prev.entryData,
        [newEntry.id]: newEntryData
      }
    }))
  }

  const handleDeleteEntry = (entryId) => {
    if (content.entries.length <= 1) {
      alert('At least one entry is required')
      return
    }
    const updatedEntries = content.entries.filter(e => e.id !== entryId)
    const updatedEntryData = { ...content.entryData }
    delete updatedEntryData[entryId]
    setContent(prev => ({
      ...prev,
      entries: updatedEntries,
      entryData: updatedEntryData
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
          documentName: 'PPE REGISTER',
          content: content,
          changeDescription: 'Updated PPE REGISTER'
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

      setToast({ type: 'success', message: 'PPE REGISTER saved successfully. Revision number incremented.' })
    } catch (error) {
      console.error('Error saving record:', error)
      setToast({ type: 'error', message: 'Failed to save changes. Please try again.' })
    }
  }

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'organization', label: 'Organization', href: '/dashboard/organization' },
    { key: 'documents', label: 'Document Details', href: '/dashboard/organization/documents' },
    { key: 'ppe-register', label: 'PPE REGISTER', href: '#' }
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
              {isAdmin ? (
                <Input
                  type="text"
                  value={content.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  className="inline-block w-64"
                />
              ) : (
                content.companyName
              )}
            </h1>
            <div className="mt-2 flex gap-6 text-sm text-gray-600 flex-wrap">
              <div>
                <span className="font-medium">Location:</span>{' '}
                {isAdmin ? (
                  <Input
                    type="text"
                    value={content.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="inline-block w-48 ml-2"
                  />
                ) : (
                  <span className="ml-2">{content.location}</span>
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
              {documentInfo && documentInfo.revisionNo && (
                <div>
                  <span className="font-medium">Revision:</span> {documentInfo.revisionNo} ({new Date(documentInfo.revisionDate).toLocaleDateString()})
                </div>
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-900 uppercase mt-4">
              PPE REGISTER
            </h2>
            {/* Notes Section */}
            <div className="mt-4 text-sm text-gray-600 space-y-1">
              <div><strong>Note:</strong></div>
              <div>1. Opening Stock, Total Issue and Closing Stock is set with formula</div>
              <div>2. Closing Stock with quantity below 5 Nos get highlighted with Red</div>
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
                onClick={handleAddEntry}
                className="px-4"
              >
                + Add Entry
              </Button>
              <Button
                onClick={handleSaveAll}
                className="px-6"
              >
                Save All Changes
              </Button>
            </div>
          )}

          {/* PPE Register Table */}
          <div className="relative w-full">
            <div className="w-full overflow-x-auto overflow-y-visible scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200" style={{ maxWidth: '100%', scrollbarWidth: 'thin' }}>
              <div className="border border-gray-300 rounded-md inline-block min-w-full">
                <table className="min-w-full" style={{ minWidth: 'max-content', tableLayout: 'auto' }}>
                  <thead>
                    <tr className="bg-gray-100">
                      <th rowSpan={2} className="border border-gray-300 px-3 py-2 text-center text-xs font-semibold text-gray-700 sticky left-0 bg-gray-100 z-10 min-w-[120px]">
                        Date / Description
                      </th>
                      {departments.map((dept, deptIndex) => (
                        <th key={deptIndex} colSpan={dept.ppeItems.length} className="border border-gray-300 px-2 py-1 text-center text-xs font-semibold text-gray-700 min-w-[200px]">
                          {dept.name}
                        </th>
                      ))}
                      {totalSections.map((section, sectionIndex) => (
                        <th key={sectionIndex} colSpan={section.ppeItems.length} className="border border-gray-300 px-2 py-1 text-center text-xs font-semibold text-gray-700 min-w-[300px]">
                          {section.name}
                        </th>
                      ))}
                      {isAdmin && (
                        <th rowSpan={2} className="border border-gray-300 px-3 py-2 text-center text-xs font-semibold text-gray-700 min-w-[100px]">
                          Actions
                        </th>
                      )}
                    </tr>
                    <tr className="bg-gray-100">
                      {departments.map((dept) =>
                        dept.ppeItems.map((item, itemIndex) => (
                          <th key={`${dept.name}-${item}`} className="border border-gray-300 px-2 py-1 text-center text-xs font-semibold text-gray-700 min-w-[80px]">
                            {item}
                          </th>
                        ))
                      )}
                      {totalSections.map((section) =>
                        section.ppeItems.map((item, itemIndex) => (
                          <th key={`${section.name}-${item}`} className="border border-gray-300 px-2 py-1 text-center text-xs font-semibold text-gray-700 min-w-[100px]">
                            {item}
                          </th>
                        ))
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {content.entries?.map((entry, entryIndex) => {
                      const entryData = content.entryData[entry.id] || {}
                      return (
                        <tr key={entry.id} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-2 py-2 text-sm text-gray-700 bg-gray-50 sticky left-0 z-10 min-w-[120px]">
                            {isAdmin ? (
                              <div className="space-y-1">
                                <Input
                                  type="text"
                                  value={entryData.date || entry.date}
                                  onChange={(e) => handleEntryChange(entry.id, 'date', e.target.value)}
                                  className="w-full text-sm"
                                  placeholder="Date"
                                />
                                <Input
                                  type="text"
                                  value={entryData.description || ''}
                                  onChange={(e) => handleEntryChange(entry.id, 'description', e.target.value)}
                                  className="w-full text-sm"
                                  placeholder="Description"
                                />
                              </div>
                            ) : (
                              <div>
                                <div className="font-medium">{entryData.date || entry.date}</div>
                                {entryData.description && (
                                  <div className="text-xs text-gray-500">{entryData.description}</div>
                                )}
                              </div>
                            )}
                          </td>
                          {departments.map((dept) =>
                            dept.ppeItems.map((item) => {
                              const value = entryData.departments?.[dept.name]?.[item] || ''
                              return (
                                <td key={`${dept.name}-${item}`} className="border border-gray-300 px-1 py-2 text-center min-w-[80px]">
                                  {isAdmin ? (
                                    <Input
                                      type="number"
                                      value={value}
                                      onChange={(e) => handleDepartmentValueChange(entry.id, dept.name, item, e.target.value)}
                                      className="w-full text-sm text-center"
                                      placeholder="0"
                                    />
                                  ) : (
                                    <span className="text-sm">{value || '-'}</span>
                                  )}
                                </td>
                              )
                            })
                          )}
                          {totalSections.map((section) =>
                            section.ppeItems.map((item) => {
                              const sectionKey = section.name.toLowerCase().replace(/\s+/g, '')
                              const isClosingStock = section.name === 'TOTAL CLOSING STOCK'
                              // For closing stock, calculate it; otherwise use stored value
                              const value = isClosingStock 
                                ? calculateClosingStock(entry.id, item)
                                : (entryData.totals?.[sectionKey]?.[item] || '')
                              const isLowStock = isClosingStock && value !== '' && parseFloat(value) < 5 && parseFloat(value) >= 0
                              
                              return (
                                <td 
                                  key={`${section.name}-${item}`} 
                                  className={`border border-gray-300 px-1 py-2 text-center min-w-[100px] ${isLowStock ? 'bg-red-100 text-red-700 font-semibold' : ''}`}
                                >
                                  {isAdmin ? (
                                    <Input
                                      type="number"
                                      value={value}
                                      onChange={(e) => handleTotalValueChange(entry.id, sectionKey, item, e.target.value)}
                                      className={`w-full text-sm text-center ${isLowStock ? 'bg-red-50' : ''}`}
                                      placeholder="0"
                                      readOnly={isClosingStock} // Closing stock is auto-calculated
                                    />
                                  ) : (
                                    <span className={`text-sm ${isLowStock ? 'font-semibold' : ''}`}>{value || '-'}</span>
                                  )}
                                </td>
                              )
                            })
                          )}
                          {isAdmin && (
                            <td className="border border-gray-300 px-2 py-2 text-center min-w-[100px]">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteEntry(entry.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                Delete
                              </Button>
                            </td>
                          )}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            {content.entries && content.entries.length > 0 && (
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


'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Toast } from '@/components/ui/Toast'
import { Input } from '@/components/ui/Input'

export default function HealthAndSafetyPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [documentInfo, setDocumentInfo] = useState(null)

  const isAdmin = session?.user?.role === 'SUPER_ADMIN' || session?.user?.role === 'ADMIN' || session?.user?.role === 'super_admin' || session?.user?.role === 'admin'

  // Initialize content structure
  const initializeContent = () => {
    return {
      preparedBy: 'ESF LEATHER CONSULTANCY - QUALIFIED PERSON',
      documentId: 'ESF-HS-RKA-01',
      date: '20/01/2023',
      chemicalProducts: [
        {
          id: 1,
          productDescription: 'ACIDS - SULPHURIC & FORMIC',
          requiredPPE: 'Hand Protection: Use protective gloves specially produced for chemicals. Do not reuse dirty gloves for other tasks. Eye Protection: During the use of the product, it is necessary to use safety glasses due to the risk of splashing.',
          riskDefinitions: '*When exposed to heat and fire, the pressure will rise and the container may burst. *As a result of decomposition, carbon dioxide and carbon monoxide decompose. * Causes burns. * It irritates the skin.',
          firstAidMeasures: 'IF IN CONTACT WITH THE EYES: If you have contact lenses, remove them immediately. Immediately flush eyes with copious amounts of water for at least 10 minutes until clear. IF IN CONTACT WITH SKIN: Immediately wash the skin thoroughly with water. Thoroughly wash contaminated clothing. If symptoms worsen, consult a doctor. IF SWALLOWED: DO NOT vomit! Rinse your mouth thoroughly. Never give anything by mouth to an unconscious person. If conscious, give small amount of water. Get medical help. IF INHALED: Take the patient to fresh air. If the patient loses consciousness, move to the side position. Do not give mouth-to-mouth respiration (artificial respiration) provide oxygen.',
          fire: 'Suitable fire extinguishers: *Water in fog. *Foam, *KKT **Never use pressurized water!',
          handlingAndStorage: 'General protection and hygiene measures: * Keep away from foodstuffs, drinks. * Immediately remove contaminated clothing. * Immediately remove contaminated clothing. * Do not eat or drink any food while using this product. Storage conditions: Keep away from heat, sparks and open flame. Make sure the work area is well ventilated. It should be stored in a cool, dry place away from sources of ignition and direct sunlight.',
          accidentalReleaseMeasures: 'Cleaning method: Absorb with liquid-binding substances (sand, earth, diatomite, general binders, sawdust).',
          disposalInformation: 'Residual waste/unused products: It should not be disposed of together with household waste. Do not allow the product to reach the sewer system. Empty packaging Proposal: Dispose of in accordance with local regulations. Suitable cleaning agent: Clean with water, if necessary with cleaning agent.'
        },
        {
          id: 2,
          productDescription: 'DYE STUFFS',
          requiredPPE: 'Protection: Chemical protective gloves and masks should be used.',
          riskDefinitions: '* Irritating to eyes and skin. *Can cause serious eye damage. *As a result of decomposition, carbon dioxide, carbon monoxide and nitrogen oxides decompose.',
          firstAidMeasures: 'IF INHALED: The exposed person should be taken to the open air. Provide oxygen if breathing is irregular or airways are obstructed. The exposed person should be kept under surveillance for 48 hours IF SWALLOWED: Mouth should be rinsed immediately, DO NOT induce vomiting. A doctor should be consulted immediately. A small amount of water may be given if the exposed person is conscious and is not vomiting. IN CASE OF SKIN CONTACT: The contact area should be washed with water. Washing should be continued with pressurized water for at least 10 minutes. IF IN CONTACT WITH THE EYES:Rinse the eye with copious amounts of water by lifting the eyelid. Continue washing for at least 10 minutes. Get medical help right away.',
          fire: 'Suitable fire extinguishers: *Water in fog. *Foam, *KKT **Never use pressurized water!',
          handlingAndStorage: 'General protection and hygiene measures: Avoid contact with eyes. Keep away from food and drink. Remove contaminated clothing immediately. Avoid contact with eyes and skin. Do not eat or drink anything while using this product.Storage conditions: Keep away from heat, sparks and open flame. Make sure the work area is well ventilated. It should be stored in a cool, dry place away from sources of ignition and direct sunlight.',
          accidentalReleaseMeasures: 'Cleaning method: Absorb with liquid binders such as sand, diatomite, general binders and sawdust.',
          disposalInformation: 'Residual waste/unused products: Do not dispose of together with household waste. Do not allow undiluted product to reach the sewer system.Empty packaging Proposal: Dispose of in accordance with official regulations. Suitable cleaning agent: Clean with water, if necessary with cleaning agent.'
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
      const res = await fetch('/api/organization/documents/content?documentName=HEALTH & SAFETY')
      const data = await res.json()
      
      if (res.ok) {
        if (data.data?.content) {
          const loadedData = data.data.content.content || content
          // Ensure structure exists
          if (!loadedData.chemicalProducts) {
            loadedData.chemicalProducts = initializeContent().chemicalProducts
          }
          setContent(loadedData)
          setDocumentInfo({
            docNo: data.data.document.docNo || 'ESF-HS-RKA-01',
            revDate: data.data.document.revDate || '',
            revisionNo: data.data.content.revisionNo,
            revisionDate: data.data.content.revisionDate
          })
        } else {
          setDocumentInfo({
            docNo: 'ESF-HS-RKA-01',
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

  const handleProductChange = (productId, field, value) => {
    setContent(prev => ({
      ...prev,
      chemicalProducts: prev.chemicalProducts.map(product =>
        product.id === productId
          ? { ...product, [field]: value }
          : product
      )
    }))
  }

  const handleAddProduct = () => {
    const newProduct = {
      id: Date.now(),
      productDescription: '',
      requiredPPE: '',
      riskDefinitions: '',
      firstAidMeasures: '',
      fire: '',
      handlingAndStorage: '',
      accidentalReleaseMeasures: '',
      disposalInformation: ''
    }
    setContent(prev => ({
      ...prev,
      chemicalProducts: [...prev.chemicalProducts, newProduct]
    }))
  }

  const handleDeleteProduct = (productId) => {
    if (content.chemicalProducts.length <= 1) {
      alert('At least one product is required')
      return
    }
    setContent(prev => ({
      ...prev,
      chemicalProducts: prev.chemicalProducts.filter(p => p.id !== productId)
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
          documentName: 'HEALTH & SAFETY',
          content: content,
          changeDescription: 'Updated Health & Safety Risk Assessment'
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

      setToast({ type: 'success', message: 'Health & Safety Risk Assessment saved successfully. Revision number incremented.' })
    } catch (error) {
      console.error('Error saving assessment:', error)
      setToast({ type: 'error', message: 'Failed to save changes. Please try again.' })
    }
  }

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'organization', label: 'Organization', href: '/dashboard/organization' },
    { key: 'documents', label: 'Document Details', href: '/dashboard/organization/documents' },
    { key: 'health-and-safety', label: 'Health & Safety', href: '#' }
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
              HEALTH AND SAFETY RISK ASSESSMENT FOR ALL CHEMICALS
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
                onClick={handleAddProduct}
                className="px-4"
              >
                + Add Chemical Product
              </Button>
              <Button
                onClick={handleSaveAll}
                className="px-6"
              >
                Save All Changes
              </Button>
            </div>
          )}

          {/* Chemical Products Table */}
          <div className="relative w-full">
            <div className="w-full overflow-x-auto overflow-y-visible scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200" style={{ maxWidth: '100%', scrollbarWidth: 'thin' }}>
              <div className="border border-gray-300 rounded-md inline-block min-w-full">
                <table className="min-w-full" style={{ minWidth: 'max-content', tableLayout: 'auto' }}>
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700 sticky left-0 bg-gray-100 z-10 min-w-[200px]">
                        PRODUCT DESCRIPTION
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700 min-w-[250px]">
                        REQUIRED PPE
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700 min-w-[250px]">
                        (R) RISK DEFINITIONS
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700 min-w-[300px]">
                        FIRST AID MEASURES
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700 min-w-[200px]">
                        FIRE
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700 min-w-[300px]">
                        HANDLING and STORAGE
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700 min-w-[250px]">
                        ACCIDENTAL RELEASE MEASURES
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700 min-w-[250px]">
                        DISPOSAL INFORMATION
                      </th>
                      {isAdmin && (
                        <th className="border border-gray-300 px-3 py-2 text-center text-xs font-semibold text-gray-700 min-w-[100px] sticky right-0 bg-gray-100 z-10">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {content.chemicalProducts?.map((product, index) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 sticky left-0 z-10 min-w-[200px]">
                          {isAdmin ? (
                            <Input
                              type="text"
                              value={product.productDescription}
                              onChange={(e) => handleProductChange(product.id, 'productDescription', e.target.value)}
                              className="w-full text-sm font-medium"
                              placeholder="Product name"
                            />
                          ) : (
                            <span>{product.productDescription || '-'}</span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-2 min-w-[250px]">
                          {isAdmin ? (
                            <textarea
                              value={product.requiredPPE}
                              onChange={(e) => handleProductChange(product.id, 'requiredPPE', e.target.value)}
                              className="w-full text-sm rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              rows={4}
                              placeholder="Required PPE information"
                            />
                          ) : (
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{product.requiredPPE || '-'}</p>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-2 min-w-[250px]">
                          {isAdmin ? (
                            <textarea
                              value={product.riskDefinitions}
                              onChange={(e) => handleProductChange(product.id, 'riskDefinitions', e.target.value)}
                              className="w-full text-sm rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              rows={4}
                              placeholder="Risk definitions"
                            />
                          ) : (
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{product.riskDefinitions || '-'}</p>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-2 min-w-[300px]">
                          {isAdmin ? (
                            <textarea
                              value={product.firstAidMeasures}
                              onChange={(e) => handleProductChange(product.id, 'firstAidMeasures', e.target.value)}
                              className="w-full text-sm rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              rows={6}
                              placeholder="First aid measures"
                            />
                          ) : (
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{product.firstAidMeasures || '-'}</p>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-2 min-w-[200px]">
                          {isAdmin ? (
                            <textarea
                              value={product.fire}
                              onChange={(e) => handleProductChange(product.id, 'fire', e.target.value)}
                              className="w-full text-sm rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              rows={3}
                              placeholder="Fire extinguisher information"
                            />
                          ) : (
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{product.fire || '-'}</p>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-2 min-w-[300px]">
                          {isAdmin ? (
                            <textarea
                              value={product.handlingAndStorage}
                              onChange={(e) => handleProductChange(product.id, 'handlingAndStorage', e.target.value)}
                              className="w-full text-sm rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              rows={6}
                              placeholder="Handling and storage information"
                            />
                          ) : (
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{product.handlingAndStorage || '-'}</p>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-2 min-w-[250px]">
                          {isAdmin ? (
                            <textarea
                              value={product.accidentalReleaseMeasures}
                              onChange={(e) => handleProductChange(product.id, 'accidentalReleaseMeasures', e.target.value)}
                              className="w-full text-sm rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              rows={4}
                              placeholder="Accidental release measures"
                            />
                          ) : (
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{product.accidentalReleaseMeasures || '-'}</p>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-2 min-w-[250px]">
                          {isAdmin ? (
                            <textarea
                              value={product.disposalInformation}
                              onChange={(e) => handleProductChange(product.id, 'disposalInformation', e.target.value)}
                              className="w-full text-sm rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              rows={4}
                              placeholder="Disposal information"
                            />
                          ) : (
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{product.disposalInformation || '-'}</p>
                          )}
                        </td>
                        {isAdmin && (
                          <td className="border border-gray-300 px-2 py-2 text-center sticky right-0 bg-white z-10 min-w-[100px]">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteProduct(product.id)}
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
            {content.chemicalProducts && content.chemicalProducts.length > 0 && (
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


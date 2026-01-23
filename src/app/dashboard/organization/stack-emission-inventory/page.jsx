'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Toast } from '@/components/ui/Toast'
import { Input } from '@/components/ui/Input'

export default function StackEmissionInventoryPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [documentInfo, setDocumentInfo] = useState(null)

  const isAdmin = session?.user?.role === 'SUPER_ADMIN' || session?.user?.role === 'ADMIN' || session?.user?.role === 'super_admin' || session?.user?.role === 'admin'

  // Process types
  const processTypes = [
    'THERMIC FLUID',
    'AUTO SPRAY',
    'HAND SPRAY',
    'DRY SHAVING',
    'DRY MILLING',
    'BUFFING',
    'DE-DUSTING',
    '125 KVA GENSET'
  ]

  // Stack Emission Inventory Data Structure
  const [content, setContent] = useState({
    inventoryDetails: {
      detailsOfProcessStack: {
        'THERMIC FLUID': 'HEAT PRODUCTION',
        'AUTO SPRAY': 'CHEMICAL SPRAYING',
        'HAND SPRAY': 'CHEMICAL SPRAYING',
        'DRY SHAVING': 'NA',
        'DRY MILLING': 'NA',
        'BUFFING': 'NA',
        'DE-DUSTING': 'NA',
        '125 KVA GENSET': 'BACKUP POWER'
      },
      stackHeight: {
        'THERMIC FLUID': '11.0',
        'AUTO SPRAY': '8-2 NOS',
        'HAND SPRAY': 'NIL',
        'DRY SHAVING': 'NIL',
        'DRY MILLING': 'NIL',
        'BUFFING': 'NIL',
        'DE-DUSTING': 'NIL',
        '125 KVA GENSET': '8.5'
      },
      stackDiameter: {
        'THERMIC FLUID': '300',
        'AUTO SPRAY': '820-2 NOS',
        'HAND SPRAY': 'NIL',
        'DRY SHAVING': 'NIL',
        'DRY MILLING': 'NIL',
        'BUFFING': 'NIL',
        'DE-DUSTING': 'NIL',
        '125 KVA GENSET': '90'
      },
      fuelUsed: {
        'THERMIC FLUID': 'FIRE WOOD',
        'AUTO SPRAY': 'NA',
        'HAND SPRAY': 'NA',
        'DRY SHAVING': 'NA',
        'DRY MILLING': 'NA',
        'BUFFING': 'NA',
        'DE-DUSTING': 'NA',
        '125 KVA GENSET': 'DIESEL'
      },
      apcMeasuresProvided: {
        'THERMIC FLUID': 'ID FAN WITH STACK PROVIDED',
        'AUTO SPRAY': 'RUNNING WATER EASH SYSTEM WITH EXHAUST BLOWER',
        'HAND SPRAY': 'RUNNING WATER EASH SYSTEM WITH EXHAUST BLOWER',
        'DRY SHAVING': 'FABRIC FILTER AND DUST COLLECTOR',
        'DRY MILLING': 'FABRIC FILTER AND DUST COLLECTOR',
        'BUFFING': 'FABRIC FILTER AND DUST COLLECTOR',
        'DE-DUSTING': 'FABRIC FILTER AND DUST COLLECTOR',
        '125 KVA GENSET': 'CHIMNEY PROVIDED'
      },
      acpFunctionalStatus: {
        'THERMIC FLUID': 'FUNCTIONING',
        'AUTO SPRAY': 'FUNCTIONING',
        'HAND SPRAY': 'FUNCTIONING',
        'DRY SHAVING': 'FUNCTIONING',
        'DRY MILLING': 'FUNCTIONING',
        'BUFFING': 'FUNCTIONING',
        'DE-DUSTING': 'FUNCTIONING',
        '125 KVA GENSET': 'FUNCTIONING'
      },
      flowRate: {
        'THERMIC FLUID': '1450 Nm3/hr',
        'AUTO SPRAY': '18147 Nm3/hr',
        'HAND SPRAY': '345 Nm3/hr',
        'DRY SHAVING': 'NA',
        'DRY MILLING': 'NA',
        'BUFFING': 'NA',
        'DE-DUSTING': 'NA',
        '125 KVA GENSET': '317 Nm3/hr'
      }
    },
    emissionTypes: {
      'Particulates': {
        'THERMIC FLUID': 'Yes',
        'AUTO SPRAY': 'Yes',
        'HAND SPRAY': 'Yes',
        'DRY SHAVING': 'Yes',
        'DRY MILLING': 'Yes',
        'BUFFING': 'Yes',
        'DE-DUSTING': 'Yes',
        '125 KVA GENSET': 'Yes'
      },
      'Nitrogen Oxides Nox': {
        'THERMIC FLUID': 'Yes',
        'AUTO SPRAY': 'Yes',
        'HAND SPRAY': 'Yes',
        'DRY SHAVING': 'No',
        'DRY MILLING': 'No',
        'BUFFING': 'No',
        'DE-DUSTING': 'No',
        '125 KVA GENSET': 'Yes'
      },
      'Sulphur Dioxide SO2': {
        'THERMIC FLUID': 'Yes',
        'AUTO SPRAY': 'Yes',
        'HAND SPRAY': 'Yes',
        'DRY SHAVING': 'No',
        'DRY MILLING': 'No',
        'BUFFING': 'No',
        'DE-DUSTING': 'No',
        '125 KVA GENSET': 'Yes'
      },
      'Carbon Monoxide CO': {
        'THERMIC FLUID': 'Yes',
        'AUTO SPRAY': 'No',
        'HAND SPRAY': 'No',
        'DRY SHAVING': 'No',
        'DRY MILLING': 'No',
        'BUFFING': 'No',
        'DE-DUSTING': 'No',
        '125 KVA GENSET': 'Yes'
      },
      'VOC - Volatile Organic': {
        'THERMIC FLUID': 'Yes',
        'AUTO SPRAY': 'Yes',
        'HAND SPRAY': 'Yes',
        'DRY SHAVING': 'No',
        'DRY MILLING': 'No',
        'BUFFING': 'No',
        'DE-DUSTING': 'No',
        '125 KVA GENSET': 'No'
      }
    }
  })

  useEffect(() => {
    fetchDocumentContent()
  }, [])

  const fetchDocumentContent = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/organization/documents/content?documentName=STACK EMISSION INVENTORY')
      const data = await res.json()
      
      if (res.ok) {
        if (data.data?.content) {
          const loadedData = data.data.content.content || content
          setContent(loadedData)
          setDocumentInfo({
            docNo: data.data.document.docNo || 'ESF-ANE-INV-01',
            revDate: data.data.document.revDate || '',
            revisionNo: data.data.content.revisionNo,
            revisionDate: data.data.content.revisionDate
          })
        } else {
          setDocumentInfo({
            docNo: 'ESF-ANE-INV-01',
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

  const handleInventoryChange = (category, process, value) => {
    setContent(prev => ({
      ...prev,
      inventoryDetails: {
        ...prev.inventoryDetails,
        [category]: {
          ...prev.inventoryDetails[category],
          [process]: value
        }
      }
    }))
  }

  const handleEmissionChange = (emissionType, process, value) => {
    setContent(prev => ({
      ...prev,
      emissionTypes: {
        ...prev.emissionTypes,
        [emissionType]: {
          ...prev.emissionTypes[emissionType],
          [process]: value
        }
      }
    }))
  }

  const handleSaveAll = async () => {
    try {
      const res = await fetch('/api/organization/documents/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentName: 'STACK EMISSION INVENTORY',
          content: content,
          changeDescription: 'Updated Stack Emission Inventory'
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

      setToast({ type: 'success', message: 'Stack Emission Inventory saved successfully. Revision number incremented.' })
    } catch (error) {
      console.error('Error saving inventory:', error)
      setToast({ type: 'error', message: 'Failed to save changes. Please try again.' })
    }
  }

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'organization', label: 'Organization', href: '/dashboard/organization' },
    { key: 'documents', label: 'Document Details', href: '/dashboard/organization/documents' },
    { key: 'stack-emission-inventory', label: 'Stack Emission Inventory', href: '#' }
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

  const inventoryRows = [
    { key: 'detailsOfProcessStack', label: 'Details of Process Stack' },
    { key: 'stackHeight', label: 'Stack Height (m)' },
    { key: 'stackDiameter', label: 'Stack Diameter (m)' },
    { key: 'fuelUsed', label: 'Fuel Used' },
    { key: 'apcMeasuresProvided', label: 'APC Measures Provided' },
    { key: 'acpFunctionalStatus', label: 'ACP Functional Status' },
    { key: 'flowRate', label: 'Flow Rate' }
  ]

  const emissionTypes = Object.keys(content.emissionTypes)

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
              STACK EMISSION INVENTORY
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

          {/* Table 1: Stack Emission Inventory Details */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-b-2 border-green-600 pb-2 mb-4">
              Stack Emission Inventory Details
            </h2>
            <div className="overflow-x-auto border border-gray-300 rounded-md">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                      STACK ATTACHED TO
                    </th>
                    {processTypes.map((process) => (
                      <th key={process} className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                        {process}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {inventoryRows.map((row) => (
                    <tr key={row.key} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50">
                        {row.label}
                      </td>
                      {processTypes.map((process) => (
                        <td key={process} className="border border-gray-300 px-2 py-1">
                          {isAdmin ? (
                            <Input
                              type="text"
                              value={content.inventoryDetails[row.key]?.[process] || ''}
                              onChange={(e) => handleInventoryChange(row.key, process, e.target.value)}
                              className="w-full text-sm"
                            />
                          ) : (
                            <span className="text-sm">{content.inventoryDetails[row.key]?.[process] || '-'}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table 2: Types of Emissions */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-b-2 border-green-600 pb-2 mb-4">
              Types of Emissions
            </h2>
            <div className="overflow-x-auto border border-gray-300 rounded-md">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                      Emission Type
                    </th>
                    {processTypes.map((process) => (
                      <th key={process} className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                        {process}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {emissionTypes.map((emissionType) => (
                    <tr key={emissionType} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50">
                        {emissionType}
                      </td>
                      {processTypes.map((process) => (
                        <td key={process} className="border border-gray-300 px-2 py-1">
                          {isAdmin ? (
                            <select
                              value={content.emissionTypes[emissionType]?.[process] || 'No'}
                              onChange={(e) => handleEmissionChange(emissionType, process, e.target.value)}
                              className="w-full text-sm rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="Yes">Yes</option>
                              <option value="No">No</option>
                            </select>
                          ) : (
                            <span className="text-sm">{content.emissionTypes[emissionType]?.[process] || '-'}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


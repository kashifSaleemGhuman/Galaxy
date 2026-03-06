'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Toast } from '@/components/ui/Toast'
import { Input } from '@/components/ui/Input'

export default function ChemicalManagementProcedurePage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [documentInfo, setDocumentInfo] = useState(null)

  const isAdmin = session?.user?.role === 'SUPER_ADMIN' || session?.user?.role === 'ADMIN' || session?.user?.role === 'super_admin' || session?.user?.role === 'admin'

  // Chemical Compatibility Chart Data Structure
  // Matrix: row x column compatibility
  // Values: 'red' = incompatible, 'green' = compatible, 'yellow' = caution
  const [chartData, setChartData] = useState({
    compatibilityMatrix: {
      flammable: {
        flammable: 'green',
        explosive: 'red',
        acuteToxicity: 'yellow',
        oxidizingAgent: 'red',
        compressedGas: 'yellow',
        irritating: 'green',
        seriousHealthHazard: 'yellow',
        abrasive: 'yellow',
        harmfulEnvironment: 'green'
      },
      explosive: {
        flammable: 'red',
        explosive: 'red',
        acuteToxicity: 'red',
        oxidizingAgent: 'red',
        compressedGas: 'red',
        irritating: 'red',
        seriousHealthHazard: 'red',
        abrasive: 'red',
        harmfulEnvironment: 'red'
      },
      acuteToxicity: {
        flammable: 'yellow',
        explosive: 'red',
        acuteToxicity: 'green',
        oxidizingAgent: 'yellow',
        compressedGas: 'yellow',
        irritating: 'green',
        seriousHealthHazard: 'yellow',
        abrasive: 'yellow',
        harmfulEnvironment: 'yellow'
      },
      oxidizingAgent: {
        flammable: 'red',
        explosive: 'red',
        acuteToxicity: 'yellow',
        oxidizingAgent: 'green',
        compressedGas: 'red',
        irritating: 'yellow',
        seriousHealthHazard: 'yellow',
        abrasive: 'yellow',
        harmfulEnvironment: 'yellow'
      },
      compressedGas: {
        flammable: 'yellow',
        explosive: 'red',
        acuteToxicity: 'yellow',
        oxidizingAgent: 'red',
        compressedGas: 'green',
        irritating: 'green',
        seriousHealthHazard: 'green',
        abrasive: 'green',
        harmfulEnvironment: 'green'
      },
      irritating: {
        flammable: 'green',
        explosive: 'red',
        acuteToxicity: 'green',
        oxidizingAgent: 'yellow',
        compressedGas: 'green',
        irritating: 'green',
        seriousHealthHazard: 'green',
        abrasive: 'green',
        harmfulEnvironment: 'green'
      },
      seriousHealthHazard: {
        flammable: 'yellow',
        explosive: 'red',
        acuteToxicity: 'yellow',
        oxidizingAgent: 'yellow',
        compressedGas: 'green',
        irritating: 'green',
        seriousHealthHazard: 'green',
        abrasive: 'red',
        harmfulEnvironment: 'yellow'
      },
      abrasive: {
        flammable: 'yellow',
        explosive: 'red',
        acuteToxicity: 'yellow',
        oxidizingAgent: 'yellow',
        compressedGas: 'green',
        irritating: 'green',
        seriousHealthHazard: 'red',
        abrasive: 'green',
        harmfulEnvironment: 'yellow'
      },
      harmfulEnvironment: {
        flammable: 'green',
        explosive: 'red',
        acuteToxicity: 'yellow',
        oxidizingAgent: 'yellow',
        compressedGas: 'green',
        irritating: 'green',
        seriousHealthHazard: 'yellow',
        abrasive: 'yellow',
        harmfulEnvironment: 'green'
      }
    }
  })

  const ghsCategories = [
    { key: 'flammable', label: 'Flammable Material', symbol: '🔥' },
    { key: 'explosive', label: 'Explosive', symbol: '💣' },
    { key: 'acuteToxicity', label: 'Acute Toxicity', symbol: '☠️' },
    { key: 'oxidizingAgent', label: 'Oxidizing Agent', symbol: '⚡' },
    { key: 'compressedGas', label: 'Compressed Gas', symbol: '💨' },
    { key: 'irritating', label: 'Irritating', symbol: '⚠️' },
    { key: 'seriousHealthHazard', label: 'Serious Health Hazard', symbol: '🏥' },
    { key: 'abrasive', label: 'Abrasive', symbol: '⚗️' },
    { key: 'harmfulEnvironment', label: 'Harmful for the Environment', symbol: '🌿' }
  ]

  useEffect(() => {
    fetchDocumentContent()
  }, [])

  const fetchDocumentContent = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/organization/documents/content?documentName=CHEMICAL MANAGEMENT PROCEDURE')
      const data = await res.json()
      
      if (res.ok) {
        if (data.data?.content) {
          const loadedData = data.data.content.content || chartData
          setChartData(loadedData)
          setDocumentInfo({
            docNo: data.data.document.docNo || 'ESF-CMM-PRO-02',
            revDate: data.data.document.revDate || 'Rev.No-01/Date-01-01-2024',
            revisionNo: data.data.content.revisionNo,
            revisionDate: data.data.content.revisionDate
          })
        } else {
          setDocumentInfo({
            docNo: 'ESF-CMM-PRO-02',
            revDate: 'Rev.No-01/Date-01-01-2024',
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

  const handleCompatibilityChange = async (rowKey, colKey, newValue) => {
    try {
      const updatedData = JSON.parse(JSON.stringify(chartData))
      updatedData.compatibilityMatrix[rowKey][colKey] = newValue
      
      setChartData(updatedData)

      const res = await fetch('/api/organization/documents/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentName: 'CHEMICAL MANAGEMENT PROCEDURE',
          content: updatedData,
          changeDescription: `Updated compatibility: ${rowKey} x ${colKey}`
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

      setToast({ type: 'success', message: 'Compatibility updated successfully. Revision number incremented.' })
    } catch (error) {
      console.error('Error saving compatibility:', error)
      setToast({ type: 'error', message: error.message || 'Failed to save changes' })
    }
  }

  const CompatibilityCell = ({ rowKey, colKey, value, isEditable }) => {
    const [localValue, setLocalValue] = useState(value || 'green')
    
    useEffect(() => {
      setLocalValue(value || 'green')
    }, [value])

    const getCircleColor = (val) => {
      switch (val) {
        case 'red': return 'bg-red-500'
        case 'yellow': return 'bg-yellow-500'
        case 'green': return 'bg-green-500'
        default: return 'bg-gray-300'
      }
    }

    const cycleValue = (current) => {
      if (current === 'green') return 'yellow'
      if (current === 'yellow') return 'red'
      if (current === 'red') return 'green'
      return 'green'
    }

    return (
      <td className="px-2 py-2 border border-gray-300 text-center">
        {isEditable && isAdmin ? (
          <button
            onClick={() => {
              const newValue = cycleValue(localValue)
              setLocalValue(newValue)
              handleCompatibilityChange(rowKey, colKey, newValue)
            }}
            className={`w-8 h-8 rounded-full ${getCircleColor(localValue)} hover:opacity-80 transition-opacity cursor-pointer mx-auto block`}
            title={`Click to change: ${localValue === 'green' ? 'Compatible' : localValue === 'yellow' ? 'Caution' : 'Incompatible'}`}
          />
        ) : (
          <div className={`w-8 h-8 rounded-full ${getCircleColor(localValue)} mx-auto`} />
        )}
      </td>
    )
  }

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'organization', label: 'Organization', href: '/dashboard/organization' },
    { key: 'documents', label: 'Document Details', href: '/dashboard/organization/documents' },
    { key: 'chemical-management-procedure', label: 'Chemical Management Procedure', href: '#' }
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
    <div className="space-y-6 pb-10">
      <Breadcrumbs items={breadcrumbs} onNavigate={handleNavigate} />
      
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-blue-600 underline flex items-center gap-2">
                ESF LEATHER CONSULTANCY
              </h1>
              <h2 className="text-xl font-bold text-blue-600 underline mt-2">
                CHEMICAL MANAGEMENT PROCEDURE
              </h2>
              {documentInfo && (
                <div className="mt-4 flex gap-6 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Doc No:</span> {documentInfo.docNo}
                  </div>
                  <div>
                    <span className="font-medium">Rev/Date:</span> {documentInfo.revDate}
                  </div>
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
        </div>

        <div className="p-6 space-y-8">
          {/* Legend */}
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Legend</h3>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-700">Can be stored together (Compatible)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-red-500"></div>
                <span className="text-sm text-gray-700">Cannot be stored together (Incompatible)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-yellow-500"></div>
                <span className="text-sm text-gray-700">Can be stored with special precaution (Caution)</span>
              </div>
            </div>
            {isAdmin && (
              <p className="text-xs text-gray-500 mt-2 italic">
                * Click on any circle to change compatibility status (Admin only)
              </p>
            )}
          </div>

          {/* Chemical Compatibility Chart */}
          <div className="bg-white border border-gray-300 rounded-lg p-6 overflow-x-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
              CHEMICAL COMPATIBILITY CHART
            </h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                  <tr>
                    <th className="px-4 py-3 border border-gray-300 bg-gray-100 font-semibold text-sm text-gray-700 text-left">
                      Symbol
                    </th>
                    <th className="px-4 py-3 border border-gray-300 bg-gray-100 font-semibold text-sm text-gray-700 text-center">
                      Definition
                    </th>
                    {ghsCategories.map((category) => (
                      <th
                        key={category.key}
                        className="px-2 py-3 border border-gray-300 bg-gray-100 font-semibold text-xs text-gray-700 text-center min-w-[80px]"
                      >
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-lg">{category.symbol}</span>
                          <span className="text-[10px] leading-tight">{category.label}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ghsCategories.map((rowCategory) => (
                    <tr key={rowCategory.key}>
                      <td className="px-4 py-3 border border-gray-300 text-center">
                        <span className="text-2xl">{rowCategory.symbol}</span>
                      </td>
                      <td className="px-4 py-3 border border-gray-300 text-sm text-gray-700">
                        {rowCategory.label}
                      </td>
                      {ghsCategories.map((colCategory) => {
                        const value = chartData.compatibilityMatrix?.[rowCategory.key]?.[colCategory.key] || 'green'
                        return (
                          <CompatibilityCell
                            key={`${rowCategory.key}-${colCategory.key}`}
                            rowKey={rowCategory.key}
                            colKey={colCategory.key}
                            value={value}
                            isEditable={true}
                          />
                        )
                      })}
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


'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import { toast } from '@/components/ui/Toast'
import { Dialog } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'

export default function DocumentDetailsPage() {
  const router = useRouter()
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    docNo: '',
    revDate: '',
    description: ''
  })

  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/organization/documents')
      if (!res.ok) throw new Error('Failed to fetch documents')
      const data = await res.json()
      setDocuments(data)
    } catch (error) {
      console.error(error)
      toast({
        title: 'Error',
        description: 'Failed to load documents',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [])

  const handleEdit = (doc) => {
    // Check if this is a special document that should navigate to a specific page
    if (doc.name === 'OUTGOING TRACEABILITY') {
      router.push('/dashboard/organization/traceability/outgoing')
      return
    }
    
    if (doc.name === 'INCOMING TRACEABILITY') {
      router.push('/dashboard/organization/traceability')
      return
    }
    
    if (doc.name === 'EMS POLICY') {
      router.push('/dashboard/organization/environmental-policy')
      return
    }
    
    if (doc.name === 'EMS PROCEDURE') {
      router.push('/dashboard/organization/ems-procedure')
      return
    }
    
    if (doc.name === 'KPI' || 
        doc.name === 'KPI → PRODUCTION CONSUMPTION RECORD' || 
        doc.name === 'Key Performance Indicator Records') {
      router.push('/dashboard/organization/kpi')
      return
    }
    
    if (doc.name === 'OBJECTIVES & TARGETS → ENVIRONMENTAL IMPROVEMENT') {
      router.push('/dashboard/organization/objectives-targets')
      return
    }
    
    if (doc.name === 'ENVIRONMENTAL ORGANISATION CHART → PERSONNEL COMPETENCY') {
      router.push('/dashboard/organization/organisation-chart')
      return
    }
    
    if (doc.name === 'ENVIRONMENTAL MANAGEMENT CHART') {
      router.push('/dashboard/organization/environmental-management-chart')
      return
    }
    
    if (doc.name === 'ENVIRONMENTAL PERSONNEL COMPETENCY MATRIX') {
      router.push('/dashboard/organization/personnel-competency-matrix')
      return
    }
    
    if (doc.name === 'EMS → TRANNING CALENDAR') {
      router.push('/dashboard/organization/training-calendar')
      return
    }
    
    if (doc.name === 'EMS → TRANNING RECORD') {
      router.push('/dashboard/organization/training-record')
      return
    }
    
    if (doc.name === 'EMS → DOCUMENT CONTROL REGISTER') {
      router.push('/dashboard/organization/document-control-register')
      return
    }
    
    if (doc.name === 'Internal Audit Schedule') {
      router.push('/dashboard/organization/internal-audit-schedule')
      return
    }
    
    if (doc.name === 'EMS → OBSERVATION SHEET INTERNAL AUDIT') {
      router.push('/dashboard/organization/internal-audit-observation-sheet')
      return
    }
    
    if (doc.name === 'EMS → INTERNAL AUDIT & MRM') {
      router.push('/dashboard/organization/management-review-meeting')
      return
    }
    
    if (doc.name === 'ASPECT & IMPACT') {
      router.push('/dashboard/organization/environmental-aspects-register')
      return
    }
    
    if (doc.name === 'EMS → ASPECT & IMPACT REGISTER') {
      router.push('/dashboard/organization/environmental-aspect-impact-register')
      return
    }
    
    if (doc.name === 'Aspects & Impacts Risk Assessment Procedure') {
      router.push('/dashboard/organization/aspects-impacts-risk-assessment')
      return
    }
    
    if (doc.name === 'WASTE MANAGEMENT') {
      router.push('/dashboard/organization/waste-management-procedure')
      return
    }
    
    if (doc.name === '3R PROCEDURE') {
      router.push('/dashboard/organization/3r-rinse-systems')
      return
    }
    
    if (doc.name === 'WASTE GENERATION') {
      router.push('/dashboard/organization/waste-generation')
      return
    }
    
    if (doc.name === 'SCRAP AGENT REGISTER') {
      router.push('/dashboard/organization/scrap-agent-register')
      return
    }
    
    if (doc.name === 'RSL POLICY') {
      router.push('/dashboard/organization/rsl-policy')
      return
    }
    
    if (doc.name === 'RSL PROCEDURE') {
      router.push('/dashboard/organization/rsl-procedure')
      return
    }
    
    if (doc.name === 'MRSL COMPLAINCE REGISTER - CLIENT COMMUNCATION') {
      router.push('/dashboard/organization/mrsl-compliance-register-client-communication')
      return
    }
    
    if (doc.name === 'Client RSL Evaluation') {
      router.push('/dashboard/organization/client-rsl-evaluation')
      return
    }
    
    if (doc.name === 'Cr IV Prevention') {
      router.push('/dashboard/organization/cr-iv-prevention')
      return
    }
    
    if (doc.name === 'Incoming Part-Processed MRSL Compliance Register') {
      router.push('/dashboard/organization/incoming-part-processed-mrsl-compliance-register')
      return
    }
    
    if (doc.name === 'Chemical Recipe') {
      router.push('/dashboard/organization/chemical-recipe')
      return
    }
    
    if (doc.name === 'STACK EMISSION INVENTORY') {
      router.push('/dashboard/organization/stack-emission-inventory')
      return
    }
    
    if (doc.name === 'PREVENTIVE MAINTENANCE CHECK LIST') {
      router.push('/dashboard/organization/preventive-maintenance-check-list')
      return
    }
    
    if (doc.name === 'CETP Effluent Treated Water Register') {
      router.push('/dashboard/organization/cetp-effluent-treated-water-register')
      return
    }
    
    if (doc.name === 'HEALTH & SAFETY') {
      router.push('/dashboard/organization/health-and-safety')
      return
    }
    
    if (doc.name === 'CHEMICAL RISK ASSESSMENT') {
      router.push('/dashboard/organization/chemical-risk-assessment')
      return
    }
    
    if (doc.name === 'OCCUPATIONAL HEALTH & SAFETY HAZARDS RECORD') {
      router.push('/dashboard/organization/occupational-health-safety-hazards-record')
      return
    }
    
    if (doc.name === 'Personnel Protective Equipments -RAW') {
      router.push('/dashboard/organization/personnel-protective-equipments-raw')
      return
    }
    
    if (doc.name === 'Personnel Protective Equipments -WET BLUE') {
      router.push('/dashboard/organization/personnel-protective-equipments-wet-blue')
      return
    }
    
    // For other documents, open the edit modal
    setSelectedDoc(doc)
    setFormData({
      docNo: doc.docNo || '',
      revDate: doc.revDate || '',
      description: doc.description || ''
    })
    setIsModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!selectedDoc) return

    setSaving(true)
    try {
      const res = await fetch('/api/organization/documents', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedDoc.id,
          ...formData
        })
      })

      if (!res.ok) throw new Error('Failed to update document')

      const updatedDoc = await res.json()
      
      setDocuments(docs => 
        docs.map(d => d.id === updatedDoc.id ? updatedDoc : d)
      )
      
      setIsModalOpen(false)
      toast({
        title: 'Success',
        description: 'Document updated successfully'
      })
    } catch (error) {
      console.error(error)
      toast({
        title: 'Error',
        description: 'Failed to update document',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'organization', label: 'Organization', href: '/dashboard/organization' },
    { key: 'documents', label: 'Document Details', href: '/dashboard/organization/documents' },
  ]

  const handleNavigate = (index, item) => {
    if (item.href) router.push(item.href)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Records</h1>
          <Breadcrumbs items={breadcrumbs} onNavigate={handleNavigate} className="mt-2" />
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading documents...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Document Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doc. No
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rev/Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {doc.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {doc.docNo || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {doc.revDate || '-'}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(doc)}
                        className="text-blue-600 hover:text-blue-900 font-semibold"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
                {documents.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                      No documents found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Dialog 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-lg w-full bg-white rounded-xl shadow-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <Dialog.Title className="text-lg font-semibold text-gray-900">
                Edit Document Details
              </Dialog.Title>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Document Name
                </label>
                <div className="text-sm text-gray-900 p-3 bg-gray-50 rounded-md border border-gray-200">
                  {selectedDoc?.name}
                </div>
              </div>

              <div>
                <label htmlFor="docNo" className="block text-sm font-medium text-gray-700 mb-1">
                  Document No
                </label>
                <Input
                  id="docNo"
                  value={formData.docNo}
                  onChange={(e) => setFormData({ ...formData, docNo: e.target.value })}
                  placeholder="e.g. ESF-TM-BAN-01"
                />
              </div>

              <div>
                <label htmlFor="revDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Rev / Date
                </label>
                <Input
                  id="revDate"
                  value={formData.revDate}
                  onChange={(e) => setFormData({ ...formData, revDate: e.target.value })}
                  placeholder="e.g. Rev. No : 02"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description / Details
                </label>
                <textarea
                  id="description"
                  rows={4}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter document details..."
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  )
}


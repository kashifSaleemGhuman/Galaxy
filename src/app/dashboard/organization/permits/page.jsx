'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import { toast } from '@/components/ui/Toast'
import { Dialog } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'

export default function PermitsPage() {
  const router = useRouter()
  const [permits, setPermits] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPermit, setSelectedPermit] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    authorizedNumber: '',
    issuingAuthority: '',
    dateOfIssue: '',
    dateOfExpiry: '',
    renewalSubmissionDate: '',
    reportingFrequency: '',
    lastReportDate: '',
    responsiblePerson: ''
  })

  const fetchPermits = async () => {
    try {
      const res = await fetch('/api/organization/permits')
      if (!res.ok) throw new Error('Failed to fetch permits')
      const data = await res.json()
      setPermits(data)
    } catch (error) {
      console.error(error)
      toast({
        title: 'Error',
        description: 'Failed to load permits',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPermits()
  }, [])

  const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toISOString().split('T')[0]
  }

  const formatDateDisplay = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString()
  }

  const handleEdit = (permit) => {
    setSelectedPermit(permit)
    setFormData({
      authorizedNumber: permit.authorizedNumber || '',
      issuingAuthority: permit.issuingAuthority || '',
      dateOfIssue: formatDate(permit.dateOfIssue),
      dateOfExpiry: formatDate(permit.dateOfExpiry),
      renewalSubmissionDate: formatDate(permit.renewalSubmissionDate),
      reportingFrequency: permit.reportingFrequency || '',
      lastReportDate: formatDate(permit.lastReportDate),
      responsiblePerson: permit.responsiblePerson || ''
    })
    setIsModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!selectedPermit) return

    setSaving(true)
    try {
      const res = await fetch('/api/organization/permits', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedPermit.id,
          ...formData
        })
      })

      if (!res.ok) throw new Error('Failed to update permit')

      const updatedPermit = await res.json()
      
      setPermits(items => 
        items.map(p => p.id === updatedPermit.id ? updatedPermit : p)
      )
      
      setIsModalOpen(false)
      toast({
        title: 'Success',
        description: 'Permit updated successfully'
      })
    } catch (error) {
      console.error(error)
      toast({
        title: 'Error',
        description: 'Failed to update permit',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'organization', label: 'Organization', href: '/dashboard/organization' },
    { key: 'permits', label: 'Operating Permits', href: '/dashboard/organization/permits' },
  ]

  const handleNavigate = (index, item) => {
    if (item.href) router.push(item.href)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Operating Permits Register</h1>
          <Breadcrumbs items={breadcrumbs} onNavigate={handleNavigate} className="mt-2" />
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading permits...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                    Title of Permit
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Auth. No & Authority
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issue / Expiry
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Renewal Due
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reporting
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {permits.map((permit) => (
                  <tr key={permit.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {permit.title}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{permit.authorizedNumber || '-'}</div>
                      <div className="text-xs text-gray-500">{permit.issuingAuthority}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div>Issue: {formatDateDisplay(permit.dateOfIssue)}</div>
                      <div>Exp: {formatDateDisplay(permit.dateOfExpiry)}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDateDisplay(permit.renewalSubmissionDate)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{permit.reportingFrequency || '-'}</div>
                      <div className="text-xs text-gray-500">Last: {formatDateDisplay(permit.lastReportDate)}</div>
                      <div className="text-xs text-gray-500">{permit.responsiblePerson}</div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(permit)}
                        className="text-blue-600 hover:text-blue-900 font-semibold"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
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
          <Dialog.Panel className="mx-auto max-w-2xl w-full bg-white rounded-xl shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <Dialog.Title className="text-lg font-semibold text-gray-900">
                Edit Permit Details
              </Dialog.Title>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                  Permit Title
                </label>
                <div className="text-lg font-medium text-gray-900">
                  {selectedPermit?.title}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Authorized Number</label>
                  <Input
                    value={formData.authorizedNumber}
                    onChange={(e) => setFormData({ ...formData, authorizedNumber: e.target.value })}
                    placeholder="e.g. ESF-OP-REG-01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issuing Authority</label>
                  <Input
                    value={formData.issuingAuthority}
                    onChange={(e) => setFormData({ ...formData, issuingAuthority: e.target.value })}
                    placeholder="Authority Name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Issue</label>
                  <Input
                    type="date"
                    value={formData.dateOfIssue}
                    onChange={(e) => setFormData({ ...formData, dateOfIssue: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Expiry</label>
                  <Input
                    type="date"
                    value={formData.dateOfExpiry}
                    onChange={(e) => setFormData({ ...formData, dateOfExpiry: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Renewal Due Date</label>
                  <Input
                    type="date"
                    value={formData.renewalSubmissionDate}
                    onChange={(e) => setFormData({ ...formData, renewalSubmissionDate: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reporting Frequency</label>
                  <Input
                    value={formData.reportingFrequency}
                    onChange={(e) => setFormData({ ...formData, reportingFrequency: e.target.value })}
                    placeholder="e.g. Annual, Monthly"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Report Date</label>
                  <Input
                    type="date"
                    value={formData.lastReportDate}
                    onChange={(e) => setFormData({ ...formData, lastReportDate: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Responsible Person</label>
                  <Input
                    value={formData.responsiblePerson}
                    onChange={(e) => setFormData({ ...formData, responsiblePerson: e.target.value })}
                    placeholder="Name"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
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


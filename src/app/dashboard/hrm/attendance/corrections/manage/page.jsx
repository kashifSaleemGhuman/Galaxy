'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import { toast } from '@/components/ui/Toast'
import { ROLES } from '@/lib/constants/roles'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'

export default function ManageCorrectionsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [corrections, setCorrections] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('PENDING')
  const [selectedCorrection, setSelectedCorrection] = useState(null)
  const [reviewNotes, setReviewNotes] = useState('')

  const isHRManager = session?.user?.role === ROLES.HR_MANAGER
  const isSuperAdmin = session?.user?.role === ROLES.SUPER_ADMIN
  const isAdmin = session?.user?.role === ROLES.ADMIN
  const canManage = isHRManager || isSuperAdmin || isAdmin

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'hrm', label: 'HRM', href: '/dashboard/hrm' },
    { key: 'attendance', label: 'Attendance', href: '/dashboard/hrm/attendance/manage' },
    { key: 'corrections', label: 'Correction Requests', href: '/dashboard/hrm/attendance/corrections/manage' },
  ]

  useEffect(() => {
    fetchCorrections()
  }, [filterStatus])

  const fetchCorrections = async () => {
    try {
      setLoading(true)
      let url = '/api/hrm/attendance/corrections'
      if (filterStatus) {
        url += `?status=${filterStatus}`
      }

      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to fetch corrections')
      const data = await res.json()
      setCorrections(data)
    } catch (error) {
      console.error(error)
      toast({
        title: 'Error',
        description: 'Failed to load correction requests',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (correctionId) => {
    if (!confirm('Are you sure you want to approve this correction request?')) return

    try {
      const res = await fetch(`/api/hrm/attendance/corrections/${correctionId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewNotes })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to approve correction')
      }

      toast({
        title: 'Success',
        description: 'Correction request approved'
      })
      
      setSelectedCorrection(null)
      setReviewNotes('')
      fetchCorrections()
    } catch (error) {
      console.error(error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve correction',
        variant: 'destructive'
      })
    }
  }

  const handleReject = async (correctionId) => {
    if (!confirm('Are you sure you want to reject this correction request?')) return

    try {
      const res = await fetch(`/api/hrm/attendance/corrections/${correctionId}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewNotes })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to reject correction')
      }

      toast({
        title: 'Success',
        description: 'Correction request rejected'
      })
      
      setSelectedCorrection(null)
      setReviewNotes('')
      fetchCorrections()
    } catch (error) {
      console.error(error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject correction',
        variant: 'destructive'
      })
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'APPROVED': return 'bg-green-100 text-green-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!canManage) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">You don't have permission to access this page.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Correction Requests</h1>
          <Breadcrumbs items={breadcrumbs} className="mt-2" />
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="max-w-xs">
          <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Corrections Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading correction requests...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested Times</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {corrections.map((correction) => (
                  <tr key={correction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{correction.employee?.name}</div>
                      <div className="text-xs text-gray-500">{correction.employee?.employeeId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(correction.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div>
                        {correction.requestedCheckInTime && (
                          <div>In: {new Date(correction.requestedCheckInTime).toLocaleString()}</div>
                        )}
                        {correction.requestedCheckOutTime && (
                          <div>Out: {new Date(correction.requestedCheckOutTime).toLocaleString()}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                      <div className="truncate" title={correction.reason}>
                        {correction.reason}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(correction.status)}`}>
                        {correction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(correction.requestedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {correction.status === 'PENDING' && (
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => {
                              setSelectedCorrection(correction)
                              setReviewNotes('')
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Review
                          </button>
                        </div>
                      )}
                      {correction.status !== 'PENDING' && correction.reviewNotes && (
                        <div className="text-xs text-gray-500 max-w-xs truncate" title={correction.reviewNotes}>
                          {correction.reviewNotes}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {corrections.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-10 text-center text-gray-500">
                      No correction requests found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedCorrection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Correction Request</h3>
            
            <div className="space-y-4 mb-4">
              <div>
                <div className="text-sm font-medium text-gray-700">Employee</div>
                <div className="text-sm text-gray-900">{selectedCorrection.employee?.name}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700">Date</div>
                <div className="text-sm text-gray-900">{new Date(selectedCorrection.date).toLocaleDateString()}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700">Reason</div>
                <div className="text-sm text-gray-900">{selectedCorrection.reason}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Review Notes</label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional notes for approval/rejection"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedCorrection(null)
                  setReviewNotes('')
                }}
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={() => handleReject(selectedCorrection.id)}
                className="text-red-600 hover:text-red-700"
              >
                <XCircleIcon className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button
                onClick={() => handleApprove(selectedCorrection.id)}
              >
                <CheckCircleIcon className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


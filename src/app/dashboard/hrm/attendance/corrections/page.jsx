'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import BackButton from '@/components/ui/BackButton'
import { toast } from '@/components/ui/Toast'
import { ROLES } from '@/lib/constants/roles'

export default function AttendanceCorrectionsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [corrections, setCorrections] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    date: '',
    requestedCheckInTime: '',
    requestedCheckOutTime: '',
    reason: ''
  })

  const isEmployee = session?.user?.role === ROLES.USER

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'attendance', label: 'Attendance', href: '/dashboard/hrm/attendance' },
    { key: 'corrections', label: 'Request Correction', href: '/dashboard/hrm/attendance/corrections' },
  ]

  useEffect(() => {
    fetchCorrections()
  }, [])

  const fetchCorrections = async () => {
    try {
      const res = await fetch('/api/hrm/attendance/corrections')
      if (res.ok) {
        const data = await res.json()
        setCorrections(data)
      }
    } catch (error) {
      console.error('Error fetching corrections:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.date || !formData.reason) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/hrm/attendance/corrections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: formData.date,
          requestedCheckInTime: formData.requestedCheckInTime || null,
          requestedCheckOutTime: formData.requestedCheckOutTime || null,
          reason: formData.reason
        })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to submit correction request')
      }

      toast({
        title: 'Success',
        description: 'Correction request submitted successfully'
      })
      
      setShowForm(false)
      setFormData({
        date: '',
        requestedCheckInTime: '',
        requestedCheckOutTime: '',
        reason: ''
      })
      fetchCorrections()
    } catch (error) {
      console.error(error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit correction request',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
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

  if (!isEmployee) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">This page is only accessible to employees.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <BackButton href="/dashboard/hrm/attendance" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Request Attendance Correction</h1>
              <Breadcrumbs items={breadcrumbs} className="mt-2" />
            </div>
          </div>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'New Request'}
        </Button>
      </div>

      {/* Request Form */}
      {showForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">New Correction Request</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Requested Check-In Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.requestedCheckInTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, requestedCheckInTime: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Requested Check-Out Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.requestedCheckOutTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, requestedCheckOutTime: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Please provide a reason for this correction request"
                required
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Correction Requests List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">My Correction Requests</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested Times</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Review Notes</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {corrections.map((correction) => (
                <tr key={correction.id} className="hover:bg-gray-50">
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
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {correction.reason}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(correction.status)}`}>
                      {correction.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(correction.requestedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {correction.reviewNotes || '-'}
                  </td>
                </tr>
              ))}
              {corrections.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                    No correction requests found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}


'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import BackButton from '@/components/ui/BackButton'
import { toast } from '@/components/ui/Toast'

export default function MyRequestsPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [replyMessage, setReplyMessage] = useState('')
  const [form, setForm] = useState({
    subject: '',
    message: '',
    priority: 'NORMAL'
  })

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'hrm', label: 'HRM', href: '/dashboard/hrm' },
    { key: 'my-requests', label: 'My Requests', href: '/dashboard/hrm/my-requests' }
  ]

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/hrm/requests')
      if (res.ok) {
        const data = await res.json()
        setRequests(data.requests || [])
      }
    } catch (error) {
      console.error('Error fetching requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!form.subject.trim() || !form.message.trim()) {
      toast({ title: 'Error', description: 'Subject and message are required', variant: 'destructive' })
      return
    }

    try {
      const res = await fetch('/api/hrm/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: form.subject.trim(),
          message: form.message.trim(),
          priority: form.priority
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create request')
      }

      toast({ title: 'Success', description: 'Request created successfully' })
      setShowForm(false)
      setForm({
        subject: '',
        message: '',
        priority: 'NORMAL'
      })
      fetchRequests()
    } catch (error) {
      toast({ title: 'Error', description: error.message || 'Failed to create request', variant: 'destructive' })
    }
  }

  const submitReply = async (requestId) => {
    if (!replyMessage.trim()) {
      toast({ title: 'Error', description: 'Reply message is required', variant: 'destructive' })
      return
    }

    try {
      const res = await fetch(`/api/hrm/requests/${requestId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: replyMessage.trim() })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to add reply')
      }

      toast({ title: 'Success', description: 'Reply added successfully' })
      setReplyMessage('')
      setSelectedRequest(null)
      fetchRequests()
    } catch (error) {
      toast({ title: 'Error', description: error.message || 'Failed to add reply', variant: 'destructive' })
    }
  }

  const viewRequest = async (id) => {
    try {
      const res = await fetch(`/api/hrm/requests/${id}`)
      if (res.ok) {
        const data = await res.json()
        setSelectedRequest(data.request)
      }
    } catch (error) {
      console.error('Error fetching request:', error)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800'
      case 'RESOLVED': return 'bg-green-100 text-green-800'
      case 'CLOSED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-800'
      case 'HIGH': return 'bg-orange-100 text-orange-800'
      case 'NORMAL': return 'bg-blue-100 text-blue-800'
      case 'LOW': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BackButton href="/dashboard/hrm" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Requests</h1>
          <Breadcrumbs items={breadcrumbs} className="mt-2" />
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'New Request'}
        </Button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Request</h2>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => setForm(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Enter request subject"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="LOW">Low</option>
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                rows="5"
                placeholder="Describe your request..."
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit">Submit Request</Button>
            </div>
          </form>
        </div>
      )}

      {/* Requests List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 font-semibold text-gray-900">My Requests</div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Subject</th>
                <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Priority</th>
                <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Status</th>
                <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Created</th>
                <th className="px-4 py-2 text-right text-xs text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {requests.map((request) => (
                <tr key={request.id}>
                  <td className="px-4 py-2 text-sm text-gray-900">{request.subject}</td>
                  <td className="px-4 py-2">
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${getPriorityColor(request.priority)}`}>
                      {request.priority}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => viewRequest(request.id)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                    No requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-900">{selectedRequest.subject}</h2>
              <button
                onClick={() => {
                  setSelectedRequest(null)
                  setReplyMessage('')
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-700">Status: </span>
                <span className={`text-xs font-semibold px-2 py-1 rounded ${getStatusColor(selectedRequest.status)}`}>
                  {selectedRequest.status}
                </span>
                <span className="ml-4 text-sm font-medium text-gray-700">Priority: </span>
                <span className={`text-xs font-semibold px-2 py-1 rounded ${getPriorityColor(selectedRequest.priority)}`}>
                  {selectedRequest.priority}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Message:</p>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedRequest.message}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Conversation:</p>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {selectedRequest.replies?.map((reply, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded ${
                        reply.isFromHr ? 'bg-blue-50 border-l-4 border-blue-500' : 'bg-gray-50 border-l-4 border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-semibold text-gray-700">
                          {reply.isFromHr ? 'HR' : 'You'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(reply.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">{reply.message}</p>
                    </div>
                  ))}
                  {selectedRequest.replies?.length === 0 && (
                    <p className="text-sm text-gray-500">No replies yet.</p>
                  )}
                </div>
              </div>
              {selectedRequest.status !== 'CLOSED' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Add Reply:</label>
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    rows="3"
                    placeholder="Type your reply..."
                  />
                  <div className="mt-2 flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedRequest(null)
                        setReplyMessage('')
                      }}
                    >
                      Close
                    </Button>
                    <Button onClick={() => submitReply(selectedRequest.id)}>Send Reply</Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


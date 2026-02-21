'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import BackButton from '@/components/ui/BackButton'
import { toast } from '@/components/ui/Toast'

export default function PenaltiesPage() {
  const [penalties, setPenalties] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    employeeId: '',
    amount: '',
    reason: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  })
  const [filters, setFilters] = useState({
    employeeId: '',
    status: ''
  })

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'hrm', label: 'HRM', href: '/dashboard/hrm' },
    { key: 'penalties', label: 'Penalties', href: '/dashboard/hrm/penalties' }
  ]

  useEffect(() => {
    bootstrap()
  }, [])

  useEffect(() => {
    fetchPenalties()
  }, [filters])

  const bootstrap = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/organization/employees')
      if (res.ok) {
        const data = await res.json()
        setEmployees(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load employees', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const fetchPenalties = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.employeeId) params.append('employeeId', filters.employeeId)
      if (filters.status) params.append('status', filters.status)

      const res = await fetch(`/api/hrm/penalties?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setPenalties(data.penalties || [])
      }
    } catch (error) {
      console.error('Error fetching penalties:', error)
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!form.employeeId || !form.reason.trim() || !form.date) {
      toast({ title: 'Error', description: 'Employee, reason, and date are required', variant: 'destructive' })
      return
    }

    try {
      const res = await fetch('/api/hrm/penalties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: form.employeeId,
          amount: form.amount ? parseFloat(form.amount) : null,
          reason: form.reason.trim(),
          description: form.description.trim() || null,
          date: form.date
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create penalty')
      }

      toast({ title: 'Success', description: 'Penalty created successfully' })
      setShowForm(false)
      setForm({
        employeeId: '',
        amount: '',
        reason: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      })
      fetchPenalties()
    } catch (error) {
      toast({ title: 'Error', description: error.message || 'Failed to create penalty', variant: 'destructive' })
    }
  }

  const cancelPenalty = async (id) => {
    if (!confirm('Are you sure you want to cancel this penalty?')) return

    try {
      const res = await fetch(`/api/hrm/penalties/${id}`, {
        method: 'PUT'
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to cancel penalty')
      }

      toast({ title: 'Success', description: 'Penalty cancelled successfully' })
      fetchPenalties()
    } catch (error) {
      toast({ title: 'Error', description: error.message || 'Failed to cancel penalty', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BackButton href="/dashboard/hrm" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Penalties Management</h1>
          <Breadcrumbs items={breadcrumbs} className="mt-2" />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
            <select
              value={filters.employeeId}
              onChange={(e) => setFilters(prev => ({ ...prev, employeeId: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">All Employees</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.name} ({emp.employeeId})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Cancel' : 'Add Penalty'}
            </Button>
          </div>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Penalty</h2>
          <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee *</label>
              <select
                value={form.employeeId}
                onChange={(e) => setForm(prev => ({ ...prev, employeeId: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              >
                <option value="">Select employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.name} ({emp.employeeId})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (Optional)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm(prev => ({ ...prev, amount: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
              <input
                type="text"
                value={form.reason}
                onChange={(e) => setForm(prev => ({ ...prev, reason: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Enter reason for penalty"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                rows="3"
                placeholder="Additional details..."
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit">Create Penalty</Button>
            </div>
          </form>
        </div>
      )}

      {/* Penalties List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 font-semibold text-gray-900">Penalties</div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Employee</th>
                <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Date</th>
                <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Reason</th>
                <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Status</th>
                <th className="px-4 py-2 text-right text-xs text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {penalties.map((penalty) => (
                <tr key={penalty.id}>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {penalty.employee?.name} ({penalty.employee?.employeeId})
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {new Date(penalty.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {penalty.amount ? `PKR ${Number(penalty.amount).toFixed(2)}` : 'N/A'}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">{penalty.reason}</td>
                  <td className="px-4 py-2">
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      penalty.status === 'ACTIVE' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {penalty.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    {penalty.status === 'ACTIVE' && (
                      <button
                        onClick={() => cancelPenalty(penalty.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {penalties.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    No penalties found.
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


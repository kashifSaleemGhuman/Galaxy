'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import BackButton from '@/components/ui/BackButton'
import { toast } from '@/components/ui/Toast'
import { ROLES } from '@/lib/constants/roles'
import { PlusIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'

export default function BonusesPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [bonuses, setBonuses] = useState([])
  const [loading, setLoading] = useState(true)
  const [employees, setEmployees] = useState([])
  const [periods, setPeriods] = useState([])
  const [filters, setFilters] = useState({
    employeeId: '',
    payrollPeriodId: '',
    status: ''
  })
  const [showModal, setShowModal] = useState(false)

  const isHRManager = session?.user?.role === ROLES.HR_MANAGER
  const isSuperAdmin = session?.user?.role === ROLES.SUPER_ADMIN
  const isAdmin = session?.user?.role === ROLES.ADMIN
  const canManage = isHRManager || isSuperAdmin || isAdmin

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'hrm', label: 'HRM', href: '/dashboard/hrm' },
    { key: 'payroll', label: 'Payroll', href: '/dashboard/hrm/payroll' },
    { key: 'bonuses', label: 'Bonuses', href: '/dashboard/hrm/payroll/bonuses' },
  ]

  useEffect(() => {
    fetchEmployees()
    fetchPeriods()
    fetchBonuses()
  }, [filters])

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/organization/employees')
      if (res.ok) {
        const data = await res.json()
        setEmployees(data.filter(e => !e.dateOfLeaving))
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
    }
  }

  const fetchPeriods = async () => {
    try {
      const res = await fetch('/api/hrm/payroll/periods')
      if (res.ok) {
        const data = await res.json()
        setPeriods(data)
      }
    } catch (error) {
      console.error('Error fetching periods:', error)
    }
  }

  const fetchBonuses = async () => {
    try {
      setLoading(true)
      let url = '/api/hrm/payroll/bonuses?'
      const params = new URLSearchParams()
      if (filters.employeeId) params.append('employeeId', filters.employeeId)
      if (filters.payrollPeriodId) params.append('payrollPeriodId', filters.payrollPeriodId)
      if (filters.status) params.append('status', filters.status)
      url += params.toString()

      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setBonuses(data)
      }
    } catch (error) {
      console.error('Error fetching bonuses:', error)
      toast({
        title: 'Error',
        description: 'Failed to load bonuses',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id) => {
    try {
      const res = await fetch(`/api/hrm/payroll/bonuses/${id}/approve`, {
        method: 'POST'
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to approve')
      }

      toast({
        title: 'Success',
        description: 'Bonus approved successfully'
      })

      fetchBonuses()
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'APPROVED': return 'bg-green-100 text-green-800'
      case 'PAID': return 'bg-blue-100 text-blue-800'
      case 'CANCELLED': return 'bg-gray-100 text-gray-800'
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
          <div className="flex items-center gap-3">
            <BackButton href="/dashboard/hrm/payroll" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bonuses</h1>
              <Breadcrumbs items={breadcrumbs} className="mt-2" />
            </div>
          </div>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          New Bonus
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
            <select
              value={filters.employeeId}
              onChange={(e) => setFilters(prev => ({ ...prev, employeeId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Employees</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.employeeId})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
            <select
              value={filters.payrollPeriodId}
              onChange={(e) => setFilters(prev => ({ ...prev, payrollPeriodId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Periods</option>
              {periods.map((period) => (
                <option key={period.id} value={period.id}>
                  {period.periodName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="PAID">Paid</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bonuses Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading bonuses...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bonus Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bonuses.map((bonus) => (
                  <tr key={bonus.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{bonus.employee.name}</div>
                      <div className="text-xs text-gray-500">{bonus.employee.employeeId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bonus.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {formatCurrency(Number(bonus.amount))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {bonus.payrollPeriod ? bonus.payrollPeriod.periodName : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(bonus.status)}`}>
                        {bonus.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {bonus.status === 'PENDING' && (
                        <button
                          onClick={() => handleApprove(bonus.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Approve"
                        >
                          <CheckCircleIcon className="h-5 w-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {bonuses.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                      No bonuses found. Click "New Bonus" to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <BonusModal
          employees={employees}
          periods={periods}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            fetchBonuses()
            setShowModal(false)
          }}
        />
      )}
    </div>
  )
}

// Bonus Modal Component
function BonusModal({ employees, periods, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    employeeId: '',
    payrollPeriodId: '',
    name: '',
    amount: '',
    type: 'ONE_TIME',
    notes: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/hrm/payroll/bonuses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          payrollPeriodId: formData.payrollPeriodId || null
        })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to create bonus')
      }

      toast({
        title: 'Success',
        description: 'Bonus created successfully'
      })

      onSuccess()
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Create Bonus</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee *</label>
            <select
              value={formData.employeeId}
              onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Employee</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.employeeId})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bonus Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Performance Bonus"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ONE_TIME">One Time</option>
                <option value="RECURRING">Recurring</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payroll Period (Optional)</label>
            <select
              value={formData.payrollPeriodId}
              onChange={(e) => setFormData(prev => ({ ...prev, payrollPeriodId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Period</option>
              {periods.map(period => (
                <option key={period.id} value={period.id}>
                  {period.periodName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Create Bonus
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}


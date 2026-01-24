'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import BackButton from '@/components/ui/BackButton'
import { toast } from '@/components/ui/Toast'
import { ROLES } from '@/lib/constants/roles'
import { PlusIcon, PencilIcon, UserPlusIcon } from '@heroicons/react/24/outline'

export default function LeavePoliciesPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [policies, setPolicies] = useState([])
  const [leaveTypes, setLeaveTypes] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showAssignForm, setShowAssignForm] = useState(false)
  const [selectedPolicyId, setSelectedPolicyId] = useState(null)
  const [formData, setFormData] = useState({
    leaveTypeId: '',
    name: '',
    accrualType: 'MONTHLY',
    accrualAmount: '',
    accrualFrequency: '',
    maxBalance: '',
    allowNegativeBalance: false,
    carryForwardEnabled: false,
    carryForwardLimit: '',
    carryForwardExpiryMonths: '',
    encashmentEnabled: false,
    encashmentLimit: '',
    effectiveFrom: new Date().toISOString().split('T')[0]
  })
  const [assignData, setAssignData] = useState({
    employeeId: '',
    effectiveFrom: new Date().toISOString().split('T')[0],
    effectiveTo: ''
  })

  const isHRManager = session?.user?.role === ROLES.HR_MANAGER
  const isSuperAdmin = session?.user?.role === ROLES.SUPER_ADMIN
  const isAdmin = session?.user?.role === ROLES.ADMIN
  const canManage = isHRManager || isSuperAdmin || isAdmin

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'hrm', label: 'HRM', href: '/dashboard/hrm' },
    { key: 'leave', label: 'Leave', href: '/dashboard/hrm/leave/manage' },
    { key: 'policies', label: 'Leave Policies', href: '/dashboard/hrm/leave/policies' },
  ]

  useEffect(() => {
    fetchPolicies()
    fetchLeaveTypes()
    fetchEmployees()
  }, [])

  const fetchPolicies = async () => {
    try {
      const res = await fetch('/api/hrm/leave/policies?isActive=true')
      if (res.ok) {
        const data = await res.json()
        setPolicies(data)
      }
    } catch (error) {
      console.error('Error fetching policies:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLeaveTypes = async () => {
    try {
      const res = await fetch('/api/hrm/leave/types?isActive=true')
      if (res.ok) {
        const data = await res.json()
        setLeaveTypes(data)
      }
    } catch (error) {
      console.error('Error fetching leave types:', error)
    }
  }

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/organization/employees')
      if (res.ok) {
        const data = await res.json()
        setEmployees(data)
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
    }
  }

  const handleAssignPolicy = (policyId) => {
    setSelectedPolicyId(policyId)
    setShowAssignForm(true)
  }

  const handleAssignSubmit = async (e) => {
    e.preventDefault()

    if (!selectedPolicyId || !assignData.employeeId) {
      toast({
        title: 'Error',
        description: 'Please select employee',
        variant: 'destructive'
      })
      return
    }

    try {
      const res = await fetch('/api/hrm/leave/policies/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          policyId: selectedPolicyId,
          employeeId: assignData.employeeId,
          effectiveFrom: assignData.effectiveFrom,
          effectiveTo: assignData.effectiveTo || null
        })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to assign policy')
      }

      toast({
        title: 'Success',
        description: 'Leave policy assigned successfully'
      })

      setShowAssignForm(false)
      setSelectedPolicyId(null)
      setAssignData({
        employeeId: '',
        effectiveFrom: new Date().toISOString().split('T')[0],
        effectiveTo: ''
      })
    } catch (error) {
      console.error(error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to assign policy',
        variant: 'destructive'
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.leaveTypeId || !formData.name || !formData.accrualType || !formData.accrualAmount) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      })
      return
    }

    try {
      const res = await fetch('/api/hrm/leave/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          accrualAmount: parseFloat(formData.accrualAmount),
          accrualFrequency: formData.accrualFrequency ? parseInt(formData.accrualFrequency) : null,
          maxBalance: formData.maxBalance ? parseFloat(formData.maxBalance) : null,
          carryForwardLimit: formData.carryForwardLimit ? parseFloat(formData.carryForwardLimit) : null,
          carryForwardExpiryMonths: formData.carryForwardExpiryMonths ? parseInt(formData.carryForwardExpiryMonths) : null,
          encashmentLimit: formData.encashmentLimit ? parseFloat(formData.encashmentLimit) : null
        })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to create policy')
      }

      toast({
        title: 'Success',
        description: 'Leave policy created'
      })

      setShowForm(false)
      setFormData({
        leaveTypeId: '',
        name: '',
        accrualType: 'MONTHLY',
        accrualAmount: '',
        accrualFrequency: '',
        maxBalance: '',
        allowNegativeBalance: false,
        carryForwardEnabled: false,
        carryForwardLimit: '',
        carryForwardExpiryMonths: '',
        encashmentEnabled: false,
        encashmentLimit: '',
        effectiveFrom: new Date().toISOString().split('T')[0]
      })
      fetchPolicies()
    } catch (error) {
      console.error(error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to create policy',
        variant: 'destructive'
      })
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
            <BackButton href="/dashboard/hrm/leave" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Leave Policies</h1>
              <Breadcrumbs items={breadcrumbs} className="mt-2" />
            </div>
          </div>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          New Policy
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create Leave Policy</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Leave Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.leaveTypeId}
                  onChange={(e) => setFormData(prev => ({ ...prev, leaveTypeId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Leave Type</option>
                  {leaveTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name} ({type.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Policy Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Accrual Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.accrualType}
                  onChange={(e) => setFormData(prev => ({ ...prev, accrualType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="NONE">None</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="YEARLY">Yearly</option>
                  <option value="CUSTOM">Custom</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Accrual Amount (days) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.accrualAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, accrualAmount: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              {formData.accrualType === 'CUSTOM' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Frequency (months)
                  </label>
                  <input
                    type="number"
                    value={formData.accrualFrequency}
                    onChange={(e) => setFormData(prev => ({ ...prev, accrualFrequency: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Balance (days)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.maxBalance}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxBalance: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Effective From <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.effectiveFrom}
                  onChange={(e) => setFormData(prev => ({ ...prev, effectiveFrom: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.allowNegativeBalance}
                  onChange={(e) => setFormData(prev => ({ ...prev, allowNegativeBalance: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Allow Negative Balance</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.carryForwardEnabled}
                  onChange={(e) => setFormData(prev => ({ ...prev, carryForwardEnabled: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Enable Carry Forward</span>
              </label>
              {formData.carryForwardEnabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Carry Forward Limit (days)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.carryForwardLimit}
                      onChange={(e) => setFormData(prev => ({ ...prev, carryForwardLimit: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry (months)
                    </label>
                    <input
                      type="number"
                      value={formData.carryForwardExpiryMonths}
                      onChange={(e) => setFormData(prev => ({ ...prev, carryForwardExpiryMonths: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.encashmentEnabled}
                  onChange={(e) => setFormData(prev => ({ ...prev, encashmentEnabled: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Enable Encashment</span>
              </label>
              {formData.encashmentEnabled && (
                <div className="ml-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Encashment Limit (days)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.encashmentLimit}
                    onChange={(e) => setFormData(prev => ({ ...prev, encashmentLimit: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Policy</Button>
            </div>
          </form>
        </div>
      )}

      {/* Policies List */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading policies...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Leave Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Policy Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Accrual</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Max Balance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Carry Forward</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Effective From</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {policies.map((policy) => (
                  <tr key={policy.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{policy.leaveType.name}</div>
                      <div className="text-xs text-gray-500">{policy.leaveType.code}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {policy.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {policy.accrualType} - {Number(policy.accrualAmount)} days
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {policy.maxBalance ? `${Number(policy.maxBalance)} days` : 'Unlimited'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {policy.carryForwardEnabled ? 'Yes' : 'No'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(policy.effectiveFrom).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAssignPolicy(policy.id)}
                      >
                        <UserPlusIcon className="h-4 w-4 mr-1" />
                        Assign
                      </Button>
                    </td>
                  </tr>
                ))}
                {policies.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-10 text-center text-gray-500">
                      No leave policies found. Create your first policy to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assign Policy Form */}
      {showAssignForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Assign Leave Policy to Employee</h2>
          <form onSubmit={handleAssignSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee <span className="text-red-500">*</span>
                </label>
                <select
                  value={assignData.employeeId}
                  onChange={(e) => setAssignData(prev => ({ ...prev, employeeId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.employeeId})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Policy
                </label>
                <input
                  type="text"
                  value={policies.find(p => p.id === selectedPolicyId)?.name || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Effective From <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={assignData.effectiveFrom}
                  onChange={(e) => setAssignData(prev => ({ ...prev, effectiveFrom: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Effective To (optional)
                </label>
                <input
                  type="date"
                  value={assignData.effectiveTo}
                  onChange={(e) => setAssignData(prev => ({ ...prev, effectiveTo: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => {
                setShowAssignForm(false)
                setSelectedPolicyId(null)
              }}>
                Cancel
              </Button>
              <Button type="submit">Assign Policy</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}


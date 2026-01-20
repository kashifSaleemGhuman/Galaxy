'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import { toast } from '@/components/ui/Toast'
import { ROLES } from '@/lib/constants/roles'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

export default function ShiftsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [shifts, setShifts] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [showShiftForm, setShowShiftForm] = useState(false)
  const [showAssignForm, setShowAssignForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    startTime: '09:00',
    endTime: '18:00',
    gracePeriodMinutes: 15,
    breakDurationMinutes: 60,
    halfDayThresholdHours: 4.0
  })
  const [assignData, setAssignData] = useState({
    employeeId: '',
    shiftId: '',
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
    { key: 'shifts', label: 'Shifts', href: '/dashboard/hrm/shifts' },
  ]

  useEffect(() => {
    fetchShifts()
    fetchEmployees()
  }, [])

  const fetchShifts = async () => {
    try {
      const res = await fetch('/api/hrm/shifts')
      if (res.ok) {
        const data = await res.json()
        setShifts(data)
      }
    } catch (error) {
      console.error('Error fetching shifts:', error)
    } finally {
      setLoading(false)
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

  const handleCreateShift = async (e) => {
    e.preventDefault()
    
    try {
      const res = await fetch('/api/hrm/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to create shift')
      }

      toast({
        title: 'Success',
        description: 'Shift created successfully'
      })
      
      setShowShiftForm(false)
      setFormData({
        name: '',
        startTime: '09:00',
        endTime: '18:00',
        gracePeriodMinutes: 15,
        breakDurationMinutes: 60,
        halfDayThresholdHours: 4.0
      })
      fetchShifts()
    } catch (error) {
      console.error(error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to create shift',
        variant: 'destructive'
      })
    }
  }

  const handleAssignShift = async (e) => {
    e.preventDefault()
    
    if (!assignData.employeeId || !assignData.shiftId) {
      toast({
        title: 'Error',
        description: 'Please select employee and shift',
        variant: 'destructive'
      })
      return
    }

    try {
      const res = await fetch('/api/hrm/shifts/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignData)
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to assign shift')
      }

      toast({
        title: 'Success',
        description: 'Shift assigned successfully'
      })
      
      setShowAssignForm(false)
      setAssignData({
        employeeId: '',
        shiftId: '',
        effectiveFrom: new Date().toISOString().split('T')[0],
        effectiveTo: ''
      })
    } catch (error) {
      console.error(error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to assign shift',
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
          <h1 className="text-2xl font-bold text-gray-900">Shift Management</h1>
          <Breadcrumbs items={breadcrumbs} className="mt-2" />
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setShowAssignForm(!showAssignForm)} variant="outline">
            Assign Shift
          </Button>
          <Button onClick={() => setShowShiftForm(!showShiftForm)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            New Shift
          </Button>
        </div>
      </div>

      {/* Create Shift Form */}
      {showShiftForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Shift</h2>
          <form onSubmit={handleCreateShift} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shift Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grace Period (minutes)
                </label>
                <input
                  type="number"
                  value={formData.gracePeriodMinutes}
                  onChange={(e) => setFormData(prev => ({ ...prev, gracePeriodMinutes: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Break Duration (minutes)
                </label>
                <input
                  type="number"
                  value={formData.breakDurationMinutes}
                  onChange={(e) => setFormData(prev => ({ ...prev, breakDurationMinutes: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Half-Day Threshold (hours)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.halfDayThresholdHours}
                  onChange={(e) => setFormData(prev => ({ ...prev, halfDayThresholdHours: parseFloat(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setShowShiftForm(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Shift</Button>
            </div>
          </form>
        </div>
      )}

      {/* Assign Shift Form */}
      {showAssignForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Assign Shift to Employee</h2>
          <form onSubmit={handleAssignShift} className="space-y-4">
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
                  Shift <span className="text-red-500">*</span>
                </label>
                <select
                  value={assignData.shiftId}
                  onChange={(e) => setAssignData(prev => ({ ...prev, shiftId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Shift</option>
                  {shifts.map((shift) => (
                    <option key={shift.id} value={shift.id}>
                      {shift.name} ({shift.startTime} - {shift.endTime})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Effective From
                </label>
                <input
                  type="date"
                  value={assignData.effectiveFrom}
                  onChange={(e) => setAssignData(prev => ({ ...prev, effectiveFrom: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <Button type="button" variant="outline" onClick={() => setShowAssignForm(false)}>
                Cancel
              </Button>
              <Button type="submit">Assign Shift</Button>
            </div>
          </form>
        </div>
      )}

      {/* Shifts List */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading shifts...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grace Period</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Break Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Half-Day Threshold</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {shifts.map((shift) => (
                  <tr key={shift.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {shift.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {shift.startTime} - {shift.endTime}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {shift.gracePeriodMinutes} minutes
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {shift.breakDurationMinutes} minutes
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {shift.halfDayThresholdHours} hours
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        shift.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {shift.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
                {shifts.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                      No shifts found. Create your first shift to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}


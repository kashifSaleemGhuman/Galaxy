'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import BackButton from '@/components/ui/BackButton'
import { toast } from '@/components/ui/Toast'
import { ROLES } from '@/lib/constants/roles'
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline'

export default function ManageAttendancePage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [attendance, setAttendance] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    employeeId: '',
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    status: ''
  })

  const isHRManager = session?.user?.role === ROLES.HR_MANAGER
  const isSuperAdmin = session?.user?.role === ROLES.SUPER_ADMIN
  const isAdmin = session?.user?.role === ROLES.ADMIN
  const canManage = isHRManager || isSuperAdmin || isAdmin

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'hrm', label: 'HRM', href: '/dashboard/hrm' },
    { key: 'attendance', label: 'Attendance Management', href: '/dashboard/hrm/attendance/manage' },
  ]

  useEffect(() => {
    fetchEmployees()
    fetchAttendance()
  }, [filters])

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

  const fetchAttendance = async () => {
    try {
      setLoading(true)
      let url = '/api/hrm/attendance?'
      const params = new URLSearchParams()
      if (filters.employeeId) params.append('employeeId', filters.employeeId)
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)
      if (filters.status) params.append('status', filters.status)
      url += params.toString()

      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to fetch attendance')
      const data = await res.json()
      setAttendance(data)
    } catch (error) {
      console.error(error)
      toast({
        title: 'Error',
        description: 'Failed to load attendance',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'PRESENT': return 'bg-green-100 text-green-800'
      case 'LATE': return 'bg-yellow-100 text-yellow-800'
      case 'HALF_DAY': return 'bg-orange-100 text-orange-800'
      case 'ABSENT': return 'bg-red-100 text-red-800'
      case 'LEAVE': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatTime = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const formatDuration = (minutes) => {
    if (!minutes) return '0h'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
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
            <BackButton href="/dashboard/hrm/attendance" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
              <Breadcrumbs items={breadcrumbs} className="mt-2" />
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => router.push('/dashboard/hrm/attendance/corrections/manage')}>
            Review Corrections
          </Button>
          <Button onClick={() => router.push('/dashboard/hrm/shifts')} variant="outline">
            Manage Shifts
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="PRESENT">Present</option>
              <option value="LATE">Late</option>
              <option value="HALF_DAY">Half Day</option>
              <option value="ABSENT">Absent</option>
              <option value="LEAVE">Leave</option>
            </select>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading attendance...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shift</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check In</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check Out</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Worked</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Late</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Overtime</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Locked</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendance.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{record.employee?.name}</div>
                      <div className="text-xs text-gray-500">{record.employee?.employeeId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.shift?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatTime(record.checkInTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatTime(record.checkOutTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDuration(record.workedMinutes)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.lateMinutes > 0 ? `${record.lateMinutes}m` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.overtimeMinutes > 0 ? formatDuration(record.overtimeMinutes) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(record.status)}`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.isLocked ? (
                        <span className="text-red-600">Locked</span>
                      ) : (
                        <span className="text-green-600">Open</span>
                      )}
                    </td>
                  </tr>
                ))}
                {attendance.length === 0 && (
                  <tr>
                    <td colSpan="10" className="px-6 py-10 text-center text-gray-500">
                      No attendance records found
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


'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import BackButton from '@/components/ui/BackButton'
import { toast } from '@/components/ui/Toast'
import { ClockIcon, CheckCircleIcon, XCircleIcon, CalendarIcon } from '@heroicons/react/24/outline'
import { ROLES } from '@/lib/constants/roles'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function AttendancePage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [todayEvents, setTodayEvents] = useState([])
  const [canCheckIn, setCanCheckIn] = useState(false)
  const [canCheckOut, setCanCheckOut] = useState(false)
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [attendance, setAttendance] = useState([])
  const [summary, setSummary] = useState(null)

  const userRole = session?.user?.role
  const isEmployee = userRole === ROLES.USER
  const isHR = userRole === ROLES.SUPER_ADMIN || userRole === ROLES.ADMIN || userRole === ROLES.HR_MANAGER
  const canAccess = isEmployee || isHR

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'attendance', label: isEmployee ? 'My Attendance' : 'Attendance', href: '/dashboard/hrm/attendance' },
  ]

  useEffect(() => {
    if (canAccess) {
      if (isEmployee) {
        fetchTodayStatus()
        fetchAttendance()
      } else {
        fetchAllAttendance()
      }
    }
  }, [canAccess, isEmployee])

  const fetchTodayStatus = async () => {
    try {
      const res = await fetch('/api/hrm/attendance/my-attendance?limit=1')
      if (res.ok) {
        const data = await res.json()
        setTodayEvents(data.todayEvents || [])
        
        const hasCheckIn = data.todayEvents?.some(e => e.eventType === 'CHECK_IN')
        const hasCheckOut = data.todayEvents?.some(e => e.eventType === 'CHECK_OUT')
        
        setCanCheckIn(!hasCheckIn)
        setCanCheckOut(hasCheckIn && !hasCheckOut)
      }
    } catch (error) {
      console.error('Error fetching today status:', error)
    }
  }

  const fetchAttendance = async () => {
    try {
      setPageLoading(true)
      const res = await fetch('/api/hrm/attendance/my-attendance?limit=30')
      if (res.ok) {
        const data = await res.json()
        setAttendance(data.attendance || [])
        setSummary(data.summary || null)
      }
    } catch (error) {
      console.error('Error fetching attendance:', error)
    } finally {
      setPageLoading(false)
    }
  }

  const fetchAllAttendance = async () => {
    try {
      setPageLoading(true)
      const res = await fetch('/api/hrm/attendance?limit=30')
      if (res.ok) {
        const data = await res.json()
        setAttendance(data || [])
      }
    } catch (error) {
      console.error('Error fetching attendance:', error)
      toast({
        title: 'Error',
        description: 'Failed to load attendance data',
        variant: 'destructive'
      })
    } finally {
      setPageLoading(false)
    }
  }

  const handleCheckIn = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/hrm/attendance/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to check in')
      }

      const data = await res.json()
      
      toast({
        title: 'Success',
        description: 'Checked in successfully'
      })
      
      fetchTodayStatus()
      fetchAttendance()
    } catch (error) {
      console.error(error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to check in',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCheckOut = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/hrm/attendance/check-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to check out')
      }

      const data = await res.json()
      
      toast({
        title: 'Success',
        description: 'Checked out successfully'
      })
      
      fetchTodayStatus()
      fetchAttendance()
    } catch (error) {
      console.error(error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to check out',
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

  if (!canAccess) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">This page is only accessible to employees and HR managers.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BackButton href="/dashboard/hrm" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isEmployee ? 'My Attendance' : 'Attendance'}</h1>
          <Breadcrumbs items={breadcrumbs} className="mt-2" />
          {isHR && (
            <div className="mt-2">
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/hrm/attendance/manage')}
              >
                Manage Attendance
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Check In/Out Card - Only for employees */}
      {isEmployee && (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Today's Attendance</h2>
            <div className="space-y-2">
              {todayEvents.find(e => e.eventType === 'CHECK_IN') && (
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                  <span>Checked in at {formatTime(todayEvents.find(e => e.eventType === 'CHECK_IN')?.timestamp)}</span>
                </div>
              )}
              {todayEvents.find(e => e.eventType === 'CHECK_OUT') && (
                <div className="flex items-center text-sm text-gray-600">
                  <XCircleIcon className="h-5 w-5 text-red-500 mr-2" />
                  <span>Checked out at {formatTime(todayEvents.find(e => e.eventType === 'CHECK_OUT')?.timestamp)}</span>
                </div>
              )}
              {todayEvents.length === 0 && (
                <p className="text-sm text-gray-500">No attendance recorded for today</p>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleCheckIn}
              disabled={!canCheckIn || loading}
              variant={canCheckIn ? 'default' : 'outline'}
            >
              <ClockIcon className="h-4 w-4 mr-2" />
              Check In
            </Button>
            <Button
              onClick={handleCheckOut}
              disabled={!canCheckOut || loading}
              variant={canCheckOut ? 'default' : 'outline'}
            >
              <ClockIcon className="h-4 w-4 mr-2" />
              Check Out
            </Button>
          </div>
        </div>
      </div>
      )}

      {/* Summary Cards - Only for employees */}
      {isEmployee && summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm text-gray-500">Total Days</div>
            <div className="text-2xl font-bold text-gray-900">{summary.totalDays}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm text-gray-500">Present</div>
            <div className="text-2xl font-bold text-green-600">{summary.present}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm text-gray-500">Late</div>
            <div className="text-2xl font-bold text-yellow-600">{summary.late}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm text-gray-500">Absent</div>
            <div className="text-2xl font-bold text-red-600">{summary.absent}</div>
          </div>
        </div>
      )}

      {/* Attendance History */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Attendance History</h2>
        </div>
        {pageLoading ? (
          <LoadingSpinner size="lg" text="Loading attendance history..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {isHR && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check In</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check Out</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Worked</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Late</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Overtime</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendance.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  {isHR && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{record.employee?.name || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{record.employee?.employeeId || ''}</div>
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(record.date).toLocaleDateString()}
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
                </tr>
              ))}
              {attendance.length === 0 && (
                <tr>
                  <td colSpan={isHR ? "8" : "7"} className="px-6 py-10 text-center text-gray-500">
                    No attendance records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        )}
      </div>

      {/* Actions - Only for employees */}
      {isEmployee && (
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/hrm/attendance/corrections')}
        >
          Request Correction
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/hrm/attendance/history')}
        >
          View Full History
        </Button>
      </div>
      )}
    </div>
  )
}


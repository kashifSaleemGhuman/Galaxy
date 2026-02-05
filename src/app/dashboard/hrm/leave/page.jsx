'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import BackButton from '@/components/ui/BackButton'
import { toast } from '@/components/ui/Toast'
import { ROLES } from '@/lib/constants/roles'
import { PlusIcon, CalendarIcon, ClockIcon } from '@heroicons/react/24/outline'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function LeavePage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [requests, setRequests] = useState([])
  const [balances, setBalances] = useState([])
  const [loading, setLoading] = useState(true)

  const userRole = session?.user?.role
  const isEmployee = userRole === ROLES.USER
  const isHR = userRole === ROLES.SUPER_ADMIN || userRole === ROLES.ADMIN || userRole === ROLES.HR_MANAGER
  const canAccess = isEmployee || isHR

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'leave', label: isEmployee ? 'My Leave' : 'Leave Management', href: '/dashboard/hrm/leave' },
  ]

  useEffect(() => {
    if (canAccess) {
      fetchData()
    }
  }, [canAccess])

  const fetchData = async () => {
    try {
      setLoading(true)
      const requestsUrl = isEmployee 
        ? '/api/hrm/leave/requests'
        : '/api/hrm/leave/requests' // HR can see all, API handles filtering
      
      const [requestsRes, balancesRes] = await Promise.all([
        fetch(requestsUrl),
        isEmployee ? fetch('/api/hrm/leave/balances') : Promise.resolve({ ok: false }) // Balances only for employees
      ])

      // Handle requests - always set data, even if empty
      if (requestsRes.ok) {
        const requestsData = await requestsRes.json()
        setRequests(Array.isArray(requestsData) ? requestsData : [])
      } else if (requestsRes.status >= 500) {
        // Only show error for server errors
        throw new Error('Failed to fetch leave requests')
      } else {
        // For 4xx errors, set empty array
        setRequests([])
      }

      // Handle balances - only for employees
      if (isEmployee && balancesRes.ok) {
        const balancesData = await balancesRes.json()
        setBalances(Array.isArray(balancesData) ? balancesData : [])
      } else if (isEmployee && balancesRes.status >= 500) {
        // Only log server errors, don't show toast for empty data
        console.error('Error fetching balances:', balancesRes.status)
        setBalances([])
      } else if (isEmployee) {
        // For 4xx or empty responses, set empty array
        setBalances([])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      // Only show toast for actual errors, not for empty data
      if (error.message && !error.message.includes('not found')) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to load leave data',
          variant: 'destructive'
        })
      }
      // Set empty arrays to prevent UI issues
      setRequests([])
      if (isEmployee) {
        setBalances([])
      }
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'APPROVED': return 'bg-green-100 text-green-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      case 'CANCELLED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BackButton href="/dashboard/hrm" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{isEmployee ? 'My Leave' : 'Leave Management'}</h1>
            <Breadcrumbs items={breadcrumbs} className="mt-2" />
            {isHR && (
              <div className="mt-2 flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/hrm/leave/manage')}
              >
                Manage Leave
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/hrm/leave/types')}
              >
                Leave Types
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/hrm/leave/policies')}
              >
                Leave Policies
              </Button>
            </div>
          )}
          </div>
        </div>
        {isEmployee && (
          <Button onClick={() => router.push('/dashboard/hrm/leave/request')}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Request Leave
          </Button>
        )}
      </div>

      {/* Leave Balances - Only for employees */}
      {isEmployee && (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {balances.map((balance) => (
          <div key={balance.leaveTypeId} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">{balance.leaveTypeName}</div>
                <div className="text-2xl font-bold text-gray-900 mt-1">
                  {balance.currentBalance.toFixed(1)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {balance.isPaid ? 'Paid Leave' : 'Unpaid Leave'}
                </div>
              </div>
              <CalendarIcon className="h-8 w-8 text-blue-500" />
            </div>
          </div>
        ))}
        {balances.length === 0 && !loading && (
          <div className="col-span-3 text-center text-gray-500 py-8">
            No leave balances available
          </div>
        )}
      </div>
      )}

      {/* Leave Requests */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{isEmployee ? 'My Leave Requests' : 'All Leave Requests'}</h2>
        </div>
        {loading ? (
          <LoadingSpinner size="lg" text="Loading leave requests..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {isHR && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Leave Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    {isHR && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{request.employee?.name || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{request.employee?.employeeId || ''}</div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{request.leaveType?.name || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{request.leaveType?.code || ''}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(request.startDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(request.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {Number(request.days)} days
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(request.requestedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {isEmployee && request.status === 'PENDING' && (
                        <button
                          onClick={async () => {
                            if (confirm('Are you sure you want to cancel this leave request?')) {
                              try {
                                const res = await fetch(`/api/hrm/leave/requests/${request.id}`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ cancellationReason: 'Cancelled by employee' })
                                })
                                if (res.ok) {
                                  toast({ title: 'Success', description: 'Leave request cancelled' })
                                  fetchData()
                                }
                              } catch (error) {
                                toast({ title: 'Error', description: 'Failed to cancel request', variant: 'destructive' })
                              }
                            }
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          Cancel
                        </button>
                      )}
                      {isHR && request.status === 'PENDING' && (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={async () => {
                              try {
                                const res = await fetch(`/api/hrm/leave/requests/${request.id}/approve`, {
                                  method: 'POST'
                                })
                                if (res.ok) {
                                  toast({ title: 'Success', description: 'Leave request approved' })
                                  fetchData()
                                }
                              } catch (error) {
                                toast({ title: 'Error', description: 'Failed to approve request', variant: 'destructive' })
                              }
                            }}
                            className="text-green-600 hover:text-green-900"
                          >
                            Approve
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                const res = await fetch(`/api/hrm/leave/requests/${request.id}/reject`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ rejectionReason: 'Rejected by HR' })
                                })
                                if (res.ok) {
                                  toast({ title: 'Success', description: 'Leave request rejected' })
                                  fetchData()
                                }
                              } catch (error) {
                                toast({ title: 'Error', description: 'Failed to reject request', variant: 'destructive' })
                              }
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {requests.length === 0 && (
                  <tr>
                    <td colSpan={isHR ? "8" : "7"} className="px-6 py-10 text-center text-gray-500">
                      No leave requests found
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


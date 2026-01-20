'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
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

  const isEmployee = session?.user?.role === ROLES.USER

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'leave', label: 'Leave', href: '/dashboard/hrm/leave' },
  ]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [requestsRes, balancesRes] = await Promise.all([
        fetch('/api/hrm/leave/requests'),
        fetch('/api/hrm/leave/balances')
      ])

      if (requestsRes.ok) {
        const requestsData = await requestsRes.json()
        setRequests(requestsData)
      }

      if (balancesRes.ok) {
        const balancesData = await balancesRes.json()
        setBalances(balancesData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
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
          <h1 className="text-2xl font-bold text-gray-900">My Leave</h1>
          <Breadcrumbs items={breadcrumbs} className="mt-2" />
        </div>
        <Button onClick={() => router.push('/dashboard/hrm/leave/request')}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Request Leave
        </Button>
      </div>

      {/* Leave Balances */}
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

      {/* Leave Requests */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">My Leave Requests</h2>
        </div>
        {loading ? (
          <LoadingSpinner size="lg" text="Loading leave requests..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{request.leaveType.name}</div>
                      <div className="text-xs text-gray-500">{request.leaveType.code}</div>
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
                      {request.status === 'PENDING' && (
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
                    </td>
                  </tr>
                ))}
                {requests.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-10 text-center text-gray-500">
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


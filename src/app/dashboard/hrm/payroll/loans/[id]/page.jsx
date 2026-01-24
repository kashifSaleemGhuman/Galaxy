'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import BackButton from '@/components/ui/BackButton'
import { toast } from '@/components/ui/Toast'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { ROLES } from '@/lib/constants/roles'

export default function LoanDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { data: session } = useSession()
  const [loan, setLoan] = useState(null)
  const [loading, setLoading] = useState(true)

  const isHRManager = session?.user?.role === ROLES.HR_MANAGER
  const isSuperAdmin = session?.user?.role === ROLES.SUPER_ADMIN
  const isAdmin = session?.user?.role === ROLES.ADMIN
  const canManage = isHRManager || isSuperAdmin || isAdmin

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'hrm', label: 'HRM', href: '/dashboard/hrm' },
    { key: 'payroll', label: 'Payroll', href: '/dashboard/hrm/payroll' },
    { key: 'loans', label: 'Loans', href: '/dashboard/hrm/payroll/loans' },
    { key: 'detail', label: 'Loan Details', href: `/dashboard/hrm/payroll/loans/${params.id}` },
  ]

  useEffect(() => {
    fetchLoan()
  }, [params.id])

  const fetchLoan = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/hrm/payroll/loans/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setLoan(data)
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load loan details',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error fetching loan:', error)
      toast({
        title: 'Error',
        description: 'Failed to load loan details',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString()
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'COMPLETED': return 'bg-blue-100 text-blue-800'
      case 'CANCELLED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getInstallmentStatusColor = (status) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'OVERDUE': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (!loan) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Loan not found</p>
        <BackButton href="/dashboard/hrm/payroll/loans" className="mt-4" />
      </div>
    )
  }

  const paidInstallments = loan.totalInstallments - loan.remainingInstallments
  const progress = (paidInstallments / loan.totalInstallments) * 100

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <BackButton href="/dashboard/hrm/payroll/loans" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Loan Details</h1>
              <Breadcrumbs items={breadcrumbs} className="mt-2" />
            </div>
          </div>
        </div>
      </div>

      {/* Loan Summary */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Loan Information</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Loan Number</dt>
                <dd className="mt-1 text-sm text-gray-900">{loan.loanNumber}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Employee</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {loan.employee?.name} ({loan.employee?.employeeId})
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Principal Amount</dt>
                <dd className="mt-1 text-sm font-semibold text-gray-900">
                  {formatCurrency(Number(loan.principalAmount))}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Interest Rate</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {loan.interestRate ? `${loan.interestRate}%` : 'No Interest'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Total Amount</dt>
                <dd className="mt-1 text-sm font-semibold text-gray-900">
                  {formatCurrency(Number(loan.totalAmount))}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(loan.status)}`}>
                    {loan.status}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Schedule</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Installment Amount</dt>
                <dd className="mt-1 text-sm font-semibold text-gray-900">
                  {formatCurrency(Number(loan.installmentAmount))} / month
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Total Installments</dt>
                <dd className="mt-1 text-sm text-gray-900">{loan.totalInstallments}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Paid Installments</dt>
                <dd className="mt-1 text-sm text-gray-900">{paidInstallments}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Remaining Installments</dt>
                <dd className="mt-1 text-sm text-gray-900">{loan.remainingInstallments}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Start Date</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(loan.startDate)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">End Date</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(loan.endDate)}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Payment Progress</span>
            <span className="text-sm text-gray-500">{paidInstallments} / {loan.totalInstallments} installments</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {loan.notes && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Notes</h4>
            <p className="text-sm text-gray-600">{loan.notes}</p>
          </div>
        )}
      </div>

      {/* Installments Table */}
      {loan.installments && loan.installments.length > 0 && (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Installment Schedule</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loan.installments.map((installment) => (
                  <tr key={installment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {installment.installmentNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(Number(installment.amount))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(installment.dueDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getInstallmentStatusColor(installment.status)}`}>
                        {installment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {installment.paidDate ? formatDate(installment.paidDate) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}


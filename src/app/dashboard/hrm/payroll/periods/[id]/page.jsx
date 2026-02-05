'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import BackButton from '@/components/ui/BackButton'
import { toast } from '@/components/ui/Toast'
import { ROLES } from '@/lib/constants/roles'
import { 
  LockClosedIcon, 
  CheckCircleIcon, 
  CurrencyDollarIcon,
  DocumentArrowDownIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

export default function PayrollPeriodDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { data: session } = useSession()
  const [period, setPeriod] = useState(null)
  const [records, setRecords] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  const isHRManager = session?.user?.role === ROLES.HR_MANAGER
  const isSuperAdmin = session?.user?.role === ROLES.SUPER_ADMIN
  const isAdmin = session?.user?.role === ROLES.ADMIN
  const canManage = isHRManager || isSuperAdmin || isAdmin

  useEffect(() => {
    fetchPeriod()
    fetchSummary()
  }, [params.id])

  const fetchPeriod = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/hrm/payroll/periods/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setPeriod(data)
        setRecords(data.payrollRecords || [])
      }
    } catch (error) {
      console.error('Error fetching period:', error)
      toast({
        title: 'Error',
        description: 'Failed to load payroll period',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchSummary = async () => {
    try {
      const res = await fetch(`/api/hrm/payroll/periods/${params.id}/summary`)
      if (res.ok) {
        const data = await res.json()
        setSummary(data)
      }
    } catch (error) {
      console.error('Error fetching summary:', error)
    }
  }

  const handleLockAttendance = async () => {
    if (!confirm('Lock attendance for this period? This will prevent further modifications.')) return

    setActionLoading(true)
    try {
      const res = await fetch(`/api/hrm/payroll/periods/${params.id}/lock-attendance`, {
        method: 'POST'
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to lock attendance')
      }

      toast({
        title: 'Success',
        description: 'Attendance locked successfully'
      })

      fetchPeriod()
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleGeneratePayroll = async () => {
    if (!confirm('Generate payroll for all employees? This will create payroll records.')) return

    setActionLoading(true)
    try {
      const res = await fetch('/api/hrm/payroll/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payrollPeriodId: params.id })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to generate payroll')
      }

      const result = await res.json()
      toast({
        title: 'Success',
        description: `Payroll generated for ${result.totalProcessed} employees`
      })

      fetchPeriod()
      fetchSummary()
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleFinalize = async () => {
    if (!confirm('Finalize this payroll period? This action cannot be undone.')) return

    setActionLoading(true)
    try {
      const res = await fetch(`/api/hrm/payroll/periods/${params.id}/finalize`, {
        method: 'POST'
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to finalize')
      }

      toast({
        title: 'Success',
        description: 'Payroll period finalized successfully'
      })

      fetchPeriod()
      fetchSummary()
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleMarkPaid = async () => {
    if (!confirm('Mark this period as paid?')) return

    setActionLoading(true)
    try {
      const res = await fetch(`/api/hrm/payroll/periods/${params.id}/mark-paid`, {
        method: 'POST'
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to mark as paid')
      }

      toast({
        title: 'Success',
        description: 'Period marked as paid'
      })

      fetchPeriod()
      fetchSummary()
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setActionLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  if (!canManage) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">You don't have permission to access this page.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-500">Loading...</p>
      </div>
    )
  }

  if (!period) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Payroll period not found</p>
      </div>
    )
  }

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'hrm', label: 'HRM', href: '/dashboard/hrm' },
    { key: 'payroll', label: 'Payroll', href: '/dashboard/hrm/payroll' },
    { key: 'period', label: period.periodName, href: `/dashboard/hrm/payroll/periods/${params.id}` },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <BackButton href="/dashboard/hrm/payroll" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{period.periodName}</h1>
              <Breadcrumbs items={breadcrumbs} className="mt-2" />
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          {period.status === 'DRAFT' && (
            <>
              <Button variant="outline" onClick={handleLockAttendance} loading={actionLoading}>
                <LockClosedIcon className="h-4 w-4 mr-2" />
                Lock Attendance
              </Button>
              <Button variant="outline" onClick={handleGeneratePayroll} loading={actionLoading}>
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                Generate Payroll
              </Button>
            </>
          )}
          {period.status === 'DRAFT' && records.length > 0 && (
            <Button onClick={handleFinalize} loading={actionLoading}>
              <CheckCircleIcon className="h-4 w-4 mr-2" />
              Finalize
            </Button>
          )}
          {period.status === 'FINALIZED' && (
            <Button onClick={handleMarkPaid} loading={actionLoading}>
              <CurrencyDollarIcon className="h-4 w-4 mr-2" />
              Mark as Paid
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-500">Total Employees</div>
            <div className="text-2xl font-bold text-gray-900">{summary.totalEmployees}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-500">Gross Salary</div>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(summary.totalGrossSalary)}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-500">Total Deductions</div>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalDeductions)}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-500">Net Salary</div>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalNetSalary)}</div>
          </div>
        </div>
      )}

      {/* Period Info */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Period Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-500">Status</div>
            <div className="text-sm font-medium text-gray-900">{period.status}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Date Range</div>
            <div className="text-sm font-medium text-gray-900">
              {new Date(period.periodStart).toLocaleDateString()} - {new Date(period.periodEnd).toLocaleDateString()}
            </div>
          </div>
          {period.finalizedAt && (
            <div>
              <div className="text-sm text-gray-500">Finalized At</div>
              <div className="text-sm font-medium text-gray-900">
                {new Date(period.finalizedAt).toLocaleString()}
              </div>
            </div>
          )}
          {period.paidAt && (
            <div>
              <div className="text-sm text-gray-500">Paid At</div>
              <div className="text-sm font-medium text-gray-900">
                {new Date(period.paidAt).toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payroll Records */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Payroll Records ({records.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gross</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deductions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {records.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{record.employee.name}</div>
                    <div className="text-xs text-gray-500">{record.employee.employeeId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(Number(record.grossSalary))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                    {formatCurrency(Number(record.totalDeductions))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    {formatCurrency(Number(record.netSalary))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      record.status === 'PAID' ? 'bg-green-100 text-green-800' :
                      record.status === 'FINALIZED' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => router.push(`/dashboard/hrm/payroll/records/${record.id}`)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <DocumentArrowDownIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                    No payroll records found. Generate payroll to create records.
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


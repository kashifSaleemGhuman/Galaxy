'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import BackButton from '@/components/ui/BackButton'
import { Button } from '@/components/ui/Button'
import { toast } from '@/components/ui/Toast'
import { DocumentArrowDownIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function MyPayrollRecordPage() {
  const router = useRouter()
  const params = useParams()
  const { data: session } = useSession()
  const [record, setRecord] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecord()
  }, [params.id])

  const fetchRecord = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/hrm/payroll/records/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setRecord(data)
      } else if (res.status === 403) {
        toast({
          title: 'Access Denied',
          description: 'You can only view your own payroll records',
          variant: 'destructive'
        })
        router.push('/dashboard/hrm/my-payroll')
      } else if (res.status === 404) {
        toast({
          title: 'Not Found',
          description: 'Payroll record not found',
          variant: 'destructive'
        })
        router.push('/dashboard/hrm/my-payroll')
      }
    } catch (error) {
      console.error('Error fetching record:', error)
      toast({
        title: 'Error',
        description: 'Failed to load payroll record',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPayslip = async () => {
    try {
      const res = await fetch(`/api/hrm/payroll/payslips/${params.id}?format=text`)
      if (res.ok) {
        const text = await res.text()
        const blob = new Blob([text], { type: 'text/plain' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `payslip-${record?.employee?.employeeId}-${record?.payrollPeriod?.periodName.replace(/\s+/g, '-')}.txt`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        toast({
          title: 'Success',
          description: 'Payslip downloaded successfully'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download payslip',
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <BackButton href="/dashboard/hrm/my-payroll" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payroll Details</h1>
            <Breadcrumbs items={breadcrumbs} className="mt-2" />
          </div>
        </div>
        <LoadingSpinner size="lg" text="Loading payroll details..." />
      </div>
    )
  }

  if (!record) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Payroll record not found</p>
      </div>
    )
  }

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'hrm', label: 'HRM', href: '/dashboard/hrm' },
    { key: 'my-payroll', label: 'My Payroll', href: '/dashboard/hrm/my-payroll' },
    { key: 'record', label: 'Payroll Details', href: `/dashboard/hrm/my-payroll/${params.id}` },
  ]

  const allowances = record.components?.filter(c => c.componentType === 'ALLOWANCE') || []
  const deductions = record.components?.filter(c => c.componentType === 'DEDUCTION') || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BackButton href="/dashboard/hrm/my-payroll" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payroll Details</h1>
            <Breadcrumbs items={breadcrumbs} className="mt-2" />
          </div>
        </div>
        {(record.status === 'FINALIZED' || record.status === 'PAID') && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push(`/dashboard/hrm/my-payroll/${params.id}/slip`)}>
              <DocumentTextIcon className="h-4 w-4 mr-2" />
              View Payslip
            </Button>
            <Button variant="outline" onClick={handleDownloadPayslip}>
              <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
              Download Payslip
            </Button>
          </div>
        )}
      </div>

      {/* Period Info */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Payroll Period</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-500">Period Name</div>
            <div className="text-lg font-semibold text-gray-900">{record.payrollPeriod.periodName}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Date Range</div>
            <div className="text-lg font-semibold text-gray-900">
              {new Date(record.payrollPeriod.periodStart).toLocaleDateString()} - {new Date(record.payrollPeriod.periodEnd).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Salary Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-500">Gross Salary</div>
          <div className="text-2xl font-bold text-blue-600">{formatCurrency(Number(record.grossSalary))}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-500">Allowances</div>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(Number(record.totalAllowances))}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-500">Deductions</div>
          <div className="text-2xl font-bold text-red-600">{formatCurrency(Number(record.totalDeductions))}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-500">Net Salary</div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(Number(record.netSalary))}</div>
        </div>
      </div>

      {/* Allowances */}
      {allowances.length > 0 && (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-green-50">
            <h2 className="text-lg font-semibold text-gray-900">Allowances</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Component</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allowances.map((comp, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{comp.componentName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 text-right">
                      {formatCurrency(Number(comp.amount))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Deductions */}
      {deductions.length > 0 && (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-red-50">
            <h2 className="text-lg font-semibold text-gray-900">Deductions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Component</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {deductions.map((comp, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{comp.componentName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600 text-right">
                      {formatCurrency(Number(comp.amount))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Attendance Summary */}
      {record.attendanceSummary && (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Attendance Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <div className="text-sm text-gray-500">Working Days</div>
              <div className="text-lg font-semibold text-gray-900">{record.attendanceSummary.totalDays || 0}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Present</div>
              <div className="text-lg font-semibold text-green-600">{record.attendanceSummary.presentDays || 0}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Absent</div>
              <div className="text-lg font-semibold text-red-600">{record.attendanceSummary.absentDays || 0}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Leave</div>
              <div className="text-lg font-semibold text-blue-600">{record.attendanceSummary.leaveDays || 0}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Overtime (hrs)</div>
              <div className="text-lg font-semibold text-purple-600">
                {(record.attendanceSummary.totalOvertimeHours || 0).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leave Summary */}
      {record.leaveSummary && (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Leave Summary</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-500">Paid Leave</div>
              <div className="text-lg font-semibold text-green-600">{record.leaveSummary.paidLeaveDays || 0} days</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Unpaid Leave</div>
              <div className="text-lg font-semibold text-red-600">{record.leaveSummary.unpaidLeaveDays || 0} days</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Total Leave</div>
              <div className="text-lg font-semibold text-gray-900">{record.leaveSummary.totalLeaveDays || 0} days</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}



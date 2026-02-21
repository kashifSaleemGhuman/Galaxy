'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import BackButton from '@/components/ui/BackButton'
import { toast } from '@/components/ui/Toast'
import { DocumentArrowDownIcon, EyeIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function MyPayrollPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('')

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'hrm', label: 'HRM', href: '/dashboard/hrm' },
    { key: 'my-payroll', label: 'My Payroll', href: '/dashboard/hrm/my-payroll' },
  ]

  useEffect(() => {
    fetchRecords()
  }, [selectedPeriod])

  const fetchRecords = async () => {
    try {
      setLoading(true)
      let url = '/api/hrm/payroll/records'
      if (selectedPeriod) {
        url += `?payrollPeriodId=${selectedPeriod}`
      }
      
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setRecords(data)
      } else if (res.status === 401) {
        toast({
          title: 'Error',
          description: 'Please log in to view your payroll',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error fetching records:', error)
      toast({
        title: 'Error',
        description: 'Failed to load payroll records',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchPeriods = async () => {
    try {
      const res = await fetch('/api/hrm/payroll/periods')
      if (res.ok) {
        const data = await res.json()
        return data
      }
    } catch (error) {
      console.error('Error fetching periods:', error)
    }
    return []
  }

  const handleDownloadPayslip = async (recordId, employeeId, periodName) => {
    try {
      const res = await fetch(`/api/hrm/payroll/payslips/${recordId}?format=text`)
      if (res.ok) {
        const text = await res.text()
        const blob = new Blob([text], { type: 'text/plain' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `payslip-${employeeId}-${periodName.replace(/\s+/g, '-')}.txt`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        toast({
          title: 'Success',
          description: 'Payslip downloaded successfully'
        })
      } else {
        throw new Error('Failed to download payslip')
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800'
      case 'FINALIZED': return 'bg-blue-100 text-blue-800'
      case 'GENERATED': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <BackButton href="/dashboard/hrm" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Payroll</h1>
            <Breadcrumbs items={breadcrumbs} className="mt-2" />
          </div>
        </div>
      </div>

      {/* Payroll Records */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <LoadingSpinner size="lg" text="Loading your payroll records..." />
        ) : (
          <>
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Payroll History</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Range</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Gross Salary</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Deductions</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Net Salary</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {records.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{record.payrollPeriod.periodName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{new Date(record.payrollPeriod.periodStart).toLocaleDateString()}</div>
                        <div className="text-xs">to {new Date(record.payrollPeriod.periodEnd).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 text-right">
                        {formatCurrency(Number(record.grossSalary))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 text-right">
                        {formatCurrency(Number(record.totalDeductions))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600 text-right">
                        {formatCurrency(Number(record.netSalary))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => router.push(`/dashboard/hrm/my-payroll/${record.id}`)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          {record.status === 'FINALIZED' || record.status === 'PAID' ? (
                            <button
                              onClick={() => router.push(`/dashboard/hrm/my-payroll/${record.id}/slip`)}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="View Payslip"
                            >
                              <DocumentTextIcon className="h-5 w-5" />
                            </button>
                          ) : null}
                          {record.status === 'FINALIZED' || record.status === 'PAID' ? (
                            <button
                              onClick={() => handleDownloadPayslip(
                                record.id,
                                record.employee.employeeId,
                                record.payrollPeriod.periodName
                              )}
                              className="text-green-600 hover:text-green-900"
                              title="Download Payslip"
                            >
                              <DocumentArrowDownIcon className="h-5 w-5" />
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {records.length === 0 && (
                    <tr>
                      <td colSpan="7" className="px-6 py-10 text-center text-gray-500">
                        No payroll records found. Your payroll will appear here once it's generated.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}



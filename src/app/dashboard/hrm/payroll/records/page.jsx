'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import BackButton from '@/components/ui/BackButton'
import { toast } from '@/components/ui/Toast'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { ROLES } from '@/lib/constants/roles'
import { EyeIcon } from '@heroicons/react/24/outline'

export default function PayrollRecordsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [employees, setEmployees] = useState([])
  const [periods, setPeriods] = useState([])
  const [filters, setFilters] = useState({
    employeeId: '',
    payrollPeriodId: ''
  })

  const isHRManager = session?.user?.role === ROLES.HR_MANAGER
  const isSuperAdmin = session?.user?.role === ROLES.SUPER_ADMIN
  const isAdmin = session?.user?.role === ROLES.ADMIN
  const canManage = isHRManager || isSuperAdmin || isAdmin

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'hrm', label: 'HRM', href: '/dashboard/hrm' },
    { key: 'payroll', label: 'Payroll', href: '/dashboard/hrm/payroll' },
    { key: 'records', label: 'Payroll Records', href: '/dashboard/hrm/payroll/records' },
  ]

  useEffect(() => {
    if (canManage) {
      fetchEmployees()
      fetchPeriods()
    }
    fetchRecords()
  }, [filters, canManage])

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/organization/employees')
      if (res.ok) {
        const data = await res.json()
        setEmployees(data.filter(e => !e.dateOfLeaving))
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
    }
  }

  const fetchPeriods = async () => {
    try {
      const res = await fetch('/api/hrm/payroll/periods')
      if (res.ok) {
        const data = await res.json()
        setPeriods(data)
      }
    } catch (error) {
      console.error('Error fetching periods:', error)
    }
  }

  const fetchRecords = async () => {
    try {
      setLoading(true)
      let url = '/api/hrm/payroll/records?'
      const params = new URLSearchParams()
      if (filters.employeeId) params.append('employeeId', filters.employeeId)
      if (filters.payrollPeriodId) params.append('payrollPeriodId', filters.payrollPeriodId)
      url += params.toString()

      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setRecords(data)
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'GENERATED': return 'bg-yellow-100 text-yellow-800'
      case 'FINALIZED': return 'bg-blue-100 text-blue-800'
      case 'PAID': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading && records.length === 0) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <BackButton href="/dashboard/hrm/payroll" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Payroll Records</h1>
              <Breadcrumbs items={breadcrumbs} className="mt-2" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters - Only show for HR */}
      {canManage && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Payroll Period</label>
              <select
                value={filters.payrollPeriodId}
                onChange={(e) => setFilters(prev => ({ ...prev, payrollPeriodId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Periods</option>
                {periods.map((period) => (
                  <option key={period.id} value={period.id}>
                    {period.periodName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Records Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gross Salary</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deductions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net Salary</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{record.employee?.name}</div>
                      <div className="text-xs text-gray-500">{record.employee?.employeeId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.payrollPeriod?.periodName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(Number(record.grossSalary))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                      {formatCurrency(Number(record.totalDeductions))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                      {formatCurrency(Number(record.netSalary))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(record.status)}`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => router.push(`/dashboard/hrm/payroll/records/${record.id}`)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {records.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-10 text-center text-gray-500">
                      No payroll records found.
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


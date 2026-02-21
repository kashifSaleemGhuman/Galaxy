'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import BackButton from '@/components/ui/BackButton'
import { toast } from '@/components/ui/Toast'

export default function ManualDeductionsPage() {
  const [periods, setPeriods] = useState([])
  const [employees, setEmployees] = useState([])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [form, setForm] = useState({
    payrollPeriodId: '',
    employeeId: '',
    type: 'DEDUCTION',
    amount: '',
    reason: ''
  })

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'hrm', label: 'HRM', href: '/dashboard/hrm' },
    { key: 'payroll', label: 'Payroll', href: '/dashboard/hrm/payroll' },
    { key: 'manual-deductions', label: 'Manual Adjustments', href: '/dashboard/hrm/payroll/manual-deductions' }
  ]

  useEffect(() => {
    bootstrap()
  }, [])

  useEffect(() => {
    if (form.payrollPeriodId) fetchItems(form.payrollPeriodId)
  }, [form.payrollPeriodId])

  useEffect(() => {
    setPage(1)
  }, [items.length])

  const bootstrap = async () => {
    try {
      setLoading(true)
      const [periodsRes, employeesRes] = await Promise.all([
        fetch('/api/hrm/payroll/periods'),
        fetch('/api/organization/employees')
      ])
      if (periodsRes.ok) {
        const p = await periodsRes.json()
        setPeriods(Array.isArray(p) ? p : [])
      }
      if (employeesRes.ok) {
        const e = await employeesRes.json()
        setEmployees(Array.isArray(e) ? e : [])
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load page data', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const fetchItems = async (payrollPeriodId) => {
    try {
      const res = await fetch(`/api/hrm/payroll/manual-deductions?payrollPeriodId=${payrollPeriodId}`)
      if (res.ok) {
        const data = await res.json()
        setItems(Array.isArray(data) ? data.filter((x) => x.isActive) : [])
      }
    } catch (error) {
      console.error(error)
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!form.payrollPeriodId || !form.employeeId || !form.amount || !form.reason.trim()) {
      toast({ title: 'Error', description: 'All fields are required', variant: 'destructive' })
      return
    }

    const amount = Number(form.amount)
    if (!(amount > 0)) {
      toast({ title: 'Error', description: 'Amount must be greater than 0', variant: 'destructive' })
      return
    }

    try {
      const res = await fetch('/api/hrm/payroll/manual-deductions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payrollPeriodId: form.payrollPeriodId,
          employeeId: form.employeeId,
          type: form.type,
          amount,
          reason: form.reason.trim()
        })
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to add manual deduction')
      }
      toast({ title: 'Success', description: `Manual ${form.type.toLowerCase()} added` })
      setForm((prev) => ({ ...prev, amount: '', reason: '' }))
      fetchItems(form.payrollPeriodId)
    } catch (error) {
      toast({ title: 'Error', description: error.message || 'Failed to add deduction', variant: 'destructive' })
    }
  }

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const pageItems = items.slice((page - 1) * pageSize, page * pageSize)

  const remove = async (id) => {
    try {
      const res = await fetch(`/api/hrm/payroll/manual-deductions/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to remove deduction')
      toast({ title: 'Success', description: 'Manual deduction removed' })
      fetchItems(form.payrollPeriodId)
    } catch (error) {
      toast({ title: 'Error', description: error.message || 'Failed to remove deduction', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BackButton href="/dashboard/hrm/payroll" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manual Salary Adjustments</h1>
          <Breadcrumbs items={breadcrumbs} className="mt-2" />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Adjustment (Addition or Deduction)</h2>
        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payroll Period</label>
            <select
              value={form.payrollPeriodId}
              onChange={(e) => setForm((prev) => ({ ...prev, payrollPeriodId: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            >
              <option value="">Select period</option>
              {periods.map((p) => (
                <option key={p.id} value={p.id}>{p.periodName} ({p.status})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
            <select
              value={form.employeeId}
              onChange={(e) => setForm((prev) => ({ ...prev, employeeId: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            >
              <option value="">Select employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.name} ({emp.employeeId})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            >
              <option value="DEDUCTION">Deduction</option>
              <option value="ADDITION">Addition</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason (required)</label>
            <input
              type="text"
              value={form.reason}
              onChange={(e) => setForm((prev) => ({ ...prev, reason: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <Button type="submit">Save Adjustment</Button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 font-semibold text-gray-900">Existing Adjustments</div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Employee</th>
                <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Type</th>
                <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Reason</th>
                <th className="px-4 py-2 text-right text-xs text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pageItems.map((item) => {
                const emp = employees.find((e) => e.id === item.employeeId)
                return (
                  <tr key={item.id}>
                    <td className="px-4 py-2 text-sm text-gray-900">{emp ? `${emp.name} (${emp.employeeId})` : item.employeeId}</td>
                    <td className={`px-4 py-2 text-xs font-semibold ${item.type === 'ADDITION' ? 'text-green-700' : 'text-red-700'}`}>
                      {item.type}
                    </td>
                    <td className={`px-4 py-2 text-sm ${item.type === 'ADDITION' ? 'text-green-600' : 'text-red-600'}`}>
                      PKR {Number(item.amount).toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">{item.reason}</td>
                    <td className="px-4 py-2 text-right">
                      <button onClick={() => remove(item.id)} className="text-red-600 hover:text-red-800 text-sm">Remove</button>
                    </td>
                  </tr>
                )
              })}
              {items.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-gray-500">No adjustments for selected period.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {items.length > pageSize && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600">
              Page {page} of {totalPages} ({items.length} adjustments)
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setPage((prev) => Math.max(1, prev - 1))} disabled={page <= 1}>
                Previous
              </Button>
              <Button variant="outline" onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))} disabled={page >= totalPages}>
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


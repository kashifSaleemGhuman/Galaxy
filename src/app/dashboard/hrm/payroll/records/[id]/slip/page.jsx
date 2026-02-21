'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import BackButton from '@/components/ui/BackButton'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { Button } from '@/components/ui/Button'
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline'
import { toast } from '@/components/ui/Toast'

export default function PayrollRecordSlipPage() {
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [payslip, setPayslip] = useState(null)

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'hrm', label: 'HRM', href: '/dashboard/hrm' },
    { key: 'payroll', label: 'Payroll', href: '/dashboard/hrm/payroll' },
    { key: 'record', label: 'Payroll Record', href: `/dashboard/hrm/payroll/records/${params.id}` },
    { key: 'slip', label: 'Payslip', href: `/dashboard/hrm/payroll/records/${params.id}/slip` }
  ]

  useEffect(() => {
    fetchPayslip()
  }, [params.id])

  const fetchPayslip = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/hrm/payroll/payslips/${params.id}`)
      if (!res.ok) throw new Error('Failed to load payslip')
      const data = await res.json()
      setPayslip(data)
    } catch (error) {
      toast({ title: 'Error', description: error.message || 'Failed to load payslip', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const download = async () => {
    try {
      const res = await fetch(`/api/hrm/payroll/payslips/${params.id}?format=text`)
      if (!res.ok) throw new Error('Failed to download')
      const text = await res.text()
      const blob = new Blob([text], { type: 'text/plain' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `payslip-${params.id}.txt`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      toast({ title: 'Error', description: error.message || 'Failed to download', variant: 'destructive' })
    }
  }

  const formatAmount = (value) => Number(value || 0).toFixed(2)

  if (loading) return <LoadingSpinner size="lg" text="Loading payslip..." />
  if (!payslip) return <div className="p-8 text-center text-gray-500">Payslip not found.</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BackButton href={`/dashboard/hrm/payroll/records/${params.id}`} />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payroll Slip</h1>
            <Breadcrumbs items={breadcrumbs} className="mt-2" />
          </div>
        </div>
        <Button variant="outline" onClick={download}>
          <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
          Download
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 text-white" style={{ backgroundColor: payslip.theme?.themeColor || '#1d4ed8' }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">{payslip.company?.name || 'Company'}</h2>
              <p className="text-sm opacity-90">{payslip.company?.address || ''}</p>
            </div>
            {payslip.company?.logo ? (
              <img src={payslip.company.logo} alt="Company Logo" className="h-14 w-14 object-contain rounded bg-white p-1" />
            ) : null}
          </div>
        </div>
        <div className="p-6 space-y-4 text-sm">
          <div className="flex justify-between"><span>Employee</span><span>{payslip.employee?.name} ({payslip.employee?.employeeId})</span></div>
          <div className="flex justify-between"><span>Period</span><span>{payslip.period?.name}</span></div>
          <div className="border-t pt-4">
            <div className="font-semibold mb-2">Deductions</div>
            {payslip.deductions?.items?.map((item, idx) => (
              <div key={idx} className="flex justify-between"><span>{item.name}</span><span>PKR {formatAmount(item.amount)}</span></div>
            ))}
          </div>
          <div className="border-t pt-4">
            <div className="flex justify-between font-semibold text-base"><span>Net Salary</span><span>PKR {formatAmount(payslip.summary?.netSalary)}</span></div>
          </div>
          <div className="text-xs text-gray-600 border-t pt-3" style={{ borderColor: payslip.theme?.accentColor || '#0f172a' }}>
            {payslip.footerNote || 'This is a system-generated payslip.'}
          </div>
        </div>
      </div>
    </div>
  )
}



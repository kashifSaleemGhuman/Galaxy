'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import BackButton from '@/components/ui/BackButton'
import { toast } from '@/components/ui/Toast'

export default function PayslipSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    companyNameOverride: '',
    logoUrl: '',
    themeColor: '#1d4ed8',
    accentColor: '#0f172a',
    footerNote: 'This is a system-generated payslip.'
  })

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'hrm', label: 'HRM', href: '/dashboard/hrm' },
    { key: 'payroll', label: 'Payroll', href: '/dashboard/hrm/payroll' },
    { key: 'payslip-settings', label: 'Payslip Settings', href: '/dashboard/hrm/payroll/payslip-settings' }
  ]

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/hrm/payroll/payslip-settings')
      if (!res.ok) throw new Error('Failed to load settings')
      const data = await res.json()
      setForm({
        companyNameOverride: data.companyNameOverride || '',
        logoUrl: data.logoUrl || '',
        themeColor: data.themeColor || '#1d4ed8',
        accentColor: data.accentColor || '#0f172a',
        footerNote: data.footerNote || 'This is a system-generated payslip.'
      })
    } catch (error) {
      toast({ title: 'Error', description: error.message || 'Failed to load settings', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const save = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      const res = await fetch('/api/hrm/payroll/payslip-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (!res.ok) throw new Error('Failed to save settings')
      toast({ title: 'Success', description: 'Payslip settings updated' })
    } catch (error) {
      toast({ title: 'Error', description: error.message || 'Failed to save settings', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BackButton href="/dashboard/hrm/payroll" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payslip Settings</h1>
          <Breadcrumbs items={breadcrumbs} className="mt-2" />
        </div>
      </div>

      <form onSubmit={save} className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name Override</label>
            <input
              type="text"
              value={form.companyNameOverride}
              onChange={(e) => setForm((prev) => ({ ...prev, companyNameOverride: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
            <input
              type="text"
              value={form.logoUrl}
              onChange={(e) => setForm((prev) => ({ ...prev, logoUrl: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="https://... or uploaded logo URL"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Theme Color</label>
            <input
              type="color"
              value={form.themeColor}
              onChange={(e) => setForm((prev) => ({ ...prev, themeColor: e.target.value }))}
              className="w-full h-10 border border-gray-300 rounded-md px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Accent Color</label>
            <input
              type="color"
              value={form.accentColor}
              onChange={(e) => setForm((prev) => ({ ...prev, accentColor: e.target.value }))}
              className="w-full h-10 border border-gray-300 rounded-md px-2 py-1"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Footer Note</label>
          <textarea
            value={form.footerNote}
            onChange={(e) => setForm((prev) => ({ ...prev, footerNote: e.target.value }))}
            className="w-full border border-gray-300 rounded-md px-3 py-2 min-h-[90px]"
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Payslip Settings'}
          </Button>
        </div>
      </form>
    </div>
  )
}



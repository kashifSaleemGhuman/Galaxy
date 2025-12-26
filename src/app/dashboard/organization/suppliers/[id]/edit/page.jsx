'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import { toast } from '@/components/ui/Toast'

export default function EditSupplierPage({ params }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    registrationNo: '',
    taxId: '',
    taxNo: '',
    bankDetails: '',
    bankName: '',
    bankAddress: '',
    ibanNo: '',
    swiftCode: '',
    accountTitle: ''
  })

  useEffect(() => {
    fetchSupplier()
  }, [])

  const fetchSupplier = async () => {
    try {
      const res = await fetch(`/api/organization/suppliers/${params.id}`)
      if (!res.ok) throw new Error('Failed to fetch supplier')
      const data = await res.json()
      setFormData({
        name: data.name || '',
        address: data.address || '',
        phone: data.phone || '',
        email: data.email || '',
        registrationNo: data.registrationNo || '',
        taxId: data.taxId || '',
        taxNo: data.taxNo || '',
        bankDetails: data.bankDetails || '',
        bankName: data.bankName || '',
        bankAddress: data.bankAddress || '',
        ibanNo: data.ibanNo || '',
        swiftCode: data.swiftCode || '',
        accountTitle: data.accountTitle || ''
      })
    } catch (error) {
      console.error(error)
      toast({
        title: 'Error',
        description: 'Failed to load supplier details',
        variant: 'destructive'
      })
      router.push('/dashboard/organization/suppliers')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch(`/api/organization/suppliers/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || 'Failed to update supplier')
      }

      toast({
        title: 'Success',
        description: 'Supplier updated successfully'
      })
      router.push('/dashboard/organization/suppliers')
    } catch (error) {
      console.error(error)
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'organization', label: 'Organization', href: '/dashboard/organization' },
    { key: 'suppliers', label: 'Suppliers', href: '/dashboard/organization/suppliers' },
    { key: 'edit', label: 'Edit Supplier', href: '#' },
  ]

  const handleNavigate = (index, item) => {
    if (item.href && item.href !== '#') router.push(item.href)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Supplier</h1>
          <Breadcrumbs items={breadcrumbs} onNavigate={handleNavigate} className="mt-2" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="md:col-span-2">
            <h2 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Basic Information</h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <Input required name="name" value={formData.name} onChange={handleChange} placeholder="Supplier Name" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone No.</label>
            <Input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <Input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="email@example.com" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea 
              name="address" 
              rows={3}
              value={formData.address} 
              onChange={handleChange} 
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Full Address"
            />
          </div>

          {/* Registration & Tax Information */}
          <div className="md:col-span-2 mt-4">
            <h2 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Registration & Tax Information</h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Registration No.</label>
            <Input name="registrationNo" value={formData.registrationNo} onChange={handleChange} placeholder="Registration Number" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tax ID</label>
            <Input name="taxId" value={formData.taxId} onChange={handleChange} placeholder="Tax ID" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tax No.</label>
            <Input name="taxNo" value={formData.taxNo} onChange={handleChange} placeholder="Tax Number" />
          </div>

          {/* Bank Details */}
          <div className="md:col-span-2 mt-4">
            <h2 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Bank Details</h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
            <Input name="bankName" value={formData.bankName} onChange={handleChange} placeholder="Bank Name" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Title</label>
            <Input name="accountTitle" value={formData.accountTitle} onChange={handleChange} placeholder="Account Title" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">IBAN No.</label>
            <Input name="ibanNo" value={formData.ibanNo} onChange={handleChange} placeholder="IBAN Number" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SWIFT Code</label>
            <Input name="swiftCode" value={formData.swiftCode} onChange={handleChange} placeholder="SWIFT Code" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Bank Address</label>
            <textarea 
              name="bankAddress" 
              rows={3}
              value={formData.bankAddress} 
              onChange={handleChange} 
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Bank Address"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Bank Details</label>
            <textarea 
              name="bankDetails" 
              rows={3}
              value={formData.bankDetails} 
              onChange={handleChange} 
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Additional Bank Details"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-8 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard/organization/suppliers')}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}


'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import { toast } from '@/components/ui/Toast'

export default function CreateMachinePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    serialNumber: '',
    machineId: '',
    name: '',
    quantity: 1,
    motorDetails: '',
    powerRating: '',
    airPressure: '',
    modelNumber: '',
    manufacturingYear: '',
    length: '',
    width: '',
    height: '',
    steamTemp: '',
    steamConsumption: '',
    electricityRating: '',
    operationType: '',
    department: '',
    status: 'in_use',
    remarks: ''
  })

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
      const res = await fetch('/api/organization/machines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || 'Failed to create machine')
      }

      toast({
        title: 'Success',
        description: 'Machine created successfully'
      })
      router.push('/dashboard/organization/machines')
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
    { key: 'machines', label: 'Machines', href: '/dashboard/organization/machines' },
    { key: 'create', label: 'Add Machine', href: '#' },
  ]

  const handleNavigate = (index, item) => {
    if (item.href && item.href !== '#') router.push(item.href)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Machine</h1>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Machine Name *</label>
            <Input required name="name" value={formData.name} onChange={handleChange} placeholder="Machine Name" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Machine ID *</label>
            <Input required name="machineId" value={formData.machineId} onChange={handleChange} placeholder="Unique ID" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Serial No (Sr. No)</label>
            <Input name="serialNumber" value={formData.serialNumber} onChange={handleChange} placeholder="Serial Number" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Model Number</label>
            <Input name="modelNumber" value={formData.modelNumber} onChange={handleChange} placeholder="Model" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturing Year</label>
            <Input name="manufacturingYear" value={formData.manufacturingYear} onChange={handleChange} placeholder="YYYY" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <Input type="number" name="quantity" value={formData.quantity} onChange={handleChange} min="1" />
          </div>

          {/* Technical Specifications */}
          <div className="md:col-span-2 mt-4">
            <h2 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Technical Specifications</h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Motor Details</label>
            <Input name="motorDetails" value={formData.motorDetails} onChange={handleChange} placeholder="Motor Specs" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Power Rating</label>
            <Input name="powerRating" value={formData.powerRating} onChange={handleChange} placeholder="e.g. 5kW" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Air Requirement (Pressure)</label>
            <Input name="airPressure" value={formData.airPressure} onChange={handleChange} placeholder="e.g. 6 bar" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Electricity</label>
            <Input name="electricityRating" value={formData.electricityRating} onChange={handleChange} placeholder="Voltage/Phase" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Steam Temperature</label>
            <Input name="steamTemp" value={formData.steamTemp} onChange={handleChange} placeholder="Temp" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Steam Requirement / Hour</label>
            <Input name="steamConsumption" value={formData.steamConsumption} onChange={handleChange} placeholder="Consumption" />
          </div>

          {/* Dimensions */}
          <div className="md:col-span-2 mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Dimensions</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Input name="length" value={formData.length} onChange={handleChange} placeholder="Length" />
              </div>
              <div>
                <Input name="width" value={formData.width} onChange={handleChange} placeholder="Width" />
              </div>
              <div>
                <Input name="height" value={formData.height} onChange={handleChange} placeholder="Height" />
              </div>
            </div>
          </div>

          {/* Operational Details */}
          <div className="md:col-span-2 mt-4">
            <h2 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Operational Details</h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <Input name="department" value={formData.department} onChange={handleChange} placeholder="Department" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Operation</label>
            <Input name="operationType" value={formData.operationType} onChange={handleChange} placeholder="Operation Type" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select 
              name="status" 
              value={formData.status} 
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="in_use">In Use</option>
              <option value="under_maintenance">Under Maintenance</option>
              <option value="out_of_order">Out of Order</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
            <textarea 
              name="remarks" 
              rows={3}
              value={formData.remarks} 
              onChange={handleChange} 
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Additional notes..."
            />
          </div>

        </div>

        <div className="flex justify-end space-x-4 mt-8 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard/organization/machines')}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Creating...' : 'Create Machine'}
          </Button>
        </div>
      </form>
    </div>
  )
}


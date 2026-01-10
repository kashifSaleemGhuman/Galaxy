'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import { toast } from '@/components/ui/Toast'

const UNIT_OPTIONS = [
  'kg', 'tons', 'grams', 'mg', 'pcs', 'feet', 'cubic meter', 'TPM', 'mL', 'Litre',
  'kW', 'Ampere', 'hP', 'sq.ft', 'sq.m', 'dm', 'kPA', 'cm', 'inch', 'mm', 'meter',
  'side', 'hide', 'skins', 'other'
]

const PROCESS_OPTIONS = [
  'desalting', 'Soaking', 'Liming', 'FLashing', 'lime splitting', 'wet blue splitting',
  'de liming', 'tanning', 'shaving', 'trimming', 'dying', 'retanning', 'setting',
  'vaccumm', 'hanging', 'moisturizing', 'staking', 'toggle', 'buffing', 'snuffing',
  'milling', 'finish spray', 'tumble drying', 'polishing', 'glazing', 'printing',
  'embosing', 'pasting', 'waxing', 'coating', 'measurement', 'packing', 'forwarding', 'other'
]

const DEPARTMENT_OPTIONS = [
  'raw store', 'beam house', 'wet blue leather store', 'dying/retanning', 'chemical store',
  'wet mechanical operations', 'dry mechanical operations', 'utility', 'admin', 'marketing',
  'hr', 'purchase', 'sales', 'Health safety environment', 'crusting', 'buffing', 'milling',
  'crust leather store', 'Finishing', 'patent', 'finishing chemical store', 'general chemical store',
  'general item store', 'packing', 'finish leather store', 'wastage store', 'other'
]

const MATERIAL_TYPE_OPTIONS = [
  'incoming materials',
  'outgoing materials'
]

export default function EditMaterialPage({ params }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState({
    description: '',
    size: '',
    unitOfMeasurement: '',
    thickness: '',
    weight: '',
    customField: '',
    packaging: '',
    ghsSymbolImage: '',
    hsCode: '',
    hazardClassification: '',
    materialOrigin: '',
    oem: '',
    usage: '',
    process: '',
    department: '',
    materialType: ''
  })

  useEffect(() => {
    fetchMaterial()
  }, [])

  const fetchMaterial = async () => {
    try {
      const res = await fetch(`/api/organization/materials/${params.id}`)
      if (!res.ok) throw new Error('Failed to fetch material')
      const data = await res.json()
      setFormData({
        description: data.description || '',
        size: data.size || '',
        unitOfMeasurement: data.unitOfMeasurement || '',
        thickness: data.thickness || '',
        weight: data.weight || '',
        customField: data.customField || '',
        packaging: data.packaging || '',
        ghsSymbolImage: data.ghsSymbolImage || '',
        hsCode: data.hsCode || '',
        hazardClassification: data.hazardClassification || '',
        materialOrigin: data.materialOrigin || '',
        oem: data.oem || '',
        usage: data.usage || '',
        process: data.process || '',
        department: data.department || '',
        materialType: data.materialType || ''
      })
    } catch (error) {
      console.error(error)
      toast({
        title: 'Error',
        description: 'Failed to load material details',
        variant: 'destructive'
      })
      router.push('/dashboard/organization/materials')
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

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          ghsSymbolImage: reader.result
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch(`/api/organization/materials/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || 'Failed to update material')
      }

      toast({
        title: 'Success',
        description: 'Material updated successfully'
      })
      router.push('/dashboard/organization/materials')
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
    { key: 'materials', label: 'Materials', href: '/dashboard/organization/materials' },
    { key: 'edit', label: 'Edit Material', href: '#' },
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
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Material</h1>
          <Breadcrumbs items={breadcrumbs} onNavigate={handleNavigate} className="mt-2" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="md:col-span-2">
            <h2 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Basic Information</h2>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
              name="description" 
              rows={3}
              value={formData.description} 
              onChange={handleChange} 
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Material Description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
            <Input name="size" value={formData.size} onChange={handleChange} placeholder="Size" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit of Measurement</label>
            <select 
              name="unitOfMeasurement" 
              value={formData.unitOfMeasurement} 
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Unit</option>
              {UNIT_OPTIONS.map(unit => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Thickness</label>
            <Input name="thickness" value={formData.thickness} onChange={handleChange} placeholder="Thickness" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
            <Input name="weight" value={formData.weight} onChange={handleChange} placeholder="Weight" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Add Custom Field</label>
            <Input name="customField" value={formData.customField} onChange={handleChange} placeholder="Custom Field" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Packaging</label>
            <Input name="packaging" value={formData.packaging} onChange={handleChange} placeholder="Packaging" />
          </div>

          {/* GHS Symbol & Hazard Information */}
          <div className="md:col-span-2 mt-4">
            <h2 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">GHS Symbol & Hazard Information</h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">GHS Symbol Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {formData.ghsSymbolImage && (
              <div className="mt-2">
                <img src={formData.ghsSymbolImage} alt="GHS Symbol" className="h-20 w-20 object-contain border rounded" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">HS Code</label>
            <Input name="hsCode" value={formData.hsCode} onChange={handleChange} placeholder="HS Code" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Hazard Classification</label>
            <textarea 
              name="hazardClassification" 
              rows={2}
              value={formData.hazardClassification} 
              onChange={handleChange} 
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Hazard Classification"
            />
          </div>

          {/* Material Origin */}
          <div className="md:col-span-2 mt-4">
            <h2 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Material Origin</h2>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Material Origin (Google Map Selection)</label>
            <Input 
              name="materialOrigin" 
              value={formData.materialOrigin} 
              onChange={handleChange} 
              placeholder="Enter address or coordinates (e.g., lat, lng or full address)"
            />
            <p className="mt-1 text-xs text-gray-500">Enter coordinates (lat, lng) or full address for material origin</p>
          </div>

          {/* Additional Information */}
          <div className="md:col-span-2 mt-4">
            <h2 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Additional Information</h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">OEM (Original Equipment Manufacturer)</label>
            <Input name="oem" value={formData.oem} onChange={handleChange} placeholder="OEM" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Usage</label>
            <Input name="usage" value={formData.usage} onChange={handleChange} placeholder="Usage" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Process</label>
            <select 
              name="process" 
              value={formData.process} 
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Process</option>
              {PROCESS_OPTIONS.map(process => (
                <option key={process} value={process}>{process}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select 
              name="department" 
              value={formData.department} 
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Department</option>
              {DEPARTMENT_OPTIONS.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Material Type</label>
            <select 
              name="materialType" 
              value={formData.materialType} 
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Material Type</option>
              {MATERIAL_TYPE_OPTIONS.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-8 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard/organization/materials')}
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


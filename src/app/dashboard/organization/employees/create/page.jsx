'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import { toast } from '@/components/ui/Toast'

export default function CreateEmployeePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    employeeId: '',
    idCardNumber: '',
    name: '',
    photo: '',
    parentName: '',
    dob: '',
    address: '',
    gender: '',
    contactNumber: '',
    emergencyContact: '',
    dateOfJoining: '',
    department: '',
    lastEmployment: '',
    process: '',
    designation: '',
    salary: '',
    dateOfLeaving: '',
    shift: '',
    secondaryJob: '',
    isFirstAider: false,
    isEmergencyResponder: false,
    isFirefighter: false
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch('/api/organization/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || 'Failed to create employee')
      }

      toast({
        title: 'Success',
        description: 'Employee created successfully'
      })
      router.push('/dashboard/organization/employees')
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
    { key: 'employees', label: 'Employees', href: '/dashboard/organization/employees' },
    { key: 'create', label: 'Add Employee', href: '#' },
  ]

  const handleNavigate = (index, item) => {
    if (item.href && item.href !== '#') router.push(item.href)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Employee</h1>
          <Breadcrumbs items={breadcrumbs} onNavigate={handleNavigate} className="mt-2" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="md:col-span-2">
            <h2 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Personal Information</h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee Name *</label>
            <Input required name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Father/Mother Name</label>
            <Input name="parentName" value={formData.parentName} onChange={handleChange} placeholder="Parent Name" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            <Input type="date" name="dob" value={formData.dob} onChange={handleChange} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select 
              name="gender" 
              value={formData.gender} 
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ID Card / National ID No</label>
            <Input name="idCardNumber" value={formData.idCardNumber} onChange={handleChange} placeholder="ID Number" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Photo URL</label>
            <Input name="photo" value={formData.photo} onChange={handleChange} placeholder="https://..." />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea 
              name="address" 
              rows={3}
              value={formData.address} 
              onChange={handleChange} 
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Residential Address"
            />
          </div>

          {/* Contact Information */}
          <div className="md:col-span-2 mt-4">
            <h2 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Contact Information</h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact No</label>
            <Input name="contactNumber" value={formData.contactNumber} onChange={handleChange} placeholder="Mobile Number" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact No</label>
            <Input name="emergencyContact" value={formData.emergencyContact} onChange={handleChange} placeholder="Emergency Number" />
          </div>

          {/* Employment Details */}
          <div className="md:col-span-2 mt-4">
            <h2 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Employment Details</h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID (Internal) *</label>
            <Input required name="employeeId" value={formData.employeeId} onChange={handleChange} placeholder="e.g. EMP-001" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <Input name="department" value={formData.department} onChange={handleChange} placeholder="Department Name" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
            <Input name="designation" value={formData.designation} onChange={handleChange} placeholder="Job Title" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Joining</label>
            <Input type="date" name="dateOfJoining" value={formData.dateOfJoining} onChange={handleChange} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Salary</label>
            <Input type="number" name="salary" value={formData.salary} onChange={handleChange} placeholder="0.00" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Process</label>
            <Input name="process" value={formData.process} onChange={handleChange} placeholder="Process" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Shift</label>
            <Input name="shift" value={formData.shift} onChange={handleChange} placeholder="e.g. Morning, Night" />
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Last Employment</label>
             <Input name="lastEmployment" value={formData.lastEmployment} onChange={handleChange} placeholder="Previous Company" />
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Additional / Secondary Job</label>
             <Input name="secondaryJob" value={formData.secondaryJob} onChange={handleChange} placeholder="Secondary Job Details" />
          </div>
          
          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Date of Ending Employment</label>
             <Input type="date" name="dateOfLeaving" value={formData.dateOfLeaving} onChange={handleChange} />
          </div>

          {/* Roles & Certifications */}
          <div className="md:col-span-2 mt-4">
            <h2 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Additional Roles</h2>
          </div>

          <div className="md:col-span-2 flex space-x-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="checkbox" 
                name="isFirstAider" 
                checked={formData.isFirstAider} 
                onChange={handleChange}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
              <span className="text-sm text-gray-700">First Aider</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="checkbox" 
                name="isEmergencyResponder" 
                checked={formData.isEmergencyResponder} 
                onChange={handleChange}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
              <span className="text-sm text-gray-700">Emergency Responder</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="checkbox" 
                name="isFirefighter" 
                checked={formData.isFirefighter} 
                onChange={handleChange}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
              <span className="text-sm text-gray-700">Firefighter</span>
            </label>
          </div>

        </div>

        <div className="flex justify-end space-x-4 mt-8 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard/organization/employees')}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Creating...' : 'Create Employee'}
          </Button>
        </div>
      </form>
    </div>
  )
}


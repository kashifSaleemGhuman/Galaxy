'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import BackButton from '@/components/ui/BackButton'
import { toast } from '@/components/ui/Toast'
import { ROLES } from '@/lib/constants/roles'

export default function UploadDocumentPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState(null)
  const [formData, setFormData] = useState({
    employeeId: '',
    category: 'CUSTOM',
    title: '',
    description: '',
    tags: []
  })

  const isHRManager = session?.user?.role === ROLES.HR_MANAGER
  const isSuperAdmin = session?.user?.role === ROLES.SUPER_ADMIN
  const isAdmin = session?.user?.role === ROLES.ADMIN
  const canManage = isHRManager || isSuperAdmin || isAdmin

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'hrm', label: 'HRM', href: '/dashboard/hrm' },
    { key: 'documents', label: 'Documents', href: '/dashboard/hrm/documents' },
    { key: 'upload', label: 'Upload Document', href: '/dashboard/hrm/documents/upload' },
  ]

  const categories = [
    { value: 'CUSTOM', label: 'Custom' },
    { value: 'OFFER_LETTER', label: 'Offer Letter' },
    { value: 'EMPLOYMENT_CONTRACT', label: 'Employment Contract' },
    { value: 'APPOINTMENT_LETTER', label: 'Appointment Letter' },
    { value: 'PROMOTION_LETTER', label: 'Promotion Letter' },
    { value: 'EXPERIENCE_LETTER', label: 'Experience Letter' },
    { value: 'SALARY_CERTIFICATE', label: 'Salary Certificate' },
    { value: 'WARNING_LETTER', label: 'Warning Letter' },
    { value: 'NOTICE_LETTER', label: 'Notice Letter' }
  ]

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/organization/employees')
      if (res.ok) {
        const data = await res.json()
        setEmployees(data)
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
    }
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      // Check file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: 'Error',
          description: 'File size must be less than 10MB',
          variant: 'destructive'
        })
        return
      }
      setFile(selectedFile)
      if (!formData.title) {
        setFormData(prev => ({ ...prev, title: selectedFile.name }))
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!file || !formData.employeeId || !formData.title) {
      toast({
        title: 'Error',
        description: 'Please select a file, employee, and enter a title',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      uploadFormData.append('employeeId', formData.employeeId)
      uploadFormData.append('category', formData.category)
      uploadFormData.append('title', formData.title)
      uploadFormData.append('description', formData.description || '')
      uploadFormData.append('tags', JSON.stringify(formData.tags))

      const res = await fetch('/api/hrm/documents/upload', {
        method: 'POST',
        body: uploadFormData
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to upload document')
      }

      const document = await res.json()
      
      toast({
        title: 'Success',
        description: 'Document uploaded successfully'
      })
      
      router.push('/dashboard/hrm/documents')
    } catch (error) {
      console.error(error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload document',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  if (!canManage) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">You don't have permission to access this page.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <BackButton href="/dashboard/hrm/documents" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Upload Document</h1>
            <Breadcrumbs items={breadcrumbs} className="mt-2" />
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            File <span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          {file && (
            <p className="mt-2 text-sm text-gray-500">
              Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Employee <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.employeeId}
              onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select an employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.employeeId}) - {emp.designation}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Optional description"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading || !file}>
            {loading ? 'Uploading...' : 'Upload Document'}
          </Button>
        </div>
      </form>
    </div>
  )
}


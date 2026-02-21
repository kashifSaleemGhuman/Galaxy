'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import BackButton from '@/components/ui/BackButton'
import { toast } from '@/components/ui/Toast'
import { ROLES } from '@/lib/constants/roles'
import { EyeIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { generateDocumentContent, getEmployeeFields } from '@/lib/document-generator'
import { getTemplateByCategory } from '@/lib/document-templates'

export default function GenerateDocumentPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [employees, setEmployees] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    templateId: '',
    employeeId: '',
    title: '',
    description: '',
    fieldValues: {}
  })
  const [previewContent, setPreviewContent] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const [templates, setTemplates] = useState([])

  const isHRManager = session?.user?.role === ROLES.HR_MANAGER
  const isSuperAdmin = session?.user?.role === ROLES.SUPER_ADMIN
  const isAdmin = session?.user?.role === ROLES.ADMIN
  const canManage = isHRManager || isSuperAdmin || isAdmin

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'hrm', label: 'HRM', href: '/dashboard/hrm' },
    { key: 'documents', label: 'Documents', href: '/dashboard/hrm/documents' },
    { key: 'generate', label: 'Generate Document', href: '/dashboard/hrm/documents/generate' },
  ]

  useEffect(() => {
    fetchEmployees()
    fetchCategories()
    fetchTemplates()
  }, [])

  useEffect(() => {
    if (formData.employeeId && formData.templateId) {
      updatePreview()
    }
  }, [formData.employeeId, formData.templateId, formData.fieldValues])

  useEffect(() => {
    if (formData.employeeId && formData.templateId) {
      fetchEmployeeData()
    }
  }, [formData.employeeId, formData.templateId])

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

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/hrm/document-templates/categories')
      if (res.ok) {
        const data = await res.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/hrm/document-templates')
      if (res.ok) {
        const data = await res.json()
        setTemplates(data)
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
    }
  }

  const updatePreview = async () => {
    if (!formData.employeeId || !formData.templateId) {
      setPreviewContent(null)
      return
    }

    try {
      const employee = employees.find(e => e.id === formData.employeeId)
      if (!employee) {
        setPreviewContent(null)
        return
      }

      // Get template content
      let templateContent = null
      const dbTemplate = templates.find(t => t.id === formData.templateId || t.category === formData.templateId)
      
      if (dbTemplate) {
        templateContent = dbTemplate.content
      } else {
        // Try predefined template
        try {
          templateContent = getTemplateByCategory(formData.templateId)
        } catch (e) {
          console.error('Error getting predefined template:', e)
        }
      }

      if (!templateContent) {
        setPreviewContent(null)
        return
      }

      const employeeFields = getEmployeeFields(employee)
      const generatedContent = generateDocumentContent(
        templateContent,
        {
          ...employeeFields,
          ...formData.fieldValues,
          companyName: formData.fieldValues.companyName || 'Galaxy ERP Solutions',
          companyAddress: formData.fieldValues.companyAddress || '123 Business Street, City, Country'
        },
        employee
      )

      setPreviewContent(generatedContent)
    } catch (error) {
      console.error('Error updating preview:', error)
      setPreviewContent(null)
    }
  }

  const fetchEmployeeData = async () => {
    try {
      const employee = employees.find(e => e.id === formData.employeeId)
      if (employee) {
        // Pre-fill some common fields
        setFormData(prev => ({
          ...prev,
          title: prev.title || `${categories.find(c => c.value === prev.templateId)?.label || 'Document'} - ${employee.name}`,
          fieldValues: {
            companyName: 'Galaxy ERP Solutions',
            companyAddress: '123 Business Street, City, Country',
            ...prev.fieldValues
          }
        }))
      }
    } catch (error) {
      console.error('Error fetching employee data:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.templateId || !formData.employeeId) {
      toast({
        title: 'Error',
        description: 'Please select a template and employee',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/hrm/documents/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to generate document')
      }

      const document = await res.json()
      
      toast({
        title: 'Success',
        description: 'Document generated successfully'
      })
      
      router.push('/dashboard/hrm/documents')
    } catch (error) {
      console.error(error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate document',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFieldChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      fieldValues: {
        ...prev.fieldValues,
        [fieldName]: value
      }
    }))
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
            <h1 className="text-2xl font-bold text-gray-900">Generate Document</h1>
            <Breadcrumbs items={breadcrumbs} className="mt-2" />
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document Template <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.templateId}
              onChange={(e) => setFormData(prev => ({ ...prev, templateId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a template</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

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
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Auto-generated if left empty"
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

        {/* Additional Fields Section */}
        {formData.templateId && formData.employeeId && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={formData.fieldValues.companyName || ''}
                  onChange={(e) => handleFieldChange('companyName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Address
                </label>
                <input
                  type="text"
                  value={formData.fieldValues.companyAddress || ''}
                  onChange={(e) => handleFieldChange('companyAddress', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Preview Section */}
        {previewContent && (
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Document Preview</h3>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPreview(true)}
              >
                <EyeIcon className="h-4 w-4 mr-2" />
                Full Screen Preview
              </Button>
            </div>
            <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 text-white text-sm font-semibold text-center">
                Live Preview
              </div>
              <div className="p-4 overflow-auto max-h-[500px]">
                <iframe
                  srcDoc={previewContent}
                  className="w-full h-full min-h-[500px] border-0 bg-white"
                  title="Document Preview"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          {previewContent && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPreview(true)}
            >
              <EyeIcon className="h-4 w-4 mr-2" />
              Preview
            </Button>
          )}
          <Button type="submit" disabled={loading} className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
            {loading ? 'Generating...' : 'Generate Document'}
          </Button>
        </div>
      </form>

      {/* Full Screen Preview Modal */}
      {showPreview && previewContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-500">
              <h2 className="text-xl font-bold text-white">Document Preview</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="text-white hover:text-gray-200"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              <div className="bg-white rounded-lg shadow-lg p-4">
                <iframe
                  srcDoc={previewContent}
                  className="w-full h-full min-h-[700px] border-0"
                  title="Full Screen Document Preview"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <Button
                variant="outline"
                onClick={() => setShowPreview(false)}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setShowPreview(false)
                  handleSubmit({ preventDefault: () => {} })
                }}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                Generate Document
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


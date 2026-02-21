'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import BackButton from '@/components/ui/BackButton'
import { toast } from '@/components/ui/Toast'
import { ROLES } from '@/lib/constants/roles'
import { 
  PlusIcon, 
  PencilIcon, 
  EyeIcon, 
  TrashIcon,
  DocumentTextIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { generateDocumentContent, getEmployeeFields } from '@/lib/document-generator'

export default function DocumentTemplatesPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [templates, setTemplates] = useState([])
  const [predefinedCategories, setPredefinedCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [previewTemplate, setPreviewTemplate] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [previewData, setPreviewData] = useState({})
  const [employees, setEmployees] = useState([])

  const isHRManager = session?.user?.role === ROLES.HR_MANAGER
  const isSuperAdmin = session?.user?.role === ROLES.SUPER_ADMIN
  const isAdmin = session?.user?.role === ROLES.ADMIN
  const canManage = isHRManager || isSuperAdmin || isAdmin

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'hrm', label: 'HRM', href: '/dashboard/hrm' },
    { key: 'documents', label: 'Documents', href: '/dashboard/hrm/documents' },
    { key: 'templates', label: 'Templates', href: '/dashboard/hrm/documents/templates' },
  ]

  useEffect(() => {
    fetchTemplates()
    fetchCategories()
    fetchEmployees()
  }, [])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/hrm/document-templates')
      if (res.ok) {
        const data = await res.json()
        setTemplates(data)
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
      toast({
        title: 'Error',
        description: 'Failed to load templates',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/hrm/document-templates/categories')
      if (res.ok) {
        const data = await res.json()
        setPredefinedCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

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

  const handleEdit = (template) => {
    setEditingTemplate({ ...template })
  }

  const handlePreview = async (template) => {
    // Use first employee for preview or create mock data
    const previewEmployee = employees[0] || {
      id: 'preview',
      employeeId: 'EMP001',
      name: 'John Doe',
      designation: 'Software Engineer',
      department: 'IT',
      dateOfJoining: new Date().toISOString(),
      salary: '50000',
      address: '123 Main Street, City, Country',
      contactNumber: '+1234567890'
    }

    const employeeFields = getEmployeeFields(previewEmployee)
    const generatedContent = generateDocumentContent(
      template.content,
      {
        ...employeeFields,
        companyName: 'Galaxy ERP Solutions',
        companyAddress: '123 Business Street, City, Country'
      },
      previewEmployee
    )

    setPreviewTemplate({
      ...template,
      previewContent: generatedContent
    })
  }

  const handleSave = async () => {
    if (!editingTemplate.name || !editingTemplate.category || !editingTemplate.content) {
      toast({
        title: 'Error',
        description: 'Name, category, and content are required',
        variant: 'destructive'
      })
      return
    }

    try {
      const url = editingTemplate.id 
        ? `/api/hrm/document-templates/${editingTemplate.id}`
        : '/api/hrm/document-templates'
      
      const method = editingTemplate.id ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingTemplate.name,
          category: editingTemplate.category,
          description: editingTemplate.description || '',
          content: editingTemplate.content,
          fields: editingTemplate.fields || [],
          isActive: editingTemplate.isActive !== false
        })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to save template')
      }

      toast({
        title: 'Success',
        description: `Template ${editingTemplate.id ? 'updated' : 'created'} successfully`
      })

      setEditingTemplate(null)
      fetchTemplates()
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save template',
        variant: 'destructive'
      })
    }
  }

  const handleDelete = async (templateId) => {
    if (!confirm('Are you sure you want to delete this template?')) return

    try {
      const res = await fetch(`/api/hrm/document-templates/${templateId}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        throw new Error('Failed to delete template')
      }

      toast({
        title: 'Success',
        description: 'Template deleted successfully'
      })

      fetchTemplates()
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete template',
        variant: 'destructive'
      })
    }
  }

  const baseTemplateContent = `<div class="header">
  <div class="company-name">{{companyName|Galaxy ERP Solutions}}</div>
  <div class="company-address">{{companyAddress|123 Business Street, City, Country}}</div>
</div>

<div class="document-title">DOCUMENT TITLE</div>

<div class="date">
  <strong>Date:</strong> {{currentDate}}
</div>

<div class="content">
  <p>Dear {{employeeName}},</p>
  
  <p>This is a sample document template. You can edit this content using the editor.</p>
  
  <p>Available placeholders:</p>
  <ul>
    <li>{{employeeName}} - Employee name</li>
    <li>{{employeeId}} - Employee ID</li>
    <li>{{designation}} - Designation</li>
    <li>{{department}} - Department</li>
    <li>{{salary}} - Salary</li>
    <li>{{dateOfJoining}} - Date of joining</li>
    <li>{{currentDate}} - Current date</li>
    <li>{{companyName}} - Company name</li>
    <li>{{companyAddress}} - Company address</li>
  </ul>
  
  <p>You can use <strong>HTML</strong> and <strong>CSS classes</strong> to style your template.</p>
</div>

<div class="signature-section">
  <div class="signature-box">
    <div class="signature-line">Employee Signature</div>
  </div>
  <div class="signature-box">
    <div class="signature-line">HR Manager</div>
  </div>
</div>

<div class="footer">
  This is a system-generated document. For any queries, please contact HR Department.
</div>`

  const handleCreateNew = () => {
    setEditingTemplate({
      name: '',
      category: '',
      description: '',
      content: baseTemplateContent,
      fields: [],
      isActive: true
    })
    setShowCreateModal(true)
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
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <BackButton href="/dashboard/hrm/documents" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Document Templates</h1>
              <Breadcrumbs items={breadcrumbs} className="mt-2" />
            </div>
          </div>
        </div>
        <Button onClick={handleCreateNew}>
          <PlusIcon className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      {/* Templates List */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <h2 className="text-lg font-semibold text-gray-900">Available Templates</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Template</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {templates.map((template) => (
                  <tr key={template.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center mr-3">
                          <DocumentTextIcon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{template.name}</div>
                          {template.description && (
                            <div className="text-xs text-gray-500">{template.description}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {template.category.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        template.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {template.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(template.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handlePreview(template)}
                          className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded"
                          title="Preview"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleEdit(template)}
                          className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded"
                          title="Edit"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(template.id)}
                          className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {templates.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                      No templates found. Click "New Template" to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit/Create Modal */}
      {editingTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-500 to-blue-500">
              <h2 className="text-xl font-bold text-white">
                {editingTemplate.id ? 'Edit Template' : 'Create New Template'}
              </h2>
              <button
                onClick={() => {
                  setEditingTemplate(null)
                  setShowCreateModal(false)
                }}
                className="text-white hover:text-gray-200"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Editor Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <PencilIcon className="h-5 w-5 text-purple-500" />
                    Template Editor
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Template Name *
                    </label>
                    <input
                      type="text"
                      value={editingTemplate.name}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., Offer Letter Template"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      value={editingTemplate.category}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select category</option>
                      {predefinedCategories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                      <option value="CUSTOM">Custom</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={editingTemplate.description || ''}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Template description"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      HTML Content *
                    </label>
                    <textarea
                      value={editingTemplate.content}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, content: e.target.value })}
                      className="w-full h-96 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                      placeholder="Enter HTML template content..."
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Use placeholders like {'{{employeeName}}'} for dynamic content
                    </p>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={editingTemplate.isActive !== false}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, isActive: e.target.checked })}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                      Active
                    </label>
                  </div>
                </div>

                {/* Preview Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <EyeIcon className="h-5 w-5 text-blue-500" />
                    Live Preview
                  </h3>
                  
                  <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 text-white text-sm font-semibold text-center">
                      Document Preview
                    </div>
                    <div className="p-4 overflow-auto max-h-[600px]">
                      <iframe
                        srcDoc={editingTemplate.content}
                        className="w-full h-full min-h-[600px] border-0 bg-white"
                        title="Template Preview"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <Button
                variant="outline"
                onClick={() => {
                  setEditingTemplate(null)
                  setShowCreateModal(false)
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handlePreview(editingTemplate)}
                variant="outline"
              >
                <EyeIcon className="h-4 w-4 mr-2" />
                Preview with Data
              </Button>
              <Button onClick={handleSave} className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
                <CheckIcon className="h-4 w-4 mr-2" />
                {editingTemplate.id ? 'Update' : 'Create'} Template
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal with Data */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-500">
              <h2 className="text-xl font-bold text-white">
                Template Preview: {previewTemplate.name}
              </h2>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="text-white hover:text-gray-200"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              <div className="bg-white rounded-lg shadow-lg p-4">
                <iframe
                  srcDoc={previewTemplate.previewContent}
                  className="w-full h-full min-h-[700px] border-0"
                  title="Template Preview with Data"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <Button
                variant="outline"
                onClick={() => setPreviewTemplate(null)}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setPreviewTemplate(null)
                  handleEdit(previewTemplate)
                }}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit Template
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


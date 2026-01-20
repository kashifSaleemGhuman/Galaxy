'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import { toast } from '@/components/ui/Toast'
import { ROLES } from '@/lib/constants/roles'
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline'

export default function SalaryStructuresPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [structures, setStructures] = useState([])
  const [loading, setLoading] = useState(true)
  const [employees, setEmployees] = useState([])
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingStructure, setEditingStructure] = useState(null)

  const isHRManager = session?.user?.role === ROLES.HR_MANAGER
  const isSuperAdmin = session?.user?.role === ROLES.SUPER_ADMIN
  const isAdmin = session?.user?.role === ROLES.ADMIN
  const canManage = isHRManager || isSuperAdmin || isAdmin

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'hrm', label: 'HRM', href: '/dashboard/hrm' },
    { key: 'payroll', label: 'Payroll', href: '/dashboard/hrm/payroll' },
    { key: 'salary-structures', label: 'Salary Structures', href: '/dashboard/hrm/payroll/salary-structures' },
  ]

  useEffect(() => {
    fetchEmployees()
    fetchStructures()
  }, [selectedEmployee])

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/organization/employees')
      if (res.ok) {
        const data = await res.json()
        setEmployees(data.filter(e => !e.dateOfLeaving))
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
    }
  }

  const fetchStructures = async () => {
    try {
      setLoading(true)
      let url = '/api/hrm/payroll/salary-structures'
      if (selectedEmployee) {
        url += `?employeeId=${selectedEmployee}`
      }
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setStructures(data)
      }
    } catch (error) {
      console.error('Error fetching structures:', error)
      toast({
        title: 'Error',
        description: 'Failed to load salary structures',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this salary structure?')) return

    try {
      const res = await fetch(`/api/hrm/payroll/salary-structures/${id}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to delete')
      }

      toast({
        title: 'Success',
        description: 'Salary structure deleted successfully'
      })

      fetchStructures()
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0
    }).format(amount)
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
          <h1 className="text-2xl font-bold text-gray-900">Salary Structures</h1>
          <Breadcrumbs items={breadcrumbs} className="mt-2" />
        </div>
        <Button onClick={() => {
          setEditingStructure(null)
          setShowModal(true)
        }}>
          <PlusIcon className="h-4 w-4 mr-2" />
          New Structure
        </Button>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Employee</label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Employees</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.employeeId})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Structures Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading salary structures...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Effective Period</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Components</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {structures.map((structure) => (
                  <tr key={structure.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{structure.employee.name}</div>
                      <div className="text-xs text-gray-500">{structure.employee.employeeId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{new Date(structure.effectiveFrom).toLocaleDateString()}</div>
                      {structure.effectiveTo && (
                        <div className="text-xs">to {new Date(structure.effectiveTo).toLocaleDateString()}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {structure.components.length} components
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {structure.components.slice(0, 2).map(c => c.name).join(', ')}
                        {structure.components.length > 2 && '...'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        structure.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {structure.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            setEditingStructure(structure)
                            setShowModal(true)
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="View/Edit"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(structure.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {structures.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                      No salary structures found. Click "New Structure" to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <SalaryStructureModal
          structure={editingStructure}
          employees={employees}
          onClose={() => {
            setShowModal(false)
            setEditingStructure(null)
          }}
          onSuccess={() => {
            fetchStructures()
            setShowModal(false)
            setEditingStructure(null)
          }}
        />
      )}
    </div>
  )
}

// Salary Structure Modal Component
function SalaryStructureModal({ structure, employees, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    employeeId: structure?.employeeId || '',
    effectiveFrom: structure?.effectiveFrom ? new Date(structure.effectiveFrom).toISOString().split('T')[0] : '',
    effectiveTo: structure?.effectiveTo ? new Date(structure.effectiveTo).toISOString().split('T')[0] : '',
    components: structure?.components || [
      { name: 'Basic Salary', type: 'ALLOWANCE', calculationType: 'FIXED', amount: 0, priority: 0, isTaxable: false }
    ]
  })
  const [loading, setLoading] = useState(false)

  const handleAddComponent = () => {
    setFormData(prev => ({
      ...prev,
      components: [...prev.components, {
        name: '',
        type: 'ALLOWANCE',
        calculationType: 'FIXED',
        amount: 0,
        priority: prev.components.length,
        isTaxable: false
      }]
    }))
  }

  const handleRemoveComponent = (index) => {
    setFormData(prev => ({
      ...prev,
      components: prev.components.filter((_, i) => i !== index)
    }))
  }

  const handleComponentChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      components: prev.components.map((comp, i) => 
        i === index ? { ...comp, [field]: value } : comp
      )
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = structure 
        ? `/api/hrm/payroll/salary-structures/${structure.id}`
        : '/api/hrm/payroll/salary-structures'
      
      const method = structure ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to save')
      }

      toast({
        title: 'Success',
        description: structure ? 'Salary structure updated' : 'Salary structure created'
      })

      onSuccess()
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {structure ? 'Edit Salary Structure' : 'Create Salary Structure'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee *</label>
              <select
                value={formData.employeeId}
                onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                required
                disabled={!!structure}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Employee</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.employeeId})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Effective From *</label>
              <input
                type="date"
                value={formData.effectiveFrom}
                onChange={(e) => setFormData(prev => ({ ...prev, effectiveFrom: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Effective To (Optional)</label>
            <input
              type="date"
              value={formData.effectiveTo}
              onChange={(e) => setFormData(prev => ({ ...prev, effectiveTo: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Components *</label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddComponent}>
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Component
              </Button>
            </div>

            <div className="space-y-3">
              {formData.components.map((comp, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-md space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Component {index + 1}</span>
                    {formData.components.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveComponent(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Name *</label>
                      <input
                        type="text"
                        value={comp.name}
                        onChange={(e) => handleComponentChange(index, 'name', e.target.value)}
                        required
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                        placeholder="e.g., Basic Salary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Type *</label>
                      <select
                        value={comp.type}
                        onChange={(e) => handleComponentChange(index, 'type', e.target.value)}
                        required
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                      >
                        <option value="ALLOWANCE">Allowance</option>
                        <option value="DEDUCTION">Deduction</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Calculation *</label>
                      <select
                        value={comp.calculationType}
                        onChange={(e) => handleComponentChange(index, 'calculationType', e.target.value)}
                        required
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                      >
                        <option value="FIXED">Fixed</option>
                        <option value="PERCENTAGE">Percentage</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Amount *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={comp.amount}
                        onChange={(e) => handleComponentChange(index, 'amount', parseFloat(e.target.value) || 0)}
                        required
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
                      <input
                        type="number"
                        value={comp.priority}
                        onChange={(e) => handleComponentChange(index, 'priority', parseInt(e.target.value) || 0)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                      />
                    </div>
                    {comp.type === 'ALLOWANCE' && (
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={comp.isTaxable}
                          onChange={(e) => handleComponentChange(index, 'isTaxable', e.target.checked)}
                          className="mr-2"
                        />
                        <label className="text-xs text-gray-700">Taxable</label>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {structure ? 'Update' : 'Create'} Structure
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}


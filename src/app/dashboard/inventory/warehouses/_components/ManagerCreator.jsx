'use client'

import { useState, useEffect } from 'react'
import { X, UserPlus, Eye, EyeOff, Copy, Check, Loader2 } from 'lucide-react'

export default function ManagerCreator({ warehouseId, warehouseName, isOpen, onClose, onManagerCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [credentials, setCredentials] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [copied, setCopied] = useState(false)

  // Load credentials from localStorage on mount and when modal opens
  useEffect(() => {
    if (warehouseId && isOpen) {
      // First try localStorage
      const stored = localStorage.getItem(`manager_creds_${warehouseId}`)
      if (stored) {
        try {
          setCredentials(JSON.parse(stored))
        } catch (e) {
          console.error('Error parsing stored credentials:', e)
        }
      } else {
        // If not in localStorage, try to fetch from API
        fetch(`/api/inventory/warehouses/${warehouseId}/create-manager`)
          .then(res => res.json())
          .then(data => {
            if (data.data?.credentials) {
              const creds = data.data.credentials
              setCredentials(creds)
              localStorage.setItem(`manager_creds_${warehouseId}`, JSON.stringify(creds))
            }
          })
          .catch(err => console.error('Error fetching credentials:', err))
      }
    }
  }, [warehouseId, isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate
    const newErrors = {}
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/inventory/warehouses/${warehouseId}/create-manager`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const data = await response.json()
        const creds = data.data.credentials
        setCredentials(creds)
        // Store in localStorage for persistence after page reload
        if (creds) {
          localStorage.setItem(`manager_creds_${warehouseId}`, JSON.stringify(creds))
        }
        setFormData({ name: '', email: '' })
        setErrors({})
        if (onManagerCreated) {
          onManagerCreated()
        }
      } else {
        const error = await response.json()
        setErrors({ submit: error.error || 'Failed to create manager' })
      }
    } catch (error) {
      console.error('Error creating manager:', error)
      setErrors({ submit: 'Failed to create manager' })
    } finally {
      setLoading(false)
    }
  }

  const handleCopyCredentials = () => {
    const text = `Email: ${credentials.email}\nPassword: ${credentials.password}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClose = () => {
    // Don't clear credentials from localStorage - keep them for persistence
    setFormData({ name: '', email: '' })
    setErrors({})
    setShowPassword(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {credentials ? 'Manager Credentials' : 'Create Warehouse Manager'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {!credentials ? (
            <>
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Create a manager/operator for <strong>{warehouseName}</strong>. 
                  A secure password will be generated automatically.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Manager Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value })
                      if (errors.name) setErrors({ ...errors, name: '' })
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="John Doe"
                    disabled={loading}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value })
                      if (errors.email) setErrors({ ...errors, email: '' })
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="manager@warehouse.com"
                    disabled={loading}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-600 text-sm">{errors.submit}</p>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <UserPlus className="h-4 w-4" />
                    )}
                    <span>Create Manager</span>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-green-900">
                    Manager Created Successfully!
                  </h3>
                </div>
                <p className="text-sm text-green-700">
                  {credentials ? 'Manager credentials retrieved successfully. Please save these credentials securely.' : 'Please save these credentials. The password cannot be retrieved later.'}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Email
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={credentials.email}
                      readOnly
                      className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg font-mono text-sm"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(credentials.email)
                        setCopied(true)
                        setTimeout(() => setCopied(false), 2000)
                      }}
                      className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg"
                      title="Copy email"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Password
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={credentials.password}
                      readOnly
                      className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg font-mono text-sm"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={handleCopyCredentials}
                      className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg"
                      title="Copy credentials"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Important:</strong> This password is shown only once. Make sure to save it securely.
                  The manager will be able to change it after first login.
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}



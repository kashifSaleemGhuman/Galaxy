'use client'

import { useState, useEffect } from 'react'
import { XMarkIcon, KeyIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'

export default function CredentialsModal({ employeeId, employeeName, isOpen, onClose, credentials: providedCredentials }) {
  const [loading, setLoading] = useState(false)
  const [credentials, setCredentials] = useState(providedCredentials || null)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (providedCredentials) {
      setCredentials(providedCredentials)
    } else if (isOpen && employeeId) {
      fetchCredentials()
    } else {
      setCredentials(null)
      setError('')
    }
  }, [isOpen, employeeId, providedCredentials])

  const fetchCredentials = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/organization/employees/${employeeId}/credentials`)
      if (!res.ok) {
        const data = await res.text()
        throw new Error(data || 'Failed to fetch credentials')
      }
      const data = await res.json()
      setCredentials(data)
    } catch (err) {
      console.error(err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    // You can add a toast notification here if needed
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <KeyIcon className="h-6 w-6 text-blue-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">
                  Employee Credentials
                </h3>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {loading ? (
              <div className="py-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-500">Loading credentials...</p>
              </div>
            ) : error ? (
              <div className="py-4">
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            ) : credentials ? (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Employee</p>
                  <p className="text-sm text-gray-900">{employeeName}</p>
                  {credentials.employeeId && (
                    <p className="text-xs text-gray-500 mt-1">ID: {credentials.employeeId}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Login Email
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      readOnly
                      value={credentials.email}
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-gray-50"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(credentials.email)}
                    >
                      Copy
                    </Button>
                  </div>
                </div>

                {credentials.password ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Temporary Password
                    </label>
                    <div className="flex items-center space-x-2">
                      <div className="relative flex-1">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          readOnly
                          value={credentials.password}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-gray-50 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                        >
                          {showPassword ? (
                            <EyeSlashIcon className="h-5 w-5" />
                          ) : (
                            <EyeIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(credentials.password)}
                      >
                        Copy
                      </Button>
                    </div>
                    <p className="mt-2 text-xs text-yellow-600 bg-yellow-50 p-2 rounded">
                      Keep this password secure. Super admin can retrieve it again from credentials.
                    </p>
                  </div>
                ) : (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <p className="text-sm text-blue-800">
                      {credentials.message || 'Password cannot be retrieved. Use reset password feature to set a new password.'}
                    </p>
                  </div>
                )}

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600">
                    <strong>Role:</strong> {credentials.role || 'USER'}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    <strong>Status:</strong> {credentials.isActive !== undefined ? (credentials.isActive ? 'Active' : 'Inactive') : 'N/A'}
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <Button
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}


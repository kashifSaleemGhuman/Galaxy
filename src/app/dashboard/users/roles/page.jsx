'use client'

import { useState } from 'react'
import { ShieldCheck, Users, ClipboardCheck, Loader2 } from 'lucide-react'

export default function RolesSetupPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleCreateAll = async () => {
    try {
      setLoading(true)
      setError('')
      setResult(null)
      const res = await fetch('/api/users/setup-roles', { method: 'POST' })
      const json = await res.json()
      if (!res.ok || !json.success) {
        setError(json.error || 'Failed to create roles')
        return
      }
      setResult(json.created || [])
    } catch (e) {
      setError('Failed to create roles')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <ShieldCheck className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Roles & Seed Users</h1>
            <p className="text-gray-600">Super Admin can create all roles and essential user accounts</p>
          </div>
        </div>
        <button
          onClick={handleCreateAll}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ClipboardCheck className="w-4 h-4 mr-2" />}
          {loading ? 'Creating…' : 'Create All Roles'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">{error}</div>
      )}

      {Array.isArray(result) && result.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center space-x-2">
            <Users className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900">Created / Updated Accounts</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {result.map((acc, idx) => (
              <div key={idx} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{acc.email}</p>
                  <p className="text-xs text-gray-500">Role: {acc.role}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-900">Password: <span className="font-mono">{acc.password}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}



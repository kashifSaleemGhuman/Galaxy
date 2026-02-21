'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import BackButton from '@/components/ui/BackButton'

export default function MyPenaltiesPage() {
  const [penalties, setPenalties] = useState([])
  const [loading, setLoading] = useState(true)

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'hrm', label: 'HRM', href: '/dashboard/hrm' },
    { key: 'my-penalties', label: 'My Penalties', href: '/dashboard/hrm/my-penalties' }
  ]

  useEffect(() => {
    fetchPenalties()
  }, [])

  const fetchPenalties = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/hrm/penalties')
      if (res.ok) {
        const data = await res.json()
        setPenalties(data.penalties || [])
      }
    } catch (error) {
      console.error('Error fetching penalties:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BackButton href="/dashboard/hrm" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Penalties</h1>
          <Breadcrumbs items={breadcrumbs} className="mt-2" />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 font-semibold text-gray-900">Penalties</div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Date</th>
                <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Reason</th>
                <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Description</th>
                <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {penalties.map((penalty) => (
                <tr key={penalty.id}>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {new Date(penalty.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {penalty.amount ? `PKR ${Number(penalty.amount).toFixed(2)}` : 'N/A'}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">{penalty.reason}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {penalty.description || '-'}
                  </td>
                  <td className="px-4 py-2">
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      penalty.status === 'ACTIVE' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {penalty.status}
                    </span>
                  </td>
                </tr>
              ))}
              {penalties.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                    No penalties found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}


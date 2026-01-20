'use client'

import useSWR from 'swr'
import { AlertTriangle, Truck, Clock, ArrowRight, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'

const fetcher = (url) => fetch(url).then((res) => res.json())

const formatDate = (d) => d ? new Date(d).toLocaleString() : '—'

const movementIcon = (type) => {
  switch (type) {
    case 'in': return <TrendingUp className="h-4 w-4 text-green-600" />
    case 'out': return <TrendingDown className="h-4 w-4 text-red-600" />
    case 'transfer': return <ArrowRight className="h-4 w-4 text-blue-600" />
    case 'adjustment': return <BarChart3 className="h-4 w-4 text-orange-600" />
    default: return <Clock className="h-4 w-4 text-gray-600" />
  }
}

export default function InventoryReports() {
  const { data, error, isLoading } = useSWR('/api/inventory/stats', fetcher, {
    refreshInterval: 5000
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || data?.error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-800 border border-red-200 rounded-lg p-4">
          <p className="font-semibold">Failed to load reports</p>
          <p className="text-sm">{error?.message || data?.error || 'Unknown error'}</p>
        </div>
      </div>
    )
  }

  const lowStock = data?.lowStock || []
  const recentMovements = data?.recentMovements || []
  const pendingReceipts = data?.pendingReceipts || []

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Reports</h1>
          <p className="text-gray-600 mt-2">Real-time status across stock, movements, and receipts</p>
        </div>
      </div>

      {/* Low Stock */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h2 className="text-lg font-semibold text-gray-900">Low Stock</h2>
          </div>
          <span className="text-sm text-gray-600">{lowStock.length} items</span>
        </div>
        <div className="divide-y divide-gray-100">
          {lowStock.length === 0 && (
            <div className="p-4 text-sm text-gray-500">No low stock items 🎉</div>
          )}
          {lowStock.map((item) => (
            <div key={item.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{item.productName}</p>
                <p className="text-sm text-gray-500">{item.warehouseName}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-900">Qty: {item.quantity}</p>
                <p className="text-xs text-gray-500">Min: {item.minLevel}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Receipts */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Truck className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Pending Receipts</h2>
          </div>
          <span className="text-sm text-gray-600">{pendingReceipts.length} shipments</span>
        </div>
        <div className="divide-y divide-gray-100">
          {pendingReceipts.length === 0 && (
            <div className="p-4 text-sm text-gray-500">No pending receipts</div>
          )}
          {pendingReceipts.map((r) => (
            <div key={r.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{r.id}</p>
                <p className="text-sm text-gray-500">{r.warehouse} • {r.supplier}</p>
              </div>
              <div className="text-right text-sm text-gray-500">
                {formatDate(r.expectedDate)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Movements */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ArrowRight className="h-5 w-5 text-orange-600" />
            <h2 className="text-lg font-semibold text-gray-900">Recent Movements</h2>
          </div>
          <span className="text-sm text-gray-600">{recentMovements.length} records</span>
        </div>
        <div className="divide-y divide-gray-100">
          {recentMovements.length === 0 && (
            <div className="p-4 text-sm text-gray-500">No recent movements</div>
          )}
          {recentMovements.map((m) => (
            <div key={m.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gray-50 rounded-lg flex items-center justify-center">
                  {movementIcon(m.type)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{m.product}</p>
                  <p className="text-sm text-gray-500">{m.warehouse} • {m.reference || '—'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{m.quantity}</p>
                <p className="text-xs text-gray-500">{formatDate(m.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


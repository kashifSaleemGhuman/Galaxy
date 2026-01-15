'use client'

import { useState, useEffect } from 'react'
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock,
  AlertTriangle,
  TrendingUp,
  Building2
} from 'lucide-react'
import Link from 'next/link'

export default function WarehouseDashboard() {
  const [stats, setStats] = useState({
    pendingShipments: 0,
    processedToday: 0,
    totalProcessed: 0,
    averageProcessingTime: 0
  })
  const [recentShipments, setRecentShipments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWarehouseData()
  }, [])

  const fetchWarehouseData = async () => {
    try {
      setLoading(true)
      
      // Fetch pending shipments
      const shipmentsResponse = await fetch('/api/warehouse/shipments')
      if (shipmentsResponse.ok) {
        const shipmentsData = await shipmentsResponse.json()
        if (shipmentsData.success) {
          const shipments = shipmentsData.data
          const pending = shipments.filter(s => s.status === 'assigned').length
          const processed = shipments.filter(s => s.status === 'processed').length
          
          setStats({
            pendingShipments: pending,
            processedToday: processed, // Simplified for now
            totalProcessed: processed,
            averageProcessingTime: 0 // Would calculate from actual data
          })
          
          setRecentShipments(shipments.slice(0, 5))
        }
      }
    } catch (error) {
      console.error('Error fetching warehouse data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'assigned': return 'bg-yellow-100 text-yellow-800'
      case 'processed': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'assigned': return <Clock className="w-4 h-4" />
      case 'processed': return <CheckCircle className="w-4 h-4" />
      case 'rejected': return <AlertTriangle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending Shipments</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.pendingShipments}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Processed Today</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.processedToday}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Package className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Processed</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalProcessed}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg. Processing Time</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.averageProcessingTime}m</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/dashboard/warehouse/shipments"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Truck className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">View Shipments</p>
              <p className="text-sm text-gray-500">Check incoming shipments</p>
            </div>
          </Link>
          
          <Link
            href="/dashboard/warehouse/process"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Process Goods</p>
              <p className="text-sm text-gray-500">Confirm receipt of goods</p>
            </div>
          </Link>
          
          <Link
            href="/dashboard/warehouse/completed"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Package className="w-6 h-6 text-purple-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Completed Tasks</p>
              <p className="text-sm text-gray-500">View processed shipments</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Shipments */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Shipments</h3>
        </div>
        
        {recentShipments.length === 0 ? (
          <div className="text-center py-12">
            <Truck className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No shipments found</h3>
            <p className="mt-1 text-sm text-gray-500">
              No incoming shipments available at the moment.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {recentShipments.map((shipment) => (
              <div key={shipment.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Truck className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900">
                          {shipment.shipmentNumber}
                        </p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(shipment.status)}`}>
                          {getStatusIcon(shipment.status)}
                          <span className="ml-1 capitalize">{shipment.status}</span>
                        </span>
                      </div>
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                        <span>PO: {shipment.poId}</span>
                        <span>Supplier: {shipment.supplier?.name}</span>
                        <span>Items: {shipment.totalItems}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/dashboard/warehouse/shipments/${shipment.id}`}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                    >
                      View Details
                    </Link>
                    {shipment.status === 'assigned' && (
                      <Link
                        href={`/dashboard/warehouse/process/${shipment.id}`}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200"
                      >
                        Process
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


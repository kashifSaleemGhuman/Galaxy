'use client'

import { useState, useEffect } from 'react'
import { 
  CheckCircle, 
  XCircle, 
  Package, 
  Truck,
  Calendar,
  Clock
} from 'lucide-react'

export default function CompletedTasks() {
  const [completedShipments, setCompletedShipments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchCompletedShipments()
  }, [])

  const fetchCompletedShipments = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/warehouse/shipments?status=processed,rejected')
      
      if (response.ok) {
        const result = await response.json()
        if (result.success && Array.isArray(result.data)) {
          setCompletedShipments(result.data)
        } else {
          console.error('Invalid data format:', result)
          setCompletedShipments([])
        }
      }
    } catch (error) {
      console.error('Error fetching completed shipments:', error)
      setCompletedShipments([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'processed': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'processed': return <CheckCircle className="w-4 h-4" />
      case 'rejected': return <XCircle className="w-4 h-4" />
      default: return <Package className="w-4 h-4" />
    }
  }

  const filteredShipments = Array.isArray(completedShipments) ? completedShipments.filter(shipment => {
    const matchesSearch = shipment.poId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        shipment.supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        shipment.shipmentNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || shipment.status === statusFilter
    return matchesSearch && matchesStatus
  }) : []

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Completed Tasks</h1>
          <p className="text-gray-600">View processed and rejected shipments</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Processed Today</p>
              <p className="text-2xl font-semibold text-gray-900">
                {completedShipments.filter(s => s.status === 'processed').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Rejected Today</p>
              <p className="text-2xl font-semibold text-gray-900">
                {completedShipments.filter(s => s.status === 'rejected').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Package className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Completed</p>
              <p className="text-2xl font-semibold text-gray-900">{completedShipments.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by PO, supplier, or shipment number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="processed">Processed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Completed Shipments List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Completed Shipments ({filteredShipments.length})
          </h3>
        </div>
        
        {filteredShipments.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No completed shipments found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'No completed shipments available at the moment.'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredShipments.map((shipment) => (
              <div key={shipment.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        shipment.status === 'processed' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {shipment.status === 'processed' ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
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
                        <span>Value: ${shipment.totalValue?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="mt-1 flex items-center space-x-4 text-xs text-gray-400">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          Processed: {shipment.processedAt ? new Date(shipment.processedAt).toLocaleDateString() : 'N/A'}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {shipment.processedAt ? new Date(shipment.processedAt).toLocaleTimeString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {shipment.status === 'processed' ? 'Successfully Processed' : 'Rejected'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {shipment.notes || 'No notes available'}
                    </p>
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



'use client'

import { useState, useEffect } from 'react'
import { 
  Truck, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Search,
  Eye
} from 'lucide-react'
import Link from 'next/link'

export default function WarehouseShipments() {
  const [shipments, setShipments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedShipment, setSelectedShipment] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchShipments()
  }, [])

  const fetchShipments = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/warehouse/shipments')
      if (response.ok) {
        const result = await response.json()
        if (result.success && Array.isArray(result.data)) {
          setShipments(result.data)
        } else {
          setShipments([])
        }
      } else {
        setShipments([])
      }
    } catch (error) {
      console.error('Error fetching shipments:', error)
      setShipments([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'assigned': return 'bg-blue-100 text-blue-800'
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

  const filteredShipments = Array.isArray(shipments) ? shipments.filter(shipment => {
    const matchesSearch = shipment.poId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          shipment.supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          shipment.shipmentNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || shipment.status === statusFilter
    return matchesSearch && matchesStatus
  }) : []

  const handleViewDetails = (shipment) => {
    setSelectedShipment(shipment)
    setShowModal(true)
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Incoming Shipments</h1>
          <p className="text-gray-600">Shipments assigned to warehouses</p>
        </div>
        <Link
          href="/dashboard/warehouse"
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Back to Warehouse
        </Link>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by PO, supplier, or shipment number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="assigned">Assigned</option>
              <option value="processed">Processed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Shipments ({filteredShipments.length})
          </h3>
        </div>

        {filteredShipments.length === 0 ? (
          <div className="text-center py-12">
            <Truck className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No shipments found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'No incoming shipments available at the moment.'
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
                        <span>Value: ${shipment.totalValue?.toFixed(2) || '0.00'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/dashboard/warehouse/shipments/${shipment.id}`}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Eye className="w-3 h-3 mr-1" />
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

      {/* Details Modal */}
      {showModal && selectedShipment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Shipment Details
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Shipment Number</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedShipment.shipmentNumber}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedShipment.status)}`}>
                      {getStatusIcon(selectedShipment.status)}
                      <span className="ml-1 capitalize">{selectedShipment.status}</span>
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Purchase Order</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedShipment.poId}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Supplier</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedShipment.supplier?.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Warehouse</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedShipment.warehouse?.name || 'Not assigned'}</p>
                </div>

                {selectedShipment.lines && selectedShipment.lines.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Items</label>
                    <div className="space-y-2">
                      {selectedShipment.lines.map((line, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{line.productName}</p>
                            <p className="text-xs text-gray-500">Expected: {line.quantityExpected}</p>
                            <p className="text-xs text-gray-500">Received: {line.quantityReceived}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-900">${line.unitPrice}</p>
                            <p className="text-xs text-gray-500">Total: {(parseFloat(line.unitPrice) * line.quantityExpected).toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}



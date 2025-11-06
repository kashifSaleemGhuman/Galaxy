'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { 
  CheckCircle, 
  XCircle, 
  Package, 
  Truck,
  AlertTriangle,
  Save
} from 'lucide-react'

export default function ProcessGoods() {
  const [shipments, setShipments] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState({})

  useEffect(() => {
    fetchAssignedShipments()
  }, [])

  const fetchAssignedShipments = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/warehouse/shipments?status=assigned')
      
      if (response.ok) {
        const result = await response.json()
        if (result.success && Array.isArray(result.data)) {
          setShipments(result.data)
        } else {
          console.error('Invalid data format:', result)
          setShipments([])
        }
      }
    } catch (error) {
      console.error('Error fetching shipments:', error)
      setShipments([])
    } finally {
      setLoading(false)
    }
  }

  const handleProcessShipment = async (shipmentId) => {
    try {
      setProcessing(prev => ({ ...prev, [shipmentId]: true }))
      
      const response = await fetch(`/api/warehouse/shipments/${shipmentId}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes: 'Goods received and processed by warehouse operator'
        })
      })

      const result = await response.json()
      
      if (result.success) {
        alert('Shipment processed successfully! Stock has been updated.')
        fetchAssignedShipments() // Refresh the list
      } else {
        alert(`Error: ${result.error || 'Failed to process shipment'}`)
      }
    } catch (error) {
      console.error('Error processing shipment:', error)
      alert('Error processing shipment')
    } finally {
      setProcessing(prev => ({ ...prev, [shipmentId]: false }))
    }
  }

  const handleRejectShipment = async (shipmentId) => {
    if (!confirm('Are you sure you want to reject this shipment?')) {
      return
    }

    try {
      setProcessing(prev => ({ ...prev, [shipmentId]: true }))
      
      const response = await fetch(`/api/warehouse/shipments/${shipmentId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes: 'Shipment rejected by warehouse operator'
        })
      })

      const result = await response.json()
      
      if (result.success) {
        alert('Shipment rejected successfully!')
        fetchAssignedShipments() // Refresh the list
      } else {
        alert(`Error: ${result.error || 'Failed to reject shipment'}`)
      }
    } catch (error) {
      console.error('Error rejecting shipment:', error)
      alert('Error rejecting shipment')
    } finally {
      setProcessing(prev => ({ ...prev, [shipmentId]: false }))
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Process Goods</h1>
          <p className="text-gray-600">Confirm receipt and process incoming shipments</p>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Processing Instructions</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Verify the physical goods match the shipment details</li>
                <li>Check quantities and quality of received items</li>
                <li>Click "Process" to confirm receipt and update inventory</li>
                <li>Click "Reject" only if goods don't match or are damaged</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Shipments List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Assigned Shipments ({shipments.length})
          </h3>
        </div>
        
        {shipments.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No shipments to process</h3>
            <p className="mt-1 text-sm text-gray-500">
              No assigned shipments available for processing at the moment.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {shipments.map((shipment) => (
              <div key={shipment.id} className="px-6 py-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <Truck className="w-6 h-6 text-yellow-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-lg font-medium text-gray-900">
                          {shipment.shipmentNumber}
                        </h4>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Package className="w-3 h-3 mr-1" />
                          Assigned
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Purchase Order</p>
                          <p className="text-sm font-medium text-gray-900">{shipment.poId}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Supplier</p>
                          <p className="text-sm font-medium text-gray-900">{shipment.supplier?.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Warehouse</p>
                          <p className="text-sm font-medium text-gray-900">{shipment.warehouse?.name || 'Not assigned'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Total Value</p>
                          <p className="text-sm font-medium text-gray-900">${shipment.totalValue?.toFixed(2) || '0.00'}</p>
                        </div>
                      </div>

                      {/* Items */}
                      {shipment.lines && shipment.lines.length > 0 && (
                        <div className="mt-4">
                          <h5 className="text-sm font-medium text-gray-900 mb-2">Items to Receive</h5>
                          <div className="space-y-2">
                            {shipment.lines.map((line, index) => (
                              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">{line.productName}</p>
                                  <p className="text-xs text-gray-500">Expected: {line.quantityExpected} units</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm text-gray-900">${line.unitPrice} each</p>
                                  <p className="text-xs text-gray-500">Total: ${(parseFloat(line.unitPrice) * line.quantityExpected).toFixed(2)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-4">
                    <button
                      onClick={() => handleProcessShipment(shipment.id)}
                      disabled={processing[shipment.id]}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing[shipment.id] ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Process
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => handleRejectShipment(shipment.id)}
                      disabled={processing[shipment.id]}
                      className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </button>
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



'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  CheckCircle, 
  XCircle, 
  Package, 
  Truck,
  AlertTriangle,
  ArrowLeft,
  Save
} from 'lucide-react'
import Link from 'next/link'

export default function ProcessShipment() {
  const params = useParams()
  const router = useRouter()
  const [shipment, setShipment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (params.id) {
      fetchShipment(params.id)
    }
  }, [params.id])

  const fetchShipment = async (shipmentId) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/warehouse/shipments/${shipmentId}`)
      
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setShipment(result.data)
        } else {
          console.error('Error fetching shipment:', result.error)
          alert('Error fetching shipment details')
        }
      } else {
        alert('Failed to fetch shipment details')
      }
    } catch (error) {
      console.error('Error fetching shipment:', error)
      alert('Error fetching shipment details')
    } finally {
      setLoading(false)
    }
  }

  const handleProcessShipment = async () => {
    if (!shipment) return

    try {
      setProcessing(true)
      
      const response = await fetch(`/api/warehouse/shipments/${shipment.id}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes: notes || 'Goods received and processed by warehouse operator'
        })
      })

      const result = await response.json()
      
      if (result.success) {
        alert('Shipment processed successfully! Stock has been updated.')
        router.push('/dashboard/warehouse/completed')
      } else {
        alert(`Error: ${result.error || 'Failed to process shipment'}`)
      }
    } catch (error) {
      console.error('Error processing shipment:', error)
      alert('Error processing shipment')
    } finally {
      setProcessing(false)
    }
  }

  const handleRejectShipment = async () => {
    if (!shipment) return

    if (!confirm('Are you sure you want to reject this shipment? This action cannot be undone.')) {
      return
    }

    try {
      setProcessing(true)
      
      const response = await fetch(`/api/warehouse/shipments/${shipment.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes: notes || 'Shipment rejected by warehouse operator'
        })
      })

      const result = await response.json()
      
      if (result.success) {
        alert('Shipment rejected successfully!')
        router.push('/dashboard/warehouse/completed')
      } else {
        alert(`Error: ${result.error || 'Failed to reject shipment'}`)
      }
    } catch (error) {
      console.error('Error rejecting shipment:', error)
      alert('Error rejecting shipment')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!shipment) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Shipment not found</h3>
        <p className="mt-1 text-sm text-gray-500">
          The shipment you're looking for doesn't exist or you don't have access to it.
        </p>
        <div className="mt-6">
          <Link
            href="/dashboard/warehouse/process"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Process Goods
          </Link>
        </div>
      </div>
    )
  }

  if (shipment.status !== 'assigned') {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto h-12 w-12 text-yellow-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Shipment not ready for processing</h3>
        <p className="mt-1 text-sm text-gray-500">
          This shipment is not assigned to a warehouse and cannot be processed.
        </p>
        <div className="mt-6">
          <Link
            href="/dashboard/warehouse/process"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Process Goods
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Process Shipment</h1>
          <p className="text-gray-600">Confirm receipt and process incoming goods</p>
        </div>
        <Link
          href="/dashboard/warehouse/process"
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Process Goods
        </Link>
      </div>

      {/* Shipment Details */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Shipment Details</h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              <Package className="w-3 h-3 mr-1" />
              Assigned
            </span>
          </div>
        </div>
        
        <div className="px-6 py-4 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Shipment Number</label>
              <p className="mt-1 text-sm text-gray-900">{shipment.shipmentNumber}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Purchase Order</label>
              <p className="mt-1 text-sm text-gray-900">{shipment.poId}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Supplier</label>
              <p className="mt-1 text-sm text-gray-900">{shipment.supplier?.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Warehouse</label>
              <p className="mt-1 text-sm text-gray-900">{shipment.warehouse?.name || 'Not assigned'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Total Items</label>
              <p className="mt-1 text-sm text-gray-900">{shipment.totalItems}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Total Value</label>
              <p className="mt-1 text-sm text-gray-900">${shipment.totalValue?.toFixed(2) || '0.00'}</p>
            </div>
          </div>

          {/* Items to Process */}
          {shipment.lines && shipment.lines.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-4">Items to Process</h4>
              <div className="space-y-3">
                {shipment.lines.map((line, index) => (
                  <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
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

          {/* Processing Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Processing Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add any notes about the processing (optional)..."
            />
          </div>
        </div>
      </div>

      {/* Processing Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Processing Instructions</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Physically verify the goods match the shipment details above</li>
                <li>Check quantities and quality of received items</li>
                <li>Click "Process Shipment" to confirm receipt and update inventory</li>
                <li>Click "Reject Shipment" only if goods don't match or are damaged</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={handleRejectShipment}
          disabled={processing}
          className="inline-flex items-center px-6 py-3 border border-red-300 text-base font-medium rounded-md text-red-700 bg-white hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <XCircle className="w-5 h-5 mr-2" />
          Reject Shipment
        </button>
        
        <button
          onClick={handleProcessShipment}
          disabled={processing}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processing...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5 mr-2" />
              Process Shipment
            </>
          )}
        </button>
      </div>
    </div>
  )
}



'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  Truck, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  ArrowLeft,
  Building2,
  Package,
  Calendar,
  DollarSign,
  User,
  FileText
} from 'lucide-react'
import Link from 'next/link'
import LoadingBar from '@/components/ui/LoadingBar'

export default function ShipmentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const shipmentId = params.id
  const [shipment, setShipment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (shipmentId) {
      fetchShipment()
    }
  }, [shipmentId])

  const fetchShipment = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/warehouse/shipments/${shipmentId}`)
      
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          setShipment(result.data)
        } else {
          setError('Shipment not found')
        }
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to load shipment details')
      }
    } catch (err) {
      console.error('Error fetching shipment:', err)
      setError('Failed to load shipment details')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'assigned': return 'bg-blue-100 text-blue-800'
      case 'processed': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'received': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'assigned': return <Clock className="w-4 h-4" />
      case 'processed': return <CheckCircle className="w-4 h-4" />
      case 'rejected': return <AlertTriangle className="w-4 h-4" />
      case 'received': return <CheckCircle className="w-4 h-4" />
      case 'pending': return <Clock className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingBar loading={true} message="Loading shipment details..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
        <Link
          href="/dashboard/warehouse/shipments"
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Shipments
        </Link>
      </div>
    )
  }

  if (!shipment) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <Truck className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Shipment not found</h3>
          <p className="mt-1 text-sm text-gray-500">
            The shipment you're looking for doesn't exist or you don't have access to it.
          </p>
        </div>
        <Link
          href="/dashboard/warehouse/shipments"
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Shipments
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center space-x-3">
            <Link
              href="/dashboard/warehouse/shipments"
              className="text-gray-400 hover:text-gray-600"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Shipment Details</h1>
              <p className="text-gray-600">View complete shipment information</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(shipment.status)}`}>
            {getStatusIcon(shipment.status)}
            <span className="ml-2 capitalize">{shipment.status}</span>
          </span>
          {shipment.status === 'assigned' && (
            <Link
              href={`/dashboard/warehouse/process/${shipment.id}`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              Process Shipment
            </Link>
          )}
        </div>
      </div>

      {/* Shipment Information Card */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Shipment Information</h2>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <label className="block text-sm font-medium text-gray-500">Shipment Number</label>
                <p className="mt-1 text-sm font-semibold text-gray-900">{shipment.shipmentNumber}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <label className="block text-sm font-medium text-gray-500">Purchase Order</label>
                <p className="mt-1 text-sm font-semibold text-gray-900">{shipment.poId}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <User className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <label className="block text-sm font-medium text-gray-500">Supplier</label>
                <p className="mt-1 text-sm font-semibold text-gray-900">{shipment.supplier?.name || 'N/A'}</p>
                {shipment.supplier?.email && (
                  <p className="mt-0.5 text-xs text-gray-500">{shipment.supplier.email}</p>
                )}
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <label className="block text-sm font-medium text-gray-500">Warehouse</label>
                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {shipment.warehouse?.name || 'Not assigned'}
                </p>
                {shipment.warehouse?.code && (
                  <p className="mt-0.5 text-xs text-gray-500">Code: {shipment.warehouse.code}</p>
                )}
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Package className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <label className="block text-sm font-medium text-gray-500">Total Items</label>
                <p className="mt-1 text-sm font-semibold text-gray-900">{shipment.totalItems || 0}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <label className="block text-sm font-medium text-gray-500">Total Value</label>
                <p className="mt-1 text-sm font-semibold text-gray-900">
                  ${shipment.totalValue?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>

            {shipment.assignedAt && (
              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <label className="block text-sm font-medium text-gray-500">Assigned At</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(shipment.assignedAt)}</p>
                </div>
              </div>
            )}

            {shipment.receivedAt && (
              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <label className="block text-sm font-medium text-gray-500">Received At</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(shipment.receivedAt)}</p>
                </div>
              </div>
            )}

            {shipment.processedAt && (
              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <label className="block text-sm font-medium text-gray-500">Processed At</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(shipment.processedAt)}</p>
                </div>
              </div>
            )}

            {shipment.createdAt && (
              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <label className="block text-sm font-medium text-gray-500">Created At</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(shipment.createdAt)}</p>
                </div>
              </div>
            )}
          </div>

          {shipment.notes && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-500 mb-2">Notes</label>
              <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">{shipment.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Items Table */}
      {shipment.lines && shipment.lines.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Shipment Items</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expected
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Received
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Accepted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rejected
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit Price
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Value
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {shipment.lines.map((line, index) => (
                  <tr key={line.id || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{line.productName}</div>
                      <div className="text-xs text-gray-500">ID: {line.productId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{line.quantityExpected || 0}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{line.quantityReceived || 0}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-green-600 font-medium">{line.quantityAccepted || 0}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-red-600 font-medium">{line.quantityRejected || 0}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${parseFloat(line.unitPrice || 0).toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-medium text-gray-900">
                        ${((line.quantityAccepted || 0) * parseFloat(line.unitPrice || 0)).toFixed(2)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                    Grand Total:
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                    ${shipment.totalValue?.toFixed(2) || '0.00'}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <Link
          href="/dashboard/warehouse/shipments"
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Shipments
        </Link>
        {shipment.status === 'assigned' && (
          <Link
            href={`/dashboard/warehouse/process/${shipment.id}`}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
          >
            Process Shipment
          </Link>
        )}
      </div>
    </div>
  )
}


'use client'

import { useState, useEffect } from 'react'
import { 
  Truck, 
  Clock, 
  CheckCircle, 
  Package,
  Search,
  Eye,
  MapPin,
  Mail,
  Phone,
  Building2,
  User
} from 'lucide-react'
import Link from 'next/link'

export default function WarehouseDispatch() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [dispatching, setDispatching] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [statusFilter])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const url = `/api/warehouse/sales-orders${statusFilter !== 'all' ? `?status=${statusFilter}` : ''}`
      const response = await fetch(url)
      if (response.ok) {
        const result = await response.json()
        if (result.success && Array.isArray(result.orders)) {
          setOrders(result.orders)
        } else {
          setOrders([])
        }
      } else {
        setOrders([])
      }
    } catch (error) {
      console.error('Error fetching sales orders:', error)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const handleDispatch = async (orderId) => {
    if (!confirm('Are you sure you want to dispatch this order? This action cannot be undone.')) {
      return
    }

    try {
      setDispatching(true)
      const response = await fetch(`/api/warehouse/sales-orders/${orderId}/dispatch`, {
        method: 'POST'
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          alert('Order dispatched successfully!')
          fetchOrders() // Refresh the list
          if (showModal) {
            setShowModal(false)
            setSelectedOrder(null)
          }
        } else {
          alert('Failed to dispatch order: ' + (result.error || 'Unknown error'))
        }
      } else {
        const error = await response.json()
        alert('Failed to dispatch order: ' + (error.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error dispatching order:', error)
      alert('Failed to dispatch order. Please try again.')
    } finally {
      setDispatching(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'dispatched': return 'bg-green-100 text-green-800'
      case 'delivered': return 'bg-purple-100 text-purple-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'confirmed': return <CheckCircle className="w-4 h-4" />
      case 'dispatched': return <Truck className="w-4 h-4" />
      case 'delivered': return <Package className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const filteredOrders = Array.isArray(orders) ? orders.filter(order => {
    const matchesSearch = order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.customerCompanyName?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  }) : []

  const handleViewDetails = (order) => {
    setSelectedOrder(order)
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
          <h1 className="text-2xl font-bold text-gray-900">Dispatch Sales Orders</h1>
          <p className="text-gray-600">View and dispatch sales orders from your warehouse</p>
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
                placeholder="Search by order, customer, or company..."
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
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="dispatched">Dispatched</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Sales Orders ({filteredOrders.length})
          </h3>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Truck className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No sales orders found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'No sales orders available for dispatch at the moment.'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <div key={order.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900">
                          {order.orderNumber}
                        </p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1 capitalize">{order.status}</span>
                        </span>
                      </div>
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <User className="w-3 h-3 mr-1" />
                          {order.customerName}
                        </span>
                        {order.customerCompanyName && (
                          <span className="flex items-center">
                            <Building2 className="w-3 h-3 mr-1" />
                            {order.customerCompanyName}
                          </span>
                        )}
                        <span className="flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {order.customerEmail}
                        </span>
                        <span>Items: {order.items?.length || 0}</span>
                        <span>Total: ${parseFloat(order.finalNetPrice || 0).toFixed(2)}</span>
                      </div>
                      {order.shippingAddress && (
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span className="truncate">{order.shippingAddress}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleViewDetails(order)}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View Details
                    </button>
                    {['pending', 'confirmed'].includes(order.status) && (
                      <button
                        onClick={() => handleDispatch(order.id)}
                        disabled={dispatching}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Truck className="w-3 h-3 mr-1" />
                        {dispatching ? 'Dispatching...' : 'Dispatch'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Sales Order Details
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false)
                    setSelectedOrder(null)
                  }}
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
                    <label className="block text-sm font-medium text-gray-700">Order Number</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedOrder.orderNumber}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusIcon(selectedOrder.status)}
                      <span className="ml-1 capitalize">{selectedOrder.status}</span>
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Customer Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <p className="mt-1 text-sm text-gray-900 flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {selectedOrder.customerName}
                      </p>
                    </div>
                    {selectedOrder.customerCompanyName && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Company</label>
                        <p className="mt-1 text-sm text-gray-900 flex items-center">
                          <Building2 className="w-4 h-4 mr-1" />
                          {selectedOrder.customerCompanyName}
                        </p>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="mt-1 text-sm text-gray-900 flex items-center">
                        <Mail className="w-4 h-4 mr-1" />
                        {selectedOrder.customerEmail}
                      </p>
                    </div>
                    {selectedOrder.customerPhone && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                        <p className="mt-1 text-sm text-gray-900 flex items-center">
                          <Phone className="w-4 h-4 mr-1" />
                          {selectedOrder.customerPhone}
                        </p>
                      </div>
                    )}
                  </div>
                  {selectedOrder.shippingAddress && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700">Shipping Address</label>
                      <p className="mt-1 text-sm text-gray-900 flex items-start">
                        <MapPin className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
                        <span>{selectedOrder.shippingAddress}</span>
                      </p>
                    </div>
                  )}
                </div>

                {selectedOrder.items && selectedOrder.items.length > 0 && (
                  <div className="border-t pt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Order Items</label>
                    <div className="space-y-2">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{item.productName}</p>
                            <p className="text-xs text-gray-500">
                              Quantity: {item.quantity} {item.product?.unit || 'pcs'}
                            </p>
                            <p className="text-xs text-gray-500">
                              Price: ${parseFloat(item.exFactoryPrice || 0).toFixed(2)} per unit
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              ${parseFloat(item.finalNetPrice || 0).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Total Amount</span>
                    <span className="text-lg font-semibold text-gray-900">
                      ${parseFloat(selectedOrder.finalNetPrice || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowModal(false)
                    setSelectedOrder(null)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Close
                </button>
                {['pending', 'confirmed'].includes(selectedOrder.status) && (
                  <button
                    onClick={() => {
                      handleDispatch(selectedOrder.id)
                    }}
                    disabled={dispatching}
                    className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {dispatching ? 'Dispatching...' : 'Dispatch Order'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}





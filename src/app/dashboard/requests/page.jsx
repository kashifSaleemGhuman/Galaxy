'use client'

import { useState, useMemo } from 'react'
import useSWR from 'swr'
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  EyeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { format } from 'date-fns'

const fetcher = (url) => fetch(url).then(res => res.json())

export default function RequestsPage() {
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(null)

  const { data, error, mutate } = useSWR(
    `/api/inventory/requests?status=${filterStatus}&requestType=${filterType}`,
    fetcher,
    { refreshInterval: 5000 }
  )

  const requests = data?.data || []
  const stats = data?.stats || { total: 0, pending: 0, approved: 0, rejected: 0 }

  // Fetch products for displaying product names in transfer lines
  const { data: productsData } = useSWR('/api/inventory/products?limit=1000', fetcher)
  const products = productsData?.products || []
  const productMap = useMemo(() => {
    const map = new Map()
    products.forEach(p => map.set(p.id, p))
    return map
  }, [products])

  const handleApprove = async (requestId) => {
    if (!confirm('Are you sure you want to approve this request?')) {
      return
    }

    setActionLoading(requestId)
    try {
      const response = await fetch(`/api/inventory/requests/${requestId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      })

      const result = await response.json()

      if (result.success) {
        alert('Request approved successfully!')
        mutate()
        setSelectedRequest(null)
      } else {
        alert(`Error: ${result.error || 'Failed to approve request'}`)
      }
    } catch (error) {
      console.error('Error approving request:', error)
      alert('Failed to approve request')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (requestId) => {
    const reason = prompt('Please provide a reason for rejection:')
    if (!reason || reason.trim() === '') {
      return
    }

    setActionLoading(requestId)
    try {
      const response = await fetch(`/api/inventory/requests/${requestId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rejectionReason: reason })
      })

      const result = await response.json()

      if (result.success) {
        alert('Request rejected successfully!')
        mutate()
        setSelectedRequest(null)
      } else {
        alert(`Error: ${result.error || 'Failed to reject request'}`)
      }
    } catch (error) {
      console.error('Error rejecting request:', error)
      alert('Failed to reject request')
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <ClockIcon className="w-3 h-3 mr-1" />
          Pending
        </span>
      ),
      approved: (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircleIcon className="w-3 h-3 mr-1" />
          Approved
        </span>
      ),
      rejected: (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircleIcon className="w-3 h-3 mr-1" />
          Rejected
        </span>
      )
    }
    return badges[status] || badges.pending
  }

  const getTypeBadge = (type) => {
    const types = {
      movement: 'Stock Movement',
      transfer: 'Transfer',
      adjustment: 'Adjustment'
    }
    return types[type] || type
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading requests: {error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Stock Movement Requests</h1>
        <p className="mt-1 text-sm text-gray-500">
          Review and approve/reject stock movement requests from Warehouse Operators and Inventory Managers
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500">Total Requests</div>
          <div className="mt-1 text-2xl font-semibold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow p-4 border border-yellow-200">
          <div className="text-sm font-medium text-yellow-700">Pending</div>
          <div className="mt-1 text-2xl font-semibold text-yellow-900">{stats.pending}</div>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-4 border border-green-200">
          <div className="text-sm font-medium text-green-700">Approved</div>
          <div className="mt-1 text-2xl font-semibold text-green-900">{stats.approved}</div>
        </div>
        <div className="bg-red-50 rounded-lg shadow p-4 border border-red-200">
          <div className="text-sm font-medium text-red-700">Rejected</div>
          <div className="mt-1 text-2xl font-semibold text-red-900">{stats.rejected}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="movement">Stock Movement</option>
              <option value="transfer">Transfer</option>
              <option value="adjustment">Adjustment</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requested By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requested At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                    No requests found
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      {request.id.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getTypeBadge(request.requestType)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{request.requestedBy.name || 'N/A'}</div>
                        <div className="text-gray-500">{request.requestedBy.email}</div>
                        <div className="text-xs text-gray-400">{request.requestedBy.role}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {request.requestType === 'movement' && (
                        <div>
                          <div><strong>Product:</strong> {request.product?.name || 'N/A'}</div>
                          <div><strong>Warehouse:</strong> {request.warehouse?.name || 'N/A'}</div>
                          <div><strong>Type:</strong> {request.type?.toUpperCase() || 'N/A'}</div>
                          <div><strong>Quantity:</strong> {request.quantity || 0}</div>
                        </div>
                      )}
                      {request.requestType === 'transfer' && (
                        <div>
                          <div><strong>From:</strong> {request.fromWarehouse?.name || 'N/A'}</div>
                          <div><strong>To:</strong> {request.toWarehouse?.name || 'N/A'}</div>
                          <div><strong>Lines:</strong> {Array.isArray(request.transferLines) ? request.transferLines.length : 0}</div>
                        </div>
                      )}
                      {request.requestType === 'adjustment' && (
                        <div>
                          <div><strong>Warehouse:</strong> {request.warehouse?.name || 'N/A'}</div>
                          <div><strong>Reason:</strong> {request.reason || 'N/A'}</div>
                          <div><strong>Lines:</strong> {Array.isArray(request.adjustmentLines) ? request.adjustmentLines.length : 0}</div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(request.requestedAt), 'MMM dd, yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedRequest(request)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </button>
                        {request.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(request.id)}
                              disabled={actionLoading === request.id}
                              className="text-green-600 hover:text-green-900 disabled:opacity-50"
                            >
                              {actionLoading === request.id ? (
                                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                              ) : (
                                <CheckCircleIcon className="w-5 h-5" />
                              )}
                            </button>
                            <button
                              onClick={() => handleReject(request.id)}
                              disabled={actionLoading === request.id}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            >
                              <XCircleIcon className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Request Details - {getTypeBadge(selectedRequest.requestType)}
                </h3>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Requested At</label>
                    <div className="mt-1 text-sm text-gray-900">
                      {format(new Date(selectedRequest.requestedAt), 'MMM dd, yyyy HH:mm:ss')}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Requested By</label>
                  <div className="mt-1 text-sm text-gray-900">
                    <div>{selectedRequest.requestedBy.name}</div>
                    <div className="text-gray-500">{selectedRequest.requestedBy.email}</div>
                    <div className="text-xs text-gray-400">{selectedRequest.requestedBy.role}</div>
                  </div>
                </div>

                {selectedRequest.requestType === 'movement' && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Movement Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <label className="block text-gray-700">Product</label>
                        <div className="mt-1">{selectedRequest.product?.name || 'N/A'}</div>
                      </div>
                      <div>
                        <label className="block text-gray-700">Warehouse</label>
                        <div className="mt-1">{selectedRequest.warehouse?.name || 'N/A'}</div>
                      </div>
                      <div>
                        <label className="block text-gray-700">Location</label>
                        <div className="mt-1">{selectedRequest.location?.name || selectedRequest.location?.code || 'N/A'}</div>
                      </div>
                      <div>
                        <label className="block text-gray-700">Type</label>
                        <div className="mt-1">{selectedRequest.type?.toUpperCase() || 'N/A'}</div>
                      </div>
                      <div>
                        <label className="block text-gray-700">Quantity</label>
                        <div className="mt-1">{selectedRequest.quantity || 0}</div>
                      </div>
                      <div>
                        <label className="block text-gray-700">Reference</label>
                        <div className="mt-1">{selectedRequest.reference || 'N/A'}</div>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-gray-700">Reason</label>
                        <div className="mt-1">{selectedRequest.reason || 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedRequest.requestType === 'transfer' && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Transfer Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <label className="block text-gray-700">From Warehouse</label>
                        <div className="mt-1">{selectedRequest.fromWarehouse?.name || 'N/A'}</div>
                      </div>
                      <div>
                        <label className="block text-gray-700">To Warehouse</label>
                        <div className="mt-1">{selectedRequest.toWarehouse?.name || 'N/A'}</div>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-gray-700">Reference</label>
                        <div className="mt-1">{selectedRequest.reference || 'N/A'}</div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Transfer Lines</label>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Product</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Quantity</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">From Location</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">To Location</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {Array.isArray(selectedRequest.transferLines) && selectedRequest.transferLines.length > 0 ? (
                              selectedRequest.transferLines.map((line, idx) => {
                                const product = productMap.get(line.productId)
                                return (
                                  <tr key={idx}>
                                    <td className="px-3 py-2 text-sm">
                                      {product ? `${product.name} (${product.id})` : line.productId || 'N/A'}
                                    </td>
                                    <td className="px-3 py-2 text-sm">{line.quantity || 0}</td>
                                    <td className="px-3 py-2 text-sm">{line.fromLocationId || 'N/A'}</td>
                                    <td className="px-3 py-2 text-sm">{line.toLocationId || 'N/A'}</td>
                                  </tr>
                                )
                              })
                            ) : (
                              <tr>
                                <td colSpan="4" className="px-3 py-2 text-sm text-gray-500 text-center">No lines</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {selectedRequest.requestType === 'adjustment' && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Adjustment Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <label className="block text-gray-700">Warehouse</label>
                        <div className="mt-1">{selectedRequest.warehouse?.name || 'N/A'}</div>
                      </div>
                      <div>
                        <label className="block text-gray-700">Reason</label>
                        <div className="mt-1">{selectedRequest.reason || 'N/A'}</div>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-gray-700">Reference</label>
                        <div className="mt-1">{selectedRequest.reference || 'N/A'}</div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Adjustment Lines</label>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Product</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Expected</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Actual</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Difference</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {Array.isArray(selectedRequest.adjustmentLines) && selectedRequest.adjustmentLines.length > 0 ? (
                              selectedRequest.adjustmentLines.map((line, idx) => {
                                const product = productMap.get(line.productId)
                                return (
                                  <tr key={idx}>
                                    <td className="px-3 py-2 text-sm">
                                      {product ? `${product.name} (${product.id})` : line.productId || 'N/A'}
                                    </td>
                                    <td className="px-3 py-2 text-sm">{line.expectedQuantity || 0}</td>
                                    <td className="px-3 py-2 text-sm">{line.actualQuantity || 0}</td>
                                    <td className="px-3 py-2 text-sm">
                                      {(line.actualQuantity || 0) - (line.expectedQuantity || 0)}
                                    </td>
                                  </tr>
                                )
                              })
                            ) : (
                              <tr>
                                <td colSpan="4" className="px-3 py-2 text-sm text-gray-500 text-center">No lines</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {selectedRequest.approvedBy && (
                  <div className="border-t pt-4">
                    <label className="block text-sm font-medium text-gray-700">Approved By</label>
                    <div className="mt-1 text-sm text-gray-900">
                      <div>{selectedRequest.approvedBy.name}</div>
                      <div className="text-gray-500">{format(new Date(selectedRequest.approvedAt), 'MMM dd, yyyy HH:mm:ss')}</div>
                    </div>
                  </div>
                )}

                {selectedRequest.rejectedBy && (
                  <div className="border-t pt-4">
                    <label className="block text-sm font-medium text-gray-700">Rejected By</label>
                    <div className="mt-1 text-sm text-gray-900">
                      <div>{selectedRequest.rejectedBy.name}</div>
                      <div className="text-gray-500">{format(new Date(selectedRequest.rejectedAt), 'MMM dd, yyyy HH:mm:ss')}</div>
                    </div>
                    <div className="mt-2">
                      <label className="block text-sm font-medium text-gray-700">Rejection Reason</label>
                      <div className="mt-1 text-sm text-red-600">{selectedRequest.rejectionReason}</div>
                    </div>
                  </div>
                )}

                {selectedRequest.status === 'pending' && (
                  <div className="border-t pt-4 flex justify-end space-x-3">
                    <button
                      onClick={() => handleReject(selectedRequest.id)}
                      disabled={actionLoading === selectedRequest.id}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                    >
                      {actionLoading === selectedRequest.id ? 'Processing...' : 'Reject'}
                    </button>
                    <button
                      onClick={() => handleApprove(selectedRequest.id)}
                      disabled={actionLoading === selectedRequest.id}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      {actionLoading === selectedRequest.id ? 'Processing...' : 'Approve'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}



'use client'

import { useState, useEffect } from 'react'
import { 
  Truck, 
  Building2, 
  Calendar, 
  Package, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Eye,
  Edit,
  Filter,
  Search,
  Plus,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'

export default function GoodsReceipts() {
  const [receipts, setReceipts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedReceipt, setSelectedReceipt] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchReceipts()
  }, [])

  const fetchReceipts = async () => {
    try {
      const response = await fetch('/api/inventory/incoming-shipments')
      if (response.ok) {
        const data = await response.json()
        setReceipts(data)
      }
    } catch (error) {
      console.error('Error fetching receipts:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'confirmed': return <CheckCircle className="w-4 h-4" />
      case 'rejected': return <AlertTriangle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const filteredReceipts = receipts.filter(receipt => {
    const matchesSearch = receipt.purchaseOrder?.poId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        receipt.purchaseOrder?.supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || receipt.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleViewDetails = (receipt) => {
    setSelectedReceipt(receipt)
    setShowModal(true)
  }

  const handleConfirmReceipt = async (receiptId) => {
    try {
      // Here you would implement the confirmation logic
      console.log('Confirming receipt:', receiptId)
      // Update the receipt status to confirmed
      // This would typically involve an API call
      alert('Receipt confirmed successfully!')
      fetchReceipts() // Refresh the list
    } catch (error) {
      console.error('Error confirming receipt:', error)
      alert('Error confirming receipt')
    }
  }

  const handleRejectReceipt = async (receiptId) => {
    try {
      // Here you would implement the rejection logic
      console.log('Rejecting receipt:', receiptId)
      // Update the receipt status to rejected
      // This would typically involve an API call
      alert('Receipt rejected')
      fetchReceipts() // Refresh the list
    } catch (error) {
      console.error('Error rejecting receipt:', error)
      alert('Error rejecting receipt')
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
          <h1 className="text-2xl font-bold text-gray-900">Goods Receipts</h1>
          <p className="text-gray-600">Manage incoming goods and receipts</p>
        </div>
        <Link
          href="/dashboard/inventory"
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <ArrowRight className="w-4 h-4 mr-2" />
          Back to Inventory
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by PO number or supplier..."
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
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Receipts List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Goods Receipts ({filteredReceipts.length})
          </h3>
        </div>
        
        {filteredReceipts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No receipts found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Create a purchase order to generate receipts.'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredReceipts.map((receipt) => (
              <div key={receipt.receiptId} className="px-6 py-4 hover:bg-gray-50">
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
                          {receipt.receiptId}
                        </p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(receipt.status)}`}>
                          {getStatusIcon(receipt.status)}
                          <span className="ml-1 capitalize">{receipt.status}</span>
                        </span>
                      </div>
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                        <span>PO: {receipt.purchaseOrder?.poId}</span>
                        <span>Supplier: {receipt.purchaseOrder?.supplier?.name}</span>
                        <span>Date: {new Date(receipt.dateReceived).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {receipt.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleConfirmReceipt(receipt.receiptId)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Confirm
                        </button>
                        <button
                          onClick={() => handleRejectReceipt(receipt.receiptId)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200"
                        >
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Reject
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleViewDetails(receipt)}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showModal && selectedReceipt && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Receipt Details
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
                    <label className="block text-sm font-medium text-gray-700">Receipt ID</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedReceipt.receiptId}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedReceipt.status)}`}>
                      {getStatusIcon(selectedReceipt.status)}
                      <span className="ml-1 capitalize">{selectedReceipt.status}</span>
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Purchase Order</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedReceipt.purchaseOrder?.poId}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Supplier</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedReceipt.purchaseOrder?.supplier?.name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date Received</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(selectedReceipt.dateReceived).toLocaleDateString()}
                  </p>
                </div>
                
                {selectedReceipt.purchaseOrder?.lines && selectedReceipt.purchaseOrder.lines.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Items</label>
                    <div className="space-y-2">
                      {selectedReceipt.purchaseOrder.lines.map((line, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{line.product?.name}</p>
                            <p className="text-xs text-gray-500">Qty: {line.quantityOrdered}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-900">${line.price}</p>
                            <p className="text-xs text-gray-500">Total: ${(line.price * line.quantityOrdered).toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Close
                </button>
                {selectedReceipt.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        handleConfirmReceipt(selectedReceipt.receiptId)
                        setShowModal(false)
                      }}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                    >
                      Confirm Receipt
                    </button>
                    <button
                      onClick={() => {
                        handleRejectReceipt(selectedReceipt.receiptId)
                        setShowModal(false)
                      }}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                    >
                      Reject Receipt
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  CheckCircle,
  Clock,
  Truck,
  Package,
  Building2,
  MapPin,
  Calendar
} from 'lucide-react'
import DataTable from '@/components/ui/DataTable'
import LoadingBar from '@/components/ui/LoadingBar'

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedReceipts, setSelectedReceipts] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [selectedReceipt, setSelectedReceipt] = useState(null)

  // Fetch receipts from API
  useEffect(() => {
    fetchReceipts()
  }, [searchTerm, filterStatus])

  const fetchReceipts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '50'
      })
      
      if (searchTerm) params.append('search', searchTerm)
      if (filterStatus !== 'all') params.append('status', filterStatus)

      const response = await fetch(`/api/inventory/receipts?${params}`)
      
      if (response.ok) {
        const data = await response.json()
        setReceipts(data.receipts || [])
      } else {
        console.error('Failed to fetch receipts:', response.status)
        setReceipts([])
      }
    } catch (error) {
      console.error('Error fetching receipts:', error)
      setReceipts([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Draft': return 'bg-gray-100 text-gray-800'
      case 'In Transit': return 'bg-blue-100 text-blue-800'
      case 'Partially Received': return 'bg-yellow-100 text-yellow-800'
      case 'Received': return 'bg-green-100 text-green-800'
      case 'Cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Draft': return <Clock className="h-4 w-4" />
      case 'In Transit': return <Truck className="h-4 w-4" />
      case 'Partially Received': return <Package className="h-4 w-4" />
      case 'Received': return <CheckCircle className="h-4 w-4" />
      case 'Cancelled': return <Clock className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'Draft': return 'Draft'
      case 'In Transit': return 'In Transit'
      case 'Partially Received': return 'Partially Received'
      case 'Received': return 'Received'
      case 'Cancelled': return 'Cancelled'
      default: return status || 'Unknown'
    }
  }

  const handleViewReceipt = (receipt) => {
    setSelectedReceipt(receipt)
    setShowModal(true)
  }

  const handleValidateReceipt = async (receiptId) => {
    try {
      const response = await fetch(`/api/inventory/receipts/${receiptId}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receivedQuantities: [] // Will be populated from the receipt lines
        })
      })
      
      if (response.ok) {
        await fetchReceipts() // Refresh the list
        alert('Receipt validated successfully! Stock levels have been updated.')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to validate receipt')
      }
    } catch (error) {
      console.error('Error validating receipt:', error)
      alert('Failed to validate receipt')
    }
  }

  const filteredReceipts = receipts.filter(receipt => {
    const matchesSearch = receipt.receiptId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         receipt.purchaseOrder?.poId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         receipt.purchaseOrder?.supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || receipt.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  // Table columns configuration
  const tableColumns = [
    {
      key: 'receipt',
      label: 'Receipt',
      render: (item) => (
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <Package className="h-5 w-5 text-blue-600" />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{item.receiptId}</div>
            <div className="text-sm text-gray-500">PO: {item.purchaseOrder?.poId}</div>
          </div>
        </div>
      )
    },
    {
      key: 'supplier',
      label: 'Supplier',
      render: (item) => (
        <span className="text-sm text-gray-900">{item.purchaseOrder?.supplier?.name}</span>
      )
    },
    {
      key: 'warehouse',
      label: 'Warehouse',
      render: (item) => (
        <div className="flex items-center">
          <Building2 className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm text-gray-900">
            {item.warehouse?.name || item.purchaseOrder?.warehouse?.name || 'No Warehouse'}
          </span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (item) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
          {getStatusIcon(item.status)} {getStatusText(item.status)}
        </span>
      )
    },
    {
      key: 'dates',
      label: 'Dates',
      render: (item) => (
        <div className="text-sm">
          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-1" />
            Created: {new Date(item.dateReceived).toLocaleDateString()}
          </div>
          {item.status === 'Received' && (
            <div className="flex items-center text-green-600 mt-1">
              <CheckCircle className="h-4 w-4 mr-1" />
              Received: {new Date(item.dateReceived).toLocaleDateString()}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'quantity',
      label: 'Quantity',
      render: (item) => (
        <div className="text-sm">
          <div className="text-gray-900">{item.purchaseOrder?.lines?.length || 0} items</div>
          <div className="text-gray-500">{item.purchaseOrder?.lines?.length || 0} lines</div>
        </div>
      )
    },
    {
      key: 'value',
      label: 'Value',
      render: (item) => {
        const totalValue = item.purchaseOrder?.lines?.reduce((sum, line) => sum + (line.quantityOrdered * line.price), 0) || 0
        return (
          <span className="text-sm font-medium text-gray-900">
            ${totalValue.toFixed(2)}
          </span>
        )
      }
    },
    {
      key: 'actions',
      label: 'Actions'
    }
  ]

  // Table actions
  const tableActions = [
    {
      icon: <Eye className="h-4 w-4" />,
      onClick: (item) => handleViewReceipt(item),
      title: 'View Details',
      className: 'text-blue-600 hover:text-blue-900'
    },
    ...(filteredReceipts.some(r => r.status === 'Draft' || r.status === 'In Transit') ? [{
      icon: <CheckCircle className="h-4 w-4" />,
      onClick: (item) => handleValidateReceipt(item.receiptId),
      title: 'Validate Receipt',
      className: 'text-green-600 hover:text-green-900',
      condition: (item) => item.status === 'Draft' || item.status === 'In Transit'
    }] : [])
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Goods Receipts</h1>
          <p className="text-gray-600 mt-2">Manage incoming shipments and validate receipts</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>New Receipt</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search receipts by ID, PO number, or supplier..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="Draft">Draft</option>
              <option value="In Transit">In Transit</option>
              <option value="Partially Received">Partially Received</option>
              <option value="Received">Received</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>More Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredReceipts.length} of {receipts.length} receipts
      </div>

      {/* Table */}
      <DataTable
        data={filteredReceipts}
        columns={tableColumns}
        actions={tableActions}
        selectable={true}
        selectedRows={selectedReceipts}
        onRowSelect={(receiptId) => {
          setSelectedReceipts(prev => 
            prev.includes(receiptId) 
              ? prev.filter(id => id !== receiptId)
              : [...prev, receiptId]
          )
        }}
        onSelectAll={() => {
          if (selectedReceipts.length === filteredReceipts.length) {
            setSelectedReceipts([])
          } else {
            setSelectedReceipts(filteredReceipts.map(r => r.id))
          }
        }}
        emptyMessage="No receipts found. Try adjusting your search or filters."
        emptyIcon="📦"
      />

      {/* Receipt Details Modal */}
      {showModal && selectedReceipt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Receipt Details - {selectedReceipt.id}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Receipt Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Purchase Order</label>
                  <div className="text-lg font-semibold text-gray-900">{selectedReceipt.purchaseOrder?.poId}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Supplier</label>
                  <div className="text-lg font-semibold text-gray-900">{selectedReceipt.purchaseOrder?.supplier?.name}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedReceipt.status)}`}>
                    {getStatusIcon(selectedReceipt.status)} {getStatusText(selectedReceipt.status)}
                  </span>
                </div>
              </div>

              {/* Line Items */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Line Items</h3>
                <div className="bg-gray-50 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expected</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Received</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Cost</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedReceipt.purchaseOrder?.lines?.map((line, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm text-gray-900">{line.product?.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{line.quantityOrdered}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{line.quantityReceived}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">${line.price.toFixed(2)}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">${(line.quantityOrdered * line.price).toFixed(2)}</td>
                        </tr>
                      )) || []}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
                {(selectedReceipt.status === 'Draft' || selectedReceipt.status === 'In Transit') && (
                  <button
                    onClick={() => {
                      handleValidateReceipt(selectedReceipt.receiptId)
                      setShowModal(false)
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Validate Receipt</span>
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

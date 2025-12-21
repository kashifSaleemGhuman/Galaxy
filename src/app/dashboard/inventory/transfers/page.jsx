'use client'

import { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  Plus,
  TruckIcon,
  Building2,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  Package
} from 'lucide-react'
import useSWR from 'swr'
import DataTable from '@/components/ui/DataTable'
import TransferModal from './_components/TransferModal'

const fetcher = (url) => fetch(url).then(res => res.json())

export default function TransfersPage() {
  const [transfers, setTransfers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterFromWarehouse, setFilterFromWarehouse] = useState('all')
  const [filterToWarehouse, setFilterToWarehouse] = useState('all')
  const [viewMode, setViewMode] = useState('table')
  const [selectedTransfers, setSelectedTransfers] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [selectedTransfer, setSelectedTransfer] = useState(null)
  const [warehouses, setWarehouses] = useState([])

  // Fetch warehouses using SWR
  const { data: warehousesData } = useSWR('/api/inventory/warehouses?limit=1000', fetcher)
  
  useEffect(() => {
    if (warehousesData?.warehouses) {
      setWarehouses(warehousesData.warehouses)
    }
  }, [warehousesData])

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'in_transit': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'draft': return '📝'
      case 'pending': return '⏳'
      case 'in_transit': return '🚚'
      case 'completed': return '✅'
      case 'cancelled': return '❌'
      default: return '❓'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'draft': return 'Draft'
      case 'pending': return 'Pending'
      case 'in_transit': return 'In Transit'
      case 'completed': return 'Completed'
      case 'cancelled': return 'Cancelled'
      default: return 'Unknown'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleCreateTransfer = () => {
    setSelectedTransfer(null)
    setModalMode('create')
    setShowModal(true)
  }

  const handleEditTransfer = (transfer) => {
    setSelectedTransfer(transfer)
    setModalMode('edit')
    setShowModal(true)
  }

  const handleViewTransfer = (transfer) => {
    setSelectedTransfer(transfer)
    setModalMode('view')
    setShowModal(true)
  }

  const handleDeleteTransfer = async (transfer) => {
    if (window.confirm(`Are you sure you want to delete transfer "${transfer.transferNumber}"?`)) {
      try {
        // This would be an API call to delete the transfer
        console.log('Deleting transfer:', transfer.id)
        // await fetch(`/api/inventory/transfers/${transfer.id}`, { method: 'DELETE' })
        // await fetchTransfers()
      } catch (error) {
        console.error('Error deleting transfer:', error)
        alert('Failed to delete transfer')
      }
    }
  }

  const handleSaveTransfer = async (transferData) => {
    try {
      // Prepare the payload for the API
      const payload = {
        fromWarehouseId: transferData.fromWarehouseId,
        toWarehouseId: transferData.toWarehouseId,
        notes: transferData.notes || '',
        reference: transferData.reference || '',
        lines: transferData.lines.map(line => ({
          productId: line.productId,
          quantity: parseInt(line.quantity) || 1,
          fromLocationId: line.fromLocationId || null,
          toLocationId: line.toLocationId || null,
          reason: line.notes || null
        }))
      }

      const response = await fetch('/api/inventory/transfers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create transfer')
      }

      // Check if a request was created (for WAREHOUSE_OPERATOR and INVENTORY_MANAGER)
      if (result.message && result.message.includes('pending approval')) {
        alert('Transfer request created successfully! It is now pending approval from Super Admin.')
      } else {
        alert('Transfer created successfully!')
      }

      // Refresh the transfers list
      await fetchTransfers()
      setShowModal(false)
      return true
    } catch (error) {
      console.error('Error saving transfer:', error)
      alert(`Error: ${error.message || 'Failed to create transfer'}`)
      throw error
    }
  }

  // Fetch transfers using SWR
  const { data: movementsData, error: movementsError, mutate: mutateMovements } = useSWR(
    '/api/inventory/movements?type=transfer',
    fetcher,
    { refreshInterval: 5000 }
  )

  // Process movements data into transfers format
  useEffect(() => {
    if (movementsData?.success && movementsData.data) {
      // Group movements by reference (transfer reference)
      const transferMap = new Map()
      
      movementsData.data.forEach(movement => {
        if (movement.referenceId) {
          if (!transferMap.has(movement.referenceId)) {
            transferMap.set(movement.referenceId, {
              id: movement.referenceId,
              transferNumber: movement.referenceId,
              fromWarehouse: null,
              toWarehouse: null,
              status: 'completed', // Transfers are completed when movements are created
              notes: movement.notes || '',
              transferDate: movement.movementDate,
              expectedDate: movement.movementDate,
              receivedDate: movement.movementDate,
              createdAt: movement.createdAt,
              user: movement.user,
              lines: []
            })
          }
          
          const transfer = transferMap.get(movement.referenceId)
          
          // Set warehouses based on quantity (negative = from, positive = to)
          if (movement.quantity < 0 && !transfer.fromWarehouse) {
            transfer.fromWarehouse = movement.warehouse
          } else if (movement.quantity > 0 && !transfer.toWarehouse) {
            transfer.toWarehouse = movement.warehouse
          }
          
          transfer.lines.push({
            id: movement.id,
            product: movement.product,
            fromLocation: movement.quantity < 0 ? movement.location : null,
            toLocation: movement.quantity > 0 ? movement.location : null,
            quantity: Math.abs(movement.quantity),
            unitCost: movement.unitCost || 0,
            totalCost: (movement.totalCost || 0)
          })
        }
      })
      
      setTransfers(Array.from(transferMap.values()))
      setLoading(false)
    } else if (movementsError) {
      console.error('Error fetching transfers:', movementsError)
      setLoading(false)
    } else if (movementsData && !movementsData.success) {
      setLoading(false)
    }
  }, [movementsData, movementsError])

  const fetchTransfers = async () => {
    mutateMovements()
  }

  const handleSelectTransfer = (transferId) => {
    setSelectedTransfers(prev => 
      prev.includes(transferId) 
        ? prev.filter(id => id !== transferId)
        : [...prev, transferId]
    )
  }

  const handleSelectAll = () => {
    if (selectedTransfers.length === transfers.length) {
      setSelectedTransfers([])
    } else {
      setSelectedTransfers(transfers.map(t => t.id))
    }
  }

  const filteredTransfers = transfers.filter(transfer => {
    const matchesSearch = transfer.transferNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.fromWarehouse?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.toWarehouse?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || transfer.status === filterStatus
    const matchesFromWarehouse = filterFromWarehouse === 'all' || transfer.fromWarehouse?.id === filterFromWarehouse
    const matchesToWarehouse = filterToWarehouse === 'all' || transfer.toWarehouse?.id === filterToWarehouse
    
    return matchesSearch && matchesStatus && matchesFromWarehouse && matchesToWarehouse
  })

  // Table columns configuration
  const tableColumns = [
    {
      key: 'transfer',
      label: 'Transfer',
      render: (item) => (
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <TruckIcon className="h-5 w-5 text-blue-600" />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{item.transferNumber}</div>
            <div className="text-sm text-gray-500">{formatDate(item.transferDate)}</div>
          </div>
        </div>
      )
    },
    {
      key: 'from',
      label: 'From',
      render: (item) => (
        <div className="flex items-center">
          <Building2 className="h-4 w-4 text-gray-400 mr-2" />
          <div>
            <div className="text-sm text-gray-900">{item.fromWarehouse?.name || 'N/A'}</div>
            <div className="text-sm text-gray-500">{item.fromWarehouse?.code || ''}</div>
          </div>
        </div>
      )
    },
    {
      key: 'to',
      label: 'To',
      render: (item) => (
        <div className="flex items-center">
          <Building2 className="h-4 w-4 text-gray-400 mr-2" />
          <div>
            <div className="text-sm text-gray-900">{item.toWarehouse?.name || 'N/A'}</div>
            <div className="text-sm text-gray-500">{item.toWarehouse?.code || ''}</div>
          </div>
        </div>
      )
    },
    {
      key: 'items',
      label: 'Items',
      render: (item) => (
        <div className="text-center">
          <div className="text-sm font-medium text-gray-900">{item.lines.length}</div>
          <div className="text-xs text-gray-500">products</div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (item) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
          {getStatusIcon(item.status)} {getStatusLabel(item.status)}
        </span>
      )
    },
    {
      key: 'dates',
      label: 'Dates',
      render: (item) => (
        <div className="text-center">
          <div className="text-sm text-gray-900">
            {item.expectedDate ? formatDate(item.expectedDate) : 'No date'}
          </div>
          {item.receivedDate && (
            <div className="text-xs text-green-600">
              Received: {formatDate(item.receivedDate)}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'user',
      label: 'Created By',
      render: (item) => (
        <div className="text-center">
          <div className="text-sm text-gray-900">{item.user.firstName} {item.user.lastName}</div>
          <div className="text-xs text-gray-500">{item.user.email}</div>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions'
    }
  ]

  // Table actions
  const tableActions = [
    {
      icon: <Package className="h-4 w-4" />,
      onClick: (item) => handleViewTransfer(item),
      title: 'View',
      className: 'text-blue-600 hover:text-blue-900'
    },
    {
      icon: <TruckIcon className="h-4 w-4" />,
      onClick: (item) => handleEditTransfer(item),
      title: 'Edit',
      className: 'text-green-600 hover:text-green-900'
    },
    {
      icon: <XCircleIcon className="h-4 w-4" />,
      onClick: (item) => handleDeleteTransfer(item),
      title: 'Delete',
      className: 'text-red-600 hover:text-red-900'
    }
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Loading Bar */}
      {loading && <LoadingBar loading={loading} message="Loading transfers..." />}
      
      {!loading && (
        <>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transfers</h1>
          <p className="text-gray-600 mt-2">Manage inventory transfers between warehouses</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleCreateTransfer}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Create Transfer</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Transfers</p>
              <p className="text-2xl font-bold text-gray-900">{transfers.length}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TruckIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {transfers.filter(t => t.status === 'pending').length}
              </p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Transit</p>
              <p className="text-2xl font-bold text-blue-600">
                {transfers.filter(t => t.status === 'in_transit').length}
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TruckIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {transfers.filter(t => t.status === 'completed').length}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by transfer number, warehouse, or notes..."
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
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="in_transit">In Transit</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filterFromWarehouse}
              onChange={(e) => setFilterFromWarehouse(e.target.value)}
            >
              <option value="all">From Any Warehouse</option>
              {warehouses.map(warehouse => (
                <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
              ))}
            </select>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filterToWarehouse}
              onChange={(e) => setFilterToWarehouse(e.target.value)}
            >
              <option value="all">To Any Warehouse</option>
              {warehouses.map(warehouse => (
                <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
              ))}
            </select>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>More Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* View Mode Toggle and Bulk Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-2 rounded-lg text-sm font-medium ${
              viewMode === 'table' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Table View
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-2 rounded-lg text-sm font-medium ${
              viewMode === 'grid' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Grid View
          </button>
        </div>
        
        {selectedTransfers.length > 0 && (
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">
              {selectedTransfers.length} transfer(s) selected
            </span>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Export Selected
            </button>
            <button className="text-green-600 hover:text-green-800 text-sm font-medium">
              Bulk Actions
            </button>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredTransfers.length} of {transfers.length} transfers
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <DataTable
          data={filteredTransfers}
          columns={tableColumns}
          actions={tableActions}
          selectable={true}
          selectedRows={selectedTransfers}
          onRowSelect={handleSelectTransfer}
          onSelectAll={handleSelectAll}
          emptyMessage="No transfers found. Try adjusting your search or filters."
          emptyIcon="🚚"
        />
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTransfers.map((transfer) => (
            <div key={transfer.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <TruckIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900">{transfer.transferNumber}</h3>
                    <p className="text-sm text-gray-500">{formatDate(transfer.transferDate)}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transfer.status)}`}>
                  {getStatusIcon(transfer.status)} {getStatusLabel(transfer.status)}
                </span>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Building2 className="h-4 w-4 mr-2" />
                  <span>From: {transfer.fromWarehouse?.name || 'N/A'}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <ArrowRightIcon className="h-4 w-4 mr-2" />
                  <span>To: {transfer.toWarehouse?.name || 'N/A'}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Package className="h-4 w-4 mr-2" />
                  <span>{transfer.lines.length} items</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <ClockIcon className="h-4 w-4 mr-2" />
                  <span>Expected: {transfer.expectedDate ? formatDate(transfer.expectedDate) : 'No date'}</span>
                </div>
                {transfer.receivedDate && (
                  <div className="flex items-center text-sm text-green-600">
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    <span>Received: {formatDate(transfer.receivedDate)}</span>
                  </div>
                )}
                {transfer.notes && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Notes:</span> {transfer.notes}
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <button 
                  onClick={() => handleViewTransfer(transfer)}
                  className="flex-1 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-100"
                >
                  View Details
                </button>
                <button 
                  onClick={() => handleEditTransfer(transfer)}
                  className="flex-1 bg-gray-50 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State for Grid View */}
      {viewMode === 'grid' && filteredTransfers.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <TruckIcon className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No transfers found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterStatus !== 'all' || filterFromWarehouse !== 'all' || filterToWarehouse !== 'all'
              ? 'Try adjusting your search or filters.'
              : 'Get started by creating your first transfer.'}
          </p>
          <div className="mt-6">
            <button 
              onClick={handleCreateTransfer}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Create Transfer
            </button>
          </div>
        </div>
      )}

        </>
      )}

      {/* Transfer Modal */}
      {showModal && (
        <TransferModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          transfer={selectedTransfer}
          mode={modalMode}
          onSave={handleSaveTransfer}
          warehouses={warehouses}
        />
      )}
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  Package,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  User,
  Building2,
  MapPin
} from 'lucide-react'
import DataTable from '@/components/ui/DataTable'
import LoadingBar from '@/components/ui/LoadingBar'
import useSWR, { mutate } from 'swr'
import StockMovementModal from './_components/StockMovementModal'
import TransferModal from '../transfers/_components/TransferModal'
import AdjustmentModal from '../adjustments/_components/AdjustmentModal'

const fetcher = (url) => fetch(url).then(res => res.json())

export default function MovementsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterWarehouse, setFilterWarehouse] = useState('all')
  const [filterDateRange, setFilterDateRange] = useState('all')
  const [viewMode, setViewMode] = useState('table')
  const [selectedMovements, setSelectedMovements] = useState([])
  
  // Modal states
  const [stockInModalOpen, setStockInModalOpen] = useState(false)
  const [stockOutModalOpen, setStockOutModalOpen] = useState(false)
  const [adjustmentModalOpen, setAdjustmentModalOpen] = useState(false)
  const [transferModalOpen, setTransferModalOpen] = useState(false)

  // Build API URL with filters
  const buildApiUrl = () => {
    const params = new URLSearchParams()
    if (filterType !== 'all') params.append('type', filterType)
    if (filterWarehouse !== 'all') params.append('warehouseId', filterWarehouse)
    if (searchTerm) params.append('search', searchTerm)
    params.append('limit', '100')
    return `/api/inventory/movements?${params.toString()}`
  }

  // Fetch movements data
  const { data: movementsData, error, isLoading } = useSWR(buildApiUrl(), fetcher, {
    refreshInterval: 5000 // Refresh every 5 seconds
  })

  // Fetch warehouses for filter
  const { data: warehousesData } = useSWR('/api/inventory/warehouses', fetcher)

  const movements = movementsData?.data || []
  const stats = movementsData?.stats || { total: 0, stockIn: 0, stockOut: 0, transfers: 0, adjustments: 0 }
  const warehouses = warehousesData?.warehouses || []

  // Handle saving stock movement
  const handleSaveStockMovement = async (payload) => {
    try {
      // Show loading message
      const loadingEvent = new CustomEvent('show-toast', {
        detail: { 
          title: 'Creating Request...', 
          message: 'Please wait while your stock movement request is being created.',
          type: 'info',
          duration: 3000
        }
      })
      window.dispatchEvent(loadingEvent)

      const response = await fetch('/api/inventory/movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const result = await response.json()

      if (!response.ok) {
        const errorEvent = new CustomEvent('show-toast', {
          detail: { 
            title: 'Error', 
            message: result.error || 'Failed to create stock movement request',
            type: 'error',
            duration: 5000
          }
        })
        window.dispatchEvent(errorEvent)
        throw new Error(result.error || 'Failed to save stock movement')
      }

      // Show success message
      const successEvent = new CustomEvent('show-toast', {
        detail: { 
          title: 'Request Created Successfully', 
          message: result.message || 'Your stock movement request has been created and is pending approval from Super Admin.',
          type: 'success',
          duration: 6000
        }
      })
      window.dispatchEvent(successEvent)

      // Refresh data
      mutate(buildApiUrl())
      return result
    } catch (error) {
      console.error('Error saving stock movement:', error)
      throw error
    }
  }

  // Handle saving transfer
  const handleSaveTransfer = async (payload) => {
    try {
      // Show loading message
      const loadingEvent = new CustomEvent('show-toast', {
        detail: { 
          title: 'Creating Transfer Request...', 
          message: 'Please wait while your transfer request is being created.',
          type: 'info',
          duration: 3000
        }
      })
      window.dispatchEvent(loadingEvent)

      // Transform payload to match API format
      const transferPayload = {
        fromWarehouseId: payload.fromWarehouseId,
        toWarehouseId: payload.toWarehouseId,
        notes: payload.notes || null,
        reference: payload.reference || `TR-${Date.now()}`,
        lines: payload.lines.map(line => ({
          productId: line.productId,
          quantity: parseInt(line.quantity),
          fromLocationId: line.fromLocationId || null,
          toLocationId: line.toLocationId || null,
          reason: line.notes || null
        }))
      }

      const response = await fetch('/api/inventory/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transferPayload)
      })

      const result = await response.json()

      if (!response.ok) {
        const errorEvent = new CustomEvent('show-toast', {
          detail: { 
            title: 'Error', 
            message: result.error || 'Failed to create transfer request',
            type: 'error',
            duration: 5000
          }
        })
        window.dispatchEvent(errorEvent)
        throw new Error(result.error || 'Failed to create transfer')
      }

      // Show success message
      const successEvent = new CustomEvent('show-toast', {
        detail: { 
          title: 'Transfer Request Created', 
          message: result.message || 'Your transfer request has been created and is pending approval from Super Admin.',
          type: 'success',
          duration: 6000
        }
      })
      window.dispatchEvent(successEvent)

      // Refresh data
      mutate(buildApiUrl())
      return result
    } catch (error) {
      console.error('Error saving transfer:', error)
      throw error
    }
  }

  // Handle saving adjustment
  const handleSaveAdjustment = async (payload) => {
    try {
      // Show loading message
      const loadingEvent = new CustomEvent('show-toast', {
        detail: { 
          title: 'Creating Adjustment Request...', 
          message: 'Please wait while your adjustment request is being created.',
          type: 'info',
          duration: 3000
        }
      })
      window.dispatchEvent(loadingEvent)

      // Transform payload to match API format
      const adjustmentPayload = {
        warehouseId: payload.warehouseId,
        reason: payload.reason,
        reference: payload.reference || `ADJ-${Date.now()}`,
        lines: payload.lines.map(line => ({
          productId: line.productId,
          expectedQuantity: parseInt(line.expectedQuantity || 0),
          actualQuantity: parseInt(line.actualQuantity || 0),
          locationId: line.locationId || null,
          notes: line.notes || null
        }))
      }

      const response = await fetch('/api/inventory/adjustments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adjustmentPayload)
      })

      const result = await response.json()

      if (!response.ok) {
        const errorEvent = new CustomEvent('show-toast', {
          detail: { 
            title: 'Error', 
            message: result.error || 'Failed to create adjustment request',
            type: 'error',
            duration: 5000
          }
        })
        window.dispatchEvent(errorEvent)
        throw new Error(result.error || 'Failed to create adjustment')
      }

      // Show success message
      const successEvent = new CustomEvent('show-toast', {
        detail: { 
          title: 'Adjustment Request Created', 
          message: result.message || 'Your adjustment request has been created and is pending approval from Super Admin.',
          type: 'success',
          duration: 6000
        }
      })
      window.dispatchEvent(successEvent)

      // Refresh data
      mutate(buildApiUrl())
      return result
    } catch (error) {
      console.error('Error saving adjustment:', error)
      throw error
    }
  }


  const getMovementIcon = (type) => {
    switch (type) {
      case 'in': return <ArrowUp className="h-4 w-4 text-green-600" />
      case 'out': return <ArrowDown className="h-4 w-4 text-red-600" />
      case 'transfer': return <ArrowRight className="h-4 w-4 text-blue-600" />
      case 'adjustment': return <Package className="h-4 w-4 text-orange-600" />
      default: return <Package className="h-4 w-4 text-gray-600" />
    }
  }

  const getMovementColor = (type) => {
    switch (type) {
      case 'in': return 'bg-green-100 text-green-800'
      case 'out': return 'bg-red-100 text-red-800'
      case 'transfer': return 'bg-blue-100 text-blue-800'
      case 'adjustment': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getMovementLabel = (type) => {
    switch (type) {
      case 'in': return 'Stock In'
      case 'out': return 'Stock Out'
      case 'transfer': return 'Transfer'
      case 'adjustment': return 'Adjustment'
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

  const handleSelectMovement = (movementId) => {
    setSelectedMovements(prev => 
      prev.includes(movementId) 
        ? prev.filter(id => id !== movementId)
        : [...prev, movementId]
    )
  }

  const handleSelectAll = () => {
    if (selectedMovements.length === movements.length) {
      setSelectedMovements([])
    } else {
      setSelectedMovements(movements.map(m => m.id))
    }
  }

  // Filter movements client-side (API already filters by type and warehouse, but we filter by search term)
  const filteredMovements = movements.filter(movement => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return movement.product.name?.toLowerCase().includes(searchLower) ||
           movement.product.sku?.toLowerCase().includes(searchLower) ||
           movement.warehouse.name?.toLowerCase().includes(searchLower) ||
           movement.referenceId?.toLowerCase().includes(searchLower)
  })

  // Table columns configuration
  const tableColumns = [
    {
      key: 'movement',
      label: 'Movement',
      render: (item) => (
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
            {getMovementIcon(item.movementType)}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{item.product.name}</div>
            <div className="text-sm text-gray-500">{item.product.sku}</div>
          </div>
        </div>
      )
    },
    {
      key: 'type',
      label: 'Type',
      render: (item) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMovementColor(item.movementType)}`}>
          {getMovementLabel(item.movementType)}
        </span>
      )
    },
    {
      key: 'quantity',
      label: 'Quantity',
      render: (item) => (
        <div className="text-center">
          <div className={`text-sm font-medium ${item.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {item.quantity > 0 ? '+' : ''}{item.quantity}
          </div>
        </div>
      )
    },
    {
      key: 'warehouse',
      label: 'Warehouse',
      render: (item) => (
        <div className="flex items-center">
          <Building2 className="h-4 w-4 text-gray-400 mr-2" />
          <div>
            <div className="text-sm text-gray-900">{item.warehouse.name}</div>
            <div className="text-sm text-gray-500">{item.warehouse.code}</div>
          </div>
        </div>
      )
    },
    {
      key: 'location',
      label: 'Location',
      render: (item) => (
        <div className="flex items-center">
          <MapPin className="h-4 w-4 text-gray-400 mr-2" />
          <div>
            <div className="text-sm text-gray-900">{item.location?.name || 'N/A'}</div>
            <div className="text-sm text-gray-500">{item.location?.code || 'N/A'}</div>
          </div>
        </div>
      )
    },
    {
      key: 'reference',
      label: 'Reference',
      render: (item) => (
        <div className="text-center">
          <div className="text-sm font-medium text-gray-900">{item.referenceId || 'N/A'}</div>
          <div className="text-xs text-gray-500">{item.referenceType || 'N/A'}</div>
        </div>
      )
    },
    {
      key: 'cost',
      label: 'Cost',
      render: (item) => (
        <div className="text-right">
          <div className="text-sm font-medium text-gray-900">
            {item.totalCost ? `$${Math.abs(item.totalCost).toFixed(2)}` : 'N/A'}
          </div>
          <div className="text-xs text-gray-500">
            {item.unitCost ? `$${item.unitCost.toFixed(2)} per unit` : ''}
          </div>
        </div>
      )
    },
    {
      key: 'user',
      label: 'User',
      render: (item) => (
        <div className="flex items-center">
          <User className="h-4 w-4 text-gray-400 mr-2" />
          <div>
            <div className="text-sm text-gray-900">{item.user?.firstName || ''} {item.user?.lastName || ''}</div>
            <div className="text-sm text-gray-500">{item.user?.email || 'N/A'}</div>
          </div>
        </div>
      )
    },
    {
      key: 'date',
      label: 'Date',
      render: (item) => (
        <div className="text-center">
          <div className="text-sm text-gray-900">{formatDate(item.movementDate)}</div>
        </div>
      )
    }
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Loading Bar */}
      {isLoading && <LoadingBar loading={isLoading} message="Loading stock movements..." />}
      
      {!isLoading && (
        <>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stock Movements</h1>
          <p className="text-gray-600 mt-2">Track all inventory movements and transactions</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setStockInModalOpen(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <ArrowUp className="h-5 w-5" />
            <span>Stock In</span>
          </button>
          <button 
            onClick={() => setStockOutModalOpen(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2"
          >
            <ArrowDown className="h-5 w-5" />
            <span>Stock Out</span>
          </button>
          <button 
            onClick={() => setTransferModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <ArrowRight className="h-5 w-5" />
            <span>Transfer</span>
          </button>
          <button 
            onClick={() => setAdjustmentModalOpen(true)}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center space-x-2"
          >
            <Package className="h-5 w-5" />
            <span>Adjustment</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Movements</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total || movements.length}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Stock In</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.stockIn || movements.filter(m => m.movementType === 'in').length}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <ArrowUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Stock Out</p>
              <p className="text-2xl font-bold text-red-600">
                {stats.stockOut || movements.filter(m => m.movementType === 'out').length}
              </p>
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
              <ArrowDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Transfers</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.transfers || movements.filter(m => m.movementType === 'transfer').length}
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ArrowRight className="h-6 w-6 text-blue-600" />
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
              placeholder="Search by product, SKU, barcode, warehouse, or reference..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="in">Stock In</option>
              <option value="out">Stock Out</option>
              <option value="transfer">Transfer</option>
              <option value="adjustment">Adjustment</option>
            </select>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filterWarehouse}
              onChange={(e) => setFilterWarehouse(e.target.value)}
            >
              <option value="all">All Warehouses</option>
              {warehouses.map(warehouse => (
                <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
              ))}
            </select>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filterDateRange}
              onChange={(e) => setFilterDateRange(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
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
        
        {selectedMovements.length > 0 && (
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">
              {selectedMovements.length} movement(s) selected
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
        Showing {filteredMovements.length} of {movements.length} movements
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <DataTable
          data={filteredMovements}
          columns={tableColumns}
          actions={[]}
          selectable={true}
          selectedRows={selectedMovements}
          onRowSelect={handleSelectMovement}
          onSelectAll={handleSelectAll}
          emptyMessage="No stock movements found. Try adjusting your search or filters."
          emptyIcon="📦"
        />
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMovements.map((movement) => (
            <div key={movement.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                    {getMovementIcon(movement.movementType)}
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900">{movement.product.name}</h3>
                    <p className="text-sm text-gray-500">{movement.product.sku}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMovementColor(movement.movementType)}`}>
                  {getMovementLabel(movement.movementType)}
                </span>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Quantity:</span>
                  <span className={`font-medium ${movement.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Warehouse:</span>
                  <span className="font-medium">{movement.warehouse.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium">{movement.location?.name || movement.location?.code || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Reference:</span>
                  <span className="font-medium">{movement.referenceId || 'N/A'}</span>
                </div>
                {movement.totalCost && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Cost:</span>
                  <span className="font-medium">${Math.abs(movement.totalCost).toFixed(2)}</span>
                </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">User:</span>
                  <span className="font-medium">
                    {movement.user?.firstName || ''} {movement.user?.lastName || ''}
                    {!movement.user?.firstName && !movement.user?.lastName && 'System'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{formatDate(movement.movementDate)}</span>
                </div>
                {movement.notes && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Notes:</span> {movement.notes}
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <button className="flex-1 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-100">
                  View Details
                </button>
                <button className="flex-1 bg-gray-50 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100">
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State for Grid View */}
      {viewMode === 'grid' && filteredMovements.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <Package className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No stock movements found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterType !== 'all' || filterWarehouse !== 'all'
              ? 'Try adjusting your search or filters.'
              : 'No stock movements have been recorded yet.'}
          </p>
        </div>
      )}

      {/* Modals */}
      <StockMovementModal
        isOpen={stockInModalOpen}
        onClose={() => setStockInModalOpen(false)}
        movementType="in"
        onSave={handleSaveStockMovement}
      />
      <StockMovementModal
        isOpen={stockOutModalOpen}
        onClose={() => setStockOutModalOpen(false)}
        movementType="out"
        onSave={handleSaveStockMovement}
      />
      <AdjustmentModal
        isOpen={adjustmentModalOpen}
        onClose={() => setAdjustmentModalOpen(false)}
        onSave={handleSaveAdjustment}
        warehouses={warehouses}
      />
      <TransferModal
        isOpen={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        onSave={handleSaveTransfer}
        warehouses={warehouses}
      />
        </>
      )}
    </div>
  )
}

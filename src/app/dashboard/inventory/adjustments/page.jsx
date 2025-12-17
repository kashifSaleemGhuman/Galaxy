'use client'

import { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  Plus,
  CalculatorIcon,
  Building2,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertTriangle,
  Package
} from 'lucide-react'
import useSWR from 'swr'
import DataTable from '@/components/ui/DataTable'
import AdjustmentModal from './_components/AdjustmentModal'

const fetcher = (url) => fetch(url).then(res => res.json())

export default function AdjustmentsPage() {
  const [adjustments, setAdjustments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterWarehouse, setFilterWarehouse] = useState('all')
  const [filterReason, setFilterReason] = useState('all')
  const [viewMode, setViewMode] = useState('table')
  const [selectedAdjustments, setSelectedAdjustments] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [selectedAdjustment, setSelectedAdjustment] = useState(null)
  const [warehouses, setWarehouses] = useState([])

  // Fetch warehouses using SWR
  const { data: warehousesData } = useSWR('/api/inventory/warehouses?limit=1000', fetcher)
  
  // Fetch adjustments using SWR
  const { data: movementsData, error: movementsError, mutate: mutateMovements } = useSWR(
    '/api/inventory/movements?type=adjustment',
    fetcher,
    { refreshInterval: 5000 }
  )

  useEffect(() => {
    if (warehousesData?.warehouses) {
      setWarehouses(warehousesData.warehouses)
    }
  }, [warehousesData])

  // Process movements data into adjustments format
  useEffect(() => {
    if (movementsData?.success && movementsData.data) {
      // Group movements by reference (adjustment reference)
      const adjustmentMap = new Map()
      
      movementsData.data
        .filter(movement => movement.referenceId && (movement.referenceId.startsWith('ADJ-') || movement.referenceId.startsWith('CC-')))
        .forEach(movement => {
          if (movement.referenceId) {
            if (!adjustmentMap.has(movement.referenceId)) {
              adjustmentMap.set(movement.referenceId, {
                id: movement.referenceId,
                adjustmentNumber: movement.referenceId,
                warehouse: movement.warehouse,
                reason: movement.notes?.includes('Cycle Count') ? 'cycle_count' : 'other',
                status: 'completed',
                notes: movement.notes || '',
                adjustmentDate: movement.movementDate,
                createdAt: movement.createdAt,
                user: movement.user,
                lines: []
              })
            }
            
            const adjustment = adjustmentMap.get(movement.referenceId)
            adjustment.lines.push({
              id: movement.id,
              product: movement.product,
              location: movement.location,
              expectedQuantity: movement.quantity < 0 ? Math.abs(movement.quantity) : 0,
              actualQuantity: movement.quantity > 0 ? movement.quantity : 0,
              difference: movement.quantity,
              notes: movement.notes
            })
          }
        })
      
      setAdjustments(Array.from(adjustmentMap.values()))
      setLoading(false)
    } else if (movementsError) {
      console.error('Error fetching adjustments:', movementsError)
      setLoading(false)
    } else if (movementsData && !movementsData.success) {
      setLoading(false)
    }
  }, [movementsData, movementsError])

  const fetchAdjustments = async () => {
    mutateMovements()
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'draft': return '📝'
      case 'pending': return '⏳'
      case 'approved': return '✅'
      case 'completed': return '🔵'
      case 'cancelled': return '❌'
      default: return '❓'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'draft': return 'Draft'
      case 'pending': return 'Pending'
      case 'approved': return 'Approved'
      case 'completed': return 'Completed'
      case 'cancelled': return 'Cancelled'
      default: return 'Unknown'
    }
  }

  const getReasonLabel = (reason) => {
    switch (reason) {
      case 'damage': return 'Damage'
      case 'theft': return 'Theft'
      case 'expired': return 'Expired'
      case 'found': return 'Found'
      case 'cycle_count': return 'Cycle Count'
      default: return 'Other'
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

  const handleCreateAdjustment = () => {
    setSelectedAdjustment(null)
    setModalMode('create')
    setShowModal(true)
  }

  const handleEditAdjustment = (adjustment) => {
    setSelectedAdjustment(adjustment)
    setModalMode('edit')
    setShowModal(true)
  }

  const handleViewAdjustment = (adjustment) => {
    setSelectedAdjustment(adjustment)
    setModalMode('view')
    setShowModal(true)
  }

  const handleDeleteAdjustment = async (adjustment) => {
    if (window.confirm(`Are you sure you want to delete adjustment "${adjustment.adjustmentNumber}"?`)) {
      try {
        // This would be an API call to delete the adjustment
        console.log('Deleting adjustment:', adjustment.id)
        // await fetch(`/api/inventory/adjustments/${adjustment.id}`, { method: 'DELETE' })
        // await fetchAdjustments()
      } catch (error) {
        console.error('Error deleting adjustment:', error)
        alert('Failed to delete adjustment')
      }
    }
  }

  const handleSaveAdjustment = async (adjustmentData) => {
    try {
      // Prepare the payload for the API
      const payload = {
        warehouseId: adjustmentData.warehouseId,
        reason: adjustmentData.reason || '',
        notes: adjustmentData.notes || '',
        reference: adjustmentData.reference || '',
        lines: adjustmentData.lines.map(line => ({
          productId: line.productId,
          expectedQuantity: parseInt(line.expectedQuantity) || 0,
          actualQuantity: parseInt(line.actualQuantity) || 0,
          locationId: line.locationId || null,
          notes: line.notes || null
        }))
      }

      const response = await fetch('/api/inventory/adjustments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create adjustment')
      }

      // Check if a request was created (for WAREHOUSE_OPERATOR and INVENTORY_MANAGER)
      if (result.message && result.message.includes('pending approval')) {
        alert('Adjustment request created successfully! It is now pending approval from Super Admin.')
      } else {
        alert('Adjustment completed successfully!')
      }

      // Refresh the adjustments list
      await fetchAdjustments()
      setShowModal(false)
      return true
    } catch (error) {
      console.error('Error saving adjustment:', error)
      alert(`Error: ${error.message || 'Failed to create adjustment'}`)
      throw error
    }
  }

  const handleSelectAdjustment = (adjustmentId) => {
    setSelectedAdjustments(prev => 
      prev.includes(adjustmentId) 
        ? prev.filter(id => id !== adjustmentId)
        : [...prev, adjustmentId]
    )
  }

  const handleSelectAll = () => {
    if (selectedAdjustments.length === adjustments.length) {
      setSelectedAdjustments([])
    } else {
      setSelectedAdjustments(adjustments.map(a => a.id))
    }
  }

  const filteredAdjustments = adjustments.filter(adjustment => {
    const matchesSearch = adjustment.adjustmentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         adjustment.warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         adjustment.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || adjustment.status === filterStatus
    const matchesWarehouse = filterWarehouse === 'all' || adjustment.warehouse.id === filterWarehouse
    const matchesReason = filterReason === 'all' || adjustment.reason === filterReason
    
    return matchesSearch && matchesStatus && matchesWarehouse && matchesReason
  })

  // Table columns configuration
  const tableColumns = [
    {
      key: 'adjustment',
      label: 'Adjustment',
      render: (item) => (
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
            <CalculatorIcon className="h-5 w-5 text-orange-600" />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{item.adjustmentNumber}</div>
            <div className="text-sm text-gray-500">{formatDate(item.adjustmentDate)}</div>
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
      key: 'reason',
      label: 'Reason',
      render: (item) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {getReasonLabel(item.reason)}
        </span>
      )
    },
    {
      key: 'lines',
      label: 'Items',
      render: (item) => (
        <div className="text-center">
          <div className="text-sm font-medium text-gray-900">{item.lines.length}</div>
          <div className="text-xs text-gray-500">products</div>
        </div>
      )
    },
    {
      key: 'impact',
      label: 'Impact',
      render: (item) => {
        const totalDifference = item.lines.reduce((sum, line) => sum + line.difference, 0)
        const totalCost = item.lines.reduce((sum, line) => sum + line.totalCost, 0)
        return (
          <div className="text-center">
            <div className={`text-sm font-medium ${totalDifference > 0 ? 'text-green-600' : totalDifference < 0 ? 'text-red-600' : 'text-gray-600'}`}>
              {totalDifference > 0 ? '+' : ''}{totalDifference}
            </div>
            <div className="text-xs text-gray-500">
              ${Math.abs(totalCost).toFixed(2)}
            </div>
          </div>
        )
      }
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
      onClick: (item) => handleViewAdjustment(item),
      title: 'View',
      className: 'text-blue-600 hover:text-blue-900'
    },
    {
      icon: <CalculatorIcon className="h-4 w-4" />,
      onClick: (item) => handleEditAdjustment(item),
      title: 'Edit',
      className: 'text-green-600 hover:text-green-900'
    },
    {
      icon: <XCircleIcon className="h-4 w-4" />,
      onClick: (item) => handleDeleteAdjustment(item),
      title: 'Delete',
      className: 'text-red-600 hover:text-red-900'
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Stock Adjustments</h1>
          <p className="text-gray-600 mt-2">Manage inventory adjustments and corrections</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleCreateAdjustment}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Create Adjustment</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Adjustments</p>
              <p className="text-2xl font-bold text-gray-900">{adjustments.length}</p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <CalculatorIcon className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {adjustments.filter(a => a.status === 'pending').length}
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
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600">
                {adjustments.filter(a => a.status === 'approved').length}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-blue-600">
                {adjustments.filter(a => a.status === 'completed').length}
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <CheckCircleIcon className="h-6 w-6 text-blue-600" />
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
              placeholder="Search by adjustment number, warehouse, or notes..."
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
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
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
              value={filterReason}
              onChange={(e) => setFilterReason(e.target.value)}
            >
              <option value="all">All Reasons</option>
              <option value="damage">Damage</option>
              <option value="theft">Theft</option>
              <option value="expired">Expired</option>
              <option value="found">Found</option>
              <option value="cycle_count">Cycle Count</option>
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
        
        {selectedAdjustments.length > 0 && (
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">
              {selectedAdjustments.length} adjustment(s) selected
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
        Showing {filteredAdjustments.length} of {adjustments.length} adjustments
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <DataTable
          data={filteredAdjustments}
          columns={tableColumns}
          actions={tableActions}
          selectable={true}
          selectedRows={selectedAdjustments}
          onRowSelect={handleSelectAdjustment}
          onSelectAll={handleSelectAll}
          emptyMessage="No adjustments found. Try adjusting your search or filters."
          emptyIcon="📊"
        />
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAdjustments.map((adjustment) => {
            const totalDifference = adjustment.lines.reduce((sum, line) => sum + line.difference, 0)
            const totalCost = adjustment.lines.reduce((sum, line) => sum + line.totalCost, 0)
            
            return (
              <div key={adjustment.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center">
                      <CalculatorIcon className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-gray-900">{adjustment.adjustmentNumber}</h3>
                      <p className="text-sm text-gray-500">{formatDate(adjustment.adjustmentDate)}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(adjustment.status)}`}>
                    {getStatusIcon(adjustment.status)} {getStatusLabel(adjustment.status)}
                  </span>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Building2 className="h-4 w-4 mr-2" />
                    <span>{adjustment.warehouse.name}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    <span>Reason: {getReasonLabel(adjustment.reason)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Package className="h-4 w-4 mr-2" />
                    <span>{adjustment.lines.length} items</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CalculatorIcon className="h-4 w-4 mr-2" />
                    <span className={`${totalDifference > 0 ? 'text-green-600' : totalDifference < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                      Impact: {totalDifference > 0 ? '+' : ''}{totalDifference} (${Math.abs(totalCost).toFixed(2)})
                    </span>
                  </div>
                  {adjustment.notes && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Notes:</span> {adjustment.notes}
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleViewAdjustment(adjustment)}
                    className="flex-1 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-100"
                  >
                    View Details
                  </button>
                  <button 
                    onClick={() => handleEditAdjustment(adjustment)}
                    className="flex-1 bg-gray-50 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100"
                  >
                    Edit
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Empty State for Grid View */}
      {viewMode === 'grid' && filteredAdjustments.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <CalculatorIcon className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No adjustments found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterStatus !== 'all' || filterWarehouse !== 'all' || filterReason !== 'all'
              ? 'Try adjusting your search or filters.'
              : 'Get started by creating your first adjustment.'}
          </p>
          <div className="mt-6">
            <button 
              onClick={handleCreateAdjustment}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Create Adjustment
            </button>
          </div>
        </div>
      )}

      {/* Adjustment Modal */}
      {showModal && (
        <AdjustmentModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          adjustment={selectedAdjustment}
          mode={modalMode}
          onSave={handleSaveAdjustment}
          warehouses={warehouses}
        />
      )}
    </div>
  )
}

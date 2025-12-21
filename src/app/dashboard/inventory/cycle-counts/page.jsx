'use client'

import { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  Plus,
  ClipboardList,
  Building2,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  Package
} from 'lucide-react'
import useSWR from 'swr'
import DataTable from '@/components/ui/DataTable'
import CycleCountModal from './_components/CycleCountModal'

const fetcher = (url) => fetch(url).then(res => res.json())

export default function CycleCountsPage() {
  const [cycleCounts, setCycleCounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterWarehouse, setFilterWarehouse] = useState('all')
  const [viewMode, setViewMode] = useState('table')
  const [selectedCounts, setSelectedCounts] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [selectedCount, setSelectedCount] = useState(null)
  const [warehouses, setWarehouses] = useState([])

  // Fetch warehouses using SWR
  const { data: warehousesData } = useSWR('/api/inventory/warehouses?limit=1000', fetcher)
  
  // Fetch cycle counts using SWR
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

  // Process movements data into cycle counts format
  useEffect(() => {
    if (movementsData?.success && movementsData.data) {
      // Filter for cycle counts and group by reference
      const cycleCountMap = new Map()
      
      movementsData.data
        .filter(movement => movement.notes?.includes('Cycle Count') || movement.referenceId?.startsWith('CC-'))
        .forEach(movement => {
          if (movement.referenceId) {
            if (!cycleCountMap.has(movement.referenceId)) {
              cycleCountMap.set(movement.referenceId, {
                id: movement.referenceId,
                countNumber: movement.referenceId,
                warehouse: movement.warehouse,
                location: movement.location,
                status: 'completed',
                notes: movement.notes || '',
                countDate: movement.movementDate,
                createdAt: movement.createdAt,
                user: movement.user,
                lines: []
              })
            }
            
            const cycleCount = cycleCountMap.get(movement.referenceId)
            cycleCount.lines.push({
              id: movement.id,
              product: movement.product,
              expectedQuantity: movement.quantity < 0 ? Math.abs(movement.quantity) : 0,
              countedQuantity: movement.quantity > 0 ? movement.quantity : 0,
              difference: movement.quantity,
              notes: movement.notes
            })
          }
        })
      
      setCycleCounts(Array.from(cycleCountMap.values()))
      setLoading(false)
    } else if (movementsError) {
      console.error('Error fetching cycle counts:', movementsError)
      setLoading(false)
    } else if (movementsData && !movementsData.success) {
      setLoading(false)
    }
  }, [movementsData, movementsError])

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'draft': return '📝'
      case 'in_progress': return '🔄'
      case 'completed': return '✅'
      case 'cancelled': return '❌'
      default: return '❓'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'draft': return 'Draft'
      case 'in_progress': return 'In Progress'
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

  const handleCreateCycleCount = () => {
    setSelectedCount(null)
    setModalMode('create')
    setShowModal(true)
  }

  const handleEditCycleCount = (cycleCount) => {
    setSelectedCount(cycleCount)
    setModalMode('edit')
    setShowModal(true)
  }

  const handleViewCycleCount = (cycleCount) => {
    setSelectedCount(cycleCount)
    setModalMode('view')
    setShowModal(true)
  }

  const handleDeleteCycleCount = async (cycleCount) => {
    if (window.confirm(`Are you sure you want to delete cycle count "${cycleCount.countNumber}"?`)) {
      try {
        // This would be an API call to delete the cycle count
        console.log('Deleting cycle count:', cycleCount.id)
        // await fetch(`/api/inventory/cycle-counts/${cycleCount.id}`, { method: 'DELETE' })
        // await fetchCycleCounts()
      } catch (error) {
        console.error('Error deleting cycle count:', error)
        alert('Failed to delete cycle count')
      }
    }
  }

  const handleSaveCycleCount = async (cycleCountData) => {
    try {
      // Show loading message
      const loadingEvent = new CustomEvent('show-toast', {
        detail: { 
          title: 'Creating Cycle Count Request...', 
          message: 'Please wait while your cycle count request is being created.',
          type: 'info',
          duration: 3000
        }
      })
      window.dispatchEvent(loadingEvent)

      // Prepare the payload for the API
      const payload = {
        warehouseId: cycleCountData.warehouseId,
        locationId: cycleCountData.locationId || null,
        countDate: cycleCountData.countDate || new Date().toISOString().split('T')[0],
        notes: cycleCountData.notes || '',
        reference: cycleCountData.reference || '',
        lines: cycleCountData.lines.map(line => ({
          productId: line.productId,
          actualQuantity: parseInt(line.actualQuantity) || 0,
          locationId: line.locationId || cycleCountData.locationId || null,
          notes: line.notes || null
        }))
      }

      const response = await fetch('/api/inventory/cycle-counts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const result = await response.json()

      if (!response.ok) {
        const errorEvent = new CustomEvent('show-toast', {
          detail: { 
            title: 'Error', 
            message: result.error || 'Failed to create cycle count request',
            type: 'error',
            duration: 5000
          }
        })
        window.dispatchEvent(errorEvent)
        throw new Error(result.error || 'Failed to create cycle count')
      }

      // Show success message
      const successEvent = new CustomEvent('show-toast', {
        detail: { 
          title: 'Cycle Count Request Created', 
          message: result.message || 'Your cycle count request has been created and is pending approval from Super Admin.',
          type: 'success',
          duration: 6000
        }
      })
      window.dispatchEvent(successEvent)

      // Refresh the cycle counts list
      await fetchCycleCounts()
      setShowModal(false)
      return true
    } catch (error) {
      console.error('Error saving cycle count:', error)
      const errorEvent = new CustomEvent('show-toast', {
        detail: { 
          title: 'Error', 
          message: error.message || 'Failed to create cycle count',
          type: 'error',
          duration: 5000
        }
      })
      window.dispatchEvent(errorEvent)
      throw error
    }
  }

  const fetchCycleCounts = async () => {
    mutateMovements()
  }

  const handleSelectCycleCount = (cycleCountId) => {
    setSelectedCounts(prev => 
      prev.includes(cycleCountId) 
        ? prev.filter(id => id !== cycleCountId)
        : [...prev, cycleCountId]
    )
  }

  const handleSelectAll = () => {
    if (selectedCounts.length === cycleCounts.length) {
      setSelectedCounts([])
    } else {
      setSelectedCounts(cycleCounts.map(c => c.id))
    }
  }

  const filteredCycleCounts = cycleCounts.filter(cycleCount => {
    const matchesSearch = cycleCount.countNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cycleCount.warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cycleCount.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || cycleCount.status === filterStatus
    const matchesWarehouse = filterWarehouse === 'all' || cycleCount.warehouse.id === filterWarehouse
    
    return matchesSearch && matchesStatus && matchesWarehouse
  })

  // Table columns configuration
  const tableColumns = [
    {
      key: 'cycleCount',
      label: 'Cycle Count',
      render: (item) => (
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
            <ClipboardList className="h-5 w-5 text-purple-600" />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{item.countNumber}</div>
            <div className="text-sm text-gray-500">{formatDate(item.countDate)}</div>
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
          <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
          <div>
            <div className="text-sm text-gray-900">{item.location?.name || 'All Locations'}</div>
            <div className="text-sm text-gray-500">{item.location?.code || 'N/A'}</div>
          </div>
        </div>
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
        const totalDifference = item.lines.reduce((sum, line) => sum + (line.difference || 0), 0)
        const totalCost = item.lines.reduce((sum, line) => sum + (line.totalCost || 0), 0)
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
      onClick: (item) => handleViewCycleCount(item),
      title: 'View',
      className: 'text-blue-600 hover:text-blue-900'
    },
    {
      icon: <ClipboardList className="h-4 w-4" />,
      onClick: (item) => handleEditCycleCount(item),
      title: 'Edit',
      className: 'text-green-600 hover:text-green-900'
    },
    {
      icon: <XCircleIcon className="h-4 w-4" />,
      onClick: (item) => handleDeleteCycleCount(item),
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
          <h1 className="text-3xl font-bold text-gray-900">Cycle Counts</h1>
          <p className="text-gray-600 mt-2">Manage physical inventory counts and audits</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleCreateCycleCount}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Create Cycle Count</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Counts</p>
              <p className="text-2xl font-bold text-gray-900">{cycleCounts.length}</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <ClipboardList className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">
                {cycleCounts.filter(c => c.status === 'in_progress').length}
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ClockIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {cycleCounts.filter(c => c.status === 'completed').length}
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
              <p className="text-sm font-medium text-gray-600">Draft</p>
              <p className="text-2xl font-bold text-gray-600">
                {cycleCounts.filter(c => c.status === 'draft').length}
              </p>
            </div>
            <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <ClipboardList className="h-6 w-6 text-gray-600" />
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
              placeholder="Search by count number, warehouse, or notes..."
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
              <option value="in_progress">In Progress</option>
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
        
        {selectedCounts.length > 0 && (
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">
              {selectedCounts.length} count(s) selected
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
        Showing {filteredCycleCounts.length} of {cycleCounts.length} cycle counts
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <DataTable
          data={filteredCycleCounts}
          columns={tableColumns}
          actions={tableActions}
          selectable={true}
          selectedRows={selectedCounts}
          onRowSelect={handleSelectCycleCount}
          onSelectAll={handleSelectAll}
          emptyMessage="No cycle counts found. Try adjusting your search or filters."
          emptyIcon="📋"
        />
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCycleCounts.map((cycleCount) => {
            const totalDifference = cycleCount.lines.reduce((sum, line) => sum + (line.difference || 0), 0)
            const totalCost = cycleCount.lines.reduce((sum, line) => sum + (line.totalCost || 0), 0)
            
            return (
              <div key={cycleCount.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                      <ClipboardList className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-gray-900">{cycleCount.countNumber}</h3>
                      <p className="text-sm text-gray-500">{formatDate(cycleCount.countDate)}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(cycleCount.status)}`}>
                    {getStatusIcon(cycleCount.status)} {getStatusLabel(cycleCount.status)}
                  </span>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Building2 className="h-4 w-4 mr-2" />
                    <span>{cycleCount.warehouse.name}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPinIcon className="h-4 w-4 mr-2" />
                    <span>{cycleCount.location?.name || 'All Locations'}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Package className="h-4 w-4 mr-2" />
                    <span>{cycleCount.lines.length} items</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <ClipboardList className="h-4 w-4 mr-2" />
                    <span className={`${totalDifference > 0 ? 'text-green-600' : totalDifference < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                      Impact: {totalDifference > 0 ? '+' : ''}{totalDifference} (${Math.abs(totalCost).toFixed(2)})
                    </span>
                  </div>
                  {cycleCount.notes && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Notes:</span> {cycleCount.notes}
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleViewCycleCount(cycleCount)}
                    className="flex-1 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-100"
                  >
                    View Details
                  </button>
                  <button 
                    onClick={() => handleEditCycleCount(cycleCount)}
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
      {viewMode === 'grid' && filteredCycleCounts.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <ClipboardList className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No cycle counts found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterStatus !== 'all' || filterWarehouse !== 'all'
              ? 'Try adjusting your search or filters.'
              : 'Get started by creating your first cycle count.'}
          </p>
          <div className="mt-6">
            <button 
              onClick={handleCreateCycleCount}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Create Cycle Count
            </button>
          </div>
        </div>
      )}

      {/* Cycle Count Modal */}
      {showModal && (
        <CycleCountModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          cycleCount={selectedCount}
          mode={modalMode}
          onSave={handleSaveCycleCount}
          warehouses={warehouses}
        />
      )}
    </div>
  )
}

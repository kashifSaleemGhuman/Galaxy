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
import DataTable from '@/components/ui/DataTable'
import CycleCountModal from './_components/CycleCountModal'

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

  // Mock data for demonstration
  useEffect(() => {
    const mockCycleCounts = [
      {
        id: '1',
        countNumber: 'CC-2024-001',
        warehouse: {
          id: '1',
          name: 'Main Warehouse',
          code: 'WH-001'
        },
        location: {
          id: '1',
          name: 'A-01-01',
          code: 'A-01-01'
        },
        status: 'completed',
        countDate: '2024-01-15T10:30:00Z',
        notes: 'Monthly cycle count for section A',
        createdAt: '2024-01-15T10:30:00Z',
        user: {
          firstName: 'John',
          lastName: 'Smith',
          email: 'john@company.com'
        },
        lines: [
          {
            id: '1',
            product: {
              name: 'Laptop Pro 15',
              sku: 'LP-001'
            },
            expectedQuantity: 25,
            countedQuantity: 23,
            difference: -2,
            unitCost: 1200.00,
            totalCost: -2400.00,
            notes: '2 units missing'
          },
          {
            id: '2',
            product: {
              name: 'Wireless Mouse',
              sku: 'WM-001'
            },
            expectedQuantity: 10,
            countedQuantity: 12,
            difference: 2,
            unitCost: 25.00,
            totalCost: 50.00,
            notes: 'Found 2 extra units'
          }
        ]
      },
      {
        id: '2',
        countNumber: 'CC-2024-002',
        warehouse: {
          id: '1',
          name: 'Main Warehouse',
          code: 'WH-001'
        },
        location: {
          id: '2',
          name: 'A-01-02',
          code: 'A-01-02'
        },
        status: 'in_progress',
        countDate: '2024-01-16T14:20:00Z',
        notes: 'Weekly cycle count for section A-01-02',
        createdAt: '2024-01-16T14:20:00Z',
        user: {
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane@company.com'
        },
        lines: [
          {
            id: '3',
            product: {
              name: 'Office Chair',
              sku: 'OC-001'
            },
            expectedQuantity: 15,
            countedQuantity: null,
            difference: null,
            unitCost: 150.00,
            totalCost: 0,
            notes: 'Counting in progress'
          }
        ]
      },
      {
        id: '3',
        countNumber: 'CC-2024-003',
        warehouse: {
          id: '2',
          name: 'Secondary Warehouse',
          code: 'WH-002'
        },
        location: {
          id: '4',
          name: 'B-01-01',
          code: 'B-01-01'
        },
        status: 'draft',
        countDate: '2024-01-17T09:15:00Z',
        notes: 'Quarterly cycle count for section B',
        createdAt: '2024-01-17T09:15:00Z',
        user: {
          firstName: 'Mike',
          lastName: 'Johnson',
          email: 'mike@company.com'
        },
        lines: []
      }
    ]

    const mockWarehouses = [
      { id: '1', name: 'Main Warehouse', code: 'WH-001' },
      { id: '2', name: 'Secondary Warehouse', code: 'WH-002' },
      { id: '3', name: 'Remote Warehouse', code: 'WH-003' }
    ]

    setCycleCounts(mockCycleCounts)
    setWarehouses(mockWarehouses)
    setLoading(false)
  }, [])

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
      // This would be an API call to save the cycle count
      console.log('Saving cycle count:', cycleCountData)
      // const response = await fetch('/api/inventory/cycle-counts', { method: 'POST', body: JSON.stringify(cycleCountData) })
      // await fetchCycleCounts()
      setShowModal(false)
      return true
    } catch (error) {
      console.error('Error saving cycle count:', error)
      throw error
    }
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

'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Building2,
  MapPin,
  User,
  BarChart3,
  CheckCircle,
  XCircle
} from 'lucide-react'
import DataTable from '@/components/ui/DataTable'
import LoadingBar from '@/components/ui/LoadingBar'
import WarehouseModal from './_components/WarehouseModal'
import LocationManager from './_components/LocationManager'
import ManagerCreator from './_components/ManagerCreator'
import { ROLES } from '@/lib/constants/roles'

export default function WarehousesPage() {
  const { data: session } = useSession()
  const userRole = (session?.user?.role || '').toUpperCase()
  const isSuperAdmin = userRole === ROLES.SUPER_ADMIN
  
  const [warehouses, setWarehouses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [viewMode, setViewMode] = useState('table')
  const [selectedWarehouses, setSelectedWarehouses] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [selectedWarehouse, setSelectedWarehouse] = useState(null)
  const [managers, setManagers] = useState([])
  const [showLocationManager, setShowLocationManager] = useState(false)
  const [showManagerCreator, setShowManagerCreator] = useState(false)
  const [selectedWarehouseForManager, setSelectedWarehouseForManager] = useState(null)

  // Fetch warehouses from API
  useEffect(() => {
    fetchWarehouses()
    fetchManagers()
  }, [searchTerm, filterStatus])

  const fetchWarehouses = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '50'
      })
      
      if (searchTerm) params.append('search', searchTerm)
      if (filterStatus !== 'all') params.append('status', filterStatus)

      const response = await fetch(`/api/inventory/warehouses?${params}`)
      if (response.ok) {
        const data = await response.json()
        setWarehouses(data.warehouses || [])
      } else {
        console.error('Failed to fetch warehouses')
      }
    } catch (error) {
      console.error('Error fetching warehouses:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchManagers = async () => {
    try {
      // Fetch users with WAREHOUSE_OPERATOR role who can be managers
      const response = await fetch('/api/users?role=WAREHOUSE_OPERATOR')
      if (response.ok) {
        const result = await response.json()
        if (result.users) {
          setManagers(result.users.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email
          })))
        } else {
          setManagers([])
        }
      } else {
        setManagers([])
      }
    } catch (error) {
      console.error('Error fetching managers:', error)
      setManagers([])
    }
  }

  const handleCreateWarehouse = () => {
    setSelectedWarehouse(null)
    setModalMode('create')
    setShowModal(true)
  }

  const handleEditWarehouse = (warehouse) => {
    setSelectedWarehouse(warehouse)
    setModalMode('edit')
    setShowModal(true)
  }

  const handleViewWarehouse = (warehouse) => {
    setSelectedWarehouse(warehouse)
    setModalMode('view')
    setShowModal(true)
  }

  const handleDeleteWarehouse = async (warehouse) => {
    if (window.confirm(`Are you sure you want to delete "${warehouse.name}"?`)) {
      try {
        const response = await fetch(`/api/inventory/warehouses/${warehouse.id}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          await fetchWarehouses()
        } else {
          const error = await response.json()
          alert(error.error || 'Failed to delete warehouse')
        }
      } catch (error) {
        console.error('Error deleting warehouse:', error)
        alert('Failed to delete warehouse')
      }
    }
  }

  const handleSaveWarehouse = async (warehouseData) => {
    try {
      const url = modalMode === 'create' 
        ? '/api/inventory/warehouses'
        : `/api/inventory/warehouses/${selectedWarehouse.id}`
      
      const method = modalMode === 'create' ? 'POST' : 'PUT'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(warehouseData),
      })
      
      if (response.ok) {
        await fetchWarehouses()
        setShowModal(false)
        return true
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save warehouse')
      }
    } catch (error) {
      console.error('Error saving warehouse:', error)
      throw error
    }
  }

  const handleManageLocations = (warehouse) => {
    setSelectedWarehouse(warehouse)
    setShowLocationManager(true)
  }

  const handleCreateManager = (warehouse) => {
    // Check if warehouse already has a manager
    if (warehouse.managerId || warehouse.manager) {
      // Show manager info or allow viewing credentials
      alert(`Manager already assigned: ${warehouse.manager?.name || warehouse.manager?.email || 'N/A'}\n\nNote: Password cannot be retrieved. Please contact Super Admin to reset if needed.`)
      return
    }
    setSelectedWarehouseForManager(warehouse)
    setShowManagerCreator(true)
  }

  const handleManagerCreated = () => {
    fetchWarehouses() // Refresh to show new manager
  }

  const getStatusColor = (isActive) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
  }

  const getStatusIcon = (isActive) => {
    return isActive ? '🟢' : '⚫'
  }

  const handleSelectWarehouse = (warehouseId) => {
    setSelectedWarehouses(prev => 
      prev.includes(warehouseId) 
        ? prev.filter(id => id !== warehouseId)
        : [...prev, warehouseId]
    )
  }

  const handleSelectAll = () => {
    if (selectedWarehouses.length === warehouses.length) {
      setSelectedWarehouses([])
    } else {
      setSelectedWarehouses(warehouses.map(w => w.id))
    }
  }

  const filteredWarehouses = warehouses.filter(warehouse => {
    const matchesSearch = warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         warehouse.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         warehouse.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         warehouse.state?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || warehouse.isActive === (filterStatus === 'active')
    
    return matchesSearch && matchesStatus
  })

  // Table columns configuration
  const tableColumns = [
    {
      key: 'warehouse',
      label: 'Warehouse',
      render: (item) => (
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-blue-600" />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{item.name}</div>
            <div className="text-sm text-gray-500">{item.code}</div>
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
            <div className="text-sm text-gray-900">{item.city}, {item.state}</div>
            <div className="text-sm text-gray-500">{item.country}</div>
          </div>
        </div>
      )
    },
    {
      key: 'manager',
      label: 'Manager',
      render: (item) => (
        <div className="flex items-center">
          <User className="h-4 w-4 text-gray-400 mr-2" />
          <div>
            {item.manager ? (
              <>
                <div className="text-sm text-gray-900">{item.manager.name || item.manager.email}</div>
                <div className="text-sm text-gray-500">{item.manager.email}</div>
              </>
            ) : (
              <span className="text-sm text-gray-400">No manager assigned</span>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'stats',
      label: 'Statistics',
      render: (item) => (
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className="text-sm font-medium text-gray-900">{item._count?.locations || 0}</div>
            <div className="text-xs text-gray-500">Locations</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-gray-900">{item._count?.inventoryItems || 0}</div>
            <div className="text-xs text-gray-500">Items</div>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (item) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.isActive)}`}>
          {getStatusIcon(item.isActive)} {item.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions'
    }
  ]

  // Table actions - only Super Admin can edit/delete warehouses
  const tableActions = [
    {
      icon: <Eye className="h-4 w-4" />,
      onClick: (item) => handleViewWarehouse(item),
      title: 'View',
      className: 'text-blue-600 hover:text-blue-900'
    },
    ...(isSuperAdmin ? [{
      icon: <Edit className="h-4 w-4" />,
      onClick: (item) => handleEditWarehouse(item),
      title: 'Edit',
      className: 'text-green-600 hover:text-green-900'
    }] : []),
    {
      icon: <MapPin className="h-4 w-4" />,
      onClick: (item) => handleManageLocations(item),
      title: 'Manage Locations',
      className: 'text-purple-600 hover:text-purple-900'
    },
    {
      icon: <User className="h-4 w-4" />,
      onClick: (item) => handleCreateManager(item),
      title: 'Manager',
      className: 'text-orange-600 hover:text-orange-900'
    },
    ...(isSuperAdmin ? [{
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (item) => handleDeleteWarehouse(item),
      title: 'Delete',
      className: 'text-red-600 hover:text-red-900'
    }] : [])
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Loading Bar */}
      {loading && <LoadingBar loading={loading} message="Loading warehouses..." />}
      
      {!loading && (
        <>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Warehouses</h1>
          <p className="text-gray-600 mt-2">Manage your warehouse locations and operations</p>
        </div>
        <div className="flex space-x-3">
          {isSuperAdmin && (
            <button 
              onClick={handleCreateWarehouse}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Add Warehouse</span>
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search warehouses by name, code, or location..."
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
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
        
        {selectedWarehouses.length > 0 && (
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">
              {selectedWarehouses.length} warehouse(s) selected
            </span>
            <button className="text-red-600 hover:text-red-800 text-sm font-medium">
              Delete Selected
            </button>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Export Selected
            </button>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredWarehouses.length} of {warehouses.length} warehouses
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <DataTable
          data={filteredWarehouses}
          columns={tableColumns}
          actions={tableActions}
          selectable={true}
          selectedRows={selectedWarehouses}
          onRowSelect={handleSelectWarehouse}
          onSelectAll={handleSelectAll}
          emptyMessage="No warehouses found. Try adjusting your search or filters."
          emptyIcon="🏢"
        />
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWarehouses.map((warehouse) => (
            <div key={warehouse.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900">{warehouse.name}</h3>
                    <p className="text-sm text-gray-500">{warehouse.code}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(warehouse.isActive)}`}>
                  {getStatusIcon(warehouse.isActive)} {warehouse.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{warehouse.city}, {warehouse.state}</span>
                </div>
                {warehouse.manager && (
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="h-4 w-4 mr-2" />
                    <span>{warehouse.manager.name || warehouse.manager.email}</span>
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-600">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  <span>{warehouse._count?.locations || 0} locations, {warehouse._count?.inventoryItems || 0} items</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <button 
                  onClick={() => handleViewWarehouse(warehouse)}
                  className="flex-1 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-100"
                >
                  View Details
                </button>
                <button 
                  onClick={() => handleEditWarehouse(warehouse)}
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
      {viewMode === 'grid' && filteredWarehouses.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <Building2 className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No warehouses found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterStatus !== 'all'
              ? 'Try adjusting your search or filters.'
              : 'Get started by creating your first warehouse.'}
          </p>
          {isSuperAdmin && (
            <div className="mt-6">
              <button 
                onClick={handleCreateWarehouse}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Add Warehouse
              </button>
            </div>
          )}
        </div>
      )}

      {/* Warehouse Modal */}
      {showModal && (
        <WarehouseModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          warehouse={selectedWarehouse}
          mode={modalMode}
          onSave={handleSaveWarehouse}
          managers={managers}
        />
      )}

      {/* Location Manager Modal */}
      {showLocationManager && selectedWarehouse && (
        <LocationManager
          warehouseId={selectedWarehouse.id}
          isOpen={showLocationManager}
          onClose={() => {
            setShowLocationManager(false)
            setSelectedWarehouse(null)
          }}
          onLocationChange={fetchWarehouses}
        />
      )}

      {/* Manager Creator Modal */}
      {showManagerCreator && selectedWarehouseForManager && (
        <ManagerCreator
          warehouseId={selectedWarehouseForManager.id}
          warehouseName={selectedWarehouseForManager.name}
          isOpen={showManagerCreator}
          onClose={() => {
            setShowManagerCreator(false)
            setSelectedWarehouseForManager(null)
          }}
          onManagerCreated={handleManagerCreated}
        />
      )}
        </>
      )}
    </div>
  )
}

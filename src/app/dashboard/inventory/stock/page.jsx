'use client'

import { useState, useEffect, useMemo } from 'react'
import { 
  Search, 
  Filter, 
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Building2,
  MapPin,
  BarChart3,
  Download,
  FileText
} from 'lucide-react'
import useSWR from 'swr'
import DataTable from '@/components/ui/DataTable'

const fetcher = (url) => fetch(url).then(res => res.json())

export default function StockPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterWarehouse, setFilterWarehouse] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [viewMode, setViewMode] = useState('table')
  const [selectedItems, setSelectedItems] = useState([])
  const [showReportModal, setShowReportModal] = useState(false)

  // Close report modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showReportModal && !event.target.closest('.report-dropdown')) {
        setShowReportModal(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showReportModal])

  // Fetch inventory data using SWR with real-time updates
  const { data: inventoryData, error: inventoryError, mutate: mutateInventory } = useSWR(
    '/api/inventory/items',
    fetcher,
    { refreshInterval: 5000 }
  )

  const stockItems = inventoryData?.data || []
  const warehouses = inventoryData?.warehouses || []
  const loading = !inventoryData && !inventoryError

  const getStockStatus = (item) => {
    if (item.quantityOnHand <= 0) {
      return { status: 'Out of Stock', color: 'bg-red-100 text-red-800', icon: '🔴' }
    }
    if (item.quantityOnHand <= item.reorderPoint) {
      return { status: 'Low Stock', color: 'bg-orange-100 text-orange-800', icon: '🟠' }
    }
    if (item.quantityOnHand >= item.maxStock * 0.9) {
      return { status: 'High Stock', color: 'bg-blue-100 text-blue-800', icon: '🔵' }
    }
    return { status: 'In Stock', color: 'bg-green-100 text-green-800', icon: '🟢' }
  }

  const getStockTrend = (item) => {
    // Calculate trend based on last movement
    if (!item.lastMovementDate) return 'stable'
    
    // For now, return stable - can be enhanced with historical data
    return 'stable'
  }

  // Generate CSV report
  const generateCSVReport = () => {
    const headers = ['Product', 'SKU', 'Warehouse', 'Location', 'Quantity On Hand', 'Available', 'Reserved', 'Status', 'Reorder Point', 'Min Stock', 'Max Stock']
    const rows = filteredItems.map(item => [
      item.product.name,
      item.product.sku || item.product.id,
      item.warehouse.name,
      item.location.name,
      item.quantityOnHand,
      item.quantityAvailable,
      item.quantityReserved,
      getStockStatus(item).status,
      item.reorderPoint,
      item.minStock,
      item.maxStock
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `stock-levels-report-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Generate PDF report (simplified - opens print dialog)
  const generatePDFReport = () => {
    window.print()
  }

  // Generate comprehensive report
  const generateReport = (format = 'csv') => {
    if (format === 'csv') {
      generateCSVReport()
    } else if (format === 'pdf') {
      generatePDFReport()
    }
  }

  const handleSelectItem = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const handleSelectAll = () => {
    if (selectedItems.length === stockItems.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(stockItems.map(item => item.id))
    }
  }

  const filteredItems = useMemo(() => {
    return stockItems.filter(item => {
      const matchesSearch = item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.product.barcode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.warehouse.name.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesWarehouse = filterWarehouse === 'all' || item.warehouse.id === filterWarehouse
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus
      
      return matchesSearch && matchesWarehouse && matchesStatus
    })
  }, [stockItems, searchTerm, filterWarehouse, filterStatus])

  // Table columns configuration
  const tableColumns = [
    {
      key: 'product',
      label: 'Product',
      render: (item) => (
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <Package className="h-5 w-5 text-blue-600" />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{item.product.name}</div>
            <div className="text-sm text-gray-500">{item.product.sku}</div>
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
            <div className="text-sm text-gray-900">{item.location?.name || 'No Location'}</div>
            <div className="text-sm text-gray-500">{item.location?.code || 'N/A'}</div>
          </div>
        </div>
      )
    },
    {
      key: 'quantity',
      label: 'Quantity',
      render: (item) => (
        <div className="text-center">
          <div className="text-sm font-medium text-gray-900">{item.quantityOnHand}</div>
          <div className="text-xs text-gray-500">
            Available: {item.quantityAvailable}
          </div>
          {item.quantityReserved > 0 && (
            <div className="text-xs text-orange-600">
              Reserved: {item.quantityReserved}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'reorder',
      label: 'Reorder Info',
      render: (item) => (
        <div className="text-center">
          <div className="text-sm text-gray-900">
            Min: {item.minStock} | Max: {item.maxStock}
          </div>
          <div className="text-xs text-gray-500">
            Reorder at: {item.reorderPoint}
          </div>
        </div>
      )
    },
    {
      key: 'cost',
      label: 'Cost',
      render: (item) => (
        <div className="text-right">
          <div className="text-sm font-medium text-gray-900">
            ${item.averageCost?.toFixed(2) || '0.00'}
          </div>
          <div className="text-xs text-gray-500">
            Last: ${item.lastCost?.toFixed(2) || '0.00'}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (item) => {
        const stockStatus = getStockStatus(item)
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.color}`}>
            {stockStatus.icon} {stockStatus.status}
          </span>
        )
      }
    },
    {
      key: 'trend',
      label: 'Trend',
      render: (item) => {
        const trend = getStockTrend(item)
        return (
          <div className="flex items-center justify-center">
            {trend === 'up' && <TrendingUp className="h-4 w-4 text-green-600" />}
            {trend === 'down' && <TrendingDown className="h-4 w-4 text-red-600" />}
            {trend === 'stable' && <BarChart3 className="h-4 w-4 text-gray-600" />}
          </div>
        )
      }
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
          <h1 className="text-3xl font-bold text-gray-900">Stock Levels</h1>
          <p className="text-gray-600 mt-2">Monitor inventory levels across all warehouses</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => window.location.href = '/dashboard/inventory/adjustments'}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <Package className="h-5 w-5" />
            <span>Stock Adjustment</span>
          </button>
          <div className="relative report-dropdown">
            <button 
              onClick={() => setShowReportModal(!showReportModal)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <BarChart3 className="h-5 w-5" />
              <span>Generate Report</span>
            </button>
            {showReportModal && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="py-1">
                  <button
                    onClick={() => {
                      generateReport('csv')
                      setShowReportModal(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export as CSV</span>
                  </button>
                  <button
                    onClick={() => {
                      generateReport('pdf')
                      setShowReportModal(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Print/PDF Report</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{stockItems.length}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Stock</p>
              <p className="text-2xl font-bold text-green-600">
                {stockItems.filter(item => item.quantityOnHand > 0 && item.quantityOnHand > item.reorderPoint).length}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-orange-600">
                {stockItems.filter(item => item.quantityOnHand > 0 && item.quantityOnHand <= item.reorderPoint).length}
              </p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">
                {stockItems.filter(item => item.quantityOnHand <= 0).length}
              </p>
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="h-6 w-6 text-red-600" />
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
              placeholder="Search by product name, SKU, barcode, or warehouse..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
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
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
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
        
        {selectedItems.length > 0 && (
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">
              {selectedItems.length} item(s) selected
            </span>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Export Selected
            </button>
            <button className="text-green-600 hover:text-green-800 text-sm font-medium">
              Bulk Adjustment
            </button>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredItems.length} of {stockItems.length} stock items
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <DataTable
          data={filteredItems}
          columns={tableColumns}
          actions={[]}
          selectable={true}
          selectedRows={selectedItems}
          onRowSelect={handleSelectItem}
          onSelectAll={handleSelectAll}
          emptyMessage="No stock items found. Try adjusting your search or filters."
          emptyIcon="📦"
        />
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const stockStatus = getStockStatus(item)
            const trend = getStockTrend(item)
            return (
              <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-gray-900">{item.product.name}</h3>
                      <p className="text-sm text-gray-500">{item.product.sku}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.color}`}>
                    {stockStatus.icon} {stockStatus.status}
                  </span>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Warehouse:</span>
                    <span className="font-medium">{item.warehouse.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium">{item.location?.name || 'No Location'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-medium">{item.quantityOnHand}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Available:</span>
                    <span className="font-medium">{item.quantityAvailable}</span>
                  </div>
                  {item.quantityReserved > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Reserved:</span>
                      <span className="font-medium text-orange-600">{item.quantityReserved}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Avg Cost:</span>
                    <span className="font-medium">${item.averageCost?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600">Trend:</span>
                    <div className="ml-2">
                      {trend === 'up' && <TrendingUp className="h-4 w-4 text-green-600" />}
                      {trend === 'down' && <TrendingDown className="h-4 w-4 text-red-600" />}
                      {trend === 'stable' && <BarChart3 className="h-4 w-4 text-gray-600" />}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Reorder at: {item.reorderPoint}</div>
                    <div className="text-xs text-gray-500">Min: {item.minStock} | Max: {item.maxStock}</div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button 
                    onClick={() => window.location.href = `/dashboard/inventory/products?productId=${item.product.id}`}
                    className="flex-1 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-100"
                  >
                    View Details
                  </button>
                  <button 
                    onClick={() => window.location.href = '/dashboard/inventory/adjustments'}
                    className="flex-1 bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-100"
                  >
                    Adjust Stock
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Empty State for Grid View */}
      {viewMode === 'grid' && filteredItems.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <Package className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No stock items found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterWarehouse !== 'all' || filterStatus !== 'all'
              ? 'Try adjusting your search or filters.'
              : 'No inventory items have been added yet.'}
          </p>
        </div>
      )}
    </div>
  )
}

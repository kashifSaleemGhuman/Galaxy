'use client'

import { useState, useEffect } from 'react'
import { 
  Package, 
  Building2, 
  MapPin, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Truck,
  BarChart3,
  ArrowRight,
  Plus,
  FileText,
  Loader2
} from 'lucide-react'
import Link from 'next/link'

export default function InventoryOverview() {
  const [stats, setStats] = useState({})
  const [recentMovements, setRecentMovements] = useState([])
  const [lowStockItems, setLowStockItems] = useState([])
  const [pendingReceipts, setPendingReceipts] = useState([])
  const [loading, setLoading] = useState(true)
  const [creatingMockPO, setCreatingMockPO] = useState(false)
  const [suppliers, setSuppliers] = useState([])

  useEffect(() => {
    fetchSuppliers()
    
    // Mock data for inventory overview
    const mockStats = {
      totalProducts: 156,
      totalWarehouses: 3,
      totalLocations: 12,
      totalValue: 125000,
      lowStockItems: 8,
      pendingReceipts: 3,
      recentMovements: 24
    }

    const mockRecentMovements = [
      {
        id: 'SM-001',
        type: 'in',
        product: 'Paper A4 80gsm',
        quantity: 50,
        warehouse: 'Main Warehouse',
        date: '2024-01-15',
        reference: 'GR-001'
      },
      {
        id: 'SM-002',
        type: 'out',
        product: 'Stapler Heavy Duty',
        quantity: 5,
        warehouse: 'Main Warehouse',
        date: '2024-01-15',
        reference: 'SO-001'
      },
      {
        id: 'SM-003',
        type: 'transfer',
        product: 'Printer Ink Black',
        quantity: 10,
        warehouse: 'Main Warehouse → Secondary Warehouse',
        date: '2024-01-14',
        reference: 'TR-001'
      },
      {
        id: 'SM-004',
        type: 'adjustment',
        product: 'Desk Chairs',
        quantity: -2,
        warehouse: 'Main Warehouse',
        date: '2024-01-14',
        reference: 'ADJ-001'
      }
    ]

    const mockLowStockItems = [
      {
        id: 'P-001',
        name: 'Paper A4 80gsm',
        sku: 'PAP-001',
        currentStock: 5,
        reorderPoint: 20,
        warehouse: 'Main Warehouse',
        status: 'critical'
      },
      {
        id: 'P-002',
        name: 'Printer Ink Black',
        sku: 'INK-001',
        currentStock: 2,
        reorderPoint: 10,
        warehouse: 'Main Warehouse',
        status: 'critical'
      },
      {
        id: 'P-003',
        name: 'Mouse Wireless',
        sku: 'MOU-001',
        currentStock: 8,
        reorderPoint: 15,
        warehouse: 'Secondary Warehouse',
        status: 'low'
      }
    ]

    const mockPendingReceipts = [
      {
        id: 'GR-001',
        poNumber: 'PO-101',
        supplier: 'Acme Supplies',
        expectedDate: '2024-01-20',
        totalLines: 3,
        totalValue: 245.00,
        status: 'in_transit'
      },
      {
        id: 'GR-002',
        poNumber: 'PO-102',
        supplier: 'Office Depot',
        expectedDate: '2024-01-22',
        totalLines: 2,
        totalValue: 120.00,
        status: 'draft'
      },
      {
        id: 'GR-003',
        poNumber: 'PO-103',
        supplier: 'Tech Solutions',
        expectedDate: '2024-01-18',
        totalLines: 2,
        totalValue: 150.00,
        status: 'partially_received'
      }
    ]

    setStats(mockStats)
    setRecentMovements(mockRecentMovements)
    setLowStockItems(mockLowStockItems)
    setPendingReceipts(mockPendingReceipts)
    setLoading(false)
  }, [])

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/purchase/suppliers')
      if (response.ok) {
        const data = await response.json()
        setSuppliers(data)
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error)
    }
  }


  const createMockPO = async () => {
    setCreatingMockPO(true)
    try {
      // Create request body with available data or empty
      const requestBody = {}
      
      if (suppliers.length > 0) {
        const randomSupplier = suppliers[Math.floor(Math.random() * suppliers.length)]
        requestBody.supplierId = randomSupplier.supplierId || randomSupplier.id
      }
      

      const response = await fetch('/api/inventory/mock-po', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      if (response.ok) {
        const result = await response.json()
        alert(`Mock PO created successfully!\nPO Number: ${result.purchaseOrder.poId}\nGoods Receipt ID: ${result.goodsReceipt.receiptId}`)
        // Refresh the page to show new data
        window.location.reload()
      } else {
        const error = await response.json()
        alert(`Error creating mock PO: ${error.error}`)
      }
    } catch (error) {
      console.error('Error creating mock PO:', error)
      alert('Error creating mock PO')
    } finally {
      setCreatingMockPO(false)
    }
  }

  const getMovementIcon = (type) => {
    switch (type) {
      case 'in': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'out': return <TrendingDown className="h-4 w-4 text-red-600" />
      case 'transfer': return <ArrowRight className="h-4 w-4 text-blue-600" />
      case 'adjustment': return <BarChart3 className="h-4 w-4 text-orange-600" />
      default: return <Package className="h-4 w-4 text-gray-600" />
    }
  }

  const getMovementColor = (type) => {
    switch (type) {
      case 'in': return 'text-green-600'
      case 'out': return 'text-red-600'
      case 'transfer': return 'text-blue-600'
      case 'adjustment': return 'text-orange-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'low': return 'bg-yellow-100 text-yellow-800'
      case 'in_transit': return 'bg-blue-100 text-blue-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'partially_received': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />
      case 'low': return <Clock className="h-4 w-4" />
      case 'in_transit': return <Truck className="h-4 w-4" />
      case 'draft': return <Clock className="h-4 w-4" />
      case 'partially_received': return <CheckCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Inventory Overview</h1>
          <p className="text-gray-600 mt-2">Monitor your inventory levels, movements, and operations</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={createMockPO}
            disabled={creatingMockPO}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {creatingMockPO ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <FileText className="h-5 w-5" />
            )}
            <span>{creatingMockPO ? 'Creating...' : 'Create Mock PO'}</span>
          </button>
          <Link href="/dashboard/inventory/products" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Building2 className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Warehouses</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalWarehouses}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <MapPin className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Locations</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalLocations}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">${stats.totalValue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alert */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Low Stock Alert</h3>
              <span className="bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                {lowStockItems.length} items
              </span>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {lowStockItems.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.sku} • {item.warehouse}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{item.currentStock} / {item.reorderPoint}</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {getStatusIcon(item.status)} {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link href="/dashboard/inventory/stock" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View all low stock items →
              </Link>
            </div>
          </div>
        </div>

        {/* Pending Receipts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Pending Receipts</h3>
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                {pendingReceipts.length} receipts
              </span>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {pendingReceipts.slice(0, 3).map((receipt) => (
                <div key={receipt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Truck className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{receipt.id}</p>
                      <p className="text-sm text-gray-500">{receipt.supplier} • {receipt.expectedDate}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">${receipt.totalValue.toFixed(2)}</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(receipt.status)}`}>
                      {getStatusIcon(receipt.status)} {receipt.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link href="/dashboard/inventory/receipts" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View all receipts →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Movements */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Stock Movements</h3>
            <Link href="/dashboard/inventory/movements" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View all movements →
            </Link>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentMovements.map((movement) => (
              <div key={movement.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    {getMovementIcon(movement.type)}
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">{movement.product}</p>
                    <p className="text-sm text-gray-500">{movement.warehouse} • {movement.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${getMovementColor(movement.type)}`}>
                    {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                  </p>
                  <p className="text-sm text-gray-500">{movement.reference}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/dashboard/inventory/products" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Manage Products</p>
                  <p className="text-sm text-gray-500">Add, edit, or view products</p>
                </div>
              </div>
            </Link>

            <Link href="/dashboard/inventory/stock" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">View Stock</p>
                  <p className="text-sm text-gray-500">Check current stock levels</p>
                </div>
              </div>
            </Link>

            <Link href="/dashboard/inventory/receipts" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <Truck className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Goods Receipts</p>
                  <p className="text-sm text-gray-500">Validate incoming shipments</p>
                </div>
              </div>
            </Link>

            <Link href="/dashboard/inventory/transfers" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <ArrowRight className="h-8 w-8 text-orange-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Stock Transfers</p>
                  <p className="text-sm text-gray-500">Move stock between locations</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
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
  Package,
  Barcode,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from 'lucide-react'
import DataTable from '@/components/ui/DataTable'
import LoadingBar from '@/components/ui/LoadingBar'
import ProductModal from './_components/ProductModal'
import { ROLES } from '@/lib/constants/roles'

export default function ProductsPage() {
  const { data: session } = useSession()
  const userRole = session?.user?.role?.toUpperCase() || ''
  
  // Check if user can create/edit/delete products
  const canManageProducts = [
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
    ROLES.PURCHASE_MANAGER,
    ROLES.PURCHASE_USER
  ].includes(userRole)
  
  // Inventory managers and warehouse operators can only view
  const canOnlyView = [
    ROLES.INVENTORY_MANAGER,
    ROLES.WAREHOUSE_OPERATOR
  ].includes(userRole)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterTrackQuantity, setFilterTrackQuantity] = useState('all')
  const [viewMode, setViewMode] = useState('table')
  const [selectedProducts, setSelectedProducts] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [categories, setCategories] = useState([])
  const [warehouses, setWarehouses] = useState([])

  // Fetch products from API
  useEffect(() => {
    fetchProducts()
    fetchCategories()
    fetchWarehouses()
  }, [searchTerm, filterCategory, filterStatus, filterTrackQuantity])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      console.log('🔍 Fetching products...')
      const params = new URLSearchParams({
        page: '1',
        limit: '50'
      })
      
      if (searchTerm) params.append('search', searchTerm)
      if (filterCategory !== 'all') params.append('category', filterCategory)
      if (filterStatus !== 'all') params.append('status', filterStatus)
      if (filterTrackQuantity !== 'all') params.append('trackQuantity', filterTrackQuantity)

      console.log('📡 Products API URL:', `/api/inventory/products?${params}`)
      const response = await fetch(`/api/inventory/products?${params}`)
      console.log('📡 Products response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('📦 Products data received:', data)
        setProducts(data.products || [])
      } else {
        const errorData = await response.json()
        console.error('❌ Failed to fetch products:', response.status, errorData)
      }
    } catch (error) {
      console.error('❌ Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      console.log('🔍 Fetching categories...')
      const response = await fetch('/api/inventory/categories')
      console.log('📡 Categories response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('📦 Categories loaded:', data)
        setCategories(data)
      } else {
        console.error('❌ Failed to fetch categories:', response.status)
        // Fallback to empty array
        setCategories([])
      }
    } catch (error) {
      console.error('❌ Error fetching categories:', error)
      setCategories([])
    }
  }

  const fetchWarehouses = async () => {
    try {
      const response = await fetch('/api/inventory/warehouses?page=1&limit=100')
      if (response.ok) {
        const data = await response.json()
        setWarehouses(data.warehouses || [])
      } else {
        setWarehouses([])
      }
    } catch (error) {
      setWarehouses([])
    }
  }

  const handleCreateProduct = () => {
    setSelectedProduct(null)
    setModalMode('create')
    setShowModal(true)
  }

  const handleEditProduct = (product) => {
    setSelectedProduct(product)
    setModalMode('edit')
    setShowModal(true)
  }

  const handleViewProduct = (product) => {
    setSelectedProduct(product)
    setModalMode('view')
    setShowModal(true)
  }

  const handleDeleteProduct = async (product) => {
    if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      try {
        const response = await fetch(`/api/inventory/products/${product.id}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          await fetchProducts()
        } else {
          const error = await response.json()
          alert(error.error || 'Failed to delete product')
        }
      } catch (error) {
        console.error('Error deleting product:', error)
        alert('Failed to delete product')
      }
    }
  }

  const handleSaveProduct = async (productData) => {
    try {
      const url = modalMode === 'create' 
        ? '/api/inventory/products'
        : `/api/inventory/products/${selectedProduct.id}`
      
      const method = modalMode === 'create' ? 'POST' : 'PUT'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      })
      
      if (response.ok) {
        await fetchProducts()
        setShowModal(false)
        return true
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save product')
      }
    } catch (error) {
      console.error('Error saving product:', error)
      throw error
    }
  }

  const getStatusColor = (isActive) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
  }

  const getStatusIcon = (isActive) => {
    return isActive ? '🟢' : '⚫'
  }

  const getStockStatus = (product) => {
    if (!product.trackQuantity) return { status: 'Not Tracked', color: 'bg-gray-100 text-gray-800', icon: '📊' }
    
    const totalStock = product.inventoryItems?.reduce((sum, item) => sum + item.quantityOnHand, 0) || 0
    
    if (totalStock <= 0) return { status: 'Out of Stock', color: 'bg-red-100 text-red-800', icon: '🔴' }
    if (totalStock <= product.reorderPoint) return { status: 'Low Stock', color: 'bg-orange-100 text-orange-800', icon: '🟠' }
    return { status: 'In Stock', color: 'bg-green-100 text-green-800', icon: '🟢' }
  }

  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(products.map(p => p.id))
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = filterCategory === 'all' || product.categoryId === filterCategory
    const matchesStatus = filterStatus === 'all' || product.isActive === (filterStatus === 'active')
    const matchesTrackQuantity = filterTrackQuantity === 'all' || 
                                product.trackQuantity === (filterTrackQuantity === 'tracked')
    
    return matchesSearch && matchesCategory && matchesStatus && matchesTrackQuantity
  })

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
            <div className="text-sm font-medium text-gray-900">{item.name}</div>
            <div className="text-sm text-gray-500">{item.sku || 'No SKU'}</div>
          </div>
        </div>
      )
    },
    {
      key: 'category',
      label: 'Category',
      render: (item) => (
        <span className="text-sm text-gray-900">
          {item.category?.name || 'Uncategorized'}
        </span>
      )
    },
    {
      key: 'barcode',
      label: 'Barcode',
      render: (item) => (
        <div className="flex items-center">
          {item.barcode ? (
            <>
              <Barcode className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-900 font-mono">{item.barcode}</span>
            </>
          ) : (
            <span className="text-sm text-gray-400">No barcode</span>
          )}
        </div>
      )
    },
    {
      key: 'price',
      label: 'Price',
      render: (item) => (
        <span className="text-sm text-gray-900">
          ${parseFloat(item.price || 0).toFixed(2)}
        </span>
      )
    },
    {
      key: 'stock',
      label: 'Stock Status',
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
      key: 'status',
      label: 'Status',
      render: (item) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.isActive)}`}>
          {getStatusIcon(item.isActive)} {item.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'trackQuantity',
      label: 'Track Qty',
      render: (item) => (
        <span className="text-sm text-gray-900">
          {item.trackQuantity ? (
            <CheckCircleIcon className="h-4 w-4 text-green-600" />
          ) : (
            <XCircleIcon className="h-4 w-4 text-gray-400" />
          )}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions'
    }
  ]

  // Table actions - only show edit/delete for users who can manage products
  const tableActions = [
    {
      icon: <Eye className="h-4 w-4" />,
      onClick: (item) => handleViewProduct(item),
      title: 'View',
      className: 'text-blue-600 hover:text-blue-900'
    },
    ...(canManageProducts ? [
      {
        icon: <Edit className="h-4 w-4" />,
        onClick: (item) => handleEditProduct(item),
        title: 'Edit',
        className: 'text-green-600 hover:text-green-900'
      },
      {
        icon: <Trash2 className="h-4 w-4" />,
        onClick: (item) => handleDeleteProduct(item),
        title: 'Delete',
        className: 'text-red-600 hover:text-red-900'
      }
    ] : [])
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Loading Bar */}
      {loading && <LoadingBar loading={loading} message="Loading products..." />}
      
      {!loading && (
        <>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-2">Manage your product catalog and inventory</p>
        </div>
        <div className="flex space-x-3">
          {canManageProducts && (
            <button 
              onClick={handleCreateProduct}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Add Product</span>
            </button>
          )}
          {canOnlyView && (
            <div className="text-sm text-gray-500 flex items-center">
              <span>Products can only be added from the Purchase module</span>
            </div>
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
              placeholder="Search products by name, SKU, or barcode..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filterTrackQuantity}
              onChange={(e) => setFilterTrackQuantity(e.target.value)}
            >
              <option value="all">All Products</option>
              <option value="tracked">Track Quantity</option>
              <option value="not_tracked">Don't Track</option>
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
        
        {selectedProducts.length > 0 && (
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">
              {selectedProducts.length} product(s) selected
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
        Showing {filteredProducts.length} of {products.length} products
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <DataTable
          data={filteredProducts}
          columns={tableColumns}
          actions={tableActions}
          selectable={true}
          selectedRows={selectedProducts}
          onRowSelect={handleSelectProduct}
          onSelectAll={handleSelectAll}
          emptyMessage="No products found. Try adjusting your search or filters."
          emptyIcon="📦"
        />
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const stockStatus = getStockStatus(product)
            return (
              <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                      <p className="text-sm text-gray-500">{product.sku || 'No SKU'}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.color}`}>
                    {stockStatus.icon} {stockStatus.status}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-medium">${parseFloat(product.price || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium">{product.category?.name || 'Uncategorized'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium ${product.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleViewProduct(product)}
                    className="flex-1 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-100"
                  >
                    View Details
                  </button>
                  {canManageProducts && (
                    <button 
                      onClick={() => handleEditProduct(product)}
                      className="flex-1 bg-gray-50 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100"
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Empty State for Grid View */}
      {viewMode === 'grid' && filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <Package className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterCategory !== 'all' || filterStatus !== 'all'
              ? 'Try adjusting your search or filters.'
              : canOnlyView 
                ? 'Products can only be added from the Purchase module.'
                : 'Get started by creating your first product.'}
          </p>
          {canManageProducts && (
            <div className="mt-6">
              <button 
                onClick={handleCreateProduct}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Add Product
              </button>
            </div>
          )}
        </div>
      )}

      {/* Product Modal */}
      {showModal && (
        <ProductModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          product={selectedProduct}
          mode={modalMode}
          onSave={handleSaveProduct}
          categories={categories}
          warehouses={warehouses}
        />
      )}
        </>
      )}
    </div>
  )
}

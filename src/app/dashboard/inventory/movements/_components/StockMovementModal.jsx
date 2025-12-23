'use client'

import { useState, useEffect } from 'react'
import { X, Save, Loader2, Building2, Package } from 'lucide-react'
import useSWR from 'swr'

const fetcher = (url) => fetch(url).then(res => res.json())

export default function StockMovementModal({ 
  isOpen, 
  onClose, 
  movementType = 'in', // 'in', 'out', 'adjustment'
  onSave
}) {
  const [formData, setFormData] = useState({
    productId: '',
    warehouseId: '',
    locationId: '',
    quantity: '',
    reason: '',
    reference: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // Fetch products and warehouses
  const { data: productsData } = useSWR('/api/inventory/products?limit=1000', fetcher)
  const { data: warehousesData } = useSWR('/api/inventory/warehouses?limit=1000', fetcher)
  const { data: locationsData } = useSWR(
    formData.warehouseId ? `/api/inventory/warehouses/${formData.warehouseId}/locations` : null,
    fetcher
  )

  const products = productsData?.products || []
  const warehouses = warehousesData?.warehouses || []
  const locations = locationsData?.data || []

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setFormData({
        productId: '',
        warehouseId: '',
        locationId: '',
        quantity: '',
        reason: '',
        reference: ''
      })
      setErrors({})
    }
  }, [isOpen])

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.productId) {
      newErrors.productId = 'Product is required'
    }
    
    if (!formData.warehouseId) {
      newErrors.warehouseId = 'Warehouse is required'
    }
    
    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    
    try {
      const payload = {
        productId: formData.productId,
        warehouseId: formData.warehouseId,
        locationId: formData.locationId || null,
        type: movementType,
        quantity: parseInt(formData.quantity),
        reason: formData.reason || null,
        reference: formData.reference || null
      }
      
      await onSave(payload)
      onClose()
    } catch (error) {
      console.error('Error saving stock movement:', error)
      setErrors({ submit: error.message || 'Failed to save stock movement' })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear related errors
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const getTitle = () => {
    switch (movementType) {
      case 'in': return 'Stock In'
      case 'out': return 'Stock Out'
      case 'adjustment': return 'Stock Adjustment'
      default: return 'Stock Movement'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{getTitle()}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Product */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                name="productId"
                value={formData.productId}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.productId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select product</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.id})
                  </option>
                ))}
              </select>
            </div>
            {errors.productId && (
              <p className="text-red-500 text-sm mt-1">{errors.productId}</p>
            )}
          </div>

          {/* Warehouse */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Warehouse <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                name="warehouseId"
                value={formData.warehouseId}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.warehouseId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select warehouse</option>
                {warehouses.map(warehouse => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.name} ({warehouse.code})
                  </option>
                ))}
              </select>
            </div>
            {errors.warehouseId && (
              <p className="text-red-500 text-sm mt-1">{errors.warehouseId}</p>
            )}
          </div>

          {/* Location (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location (Optional)
            </label>
            <select
              name="locationId"
              value={formData.locationId}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!formData.warehouseId || loading}
            >
              <option value="">Select location (optional)</option>
              {locations.map(location => (
                <option key={location.id} value={location.id}>
                  {location.code} {location.name ? `- ${location.name}` : ''}
                </option>
              ))}
            </select>
            {!formData.warehouseId && (
              <p className="text-gray-500 text-xs mt-1">Select a warehouse first</p>
            )}
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.quantity ? 'border-red-500' : 'border-gray-300'
              }`}
              min="1"
              step="1"
              placeholder="Enter quantity"
            />
            {errors.quantity && (
              <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>
            )}
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason
            </label>
            <input
              type="text"
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter reason for this movement"
            />
          </div>

          {/* Reference */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reference
            </label>
            <input
              type="text"
              name="reference"
              value={formData.reference}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="PO, SO, or other reference number"
            />
          </div>

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>Save</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


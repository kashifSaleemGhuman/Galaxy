'use client'

import { useState, useEffect, useMemo } from 'react'
import { X, Save, Loader2, Plus, Trash2, ClipboardList, Building2, MapPinIcon, Package } from 'lucide-react'
import useSWR from 'swr'

const fetcher = (url) => fetch(url).then(res => res.json())

export default function CycleCountModal({ 
  isOpen, 
  onClose, 
  cycleCount = null, 
  onSave, 
  mode = 'create',
  warehouses = []
}) {
  const [formData, setFormData] = useState({
    warehouseId: '',
    locationId: '',
    countDate: new Date().toISOString().split('T')[0],
    notes: '',
    reference: '',
    status: 'draft'
  })
  const [cycleCountLines, setCycleCountLines] = useState([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  // Fetch products and warehouses
  const { data: productsData } = useSWR('/api/inventory/products?limit=1000', fetcher)
  const { data: warehousesData } = useSWR('/api/inventory/warehouses?limit=1000', fetcher)
  const { data: locationsData } = useSWR(
    formData.warehouseId ? `/api/inventory/warehouses/${formData.warehouseId}/locations` : null,
    fetcher
  )

  const products = productsData?.products || []
  const warehousesFromAPI = warehousesData?.warehouses || []
  const warehousesList = warehouses.length > 0 ? warehouses : warehousesFromAPI
  const locations = locationsData?.data || []

  useEffect(() => {
    if (cycleCount && mode === 'edit') {
      setFormData({
        warehouseId: cycleCount.warehouse?.id || '',
        locationId: cycleCount.location?.id || '',
        countDate: cycleCount.countDate ? cycleCount.countDate.split('T')[0] : new Date().toISOString().split('T')[0],
        notes: cycleCount.notes || '',
        reference: cycleCount.reference || '',
        status: cycleCount.status || 'draft'
      })
      setCycleCountLines(cycleCount.lines || [])
    } else {
      setFormData({
        warehouseId: '',
        locationId: '',
        countDate: new Date().toISOString().split('T')[0],
        notes: '',
        reference: '',
        status: 'draft'
      })
      setCycleCountLines([])
    }
    setErrors({})
    setTouched({})
  }, [cycleCount, mode])

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.warehouseId) {
      newErrors.warehouseId = 'Warehouse is required'
    }
    
    if (!formData.countDate) {
      newErrors.countDate = 'Count date is required'
    }
    
    if (cycleCountLines.length === 0) {
      newErrors.lines = 'At least one cycle count line is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Mark all fields as touched when submitting
    const allTouched = {}
    Object.keys(formData).forEach(key => {
      allTouched[key] = true
    })
    setTouched(allTouched)
    
    if (!validateForm()) {
      return
    }
    
    // Validate cycle count lines
    const validLines = cycleCountLines.filter(line => 
      line.productId && 
      line.actualQuantity !== undefined && 
      line.actualQuantity !== null &&
      line.actualQuantity >= 0
    )
    if (validLines.length === 0) {
      setErrors({ lines: 'At least one valid cycle count line is required' })
      return
    }
    
    setLoading(true)
    
    try {
      const payload = {
        warehouseId: formData.warehouseId,
        locationId: formData.locationId || null,
        countDate: formData.countDate || new Date().toISOString().split('T')[0],
        notes: formData.notes || '',
        reference: formData.reference || '',
        lines: validLines.map(line => ({
          productId: line.productId,
          actualQuantity: parseInt(line.actualQuantity) || 0,
          locationId: line.locationId || formData.locationId || null,
          notes: line.notes || null
        }))
      }
      
      await onSave(payload)
      onClose()
    } catch (error) {
      console.error('Error saving cycle count:', error)
      setErrors({ submit: error.message || 'Failed to save cycle count' })
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

  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }))
  }

  const getFieldError = (fieldName) => {
    return touched[fieldName] && errors[fieldName] ? errors[fieldName] : ''
  }

  const getFieldClassName = (fieldName) => {
    const hasError = getFieldError(fieldName)
    return `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
      hasError ? 'border-red-500' : 'border-gray-300'
    }`
  }

  const addCycleCountLine = () => {
    const newLine = {
      id: Date.now().toString(),
      productId: '',
      locationId: formData.locationId || null,
      expectedQuantity: 0,
      actualQuantity: null, // Use actualQuantity instead of countedQuantity to match API
      difference: null,
      unitCost: 0,
      totalCost: 0,
      notes: ''
    }
    setCycleCountLines(prev => [...prev, newLine])
  }

  const removeCycleCountLine = (lineId) => {
    setCycleCountLines(prev => prev.filter(line => line.id !== lineId))
  }

  // Fetch inventory items for the selected warehouse
  const { data: inventoryData } = useSWR(
    formData.warehouseId ? `/api/inventory/items?warehouseId=${formData.warehouseId}` : null,
    fetcher
  )
  const inventoryItems = inventoryData?.data || []
  const inventoryMap = useMemo(() => {
    const map = new Map()
    inventoryItems.forEach(item => {
      map.set(`${item.productId}-${item.warehouseId}`, item)
    })
    return map
  }, [inventoryItems])

  const updateCycleCountLine = async (lineId, field, value) => {
    setCycleCountLines(prev => prev.map(line => {
      if (line.id === lineId) {
        const updatedLine = { ...line, [field]: value }
        
        // If product is selected and warehouse is set, auto-populate expected quantity from inventory
        if (field === 'productId' && formData.warehouseId && value) {
          const inventoryKey = `${value}-${formData.warehouseId}`
          const inventoryItem = inventoryMap.get(inventoryKey)
          if (inventoryItem) {
            updatedLine.expectedQuantity = inventoryItem.quantity || 0
            updatedLine.locationId = inventoryItem.locationId || formData.locationId || null
          } else {
            updatedLine.expectedQuantity = 0
          }
        }
        
        // Calculate difference if expected or actual quantity changes
        if (field === 'expectedQuantity' || field === 'actualQuantity') {
          const expected = field === 'expectedQuantity' ? parseFloat(value) || 0 : line.expectedQuantity
          const actual = field === 'actualQuantity' ? (value ? parseFloat(value) : null) : line.actualQuantity
          if (actual !== null) {
            updatedLine.difference = actual - expected
          } else {
            updatedLine.difference = null
          }
        }
        
        // Calculate total cost if difference or unit cost changes
        if (field === 'difference' || field === 'unitCost') {
          const difference = field === 'difference' ? (parseFloat(value) || 0) : updatedLine.difference
          const unitCost = field === 'unitCost' ? parseFloat(value) || 0 : line.unitCost
          updatedLine.totalCost = difference * unitCost
        }
        
        return updatedLine
      }
      return line
    }))
  }

  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId)
    return product ? `${product.name} (${product.sku})` : ''
  }

  const getLocationName = (locationId) => {
    const location = locations.find(l => l.id === locationId)
    return location ? `${location.name} (${location.code})` : ''
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'create' ? 'Create Cycle Count' : mode === 'edit' ? 'Edit Cycle Count' : 'View Cycle Count'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Cycle Count Information</h3>
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
                  onBlur={() => handleBlur('warehouseId')}
                  className={`${getFieldClassName('warehouseId')} pl-10`}
                  disabled={mode === 'view'}
                >
                  <option value="">Select warehouse</option>
                  {warehouses.map(warehouse => (
                    <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
                  ))}
                </select>
              </div>
              {getFieldError('warehouseId') && (
                <p className="text-red-500 text-sm mt-1">{getFieldError('warehouseId')}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <div className="relative">
                <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <select
                  name="locationId"
                  value={formData.locationId}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('locationId')}
                  className={`${getFieldClassName('locationId')} pl-10`}
                  disabled={mode === 'view'}
                >
                  <option value="">All Locations</option>
                  {locations.map(location => (
                    <option key={location.id} value={location.id}>{location.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Count Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Count Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="countDate"
                value={formData.countDate}
                onChange={handleInputChange}
                onBlur={() => handleBlur('countDate')}
                className={getFieldClassName('countDate')}
                disabled={mode === 'view'}
              />
              {getFieldError('countDate') && (
                <p className="text-red-500 text-sm mt-1">{getFieldError('countDate')}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                onBlur={() => handleBlur('status')}
                className={getFieldClassName('status')}
                disabled={mode === 'view'}
              >
                <option value="draft">Draft</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                onBlur={() => handleBlur('notes')}
                rows="3"
                className={getFieldClassName('notes')}
                placeholder="Enter cycle count notes"
                disabled={mode === 'view'}
              />
            </div>
          </div>

          {/* Cycle Count Lines */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Cycle Count Lines</h3>
              {mode !== 'view' && (
                <button
                  type="button"
                  onClick={addCycleCountLine}
                  className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Line</span>
                </button>
              )}
            </div>

            {cycleCountLines.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No cycle count lines added yet</p>
                {mode !== 'view' && (
                  <button
                    type="button"
                    onClick={addCycleCountLine}
                    className="mt-2 text-blue-600 hover:text-blue-800"
                  >
                    Add your first line
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {cycleCountLines.map((line, index) => (
                  <div key={line.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-medium text-gray-900">Line {index + 1}</h4>
                      {mode !== 'view' && (
                        <button
                          type="button"
                          onClick={() => removeCycleCountLine(line.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Product */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Product
                        </label>
                        <select
                          value={line.productId}
                          onChange={(e) => updateCycleCountLine(line.id, 'productId', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={mode === 'view'}
                        >
                          <option value="">Select product</option>
                          {products.map(product => (
                            <option key={product.id} value={product.id}>{product.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Expected Quantity */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Expected Qty
                        </label>
                        <input
                          type="number"
                          value={line.expectedQuantity}
                          onChange={(e) => updateCycleCountLine(line.id, 'expectedQuantity', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min="0"
                          disabled={mode === 'view'}
                        />
                      </div>

                      {/* Actual Quantity (Counted) */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Counted Qty
                        </label>
                        <input
                          type="number"
                          value={line.actualQuantity || ''}
                          onChange={(e) => updateCycleCountLine(line.id, 'actualQuantity', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min="0"
                          placeholder="Enter counted quantity"
                          disabled={mode === 'view'}
                        />
                      </div>

                      {/* Difference */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Difference
                        </label>
                        <input
                          type="number"
                          value={line.difference || ''}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                          disabled
                        />
                      </div>

                      {/* Unit Cost */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Unit Cost
                        </label>
                        <input
                          type="number"
                          value={line.unitCost}
                          onChange={(e) => updateCycleCountLine(line.id, 'unitCost', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          step="0.01"
                          min="0"
                          disabled={mode === 'view'}
                        />
                      </div>

                      {/* Total Cost */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Total Cost
                        </label>
                        <input
                          type="number"
                          value={line.totalCost}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                          step="0.01"
                          disabled
                        />
                      </div>

                      {/* Notes */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Notes
                        </label>
                        <input
                          type="text"
                          value={line.notes}
                          onChange={(e) => updateCycleCountLine(line.id, 'notes', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Line notes"
                          disabled={mode === 'view'}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {getFieldError('lines') && (
              <p className="text-red-500 text-sm mt-1">{getFieldError('lines')}</p>
            )}
          </div>

          {/* Actions */}
          {mode !== 'view' && (
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
                <span>{mode === 'create' ? 'Create Cycle Count' : 'Update Cycle Count'}</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

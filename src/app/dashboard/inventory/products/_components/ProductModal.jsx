'use client'

import { useState, useEffect } from 'react'
import { X, Save, Loader2, Package, Barcode, Weight } from 'lucide-react'

export default function ProductModal({ 
  isOpen, 
  onClose, 
  product = null, 
  onSave, 
  mode = 'create',
  categories = [],
  warehouses = []
}) {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    barcode: '',
    description: '',
    price: '',
    cost: '',
    categoryId: '',
    unitOfMeasure: '',
    weight: '',
    trackQuantity: true,
    allowNegativeStock: false,
    reorderPoint: 0,
    maxStock: '',
    minStock: '',
    isActive: true,
    warehouseId: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  useEffect(() => {
    if (product && mode === 'edit') {
      setFormData({
        name: product.name || '',
        sku: product.sku || '',
        barcode: product.barcode || '',
        description: product.description || '',
        price: product.price ? product.price.toString() : '',
        cost: product.cost ? product.cost.toString() : '',
        categoryId: product.categoryId || '',
        unitOfMeasure: product.unitOfMeasure || '',
        weight: product.weight ? product.weight.toString() : '',
        trackQuantity: product.trackQuantity ?? true,
        allowNegativeStock: product.allowNegativeStock ?? false,
        reorderPoint: product.reorderPoint || 0,
        maxStock: product.maxStock ? product.maxStock.toString() : '',
        minStock: product.minStock ? product.minStock.toString() : '',
        isActive: product.isActive ?? true,
        warehouseId: product.inventoryItems?.[0]?.warehouseId || ''
      })
    } else {
      setFormData({
        name: '',
        sku: '',
        barcode: '',
        description: '',
        price: '',
        cost: '',
        categoryId: '',
        unitOfMeasure: '',
        weight: '',
        trackQuantity: true,
        allowNegativeStock: false,
        reorderPoint: 0,
        maxStock: '',
        minStock: '',
        isActive: true,
        warehouseId: ''
      })
    }
    setErrors({})
    setTouched({})
  }, [product, mode])

  // Validation rules
  const validationRules = {
    name: {
      required: true,
      minLength: 2,
      maxLength: 200
    },
    sku: {
      required: false,
      maxLength: 50,
      pattern: /^[A-Z0-9\-_]+$/
    },
    barcode: {
      required: false,
      maxLength: 50,
      pattern: /^[0-9]+$/
    },
    price: {
      required: true,
      min: 0,
      max: 999999.99
    },
    cost: {
      required: false,
      min: 0,
      max: 999999.99
    },
    weight: {
      required: false,
      min: 0,
      max: 9999.999
    },
    reorderPoint: {
      required: false,
      min: 0
    },
    maxStock: {
      required: false,
      min: 0
    },
    minStock: {
      required: false,
      min: 0
    },
    warehouseId: {
      required: true
    }
  }

  const validateField = (name, value) => {
    const rules = validationRules[name]
    if (!rules) return ''

    // Required field validation
    if (rules.required && (!value || value.trim() === '')) {
      return `${name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`
    }

    // Skip other validations if field is empty and not required
    if (!value || value.trim() === '') return ''

    // Min length validation
    if (rules.minLength && value.length < rules.minLength) {
      return `${name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} must be at least ${rules.minLength} characters`
    }

    // Max length validation
    if (rules.maxLength && value.length > rules.maxLength) {
      return `${name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} must be no more than ${rules.maxLength} characters`
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(value)) {
      switch (name) {
        case 'sku':
          return 'SKU can only contain uppercase letters, numbers, hyphens, and underscores'
        case 'barcode':
          return 'Barcode can only contain numbers'
        default:
          return 'Invalid format'
      }
    }


    // Number validation
    if (['price', 'cost', 'weight', 'reorderPoint', 'maxStock', 'minStock'].includes(name)) {
      const numValue = parseFloat(value)
      if (isNaN(numValue)) {
        return `${name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} must be a valid number`
      }
      if (rules.min !== undefined && numValue < rules.min) {
        return `${name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} must be at least ${rules.min}`
      }
      if (rules.max !== undefined && numValue > rules.max) {
        return `${name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} must be no more than ${rules.max}`
      }
    }

    return ''
  }

  const validateForm = () => {
    const newErrors = {}
    
    Object.keys(formData).forEach(fieldName => {
      const error = validateField(fieldName, formData[fieldName])
      if (error) {
        newErrors[fieldName] = error
      }
    })
    
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
    
    setLoading(true)
    
    try {
      console.log('🔍 Form data categoryId:', formData.categoryId)
      console.log('🔍 Available categories:', categories)
      
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        cost: formData.cost ? parseFloat(formData.cost) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        reorderPoint: parseInt(formData.reorderPoint) || 0,
        maxStock: formData.maxStock ? parseInt(formData.maxStock) : null,
        minStock: formData.minStock ? parseInt(formData.minStock) : null,
        categoryId: formData.categoryId && formData.categoryId !== '' ? formData.categoryId : null,
        warehouseId: formData.warehouseId
      }
      
      console.log('📤 Final payload categoryId:', payload.categoryId)
      
      await onSave(payload)
      onClose()
    } catch (error) {
      console.error('Error saving product:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }))
    
    // Validate field on change if it has been touched
    if (touched[name]) {
      const error = validateField(name, type === 'checkbox' ? checked : value)
      setErrors(prev => ({ ...prev, [name]: error }))
    }
  }

  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }))
    const error = validateField(name, formData[name])
    setErrors(prev => ({ ...prev, [name]: error }))
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'create' ? 'Add New Product' : mode === 'edit' ? 'Edit Product' : 'View Product'}
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
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            </div>

            {/* Product Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('name')}
                  className={`${getFieldClassName('name')} pl-10`}
                  placeholder="Enter product name"
                  maxLength={200}
                  disabled={mode === 'view'}
                />
              </div>
              {getFieldError('name') && (
                <p className="text-red-500 text-sm mt-1">{getFieldError('name')}</p>
              )}
            </div>

            {/* SKU */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SKU
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
                onBlur={() => handleBlur('sku')}
                className={getFieldClassName('sku')}
                placeholder="PROD-001"
                maxLength={50}
                disabled={mode === 'view'}
              />
              {getFieldError('sku') && (
                <p className="text-red-500 text-sm mt-1">{getFieldError('sku')}</p>
              )}
            </div>

            {/* Barcode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Barcode
              </label>
              <div className="relative">
                <Barcode className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('barcode')}
                  className={`${getFieldClassName('barcode')} pl-10`}
                  placeholder="1234567890123"
                  maxLength={50}
                  disabled={mode === 'view'}
                />
              </div>
              {getFieldError('barcode') && (
                <p className="text-red-500 text-sm mt-1">{getFieldError('barcode')}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                onBlur={() => handleBlur('categoryId')}
                className={getFieldClassName('categoryId')}
                disabled={mode === 'view'}
              >
                <option value="">Select category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>

            {/* Warehouse */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Warehouse <span className="text-red-500">*</span>
              </label>
              <select
                name="warehouseId"
                value={formData.warehouseId}
                onChange={handleInputChange}
                onBlur={() => handleBlur('warehouseId')}
                className={getFieldClassName('warehouseId')}
                disabled={mode === 'view'}
              >
                <option value="">Select warehouse</option>
                {warehouses.map(wh => (
                  <option key={wh.id} value={wh.id}>{wh.name} ({wh.code})</option>
                ))}
              </select>
              {getFieldError('warehouseId') && (
                <p className="text-red-500 text-sm mt-1">{getFieldError('warehouseId')}</p>
              )}
            </div>

            {/* Unit of Measure */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit of Measure
              </label>
              <select
                name="unitOfMeasure"
                value={formData.unitOfMeasure}
                onChange={handleInputChange}
                onBlur={() => handleBlur('unitOfMeasure')}
                className={getFieldClassName('unitOfMeasure')}
                disabled={mode === 'view'}
              >
                <option value="">Select unit</option>
                <option value="pcs">Pieces</option>
                <option value="kg">Kilograms</option>
                <option value="g">Grams</option>
                <option value="lb">Pounds</option>
                <option value="oz">Ounces</option>
                <option value="m">Meters</option>
                <option value="cm">Centimeters</option>
                <option value="in">Inches</option>
                <option value="ft">Feet</option>
                <option value="l">Liters</option>
                <option value="ml">Milliliters</option>
                <option value="gal">Gallons</option>
              </select>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                onBlur={() => handleBlur('description')}
                rows="3"
                className={getFieldClassName('description')}
                placeholder="Enter product description"
                maxLength={1000}
                disabled={mode === 'view'}
              />
            </div>

            {/* Pricing */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing</h3>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selling Price <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('price')}
                  className={`${getFieldClassName('price')} pl-8`}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  max="999999.99"
                  disabled={mode === 'view'}
                />
              </div>
              {getFieldError('price') && (
                <p className="text-red-500 text-sm mt-1">{getFieldError('price')}</p>
              )}
            </div>

            {/* Cost */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cost Price
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  name="cost"
                  value={formData.cost}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('cost')}
                  className={`${getFieldClassName('cost')} pl-8`}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  max="999999.99"
                  disabled={mode === 'view'}
                />
              </div>
              {getFieldError('cost') && (
                <p className="text-red-500 text-sm mt-1">{getFieldError('cost')}</p>
              )}
            </div>

            {/* Physical Properties */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Physical Properties</h3>
            </div>

            {/* Weight */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight
              </label>
              <div className="relative">
                <Weight className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('weight')}
                  className={`${getFieldClassName('weight')} pl-10`}
                  placeholder="0.000"
                  step="0.001"
                  min="0"
                  max="9999.999"
                  disabled={mode === 'view'}
                />
              </div>
              {getFieldError('weight') && (
                <p className="text-red-500 text-sm mt-1">{getFieldError('weight')}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">Weight in kg</p>
            </div>


            {/* Inventory Settings */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Inventory Settings</h3>
            </div>

            {/* Track Quantity */}
            <div className="md:col-span-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="trackQuantity"
                  checked={formData.trackQuantity}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  disabled={mode === 'view'}
                />
                <label className="ml-2 text-sm font-medium text-gray-700">
                  Track quantity for this product
                </label>
              </div>
            </div>

            {/* Allow Negative Stock */}
            <div className="md:col-span-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="allowNegativeStock"
                  checked={formData.allowNegativeStock}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  disabled={mode === 'view'}
                />
                <label className="ml-2 text-sm font-medium text-gray-700">
                  Allow negative stock
                </label>
              </div>
            </div>

            {/* Reorder Point */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reorder Point
              </label>
              <input
                type="number"
                name="reorderPoint"
                value={formData.reorderPoint}
                onChange={handleInputChange}
                onBlur={() => handleBlur('reorderPoint')}
                className={getFieldClassName('reorderPoint')}
                placeholder="0"
                min="0"
                disabled={mode === 'view'}
              />
              {getFieldError('reorderPoint') && (
                <p className="text-red-500 text-sm mt-1">{getFieldError('reorderPoint')}</p>
              )}
            </div>

            {/* Max Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Stock
              </label>
              <input
                type="number"
                name="maxStock"
                value={formData.maxStock}
                onChange={handleInputChange}
                onBlur={() => handleBlur('maxStock')}
                className={getFieldClassName('maxStock')}
                placeholder="Optional"
                min="0"
                disabled={mode === 'view'}
              />
              {getFieldError('maxStock') && (
                <p className="text-red-500 text-sm mt-1">{getFieldError('maxStock')}</p>
              )}
            </div>

            {/* Min Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Stock
              </label>
              <input
                type="number"
                name="minStock"
                value={formData.minStock}
                onChange={handleInputChange}
                onBlur={() => handleBlur('minStock')}
                className={getFieldClassName('minStock')}
                placeholder="Optional"
                min="0"
                disabled={mode === 'view'}
              />
              {getFieldError('minStock') && (
                <p className="text-red-500 text-sm mt-1">{getFieldError('minStock')}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="isActive"
                value={formData.isActive}
                onChange={handleInputChange}
                onBlur={() => handleBlur('isActive')}
                className={getFieldClassName('isActive')}
                disabled={mode === 'view'}
              >
                <option value={true}>Active</option>
                <option value={false}>Inactive</option>
              </select>
            </div>
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
                <span>{mode === 'create' ? 'Create Product' : 'Update Product'}</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

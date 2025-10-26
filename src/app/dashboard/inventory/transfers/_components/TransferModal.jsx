'use client'

import { useState, useEffect } from 'react'
import { X, Save, Loader2, Plus, Trash2, TruckIcon, Building2, MapPinIcon, Package } from 'lucide-react'

export default function TransferModal({ 
  isOpen, 
  onClose, 
  transfer = null, 
  onSave, 
  mode = 'create',
  warehouses = []
}) {
  const [formData, setFormData] = useState({
    fromWarehouseId: '',
    toWarehouseId: '',
    notes: '',
    transferDate: new Date().toISOString().split('T')[0],
    expectedDate: '',
    status: 'draft'
  })
  const [transferLines, setTransferLines] = useState([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  // Mock products for demonstration
  const [products] = useState([
    { id: '1', name: 'Laptop Pro 15', sku: 'LP-001' },
    { id: '2', name: 'Wireless Mouse', sku: 'WM-001' },
    { id: '3', name: 'Office Chair', sku: 'OC-001' },
    { id: '4', name: 'Monitor 24"', sku: 'MN-001' }
  ])

  // Mock locations for demonstration
  const [locations, setLocations] = useState([])

  useEffect(() => {
    if (transfer && mode === 'edit') {
      setFormData({
        fromWarehouseId: transfer.fromWarehouse?.id || '',
        toWarehouseId: transfer.toWarehouse?.id || '',
        notes: transfer.notes || '',
        transferDate: transfer.transferDate ? transfer.transferDate.split('T')[0] : new Date().toISOString().split('T')[0],
        expectedDate: transfer.expectedDate ? transfer.expectedDate.split('T')[0] : '',
        status: transfer.status || 'draft'
      })
      setTransferLines(transfer.lines || [])
    } else {
      setFormData({
        fromWarehouseId: '',
        toWarehouseId: '',
        notes: '',
        transferDate: new Date().toISOString().split('T')[0],
        expectedDate: '',
        status: 'draft'
      })
      setTransferLines([])
    }
    setErrors({})
    setTouched({})
  }, [transfer, mode])

  // Update locations when warehouse changes
  useEffect(() => {
    if (formData.fromWarehouseId) {
      // Mock locations based on warehouse
      const mockLocations = [
        { id: '1', name: 'A-01-01', code: 'A-01-01', warehouseId: '1' },
        { id: '2', name: 'A-01-02', code: 'A-01-02', warehouseId: '1' },
        { id: '3', name: 'A-02-01', code: 'A-02-01', warehouseId: '1' },
        { id: '4', name: 'B-01-01', code: 'B-01-01', warehouseId: '2' },
        { id: '5', name: 'B-01-02', code: 'B-01-02', warehouseId: '2' },
        { id: '6', name: 'C-01-01', code: 'C-01-01', warehouseId: '3' }
      ]
      setLocations(mockLocations.filter(loc => 
        loc.warehouseId === formData.fromWarehouseId || loc.warehouseId === formData.toWarehouseId
      ))
    }
  }, [formData.fromWarehouseId, formData.toWarehouseId])

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.fromWarehouseId) {
      newErrors.fromWarehouseId = 'From warehouse is required'
    }
    
    if (!formData.toWarehouseId) {
      newErrors.toWarehouseId = 'To warehouse is required'
    }
    
    if (formData.fromWarehouseId === formData.toWarehouseId) {
      newErrors.toWarehouseId = 'From and to warehouses must be different'
    }
    
    if (!formData.transferDate) {
      newErrors.transferDate = 'Transfer date is required'
    }
    
    if (transferLines.length === 0) {
      newErrors.lines = 'At least one transfer line is required'
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
    
    setLoading(true)
    
    try {
      const payload = {
        ...formData,
        lines: transferLines
      }
      
      await onSave(payload)
      onClose()
    } catch (error) {
      console.error('Error saving transfer:', error)
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

  const addTransferLine = () => {
    const newLine = {
      id: Date.now().toString(),
      productId: '',
      fromLocationId: '',
      toLocationId: '',
      quantity: 1,
      unitCost: 0,
      totalCost: 0,
      notes: ''
    }
    setTransferLines(prev => [...prev, newLine])
  }

  const removeTransferLine = (lineId) => {
    setTransferLines(prev => prev.filter(line => line.id !== lineId))
  }

  const updateTransferLine = (lineId, field, value) => {
    setTransferLines(prev => prev.map(line => {
      if (line.id === lineId) {
        const updatedLine = { ...line, [field]: value }
        
        // Calculate total cost if quantity or unit cost changes
        if (field === 'quantity' || field === 'unitCost') {
          const quantity = field === 'quantity' ? parseFloat(value) || 0 : line.quantity
          const unitCost = field === 'unitCost' ? parseFloat(value) || 0 : line.unitCost
          updatedLine.totalCost = quantity * unitCost
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
            {mode === 'create' ? 'Create Transfer' : mode === 'edit' ? 'Edit Transfer' : 'View Transfer'}
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
              <h3 className="text-lg font-medium text-gray-900 mb-4">Transfer Information</h3>
            </div>

            {/* From Warehouse */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Warehouse <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <select
                  name="fromWarehouseId"
                  value={formData.fromWarehouseId}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('fromWarehouseId')}
                  className={`${getFieldClassName('fromWarehouseId')} pl-10`}
                  disabled={mode === 'view'}
                >
                  <option value="">Select from warehouse</option>
                  {warehouses.map(warehouse => (
                    <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
                  ))}
                </select>
              </div>
              {getFieldError('fromWarehouseId') && (
                <p className="text-red-500 text-sm mt-1">{getFieldError('fromWarehouseId')}</p>
              )}
            </div>

            {/* To Warehouse */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Warehouse <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <select
                  name="toWarehouseId"
                  value={formData.toWarehouseId}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('toWarehouseId')}
                  className={`${getFieldClassName('toWarehouseId')} pl-10`}
                  disabled={mode === 'view'}
                >
                  <option value="">Select to warehouse</option>
                  {warehouses.filter(w => w.id !== formData.fromWarehouseId).map(warehouse => (
                    <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
                  ))}
                </select>
              </div>
              {getFieldError('toWarehouseId') && (
                <p className="text-red-500 text-sm mt-1">{getFieldError('toWarehouseId')}</p>
              )}
            </div>

            {/* Transfer Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transfer Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="transferDate"
                value={formData.transferDate}
                onChange={handleInputChange}
                onBlur={() => handleBlur('transferDate')}
                className={getFieldClassName('transferDate')}
                disabled={mode === 'view'}
              />
              {getFieldError('transferDate') && (
                <p className="text-red-500 text-sm mt-1">{getFieldError('transferDate')}</p>
              )}
            </div>

            {/* Expected Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Date
              </label>
              <input
                type="date"
                name="expectedDate"
                value={formData.expectedDate}
                onChange={handleInputChange}
                onBlur={() => handleBlur('expectedDate')}
                className={getFieldClassName('expectedDate')}
                disabled={mode === 'view'}
              />
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
                <option value="pending">Pending</option>
                <option value="in_transit">In Transit</option>
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
                placeholder="Enter transfer notes"
                disabled={mode === 'view'}
              />
            </div>
          </div>

          {/* Transfer Lines */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Transfer Lines</h3>
              {mode !== 'view' && (
                <button
                  type="button"
                  onClick={addTransferLine}
                  className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Line</span>
                </button>
              )}
            </div>

            {transferLines.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No transfer lines added yet</p>
                {mode !== 'view' && (
                  <button
                    type="button"
                    onClick={addTransferLine}
                    className="mt-2 text-blue-600 hover:text-blue-800"
                  >
                    Add your first line
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {transferLines.map((line, index) => (
                  <div key={line.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-medium text-gray-900">Line {index + 1}</h4>
                      {mode !== 'view' && (
                        <button
                          type="button"
                          onClick={() => removeTransferLine(line.id)}
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
                          onChange={(e) => updateTransferLine(line.id, 'productId', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={mode === 'view'}
                        >
                          <option value="">Select product</option>
                          {products.map(product => (
                            <option key={product.id} value={product.id}>{product.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* From Location */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          From Location
                        </label>
                        <select
                          value={line.fromLocationId}
                          onChange={(e) => updateTransferLine(line.id, 'fromLocationId', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={mode === 'view'}
                        >
                          <option value="">Select location</option>
                          {locations.filter(loc => loc.warehouseId === formData.fromWarehouseId).map(location => (
                            <option key={location.id} value={location.id}>{location.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* To Location */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          To Location
                        </label>
                        <select
                          value={line.toLocationId}
                          onChange={(e) => updateTransferLine(line.id, 'toLocationId', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={mode === 'view'}
                        >
                          <option value="">Select location</option>
                          {locations.filter(loc => loc.warehouseId === formData.toWarehouseId).map(location => (
                            <option key={location.id} value={location.id}>{location.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Quantity */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantity
                        </label>
                        <input
                          type="number"
                          value={line.quantity}
                          onChange={(e) => updateTransferLine(line.id, 'quantity', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min="1"
                          disabled={mode === 'view'}
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
                          onChange={(e) => updateTransferLine(line.id, 'unitCost', e.target.value)}
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
                          onChange={(e) => updateTransferLine(line.id, 'notes', e.target.value)}
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
                <span>{mode === 'create' ? 'Create Transfer' : 'Update Transfer'}</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

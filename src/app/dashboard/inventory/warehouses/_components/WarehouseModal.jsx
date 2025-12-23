'use client'

import { useState, useEffect } from 'react'
import { X, Save, Loader2, Building2, MapPin, Phone, Mail, User } from 'lucide-react'

export default function WarehouseModal({ 
  isOpen, 
  onClose, 
  warehouse = null, 
  onSave, 
  mode = 'create',
  managers = []
}) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    phone: '',
    email: '',
    managerId: '',
    isActive: true
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  useEffect(() => {
    if (warehouse && mode === 'edit') {
      setFormData({
        name: warehouse.name || '',
        code: warehouse.code || '',
        address: warehouse.address || '',
        city: warehouse.city || '',
        state: warehouse.state || '',
        country: warehouse.country || '',
        postalCode: warehouse.postalCode || '',
        phone: warehouse.phone || '',
        email: warehouse.email || '',
        managerId: warehouse.managerId || '',
        isActive: warehouse.isActive ?? true
      })
    } else {
      setFormData({
        name: '',
        code: '',
        address: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
        phone: '',
        email: '',
        managerId: '',
        isActive: true
      })
    }
    setErrors({})
    setTouched({})
  }, [warehouse, mode])

  // Validation rules
  const validationRules = {
    name: {
      required: true,
      minLength: 2,
      maxLength: 200
    },
    code: {
      required: true,
      minLength: 2,
      maxLength: 20,
      pattern: /^[A-Z0-9\-_]+$/
    },
    email: {
      required: false,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    phone: {
      required: false,
      pattern: /^[\+]?[1-9][\d\s\-\(\)]{7,15}$/
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
        case 'code':
          return 'Code can only contain uppercase letters, numbers, hyphens, and underscores'
        case 'email':
          return 'Please enter a valid email address'
        case 'phone':
          return 'Please enter a valid phone number'
        default:
          return 'Invalid format'
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
      const payload = {
        ...formData,
        managerId: formData.managerId || null
      }
      
      await onSave(payload)
      onClose()
    } catch (error) {
      console.error('Error saving warehouse:', error)
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
            {mode === 'create' ? 'Add New Warehouse' : mode === 'edit' ? 'Edit Warehouse' : 'View Warehouse'}
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

            {/* Warehouse Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Warehouse Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('name')}
                  className={`${getFieldClassName('name')} pl-10`}
                  placeholder="Enter warehouse name"
                  maxLength={200}
                  disabled={mode === 'view'}
                />
              </div>
              {getFieldError('name') && (
                <p className="text-red-500 text-sm mt-1">{getFieldError('name')}</p>
              )}
            </div>

            {/* Warehouse Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Warehouse Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                onBlur={() => handleBlur('code')}
                className={getFieldClassName('code')}
                placeholder="WH-001"
                maxLength={20}
                disabled={mode === 'view'}
              />
              {getFieldError('code') && (
                <p className="text-red-500 text-sm mt-1">{getFieldError('code')}</p>
              )}
            </div>

            {/* Manager */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Manager
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <select
                  name="managerId"
                  value={formData.managerId}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('managerId')}
                  className={`${getFieldClassName('managerId')} pl-10`}
                  disabled={mode === 'view'}
                >
                  <option value="">Select manager</option>
                  {managers.map(manager => (
                    <option key={manager.id} value={manager.id}>{manager.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Address Information */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Address Information</h3>
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('address')}
                  className={`${getFieldClassName('address')} pl-10`}
                  placeholder="Enter street address"
                  disabled={mode === 'view'}
                />
              </div>
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                onBlur={() => handleBlur('city')}
                className={getFieldClassName('city')}
                placeholder="Enter city"
                disabled={mode === 'view'}
              />
            </div>

            {/* State */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State/Province
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                onBlur={() => handleBlur('state')}
                className={getFieldClassName('state')}
                placeholder="Enter state/province"
                disabled={mode === 'view'}
              />
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <select
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                onBlur={() => handleBlur('country')}
                className={getFieldClassName('country')}
                disabled={mode === 'view'}
              >
                <option value="">Select country</option>
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="GB">United Kingdom</option>
                <option value="AU">Australia</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
                <option value="IT">Italy</option>
                <option value="ES">Spain</option>
                <option value="NL">Netherlands</option>
                <option value="BE">Belgium</option>
                <option value="CH">Switzerland</option>
                <option value="AT">Austria</option>
                <option value="SE">Sweden</option>
                <option value="NO">Norway</option>
                <option value="DK">Denmark</option>
                <option value="FI">Finland</option>
                <option value="PL">Poland</option>
                <option value="CZ">Czech Republic</option>
                <option value="HU">Hungary</option>
                <option value="RO">Romania</option>
                <option value="BG">Bulgaria</option>
                <option value="HR">Croatia</option>
                <option value="SI">Slovenia</option>
                <option value="SK">Slovakia</option>
                <option value="LT">Lithuania</option>
                <option value="LV">Latvia</option>
                <option value="EE">Estonia</option>
                <option value="IE">Ireland</option>
                <option value="PT">Portugal</option>
                <option value="GR">Greece</option>
                <option value="CY">Cyprus</option>
                <option value="MT">Malta</option>
                <option value="LU">Luxembourg</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Postal Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Postal Code
              </label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleInputChange}
                onBlur={() => handleBlur('postalCode')}
                className={getFieldClassName('postalCode')}
                placeholder="Enter postal code"
                disabled={mode === 'view'}
              />
            </div>

            {/* Contact Information */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('phone')}
                  className={`${getFieldClassName('phone')} pl-10`}
                  placeholder="+1 (555) 123-4567"
                  disabled={mode === 'view'}
                />
              </div>
              {getFieldError('phone') && (
                <p className="text-red-500 text-sm mt-1">{getFieldError('phone')}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('email')}
                  className={`${getFieldClassName('email')} pl-10`}
                  placeholder="warehouse@company.com"
                  disabled={mode === 'view'}
                />
              </div>
              {getFieldError('email') && (
                <p className="text-red-500 text-sm mt-1">{getFieldError('email')}</p>
              )}
            </div>

            {/* Status */}
            <div className="md:col-span-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  disabled={mode === 'view'}
                />
                <label className="ml-2 text-sm font-medium text-gray-700">
                  Active warehouse
                </label>
              </div>
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
                <span>{mode === 'create' ? 'Create Warehouse' : 'Update Warehouse'}</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

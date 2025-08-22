'use client'

import { useState, useEffect } from 'react'
import { X, Save, Loader2, Calendar } from 'lucide-react'

export default function CustomerModal({ 
  isOpen, 
  onClose, 
  customer = null, 
  onSave, 
  mode = 'create' 
}) {
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    industry: '',
    value: '',
    status: 'active',
    lastContact: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  useEffect(() => {
    if (customer && mode === 'edit') {
      setFormData({
        companyName: customer.companyName || '',
        contactPerson: customer.contactPerson || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        website: customer.website || '',
        industry: customer.industry || '',
        value: customer.value ? customer.value.toString() : '',
        status: customer.status || 'active',
        lastContact: customer.lastContact ? new Date(customer.lastContact).toISOString().split('T')[0] : ''
      })
    } else {
      setFormData({
        companyName: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        website: '',
        industry: '',
        value: '',
        status: 'active',
        lastContact: ''
      })
    }
    setErrors({})
    setTouched({})
  }, [customer, mode])

  // Validation rules
  const validationRules = {
    companyName: {
      required: true,
      minLength: 2,
      maxLength: 100,
      pattern: /^[a-zA-Z0-9\s\-&.,()]+$/
    },
    contactPerson: {
      required: true,
      minLength: 2,
      maxLength: 100,
      pattern: /^[a-zA-Z\s\-']+$/
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    phone: {
      required: false,
      pattern: /^[\+]?[1-9][\d\s\-\(\)]{7,15}$/
    },
    website: {
      required: false,
      pattern: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/
    },
    value: {
      required: false,
      min: 0,
      max: 999999999.99
    },
    lastContact: {
      required: false,
      maxDate: new Date()
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
        case 'email':
          return 'Please enter a valid email address (e.g., user@example.com)'
        case 'phone':
          return 'Please enter a valid phone number (e.g., +1 (555) 123-4567)'
        case 'website':
          return 'Please enter a valid website URL (e.g., https://example.com)'
        case 'companyName':
          return 'Company name can only contain letters, numbers, spaces, and basic punctuation (&, ., ,, ())'
        case 'contactPerson':
          return 'Contact person name can only contain letters, spaces, hyphens (-), and apostrophes (\')'
        default:
          return 'Invalid format'
      }
    }

    // Number validation
    if (name === 'value') {
      const numValue = parseFloat(value)
      if (isNaN(numValue)) {
        return 'Value must be a valid number'
      }
      if (rules.min !== undefined && numValue < rules.min) {
        return `Value must be at least ${rules.min}`
      }
      if (rules.max !== undefined && numValue > rules.max) {
        return `Value must be no more than ${rules.max.toLocaleString()}`
      }
    }

    // Date validation
    if (name === 'lastContact' && rules.maxDate) {
      const selectedDate = new Date(value)
      const today = new Date()
      today.setHours(23, 59, 59, 999) // End of today
      
      if (selectedDate > today) {
        return 'Last contact date cannot be in the future'
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
        value: formData.value ? parseFloat(formData.value) : null,
        lastContact: formData.lastContact ? new Date(formData.lastContact) : null
      }
      
      await onSave(payload)
      onClose()
    } catch (error) {
      console.error('Error saving customer:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Validate field on change if it has been touched
    if (touched[name]) {
      const error = validateField(name, value)
      setErrors(prev => ({ ...prev, [name]: error }))
    }
  }

  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }))
    const error = validateField(name, formData[name])
    setErrors(prev => ({ ...prev, [name]: error }))
  }

  const handleDateChange = (e) => {
    const { value } = e.target
    setFormData(prev => ({ ...prev, lastContact: value }))
    
    if (touched.lastContact) {
      const error = validateField('lastContact', value)
      setErrors(prev => ({ ...prev, lastContact: error }))
    }
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'create' ? 'Add New Customer' : 'Edit Customer'}
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
            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                onBlur={() => handleBlur('companyName')}
                className={getFieldClassName('companyName')}
                placeholder="Enter company name"
                maxLength={100}
              />
              {getFieldError('companyName') && (
                <p className="text-red-500 text-sm mt-1">{getFieldError('companyName')}</p>
              )}
            </div>

            {/* Contact Person */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Person <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleInputChange}
                onBlur={() => handleBlur('contactPerson')}
                className={getFieldClassName('contactPerson')}
                placeholder="Enter contact person name"
                maxLength={100}
              />
              {getFieldError('contactPerson') && (
                <p className="text-red-500 text-sm mt-1">{getFieldError('contactPerson')}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={() => handleBlur('email')}
                className={getFieldClassName('email')}
                placeholder="Enter email address"
              />
              {getFieldError('email') && (
                <p className="text-red-500 text-sm mt-1">{getFieldError('email')}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                onBlur={() => handleBlur('phone')}
                className={getFieldClassName('phone')}
                placeholder="+1 (555) 123-4567"
              />
              {getFieldError('phone') && (
                <p className="text-red-500 text-sm mt-1">{getFieldError('phone')}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Include country code if international (+1 for US, +44 for UK, etc.)
              </p>
            </div>

            {/* Industry */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry
              </label>
              <select
                name="industry"
                value={formData.industry}
                onChange={handleInputChange}
                onBlur={() => handleBlur('industry')}
                className={getFieldClassName('industry')}
              >
                <option value="">Select industry</option>
                <option value="Technology">Technology</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Finance">Finance</option>
                <option value="Retail">Retail</option>
                <option value="Education">Education</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Other">Other</option>
              </select>
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
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="prospect">Prospect</option>
                <option value="churned">Churned</option>
              </select>
            </div>

            {/* Value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Value
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  name="value"
                  value={formData.value}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('value')}
                  className={`${getFieldClassName('value')} pl-8`}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  max="999999999.99"
                />
              </div>
              {getFieldError('value') && (
                <p className="text-red-500 text-sm mt-1">{getFieldError('value')}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Enter the customer's lifetime value or annual revenue
              </p>
            </div>

            {/* Last Contact */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Contact
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="date"
                  name="lastContact"
                  value={formData.lastContact}
                  onChange={handleDateChange}
                  onBlur={() => handleBlur('lastContact')}
                  className={`${getFieldClassName('lastContact')} pl-10`}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
              {getFieldError('lastContact') && (
                <p className="text-red-500 text-sm mt-1">{getFieldError('lastContact')}</p>
              )}
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              onBlur={() => handleBlur('address')}
              rows="3"
              className={getFieldClassName('address')}
              placeholder="Enter address"
              maxLength={500}
            />
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-gray-500">
                {formData.address.length}/500 characters
              </span>
              {formData.address.length > 450 && (
                <span className="text-xs text-orange-500">
                  {formData.address.length > 480 ? 'Almost full' : 'Getting long'}
                </span>
              )}
            </div>
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website
            </label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              onBlur={() => handleBlur('website')}
              className={getFieldClassName('website')}
              placeholder="https://example.com"
            />
            {getFieldError('website') && (
              <p className="text-red-500 text-sm mt-1">{getFieldError('website')}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Include the full URL starting with http:// or https://
            </p>
          </div>

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
              <span>{mode === 'create' ? 'Create Customer' : 'Update Customer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 
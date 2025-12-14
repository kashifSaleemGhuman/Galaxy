'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, X, Save, Loader2, MapPin } from 'lucide-react'

export default function LocationManager({ warehouseId, isOpen, onClose, onLocationChange }) {
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(false)
  const [editingLocation, setEditingLocation] = useState(null)
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    isActive: true
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isOpen && warehouseId) {
      fetchLocations()
    }
  }, [isOpen, warehouseId])

  const fetchLocations = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/inventory/warehouses/${warehouseId}/locations`)
      if (response.ok) {
        const data = await response.json()
        setLocations(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching locations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateLocation = () => {
    setEditingLocation(null)
    setFormData({ code: '', name: '', description: '', isActive: true })
    setErrors({})
  }

  const handleEditLocation = (location) => {
    setEditingLocation(location)
    setFormData({
      code: location.code,
      name: location.name || '',
      description: location.description || '',
      isActive: location.isActive
    })
    setErrors({})
  }

  const handleDeleteLocation = async (locationId) => {
    if (!window.confirm('Are you sure you want to delete this location?')) {
      return
    }

    try {
      const response = await fetch(
        `/api/inventory/warehouses/${warehouseId}/locations/${locationId}`,
        { method: 'DELETE' }
      )

      if (response.ok) {
        await fetchLocations()
        // Notify parent to refresh warehouse list
        if (onLocationChange) {
          onLocationChange()
        }
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete location')
      }
    } catch (error) {
      console.error('Error deleting location:', error)
      alert('Failed to delete location')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate
    const newErrors = {}
    if (!formData.code.trim()) {
      newErrors.code = 'Location code is required'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      setLoading(true)
      const url = editingLocation
        ? `/api/inventory/warehouses/${warehouseId}/locations/${editingLocation.id}`
        : `/api/inventory/warehouses/${warehouseId}/locations`

      const method = editingLocation ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await fetchLocations()
        setEditingLocation(null)
        setFormData({ code: '', name: '', description: '', isActive: true })
        setErrors({})
        // Notify parent to refresh warehouse list
        if (onLocationChange) {
          onLocationChange()
        }
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to save location')
      }
    } catch (error) {
      console.error('Error saving location:', error)
      alert('Failed to save location')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setEditingLocation(null)
    setFormData({ code: '', name: '', description: '', isActive: true })
    setErrors({})
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Manage Locations</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Add/Edit Form */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingLocation ? 'Edit Location' : 'Add New Location'}
              </h3>
              {editingLocation && (
                <button
                  onClick={handleCancel}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.code ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="A-01-01"
                    disabled={loading}
                  />
                  {errors.code && (
                    <p className="text-red-500 text-sm mt-1">{errors.code}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Optional name"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="2"
                  placeholder="Optional description"
                  disabled={loading}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  disabled={loading}
                />
                <label className="ml-2 text-sm font-medium text-gray-700">
                  Active
                </label>
              </div>

              <div className="flex justify-end space-x-3">
                {editingLocation && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>{editingLocation ? 'Update' : 'Create'} Location</span>
                </button>
              </div>
            </form>
          </div>

          {/* Locations List */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Existing Locations</h3>
            {loading && locations.length === 0 ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
              </div>
            ) : locations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No locations added yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {locations.map((location) => (
                  <div
                    key={location.id}
                    className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">{location.code}</div>
                        {location.name && (
                          <div className="text-sm text-gray-500">{location.name}</div>
                        )}
                        {location.description && (
                          <div className="text-xs text-gray-400">{location.description}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          location.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {location.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <button
                        onClick={() => handleEditLocation(location)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteLocation(location.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


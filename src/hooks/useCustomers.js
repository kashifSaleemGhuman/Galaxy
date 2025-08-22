'use client'

import { useState, useEffect, useCallback } from 'react'
import { useDebounce } from './useDebounce'

export function useCustomers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterIndustry, setFilterIndustry] = useState('all')
  
  // Debounced search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  const debouncedFilterStatus = useDebounce(filterStatus, 300)
  const debouncedFilterIndustry = useDebounce(filterIndustry, 300)

  // Fetch customers from API
  const fetchCustomers = useCallback(async (page = 1, limit = 10) => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      })
      
      if (debouncedSearchTerm) {
        params.append('search', debouncedSearchTerm)
      }
      
      if (debouncedFilterStatus && debouncedFilterStatus !== 'all') {
        params.append('status', debouncedFilterStatus)
      }
      
      if (debouncedFilterIndustry && debouncedFilterIndustry !== 'all') {
        params.append('industry', debouncedFilterIndustry)
      }

      const response = await fetch(`/api/crm/customers?${params}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      setCustomers(data.customers || [])
      setPagination(data.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      })
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch customers'
      setError(errorMessage)
      console.error('Error fetching customers:', err)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearchTerm, debouncedFilterStatus, debouncedFilterIndustry])

  // Create customer
  const createCustomer = async (customerData) => {
    try {
      const response = await fetch('/api/crm/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      // Refresh the customers list
      await fetchCustomers(pagination.page, pagination.limit)
      
      return result
    } catch (err) {
      const errorMessage = err.message || 'Failed to create customer'
      setError(errorMessage)
      throw err
    }
  }

  // Update customer
  const updateCustomer = async (id, customerData) => {
    try {
      const response = await fetch(`/api/crm/customers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      // Refresh the customers list
      await fetchCustomers(pagination.page, pagination.limit)
      
      return result
    } catch (err) {
      const errorMessage = err.message || 'Failed to update customer'
      setError(errorMessage)
      throw err
    }
  }

  // Delete customer
  const deleteCustomer = async (id) => {
    try {
      console.log('🔍 Frontend: Attempting to delete customer with ID:', id)
      console.log('🔍 Frontend: Current customers list:', customers.map(c => ({ id: c.id, companyName: c.companyName })))
      
      const response = await fetch(`/api/crm/customers/${id}`, {
        method: 'DELETE',
      })
      
      console.log('🔍 Frontend: Delete response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('🔍 Frontend: Delete error response:', errorData)
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      console.log('🔍 Frontend: Delete success response:', result)
      
      // Refresh the customers list
      await fetchCustomers(pagination.page, pagination.limit)
      
      return result
    } catch (err) {
      const errorMessage = err.message || 'Failed to delete customer'
      console.error('🔍 Frontend: Delete error:', errorMessage)
      setError(errorMessage)
      throw err
    }
  }

  // Bulk operations
  const bulkUpdateStatus = async (customerIds, status) => {
    try {
      const response = await fetch('/api/crm/customers/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation: 'status',
          customerIds,
          data: { status }
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      // Refresh the customers list
      await fetchCustomers(pagination.page, pagination.limit)
      
      return result
    } catch (err) {
      const errorMessage = err.message || 'Failed to update customer status'
      setError(errorMessage)
      throw err
    }
  }

  // Handle page change
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }))
    fetchCustomers(newPage, pagination.limit)
  }

  // Handle search change
  const handleSearchChange = (value) => {
    setSearchTerm(value)
    setPagination(prev => ({ ...prev, page: 1 })) // Reset to first page
  }

  // Handle filter change
  const handleFilterChange = (type, value) => {
    if (type === 'status') {
      setFilterStatus(value)
    } else if (type === 'industry') {
      setFilterIndustry(value)
    }
    setPagination(prev => ({ ...prev, page: 1 })) // Reset to first page
  }

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('')
    setFilterStatus('all')
    setFilterIndustry('all')
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  // Initial fetch
  useEffect(() => {
    fetchCustomers(1, 10)
  }, [fetchCustomers])

  return {
    // State
    customers,
    loading,
    error,
    pagination,
    searchTerm,
    filterStatus,
    filterIndustry,
    
    // Actions
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    bulkUpdateStatus,
    handlePageChange,
    handleSearchChange,
    handleFilterChange,
    clearFilters,
    
    // Setters
    setError
  }
} 
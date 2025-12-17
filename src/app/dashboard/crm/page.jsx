'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  UserPlus, 
  Target, 
  TrendingUp, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  AlertCircle,
  X
} from 'lucide-react'
import DataTable from '@/components/ui/DataTable'
import CustomerModal from '@/components/crm/CustomerModal'
import ConfirmationModal from '@/components/crm/ConfirmationModal'
import Pagination from '@/components/ui/Pagination'
import { useCustomers } from '@/hooks/useCustomers'
import { useToast } from '@/components/ui/Toast'

export default function CRMDashboard() {
  const [leads, setLeads] = useState([])
  const [leadsLoading, setLeadsLoading] = useState(true)
  
  // Customer management
  const {
    customers,
    loading: customersLoading,
    error: customersError,
    pagination,
    searchTerm,
    filterStatus,
    filterIndustry,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    handlePageChange,
    handleSearchChange,
    handleFilterChange,
    clearFilters,
    setError
  } = useCustomers()

  // Toast notifications
  const { showToast, ToastContainer } = useToast()

  // Modal states
  const [customerModal, setCustomerModal] = useState({
    isOpen: false,
    mode: 'create',
    customer: null
  })
  
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    customer: null
  })

  // Mock data for leads (keeping existing structure)
  useEffect(() => {
    const mockLeads = [
      {
        id: 1,
        name: 'John Smith',
        company: 'StartupXYZ',
        email: 'john@startupxyz.com',
        phone: '+1 (555) 111-2222',
        status: 'new',
        source: 'Website',
        assignedTo: 'Sales Team',
        createdAt: '2024-01-20'
      },
      {
        id: 2,
        name: 'Sarah Johnson',
        company: 'InnovateCorp',
        email: 'sarah@innovatecorp.com',
        phone: '+1 (555) 333-4444',
        status: 'contacted',
        source: 'LinkedIn',
        assignedTo: 'Sales Team',
        createdAt: '2024-01-18'
      }
    ]

    setLeads(mockLeads)
    setLeadsLoading(false)
  }, [])

  const getStatusColor = (status) => {
    switch (status.status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'prospect': return 'bg-blue-100 text-blue-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'churned': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status.status) {
      case 'active': return '🟢'
      case 'prospect': return '🔵'
      case 'inactive': return '⚫'
      case 'churned': return '🔴'
      default: return '⚪'
    }
  }

  // Stats cards configuration
  const statsCards = [
    {
      title: 'Total Customers',
      value: pagination.total,
      icon: Users,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      growth: '+12%',
      growthText: 'from last month'
    },
    {
      title: 'Active Leads',
      value: leads.filter(l => l.status !== 'converted').length,
      icon: Target,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      growth: '+8%',
      growthText: 'from last month'
    },
    {
      title: 'Total Value',
      value: customers.reduce((sum, c) => sum + (c.value || 0), 0).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }),
      icon: TrendingUp,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      growth: '+15%',
      growthText: 'from last month'
    },
    {
      title: 'Conversion Rate',
      value: '24%',
      icon: TrendingUp,
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      growth: '+3%',
      growthText: 'from last month'
    }
  ]

  // Customer table configuration
  const customerColumns = [
    {
      key: 'avatar',
      label: 'Customer',
      avatarBg: 'bg-blue-100',
      avatarColor: 'text-blue-600',
      title: (item) => item.companyName || 'N/A',
      subtitle: (item) => item.industry || 'No industry'
    },
    {
      key: 'contact',
      label: 'Contact',
      title: (item) => item.contactPerson || 'N/A',
      subtitle: (item) => item.email || 'No email'
    },
    {
      key: 'status',
      label: 'Status',
      statusColor: getStatusColor,
      statusIcon: getStatusIcon,
      statusText: (item) => item.status
    },
    {
      key: 'value',
      label: 'Value',
      currencyValue: (item) => item.value
    },
    {
      key: 'lastContact',
      label: 'Last Contact',
      dateValue: (item) => item.lastContact
    },
    {
      key: 'actions',
      label: 'Actions'
    }
  ]

  // Lead table configuration
  const leadColumns = [
    {
      key: 'avatar',
      label: 'Lead',
      avatarBg: 'bg-green-100',
      avatarColor: 'text-green-600',
      title: (item) => item.name,
      subtitle: (item) => item.email
    },
    {
      key: 'company',
      label: 'Company'
    },
    {
      key: 'status',
      label: 'Status',
      statusColor: getStatusColor,
      statusIcon: getStatusIcon,
      statusText: (item) => item.status
    },
    {
      key: 'source',
      label: 'Source',
      textColor: 'text-gray-500'
    },
    {
      key: 'assignedTo',
      label: 'Assigned To',
      textColor: 'text-gray-500'
    },
    {
      key: 'actions',
      label: 'Actions'
    }
  ]

  // Customer actions
  const customerActions = [
    {
      icon: <Eye className="h-4 w-4" />,
      onClick: (item) => console.log('View', item),
      title: 'View',
      className: 'text-blue-600 hover:text-blue-900'
    },
    {
      icon: <Edit className="h-4 w-4" />,
      onClick: (item) => handleEditCustomer(item),
      title: 'Edit',
      className: 'text-green-600 hover:text-green-900'
    },
    {
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (item) => handleDeleteCustomer(item),
      title: 'Delete',
      className: 'text-red-600 hover:text-red-900'
    }
  ]

  // Lead actions
  const leadActions = [
    {
      icon: <Eye className="h-4 w-4" />,
      onClick: (item) => console.log('View', item),
      title: 'View',
      className: 'text-blue-600 hover:text-blue-900'
    },
    {
      icon: <Edit className="h-4 w-4" />,
      onClick: (item) => console.log('Contact', item),
      title: 'Contact',
      className: 'text-green-600 hover:text-green-900'
    },
    {
      icon: <Target className="h-4 w-4" />,
      onClick: (item) => console.log('Convert', item),
      title: 'Convert',
      className: 'text-purple-600 hover:text-purple-900'
    }
  ]

  // Handle customer operations
  const handleAddCustomer = () => {
    setCustomerModal({
      isOpen: true,
      mode: 'create',
      customer: null
    })
  }

  const handleEditCustomer = (customer) => {
    setCustomerModal({
      isOpen: true,
      mode: 'edit',
      customer
    })
  }

  const handleDeleteCustomer = (customer) => {
    setDeleteModal({
      isOpen: true,
      customer
    })
  }

  const handleSaveCustomer = async (customerData) => {
    try {
      if (customerModal.mode === 'create') {
        await createCustomer(customerData)
        showToast('Customer created successfully!', 'success')
      } else {
        await updateCustomer(customerModal.customer.id, customerData)
        showToast('Customer updated successfully!', 'success')
      }
    } catch (error) {
      console.error('Error saving customer:', error)
      showToast(error.message || 'Failed to save customer', 'error')
    }
  }

  const handleConfirmDelete = async () => {
    try {
      await deleteCustomer(deleteModal.customer.id)
      showToast('Customer deleted successfully!', 'success')
      setDeleteModal({ isOpen: false, customer: null })
    } catch (error) {
      console.error('Error deleting customer:', error)
      showToast(error.message || 'Failed to delete customer', 'error')
    }
  }

  const closeCustomerModal = () => {
    setCustomerModal({ isOpen: false, mode: 'create', customer: null })
  }

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, customer: null })
  }

  if (customersLoading && leadsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Toast Container */}
      <ToastContainer />

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">CRM Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your customer relationships and sales pipeline</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleAddCustomer}
            className="bg-gradient-to-r from-blue-600 to-black text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-gray-900 flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add Customer</span>
          </button>
          <button className="bg-gradient-to-r from-green-600 to-green-900 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-black flex items-center space-x-2">
            <UserPlus className="h-5 w-5" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* Error Display */}
      {customersError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Error loading customers</h3>
            <p className="text-sm text-red-700 mt-1">{customersError}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => {
          const IconComponent = card.icon
          return (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                </div>
                <div className={`p-3 ${card.iconBg} rounded-full`}>
                  <IconComponent className={`h-6 w-6 ${card.iconColor}`} />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-green-600 text-sm font-medium">{card.growth}</span>
                <span className="text-gray-600 text-sm ml-2">{card.growthText}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search customers, leads, or companies..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filterStatus}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="prospect">Prospect</option>
              <option value="inactive">Inactive</option>
              <option value="churned">Churned</option>
            </select>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filterIndustry}
              onChange={(e) => handleFilterChange('industry', e.target.value)}
            >
              <option value="all">All Industries</option>
              <option value="Technology">Technology</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Finance">Finance</option>
              <option value="Retail">Retail</option>
              <option value="Education">Education</option>
              <option value="Real Estate">Real Estate</option>
              <option value="Other">Other</option>
            </select>
            <button 
              onClick={clearFilters}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
            >
              <RefreshCw className="h-5 w-5" />
              <span>Clear</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Customers */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Recent Customers</h2>
          <p className="text-gray-600 mt-1">Manage your customer relationships</p>
        </div>
        
        {customersLoading ? (
          <div className="p-6 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <DataTable
              data={customers}
              columns={customerColumns}
              actions={customerActions}
              emptyMessage="No customers found"
              emptyIcon="👥"
            />
            
            {/* Pagination */}
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
              hasNext={pagination.hasNext}
              hasPrev={pagination.hasPrev}
            />
          </>
        )}
      </div>

      {/* Recent Leads */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Recent Leads</h2>
          <p className="text-gray-600 mt-1">Track your sales pipeline</p>
        </div>
        
        {leadsLoading ? (
          <div className="p-6 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <DataTable
            data={leads}
            columns={leadColumns}
            actions={leadActions}
            emptyMessage="No leads found"
            emptyIcon="🎯"
          />
        )}
      </div>

      {/* Customer Modal */}
      <CustomerModal
        isOpen={customerModal.isOpen}
        onClose={closeCustomerModal}
        customer={customerModal.customer}
        mode={customerModal.mode}
        onSave={handleSaveCustomer}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Delete Customer"
        message={`Are you sure you want to delete "${deleteModal.customer?.companyName}"? This action cannot be undone.`}
        confirmText="Delete Customer"
        type="danger"
      />
    </div>
  )
} 
'use client'

import { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Phone, 
  Mail, 
  MapPin,
  Building,
  Calendar,
  DollarSign,
  MoreHorizontal
} from 'lucide-react'
import DataTable from '@/components/ui/DataTable'

export default function CustomersPage() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterIndustry, setFilterIndustry] = useState('all')
  const [viewMode, setViewMode] = useState('table') // 'table' or 'grid'
  const [selectedCustomers, setSelectedCustomers] = useState([])

  // Mock data for demonstration
  useEffect(() => {
    const mockCustomers = [
      {
        id: 1,
        name: 'Acme Corporation',
        email: 'contact@acme.com',
        phone: '+1 (555) 123-4567',
        status: 'active',
        value: 50000,
        lastContact: '2024-01-15',
        industry: 'Technology',
        address: '123 Tech Street, Silicon Valley, CA',
        website: 'www.acme.com',
        contactPerson: 'John Doe',
        notes: 'High-value enterprise client'
      },
      {
        id: 2,
        name: 'Global Industries',
        email: 'info@global.com',
        phone: '+1 (555) 987-6543',
        status: 'active',
        value: 75000,
        lastContact: '2024-01-10',
        industry: 'Manufacturing',
        address: '456 Industry Blvd, Detroit, MI',
        website: 'www.globalindustries.com',
        contactPerson: 'Jane Smith',
        notes: 'Long-term manufacturing partner'
      },
      {
        id: 3,
        name: 'Tech Solutions Inc',
        email: 'hello@techsolutions.com',
        phone: '+1 (555) 456-7890',
        status: 'prospect',
        value: 25000,
        lastContact: '2024-01-05',
        industry: 'Software',
        address: '789 Software Ave, Austin, TX',
        website: 'www.techsolutions.com',
        contactPerson: 'Mike Johnson',
        notes: 'Startup company, potential for growth'
      },
      {
        id: 4,
        name: 'Retail Plus',
        email: 'sales@retailplus.com',
        phone: '+1 (555) 321-6540',
        status: 'inactive',
        value: 15000,
        lastContact: '2023-12-20',
        industry: 'Retail',
        address: '321 Retail Road, New York, NY',
        website: 'www.retailplus.com',
        contactPerson: 'Sarah Wilson',
        notes: 'Seasonal business, low activity'
      }
    ]

    setCustomers(mockCustomers)
    setLoading(false)
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'prospect': return 'bg-blue-100 text-blue-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return '🟢'
      case 'prospect': return '🔵'
      case 'inactive': return '⚫'
      default: return '⚪'
    }
  }

  const handleSelectCustomer = (customerId) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId) 
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    )
  }

  const handleSelectAll = () => {
    if (selectedCustomers.length === customers.length) {
      setSelectedCustomers([])
    } else {
      setSelectedCustomers(customers.map(c => c.id))
    }
  }

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || customer.status === filterStatus
    const matchesIndustry = filterIndustry === 'all' || customer.industry === filterIndustry
    
    return matchesSearch && matchesStatus && matchesIndustry
  })

  // Table columns configuration
  const tableColumns = [
    {
      key: 'avatar',
      label: 'Customer',
      avatarBg: 'bg-blue-100',
      avatarColor: 'text-blue-600',
      title: (item) => item.name,
      subtitle: (item) => item.industry
    },
    {
      key: 'contactInfo',
      label: 'Contact Info',
      render: (item) => (
        <div>
          <div className="text-sm text-gray-900">{item.contactPerson}</div>
          <div className="text-sm text-gray-500">{item.email}</div>
          <div className="text-sm text-gray-500">{item.phone}</div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      statusColor: getStatusColor,
      statusIcon: getStatusIcon,
      statusText: (item) => item.status
    },
    {
      key: 'currency',
      label: 'Value',
      currencyValue: (item) => item.value
    },
    {
      key: 'date',
      label: 'Last Contact',
      dateValue: (item) => item.lastContact
    },
    {
      key: 'actions',
      label: 'Actions'
    }
  ]

  // Table actions
  const tableActions = [
    {
      icon: <Eye className="h-4 w-4" />,
      onClick: (item) => console.log('View', item),
      title: 'View',
      className: 'text-blue-600 hover:text-blue-900'
    },
    {
      icon: <Edit className="h-4 w-4" />,
      onClick: (item) => console.log('Edit', item),
      title: 'Edit',
      className: 'text-green-600 hover:text-green-900'
    },
    {
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (item) => console.log('Delete', item),
      title: 'Delete',
      className: 'text-red-600 hover:text-red-900'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600 mt-2">Manage your customer relationships and data</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-gradient-to-r from-blue-600 to-black text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-gray-900 flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search customers by name, email, or contact person..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="prospect">Prospect</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filterIndustry}
              onChange={(e) => setFilterIndustry(e.target.value)}
            >
              <option value="all">All Industries</option>
              <option value="Technology">Technology</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Software">Software</option>
              <option value="Retail">Retail</option>
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
        
        {selectedCustomers.length > 0 && (
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">
              {selectedCustomers.length} customer(s) selected
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
        Showing {filteredCustomers.length} of {customers.length} customers
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <DataTable
          data={filteredCustomers}
          columns={tableColumns}
          actions={tableActions}
          selectable={true}
          selectedRows={selectedCustomers}
          onRowSelect={handleSelectCustomer}
          onSelectAll={handleSelectAll}
          emptyMessage="No customers found. Try adjusting your search or filters."
          emptyIcon="👥"
        />
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer) => (
            <div key={customer.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-lg">
                      {customer.name.charAt(0)}
                    </span>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900">{customer.name}</h3>
                    <p className="text-sm text-gray-500">{customer.industry}</p>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Building className="h-4 w-4 mr-2" />
                  <span>{customer.contactPerson}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>{customer.email}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>{customer.phone}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="truncate">{customer.address}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                  {getStatusIcon(customer.status)} {customer.status}
                </span>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">${customer.value.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Value</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Last: {new Date(customer.lastContact).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <button className="flex-1 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gradient-to-r hover:from-blue-100 hover:to-blue-50">
                  View Details
                </button>
                <button className="flex-1 bg-gray-50 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100">
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State for Grid View */}
      {viewMode === 'grid' && filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <Building className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No customers found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterStatus !== 'all' || filterIndustry !== 'all'
              ? 'Try adjusting your search or filters.'
              : 'Get started by creating your first customer.'}
          </p>
          <div className="mt-6">
            <button className="bg-gradient-to-r from-blue-600 to-black text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-gray-900">
              Add Customer
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 
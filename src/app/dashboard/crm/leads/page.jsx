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
  Target,
  Calendar,
  User,
  Building,
  TrendingUp,
  MoreHorizontal,
  ArrowRight,
  CheckCircle,
  DollarSign
} from 'lucide-react'

export default function LeadsPage() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSource, setFilterSource] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [viewMode, setViewMode] = useState('pipeline') // 'pipeline', 'table', 'kanban'
  const [selectedLeads, setSelectedLeads] = useState([])

  // Mock data for demonstration
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
        createdAt: '2024-01-20',
        value: 25000,
        notes: 'Interested in enterprise solution',
        lastContact: '2024-01-20',
        priority: 'high'
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
        createdAt: '2024-01-18',
        value: 50000,
        notes: 'Follow up scheduled for next week',
        lastContact: '2024-01-19',
        priority: 'medium'
      },
      {
        id: 3,
        name: 'Mike Wilson',
        company: 'TechFlow',
        email: 'mike@techflow.com',
        phone: '+1 (555) 555-6666',
        status: 'qualified',
        source: 'Referral',
        assignedTo: 'Senior Sales',
        createdAt: '2024-01-15',
        value: 75000,
        notes: 'Ready for proposal',
        lastContact: '2024-01-18',
        priority: 'high'
      },
      {
        id: 4,
        name: 'Emily Davis',
        company: 'DataSoft',
        email: 'emily@datasoft.com',
        phone: '+1 (555) 777-8888',
        status: 'proposal',
        source: 'Trade Show',
        assignedTo: 'Senior Sales',
        createdAt: '2024-01-10',
        value: 100000,
        notes: 'Proposal sent, waiting for response',
        lastContact: '2024-01-17',
        priority: 'high'
      },
      {
        id: 5,
        name: 'David Brown',
        company: 'CloudTech',
        email: 'david@cloudtech.com',
        phone: '+1 (555) 999-0000',
        status: 'negotiation',
        source: 'Website',
        assignedTo: 'Sales Manager',
        createdAt: '2024-01-05',
        value: 150000,
        notes: 'Contract terms being discussed',
        lastContact: '2024-01-16',
        priority: 'critical'
      }
    ]

    setLeads(mockLeads)
    setLoading(false)
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-purple-100 text-purple-800'
      case 'contacted': return 'bg-yellow-100 text-yellow-800'
      case 'qualified': return 'bg-blue-100 text-blue-800'
      case 'proposal': return 'bg-indigo-100 text-indigo-800'
      case 'negotiation': return 'bg-orange-100 text-orange-800'
      case 'won': return 'bg-green-100 text-green-800'
      case 'lost': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'new': return '🆕'
      case 'contacted': return '📞'
      case 'qualified': return '✅'
      case 'proposal': return '📋'
      case 'negotiation': return '🤝'
      case 'won': return '🏆'
      case 'lost': return '❌'
      default: return '⚪'
    }
  }

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'critical': return '🚨'
      case 'high': return '🔴'
      case 'medium': return '🟡'
      case 'low': return '🟢'
      default: return '⚪'
    }
  }

  const leadStages = [
    { key: 'new', label: 'New', color: 'bg-purple-100 text-purple-800' },
    { key: 'contacted', label: 'Contacted', color: 'bg-yellow-100 text-yellow-800' },
    { key: 'qualified', label: 'Qualified', color: 'bg-blue-100 text-blue-800' },
    { key: 'proposal', label: 'Proposal', color: 'bg-indigo-100 text-indigo-800' },
    { key: 'negotiation', label: 'Negotiation', color: 'bg-orange-100 text-orange-800' },
    { key: 'won', label: 'Won', color: 'bg-green-100 text-green-800' },
    { key: 'lost', label: 'Lost', color: 'bg-red-100 text-red-800' }
  ]

  const handleSelectLead = (leadId) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    )
  }

  const handleSelectAll = () => {
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([])
    } else {
      setSelectedLeads(leads.map(l => l.id))
    }
  }

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesSource = filterSource === 'all' || lead.source === filterSource
    const matchesStatus = filterStatus === 'all' || lead.status === filterStatus
    
    return matchesSearch && matchesSource && matchesStatus
  })

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
          <h1 className="text-3xl font-bold text-gray-900">Lead Management</h1>
          <p className="text-gray-600 mt-2">Track and manage your sales pipeline</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-gradient-to-r from-blue-600 to-black text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-gray-900 flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Total Leads',
            value: leads.length,
            icon: Target,
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
            growth: '+15%',
            growthText: 'from last month'
          },
          {
            title: 'Pipeline Value',
            value: '$400K',
            icon: TrendingUp,
            iconBg: 'bg-green-100',
            iconColor: 'text-green-600',
            growth: '+22%',
            growthText: 'from last month'
          },
          {
            title: 'Conversion Rate',
            value: '18%',
            icon: CheckCircle,
            iconBg: 'bg-purple-100',
            iconColor: 'text-purple-600',
            growth: '+5%',
            growthText: 'from last month'
          },
          {
            title: 'Avg Lead Value',
            value: '$80K',
            icon: DollarSign,
            iconBg: 'bg-yellow-100',
            iconColor: 'text-yellow-600',
            growth: '+12%',
            growthText: 'from last month'
          }
        ].map((card, index) => {
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

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search leads by name, company, or email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
            >
              <option value="all">All Sources</option>
              <option value="Website">Website</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Referral">Referral</option>
              <option value="Trade Show">Trade Show</option>
              <option value="Cold Call">Cold Call</option>
            </select>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Stages</option>
              {leadStages.map(stage => (
                <option key={stage.key} value={stage.key}>{stage.label}</option>
              ))}
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
            onClick={() => setViewMode('pipeline')}
            className={`px-3 py-2 rounded-lg text-sm font-medium ${
              viewMode === 'pipeline' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Pipeline View
          </button>
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
            onClick={() => setViewMode('kanban')}
            className={`px-3 py-2 rounded-lg text-sm font-medium ${
              viewMode === 'kanban' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Kanban View
          </button>
        </div>
        
        {selectedLeads.length > 0 && (
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">
              {selectedLeads.length} lead(s) selected
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

      {/* Pipeline View */}
      {viewMode === 'pipeline' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
            {leadStages.map((stage) => {
              const stageLeads = filteredLeads.filter(lead => lead.status === stage.key)
              const stageValue = stageLeads.reduce((sum, lead) => sum + lead.value, 0)
              
              return (
                <div key={stage.key} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-sm font-medium px-2 py-1 rounded-full ${stage.color}`}>
                      {stage.label}
                    </h3>
                    <span className="text-xs text-gray-500">{stageLeads.length}</span>
                  </div>
                  
                  <div className="text-xs text-gray-500 mb-4">
                    ${stageValue.toLocaleString()}
                  </div>
                  
                  <div className="space-y-2">
                    {stageLeads.map((lead) => (
                      <div key={lead.id} className="bg-gray-50 rounded-lg p-3 cursor-pointer hover:bg-gray-100">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900 truncate">{lead.name}</h4>
                            <p className="text-xs text-gray-500 truncate">{lead.company}</p>
                          </div>
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(lead.priority)}`}>
                            {getPriorityIcon(lead.priority)}
                          </span>
                        </div>
                        
                        <div className="text-xs text-gray-500 mb-2">
                          ${lead.value.toLocaleString()}
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>{lead.assignedTo}</span>
                          <button className="text-blue-600 hover:text-blue-800">
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    {stageLeads.length === 0 && (
                      <div className="text-center py-4 text-xs text-gray-400">
                        No leads in this stage
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <DataTable
          data={filteredLeads}
          columns={[
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
              label: 'Stage',
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
              key: 'priority',
              label: 'Priority',
              statusColor: getPriorityColor,
              statusIcon: getPriorityIcon,
              statusText: (item) => item.priority
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
          ]}
          actions={[
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
              icon: <Trash2 className="h-4 w-4" />,
              onClick: (item) => console.log('Convert', item),
              title: 'Convert',
              className: 'text-purple-600 hover:text-purple-900'
            }
          ]}
          selectable={true}
          selectedRows={selectedLeads}
          onRowSelect={handleSelectLead}
          onSelectAll={handleSelectAll}
          emptyMessage="No leads found. Try adjusting your search or filters."
          emptyIcon="🎯"
        />
      )}

      {/* Empty State */}
      {filteredLeads.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <Target className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No leads found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterSource !== 'all' || filterStatus !== 'all'
              ? 'Try adjusting your search or filters.'
              : 'Get started by creating your first lead.'}
          </p>
          <div className="mt-6">
            <button className="bg-gradient-to-r from-blue-600 to-black text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-gray-900">
              Add Lead
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 
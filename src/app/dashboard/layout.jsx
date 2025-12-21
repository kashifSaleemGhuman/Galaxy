'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { 
  ChevronDownIcon,
  HomeIcon,
  UserGroupIcon,
  ShoppingBagIcon,
  CubeIcon,
  UsersIcon,
  CalculatorIcon,
  ChartBarIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'

export default function DashboardLayout({ children }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState(new Set())

  // Redirect to login if not authenticated
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/login')
    return null
  }

  // Check if user is admin
  const isAdmin = session?.user?.role === 'super_admin' || session?.user?.role === 'admin'
  const isPurchaseManager = session?.user?.role === 'purchase_manager'

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: HomeIcon,
      current: pathname === '/dashboard'
    },
    ...(isAdmin ? [{
      name: 'Users',
      href: '/dashboard/users',
      icon: UsersIcon,
      current: pathname.startsWith('/dashboard/users')
    }] : []),
    {
      name: 'Organization',
      href: '/dashboard/organization',
      icon: HomeIcon, // You can import a BuildingIcon or similar if available
      current: pathname.startsWith('/dashboard/organization'),
      children: [
        { name: 'Overview', href: '/dashboard/organization/details', current: pathname === '/dashboard/organization/details' || pathname === '/dashboard/organization' },
        { name: 'Document Details', href: '/dashboard/organization/documents', current: pathname === '/dashboard/organization/documents' },
        { name: 'Employees', href: '/dashboard/organization/employees', current: pathname.startsWith('/dashboard/organization/employees') },
        { name: 'Machines', href: '/dashboard/organization/machines', current: pathname.startsWith('/dashboard/organization/machines') },
        { name: 'Operating Permits', href: '/dashboard/organization/permits', current: pathname.startsWith('/dashboard/organization/permits') },
        { name: 'Purchases', href: '/dashboard/organization/raw-purchases', current: pathname.startsWith('/dashboard/organization/raw-purchases') }
      ]
    },
    { 
      name: 'Purchase', 
      href: '/dashboard/purchase', 
      icon: ShoppingBagIcon,
      current: pathname.startsWith('/dashboard/purchase'),
      children: [
        { name: 'Overview', href: '/dashboard/purchase', current: pathname === '/dashboard/purchase' },
        { name: 'Suppliers', href: '/dashboard/purchase/suppliers', current: pathname === '/dashboard/purchase/suppliers' },
        { name: 'Vendors', href: '/dashboard/purchase/vendors', current: pathname === '/dashboard/purchase/vendors' },
        { name: 'Products', href: '/dashboard/purchase/products', current: pathname === '/dashboard/purchase/products' },
        { name: 'RFQs', href: '/dashboard/purchase/rfqs', current: pathname.startsWith('/dashboard/purchase/rfqs') },
        { name: 'Purchase Orders', href: '/dashboard/purchase/purchase-orders', current: pathname === '/dashboard/purchase/purchase-orders' },
        { name: 'Receipts', href: '/dashboard/purchase/receipts', current: pathname === '/dashboard/purchase/receipts' },
        { name: 'Vendor Bills', href: '/dashboard/purchase/bills', current: pathname === '/dashboard/purchase/bills' }
      ]
    },
    { 
      name: 'CRM', 
      href: '/dashboard/crm', 
      icon: UserGroupIcon,
      current: pathname.startsWith('/dashboard/crm'),
      children: [
        { name: 'Overview', href: '/dashboard/crm', current: pathname === '/dashboard/crm' },
        { name: 'Customers', href: '/dashboard/crm/customers', current: pathname === '/dashboard/crm/customers' },
        { name: 'Leads', href: '/dashboard/crm/leads', current: pathname === '/dashboard/crm/leads' },
        { name: 'Opportunities', href: '/dashboard/crm/opportunities', current: pathname === '/dashboard/crm/opportunities' },
        { name: 'Contacts', href: '/dashboard/crm/contacts', current: pathname === '/dashboard/crm/contacts' }
      ]
    },
    { 
      name: 'Sales', 
      href: '/dashboard/sales', 
      icon: ShoppingBagIcon,
      current: pathname.startsWith('/dashboard/sales'),
      children: [
        { name: 'Orders', href: '/dashboard/sales/orders', current: pathname === '/dashboard/sales/orders' },
        { name: 'Quotes', href: '/dashboard/sales/quotes', current: pathname === '/dashboard/sales/quotes' },
        { name: 'Invoices', href: '/dashboard/sales/invoices', current: pathname === '/dashboard/sales/invoices' }
      ]
    },
    { 
      name: 'Inventory', 
      href: '/dashboard/inventory', 
      icon: CubeIcon,
      current: pathname.startsWith('/dashboard/inventory'),
      children: [
        { name: 'Products', href: '/dashboard/inventory/products', current: pathname === '/dashboard/inventory/products' },
        { name: 'Stock', href: '/dashboard/inventory/stock', current: pathname === '/dashboard/inventory/stock' },
        { name: 'Movements', href: '/dashboard/inventory/movements', current: pathname === '/dashboard/inventory/movements' }
      ]
    },
    { 
      name: 'HRM', 
      href: '/dashboard/hrm', 
      icon: UsersIcon,
      current: pathname.startsWith('/dashboard/hrm'),
      children: [
        { name: 'Employees', href: '/dashboard/hrm/employees', current: pathname === '/dashboard/hrm/employees' },
        { name: 'Departments', href: '/dashboard/hrm/departments', current: pathname === '/dashboard/hrm/departments' },
        { name: 'Payroll', href: '/dashboard/hrm/payroll', current: pathname === '/dashboard/hrm/payroll' }
      ]
    },
    { 
      name: 'Accounting', 
      href: '/dashboard/accounting', 
      icon: CalculatorIcon,
      current: pathname.startsWith('/dashboard/accounting'),
      children: [
        { name: 'Chart of Accounts', href: '/dashboard/accounting/accounts', current: pathname === '/dashboard/accounting/accounts' },
        { name: 'Journal Entries', href: '/dashboard/accounting/journal', current: pathname === '/dashboard/accounting/journal' },
        { name: 'Reports', href: '/dashboard/accounting/reports', current: pathname === '/dashboard/accounting/reports' }
      ]
    },
    { 
      name: 'Analytics', 
      href: '/dashboard/analytics', 
      icon: ChartBarIcon,
      current: pathname === '/dashboard/analytics'
    },
    { 
      name: 'Settings', 
      href: '/dashboard/settings', 
      icon: Cog6ToothIcon,
      current: pathname === '/dashboard/settings'
    },
  ]

  const toggleMenu = (menuName) => {
    const newExpanded = new Set(expandedMenus)
    if (newExpanded.has(menuName)) {
      newExpanded.delete(menuName)
    } else {
      newExpanded.add(menuName)
    }
    setExpandedMenus(newExpanded)
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  const renderNavItem = (item) => {
    const isExpanded = expandedMenus.has(item.name)
    const hasChildren = item.children && item.children.length > 0
    const IconComponent = item.icon

    return (
      <div key={item.name}>
        <div
          className={`flex items-center justify-between px-4 py-3 text-white rounded-lg cursor-pointer transition-all duration-200 ${
            item.current 
              ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-md' 
              : 'hover:bg-gradient-to-r hover:from-blue-700 hover:to-blue-900 hover:text-white hover:shadow-sm'
          }`}
          onClick={() => hasChildren ? toggleMenu(item.name) : router.push(item.href)}
        >
          <div className="flex items-center">
            {IconComponent && <IconComponent className="h-5 w-5 mr-3 text-white" />}
            <span>{item.name}</span>
          </div>
          {hasChildren && (
            <ChevronDownIcon 
              className={`h-4 w-4 text-white transition-transform duration-200 ${
                isExpanded ? 'rotate-180' : ''
              }`} 
            />
          )}
        </div>
        
        {hasChildren && isExpanded && (
          <div className="ml-6 mt-2 space-y-1">
            {item.children.map((child) => (
              <Link
                key={child.name}
                href={child.href}
                className={`block px-4 py-2 text-sm rounded-lg transition-all duration-200 ${
                  child.current
                    ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white font-medium shadow-sm'
                    : 'text-gray-300 hover:bg-gradient-to-r hover:from-blue-700 hover:to-blue-900 hover:text-white'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                {child.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75"></div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-blue-900 via-slate-900 to-black shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-600 bg-gradient-to-r from-slate-800 to-slate-900">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <span className="text-white text-lg">🚀</span>
            </div>
            <h1 className="ml-3 text-xl font-bold text-white">Galaxy ERP</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-white hover:bg-white hover:bg-opacity-20 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="mt-8 px-4">
          <div className="space-y-2">
            {navigation.map(renderNavItem)}
          </div>
        </nav>

        {/* User section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-600 bg-gradient-to-r from-slate-800 to-black">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {session?.user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-white">
                {session?.user?.name || 'User'}
              </p>
              <p className="text-xs text-gray-300">
                {session?.user?.email || 'user@example.com'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-gray-300 hover:text-white hover:bg-blue-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-gradient-to-r from-blue-600 to-black shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-white hover:text-white hover:bg-white hover:bg-opacity-20 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            </button>
            
            <div className="flex-1 lg:hidden"></div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-white">
                Welcome back, <span className="font-medium text-white">{session?.user?.name || 'User'}</span>! 👋
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
} 
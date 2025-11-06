'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock,
  Building2,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'

export default function WarehouseLayout({ children }) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const [expandedMenus, setExpandedMenus] = useState(new Set())

  // Role guard: only SUPER_ADMIN and INVENTORY_USER can access warehouse module
  const role = session?.user?.role
  if (status !== 'loading' && role && !['SUPER_ADMIN','INVENTORY_USER'].includes(role)) {
    router.push('/dashboard/inventory')
    return null
  }

  const getWarehouseNavigation = () => {
    const userRole = session?.user?.role

    // Only show warehouse module to warehouse operators and super admins
    if (userRole !== 'INVENTORY_USER' && userRole !== 'SUPER_ADMIN') {
      return []
    }

    return [
      {
        name: 'Warehouse Operations',
        href: '/dashboard/warehouse',
        icon: Building2,
        current: pathname === '/dashboard/warehouse',
        children: [
          { name: 'Dashboard', href: '/dashboard/warehouse', current: pathname === '/dashboard/warehouse' },
          { name: 'Incoming Shipments', href: '/dashboard/warehouse/shipments', current: pathname === '/dashboard/warehouse/shipments' },
          { name: 'Process Goods', href: '/dashboard/warehouse/process', current: pathname === '/dashboard/warehouse/process' },
          { name: 'Completed Tasks', href: '/dashboard/warehouse/completed', current: pathname === '/dashboard/warehouse/completed' }
        ]
      }
    ]
  }

  const navigation = getWarehouseNavigation()

  const toggleMenu = (menuName) => {
    const newExpanded = new Set(expandedMenus)
    if (newExpanded.has(menuName)) {
      newExpanded.delete(menuName)
    } else {
      newExpanded.add(menuName)
    }
    setExpandedMenus(newExpanded)
  }

  const renderNavItem = (item) => {
    const isExpanded = expandedMenus.has(item.name)
    const hasChildren = item.children && item.children.length > 0
    const IconComponent = item.icon

    return (
      <div key={item.name}>
        <div
          className={`flex items-center justify-between px-4 py-3 text-gray-700 rounded-lg cursor-pointer transition-all duration-200 ${
            item.current 
              ? 'bg-blue-50 text-blue-700 shadow-sm' 
              : 'hover:bg-gray-50 hover:text-gray-900'
          }`}
          onClick={() => hasChildren && toggleMenu(item.name)}
        >
          <div className="flex items-center">
            <IconComponent className="w-5 h-5 mr-3" />
            <span className="font-medium">{item.name}</span>
          </div>
          {hasChildren && (
            <ArrowRight 
              className={`w-4 h-4 transition-transform duration-200 ${
                isExpanded ? 'rotate-90' : ''
              }`} 
            />
          )}
        </div>
        
        {hasChildren && isExpanded && (
          <div className="ml-8 mt-2 space-y-1">
            {item.children.map((child) => (
              <Link
                key={child.name}
                href={child.href}
                className={`block px-4 py-2 text-sm rounded-lg transition-all duration-200 ${
                  child.current
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
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
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Building2 className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Warehouse Operations</h1>
                <p className="text-gray-600">Manage incoming shipments and goods processing</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome, <span className="font-medium">{session?.user?.name}</span>
              </div>
              <Link
                href="/dashboard"
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-6">
            <nav className="space-y-2">
              {navigation.map(renderNavItem)}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {children}
        </div>
      </div>
    </div>
  )
}


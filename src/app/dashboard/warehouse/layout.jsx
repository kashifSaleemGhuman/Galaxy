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
import { ROLES } from '@/lib/constants/roles'

const tabs = [
  { href: '/dashboard/warehouse', label: 'Dashboard' },
  { href: '/dashboard/warehouse/shipments', label: 'Incoming Shipments' },
  { href: '/dashboard/warehouse/process', label: 'Process Goods' },
  { href: '/dashboard/warehouse/completed', label: 'Completed Tasks' },
]

export default function WarehouseLayout({ children }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [expandedMenus, setExpandedMenus] = useState(new Set())

  // Role guard: SUPER_ADMIN, ADMIN, WAREHOUSE_OPERATOR, INVENTORY_USER, INVENTORY_MANAGER can access warehouse module
  const role = (session?.user?.role || '').toUpperCase()
  if (status !== 'loading' && role) {
    const allowedRoles = [
      ROLES.SUPER_ADMIN, 
      ROLES.ADMIN,
      ROLES.WAREHOUSE_OPERATOR,
      ROLES.INVENTORY_USER,
      ROLES.INVENTORY_MANAGER
    ]
    if (!allowedRoles.includes(role)) {
      router.push('/dashboard')
      return null
    }
  }

  const isHome = pathname === '/dashboard/warehouse'

  // Helper function to check if a tab is active
  const isTabActive = (tabHref) => {
    if (tabHref === '/dashboard/warehouse') {
      return pathname === '/dashboard/warehouse'
    }
    return pathname.startsWith(tabHref)
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

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`px-3 py-2 text-sm rounded-md border transition-colors cursor-pointer ${
                    isTabActive(tab.href)
                      ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium'
                      : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
                  }`}
                >
                  {tab.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  )
}


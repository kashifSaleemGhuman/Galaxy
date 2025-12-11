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

export default function WarehouseLayout({ children }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [expandedMenus, setExpandedMenus] = useState(new Set())

  // Role guard: only SUPER_ADMIN and INVENTORY_USER can access warehouse module
  const role = (session?.user?.role || '').toUpperCase()
  if (status !== 'loading' && role && ![ROLES.SUPER_ADMIN, ROLES.INVENTORY_USER].includes(role)) {
    router.push('/dashboard/inventory')
    return null
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

      {/* Main Content */}
      <div className="p-6 max-w-6xl mx-auto">
        {children}
      </div>
    </div>
  )
}


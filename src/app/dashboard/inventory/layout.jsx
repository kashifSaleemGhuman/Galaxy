"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/dashboard/inventory', label: 'Overview' },
  { href: '/dashboard/inventory/products', label: 'Products' },
  { href: '/dashboard/inventory/warehouses', label: 'Warehouses' },
  { href: '/dashboard/inventory/stock', label: 'Stock Levels' },
  { href: '/dashboard/inventory/movements', label: 'Stock Movements' },
  { href: '/dashboard/inventory/transfers', label: 'Transfers' },
  { href: '/dashboard/inventory/adjustments', label: 'Adjustments' },
  { href: '/dashboard/inventory/cycle-counts', label: 'Cycle Counts' },
  { href: '/dashboard/inventory/reports', label: 'Reports' },
]

export default function InventoryLayout({ children }) {
  const pathname = usePathname()
  const isHome = pathname === '/dashboard/inventory'
  
  return (
    <div className="min-h-screen">
      {!isHome && (
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <h1 className="text-2xl font-semibold text-gray-900">Inventory Management</h1>
              <p className="text-gray-600 mt-1">Manage products, stock levels, warehouses, and inventory operations.</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {tabs.map((t) => (
                  <Link
                    key={t.href}
                    href={t.href}
                    className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                      pathname === t.href
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
                    }`}
                  >
                    {t.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      <div className={isHome ? "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"}>
        {children}
      </div>
    </div>
  )
}

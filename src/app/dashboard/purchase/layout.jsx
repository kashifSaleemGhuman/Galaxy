"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/dashboard/purchase', label: 'Overview' },
  { href: '/dashboard/purchase/suppliers', label: 'Suppliers' },
  { href: '/dashboard/purchase/products', label: 'Products' },
  { href: '/dashboard/purchase/rfqs', label: 'RFQs' },
  { href: '/dashboard/purchase/purchase-orders', label: 'Purchase Orders' },
  { href: '/dashboard/purchase/receipts', label: 'Receipts' },
  { href: '/dashboard/purchase/bills', label: 'Vendor Bills' },
]

export default function PurchaseLayout({ children }) {
  const pathname = usePathname()
  const isHome = pathname === '/dashboard/purchase'
  return (
    <div className="min-h-screen">
      {!isHome && (
        <div className="bg-gradient-to-r from-blue-600 to-black border-b shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <h1 className="text-2xl font-semibold text-white">Purchase</h1>
              <p className="text-gray-200 mt-1">Manage suppliers, RFQs, POs, receipts and bills.</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {tabs.map((t) => {
                  const isActive = pathname === t.href || (t.href !== '/dashboard/purchase' && pathname.startsWith(t.href));
                  return (
                    <Link
                      key={t.href}
                      href={t.href}
                      className={`px-3 py-2 text-sm rounded-md border-2 transition-all duration-200 font-medium ${
                        isActive 
                          ? 'bg-gradient-to-r from-blue-700 to-blue-900 border-blue-400 text-white shadow-md' 
                          : 'bg-white hover:bg-gray-100 border-gray-200 text-gray-900 hover:border-blue-400'
                      }`}
                    >
                      {t.label}
                    </Link>
                  );
                })}
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



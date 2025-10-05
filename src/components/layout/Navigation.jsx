'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { ROLES } from '@/lib/constants/roles';

export default function Navigation() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isAdmin = session?.user?.role === ROLES.SUPER_ADMIN || session?.user?.role === ROLES.ADMIN;
  const isPurchaseManager = session?.user?.role === ROLES.PURCHASE_MANAGER;

  const navigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Purchase', href: '/dashboard/purchase' },
    ...(isPurchaseManager ? [
      { name: 'Approvals', href: '/dashboard/purchase/approvals' }
    ] : []),
    ...(isAdmin ? [
      { name: 'Users', href: '/dashboard/users' }
    ] : [])
  ];

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard" className="text-xl font-bold text-gray-800">
                Galaxy ERP
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="ml-3 relative">
              <div className="flex items-center">
                <span className="text-sm text-gray-500 mr-2">
                  {session?.user?.email}
                </span>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {session?.user?.role}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
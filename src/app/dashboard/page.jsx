'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function DashboardPage() {
  const { data: session } = useSession()

  // Mock data - in real app, this would come from API
  const metrics = [
    { name: 'Total Customers', value: '156', change: '+12%', changeType: 'positive', icon: '👥' },
    { name: 'Active Leads', value: '23', change: '+5%', changeType: 'positive', icon: '🎯' },
    { name: 'Monthly Sales', value: '$45,678', change: '+8%', changeType: 'positive', icon: '💰' },
    { name: 'Inventory Items', value: '1,234', change: '-2%', changeType: 'negative', icon: '📦' },
    { name: 'Employees', value: '89', change: '+3%', changeType: 'positive', icon: '👨‍💼' },
    { name: 'Open Orders', value: '34', change: '+15%', changeType: 'positive', icon: '🛍️' },
  ]

  const quickActions = [
    { name: 'Add Customer', href: '/dashboard/crm/customers/new', icon: '👥', color: 'bg-gradient-to-r from-blue-500 to-blue-600' },
    { name: 'Create Lead', href: '/dashboard/crm/leads/new', icon: '🎯', color: 'bg-gradient-to-r from-green-500 to-green-600' },
    { name: 'New Order', href: '/dashboard/sales/orders/new', icon: '🛍️', color: 'bg-gradient-to-r from-purple-500 to-purple-600' },
    { name: 'Add Product', href: '/dashboard/sales/products/new', icon: '📦', color: 'bg-gradient-to-r from-orange-500 to-orange-600' },
    { name: 'Record Sale', href: '/dashboard/sales/sales/new', icon: '💰', color: 'bg-gradient-to-r from-emerald-500 to-emerald-600' },
    { name: 'Add Employee', href: '/dashboard/hrm/employees/new', icon: '👨‍💼', color: 'bg-gradient-to-r from-indigo-500 to-indigo-600' },
  ]

  const recentActivities = [
    { action: 'New customer registered', time: '2 minutes ago', type: 'customer' },
    { action: 'Order #ORD-2024-001 completed', time: '15 minutes ago', type: 'order' },
    { action: 'Lead "Enterprise Software" qualified', time: '1 hour ago', type: 'lead' },
    { action: 'Inventory updated for Product XYZ', time: '2 hours ago', type: 'inventory' },
    { action: 'New employee onboarded', time: '3 hours ago', type: 'employee' },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {session?.user?.name || 'User'}! 👋
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Here&apos;s what&apos;s happening with your business today.
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Current Time</p>
            <p className="text-lg font-semibold text-gray-900">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric) => (
          <div key={metric.name} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{metric.name}</p>
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
              </div>
              <div className="text-4xl">{metric.icon}</div>
            </div>
            <div className="mt-4 flex items-center">
              <span className={`text-sm font-medium ${
                metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {metric.change}
              </span>
              <span className="text-sm text-gray-500 ml-2">from last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.name}
              href={action.href}
              className="flex flex-col items-center p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 group"
            >
              <div className={`w-14 h-14 ${action.color} rounded-xl flex items-center justify-center mb-3 shadow-md group-hover:shadow-lg transition-shadow duration-200`}>
                <span className="text-white text-2xl">{action.icon}</span>
              </div>
              <span className="text-sm font-medium text-gray-700 text-center group-hover:text-blue-600 transition-colors duration-200">{action.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activities</h2>
        <div className="space-y-3">
          {recentActivities.map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-blue-600 text-lg">
                    {activity.type === 'customer' && '👥'}
                    {activity.type === 'order' && '🛍️'}
                    {activity.type === 'lead' && '🎯'}
                    {activity.type === 'inventory' && '📦'}
                    {activity.type === 'employee' && '👨‍💼'}
                  </span>
                </div>
                <span className="text-sm text-gray-700 font-medium">{activity.action}</span>
              </div>
              <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ERP Module Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">ERP Modules Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/dashboard/crm" className="group">
            <div className="p-6 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-4">👥</span>
                <h3 className="font-semibold text-gray-900">CRM</h3>
              </div>
              <p className="text-sm text-gray-600">Manage customers, leads, and relationships</p>
            </div>
          </Link>

          <Link href="/dashboard/sales" className="group">
            <div className="p-6 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-4">🛍️</span>
                <h3 className="font-semibold text-gray-900">Sales</h3>
              </div>
              <p className="text-sm text-gray-600">Track orders, products, and sales performance</p>
            </div>
          </Link>

          <Link href="/dashboard/inventory" className="group">
            <div className="p-6 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-4">📦</span>
                <h3 className="font-semibold text-gray-900">Inventory</h3>
              </div>
              <p className="text-sm text-gray-600">Monitor stock levels and movements</p>
            </div>
          </Link>

          <Link href="/dashboard/hrm" className="group">
            <div className="p-6 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-4">👨‍💼</span>
                <h3 className="font-semibold text-gray-900">HRM</h3>
              </div>
              <p className="text-sm text-gray-600">Manage employees and departments</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
} 
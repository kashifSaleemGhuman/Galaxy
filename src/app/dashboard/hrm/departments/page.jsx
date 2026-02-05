'use client'

import { useState } from 'react'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import BackButton from '@/components/ui/BackButton'
import { Button } from '@/components/ui/Button'
import { PlusIcon } from '@heroicons/react/24/outline'

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'hrm', label: 'HRM', href: '/dashboard/hrm' },
    { key: 'departments', label: 'Departments', href: '/dashboard/hrm/departments' },
  ]

  // TODO: Implement departments functionality
  // This is a placeholder for future implementation

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BackButton href="/dashboard/hrm" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
            <Breadcrumbs items={breadcrumbs} className="mt-2" />
          </div>
        </div>
        <Button>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Department
        </Button>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-gray-500">Departments management coming soon...</p>
      </div>
    </div>
  )
}


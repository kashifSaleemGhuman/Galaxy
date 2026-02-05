'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HRMCreateEmployeePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to organization employees create page (where the actual functionality is)
    router.replace('/dashboard/organization/employees/create')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  )
}


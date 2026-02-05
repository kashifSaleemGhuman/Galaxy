'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import BackButton from '@/components/ui/BackButton'
import { toast } from '@/components/ui/Toast'
import { DocumentArrowDownIcon, DocumentTextIcon, EyeIcon } from '@heroicons/react/24/outline'
import { ROLES } from '@/lib/constants/roles'

export default function MyDocumentsPage() {
  const { data: session } = useSession()
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterCategory, setFilterCategory] = useState('')

  const isEmployee = session?.user?.role === ROLES.USER

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'my-documents', label: 'My Documents', href: '/dashboard/hrm/my-documents' },
  ]

  useEffect(() => {
    fetchDocuments()
  }, [filterCategory])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      let url = '/api/hrm/documents'
      if (filterCategory) {
        url += `?category=${filterCategory}`
      }

      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to fetch documents')
      const data = await res.json()
      setDocuments(data)
    } catch (error) {
      console.error(error)
      toast({
        title: 'Error',
        description: 'Failed to load documents',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (documentId, fileName) => {
    try {
      const res = await fetch(`/api/hrm/documents/${documentId}/download`)
      if (!res.ok) throw new Error('Failed to get download URL')
      const { url } = await res.json()
      
      // Create a temporary link and trigger download
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast({
        title: 'Success',
        description: 'Document download started'
      })
    } catch (error) {
      console.error(error)
      toast({
        title: 'Error',
        description: 'Failed to download document',
        variant: 'destructive'
      })
    }
  }

  const categories = [
    'OFFER_LETTER',
    'EMPLOYMENT_CONTRACT',
    'APPOINTMENT_LETTER',
    'PROMOTION_LETTER',
    'EXPERIENCE_LETTER',
    'SALARY_CERTIFICATE',
    'WARNING_LETTER',
    'NOTICE_LETTER',
    'CUSTOM'
  ]

  if (!isEmployee) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">This page is only accessible to employees.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BackButton href="/dashboard/hrm" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Documents</h1>
            <Breadcrumbs items={breadcrumbs} className="mt-2" />
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="max-w-xs">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Category
          </label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading documents...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="col-span-full p-8 text-center text-gray-500">
            No documents found.
          </div>
        ) : (
          documents.map((doc) => (
            <div key={doc.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <DocumentTextIcon className="h-8 w-8 text-blue-500 mr-3" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{doc.title}</h3>
                    <p className="text-sm text-gray-500">{doc.fileName}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium mr-2">Category:</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                    {doc.category.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium mr-2">Type:</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    doc.documentType === 'GENERATED' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {doc.documentType}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Date:</span> {new Date(doc.createdAt).toLocaleDateString()}
                </div>
                {doc.description && (
                  <p className="text-sm text-gray-600 mt-2">{doc.description}</p>
                )}
              </div>

              <div className="flex justify-end pt-4 border-t">
                <button
                  onClick={() => handleDownload(doc.id, doc.fileName)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                  Download
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}


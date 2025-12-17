import Link from 'next/link'
import { Table } from '../_components/Table'
import { StatusBadge } from '../_components/StatusBadge'

const rfqs = [
  { id: 'RFQ-001', supplier: 'Acme Supplies', date: '2025-09-01', status: 'Draft' },
  { id: 'RFQ-002', supplier: 'Globex Corp', date: '2025-09-03', status: 'Sent' },
  { id: 'RFQ-003', supplier: 'Initech', date: '2025-09-05', status: 'Received' },
]

export default function RFQsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Requests for Quotation</h2>
        <Link
          href="/dashboard/purchase?newRfq=1"
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-black hover:from-blue-700 hover:to-gray-900 text-white rounded-md text-sm"
        >
          New RFQ
        </Link>
      </div>

      <Table
        columns={[
          { key: 'id', header: 'RFQ', cell: (row) => <Link href={`/dashboard/purchase/rfqs/${row.id}`} className="text-blue-600 hover:underline">{row.id}</Link> },
          { key: 'supplier', header: 'Supplier' },
          { key: 'date', header: 'Date' },
          { key: 'status', header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
        ]}
        data={rfqs}
      />
    </div>
  )
}



import { Table } from '../_components/Table'
import { StatusBadge } from '../_components/StatusBadge'

const bills = [
  { id: 'BILL-301', po: 'PO-101', date: '2025-09-12', amount: 245.0, status: 'Draft' },
  { id: 'BILL-302', po: 'PO-102', date: '2025-09-14', amount: 120.0, status: 'Received' },
]

export default function VendorBillsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Vendor Bills</h2>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm">New Bill</button>
      </div>

      <Table
        columns={[
          { key: 'id', header: 'Bill' },
          { key: 'po', header: 'PO' },
          { key: 'date', header: 'Date' },
          { key: 'amount', header: 'Amount', cell: (row) => `$${row.amount.toFixed(2)}` },
          { key: 'status', header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
        ]}
        data={bills}
      />
    </div>
  )
}



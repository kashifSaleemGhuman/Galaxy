import { Table } from '../_components/Table'
import { StatusBadge } from '../_components/StatusBadge'

const pos = [
  { id: 'PO-101', supplier: 'Acme Supplies', date: '2025-09-06', status: 'Waiting Receipt', total: 245.0 },
  { id: 'PO-102', supplier: 'Umbrella Co', date: '2025-09-08', status: 'To Approve', total: 120.0 },
  { id: 'PO-103', supplier: 'Globex Corp', date: '2025-09-10', status: 'Cancelled', total: 0 },
]

export default function PurchaseOrdersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Purchase Orders</h2>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm">New Purchase Order</button>
      </div>

      <Table
        columns={[
          { key: 'id', header: 'PO' },
          { key: 'supplier', header: 'Supplier' },
          { key: 'date', header: 'Date' },
          { key: 'status', header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
          { key: 'total', header: 'Total', cell: (row) => `$${row.total.toFixed(2)}` },
        ]}
        data={pos}
      />
    </div>
  )
}



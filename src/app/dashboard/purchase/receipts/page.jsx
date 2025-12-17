import { Table } from '../_components/Table'
import { StatusBadge } from '../_components/StatusBadge'

const receipts = [
  { id: 'GR-201', po: 'PO-101', date: '2025-09-09', status: 'Received' },
  { id: 'GR-202', po: 'PO-102', date: '2025-09-11', status: 'Draft' },
]

export default function GoodsReceiptsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Goods Receipts</h2>
        <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-black hover:from-blue-700 hover:to-gray-900 text-white rounded-md text-sm">New Receipt</button>
      </div>

      <Table
        columns={[
          { key: 'id', header: 'Receipt' },
          { key: 'po', header: 'PO' },
          { key: 'date', header: 'Date' },
          { key: 'status', header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
        ]}
        data={receipts}
      />
    </div>
  )
}



import Link from 'next/link'
import { StatusBadge } from '../../_components/StatusBadge'

const mockRfqs = {
  'RFQ-001': {
    id: 'RFQ-001',
    supplier: 'Acme Supplies',
    date: '2025-09-01',
    status: 'Draft',
    lines: [
      { id: 'L1', product: 'Paper A4 80gsm', quantity: 20, price: 24.5 },
      { id: 'L2', product: 'Stapler Heavy Duty', quantity: 5, price: 11.8 },
    ],
  },
  'RFQ-002': {
    id: 'RFQ-002',
    supplier: 'Globex Corp',
    date: '2025-09-03',
    status: 'Sent',
    lines: [
      { id: 'L1', product: 'Printer Ink Black', quantity: 10, price: 33.0 },
    ],
  },
  'RFQ-003': {
    id: 'RFQ-003',
    supplier: 'Initech',
    date: '2025-09-05',
    status: 'Received',
    lines: [
      { id: 'L1', product: 'Paper A4 80gsm', quantity: 30, price: 23.9 },
    ],
  },
}

export default function RFQDetailPage({ params }) {
  const rfq = mockRfqs[params.id]
  if (!rfq) {
    return <div className="text-gray-600">RFQ not found.</div>
  }
  const total = rfq.lines.reduce((sum, l) => sum + l.quantity * l.price, 0)
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{rfq.id}</h2>
          <div className="text-sm text-gray-600 mt-1">Supplier: {rfq.supplier} • Date: {rfq.date}</div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={rfq.status} />
          <button className="px-3 py-2 text-sm border rounded-md">Send</button>
          <button className="px-3 py-2 text-sm border rounded-md">Create PO</button>
        </div>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {rfq.lines.map((l) => (
              <tr key={l.id}>
                <td className="px-4 py-3 text-sm text-gray-700">{l.product}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{l.quantity}</td>
                <td className="px-4 py-3 text-sm text-gray-700">${l.price.toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-gray-700">${(l.quantity * l.price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-end p-4 border-t bg-gray-50">
          <div className="text-right">
            <div className="text-sm text-gray-600">Total</div>
            <div className="text-lg font-semibold text-gray-900">${total.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div>
        <Link href="/dashboard/purchase/rfqs" className="text-sm text-blue-600 hover:underline">Back to RFQs</Link>
      </div>
    </div>
  )
}



import { Table } from '../_components/Table'

const suppliers = [
  { id: 'SUP-001', name: 'Acme Supplies', email: 'sales@acme.com', phone: '+1 555-1001' },
  { id: 'SUP-002', name: 'Globex Corp', email: 'contact@globex.com', phone: '+1 555-1002' },
  { id: 'SUP-003', name: 'Initech', email: 'hello@initech.com', phone: '+1 555-1003' },
]

export default function SuppliersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Suppliers</h2>
        <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-black hover:from-blue-700 hover:to-gray-900 text-white rounded-md text-sm">New Supplier</button>
      </div>

      <Table
        columns={[
          { key: 'id', header: 'ID' },
          { key: 'name', header: 'Name' },
          { key: 'email', header: 'Email' },
          { key: 'phone', header: 'Phone' },
        ]}
        data={suppliers}
      />
    </div>
  )
}



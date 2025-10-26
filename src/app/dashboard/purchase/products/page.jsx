import { Table } from '../_components/Table'

const products = [
  { id: 'PRD-001', name: 'Paper A4 80gsm', description: 'High quality A4 paper', category: 'Office Supplies', unit: 'Box' },
  { id: 'PRD-002', name: 'Stapler Heavy Duty', description: 'Heavy duty stapler for office use', category: 'Office Supplies', unit: 'Unit' },
  { id: 'PRD-003', name: 'Printer Ink Black', description: 'Black ink cartridge for printers', category: 'Electronics', unit: 'Cartridge' },
]

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Products</h2>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm">New Product</button>
      </div>

      <Table
        columns={[
          { key: 'id', header: 'ID' },
          { key: 'name', header: 'Name' },
          { key: 'description', header: 'Description' },
          { key: 'category', header: 'Category' },
          { key: 'unit', header: 'Unit' },
        ]}
        data={products}
      />
    </div>
  )
}



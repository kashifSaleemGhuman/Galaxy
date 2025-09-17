import { Table } from '../_components/Table'

const products = [
  { id: 'PRD-001', name: 'Paper A4 80gsm', sku: 'PA4-80', uom: 'Box', default_price: 25.0 },
  { id: 'PRD-002', name: 'Stapler Heavy Duty', sku: 'STP-HD', uom: 'Unit', default_price: 12.5 },
  { id: 'PRD-003', name: 'Printer Ink Black', sku: 'INK-BLK', uom: 'Cartridge', default_price: 35.0 },
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
          { key: 'sku', header: 'SKU' },
          { key: 'uom', header: 'Unit of Measure' },
          { key: 'default_price', header: 'Default Price', cell: (row) => `$${row.default_price.toFixed(2)}` },
        ]}
        data={products}
      />
    </div>
  )
}



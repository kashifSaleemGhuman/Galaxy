/**
 * DataTable Component Usage Examples
 * 
 * This file demonstrates how to use the reusable DataTable component
 * in different scenarios across your application.
 */

import DataTable from './DataTable'
import { Eye, Edit, Trash2, Star } from 'lucide-react'

// Example 1: Simple Product Table
export function ProductTableExample() {
  const products = [
    { id: 1, name: 'Laptop', price: 999, category: 'Electronics', stock: 50 },
    { id: 2, name: 'Mouse', price: 25, category: 'Electronics', stock: 100 }
  ]

  const columns = [
    { key: 'name', label: 'Product Name' },
    { key: 'price', label: 'Price', render: (item) => `$${item.price}` },
    { key: 'category', label: 'Category' },
    { key: 'stock', label: 'Stock' },
    { key: 'actions', label: 'Actions' }
  ]

  const actions = [
    {
      icon: <Eye className="h-4 w-4" />,
      onClick: (item) => console.log('View product:', item),
      title: 'View',
      className: 'text-blue-600 hover:text-blue-900'
    },
    {
      icon: <Edit className="h-4 w-4" />,
      onClick: (item) => console.log('Edit product:', item),
      title: 'Edit',
      className: 'text-green-600 hover:text-green-900'
    }
  ]

  return (
    <DataTable
      data={products}
      columns={columns}
      actions={actions}
      emptyMessage="No products found"
      emptyIcon="📦"
    />
  )
}

// Example 2: Employee Table with Avatar and Status
export function EmployeeTableExample() {
  const employees = [
    { id: 1, name: 'John Doe', email: 'john@company.com', department: 'Engineering', status: 'active' },
    { id: 2, name: 'Jane Smith', email: 'jane@company.com', department: 'Marketing', status: 'inactive' }
  ]

  const getStatusColor = (status) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }

  const columns = [
    {
      key: 'avatar',
      label: 'Employee',
      avatarBg: 'bg-blue-100',
      avatarColor: 'text-blue-600',
      title: (item) => item.name,
      subtitle: (item) => item.email
    },
    { key: 'department', label: 'Department' },
    {
      key: 'status',
      label: 'Status',
      statusColor: getStatusColor,
      statusText: (item) => item.status
    },
    { key: 'actions', label: 'Actions' }
  ]

  return (
    <DataTable
      data={employees}
      columns={columns}
      actions={[
        {
          icon: <Eye className="h-4 w-4" />,
          onClick: (item) => console.log('View employee:', item),
          title: 'View',
          className: 'text-blue-600 hover:text-blue-900'
        }
      ]}
      selectable={true}
      selectedRows={[]}
      onRowSelect={(id) => console.log('Selected:', id)}
      onSelectAll={() => console.log('Select all')}
    />
  )
}

// Example 3: Orders Table with Currency and Date
export function OrdersTableExample() {
  const orders = [
    { id: 1, customer: 'Acme Corp', amount: 1500, date: '2024-01-15', status: 'completed' },
    { id: 2, customer: 'Tech Inc', amount: 2300, date: '2024-01-16', status: 'pending' }
  ]

  const columns = [
    { key: 'customer', label: 'Customer' },
    {
      key: 'currency',
      label: 'Amount',
      currencyValue: (item) => item.amount
    },
    {
      key: 'date',
      label: 'Order Date',
      dateValue: (item) => item.date
    },
    {
      key: 'status',
      label: 'Status',
      statusColor: (item) => item.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800',
      statusText: (item) => item.status
    },
    { key: 'actions', label: 'Actions' }
  ]

  return (
    <DataTable
      data={orders}
      columns={columns}
      actions={[
        {
          icon: <Eye className="h-4 w-4" />,
          onClick: (item) => console.log('View order:', item),
          title: 'View Order',
          className: 'text-blue-600 hover:text-blue-900'
        }
      ]}
      sortable={true}
      sortColumn="date"
      sortDirection="desc"
      onSort={(column, direction) => console.log('Sort:', column, direction)}
    />
  )
}

// Example 4: Custom Render Function
export function CustomRenderTableExample() {
  const items = [
    { id: 1, name: 'Item 1', rating: 4.5, tags: ['featured', 'popular'] },
    { id: 2, name: 'Item 2', rating: 3.8, tags: ['new'] }
  ]

  const columns = [
    { key: 'name', label: 'Name' },
    {
      key: 'rating',
      label: 'Rating',
      render: (item) => (
        <div className="flex items-center">
          <span className="text-yellow-500">★</span>
          <span className="ml-1">{item.rating}</span>
        </div>
      )
    },
    {
      key: 'tags',
      label: 'Tags',
      render: (item) => (
        <div className="flex space-x-1">
          {item.tags.map(tag => (
            <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {tag}
            </span>
          ))}
        </div>
      )
    },
    { key: 'actions', label: 'Actions' }
  ]

  return (
    <DataTable
      data={items}
      columns={columns}
      actions={[
        {
          icon: <Star className="h-4 w-4" />,
          onClick: (item) => console.log('Favorite:', item),
          title: 'Favorite',
          className: 'text-yellow-600 hover:text-yellow-900'
        }
      ]}
    />
  )
}

/**
 * Key Features of DataTable:
 * 
 * 1. Built-in Column Types:
 *    - avatar: Shows avatar with title/subtitle
 *    - status: Shows status badges with colors
 *    - date: Formats dates automatically
 *    - currency: Formats currency values
 *    - actions: Renders action buttons
 * 
 * 2. Custom Rendering:
 *    - Use render function for complex cells
 *    - Override any column behavior
 * 
 * 3. Selection:
 *    - Enable row selection with checkboxes
 *    - Handle select all functionality
 * 
 * 4. Sorting:
 *    - Enable column sorting
 *    - Handle sort state changes
 * 
 * 5. Actions:
 *    - Configure action buttons per row
 *    - Custom icons, colors, and click handlers
 * 
 * 6. Empty States:
 *    - Custom empty messages and icons
 *    - Loading states
 * 
 * 7. Responsive:
 *    - Horizontal scrolling for mobile
 *    - Consistent styling across devices
 */ 
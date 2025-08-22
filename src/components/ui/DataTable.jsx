'use client'

import { useState } from 'react'
import { 
  Eye, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  ChevronDownIcon,
  ChevronUpIcon
} from 'lucide-react'

/**
 * Reusable DataTable component
 * @param {Object} props
 * @param {Array} props.data - Array of data objects to display
 * @param {Array} props.columns - Array of column configurations
 * @param {Array} props.actions - Array of action configurations
 * @param {boolean} props.selectable - Whether rows can be selected
 * @param {Array} props.selectedRows - Array of selected row IDs
 * @param {Function} props.onRowSelect - Callback when row selection changes
 * @param {Function} props.onSelectAll - Callback when select all changes
 * @param {boolean} props.loading - Whether table is in loading state
 * @param {string} props.emptyMessage - Message to show when no data
 * @param {string} props.emptyIcon - Icon to show when no data
 * @param {Function} props.onRowClick - Callback when row is clicked
 * @param {boolean} props.sortable - Whether columns are sortable
 * @param {string} props.sortColumn - Current sort column
 * @param {string} props.sortDirection - Current sort direction (asc/desc)
 * @param {Function} props.onSort - Callback when sorting changes
 */
export default function DataTable({
  data = [],
  columns = [],
  actions = [],
  selectable = false,
  selectedRows = [],
  onRowSelect,
  onSelectAll,
  loading = false,
  emptyMessage = 'No data found',
  emptyIcon = '📊',
  onRowClick,
  sortable = false,
  sortColumn = '',
  sortDirection = 'asc',
  onSort
}) {
  const [hoveredRow, setHoveredRow] = useState(null)

  const handleSort = (columnKey) => {
    if (!sortable || !onSort) return
    const newDirection = sortColumn === columnKey && sortDirection === 'asc' ? 'desc' : 'asc'
    onSort(columnKey, newDirection)
  }

  const renderCell = (item, column) => {
    if (column.render) {
      return column.render(item, column)
    }

    if (column.key === 'actions') {
      return (
        <div className="flex space-x-2">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation()
                action.onClick(item)
              }}
              className={`${action.className || 'text-gray-600 hover:text-gray-900'} transition-colors`}
              title={action.title}
            >
              {action.icon}
            </button>
          ))}
        </div>
      )
    }

    if (column.key === 'avatar') {
      return (
        <div className="flex items-center">
          <div className={`h-10 w-10 rounded-full ${column.avatarBg || 'bg-blue-100'} flex items-center justify-center`}>
            <span className={`${column.avatarColor || 'text-blue-600'} font-semibold text-sm`}>
              {column.avatarText ? column.avatarText(item) : item.name?.charAt(0) || '?'}
            </span>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {column.title ? column.title(item) : item.name}
            </div>
            {column.subtitle && (
              <div className="text-sm text-gray-500">
                {column.subtitle(item)}
              </div>
            )}
          </div>
        </div>
      )
    }

    if (column.key === 'status') {
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${column.statusColor ? column.statusColor(item) : 'bg-gray-100 text-gray-800'}`}>
          {column.statusIcon ? column.statusIcon(item) : '⚪'} {column.statusText ? column.statusText(item) : item.status}
        </span>
      )
    }

    if (column.key === 'date') {
      return (
        <span className="text-sm text-gray-500">
          {new Date(column.dateValue ? column.dateValue(item) : item.createdAt).toLocaleDateString()}
        </span>
      )
    }

    if (column.key === 'currency') {
      const value = column.currencyValue ? column.currencyValue(item) : item.value
      return (
        <span className="text-sm text-gray-900">
          ${parseFloat(value || 0).toLocaleString()}
        </span>
      )
    }

    // Default text rendering
    const value = column.value ? column.value(item) : item[column.key]
    return (
      <span className={`text-sm ${column.textColor || 'text-gray-900'}`}>
        {value}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400 text-4xl">
            {emptyIcon}
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No data found</h3>
          <p className="mt-1 text-sm text-gray-500">{emptyMessage}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {selectable && (
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === data.length && data.length > 0}
                    onChange={onSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    sortable && column.sortable !== false ? 'cursor-pointer hover:text-gray-700' : ''
                  }`}
                  onClick={() => sortable && column.sortable !== false && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {sortable && column.sortable !== false && sortColumn === column.key && (
                      sortDirection === 'asc' ? (
                        <ChevronUpIcon className="h-4 w-4" />
                      ) : (
                        <ChevronDownIcon className="h-4 w-4" />
                      )
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, index) => (
              <tr
                key={item.id || index}
                className={`hover:bg-gray-50 transition-colors ${
                  onRowClick ? 'cursor-pointer' : ''
                } ${hoveredRow === index ? 'bg-gray-50' : ''}`}
                onClick={() => onRowClick && onRowClick(item)}
                onMouseEnter={() => setHoveredRow(index)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                {selectable && (
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(item.id)}
                      onChange={() => onRowSelect && onRowSelect(item.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                )}
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-6 py-4 ${column.cellClassName || ''} ${
                      column.nowrap !== false ? 'whitespace-nowrap' : ''
                    }`}
                  >
                    {renderCell(item, column)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 
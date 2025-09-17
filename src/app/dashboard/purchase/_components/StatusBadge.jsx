const colorByStatus = {
  Draft: 'bg-gray-100 text-gray-700 border-gray-200',
  Sent: 'bg-blue-100 text-blue-700 border-blue-200',
  Received: 'bg-green-100 text-green-700 border-green-200',
  'To Approve': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Waiting Receipt': 'bg-purple-100 text-purple-700 border-purple-200',
  Cancelled: 'bg-red-100 text-red-700 border-red-200',
}

export function StatusBadge({ status }) {
  const cls = colorByStatus[status] ?? 'bg-gray-100 text-gray-700 border-gray-200'
  return <span className={`text-xs px-2 py-1 rounded-full border ${cls}`}>{status}</span>
}



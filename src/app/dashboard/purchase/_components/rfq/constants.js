export const RFQ_STATUS = {
  DRAFT: 'draft',
  SENT: 'sent',
  RECEIVED: 'received',
  IN_NEGOTIATION: 'in_negotiation',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled'
};

export const PO_STATUS = {
  DRAFT: 'draft',
  SENT: 'sent',
  CONFIRMED: 'confirmed',
  PARTIALLY_RECEIVED: 'partially_received',
  FULLY_RECEIVED: 'fully_received',
  INVOICED: 'invoiced',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const RFQ_STATUS_LABELS = {
  [RFQ_STATUS.DRAFT]: { label: 'Draft', color: 'bg-gray-100 text-gray-800' },
  [RFQ_STATUS.SENT]: { label: 'Sent to Vendor', color: 'bg-blue-100 text-blue-800' },
  [RFQ_STATUS.RECEIVED]: { label: 'Quote Received', color: 'bg-yellow-100 text-yellow-800' },
  [RFQ_STATUS.IN_NEGOTIATION]: { label: 'In Negotiation', color: 'bg-purple-100 text-purple-800' },
  [RFQ_STATUS.ACCEPTED]: { label: 'Accepted', color: 'bg-green-100 text-green-800' },
  [RFQ_STATUS.REJECTED]: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
  [RFQ_STATUS.CANCELLED]: { label: 'Cancelled', color: 'bg-gray-100 text-gray-800' }
};

export const PO_STATUS_LABELS = {
  [PO_STATUS.DRAFT]: { label: 'Draft', color: 'bg-gray-100 text-gray-800' },
  [PO_STATUS.SENT]: { label: 'Sent to Vendor', color: 'bg-blue-100 text-blue-800' },
  [PO_STATUS.CONFIRMED]: { label: 'Confirmed by Vendor', color: 'bg-green-100 text-green-800' },
  [PO_STATUS.PARTIALLY_RECEIVED]: { label: 'Partially Received', color: 'bg-yellow-100 text-yellow-800' },
  [PO_STATUS.FULLY_RECEIVED]: { label: 'Fully Received', color: 'bg-green-100 text-green-800' },
  [PO_STATUS.INVOICED]: { label: 'Invoiced', color: 'bg-purple-100 text-purple-800' },
  [PO_STATUS.COMPLETED]: { label: 'Completed', color: 'bg-green-100 text-green-800' },
  [PO_STATUS.CANCELLED]: { label: 'Cancelled', color: 'bg-red-100 text-red-800' }
};

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { RFQ_STATUS_LABELS } from '../../_components/rfq/constants';

export default function PendingApprovals() {
  const [pendingItems, setPendingItems] = useState({
    rfqs: [],
    purchaseOrders: []
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Pending Approvals</h1>
        <div className="flex gap-2">
          <Button className="bg-blue-100 text-blue-700">RFQs</Button>
          <Button className="bg-gray-100 text-gray-700">Purchase Orders</Button>
        </div>
      </div>

      {/* Pending RFQs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b">
          <h2 className="text-lg font-medium">Pending RFQ Approvals</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">RFQ ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quote Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingItems.rfqs.map((rfq) => (
                <tr key={rfq.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {rfq.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {rfq.vendor}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {rfq.createdBy}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${RFQ_STATUS_LABELS[rfq.status].color}`}>
                      {RFQ_STATUS_LABELS[rfq.status].label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${rfq.quoteAmount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Button className="bg-gradient-to-r from-blue-600 to-black text-white hover:from-blue-700 hover:to-gray-900">
                      Review
                    </Button>
                  </td>
                </tr>
              ))}
              {pendingItems.rfqs.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No pending RFQs require approval
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approval History */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b">
          <h2 className="text-lg font-medium">Recent Approval History</h2>
        </div>
        <div className="p-4">
          <div className="space-y-4">
            {/* Add approval history items here */}
            <div className="text-sm text-gray-500">
              No recent approval history
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

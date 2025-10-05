import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { RFQ_STATUS_LABELS } from './constants';
import RfqFilter from './RfqFilter';

export default function RfqList({ rfqs, onCreateNew, onSelectRfq, activeFilter, onFilterChange }) {
  // Filter RFQs based on selected status
  const filteredRfqs = useMemo(() => {
    if (activeFilter === 'all') return rfqs;
    if (activeFilter === 'late') {
      const now = new Date();
      return rfqs.filter(rfq => {
        const deadline = new Date(rfq.orderDeadline);
        return deadline < now && rfq.status !== RFQ_STATUS.ACCEPTED;
      });
    }
    if (activeFilter === 'lateReceipt') {
      return rfqs.filter(rfq => 
        rfq.status === RFQ_STATUS.SENT && 
        new Date(rfq.sentDate) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days old
      );
    }
    return rfqs.filter(rfq => rfq.status === activeFilter);
  }, [rfqs, activeFilter]);

  // Show message when no RFQs match the filter
  const showNoResults = filteredRfqs.length === 0 && rfqs.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Requests for Quotation</h2>
          <div className="text-sm text-gray-500">
            {activeFilter === 'all' 
              ? `Showing all RFQs (${rfqs.length})`
              : `Showing ${
                  activeFilter === 'late' 
                    ? 'Late RFQs' 
                    : activeFilter === 'lateReceipt' 
                      ? 'Late Receipt RFQs'
                      : RFQ_STATUS_LABELS[activeFilter]?.label + ' RFQs'
                } (${filteredRfqs.length})`
            }
          </div>
        </div>
        <Button
          onClick={onCreateNew}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Create New RFQ
        </Button>
      </div>

      <RfqFilter
        activeFilter={activeFilter}
        onFilterChange={onFilterChange}
      />
      
      {showNoResults ? (
        <div className="text-center py-8 text-gray-500">
          No RFQs found for the selected filter
        </div>
      ) : (

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reference
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vendor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order Deadline
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sent Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Products
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRfqs.map((rfq, index) => (
              <tr 
                key={index} 
                className="hover:bg-gray-50 cursor-pointer" 
                onClick={() => onSelectRfq(rfq)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  RFQ{String(index + 1).padStart(4, '0')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {rfq.vendor}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(rfq.orderDeadline).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {rfq.sentDate ? new Date(rfq.sentDate).toLocaleDateString() : '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <ul className="list-disc list-inside">
                    {rfq.products.map((product, pIndex) => (
                      <li key={pIndex}>
                        {product.name} ({product.quantity} {product.unit})
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${RFQ_STATUS_LABELS[rfq.status].color}`}>
                    {RFQ_STATUS_LABELS[rfq.status].label}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import quotationService from './quotationService';
import { ROLES } from '@/lib/constants/roles';

export default function QuotationDetails({ quotation }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isManager = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SALES_MANAGER].includes(session?.user?.role);
  const isCreator = quotation?.createdById === session?.user?.id;

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await quotationService.submitForApproval(quotation.id);
      router.refresh();
    } catch (err) {
      setError(err.message || 'Failed to submit');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (action, comments) => {
    try {
      setLoading(true);
      await quotationService.approveQuotation(quotation.id, action, comments);
      router.refresh();
    } catch (err) {
      setError(err.message || 'Failed to process approval');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    try {
      setLoading(true);
      await quotationService.sendQuotation(quotation.id);
      router.push(`/dashboard/sales/quotations`);
    } catch (err) {
      setError(err.message || 'Failed to send quotation');
    } finally {
      setLoading(false);
    }
  };

  if (!quotation) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">{quotation.quotationNumber}</h1>
            <p className="text-gray-600 mt-2">
              Status: <span className="font-semibold">{quotation.status}</span>
            </p>
          </div>
          <div className="space-x-2">
            {quotation.status === 'draft' && isCreator && (
              <>
                <button
                  onClick={() => router.push(`/dashboard/sales/quotations/${quotation.id}/edit`)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Submit for Approval
                </button>
              </>
            )}
            {quotation.status === 'rejected' && isCreator && (
              <>
                <button
                  onClick={() => router.push(`/dashboard/sales/quotations/${quotation.id}/edit`)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Resubmit for Approval
                </button>
              </>
            )}
            {quotation.status === 'approved' && (isCreator || isManager) && (
              <button
                onClick={handleSend}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Send to Customer
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Customer Details */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Customer Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Name</p>
            <p className="font-medium">{quotation.customerName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-medium">{quotation.customerEmail}</p>
          </div>
          {quotation.customerPhone && (
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-medium">{quotation.customerPhone}</p>
            </div>
          )}
          {quotation.customerCompanyName && (
            <div>
              <p className="text-sm text-gray-600">Company</p>
              <p className="font-medium">{quotation.customerCompanyName}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-600">Validity Date</p>
            <p className="font-medium">{new Date(quotation.validityDate).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Items</h2>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ex-Factory</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tax</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Freight</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Discount</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {quotation.items?.map((item, index) => (
              <tr key={index}>
                <td className="px-4 py-3 text-sm">{item.productName}</td>
                <td className="px-4 py-3 text-sm text-right">{item.quantity}</td>
                <td className="px-4 py-3 text-sm text-right">${parseFloat(item.exFactoryPrice).toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-right">${parseFloat(item.taxCharges).toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-right">${parseFloat(item.freightCharges).toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-right">${parseFloat(item.discountAmount).toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-right font-medium">${parseFloat(item.finalNetPrice).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Price Summary</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal (Ex-Factory):</span>
            <span>${parseFloat(quotation.totalAmount).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax Charges:</span>
            <span>${parseFloat(quotation.taxAmount).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Freight Charges:</span>
            <span>${parseFloat(quotation.freightCharges).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Discount:</span>
            <span>-${parseFloat(quotation.discountAmount).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xl font-bold border-t pt-2">
            <span>Final Net Price:</span>
            <span>${parseFloat(quotation.finalNetPrice).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Terms and Conditions */}
      {quotation.termsAndConditions && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Terms and Conditions</h2>
          <p className="whitespace-pre-wrap">{quotation.termsAndConditions}</p>
        </div>
      )}

      {/* Approval History */}
      {quotation.approvals && quotation.approvals.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Approval History</h2>
          <div className="space-y-4">
            {quotation.approvals.map((approval, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4">
                <div className="flex justify-between">
                  <span className="font-medium">{approval.approver?.name || 'Manager'}</span>
                  <span className={`px-2 py-1 text-xs rounded ${
                    approval.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {approval.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date(approval.createdAt).toLocaleString()}
                </p>
                {approval.comments && (
                  <p className="text-sm mt-2">{approval.comments}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


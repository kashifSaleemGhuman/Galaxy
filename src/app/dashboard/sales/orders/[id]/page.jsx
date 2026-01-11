'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import quotationService from '../../_components/quotationService';

export default function SalesOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const resolvedParams = await params;
        const response = await quotationService.getSalesOrder(resolvedParams.id);
        setOrder(response.order);
      } catch (err) {
        setError(err.message || 'Failed to load sales order');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [params]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-600 text-center">{error || 'Sales order not found'}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <button
          onClick={() => router.push('/dashboard/sales/orders')}
          className="text-blue-600 hover:text-blue-800"
        >
          ← Back to Orders
        </button>
      </div>

      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
            <p className="text-gray-600 mt-2">
              Status: <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </p>
          </div>
          {order.quotation && (
            <div className="text-right">
              <p className="text-sm text-gray-600">From Quotation</p>
              <button
                onClick={() => router.push(`/dashboard/sales/quotations/${order.quotation.id}`)}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                {order.quotation.quotationNumber}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Customer Details */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-bold mb-4">Customer Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Name</p>
            <p className="font-medium">{order.customerName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-medium">{order.customerEmail}</p>
          </div>
          {order.customerPhone && (
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-medium">{order.customerPhone}</p>
            </div>
          )}
          {order.customerCompanyName && (
            <div>
              <p className="text-sm text-gray-600">Company</p>
              <p className="font-medium">{order.customerCompanyName}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-600">Warehouse</p>
            <p className="font-medium">{order.warehouse?.name || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Created</p>
            <p className="font-medium">{new Date(order.createdAt).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-bold mb-4">Order Items</h2>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ex-Factory</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tax</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Freight</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {order.items?.map((item, index) => (
              <tr key={index}>
                <td className="px-4 py-3 text-sm">{item.productName}</td>
                <td className="px-4 py-3 text-sm text-right">{item.quantity}</td>
                <td className="px-4 py-3 text-sm text-right">${parseFloat(item.exFactoryPrice).toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-right">${parseFloat(item.taxCharges).toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-right">${parseFloat(item.freightCharges).toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-right font-medium">${parseFloat(item.finalNetPrice).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-bold mb-4">Price Summary</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal (Ex-Factory):</span>
            <span>${parseFloat(order.totalAmount).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax Charges:</span>
            <span>${parseFloat(order.taxAmount).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Freight Charges:</span>
            <span>${parseFloat(order.freightCharges).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Discount:</span>
            <span>-${parseFloat(order.discountAmount).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xl font-bold border-t pt-2">
            <span>Final Net Price:</span>
            <span>${parseFloat(order.finalNetPrice).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Stock Movements */}
      {order.stockMovements && order.stockMovements.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Inventory Movements</h2>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Warehouse</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {order.stockMovements.map((movement, index) => (
                <tr key={index}>
                  <td className="px-4 py-3 text-sm">{movement.product?.name || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm">{movement.warehouse?.name || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm text-right">{Math.abs(movement.quantity)}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-800">
                      {movement.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{new Date(movement.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

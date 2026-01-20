'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api/service';
import quotationService from './quotationService';

export default function CreateSalesOrderModal({ quotation, isOpen, onClose, onSuccess }) {
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inventoryStatus, setInventoryStatus] = useState({});

  useEffect(() => {
    if (isOpen && quotation) {
      fetchWarehouses();
    }
  }, [isOpen, quotation?.id]); // Only depend on quotation ID, not the whole object

  useEffect(() => {
    if (isOpen && quotation && selectedWarehouse) {
      checkInventory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWarehouse]); // Only re-check when warehouse changes

  const fetchWarehouses = async () => {
    try {
      const response = await api.get('/api/inventory/warehouses?limit=100');
      setWarehouses(response.warehouses || []);
      if (response.warehouses && response.warehouses.length > 0) {
        setSelectedWarehouse(response.warehouses[0].id);
      }
    } catch (err) {
      console.error('Error fetching warehouses:', err);
      setError('Failed to load warehouses');
    }
  };

  const checkInventory = async () => {
    if (!quotation?.items || !selectedWarehouse) return;

    const status = {};
    for (const item of quotation.items) {
      if (item.productId) {
        try {
          const response = await api.get(
            `/api/inventory/products/${item.productId}/stock-availability?warehouseId=${selectedWarehouse}`
          );
          const available = response.warehouseBreakdown?.[0]?.available || 0;
          status[item.id] = {
            available,
            required: item.quantity,
            sufficient: available >= item.quantity
          };
        } catch (err) {
          console.error(`Error checking inventory for item ${item.id}:`, err);
          status[item.id] = {
            available: 0,
            required: item.quantity,
            sufficient: false
          };
        }
      } else {
        status[item.id] = {
          available: null,
          required: item.quantity,
          sufficient: true // No productId means no inventory check needed
        };
      }
    }
    setInventoryStatus(status);
  };

  // Removed duplicate useEffect - inventory check is already handled above

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedWarehouse) {
      setError('Please select a warehouse');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await quotationService.createSalesOrderFromQuotation(quotation.id, selectedWarehouse);
      onSuccess?.();
      onClose();
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to create sales order';
      const insufficientStock = err.response?.data?.insufficientStock;
      
      if (insufficientStock) {
        const stockDetails = insufficientStock
          .map(item => `${item.productName}: Required ${item.required}, Available ${item.available}`)
          .join('\n');
        setError(`Insufficient stock:\n${stockDetails}`);
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const allItemsHaveStock = Object.values(inventoryStatus).every(
    status => status.sufficient !== false
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Create Sales Order</h2>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4 whitespace-pre-line">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Warehouse *
              </label>
              <select
                value={selectedWarehouse}
                onChange={(e) => setSelectedWarehouse(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Select a warehouse</option>
                {warehouses.map(warehouse => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.name} ({warehouse.code})
                  </option>
                ))}
              </select>
            </div>

            {quotation?.items && quotation.items.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Inventory Status</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Required</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Available</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {quotation.items.map((item) => {
                        const status = inventoryStatus[item.id] || { available: null, required: item.quantity, sufficient: true };
                        return (
                          <tr key={item.id}>
                            <td className="px-4 py-2 text-sm">{item.productName}</td>
                            <td className="px-4 py-2 text-sm text-right">{item.quantity}</td>
                            <td className="px-4 py-2 text-sm text-right">
                              {status.available !== null ? status.available : 'N/A'}
                            </td>
                            <td className="px-4 py-2 text-center">
                              {status.available === null ? (
                                <span className="text-gray-500">No product ID</span>
                              ) : status.sufficient ? (
                                <span className="text-green-600 font-medium">✓ Available</span>
                              ) : (
                                <span className="text-red-600 font-medium">✗ Insufficient</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !selectedWarehouse || !allItemsHaveStock}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Sales Order'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

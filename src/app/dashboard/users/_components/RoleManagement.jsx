'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ROLES, ROLE_PERMISSIONS } from '@/lib/constants/roles';

export default function RoleManagement() {
  const [selectedRole, setSelectedRole] = useState('');
  const [showPermissions, setShowPermissions] = useState(false);

  const renderPermissionsList = (permissions) => {
    return Object.entries(permissions).map(([category, perms]) => (
      <div key={category} className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          {category.replace(/_/g, ' ').toUpperCase()}
        </h4>
        <ul className="space-y-1">
          {Object.entries(perms).map(([key, value]) => (
            <li key={key} className="flex items-center text-sm text-gray-600">
              <svg
                className="h-4 w-4 text-green-500 mr-2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7"></path>
              </svg>
              {key.replace(/_/g, ' ')}
            </li>
          ))}
        </ul>
      </div>
    ));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium">Role Permissions</h2>
        <Button
          onClick={() => setShowPermissions(!showPermissions)}
          className="bg-gray-100 hover:bg-gray-200"
        >
          {showPermissions ? 'Hide Permissions' : 'Show Permissions'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Role Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Role to View Permissions
          </label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="">Select a role</option>
            {Object.entries(ROLES).map(([key, value]) => (
              <option key={value} value={value}>
                {key.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Role Description */}
        <div>
          {selectedRole && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Role Description</h3>
              <p className="text-sm text-gray-600">
                {selectedRole === ROLES.SUPER_ADMIN && 
                  'Full system access with ability to manage all aspects of the application.'}
                {selectedRole === ROLES.ADMIN &&
                  'Administrative access to manage users and system settings.'}
                {selectedRole === ROLES.PURCHASE_MANAGER &&
                  'Manage purchase operations, approve RFQs and purchase orders.'}
                {selectedRole === ROLES.PURCHASE_USER &&
                  'Create and manage RFQs and basic purchase operations.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Permissions List */}
      {showPermissions && selectedRole && (
        <div className="mt-6 border-t pt-6">
          <h3 className="text-lg font-medium mb-4">Permissions for {selectedRole.replace(/_/g, ' ')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderPermissionsList(ROLE_PERMISSIONS)}
          </div>
        </div>
      )}
    </div>
  );
}

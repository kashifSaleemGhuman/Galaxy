import React from 'react';
import { Button } from '@/components/ui/Button';
import { RFQ_STATUS_LABELS } from './constants';

export default function RfqFilter({ activeFilter, onFilterChange }) {
  return (
    <div className="flex gap-2 mb-4">
      <Button
        onClick={() => onFilterChange('all')}
        className={`${
          activeFilter === 'all'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        All RFQs
      </Button>
      {Object.entries(RFQ_STATUS_LABELS).map(([status, { label }]) => (
        <Button
          key={status}
          onClick={() => onFilterChange(status)}
          className={`${
            activeFilter === status
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}

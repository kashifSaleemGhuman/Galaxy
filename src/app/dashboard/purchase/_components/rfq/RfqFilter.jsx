import React from 'react';
import { Button } from '@/components/ui/Button';
import { RFQ_STATUS_LABELS } from './constants';

export default function RfqFilter({ activeFilter, onFilterChange }) {
  return (
    <div className="flex gap-2 mb-4">
      <Button
        onClick={() => onFilterChange('all')}
        variant={activeFilter === 'all' ? 'default' : 'outline'}
        className={`${activeFilter === 'all' ? '' : 'text-black'}`}
      >
        All RFQs
      </Button>
      {Object.entries(RFQ_STATUS_LABELS).map(([status, { label }]) => (
        <Button
          key={status}
          onClick={() => onFilterChange(status)}
          size={status === 'cancelled' ? 'sm' : 'default'}
          variant={activeFilter === status ? 'default' : 'outline'}
          className={`${activeFilter === status ? '' : 'text-black'}`}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}

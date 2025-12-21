'use client';

import { useRouter } from 'next/navigation';
import QuotationList from '../_components/QuotationList';

export default function QuotationsPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Sales Quotations</h1>
        <button
          onClick={() => router.push('/dashboard/sales/quotations/create')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Create New Quotation
        </button>
      </div>
      <QuotationList />
    </div>
  );
}


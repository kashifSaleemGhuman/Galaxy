'use client';

import { useRouter } from 'next/navigation';
import QuotationForm from '../../_components/QuotationForm';

export default function CreateQuotationPage() {
  const router = useRouter();

  const handleSubmit = () => {
    router.push('/dashboard/sales/quotations');
  };

  const handleCancel = () => {
    router.push('/dashboard/sales/quotations');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Create Sales Quotation</h1>
      <QuotationForm onSubmit={handleSubmit} onCancel={handleCancel} />
    </div>
  );
}


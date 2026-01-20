'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import quotationService from '../../../_components/quotationService';
import QuotationForm from '../../../_components/QuotationForm';

export default function EditQuotationPage() {
  const params = useParams();
  const router = useRouter();
  const [quotation, setQuotation] = useState(null);
  const [quotationId, setQuotationId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuotation = async () => {
      try {
        const resolvedParams = await params;
        const id = resolvedParams.id;
        setQuotationId(id);
        const data = await quotationService.getQuotation(id);
        setQuotation(data.quotation);
      } catch (err) {
        setError(err.message || 'Failed to load quotation');
      } finally {
        setLoading(false);
      }
    };

    fetchQuotation();
  }, [params]);

  const handleSubmit = () => {
    if (quotationId) {
      router.push(`/dashboard/sales/quotations/${quotationId}`);
      router.refresh();
    }
  };

  const handleCancel = () => {
    if (quotationId) {
      router.push(`/dashboard/sales/quotations/${quotationId}`);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (error || !quotation) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-600 text-center">{error || 'Quotation not found'}</div>
      </div>
    );
  }

  // Check if quotation can be edited
  if (!['draft', 'rejected'].includes(quotation.status)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-600 text-center">
          This quotation cannot be edited. Only draft or rejected quotations can be edited.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Edit Sales Quotation</h1>
      <QuotationForm quotation={quotation} onSubmit={handleSubmit} onCancel={handleCancel} />
    </div>
  );
}


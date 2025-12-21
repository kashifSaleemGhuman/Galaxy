'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import quotationService from '../../_components/quotationService';
import QuotationDetails from '../../_components/QuotationDetails';

export default function QuotationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuotation = async () => {
      try {
        const resolvedParams = await params;
        const data = await quotationService.getQuotation(resolvedParams.id);
        setQuotation(data.quotation);
      } catch (err) {
        setError(err.message || 'Failed to load quotation');
      } finally {
        setLoading(false);
      }
    };

    fetchQuotation();
  }, [params]);

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

  return (
    <div className="container mx-auto px-4 py-8">
      <QuotationDetails quotation={quotation} />
    </div>
  );
}


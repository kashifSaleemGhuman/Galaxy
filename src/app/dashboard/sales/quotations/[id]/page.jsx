'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import quotationService from '../../_components/quotationService';
import QuotationDetails from '../../_components/QuotationDetails';

export default function QuotationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchedIdRef = useRef(null);

  // Extract ID from params - handle both Promise and object cases
  const [quotationId, setQuotationId] = useState(null);
  
  useEffect(() => {
    const resolveParams = async () => {
      if (params instanceof Promise) {
        const resolved = await params;
        setQuotationId(resolved?.id);
      } else {
        setQuotationId(params?.id);
      }
    };
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (!quotationId) return;
    
    // Prevent re-fetching if we already have this quotation loaded
    if (fetchedIdRef.current === quotationId && quotation) {
      return;
    }
    
    const fetchQuotation = async () => {
      try {
        fetchedIdRef.current = quotationId;
        setLoading(true);
        setError(null);
        const data = await quotationService.getQuotation(quotationId);
        setQuotation(data.quotation);
      } catch (err) {
        setError(err.message || 'Failed to load quotation');
        setQuotation(null);
      } finally {
        setLoading(false);
      }
    };

    fetchQuotation();
  }, [quotationId]);

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


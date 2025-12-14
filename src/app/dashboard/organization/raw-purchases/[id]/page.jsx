'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function RawPurchaseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [purchase, setPurchase] = useState(null);
  const [toast, setToast] = useState(null);

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'organization', label: 'Organization', href: '/dashboard/organization' },
    { key: 'raw-purchases', label: 'Raw Purchases', href: '/dashboard/organization/raw-purchases' },
    { key: 'detail', label: 'Product Details', href: '#' },
  ];

  useEffect(() => {
    if (params.id) {
      fetchPurchaseDetail();
    }
  }, [params.id]);

  const fetchPurchaseDetail = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/organization/raw-purchases');
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to fetch purchase details');
      }
      const result = await res.json();
      const foundPurchase = result.data?.find(p => p.id === params.id);
      
      if (!foundPurchase) {
        throw new Error('Purchase record not found');
      }
      
      setPurchase(foundPurchase);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setToast({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbs} />
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbs} />
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-gray-500">Purchase record not found.</p>
          <Button onClick={() => router.push('/dashboard/organization/raw-purchases')} className="mt-4">
            Back to Raw Purchases
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbs} />
      
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Details</h1>
          <p className="mt-1 text-sm text-gray-500">
            Traceability information for {purchase.productName}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/organization/raw-purchases')}
          className="flex items-center gap-2"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Basic Information */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Purchase Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500">Invoice Number</label>
            <p className="mt-1 text-sm text-gray-900">{purchase.invoiceNo}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Invoice Date</label>
            <p className="mt-1 text-sm text-gray-900">
              {new Date(purchase.invoiceDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Supplier</label>
            <p className="mt-1 text-sm text-gray-900">{purchase.supplier}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Product Name</label>
            <p className="mt-1 text-sm text-gray-900">{purchase.productName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Category</label>
            <p className="mt-1 text-sm text-gray-900">{purchase.category || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Unit</label>
            <p className="mt-1 text-sm text-gray-900">{purchase.unit}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Quantity Ordered</label>
            <p className="mt-1 text-sm text-gray-900">{purchase.quantityOrdered} {purchase.unit}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Quantity Received</label>
            <p className="mt-1 text-sm text-gray-900">{purchase.quantityReceived} {purchase.unit}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Price</label>
            <p className="mt-1 text-sm text-gray-900">${purchase.price.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Product Details */}
      {purchase.productDescription && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Description</h2>
          <p className="text-sm text-gray-700">{purchase.productDescription}</p>
        </div>
      )}

      {/* Traceability Questions & Answers */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Traceability Questions & Answers</h2>
        
        {(() => {
          // Get all traceability questions from product definition
          const allQuestions = purchase.traceabilityQuestions || [];
          
          // Create a map of answers by questionId for quick lookup
          const answersMap = new Map();
          if (purchase.traceabilityAnswers && Array.isArray(purchase.traceabilityAnswers)) {
            purchase.traceabilityAnswers.forEach(answer => {
              const questionId = answer.questionId || answer.id;
              if (questionId) {
                answersMap.set(questionId, answer);
              }
            });
          }

          // Combine questions with their answers
          const questionsWithAnswers = allQuestions.map((question, index) => {
            const questionId = question.id || question.questionId;
            const answer = answersMap.get(questionId);
            return {
              question: question,
              answer: answer,
              index: index + 1
            };
          });

          if (questionsWithAnswers.length === 0) {
            return (
              <div className="text-center py-8">
                <p className="text-gray-500">No traceability questions defined for this product.</p>
              </div>
            );
          }

          return (
            <div className="space-y-4">
              {questionsWithAnswers.map((item) => {
                const question = item.question;
                const answer = item.answer;
                const questionText = question.prompt || question.question || 'N/A';
                const answerText = answer?.answer || 'No answer provided';
                const answerType = answer?.type || question.type || 'text';

                return (
                  <div key={question.id || item.index} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                    <div className="mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Question {item.index}
                        {question.required !== false && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </label>
                      <p className="mt-1 text-sm text-gray-900 font-medium">
                        {questionText}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mt-3">
                        Answer
                      </label>
                      <p className={`mt-1 text-sm p-3 rounded-md ${
                        answerText === 'No answer provided' 
                          ? 'text-gray-500 bg-gray-100 italic' 
                          : 'text-gray-900 bg-gray-50'
                      }`}>
                        {answerText}
                      </p>
                    </div>
                    {answerType && (
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Type: {answerType}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>

      {/* Custom Fields */}
      {purchase.customFields && Object.keys(purchase.customFields).length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(purchase.customFields).map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-500 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <p className="mt-1 text-sm text-gray-900">{String(value) || 'N/A'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Information */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500">Animal</label>
            <p className="mt-1 text-sm text-gray-900 font-medium">{purchase.animal}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Origin</label>
            <p className="mt-1 text-sm text-gray-900 font-medium">{purchase.origin}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Weight</label>
            <p className="mt-1 text-sm text-gray-900 font-medium">{purchase.weight || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Square Feet (Approx)</label>
            <p className="mt-1 text-sm text-gray-900 font-medium">{purchase.sqFtApprox || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}


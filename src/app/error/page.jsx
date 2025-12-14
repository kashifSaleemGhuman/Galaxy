'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams?.get('error') || null;

  const getErrorMessage = (error) => {
    switch (error) {
      case 'Configuration':
        return 'There is a problem with the server configuration. Please try again later.';
      case 'AccessDenied':
        return 'Access denied. You do not have permission to sign in.';
      case 'Verification':
        return 'The verification token has expired or has already been used.';
      case 'Default':
        return 'An error occurred during authentication. Please try again.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Authentication Error
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {getErrorMessage(error)}
          </p>
        </div>
        
        <div className="mt-8 space-y-4">
          <Link href="/login">
            <Button className="w-full">
              Try Again
            </Button>
          </Link>
          
          <div className="text-center">
            <Link 
              href="/" 
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Return to Home
            </Link>
          </div>
        </div>
        
        {process.env.NODE_ENV === 'development' && error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">
              <strong>Debug Info:</strong> Error type: {error}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Loading...</h2>
        </div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}

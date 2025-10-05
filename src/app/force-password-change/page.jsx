'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import ChangePassword from '../dashboard/users/_components/ChangePassword';

export default function ForcePasswordChangePage() {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/login');
    },
  });

  useEffect(() => {
    console.log('Force password change page:', {
      status,
      isFirstLogin: session?.user?.isFirstLogin
    });
  }, [status, session]);

  useEffect(() => {
    // If user has already changed password, redirect to dashboard
    if (status === 'authenticated' && !session?.user?.isFirstLogin) {
      router.replace('/dashboard');
    }
  }, [status, session, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-bold text-gray-900 mb-2">
          Galaxy ERP
        </h1>
        <h2 className="text-center text-xl text-gray-600">
          Change Your Password
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <ChangePassword isFirstLogin={true} />
      </div>
    </div>
  );
}

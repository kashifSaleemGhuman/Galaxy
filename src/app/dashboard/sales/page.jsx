"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function SalesOverviewPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (status === 'authenticated' && session?.user?.role) {
      setIsRedirecting(true);
      
      // Redirect all sales users to polling page
      router.push('/dashboard/sales/polling');
    }
  }, [router, session, status]);

  if (status === 'loading' || !isRedirecting) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to sales dashboard...</p>
      </div>
    </div>
  );
}


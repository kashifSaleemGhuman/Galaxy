"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function PurchaseOverviewPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (status === 'authenticated' && session?.user?.role) {
      setIsRedirecting(true);
      
      // Check if user is a manager
      const isManager = ['super_admin', 'admin', 'purchase_manager'].includes(session.user.role);
      
      if (isManager) {
        // Managers go to polling page
        router.push('/dashboard/purchase/polling');
      } else {
        // Regular users go directly to dashboard with polling
        router.push('/dashboard/purchase/user-dashboard');
      }
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
        <p className="text-gray-600">Redirecting to purchase dashboard...</p>
      </div>
    </div>
  );
}
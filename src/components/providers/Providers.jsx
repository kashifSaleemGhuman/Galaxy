'use client'

import { SessionProvider } from './SessionProvider'
import NotificationToast from '@/components/NotificationToast'
import { ToastContainer } from '@/components/ui/Toast'

export function Providers({ children }) {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-gray-50">
        {children}
        <NotificationToast />
        <ToastContainer />
      </div>
    </SessionProvider>
  )
}


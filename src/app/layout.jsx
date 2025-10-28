import './globals.css'
import { SessionProvider } from '@/components/providers/SessionProvider'
import NotificationToast from '@/components/NotificationToast'

export const metadata = {
  title: 'Galaxy ERP System',
  description: 'Comprehensive Enterprise Resource Planning System',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true} className="font-sans">
        <SessionProvider>
          <div className="min-h-screen bg-gray-50">
            {children}
            <NotificationToast />
          </div>
        </SessionProvider>
      </body>
    </html>
  )
} 
import './globals.css'
import { Providers } from '@/components/providers/Providers'

export const metadata = {
  title: 'Galaxy ERP System',
  description: 'Comprehensive Enterprise Resource Planning System',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true} className="font-sans">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
} 
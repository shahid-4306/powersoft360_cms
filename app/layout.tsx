import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { Toaster } from "react-hot-toast";
import { AuthProvider } from '@/contexts/AuthContext'
import { CustomerAuthProvider } from '@/contexts/CustomerAuthContext'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'Power-CMS - Modern Complaint Management System',
  description: 'Streamline your complaint resolution process with AI-powered efficiency from Powersoft360',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={geist.variable}>
      <body className={`${geist.className} antialiased`}>
        <AuthProvider>
          <CustomerAuthProvider>
            <Toaster position="top-right" reverseOrder={false} />
            {children}
          </CustomerAuthProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

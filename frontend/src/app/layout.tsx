import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import Navigation from '@/components/Navigation' // If you created the Navigation component

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DevFlow - Developer Portfolio & Code Review Platform',
  description: 'Showcase your projects, get peer reviews, and discover opportunities',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Navigation />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
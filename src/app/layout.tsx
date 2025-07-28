import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { SessionProviderWrapper } from '@/components/SessionProviderWrapper'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#3B82F6',
}

export const metadata: Metadata = {
  title: 'AI Toolbox - Your Ultimate AI Tools Collection',
  description: 'Discover and use the best AI tools for productivity, creativity, and problem-solving. Free AI tools for everyone.',
  keywords: 'AI tools, artificial intelligence, productivity tools, free AI, chatbot, image generation, text analysis',
  authors: [{ name: 'AI Toolbox Team' }],
  creator: 'AI Toolbox',
  publisher: 'AI Toolbox',
  robots: 'index, follow',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'AI Toolbox - Your Ultimate AI Tools Collection',
    description: 'Discover and use the best AI tools for productivity, creativity, and problem-solving.',
    url: 'https://ai-toolbox.com',
    siteName: 'AI Toolbox',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AI Toolbox - Your Ultimate AI Tools Collection',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Toolbox - Your Ultimate AI Tools Collection',
    description: 'Discover and use the best AI tools for productivity, creativity, and problem-solving.',
    images: ['/og-image.jpg'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: '#3B82F6',
          colorBackground: '#ffffff',
          colorInputBackground: '#f9fafb',
          colorInputText: '#111827',
          colorText: '#111827',
          colorTextSecondary: '#6b7280',
          borderRadius: '0.5rem',
          fontFamily: 'Inter, system-ui, sans-serif',
        },
        elements: {
          formButtonPrimary: {
            backgroundColor: '#3B82F6',
            '&:hover': {
              backgroundColor: '#2563eb',
            },
          },
          card: {
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
          headerTitle: {
            fontSize: '1.5rem',
            fontWeight: '600',
          },
          headerSubtitle: {
            fontSize: '0.875rem',
            color: '#6b7280',
          },
        },
      }}
    >
      <html lang="en">
        <body className={inter.className}>
          <SessionProviderWrapper>
            {children}
          </SessionProviderWrapper>
        </body>
      </html>
    </ClerkProvider>
  )
}

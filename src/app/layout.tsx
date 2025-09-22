import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import GlobalNotificationProvider from '@/components/GlobalNotificationProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Toolbox - Your Ultimate AI Tools Collection',
  description: 'Discover and use the best AI tools for productivity, creativity, and problem-solving. Free AI tools for everyone.',
  authors: [{ name: 'AI Toolbox Team' }],
  keywords: ['AI tools', 'artificial intelligence', 'productivity tools', 'free AI', 'chatbot', 'image generation', 'text analysis'],
  creator: 'AI Toolbox',
  publisher: 'AI Toolbox',
  robots: 'index, follow',
  openGraph: {
    title: 'AI Toolbox - Your Ultimate AI Tools Collection',
    description: 'Discover and use the best AI tools for productivity, creativity, and problem-solving.',
    url: 'https://ai-toolbox.com',
    siteName: 'AI Toolbox',
    locale: 'en_US',
    images: [
      {
        url: 'http://localhost:3000/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AI Toolbox - Your Ultimate AI Tools Collection',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Toolbox - Your Ultimate AI Tools Collection',
    description: 'Discover and use the best AI tools for productivity, creativity, and problem-solving.',
    images: ['http://localhost:3000/og-image.jpg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <GlobalNotificationProvider>
            {children}
          </GlobalNotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

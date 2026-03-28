import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import GlobalNotificationProvider from '@/components/GlobalNotificationProvider';
import AnalyticsProvider from '@/components/AnalyticsProvider';
import FeedbackWidget from '@/components/feedback/FeedbackWidget';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

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
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('theme');var d=document.documentElement;if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme:dark)').matches)){d.classList.add('dark')}else{d.classList.remove('dark')}}catch(e){}})()` }} />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <GlobalNotificationProvider>
            <AnalyticsProvider>
              {children}
              {/* <FeedbackWidget /> */}
            </AnalyticsProvider>
          </GlobalNotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

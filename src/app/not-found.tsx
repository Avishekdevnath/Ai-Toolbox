import Link from 'next/link';
import Navbar from '@/components/Navbar';
import NewFooter from '@/components/NewFooter';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-gray-300">404</h1>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
            <p className="text-gray-600 mb-8">
              Sorry, the page you're looking for doesn't exist or has been moved.
            </p>
          </div>
          
          <div className="space-y-4">
            <Link 
              href="/"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go Home
            </Link>
            
            <div className="text-sm text-gray-500">
              <p>Or try one of our popular tools:</p>
              <div className="mt-2 space-x-4">
                <Link href="/tools/swot-analysis" className="text-blue-600 hover:underline">
                  SWOT Analysis
                </Link>
                <Link href="/tools/finance-advisor" className="text-blue-600 hover:underline">
                  Finance Advisor
                </Link>
                <Link href="/tools/qr-generator" className="text-blue-600 hover:underline">
                  QR Generator
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <NewFooter />
    </div>
  );
} 
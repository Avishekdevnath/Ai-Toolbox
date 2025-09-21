import Link from 'next/link';
import Navbar from '@/components/Navbar';
import NewFooter from '@/components/NewFooter';

export default function ComingSoon() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="max-w-2xl w-full text-center px-4">
          <div className="mb-8">
            <div className="text-8xl mb-6">🚀</div>
            <h1 className="text-6xl font-bold text-gray-900 mb-4">Coming Soon</h1>
            <h2 className="text-2xl font-semibold text-gray-700 mb-6">
              Exciting new features are on the way!
            </h2>
            <p className="text-gray-600 text-lg mb-8">
              We're working hard to bring you amazing new tools and features. 
              Stay tuned for updates and be the first to experience what's coming next.
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              What's Coming Next
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🤖</span>
                <span className="text-gray-700">Advanced AI Interview Tools</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">📊</span>
                <span className="text-gray-700">Enhanced Analytics Dashboard</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">💰</span>
                <span className="text-gray-700">Tax Optimization Tools</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">📱</span>
                <span className="text-gray-700">Mobile App</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🔗</span>
                <span className="text-gray-700">API Integrations</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🎯</span>
                <span className="text-gray-700">Personalized Recommendations</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <Link 
              href="/"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
            >
              Explore Current Tools
            </Link>
            
            <div className="text-sm text-gray-500">
              <p>In the meantime, check out our existing tools:</p>
              <div className="mt-3 space-x-6">
                <Link href="/tools/swot-analysis" className="text-blue-600 hover:underline">
                  SWOT Analysis
                </Link>
                <Link href="/tools/finance-advisor" className="text-blue-600 hover:underline">
                  Finance Advisor
                </Link>
                <Link href="/tools/qr-generator" className="text-blue-600 hover:underline">
                  QR Generator
                </Link>
                <Link href="/tools/url-shortener" className="text-blue-600 hover:underline">
                  URL Shortener
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

import ToolAnalyticsDashboard from '@/components/analytics/ToolAnalyticsDashboard';
import Navbar from '@/components/Navbar';
import NewFooter from '@/components/NewFooter';

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Analytics Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Comprehensive insights into tool usage, user behavior, and system performance.
            </p>
          </div>
          <ToolAnalyticsDashboard />
        </div>
      </main>
      <NewFooter />
    </div>
  );
} 
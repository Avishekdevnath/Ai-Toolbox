import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { redirect } from 'next/navigation';
import AnalyticsDashboard from '@/components/dashboard/AnalyticsDashboard';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default async function AnalyticsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('user_session')?.value;
  const claims = token ? verifyAccessToken(token) : null;
  if (!claims) redirect('/sign-in');

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">
          Detailed insights into your tool usage and performance metrics.
        </p>
      </div>

      <Suspense fallback={<LoadingSpinner text="Loading analytics..." />}>
        <AnalyticsDashboard userId={claims.id} />
      </Suspense>
    </div>
  );
} 
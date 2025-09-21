import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { redirect } from 'next/navigation';
import ToolsAnalytics from '@/components/dashboard/ToolsAnalytics';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default async function ToolsAnalyticsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('user_session')?.value;
  const claims = token ? verifyAccessToken(token) : null;
  if (!claims) redirect('/sign-in');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tools Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">
          Detailed analytics and insights for your tool usage.
        </p>
      </div>

      <Suspense fallback={<LoadingSpinner text="Loading analytics..." />}>
        <ToolsAnalytics userId={claims.id} />
      </Suspense>
    </div>
  );
} 
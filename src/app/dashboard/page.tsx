import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { redirect } from 'next/navigation';
import DashboardOverview from '@/components/dashboard/DashboardOverview';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('user_session')?.value;
  const claims = token ? verifyAccessToken(token) : null;
  if (!claims) redirect('/sign-in');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back! Here's what's happening with your account.
        </p>
      </div>

      <Suspense fallback={
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" text="Loading dashboard data..." />
        </div>
      }>
        <DashboardOverview userId={claims.id} />
      </Suspense>
    </div>
  );
} 
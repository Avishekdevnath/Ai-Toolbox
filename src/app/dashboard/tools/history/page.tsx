import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { redirect } from 'next/navigation';
import UserToolHistory from '@/components/dashboard/UserToolHistory';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default async function ToolsHistoryPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('user_session')?.value;
  const claims = token ? verifyAccessToken(token) : null;
  if (!claims) redirect('/sign-in');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tool Usage History</h1>
        <p className="mt-1 text-sm text-gray-500">See your recent tool runs and outcomes.</p>
      </div>

      <Suspense fallback={<LoadingSpinner text="Loading usage..." />}> 
        <UserToolHistory userId={claims.id} />
      </Suspense>
    </div>
  );
}

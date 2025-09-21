import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { redirect } from 'next/navigation';
import AdminOverview from '@/components/dashboard/AdminOverview';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('user_session')?.value;
  const claims = token ? verifyAccessToken(token) : null;
  if (!claims) redirect('/sign-in');
  if (claims.role !== 'admin') redirect('/dashboard');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
        <p className="mt-1 text-sm text-gray-500">
          System administration and management dashboard.
        </p>
      </div>

      <Suspense fallback={<LoadingSpinner text="Loading admin data..." />}>
        <AdminOverview userId={claims.id} />
      </Suspense>
    </div>
  );
} 
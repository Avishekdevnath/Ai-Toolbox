import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { redirect } from 'next/navigation';
import AnalyticsTabs from '@/components/forms/AnalyticsTabs';

export default async function FormAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('user_session')?.value;
  const claims = token ? verifyAccessToken(token) : null;
  if (!claims) redirect('/sign-in');

  const { id } = await params;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Form Analytics</h1>
        <p className="text-sm text-gray-600 mt-1">
          Comprehensive insights and AI-powered analysis of your form responses
        </p>
      </div>

      <AnalyticsTabs formId={id} />
    </div>
  );
}



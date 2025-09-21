import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { redirect } from 'next/navigation';
import FormsList from '@/components/forms/FormsList';

export default async function ArchivedFormsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('user_session')?.value;
  const claims = token ? verifyAccessToken(token) : null;
  if (!claims) redirect('/sign-in');
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Archived Forms</h1>
        <p className="mt-1 text-sm text-gray-500">Forms that have been archived (soft-deleted).</p>
      </div>
      <FormsList statusFilter="archived" />
    </div>
  );
}




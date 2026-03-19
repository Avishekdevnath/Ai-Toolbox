import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import SecuritySettings from '@/components/dashboard/settings/SecuritySettings';
import { verifyAccessToken } from '@/lib/auth/jwt';

export default async function SecuritySettingsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('user_session')?.value;
  const claims = token ? verifyAccessToken(token) : null;

  if (!claims) {
    redirect('/sign-in');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Security Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage the recovery questions used for password reset and account verification.
        </p>
      </div>

      <SecuritySettings />
    </div>
  );
}

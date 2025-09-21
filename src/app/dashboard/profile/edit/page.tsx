import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { redirect } from 'next/navigation';
import UserSettings from '@/components/dashboard/UserSettings';

export default async function ProfileEditPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('user_session')?.value;
  const claims = token ? verifyAccessToken(token) : null;
  if (!claims) redirect('/sign-in');

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Edit Profile</h1>
          <p className="mt-1 text-sm text-gray-500">Update your profile information and settings.</p>
        </div>
      </div>
      <UserSettings userId={claims.id} />
    </div>
  );
}



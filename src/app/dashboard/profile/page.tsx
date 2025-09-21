import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { redirect } from 'next/navigation';
import ProfileView from '@/components/dashboard/ProfileView';

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('user_session')?.value;
  const claims = token ? verifyAccessToken(token) : null;
  if (!claims) redirect('/sign-in');

  return (
    <ProfileView />
  );
}



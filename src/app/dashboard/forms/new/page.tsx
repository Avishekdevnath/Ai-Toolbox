import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { redirect } from 'next/navigation';
import FormCreationFlow from '@/components/forms/FormCreationFlow';

export default async function NewFormPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('user_session')?.value;
  const claims = token ? verifyAccessToken(token) : null;
  if (!claims) redirect('/sign-in');

  return <FormCreationFlow />;
}



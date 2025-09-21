import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { redirect } from 'next/navigation';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('user_session')?.value;
  const claims = token ? verifyAccessToken(token) : null;
  if (!claims) redirect('/sign-in');

  return (
    <div className="h-screen w-screen overflow-hidden bg-white">
      <div className="h-full w-full grid grid-cols-[16rem_1fr] min-h-0">
        <DashboardSidebar />
        <div className="flex flex-col h-full min-w-0 min-h-0">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto p-3 bg-gray-50">{children}</main>
        </div>
      </div>
    </div>
  );
} 
import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { redirect } from 'next/navigation';
import UserManagement from '@/components/dashboard/UserManagement';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default async function AdminUsersPage() {
	const cookieStore = await cookies();
	const token = cookieStore.get('user_session')?.value;
	const claims = token ? verifyAccessToken(token) : null;
	if (!claims) {
		redirect('/sign-in');
	}
	if (claims.role !== 'admin' && claims.role !== 'super_admin') {
		redirect('/dashboard');
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold text-gray-900">User Management</h1>
				<p className="mt-1 text-sm text-gray-500">
					Manage user accounts, roles, and permissions.
				</p>
			</div>

			<Suspense fallback={<LoadingSpinner text="Loading users..." />}>
				<UserManagement userId={claims.id} />
			</Suspense>
		</div>
	);
} 
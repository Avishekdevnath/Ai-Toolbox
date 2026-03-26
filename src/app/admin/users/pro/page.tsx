import UserManagement from '@/components/admin/UserManagement';

export default function ProUsersPage() {
  return (
    <UserManagement
      pageTitle="Pro User Management"
      pageSubtitle="Manage pro user accounts and their access state"
      fixedRole="user"
      fixedUserType="pro"
      hideCreateButton={true}
    />
  );
}

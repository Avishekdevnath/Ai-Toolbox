'use client';

import { useState, useEffect } from 'react';
import { Users, Plus, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import UserEditModal from './UserEditModal';
import UserCreateModal from './UserCreateModal';
import UserFilters from './UserFilters';
import UserTable from './UserTable';
import UserDetailModal from './UserDetailModal';

interface User {
  _id: string;
  email: string;
  username?: string;
  firstName: string;
  lastName: string;
  role: string;
  userType?: string;
  status: string;
  clerkId?: string;
  createdAt: string;
  updatedAt: string;
  activity?: { toolUsageCount?: number; lastActivity?: string | null; toolsUsed?: number; isActive?: boolean };
  isAdmin?: boolean;
  permissions?: string[];
  lastLoginAt?: string;
}

export interface UserManagementProps {
  userId?: string;
  pageTitle?: string;
  pageSubtitle?: string;
  fixedRole?: string;
  fixedUserType?: string;
  hideCreateButton?: boolean;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
}

export default function UserManagement({
  pageTitle = 'User Management',
  pageSubtitle = 'Manage all registered users, roles, and permissions',
  fixedRole,
  fixedUserType,
  hideCreateButton = false,
}: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [sortBy] = useState('createdAt');
  const [sortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams({ page: page.toString(), limit: '10', search: searchTerm, status: statusFilter, role: fixedRole || roleFilter, sortBy, sortOrder });
      if (fixedUserType) {
        params.set('userType', fixedUserType);
      }
      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();
      if (data.success) {
        const regularUsers = data.data.users || [];
        const adminUsers = data.data.adminUsers || [];
        const transformedAdminUsers = adminUsers.map((adminUser: any) => ({
          _id: adminUser._id, email: adminUser.email, username: adminUser.username || '', firstName: adminUser.firstName || '', lastName: adminUser.lastName || '',
          role: adminUser.role, status: adminUser.isActive ? 'active' : 'inactive', clerkId: adminUser._id.toString(),
          userType: adminUser.userType || 'admin',
          createdAt: adminUser.createdAt, updatedAt: adminUser.updatedAt, isAdmin: true,
          permissions: adminUser.permissions || [], lastLoginAt: adminUser.lastLoginAt,
          activity: { toolUsageCount: 0, lastActivity: adminUser.lastLoginAt, toolsUsed: 0, isActive: adminUser.isActive }
        }));
        const userMap = new Map();
        regularUsers.forEach((u: User) => userMap.set(u._id, u));
        transformedAdminUsers.forEach((au: User) => {
          if (!userMap.has(au._id)) { userMap.set(au._id, au); }
          else {
            const ex = userMap.get(au._id);
            userMap.set(au._id, { ...ex, ...au, role: ex.role === 'admin' || ex.role === 'super_admin' ? ex.role : au.role });
          }
        });
        const filteredUsers = Array.from(userMap.values()).filter((user: any) => {
          if (fixedUserType && user.userType !== fixedUserType) return false;
          if (fixedRole && user.role !== fixedRole) return false;
          return true;
        });
        const allUsers = filteredUsers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setUsers(allUsers);
        setPagination(data.data.pagination);
      } else { setError(data.error || 'Failed to fetch users'); }
    } catch { setError('Failed to fetch users. Please try again.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(currentPage); }, [currentPage, searchTerm, statusFilter, roleFilter, sortBy, sortOrder]);

  const handleUserAction = async (userId: string, action: string) => {
    try {
      setError(''); setSuccessMessage('');
      if (action === 'suspend' || action === 'activate') {
        const res = await fetch(`/api/admin/users/${userId}/actions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) });
        const data = await res.json();
        if (data.success) { setSuccessMessage(data.message); fetchUsers(currentPage); }
        else setError(data.error || 'Action failed');
      } else if (action === 'delete') {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
        const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) { setSuccessMessage('User deleted successfully'); fetchUsers(currentPage); }
        else setError(data.error || 'Action failed');
      }
    } catch { setError('Failed to perform action. Please try again.'); }
  };

  const handleEditUser = async (userId: string, userData: any) => {
    const res = await fetch(`/api/admin/users/${userId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(userData) });
    const data = await res.json();
    if (data.success) { setSuccessMessage('User updated successfully'); fetchUsers(currentPage); setTimeout(() => setSuccessMessage(''), 3000); }
    else throw new Error(data.error || 'Failed to update user');
  };

  const handleCreateUser = async (userData: any) => {
    const res = await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(userData) });
    const data = await res.json();
    if (data.success) { setSuccessMessage('User created successfully'); fetchUsers(currentPage); setTimeout(() => setSuccessMessage(''), 3000); }
    else throw new Error(data.error || 'Failed to create user');
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 gap-2 text-slate-500">
        <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
        <span className="text-[13px]">Loading users...</span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">{pageTitle}</h1>
          <p className="text-[12px] text-slate-400 mt-0.5">{pageSubtitle}</p>
        </div>
        {!hideCreateButton && (
          <button onClick={() => setShowCreateModal(true)} className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium px-3 py-2 rounded-lg transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add User
          </button>
        )}
      </div>

      {successMessage && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-[13px] text-green-700">
          <CheckCircle className="w-4 h-4 flex-shrink-0" /> {successMessage}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-[13px] text-red-700">
          <XCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      <UserFilters
        searchTerm={searchTerm} onSearchChange={setSearchTerm}
        statusFilter={statusFilter} onStatusChange={setStatusFilter}
        roleFilter={roleFilter} onRoleChange={setRoleFilter}
        onSearch={() => { setCurrentPage(1); fetchUsers(1); }}
        onClear={() => { setSearchTerm(''); setStatusFilter(''); setRoleFilter(''); setCurrentPage(1); }}
      />

      <UserTable
        users={users} pagination={pagination} currentPage={currentPage}
        onPageChange={setCurrentPage}
        onView={(u) => { setSelectedUser(u); setShowUserModal(true); }}
        onEdit={(u) => { setSelectedUser(u); setShowEditModal(true); }}
        onAction={handleUserAction}
        onCreateFirst={() => setShowCreateModal(true)}
      />

      <UserDetailModal
        user={selectedUser} isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        onEdit={() => { setShowUserModal(false); setShowEditModal(true); }}
      />
      <UserEditModal user={selectedUser} isOpen={showEditModal} onClose={() => { setShowEditModal(false); setSelectedUser(null); }} onSave={handleEditUser} />
      <UserCreateModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onCreate={handleCreateUser} />
    </div>
  );
}

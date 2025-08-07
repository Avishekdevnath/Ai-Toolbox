'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { 
  Users, 
  Search, 
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from 'lucide-react';

interface User {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
  totalUsage: number;
}

interface CreateUserData {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  password: string;
  status: string;
}

export default function UserManagementPage() {
  const { isAuthenticated, isSuperAdmin, isLoading } = useAdminAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [createUserData, setCreateUserData] = useState<CreateUserData>({
    email: '',
    firstName: '',
    lastName: '',
    role: 'user',
    password: '',
    status: 'active'
  });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && isSuperAdmin) {
      fetchUsers();
    }
  }, [isAuthenticated, isSuperAdmin, currentPage, searchTerm, filterRole]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: searchTerm,
        role: filterRole
      });

      const response = await fetch(`/api/admin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (data.success) {
        // Fix: Access nested data structure
        setUsers(data.data.users || []);
        setTotalPages(data.data.pagination?.totalPages || 1);
        setTotalUsers(data.data.pagination?.totalUsers || 0);
      } else {
        console.error('API Error:', data.error);
        setUsers([]);
        setTotalPages(1);
        setTotalUsers(0);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
      setTotalPages(1);
      setTotalUsers(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (role: string) => {
    setFilterRole(role);
    setCurrentPage(1);
  };

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) return;

    setActionLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/users/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action,
          userIds: selectedUsers
        })
      });

      const data = await response.json();
      if (data.success) {
        setSelectedUsers([]);
        fetchUsers();
        alert(`Bulk ${action} completed successfully. ${data.affectedCount} users affected.`);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
      alert('Error performing bulk action');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: string) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: action === 'delete' ? 'DELETE' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: action !== 'delete' ? JSON.stringify({ action }) : undefined
      });

      const data = await response.json();
      if (data.success) {
        fetchUsers();
        alert(`User ${action} completed successfully`);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error performing user action:', error);
      alert('Error performing user action');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateUser = async () => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(createUserData)
      });

      const data = await response.json();
      if (data.success) {
        setShowCreateModal(false);
        setCreateUserData({
          email: '',
          firstName: '',
          lastName: '',
          role: 'user',
          password: '',
          status: 'active'
        });
        fetchUsers();
        alert('User created successfully');
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Error creating user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === (users?.length || 0)) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user._id));
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'moderator':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'user':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500" />
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading User Management..." />
      </div>
    );
  }

  if (!isAuthenticated || !isSuperAdmin) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage user accounts, roles, and permissions
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchUsers}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button 
            size="sm"
            onClick={() => setShowCreateModal(true)}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="role-filter" className="text-sm font-medium">Role:</Label>
              <select
                id="role-filter"
                value={filterRole}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="all">All Roles</option>
                <option value="user">User</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {(selectedUsers?.length || 0) > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {selectedUsers.length} user(s) selected
              </span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('activate')}
                  disabled={actionLoading}
                >
                  Activate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('deactivate')}
                  disabled={actionLoading}
                >
                  Deactivate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('delete')}
                  disabled={actionLoading}
                  className="text-red-600 hover:text-red-700"
                >
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({users?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner text="Loading users..." />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === (users?.length || 0) && (users?.length || 0) > 0}
                        onChange={handleSelectAll}
                        className="rounded"
                      />
                    </th>
                    <th className="text-left p-2">User</th>
                    <th className="text-left p-2">Role</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Usage</th>
                    <th className="text-left p-2">Created</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(users || []).map((user) => (
                    <tr key={user._id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user._id)}
                          onChange={() => handleSelectUser(user._id)}
                          className="rounded"
                        />
                      </td>
                      <td className="p-2">
                        <div>
                          <div className="font-medium">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="p-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(user.isActive)}
                          <span className={user.isActive ? 'text-green-600' : 'text-red-600'}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>
                      <td className="p-2">
                        <span className="text-sm text-gray-600">
                          {user.totalUsage} uses
                        </span>
                      </td>
                      <td className="p-2">
                        <span className="text-sm text-gray-600">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingUser(user);
                              setShowEditModal(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUserAction(user._id, user.isActive ? 'deactivate' : 'activate')}
                            disabled={actionLoading}
                          >
                            {user.isActive ? <XCircle className="w-4 h-4 text-red-500" /> : <CheckCircle className="w-4 h-4 text-green-500" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this user?')) {
                                handleUserAction(user._id, 'delete');
                              }
                            }}
                            disabled={actionLoading}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New User</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={createUserData.email}
                  onChange={(e) => setCreateUserData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={createUserData.firstName}
                    onChange={(e) => setCreateUserData(prev => ({ ...prev, firstName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={createUserData.lastName}
                    onChange={(e) => setCreateUserData(prev => ({ ...prev, lastName: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={createUserData.password}
                  onChange={(e) => setCreateUserData(prev => ({ ...prev, password: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role">Role</Label>
                  <select
                    id="role"
                    value={createUserData.role}
                    onChange={(e) => setCreateUserData(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="user">User</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={createUserData.status}
                    onChange={(e) => setCreateUserData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateUser}
                disabled={actionLoading || !createUserData.email || !createUserData.firstName || !createUserData.lastName || !createUserData.password}
              >
                {actionLoading ? 'Creating...' : 'Create User'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Mail, 
  Calendar, 
  Crown, 
  Shield, 
  User,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  Lock,
  Unlock
} from 'lucide-react';
import Modal, { ModalHeader, ModalContent, ModalFooter } from '@/components/ui/modal';

interface AdminUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'super_admin' | 'admin' | 'moderator';
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  loginAttempts?: number;
  lockUntil?: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
}

export default function AdminUserManagement() {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchAdminUsers = async (page = 1) => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: searchTerm,
        status: statusFilter,
        role: roleFilter,
        sortBy,
        sortOrder
      });

      const response = await fetch(`/api/admin/admin-users?${params}`);
      const data = await response.json();

      if (data.success) {
        setAdminUsers(data.data.adminUsers || []);
        setPagination(data.data.pagination);
      } else {
        setError(data.error || 'Failed to fetch admin users');
      }
    } catch (error) {
      console.error('Error fetching admin users:', error);
      setError('Failed to fetch admin users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminUsers(currentPage);
  }, [currentPage, searchTerm, statusFilter, roleFilter, sortBy, sortOrder]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchAdminUsers(1);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setRoleFilter('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  const handleAdminAction = async (userId: string, action: string) => {
    try {
      setError('');
      setSuccessMessage('');
      
      if (action === 'suspend' || action === 'activate') {
        const response = await fetch(`/api/admin/admin-users/${userId}/actions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action })
        });

        const data = await response.json();

        if (data.success) {
          setSuccessMessage(data.message);
          fetchAdminUsers(currentPage);
        } else {
          setError(data.error || 'Action failed');
        }
      } else if (action === 'unlock') {
        const response = await fetch(`/api/admin/admin-users/${userId}/unlock`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();

        if (data.success) {
          setSuccessMessage('Admin user unlocked successfully');
          fetchAdminUsers(currentPage);
        } else {
          setError(data.error || 'Unlock failed');
        }
      } else if (action === 'delete') {
        if (!confirm('Are you sure you want to delete this admin user? This action cannot be undone.')) return;
        
        const response = await fetch(`/api/admin/admin-users/${userId}`, {
          method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
          setSuccessMessage('Admin user deleted successfully');
          fetchAdminUsers(currentPage);
        } else {
          setError(data.error || 'Delete failed');
        }
      }
    } catch (error) {
      console.error('Error performing admin action:', error);
      setError('Failed to perform action. Please try again.');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-blue-500" />;
      case 'moderator':
        return <User className="w-4 h-4 text-green-500" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (isActive: boolean, lockUntil?: string) => {
    if (lockUntil && new Date(lockUntil) > new Date()) {
      return <Badge variant="destructive" className="text-xs">Locked</Badge>;
    }
    return isActive ? 
      <Badge variant="default" className="text-xs bg-green-100 text-green-800">Active</Badge> : 
      <Badge variant="secondary" className="text-xs">Inactive</Badge>;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPermissionCount = (permissions: string[]) => {
    return permissions?.length || 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin User Management</h1>
          <p className="text-gray-600 mt-1">
            Manage administrator accounts, roles, and permissions
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Admin User
        </Button>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <span className="text-green-700">{successMessage}</span>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search admin users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="locked">Locked</option>
            </select>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
            </select>

            <div className="flex gap-2">
              <Button onClick={handleSearch} variant="outline" size="sm">
                Search
              </Button>
              <Button onClick={handleClearFilters} variant="outline" size="sm">
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Admin Users
            <Badge variant="secondary" className="ml-2">
              {adminUsers.length}
            </Badge>
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            Manage administrator accounts and their permissions
          </p>
        </CardHeader>
        <CardContent>
          {adminUsers.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No admin users found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter || roleFilter 
                  ? 'Try adjusting your search or filters'
                  : 'Get started by creating your first admin user'
                }
              </p>
              {!searchTerm && !statusFilter && !roleFilter && (
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Admin User
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold">Admin User</th>
                      <th className="text-left py-3 px-4 font-semibold">Role</th>
                      <th className="text-left py-3 px-4 font-semibold">Status</th>
                      <th className="text-left py-3 px-4 font-semibold">Permissions</th>
                      <th className="text-left py-3 px-4 font-semibold">Last Login</th>
                      <th className="text-left py-3 px-4 font-semibold">Created</th>
                      <th className="text-left py-3 px-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminUsers.map((user) => (
                      <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {user.firstName} {user.lastName}
                              <Badge variant="outline" className="text-xs">
                                Admin
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {getRoleIcon(user.role)}
                            <span className="capitalize">{user.role.replace('_', ' ')}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(user.isActive, user.lockUntil)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            <span className="font-medium">{getPermissionCount(user.permissions)}</span> permissions
                            {user.permissions && user.permissions.length > 0 && (
                              <div className="text-xs text-gray-500 mt-1">
                                {user.permissions.slice(0, 3).join(', ')}
                                {user.permissions.length > 3 && ` +${user.permissions.length - 3} more`}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-500">
                            {formatDate(user.lastLoginAt || '')}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Calendar className="w-3 h-3" />
                            {formatDate(user.createdAt)}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setShowUserModal(true);
                              }}
                              title="View Details"
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setShowEditModal(true);
                              }}
                              title="Edit Admin User"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            {/* Suspend/Activate button */}
                            {user.isActive ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAdminAction(user._id, 'suspend')}
                                title="Suspend Admin User"
                                className="text-orange-600 hover:text-orange-700"
                              >
                                Suspend
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAdminAction(user._id, 'activate')}
                                title="Activate Admin User"
                                className="text-green-600 hover:text-green-700"
                              >
                                Activate
                              </Button>
                            )}
                            {/* Unlock button for locked accounts */}
                            {user.lockUntil && new Date(user.lockUntil) > new Date() && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAdminAction(user._id, 'unlock')}
                                title="Unlock Admin User"
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Unlock className="w-3 h-3" />
                              </Button>
                            )}
                            {/* Delete button - only for non-super_admin */}
                            {user.role !== 'super_admin' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAdminAction(user._id, 'delete')}
                                title="Delete Admin User"
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-500">
                    Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.currentPage * pagination.limit, pagination.totalUsers)} of{' '}
                    {pagination.totalUsers} admin users
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={!pagination.hasPrevPage}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={!pagination.hasNextPage}
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Modals would go here - similar to UserManagement but for admin users */}
      {/* For now, we'll show a placeholder */}
      {showCreateModal && (
        <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)}>
          <ModalHeader>Create Admin User</ModalHeader>
          <ModalContent>
            <p className="text-gray-600 mb-4">Admin user creation modal will be implemented here.</p>
          </ModalContent>
          <ModalFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button>Create</Button>
          </ModalFooter>
        </Modal>
      )}

      {showEditModal && selectedUser && (
        <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)}>
          <ModalHeader>Edit Admin User</ModalHeader>
          <ModalContent>
            <p className="text-gray-600 mb-4">Edit admin user modal will be implemented here.</p>
          </ModalContent>
          <ModalFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button>Save</Button>
          </ModalFooter>
        </Modal>
      )}

      {showUserModal && selectedUser && (
        <Modal isOpen={showUserModal} onClose={() => setShowUserModal(false)}>
          <ModalHeader>Admin User Details</ModalHeader>
          <ModalContent>
            <p className="text-gray-600 mb-4">Admin user details modal will be implemented here.</p>
          </ModalContent>
          <ModalFooter>
            <Button variant="outline" onClick={() => setShowUserModal(false)}>
              Close
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
} 
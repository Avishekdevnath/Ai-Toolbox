'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  User,
  Shield,
  Crown,
  Activity,
  Calendar,
  Mail,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import UserEditModal from './UserEditModal';
import UserCreateModal from './UserCreateModal';
import Modal, { ModalHeader, ModalContent, ModalFooter } from '@/components/ui/modal';

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  clerkId: string;
  createdAt: string;
  updatedAt: string;
  activity?: {
    toolUsageCount: number;
    lastActivity: string | null;
    toolsUsed: number;
    isActive: boolean;
  };
  isAdmin?: boolean; // Added for admin users
  permissions?: string[]; // Added for admin users
  lastLoginAt?: string; // Added for admin users
}

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
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
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
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: searchTerm,
        status: statusFilter,
        role: roleFilter,
        sortBy,
        sortOrder
      });

      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();

      if (data.success) {
        // Combine regular users and admin users
        const regularUsers = data.data.users || [];
        const adminUsers = data.data.adminUsers || [];
        
        console.log('📊 Fetched data:', {
          regularUsers: regularUsers.length,
          adminUsers: adminUsers.length,
          regularUserIds: regularUsers.map(u => u._id),
          adminUserIds: adminUsers.map(u => u._id)
        });
        
        // Transform admin users to match user format
        const transformedAdminUsers = adminUsers.map((adminUser: any) => ({
          _id: adminUser._id,
          email: adminUser.email,
          firstName: adminUser.firstName || '',
          lastName: adminUser.lastName || '',
          role: adminUser.role,
          status: adminUser.isActive ? 'active' : 'inactive',
          clerkId: adminUser._id.toString(),
          createdAt: adminUser.createdAt,
          updatedAt: adminUser.updatedAt,
          isAdmin: true, // Flag to identify admin users
          permissions: adminUser.permissions || [],
          lastLoginAt: adminUser.lastLoginAt,
          activity: {
            toolUsageCount: 0,
            lastActivity: adminUser.lastLoginAt,
            toolsUsed: 0,
            isActive: adminUser.isActive
          }
        }));

        // Combine and deduplicate users by ID, then sort by creation date
        const userMap = new Map();
        
        // Add regular users first
        regularUsers.forEach(user => {
          userMap.set(user._id, user);
        });
        
        // Add admin users, but don't overwrite existing ones to avoid duplicates
        transformedAdminUsers.forEach(adminUser => {
          if (!userMap.has(adminUser._id)) {
            userMap.set(adminUser._id, adminUser);
          } else {
            // If user exists as both regular and admin, merge the data
            const existingUser = userMap.get(adminUser._id);
            userMap.set(adminUser._id, {
              ...existingUser,
              ...adminUser,
              // Preserve original role if it's more specific
              role: existingUser.role === 'admin' || existingUser.role === 'super_admin' 
                ? existingUser.role 
                : adminUser.role
            });
          }
        });
        
        const allUsers = Array.from(userMap.values()).sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        console.log('🔄 Final users:', {
          totalUsers: allUsers.length,
          userIds: allUsers.map(u => u._id),
          uniqueIds: [...new Set(allUsers.map(u => u._id))].length
        });

        setUsers(allUsers);
        setPagination(data.data.pagination);
      } else {
        setError(data.error || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage, searchTerm, statusFilter, roleFilter, sortBy, sortOrder]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchUsers(1);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setRoleFilter('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  const handleUserAction = async (userId: string, action: string) => {
    try {
      setError('');
      setSuccessMessage('');
      
      if (action === 'suspend' || action === 'activate') {
        const response = await fetch(`/api/admin/users/${userId}/actions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action })
        });

        const data = await response.json();

        if (data.success) {
          setSuccessMessage(data.message);
          fetchUsers(currentPage); // Refresh the list
        } else {
          setError(data.error || 'Action failed');
        }
      } else {
        // Handle other actions (delete, etc.)
        let response;
        
        switch (action) {
          case 'delete':
            if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
            response = await fetch(`/api/admin/users/${userId}`, {
              method: 'DELETE'
            });
            break;
          default:
            setError('Invalid action');
            return;
        }

        const data = await response.json();

        if (data.success) {
          setSuccessMessage(`User ${action === 'delete' ? 'deleted' : action} successfully`);
          fetchUsers(currentPage);
        } else {
          setError(data.error || 'Action failed');
        }
      }
    } catch (error) {
      console.error('Error performing user action:', error);
      setError('Failed to perform action. Please try again.');
    }
  };

  const handleEditUser = async (userId: string, userData: any) => {
    try {
      setError('');
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      const data = await response.json();
      if (data.success) {
        setSuccessMessage('User updated successfully');
        fetchUsers(currentPage);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        throw new Error(data.error || 'Failed to update user');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update user');
    }
  };

  const handleCreateUser = async (userData: any) => {
    try {
      setError('');
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      const data = await response.json();
      if (data.success) {
        setSuccessMessage('User created successfully');
        fetchUsers(currentPage);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        throw new Error(data.error || 'Failed to create user');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create user');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-green-500" />;
      case 'moderator':
        return <Shield className="w-4 h-4 text-blue-500" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Inactive</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Suspended</Badge>;
      case 'deleted':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Deleted</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading users...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            User Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage all registered users, roles, and permissions
          </p>
        </div>
        <Button 
          className="flex items-center gap-2"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="w-4 h-4" />
          Add User
        </Button>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="p-4 bg-green-100 border border-green-300 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-700">{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-100 border border-red-300 rounded-lg flex items-center gap-2">
          <XCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users..."
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
              <option value="suspended">Suspended</option>
              <option value="deleted">Deleted</option>
            </select>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Roles</option>
              <option value="user">Regular User</option>
              <option value="moderator">Moderator</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
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

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            All Users
            <Badge variant="secondary" className="ml-2">
              {users.length}
            </Badge>
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            Manage all users including regular users and administrators
          </p>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter || roleFilter 
                  ? 'Try adjusting your search or filters'
                  : 'Get started by creating your first user'
                }
              </p>
              {!searchTerm && !statusFilter && !roleFilter && (
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First User
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold">User</th>
                      <th className="text-left py-3 px-4 font-semibold">Role</th>
                      <th className="text-left py-3 px-4 font-semibold">Status</th>
                      <th className="text-left py-3 px-4 font-semibold">Activity</th>
                      <th className="text-left py-3 px-4 font-semibold">Joined</th>
                      <th className="text-left py-3 px-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, index) => (
                      <tr key={`${user._id}-${index}`} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {user.firstName} {user.lastName}
                              {user.isAdmin && (
                                <Badge variant="outline" className="text-xs">
                                  Admin
                                </Badge>
                              )}
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
                          {getStatusBadge(user.status)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            <div className="flex items-center gap-1">
                              <Activity className="w-3 h-3" />
                              {user.activity?.toolUsageCount || 0} tools used
                            </div>
                            {user.activity?.lastActivity && (
                              <div className="text-gray-500 text-xs">
                                Last: {formatDate(user.activity.lastActivity)}
                              </div>
                            )}
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
                              title="Edit User"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            {/* Suspend/Activate button for all users */}
                            {user.status === 'active' ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUserAction(user._id, 'suspend')}
                                title="Suspend User"
                                className="text-orange-600 hover:text-orange-700"
                              >
                                Suspend
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUserAction(user._id, 'activate')}
                                title="Activate User"
                                className="text-green-600 hover:text-green-700"
                              >
                                Activate
                              </Button>
                            )}
                            {/* Delete button only for non-admin users */}
                            {!user.isAdmin && user.role !== 'super_admin' && user.role !== 'admin' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUserAction(user._id, 'delete')}
                                title="Delete User"
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
                    {pagination.totalUsers} users
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

      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <Modal isOpen={showUserModal} onClose={() => setShowUserModal(false)}>
          <ModalHeader className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">User Details</h2>
            <Button variant="outline" size="sm" onClick={() => setShowUserModal(false)}>
              ×
            </Button>
          </ModalHeader>
          <ModalContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p>{selectedUser.firstName} {selectedUser.lastName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p>{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Role</label>
                  <div className="flex items-center gap-2">
                    {getRoleIcon(selectedUser.role)}
                    <span className="capitalize">{selectedUser.role.replace('_', ' ')}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div>{getStatusBadge(selectedUser.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Joined</label>
                  <p>{formatDate(selectedUser.createdAt)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Updated</label>
                  <p>{formatDate(selectedUser.updatedAt)}</p>
                </div>
              </div>

              {selectedUser.activity && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Activity (Last 7 Days)</label>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedUser.activity.toolUsageCount}
                      </div>
                      <div className="text-sm text-gray-500">Tools Used</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="text-2xl font-bold text-green-600">
                        {selectedUser.activity.toolsUsed}
                      </div>
                      <div className="text-sm text-gray-500">Unique Tools</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="text-2xl font-bold text-orange-600">
                        {selectedUser.activity.isActive ? 'Yes' : 'No'}
                      </div>
                      <div className="text-sm text-gray-500">Active</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ModalContent>
          <ModalFooter>
            <Button variant="outline" onClick={() => setShowUserModal(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setShowUserModal(false);
                setShowEditModal(true);
              }}
            >
              Edit User
            </Button>
          </ModalFooter>
        </Modal>
      )}

      {/* User Edit Modal */}
      <UserEditModal
        user={selectedUser}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedUser(null);
        }}
        onSave={handleEditUser}
      />

      {/* User Create Modal */}
      <UserCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateUser}
      />
    </div>
  );
} 
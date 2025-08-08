'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  UserX,
  Search,
  Filter,
  RefreshCw,
  MoreHorizontal,
  Edit,
  Trash2,
  Power,
  PowerOff,
  Calendar,
  Mail,
  Shield,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import EditUserModal from '@/components/EditUserModal';

interface User {
  _id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export default function AdminUsersPage() {
  const { user, isAuthenticated, isAdmin, isLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchUsers();
    }
  }, [isAuthenticated, isAdmin]);

  const fetchUsers = async () => {
    try {
      console.log('🔍 Fetching users...');
      setLoading(true);
      const response = await fetch('/api/admin/users');
      
      console.log('🔍 Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('🔍 Response data:', result);
        
        if (result.success && result.data) {
          setUsers(result.data);
          console.log('✅ Users loaded:', result.data.length);
        } else {
          console.error('❌ Failed to fetch users:', result.error);
        }
      } else {
        console.error('❌ HTTP error:', response.status);
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
      }
    } catch (error) {
      console.error('❌ Error fetching users:', error);
    } finally {
      setLoading(false);
      console.log('🔍 Loading finished');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.isActive) ||
                         (statusFilter === 'inactive' && !user.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleUserAction = async (userId: string, action: string) => {
    try {
      setActionLoading(true);
      console.log(`🔍 Performing ${action} on user:`, userId);
      
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action,
          isActive: action === 'activate' 
        })
      });

      console.log(`🔍 ${action} response status:`, response.status);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log(`✅ User ${action} successful`);
          fetchUsers(); // Refresh the list
        } else {
          console.error(`❌ Failed to ${action} user:`, data.error);
        }
      } else {
        console.error(`❌ HTTP error:`, response.status);
      }
    } catch (error) {
      console.error(`❌ Error performing ${action}:`, error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    const confirmed = window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`);
    if (confirmed) {
      try {
        setActionLoading(true);
        console.log(`🔍 Deleting user:`, userId);
        
        const response = await fetch(`/api/admin/users/${userId}`, {
          method: 'DELETE',
        });

        console.log(`🔍 Delete response status:`, response.status);
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            console.log(`✅ User deleted successfully`);
            fetchUsers(); // Refresh the list
          } else {
            console.error(`❌ Failed to delete user:`, data.error);
          }
        } else {
          console.error(`❌ HTTP error:`, response.status);
        }
      } catch (error) {
        console.error(`❌ Error deleting user:`, error);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleEditUser = async (formData: any) => {
    if (!editingUser) return;

    try {
      setActionLoading(true);
      console.log('🔍 Updating user:', editingUser._id);
      
      const response = await fetch(`/api/admin/users/${editingUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update_profile',
          ...formData
        })
      });

      console.log('🔍 Update response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log('✅ User updated successfully');
          setShowEditModal(false);
          setEditingUser(null);
          fetchUsers(); // Refresh the list
        } else {
          console.error('❌ Failed to update user:', data.error);
        }
      } else {
        console.error('❌ HTTP error:', response.status);
      }
    } catch (error) {
      console.error('❌ Error updating user:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4 text-purple-500" />;
      case 'moderator':
        return <TrendingUp className="h-4 w-4 text-blue-500" />;
      default:
        return <Users className="h-4 w-4 text-gray-500" />;
    }
  };

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            User Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Manage all users in the system with advanced controls
          </p>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={loading || refreshing}
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total Users</CardTitle>
            <div className="p-2 bg-blue-500 rounded-lg group-hover:scale-110 transition-transform duration-300">
              <Users className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700">{users.length}</div>
            <p className="text-xs text-blue-600 mt-1">Registered accounts</p>
          </CardContent>
        </Card>
        
        <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Active Users</CardTitle>
            <div className="p-2 bg-green-500 rounded-lg group-hover:scale-110 transition-transform duration-300">
              <UserCheck className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">
              {users.filter(u => u.isActive).length}
            </div>
            <p className="text-xs text-green-600 mt-1">Currently active</p>
          </CardContent>
        </Card>
        
        <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-red-50 to-red-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Inactive Users</CardTitle>
            <div className="p-2 bg-red-500 rounded-lg group-hover:scale-110 transition-transform duration-300">
              <UserX className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-700">
              {users.filter(u => !u.isActive).length}
            </div>
            <p className="text-xs text-red-600 mt-1">Suspended accounts</p>
          </CardContent>
        </Card>
        
        <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Admins</CardTitle>
            <div className="p-2 bg-purple-500 rounded-lg group-hover:scale-110 transition-transform duration-300">
              <UserPlus className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700">
              {users.filter(u => u.role === 'admin').length}
            </div>
            <p className="text-xs text-purple-600 mt-1">Administrators</p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Search and Filter */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-gray-800 flex items-center">
            <Users className="h-5 w-5 mr-2 text-blue-600" />
            User Directory
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enhanced Search and Filter Bar */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors duration-200" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
              />
            </div>
            
            <div className="flex gap-3">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="pl-10 pr-8 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white appearance-none cursor-pointer"
                >
                  <option value="all">All Roles</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="moderator">Moderator</option>
                </select>
              </div>
              
              <div className="relative">
                <AlertCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-8 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white appearance-none cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Showing <span className="font-semibold text-gray-800">{filteredUsers.length}</span> of{' '}
                <span className="font-semibold text-gray-800">{users.length}</span> users
              </span>
            </div>
            {searchTerm && (
              <Badge variant="outline" className="text-xs">
                Filtered by "{searchTerm}"
              </Badge>
            )}
          </div>

          {/* Enhanced Table */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <LoadingSpinner />
                <p className="mt-4 text-gray-600">Loading users...</p>
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No users found matching your criteria.</p>
              <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">User</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Contact</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Role</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Joined</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredUsers.map((user, index) => (
                      <tr 
                        key={user._id} 
                        className="hover:bg-gray-50 transition-colors duration-200 group"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{user.name}</p>
                              <p className="text-sm text-gray-500">ID: {user._id.slice(-6)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-700">{user.email}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            {getRoleIcon(user.role)}
                            <Badge 
                              variant={user.role === 'admin' ? 'default' : 'secondary'}
                              className="capitalize"
                            >
                              {user.role}
                            </Badge>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(user.isActive)}
                            <Badge 
                              variant={user.isActive ? 'default' : 'destructive'}
                              className="capitalize"
                            >
                              {user.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-700">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditModal(user)}
                              disabled={actionLoading}
                              className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200"
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            {user.isActive ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUserAction(user._id, 'deactivate')}
                                disabled={actionLoading}
                                className="hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700 transition-all duration-200"
                              >
                                <PowerOff className="h-3 w-3 mr-1" />
                                Deactivate
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUserAction(user._id, 'activate')}
                                disabled={actionLoading}
                                className="hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-all duration-200"
                              >
                                <Power className="h-3 w-3 mr-1" />
                                Activate
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteUser(user._id, user.name)}
                              disabled={actionLoading}
                              className="hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Modal */}
      <EditUserModal
        user={editingUser}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingUser(null);
        }}
        onSubmit={handleEditUser}
        loading={actionLoading}
      />
    </div>
  );
} 
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Edit, 
  Trash2, 
  Lock, 
  Unlock, 
  UserPlus,
  Shield,
  Users
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import AdminUserModal from '@/components/admin/AdminUserModal';

interface AdminUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'super_admin' | 'admin' | 'moderator';
  permissions: string[];
  isActive: boolean;
  loginAttempts: number;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface AdminUsersResponse {
  success: boolean;
  data?: {
    admins: AdminUser[];
    pagination: {
      page: number;
      limit: number;
      totalAdmins: number;
      totalPages: number;
    };
  };
  error?: string;
}

export default function AdminUsersPage() {
  const { user, isAuthenticated, isAdmin, isLoading } = useAuth();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAdmins, setTotalAdmins] = useState(0);
  const [selectedAdmins, setSelectedAdmins] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAdmins = async () => {
    try {
      console.log('🔍 Fetching admins...');
      console.log('🔍 Auth state:', { isAuthenticated, isAdmin, user });
      
      setLoading(true);
      
      const url = `/api/admin/admin-users?page=${currentPage}&limit=10&search=${searchTerm}&role=${roleFilter}&status=${statusFilter}`;
      console.log('🔍 Fetching from URL:', url);
      
      const response = await fetch(url);

      console.log('🔍 Response status:', response.status);
      
      const data: AdminUsersResponse = await response.json();
      console.log('🔍 Response data:', data);

      if (data.success && data.data) {
        setAdmins(data.data.admins || []);
        setTotalPages(data.data.pagination?.totalPages || 1);
        setTotalAdmins(data.data.pagination?.totalAdmins || 0);
        console.log('✅ Admins loaded:', data.data.admins?.length || 0);
      } else {
        console.error('❌ Failed to fetch admins:', data.error);
      }
    } catch (error) {
      console.error('❌ Error fetching admins:', error);
    } finally {
      setLoading(false);
      console.log('🔍 Loading finished');
    }
  };

  useEffect(() => {
    console.log('🔍 useEffect triggered - isAuthenticated:', isAuthenticated, 'isAdmin:', isAdmin);
    if (isAuthenticated && isAdmin) {
      fetchAdmins();
    }
  }, [isAuthenticated, isAdmin]); // Depend on authentication state instead of token

  const handleSearch = () => {
    setCurrentPage(1);
    fetchAdmins();
  };

  const handleBulkAction = async (action: string) => {
    if (selectedAdmins.length === 0) return;

    try {
      setActionLoading(true);
      const response = await fetch('/api/admin/admin-users/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          adminIds: selectedAdmins
        })
      });

      const data = await response.json();
      if (data.success) {
        setSelectedAdmins([]);
        fetchAdmins();
      } else {
        console.error('Bulk action failed:', data.error);
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateAdmin = async (formData: any) => {
    try {
      setActionLoading(true);
      console.log('🔍 Creating admin user:', formData.email);
      
      const response = await fetch('/api/admin/admin-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      console.log('🔍 Create response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Create failed:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('🔍 Create response data:', data);
      
      if (data.success) {
        console.log('✅ Admin user created successfully');
        setShowCreateModal(false);
        fetchAdmins();
        // You can add a toast notification here
      } else {
        console.error('❌ Failed to create admin:', data.error);
        throw new Error(data.error || 'Failed to create admin user');
      }
    } catch (error: any) {
      console.error('❌ Error creating admin:', error);
      // You can add error toast notification here
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditAdmin = async (formData: any) => {
    if (!editingAdmin) return;

    try {
      setActionLoading(true);
      console.log('🔍 Updating admin user:', editingAdmin._id);
      
      const response = await fetch(`/api/admin/admin-users/${editingAdmin._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      console.log('🔍 Update response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Update failed:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('🔍 Update response data:', data);
      
      if (data.success) {
        console.log('✅ Admin user updated successfully');
        setShowEditModal(false);
        setEditingAdmin(null);
        fetchAdmins();
        // You can add a toast notification here
      } else {
        console.error('❌ Failed to update admin:', data.error);
        throw new Error(data.error || 'Failed to update admin user');
      }
    } catch (error: any) {
      console.error('❌ Error updating admin:', error);
      // You can add error toast notification here
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdminAction = async (adminId: string, action: string) => {
    try {
      setActionLoading(true);
      console.log(`🔍 Performing ${action} on admin:`, adminId);
      
      const response = await fetch(`/api/admin/admin-users/${adminId}`, {
        method: action === 'delete' ? 'DELETE' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: action !== 'delete' ? JSON.stringify({ isActive: action === 'activate' }) : undefined
      });

      console.log(`🔍 ${action} response status:`, response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ ${action} failed:`, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log(`🔍 ${action} response data:`, data);
      
      if (data.success) {
        console.log(`✅ Admin ${action} successful`);
        fetchAdmins();
        // You can add a toast notification here
      } else {
        console.error(`❌ Failed to ${action} admin:`, data.error);
        throw new Error(data.error || `Failed to ${action} admin user`);
      }
    } catch (error: any) {
      console.error(`❌ Error performing ${action}:`, error);
      // You can add error toast notification here
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAdmin = async (adminId: string, adminName: string) => {
    const confirmed = window.confirm(`Are you sure you want to delete admin "${adminName}"? This action cannot be undone.`);
    if (confirmed) {
      await handleAdminAction(adminId, 'delete');
    }
  };

  const handleBulkDelete = async () => {
    const confirmed = window.confirm(`Are you sure you want to delete ${selectedAdmins.length} admin(s)? This action cannot be undone.`);
    if (confirmed) {
      await handleBulkAction('delete');
    }
  };

  const openEditModal = (admin: AdminUser) => {
    setEditingAdmin(admin);
    setShowEditModal(true);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-red-100 text-red-800';
      case 'admin': return 'bg-blue-100 text-blue-800';
      case 'moderator': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  // Check authentication
  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Users Management</h1>
          <p className="text-gray-600">Manage system administrators and their permissions</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Add Admin
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Admins</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAdmins}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Admins</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{admins.filter(a => a.isActive).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Super Admins</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{admins.filter(a => a.role === 'super_admin').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Moderators</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{admins.filter(a => a.role === 'moderator').length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by email, name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                id="role"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Roles</option>
                <option value="super_admin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="moderator">Moderator</option>
              </select>
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleSearch} className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Search
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedAdmins.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {selectedAdmins.length} admin(s) selected
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('activate')}
                disabled={actionLoading}
              >
                <Unlock className="w-4 h-4 mr-2" />
                Activate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('deactivate')}
                disabled={actionLoading}
              >
                <Lock className="w-4 h-4 mr-2" />
                Deactivate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkDelete}
                disabled={actionLoading}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Admins Table */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Users ({admins.length})</CardTitle>
          <CardDescription>
            Manage system administrators and their access permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">
                      <input
                        type="checkbox"
                        checked={selectedAdmins.length === admins.length && admins.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedAdmins(admins.map(a => a._id));
                          } else {
                            setSelectedAdmins([]);
                          }
                        }}
                      />
                    </th>
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Email</th>
                    <th className="text-left p-2">Role</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Last Login</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((admin) => (
                    <tr key={admin._id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <input
                          type="checkbox"
                          checked={selectedAdmins.includes(admin._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAdmins([...selectedAdmins, admin._id]);
                            } else {
                              setSelectedAdmins(selectedAdmins.filter(id => id !== admin._id));
                            }
                          }}
                        />
                      </td>
                      <td className="p-2">
                        <div>
                          <div className="font-medium">
                            {admin.firstName} {admin.lastName}
                          </div>
                        </div>
                      </td>
                      <td className="p-2">{admin.email}</td>
                      <td className="p-2">
                        <Badge className={getRoleBadgeColor(admin.role)}>
                          {admin.role.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <Badge className={getStatusBadgeColor(admin.isActive)}>
                          {admin.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="p-2">
                        {admin.lastLoginAt 
                          ? new Date(admin.lastLoginAt).toLocaleDateString()
                          : 'Never'
                        }
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(admin)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {admin.isActive ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAdminAction(admin._id, 'deactivate')}
                              disabled={actionLoading}
                            >
                              <Lock className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAdminAction(admin._id, 'activate')}
                              disabled={actionLoading}
                            >
                              <Unlock className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteAdmin(admin._id, `${admin.firstName} ${admin.lastName}`)}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <AdminUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        mode="create"
        onSubmit={handleCreateAdmin}
        loading={actionLoading}
      />

      <AdminUserModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingAdmin(null);
        }}
        mode="edit"
        admin={editingAdmin}
        onSubmit={handleEditAdmin}
        loading={actionLoading}
      />
    </div>
  );
} 
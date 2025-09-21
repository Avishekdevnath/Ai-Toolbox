'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Shield, 
  Users, 
  Crown, 
  User, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  Check,
  AlertTriangle,
  Settings,
  Lock,
  Eye,
  FileText,
  BarChart3,
  AlertCircle,
  Loader2,
  MoreHorizontal,
  Copy,
  Download
} from 'lucide-react';
import Modal, { ModalHeader, ModalContent, ModalFooter } from '@/components/ui/modal';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  isDefault: boolean;
  isSystem: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface RolesData {
  roles: Role[];
  permissions: Record<string, Permission[]>;
  roleDistribution: Array<{
    role: string;
    count: number;
    percentage: number;
  }>;
  totalUsers: number;
}

interface CreateRoleForm {
  name: string;
  description: string;
  permissions: string[];
}

export default function UserRoles() {
  const [rolesData, setRolesData] = useState<RolesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [createForm, setCreateForm] = useState<CreateRoleForm>({
    name: '',
    description: '',
    permissions: []
  });
  const [submitting, setSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const fetchRolesData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/admin/users/roles');
      const data = await response.json();

      if (data.success) {
        setRolesData(data.data);
      } else {
        setError(data.error || 'Failed to load roles and permissions');
      }
    } catch (error) {
      console.error('Error fetching roles data:', error);
      setError('Failed to load roles and permissions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRolesData();
  }, []);

  const handleCreateRole = async () => {
    if (!createForm.name || !createForm.description) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const response = await fetch('/api/admin/users/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createForm),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage('Role created successfully!');
        setShowCreateModal(false);
        setCreateForm({ name: '', description: '', permissions: [] });
        fetchRolesData(); // Refresh data
      } else {
        setError(data.error || 'Failed to create role');
      }
    } catch (error) {
      console.error('Error creating role:', error);
      setError('Failed to create role. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRole = async (roleId: string, roleName: string) => {
    if (!confirm(`Are you sure you want to delete the role "${roleName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const response = await fetch(`/api/admin/users/roles/${roleId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage('Role deleted successfully!');
        fetchRolesData(); // Refresh data
      } else {
        setError(data.error || 'Failed to delete role');
      }
    } catch (error) {
      console.error('Error deleting role:', error);
      setError('Failed to delete role. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePermissionToggle = (permissionId: string) => {
    setCreateForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const getRoleIcon = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case 'super admin':
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 'admin':
        return <Shield className="w-5 h-5 text-green-500" />;
      case 'moderator':
        return <Shield className="w-5 h-5 text-blue-500" />;
      case 'user':
        return <User className="w-5 h-5 text-gray-500" />;
      default:
        return <Shield className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPermissionIcon = (category: string) => {
    switch (category) {
      case 'User Management':
        return <Users className="w-4 h-4" />;
      case 'Tool Management':
        return <Settings className="w-4 h-4" />;
      case 'Analytics':
        return <BarChart3 className="w-4 h-4" />;
      case 'Content Management':
        return <FileText className="w-4 h-4" />;
      case 'System Settings':
        return <Settings className="w-4 h-4" />;
      case 'Security':
        return <Lock className="w-4 h-4" />;
      case 'Basic Access':
        return <Eye className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  const exportRolesData = () => {
    if (!rolesData) return;
    
    const csvData = [
      ['Role Name', 'Description', 'User Count', 'Permissions', 'System Role'],
      ...rolesData.roles.map(role => [
        role.name,
        role.description,
        role.userCount.toString(),
        role.permissions.join(', '),
        role.isSystem ? 'Yes' : 'No'
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'roles-export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading roles and permissions...</span>
      </div>
    );
  }

  if (error && !rolesData) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <AlertCircle className="w-12 h-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Roles</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <Button onClick={fetchRolesData} variant="outline">
          <AlertTriangle className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  if (!rolesData) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            User Roles & Permissions
          </h1>
          <p className="text-gray-600 mt-2">
            Manage user roles, permissions, and access levels
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={exportRolesData}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Role
          </Button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="p-4 bg-green-100 border border-green-300 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-green-700">{successMessage}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSuccessMessage('')}
            className="text-green-600 hover:text-green-700"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-100 border border-red-300 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-red-700">{error}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setError('')}
            className="text-red-600 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Roles Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {rolesData.roles.map((role) => (
          <Card key={role.id} className="relative hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getRoleIcon(role.name)}
                  <div>
                    <h3 className="font-semibold text-gray-900">{role.name}</h3>
                    {role.isDefault && (
                      <Badge variant="outline" className="text-xs">Default</Badge>
                    )}
                  </div>
                </div>
                {!role.isSystem && (
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingRole(role)}
                      className="h-8 w-8 p-0"
                      disabled={submitting}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteRole(role.id, role.name)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      disabled={submitting}
                    >
                      {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                    </Button>
                  </div>
                )}
              </div>
              
              <p className="text-sm text-gray-600 mb-4">{role.description}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Users:</span>
                  <span className="font-medium">{role.userCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Permissions:</span>
                  <span className="font-medium">{role.permissions.length}</span>
                </div>
              </div>

              {role.isSystem && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <Badge variant="outline" className="text-xs text-gray-500">
                    System Role
                  </Badge>
                </div>
              )}

              {/* Clickable View Details */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedRole(selectedRole === role.id ? null : role.id)}
                className="w-full mt-4 text-blue-600 hover:text-blue-700"
              >
                {selectedRole === role.id ? 'Hide Details' : 'View Details'}
              </Button>

              {selectedRole === role.id && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Permissions:</h4>
                  <div className="space-y-1">
                    {role.permissions.map(permission => (
                      <div key={permission} className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                        {permission}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Role Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Role Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rolesData.roleDistribution.length > 0 ? (
              rolesData.roleDistribution.map((role) => {
                const percentage = (role.count / rolesData.totalUsers) * 100;
                return (
                  <div key={role.role} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getRoleIcon(role.role.replace('_', ' '))}
                      <div>
                        <p className="font-medium capitalize">{role.role.replace('_', ' ')}</p>
                        <p className="text-sm text-gray-500">{role.count} users</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-600">{role.percentage}%</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No role distribution data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Role Modal */}
      <Modal open={showCreateModal} onOpenChange={setShowCreateModal}>
        <ModalContent>
          <ModalHeader className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Create New Role</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowCreateModal(false);
                setCreateForm({ name: '', description: '', permissions: [] });
                setError('');
              }}
              className="h-8 w-8 p-0"
              disabled={submitting}
            >
              <X className="h-4 w-4" />
            </Button>
          </ModalHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role Name *
              </label>
              <Input 
                placeholder="Enter role name" 
                value={createForm.name}
                onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                disabled={submitting}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <Textarea 
                placeholder="Enter role description" 
                value={createForm.description}
                onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                disabled={submitting}
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Permissions
              </label>
              <div className="border border-gray-300 rounded-md p-3 max-h-60 overflow-y-auto">
                {Object.entries(rolesData.permissions).map(([category, perms]) => (
                  <div key={category} className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                      {getPermissionIcon(category)}
                      {category}
                    </h4>
                    {perms.map((permission) => (
                      <label key={permission.id} className="flex items-center gap-2 py-1 hover:bg-gray-50 rounded px-1">
                        <input 
                          type="checkbox" 
                          className="rounded"
                          checked={createForm.permissions.includes(permission.id)}
                          onChange={() => handlePermissionToggle(permission.id)}
                          disabled={submitting}
                        />
                        <div>
                          <span className="text-sm font-medium">{permission.name}</span>
                          <p className="text-xs text-gray-500">{permission.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <ModalFooter className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateModal(false);
                setCreateForm({ name: '', description: '', permissions: [] });
                setError('');
              }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateRole}
              disabled={submitting || !createForm.name || !createForm.description}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Role
                </>
              )}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
} 
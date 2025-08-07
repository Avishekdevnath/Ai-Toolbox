'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Save, 
  User, 
  Shield, 
  Crown,
  Mail,
  Calendar,
  Activity
} from 'lucide-react';
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
}

interface UserEditModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (userId: string, userData: any) => Promise<void>;
}

export default function UserEditModal({ user, isOpen, onClose, onSave }: UserEditModalProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'user',
    status: 'active'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        status: user.status
      });
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      await onSave(user._id, formData);
      onClose();
    } catch (error: any) {
      setError(error.message || 'Failed to update user');
    } finally {
      setLoading(false);
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
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800">Suspended</Badge>;
      case 'deleted':
        return <Badge className="bg-red-100 text-red-800">Deleted</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen || !user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Edit User</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </ModalHeader>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* User Info Section */}
        <ModalContent>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              User Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="First name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Last name"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Email address"
                  required
                />
              </div>
            </div>
          </div>

          {/* Role and Status Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Role & Status
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="user">User</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
          </div>

          {/* Current User Info */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Current Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Email:</span>
                <span>{user.email}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Current Role:</span>
                <div className="flex items-center gap-1">
                  {getRoleIcon(user.role)}
                  <span className="capitalize">{user.role.replace('_', ' ')}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Joined:</span>
                <span>{formatDate(user.createdAt)}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Status:</span>
                {getStatusBadge(user.status)}
              </div>
            </div>

            {user.activity && (
              <div className="mt-4 pt-4 border-t border-blue-200">
                <h4 className="font-medium mb-2">Activity (Last 7 Days)</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-2 bg-white rounded">
                    <div className="text-lg font-bold text-blue-600">
                      {user.activity.toolUsageCount}
                    </div>
                    <div className="text-xs text-gray-500">Tools Used</div>
                  </div>
                  <div className="text-center p-2 bg-white rounded">
                    <div className="text-lg font-bold text-green-600">
                      {user.activity.toolsUsed}
                    </div>
                    <div className="text-xs text-gray-500">Unique Tools</div>
                  </div>
                  <div className="text-center p-2 bg-white rounded">
                    <div className="text-lg font-bold text-orange-600">
                      {user.activity.isActive ? 'Yes' : 'No'}
                    </div>
                    <div className="text-xs text-gray-500">Active</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ModalContent>

        {/* Action Buttons */}
        <ModalFooter className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
} 
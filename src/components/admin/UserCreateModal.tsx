'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  X, 
  Save, 
  User, 
  Shield, 
  Plus
} from 'lucide-react';
import Modal, { ModalHeader, ModalContent, ModalFooter } from '@/components/ui/modal';

interface UserCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (userData: any) => Promise<void>;
}

export default function UserCreateModal({ isOpen, onClose, onCreate }: UserCreateModalProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'user',
    status: 'active'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onCreate(formData);
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        role: 'user',
        status: 'active'
      });
      onClose();
    } catch (error: any) {
      setError(error.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      role: 'user',
      status: 'active'
    });
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader className="flex items-center gap-2">
        <Plus className="w-5 h-5 text-blue-600" />
        Create New User
      </ModalHeader>
      <ModalContent>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
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
                  Last Name *
                </label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Last name"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="user@example.com"
                required
              />
            </div>
          </div>

          {/* Role and Status */}
          <div className="space-y-4">
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

          {/* Info Note */}
          <div className="bg-blue-50 p-3 rounded text-sm text-blue-700">
            <div className="flex items-start gap-2">
              <User className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">User Account Information</p>
                <p className="text-blue-600 mt-1">
                  The user will be created with the specified role and status. 
                  They can log in using their email address.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <ModalFooter className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
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
              {loading ? 'Creating...' : 'Create User'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
} 
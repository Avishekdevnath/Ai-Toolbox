'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { 
  User, 
  Shield, 
  Save, 
  Eye, 
  EyeOff,
  Key,
  Mail,
  UserCheck,
  AlertCircle
} from 'lucide-react';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function AdminProfilePage() {
  const { admin, isAuthenticated, isSuperAdmin, isLoading } = useAdminAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (admin) {
      setFormData(prev => ({
        ...prev,
        firstName: admin.firstName || '',
        lastName: admin.lastName || '',
        email: admin.email || ''
      }));
    }
  }, [admin]);

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = async () => {
    if (!admin) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/profile/${admin.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setIsEditing(false);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!admin) return;

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (formData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/profile/${admin.id}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setIsChangingPassword(false);
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to change password' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading profile..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Message */}
      {message && (
        <div className={`p-4 rounded-md flex items-center space-x-2 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <UserCheck className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Profile Information</span>
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit className="w-4 h-4 mr-2" />
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              disabled={!isEditing}
              className="mt-1"
            />
          </div>
          {isEditing && (
            <div className="flex justify-end">
              <Button onClick={handleSaveProfile} disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Account Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Role</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                  {admin?.role}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Member Since</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {admin?.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Mail className="w-5 h-5" />
              <span>Change Password</span>
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsChangingPassword(!isChangingPassword)}
            >
              {isChangingPassword ? 'Cancel' : 'Change Password'}
            </Button>
          </div>
        </CardHeader>
        {isChangingPassword && (
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative mt-1">
                <Input
                  id="currentPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.currentPassword}
                  onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => handleInputChange('newPassword', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleChangePassword} disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Changing Password...' : 'Change Password'}
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
} 
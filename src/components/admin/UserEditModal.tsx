'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface User {
  _id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  role: 'user' | 'admin';
  isActive: boolean;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  lastSignInAt?: string;
  stats?: {
    totalLogins: number;
    toolsUsed: number;
    totalAnalyses: number;
    favoriteTools: number;
  };
}

interface UserEditModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: Partial<User>) => void;
}

export default function UserEditModal({ user, isOpen, onClose, onSave }: UserEditModalProps) {
  const [formData, setFormData] = useState<Partial<User>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        role: user.role,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        twoFactorEnabled: user.twoFactorEnabled
      });
    }
  }, [user]);

  const handleInputChange = (field: keyof User, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      setError('Failed to save user');
      console.error('Error saving user:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Edit User</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* User Information */}
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName || ''}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName || ''}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={formData.username || ''}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={formData.role || 'user'}
                    onValueChange={(value) => handleInputChange('role', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Status */}
          <Card>
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="isActive">Active Account</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable or disable user access
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={formData.isActive || false}
                  onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailVerified">Email Verified</Label>
                  <p className="text-sm text-muted-foreground">
                    Mark email as verified
                  </p>
                </div>
                <Switch
                  id="emailVerified"
                  checked={formData.emailVerified || false}
                  onCheckedChange={(checked) => handleInputChange('emailVerified', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="twoFactorEnabled">Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable 2FA for this user
                  </p>
                </div>
                <Switch
                  id="twoFactorEnabled"
                  checked={formData.twoFactorEnabled || false}
                  onCheckedChange={(checked) => handleInputChange('twoFactorEnabled', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* User Statistics */}
          {user.stats && (
            <Card>
              <CardHeader>
                <CardTitle>User Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{user.stats.totalLogins}</div>
                    <div className="text-sm text-muted-foreground">Total Logins</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{user.stats.toolsUsed}</div>
                    <div className="text-sm text-muted-foreground">Tools Used</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{user.stats.totalAnalyses}</div>
                    <div className="text-sm text-muted-foreground">Analyses</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{user.stats.favoriteTools}</div>
                    <div className="text-sm text-muted-foreground">Favorites</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Account Details */}
          <Card>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">User ID:</span>
                <span className="text-sm font-mono">{user._id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Joined:</span>
                <span className="text-sm">{formatDate(user.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Last Updated:</span>
                <span className="text-sm">{formatDate(user.updatedAt)}</span>
              </div>
              {user.lastSignInAt && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Last Login:</span>
                  <span className="text-sm">{formatDate(user.lastSignInAt)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 
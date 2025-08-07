'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Calendar, 
  Shield,
  Edit,
  Save,
  X
} from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  createdAt: string;
  lastLoginAt?: string;
}

export default function UserProfile() {
  const [user, setUser] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });

  useEffect(() => {
    // Load user data from localStorage or context
    const adminToken = localStorage.getItem('adminToken');
    const userToken = localStorage.getItem('userToken');
    
    if (adminToken) {
      // Mock admin user data
      setUser({
        id: 'admin-1',
        email: 'admin@ai-toolbox.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      });
    } else if (userToken) {
      // Mock regular user data
      setUser({
        id: 'user-1',
        email: 'user@example.com',
        firstName: 'Regular',
        lastName: 'User',
        role: 'user',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      });
    }
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email
      });
    }
  }, [user]);

  const handleSave = () => {
    if (user) {
      setUser({
        ...user,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email
      });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email
      });
    }
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No user data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              User Profile
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                {user.role === 'admin' ? (
                  <>
                    <Shield className="w-3 h-3 mr-1" />
                    Admin
                  </>
                ) : (
                  'User'
                )}
              </Badge>
              {!isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center space-x-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src="" alt={user.firstName || user.email} />
              <AvatarFallback className="text-lg">
                {user.firstName ? user.firstName[0] : user.email[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold">
                {user.firstName && user.lastName 
                  ? `${user.firstName} ${user.lastName}`
                  : user.email
                }
              </h3>
              <p className="text-gray-500">{user.email}</p>
            </div>
          </div>

          {/* Profile Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              {isEditing ? (
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 text-gray-700 dark:text-gray-300">
                  {user.firstName || 'Not set'}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="lastName">Last Name</Label>
              {isEditing ? (
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 text-gray-700 dark:text-gray-300">
                  {user.lastName || 'Not set'}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              {isEditing ? (
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 text-gray-700 dark:text-gray-300 flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  {user.email}
                </p>
              )}
            </div>

            <div>
              <Label>Member Since</Label>
              <p className="mt-1 text-gray-700 dark:text-gray-300 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Edit Actions */}
          {isEditing && (
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Shield, 
  Settings, 
  Key, 
  Activity,
  Clock,
  Eye,
  EyeOff,
  Save,
  Edit,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Crown,
  ArrowLeft,
  Camera,
  Trash2,
  Upload
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';
import Image from 'next/image';

interface AdminProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: 'admin' | 'user';
  profilePicture?: {
    url: string;
    cloudinaryPublicId: string;
    uploadedAt: Date;
  };
  createdAt: string;
  lastLoginAt?: string;
  isActive: boolean;
}

export default function AdminProfilePage() {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      const profileData = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber || '',
        role: user.role,
        profilePicture: (user as any).profilePicture,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        isActive: true
      };
      
      setProfile(profileData);
      setProfilePictureUrl((user as any).profilePicture?.url || null);
      
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    setMessage(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (profile) {
        setProfile(prev => prev ? {
          ...prev,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber
        } : null);
        
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setIsEditing(false);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
    setIsEditing(false);
    setMessage(null);
  };

  const handlePasswordChange = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    
    if (formData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters long.' });
      return;
    }

    setIsLoading(true);
    setMessage(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update password. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select an image file.' });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image size must be less than 5MB.' });
      return;
    }

    setIsUploadingPicture(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/profile/upload-picture', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setProfilePictureUrl(data.data.url);
        setMessage({ type: 'success', text: 'Profile picture updated successfully!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to upload profile picture.' });
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      setMessage({ type: 'error', text: 'Failed to upload profile picture. Please try again.' });
    } finally {
      setIsUploadingPicture(false);
    }
  };

  const handleDeleteProfilePicture = async () => {
    if (!confirm('Are you sure you want to delete your profile picture?')) {
      return;
    }

    setIsUploadingPicture(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/profile/upload-picture', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setProfilePictureUrl(null);
        setMessage({ type: 'success', text: 'Profile picture deleted successfully!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to delete profile picture.' });
      }
    } catch (error) {
      console.error('Error deleting profile picture:', error);
      setMessage({ type: 'error', text: 'Failed to delete profile picture. Please try again.' });
    } finally {
      setIsUploadingPicture(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          <span className="text-sm text-gray-700">Loading profile...</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md bg-white border-gray-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Profile Not Found</h3>
              <p className="text-gray-600">Unable to load your profile information.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getUserInitials = () => {
    return `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact Header */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between py-2 sm:py-3">
            {/* Left: Back button + Title */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/dashboard/admin" className="p-1.5 sm:p-2 rounded-md hover:bg-gray-100 transition-colors">
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
              </Link>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                <h1 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">Admin Profile</h1>
              </div>
            </div>

            {/* Right: Edit button */}
            <div className="flex items-center gap-2">
              {!isEditing && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsEditing(true)}
                  className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border-gray-300 hover:bg-gray-50"
                >
                  <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Edit</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">

        {/* Message */}
        {message && (
          <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Compact Profile Overview */}
          <div className="lg:col-span-1">
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardContent className="p-4 sm:p-6">
                {/* Compact Avatar with Upload */}
                <div className="text-center mb-4">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-3">
                    <Avatar className="w-full h-full border-2 border-gray-100">
                      {profilePictureUrl ? (
                        <Image 
                          src={profilePictureUrl} 
                          alt={`${profile.firstName} ${profile.lastName}`}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <AvatarFallback className="text-xl sm:text-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                          {getUserInitials()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    {/* Upload/Delete Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 hover:opacity-100 transition-opacity">
                      {isUploadingPicture ? (
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                      ) : (
                        <div className="flex gap-2">
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleProfilePictureUpload}
                              className="hidden"
                              disabled={isUploadingPicture}
                            />
                            <Camera className="w-5 h-5 text-white hover:scale-110 transition-transform" />
                          </label>
                          {profilePictureUrl && (
                            <button
                              onClick={handleDeleteProfilePicture}
                              disabled={isUploadingPicture}
                              className="hover:scale-110 transition-transform"
                            >
                              <Trash2 className="w-5 h-5 text-white" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">{profile.firstName} {profile.lastName}</h3>
                  <p className="text-xs sm:text-sm text-gray-500 mb-3">{profile.email}</p>
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs font-medium">
                    {profile.role === 'admin' ? (
                      <Shield className="w-3 h-3 mr-1" />
                    ) : (
                      <Crown className="w-3 h-3 mr-1" />
                    )}
                    {profile.role.toUpperCase()}
                  </Badge>
                </div>

                {/* Compact Stats */}
                <div className="space-y-3 border-t border-gray-100 pt-4">
                  <div className="flex items-start gap-3 text-xs sm:text-sm">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-gray-500 text-xs">Member since</p>
                      <p className="text-gray-900 font-medium">{new Date(profile.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 text-xs sm:text-sm">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-gray-500 text-xs">Last login</p>
                      <p className="text-gray-900 font-medium">{new Date(profile.lastLoginAt || profile.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 text-xs sm:text-sm">
                    <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-gray-500 text-xs">Account status</p>
                      <Badge className={`text-xs font-medium mt-1 ${profile.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                        {profile.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Settings */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Personal Information */}
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader className="pb-3 border-b border-gray-100">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-gray-900">
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  <span>Personal Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">First Name</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          disabled={isLoading}
                          className="mt-1 bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last Name</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          disabled={isLoading}
                          className="mt-1 bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                        placeholder="+1 (555) 123-4567"
                        disabled={isLoading}
                        className="mt-1 bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        disabled
                        className="mt-1 bg-gray-50 border-gray-300 text-gray-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-gray-100">
                      <Button onClick={handleSave} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={handleCancel} disabled={isLoading} className="border-gray-300 hover:bg-gray-50">
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-gray-500">First Name</Label>
                        <p className="text-base font-medium text-gray-900 mt-1">{profile.firstName}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-500">Last Name</Label>
                        <p className="text-base font-medium text-gray-900 mt-1">{profile.lastName}</p>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm text-gray-500">Email Address</Label>
                      <p className="text-base font-medium text-gray-900 mt-1 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        {profile.email}
                      </p>
                    </div>
                    
                    <div>
                      <Label className="text-sm text-gray-500">Phone Number</Label>
                      <p className="text-base font-medium text-gray-900 mt-1 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {profile.phoneNumber || 'Not provided'}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader className="pb-3 border-b border-gray-100">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-gray-900">
                  <Key className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  <span>Security Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword" className="text-sm font-medium text-gray-700">Current Password</Label>
                    <div className="relative mt-1">
                      <Input
                        id="currentPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.currentPassword}
                        onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                        disabled={isLoading}
                        className="bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 pr-10"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">New Password</Label>
                    <Input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.newPassword}
                      onChange={(e) => handleInputChange('newPassword', e.target.value)}
                      disabled={isLoading}
                      className="mt-1 bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      disabled={isLoading}
                      className="mt-1 bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="pt-2 border-t border-gray-100">
                    <Button onClick={handlePasswordChange} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Key className="w-4 h-4 mr-2" />
                      )}
                      Update Password
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

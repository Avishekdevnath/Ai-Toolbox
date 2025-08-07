'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/Navigation';

export default function ProfilePage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  // Load user data when component mounts
  useEffect(() => {
    if (isLoaded && user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setUsername(user.username || '');
      setEmail(user.primaryEmailAddress?.emailAddress || '');
      setImagePreview(user.imageUrl);
      
      // Load additional profile data from public metadata
      const publicMetadata = user.publicMetadata as any;
      setBio(publicMetadata?.bio || '');
      setLocation(publicMetadata?.location || '');
      setWebsite(publicMetadata?.website || '');
      setPhoneNumber(publicMetadata?.phoneNumber || '');
    }
  }, [isLoaded, user]);

  // Redirect if not signed in
  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in');
    }
  }, [isLoaded, user, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      setImageFile(file);
      setError('');

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile || !user) return;

    setIsUploading(true);
    setError('');
    setSuccess('');

    try {
      console.log('Uploading profile image...');
      await user.setProfileImage({ file: imageFile });
      setSuccess('Profile image updated successfully!');
      setImageFile(null);
      console.log('Profile image uploaded successfully');
    } catch (err: unknown) {
      console.error('Image upload error:', err);
      let errorMessage = 'Failed to upload image. Please try again.';
      
      if (err && typeof err === 'object' && 'errors' in err) {
        const errors = Array.isArray(err.errors) ? err.errors : [err.errors];
        errorMessage = errors[0]?.message || errors[0]?.longMessage || 'Failed to upload image. Please try again.';
      } else if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
        errorMessage = err.message;
      } else if (err && typeof err === 'string') {
        errorMessage = err;
      }
      
      setError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const validatePasswordChange = () => {
    if (!currentPassword.trim()) {
      setError('Current password is required');
      return false;
    }
    if (!newPassword.trim()) {
      setError('New password is required');
      return false;
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      return false;
    }
    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match');
      return false;
    }
    return true;
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (!user || !validatePasswordChange()) {
      setIsLoading(false);
      return;
    }

    try {
      console.log('Changing password...');
      
      // Use Clerk's proper password change method
      // This requires the user to be authenticated and provides proper verification
      await user.update({
        password: newPassword,
      });
      
      setSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setIsChangingPassword(false);
      console.log('Password changed successfully');
    } catch (err: unknown) {
      console.error('Password change error:', err);
      let errorMessage = 'Failed to change password. Please try again.';
      
      if (err && typeof err === 'object' && 'errors' in err) {
        const errors = Array.isArray(err.errors) ? err.errors : [err.errors];
        errorMessage = errors[0]?.message || errors[0]?.longMessage || 'Failed to change password. Please try again.';
      } else if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
        errorMessage = err.message;
      } else if (err && typeof err === 'string') {
        errorMessage = err;
      }
      
      // Special handling for verification error
      if (errorMessage.includes('additional verification') || errorMessage.includes('verification')) {
        setError('Password change requires additional verification. Please use the "Forgot Password" feature instead.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (!user) return;

    try {
      console.log('Updating profile...');
      await user.update({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: username.trim(),
        publicMetadata: {
          bio: bio.trim(),
          location: location.trim(),
          website: website.trim(),
          phoneNumber: phoneNumber.trim(),
        },
      });
      
      setSuccess('Profile updated successfully!');
      console.log('Profile updated successfully');
    } catch (err: unknown) {
      console.error('Profile update error:', err);
      let errorMessage = 'Failed to update profile. Please try again.';
      
      if (err && typeof err === 'object' && 'errors' in err) {
        const errors = Array.isArray(err.errors) ? err.errors : [err.errors];
        errorMessage = errors[0]?.message || errors[0]?.longMessage || 'Failed to update profile. Please try again.';
      } else if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
        errorMessage = err.message;
      } else if (err && typeof err === 'string') {
        errorMessage = err;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (err) {
      console.error('Error signing out:', err);
      router.push('/');
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to sign-in
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation showBack backUrl="/dashboard" backText="Back to Dashboard" />
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
              <p className="mt-2 text-gray-600">Manage your account information and preferences</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Image Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Picture</h2>
              
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 mx-auto mb-4">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  {imageFile && (
                    <div className="absolute -top-2 -right-2">
                      <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        ✓
                      </div>
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Choose Image
                  </button>
                  
                  {imageFile && (
                    <button
                      type="button"
                      onClick={handleImageUpload}
                      disabled={isUploading}
                      className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isUploading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Uploading...
                        </div>
                      ) : (
                        'Upload Image'
                      )}
                    </button>
                  )}
                </div>

                <p className="mt-3 text-xs text-gray-500">
                  JPG, PNG, or GIF. Max 5MB.
                </p>
              </div>
            </div>
          </div>

          {/* Profile Information Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-6">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm mb-6">
                  {success}
                </div>
              )}

              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Enter your first name"
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    Username
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter your username"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    disabled
                    value={email}
                    className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 sm:text-sm cursor-not-allowed"
                    placeholder="Email address"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Email address cannot be changed from this page
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                      </div>
                    ) : (
                      'Update Profile'
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Additional Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Additional Information</h2>
              
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                      Location
                    </label>
                    <input
                      id="location"
                      name="location"
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="City, Country"
                    />
                  </div>

                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                    Website
                  </label>
                  <input
                    id="website"
                    name="website"
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                      </div>
                    ) : (
                      'Update Additional Info'
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Password Change */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Change Password</h2>
                <div className="flex items-center space-x-4">
                  <Link
                    href="/forgot-password"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Forgot Password?
                  </Link>
                  <button
                    type="button"
                    onClick={() => setIsChangingPassword(!isChangingPassword)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    {isChangingPassword ? 'Cancel' : 'Change Password'}
                  </button>
                </div>
              </div>
              
              {isChangingPassword && (
                <>
                  <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md text-sm mb-6">
                    <p className="font-medium mb-1">Password Change Notice:</p>
                    <p>For security reasons, password changes may require additional verification. If you encounter issues, please use the "Forgot Password" feature instead.</p>
                  </div>
                  
                  <form onSubmit={handlePasswordChange} className="space-y-6">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                      Current Password
                    </label>
                    <div className="mt-1 relative">
                      <input
                        id="currentPassword"
                        name="currentPassword"
                        type={showCurrentPassword ? 'text' : 'password'}
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="block w-full px-3 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Enter your current password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? (
                          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                      New Password
                    </label>
                    <div className="mt-1 relative">
                      <input
                        id="newPassword"
                        name="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="block w-full px-3 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Enter your new password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters long</p>
                  </div>

                  <div>
                    <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700">
                      Confirm New Password
                    </label>
                    <div className="mt-1 relative">
                      <input
                        id="confirmNewPassword"
                        name="confirmNewPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className="block w-full px-3 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Confirm your new password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Changing...
                        </div>
                      ) : (
                        'Change Password'
                      )}
                    </button>
                  </div>
                </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
'use client';

import { useState, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/Navigation';

interface Device {
  id: string;
  browser: string;
  os: string;
  ipAddress: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export default function SecurityPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signOutAllDevices, setSignOutAllDevices] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  // Mock device data - in real implementation, you'd fetch this from Clerk
  const [devices, setDevices] = useState<Device[]>([
    {
      id: '1',
      browser: 'Chrome 138.0.0.0',
      os: 'Windows',
      ipAddress: '103.96.91.17',
      location: 'Dhaka, BD',
      lastActive: 'Today at 11:52 AM',
      isCurrent: true,
    },
    {
      id: '2',
      browser: 'Firefox 120.0',
      os: 'macOS',
      ipAddress: '192.168.1.100',
      location: 'New York, US',
      lastActive: 'Yesterday at 3:30 PM',
      isCurrent: false,
    },
  ]);

  // Redirect if not signed in
  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in');
    }
  }, [isLoaded, user, router]);

  const validatePasswordChange = () => {
    if (!newPassword.trim()) {
      setError('New password is required');
      return false;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (!user || !validatePasswordChange()) {
      setIsLoading(false);
      return;
    }

    try {
      console.log('Updating password using Clerk\'s proper flow...');
      
      // Try direct password update
      await user.update({
        password: newPassword,
      });
      
      setSuccess('Password updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
      setIsUpdatingPassword(false);
      console.log('Password updated successfully');
      
    } catch (err: unknown) {
      console.error('Password update error:', err);
      let errorMessage = 'Failed to update password. Please try again.';
      
      if (err && typeof err === 'object' && 'errors' in err) {
        const errors = Array.isArray(err.errors) ? err.errors : [err.errors];
        errorMessage = errors[0]?.message || errors[0]?.longMessage || 'Failed to update password. Please try again.';
      } else if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
        errorMessage = err.message;
      } else if (err && typeof err === 'string') {
        errorMessage = err;
      }
      
      // Handle verification error properly
      if (errorMessage.includes('additional verification') || errorMessage.includes('verification')) {
        setError('Password change requires additional verification. Please use the "Forgot Password" feature for secure password reset.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOutDevice = async (deviceId: string) => {
    try {
      console.log('Signing out device:', deviceId);
      // In a real implementation, you'd call Clerk's API to sign out specific devices
      // For now, we'll just remove it from the local state
      setDevices(devices.filter(device => device.id !== deviceId));
      setSuccess('Device signed out successfully');
    } catch (err) {
      console.error('Error signing out device:', err);
      setError('Failed to sign out device');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setError('Please type DELETE to confirm account deletion');
      return;
    }

    setIsDeletingAccount(true);
    setError('');
    setSuccess('');

    try {
      console.log('Deleting account...');
      
      // Delete the user account
      await user?.delete();
      
      setSuccess('Account deleted successfully. Redirecting...');
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (err: unknown) {
      console.error('Account deletion error:', err);
      let errorMessage = 'Failed to delete account. Please try again.';
      
      if (err && typeof err === 'object' && 'errors' in err) {
        const errors = Array.isArray(err.errors) ? err.errors : [err.errors];
        errorMessage = errors[0]?.message || errors[0]?.longMessage || 'Failed to delete account. Please try again.';
      } else if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
        errorMessage = err.message;
      } else if (err && typeof err === 'string') {
        errorMessage = err;
      }
      
      setError(errorMessage);
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const getDeviceIcon = (os: string) => {
    if (os.toLowerCase().includes('windows')) {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M0 3.5l9.5-2.5v9H0V3.5zM10.5 1L24 4.5v7.5H10.5V1zM0 12.5h9.5V21L0 18.5V12.5zM10.5 12.5H24V21l-13.5 2.5V12.5z"/>
        </svg>
      );
    } else if (os.toLowerCase().includes('mac')) {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
        </svg>
      );
    } else {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M4 6h18V4H4c-1.1 0-2 .9-2 2v11H0v3h14v-3H4V6zm19 2h-6c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1zm-1 9h-4v-7h4v7z"/>
        </svg>
      );
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
              <h1 className="text-3xl font-bold text-gray-900">Account</h1>
              <p className="mt-2 text-gray-600">Manage your account info.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <nav className="space-y-2">
                <Link
                  href="/profile"
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile
                </Link>
                <div className="flex items-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Security
                </div>
              </nav>
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500">Secured by Clerk</p>
                <p className="text-xs text-gray-400">Development mode</p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Password Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Password</h2>
              
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

              {!isUpdatingPassword ? (
                <div className="space-y-4">
                  <button
                    onClick={() => setIsUpdatingPassword(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Update password
                  </button>
                  <div className="text-sm text-gray-600">
                    <p>For advanced account management, you can also use Clerk's built-in user profile:</p>
                    <Link
                      href="/user"
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Open Clerk User Profile →
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Update password</h3>
                  
                  <form onSubmit={handlePasswordUpdate} className="space-y-4">
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                        New password
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
                          placeholder="Enter new password"
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
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                        Confirm password
                      </label>
                      <div className="mt-1 relative">
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="block w-full px-3 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="Confirm new password"
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

                    <div className="flex items-center">
                      <input
                        id="signOutAllDevices"
                        name="signOutAllDevices"
                        type="checkbox"
                        checked={signOutAllDevices}
                        onChange={(e) => setSignOutAllDevices(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="signOutAllDevices" className="ml-2 block text-sm text-gray-900">
                        Sign out of all other devices
                      </label>
                    </div>
                    <p className="text-sm text-gray-500">
                      It is recommended to sign out of all other devices which may have used your old password.
                    </p>

                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          setIsUpdatingPassword(false);
                          setNewPassword('');
                          setConfirmPassword('');
                          setError('');
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isLoading ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Active Devices Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Active devices</h2>
              
              <div className="space-y-4">
                {devices.map((device) => (
                  <div key={device.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-gray-500">
                        {getDeviceIcon(device.os)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">{device.os}</span>
                          {device.isCurrent && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              This device
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{device.browser}</p>
                        <p className="text-sm text-gray-600">{device.ipAddress} ({device.location})</p>
                        <p className="text-sm text-gray-500">{device.lastActive}</p>
                      </div>
                    </div>
                    {!device.isCurrent && (
                      <button
                        onClick={() => handleSignOutDevice(device.id)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Sign out
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Delete Account Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Delete account</h2>
              
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-red-600 hover:text-red-700 font-medium"
                >
                  Delete account
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-red-800 mb-2">Are you sure?</h3>
                    <p className="text-red-700 mb-4">
                      This action cannot be undone. This will permanently delete your account and remove all your data.
                    </p>
                    <div>
                      <label htmlFor="deleteConfirm" className="block text-sm font-medium text-red-800 mb-2">
                        Type DELETE to confirm
                      </label>
                      <input
                        id="deleteConfirm"
                        type="text"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        className="block w-full px-3 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm"
                        placeholder="DELETE"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeleteConfirmText('');
                        setError('');
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={isDeletingAccount || deleteConfirmText !== 'DELETE'}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isDeletingAccount ? 'Deleting...' : 'Delete Account'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
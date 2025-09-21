'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import NewFooter from '@/components/NewFooter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User, 
  Mail, 
  Shield, 
  Edit, 
  Save, 
  X, 
  AlertCircle, 
  CheckCircle,
  Loader2,
  ArrowLeft,
  Clock
} from 'lucide-react';
import PasswordChangeModal from '@/components/modals/PasswordChangeModal';

export default function ProfilePage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Password change modal state
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);

  const [profile, setProfile] = useState<{ id: string; username: string; firstName: string; lastName: string; email: string; phoneNumber?: string } | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/user/profile', { cache: 'no-store' });
        const data = await res.json();
        if (!res.ok || !data.success) {
          if (res.status === 401) {
            router.push('/sign-in');
            return;
          }
          throw new Error(data.error || 'Failed to load profile');
        }
        setProfile(data.data);
        setFirstName(data.data.firstName || '');
        setLastName(data.data.lastName || '');
        setUsername(data.data.username || '');
        setPhoneNumber(data.data.phoneNumber || '');
      } catch (e: any) {
        setError(e.message || 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [router]);

  const handleSaveProfile = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, username, phoneNumber }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to update profile');
      setProfile(data.data);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    if (!profile) return;
    setFirstName(profile.firstName || '');
    setLastName(profile.lastName || '');
    setUsername(profile.username || '');
    setPhoneNumber(profile.phoneNumber || '');
    setIsEditing(false);
    setError('');
  };


  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <NewFooter />
      </div>
    );
  }

  if (!profile) {
    router.push('/sign-in');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
              <Button 
                onClick={() => setIsEditing(true)} 
                variant="outline"
                className="hidden sm:flex"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Overview */}
            <div className="lg:col-span-1">
              <Card className="overflow-hidden">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-6 text-white">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">{profile.firstName} {profile.lastName}</h2>
                      <p className="text-blue-100">@{profile.username}</p>
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{profile.email}</span>
                    </div>
                    {profile.phoneNumber && (
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 text-gray-500">📱</div>
                        <span className="text-sm text-gray-600">{profile.phoneNumber}</span>
                      </div>
                    )}
                    <div className="pt-4 border-t">
                      <p className="text-xs text-gray-500">Member since 2025</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" disabled>
                    <Shield className="mr-2 h-4 w-4" />
                    Security Settings
                    <span className="ml-auto flex items-center text-xs text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      Coming Soon
                    </span>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" disabled>
                    <Mail className="mr-2 h-4 w-4" />
                    Email Preferences
                    <span className="ml-auto flex items-center text-xs text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      Coming Soon
                    </span>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" disabled>
                    <User className="mr-2 h-4 w-4" />
                    Account Settings
                    <span className="ml-auto flex items-center text-xs text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      Coming Soon
                    </span>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Profile Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        <User className="w-5 h-5 mr-2" />
                        Personal Information
                      </CardTitle>
                      <CardDescription>Your basic profile details</CardDescription>
                    </div>
                    {!isEditing && (
                      <Button onClick={() => setIsEditing(true)} variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input 
                            id="firstName" 
                            value={firstName} 
                            onChange={(e) => setFirstName(e.target.value)} 
                            disabled={isLoading} 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input 
                            id="lastName" 
                            value={lastName} 
                            onChange={(e) => setLastName(e.target.value)} 
                            disabled={isLoading} 
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="username">Username</Label>
                          <Input 
                            id="username" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            disabled={isLoading} 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input 
                            id="phone" 
                            value={phoneNumber} 
                            onChange={(e) => setPhoneNumber(e.target.value)} 
                            disabled={isLoading} 
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input 
                          id="email" 
                          value={profile.email} 
                          disabled 
                          className="bg-gray-50" 
                        />
                        <p className="text-xs text-gray-500">Email cannot be changed</p>
                      </div>

                      <div className="flex space-x-3 pt-4">
                        <Button onClick={handleSaveProfile} disabled={isLoading}>
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Save Changes
                            </>
                          )}
                        </Button>
                        <Button variant="outline" onClick={handleCancelEdit} disabled={isLoading}>
                          <X className="mr-2 h-4 w-4" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500">First Name</p>
                        <p className="text-lg">{profile.firstName || 'Not set'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500">Last Name</p>
                        <p className="text-lg">{profile.lastName || 'Not set'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500">Username</p>
                        <p className="text-lg">@{profile.username}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500">Phone Number</p>
                        <p className="text-lg">{profile.phoneNumber || 'Not set'}</p>
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <p className="text-sm font-medium text-gray-500">Email Address</p>
                        <p className="text-lg">{profile.email}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Account Security */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Account Security
                  </CardTitle>
                  <CardDescription>Manage your account security settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Shield className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Password</h4>
                          <p className="text-sm text-gray-600">Last updated recently</p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowPasswordChangeModal(true)}
                      >
                        Change Password
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Mail className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Two-Factor Authentication</h4>
                          <p className="text-sm text-gray-600">Add an extra layer of security</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          Coming Soon
                        </span>
                        <Button variant="outline" size="sm" disabled>
                          Enable 2FA
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </main>
      <NewFooter />
      
      {/* Password Change Modal */}
      <PasswordChangeModal
        isOpen={showPasswordChangeModal}
        onClose={() => setShowPasswordChangeModal(false)}
        userEmail={profile?.email || ''}
      />
    </div>
  );
} 
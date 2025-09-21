'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Download,
  Trash2,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';

interface UserSettingsProps {
  userId: string;
}

export default function UserSettings({ userId }: UserSettingsProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [totalToolsUsed, setTotalToolsUsed] = useState(0);
  const [totalAnalyses, setTotalAnalyses] = useState(0);
  const [totalUses, setTotalUses] = useState(0);

  // Preferences state
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [language, setLanguage] = useState<'en' | 'es' | 'fr' | 'de'>('en');
  const [timeZone, setTimeZone] = useState<'UTC' | 'EST' | 'PST' | 'GMT'>('UTC');

  // Notifications state
  const [emailAnalysisResults, setEmailAnalysisResults] = useState(true);
  const [emailWeeklyReports, setEmailWeeklyReports] = useState(false);
  const [emailSystemUpdates, setEmailSystemUpdates] = useState(true);
  const [pushAnalysisComplete, setPushAnalysisComplete] = useState(true);
  const [pushNewFeatures, setPushNewFeatures] = useState(true);
  const [pushReminders, setPushReminders] = useState(false);
  const [notifFrequency, setNotifFrequency] = useState<'immediate' | 'daily' | 'weekly'>('immediate');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const data = await res.json();
          const p = data.data || {};
          setFirstName(p.firstName || '');
          setLastName(p.lastName || '');
          setEmail(p.email || '');
          setUsername(p.username || '');
          setPhoneNumber(p.phoneNumber || '');
        }
        // Load settings (preferences/notifications)
        const setRes = await fetch('/api/user/settings');
        if (setRes.ok) {
          const s = await setRes.json();
          const data = s.data || {};
          if (data.preferences) {
            setTheme((data.preferences.theme as any) || 'system');
            setLanguage((data.preferences.language as any) || 'en');
            setTimeZone((data.preferences.timeZone as any) || 'UTC');
          }
          if (data.notifications) {
            setEmailAnalysisResults(!!data.notifications.email?.analysisResults);
            setEmailWeeklyReports(!!data.notifications.email?.weeklyReports);
            setEmailSystemUpdates(!!data.notifications.email?.systemUpdates);
            setPushAnalysisComplete(!!data.notifications.push?.analysisComplete);
            setPushNewFeatures(!!data.notifications.push?.newFeatures);
            setPushReminders(!!data.notifications.push?.reminders);
            setNotifFrequency((data.notifications.frequency as any) || 'immediate');
          }
        }
        const sres = await fetch('/api/user/stats');
        if (sres.ok) {
          const sdata = await sres.json();
          const stats = sdata.data?.userStats || {};
          setTotalToolsUsed(stats.totalToolsUsed || 0);
          setTotalAnalyses(stats.totalAnalyses || 0);
          setTotalUses(stats.totalAnalyses || 0);
        }
      } catch {}
    };
    load();
  }, []);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'data', label: 'Data & Privacy', icon: Globe },
  ];

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, phoneNumber, username }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (res.status === 409) {
          throw new Error('Username already taken');
        }
        throw new Error(err.error || 'Failed to save profile');
      }
      toast({ title: 'Profile updated', description: 'Your changes have been saved.' });
    } catch (e: any) {
      toast({ title: 'Save failed', description: e.message || 'Could not update profile.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferences: { theme, language, timeZone },
        }),
      });
      if (!res.ok) throw new Error('Failed to save preferences');
      toast({ title: 'Preferences saved' });
    } catch (e: any) {
      toast({ title: 'Save failed', description: e.message || 'Could not save preferences.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/user/settings/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: {
            analysisResults: emailAnalysisResults,
            weeklyReports: emailWeeklyReports,
            systemUpdates: emailSystemUpdates,
          },
          push: {
            analysisComplete: pushAnalysisComplete,
            newFeatures: pushNewFeatures,
            reminders: pushReminders,
          },
          frequency: notifFrequency,
        }),
      });
      if (!res.ok) throw new Error('Failed to save notification settings');
      toast({ title: 'Notifications saved' });
    } catch (e: any) {
      toast({ title: 'Save failed', description: e.message || 'Could not save notifications.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    try {
      setIsChangingPassword(true);
      setPasswordError(null);

      // Validate passwords match
      if (newPassword !== confirmPassword) {
        setPasswordError('Passwords do not match');
        return;
      }

      // Validate password length
      if (newPassword.length < 8) {
        setPasswordError('New password must be at least 8 characters');
        return;
      }

      const response = await fetch('/api/user/settings/security', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      // Clear form on success
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      toast({
        title: 'Password Changed',
        description: 'Your password has been updated successfully.',
      });
    } catch (error: any) {
      console.error('Error changing password:', error);
      setPasswordError(error.message || 'Failed to change password');
      toast({
        title: 'Error',
        description: error.message || 'Failed to change password.',
        variant: 'destructive',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex flex-wrap sm:flex-nowrap space-x-2 sm:space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm flex items-center space-x-1 sm:space-x-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <IconComponent className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">{tab.label}</span>
                <span className="xs:hidden">{tab.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-4 md:space-y-6">
        {activeTab === 'profile' && (
          <div className="space-y-4 md:space-y-6">
            {/* Profile Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div>
                    <h3 className="text-lg font-medium">{(firstName || lastName) ? `${firstName} ${lastName}`.trim() : (username || 'User')}</h3>
                    <p className="text-gray-500">{email}</p>
                    <Badge variant="secondary" className="mt-1">
                      {user?.role ?? 'user'}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      className="mt-1"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      className="mt-1"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      className="mt-1"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled
                    />
                  </div>
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      className="mt-1"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      className="mt-1"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Account Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{totalToolsUsed}</div>
                    <div className="text-sm text-gray-500">Tools Used</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{totalUses}</div>
                    <div className="text-sm text-gray-500">Total Uses</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{totalAnalyses}</div>
                    <div className="text-sm text-gray-500">Days Active</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="space-y-4 md:space-y-6">
            <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="w-5 h-5 mr-2" />
                Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base font-medium">Theme</Label>
                <div className="mt-2 space-y-2">
                  {['light', 'dark', 'system'].map((theme) => (
                    <label key={theme} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="theme"
                        value={theme}
                        defaultChecked={theme === 'system'}
                        className="text-blue-600"
                      />
                      <span className="capitalize">{theme}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-base font-medium">Language</Label>
                <select className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>

              <Separator />

              <div>
                <Label className="text-base font-medium">Time Zone</Label>
                <select className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                  <option value="UTC">UTC</option>
                  <option value="EST">Eastern Time</option>
                  <option value="PST">Pacific Time</option>
                  <option value="GMT">GMT</option>
                </select>
              </div>
            </CardContent>
          </Card>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-4 md:space-y-6">
            <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Email Notifications</Label>
                  <p className="text-sm text-gray-500">Receive updates via email</p>
                </div>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Tool Usage Alerts</Label>
                  <p className="text-sm text-gray-500">Get notified about tool usage</p>
                </div>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Weekly Reports</Label>
                  <p className="text-sm text-gray-500">Receive weekly usage summaries</p>
                </div>
                <input type="checkbox" className="rounded" />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">New Features</Label>
                  <p className="text-sm text-gray-500">Learn about new tools and features</p>
                </div>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
            </CardContent>
          </Card>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-4 md:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {passwordError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{passwordError}</p>
                  </div>
                )}

                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative mt-1">
                    <Input
                      id="currentPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="pr-10"
                      placeholder="Enter your current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mt-1"
                    placeholder="Enter your new password (min 8 characters)"
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1"
                    placeholder="Confirm your new password"
                  />
                </div>

                <Button 
                  className="w-full"
                  onClick={handlePasswordChange}
                  disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isChangingPassword ? 'Changing Password...' : 'Update Password'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">2FA Status</p>
                    <p className="text-sm text-gray-500">Add an extra layer of security</p>
                  </div>
                  <Badge variant="outline">Not Enabled</Badge>
                </div>
                <Button variant="outline" className="mt-4">
                  Enable 2FA
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'data' && (
          <div className="space-y-4 md:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  Data & Privacy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Data Collection</Label>
                    <p className="text-sm text-gray-500">Allow us to collect usage data for improvements</p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Analytics</Label>
                    <p className="text-sm text-gray-500">Help us improve by sharing analytics data</p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Button variant="outline" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Export My Data
                  </Button>
                  <Button variant="outline" className="w-full text-red-600 hover:text-red-700">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete My Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex flex-col sm:flex-row justify-end gap-3">
        <Button onClick={handleSave} disabled={isLoading} className="w-full sm:w-auto">
          <Save className="w-4 h-4 mr-2" />
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
} 
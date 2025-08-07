'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { 
  Settings, 
  Save, 
  RefreshCw,
  Shield,
  Bell,
  Database,
  Globe,
  Lock
} from 'lucide-react';

interface SystemSettings {
  general: {
    siteName: string;
    siteDescription: string;
    maintenanceMode: boolean;
    registrationEnabled: boolean;
    maxUsers: number;
  };
  security: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    passwordMinLength: number;
    requireEmailVerification: boolean;
    enableTwoFactor: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    adminAlerts: boolean;
    userNotifications: boolean;
    alertThreshold: number;
  };
  analytics: {
    dataRetentionDays: number;
    enableTracking: boolean;
    anonymizeData: boolean;
    exportEnabled: boolean;
  };
}

export default function SystemSettingsPage() {
  const { isAuthenticated, isSuperAdmin, isLoading } = useAdminAuth();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isAuthenticated && isSuperAdmin) {
      fetchSettings();
    }
  }, [isAuthenticated, isSuperAdmin]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/settings/system', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (data.success) {
        setSettings(data.settings);
      } else {
        // Set default settings if API fails
        setSettings({
          general: {
            siteName: 'AI Toolbox',
            siteDescription: 'Your Ultimate AI Tools Collection',
            maintenanceMode: false,
            registrationEnabled: true,
            maxUsers: 1000
          },
          security: {
            sessionTimeout: 24,
            maxLoginAttempts: 5,
            passwordMinLength: 8,
            requireEmailVerification: true,
            enableTwoFactor: false
          },
          notifications: {
            emailNotifications: true,
            adminAlerts: true,
            userNotifications: true,
            alertThreshold: 10
          },
          analytics: {
            dataRetentionDays: 90,
            enableTracking: true,
            anonymizeData: true,
            exportEnabled: true
          }
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      // Set default settings on error
      setSettings({
        general: {
          siteName: 'AI Toolbox',
          siteDescription: 'Your Ultimate AI Tools Collection',
          maintenanceMode: false,
          registrationEnabled: true,
          maxUsers: 1000
        },
        security: {
          sessionTimeout: 24,
          maxLoginAttempts: 5,
          passwordMinLength: 8,
          requireEmailVerification: true,
          enableTwoFactor: false
        },
        notifications: {
          emailNotifications: true,
          adminAlerts: true,
          userNotifications: true,
          alertThreshold: 10
        },
        analytics: {
          dataRetentionDays: 90,
          enableTracking: true,
          anonymizeData: true,
          exportEnabled: true
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;

    setSaving(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/settings/system', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save settings' });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSettingChange = (section: keyof SystemSettings, key: string, value: any) => {
    if (!settings) return;

    setSettings(prev => ({
      ...prev!,
      [section]: {
        ...prev![section],
        [key]: value
      }
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading System Settings..." />
      </div>
    );
  }

  if (!isAuthenticated || !isSuperAdmin) {
    return null;
  }

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <p className="text-gray-600">Failed to load settings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Configure system-wide settings and preferences
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSettings}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={handleSaveSettings}
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-md flex items-center space-x-2 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <Lock className="w-5 h-5" />
          ) : (
            <Shield className="w-5 h-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="w-5 h-5" />
            <span>General Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={settings.general.siteName}
                onChange={(e) => handleSettingChange('general', 'siteName', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="siteDescription">Site Description</Label>
              <Input
                id="siteDescription"
                value={settings.general.siteDescription}
                onChange={(e) => handleSettingChange('general', 'siteDescription', e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="maintenanceMode"
                checked={settings.general.maintenanceMode}
                onCheckedChange={(checked) => handleSettingChange('general', 'maintenanceMode', checked)}
              />
              <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="registrationEnabled"
                checked={settings.general.registrationEnabled}
                onCheckedChange={(checked) => handleSettingChange('general', 'registrationEnabled', checked)}
              />
              <Label htmlFor="registrationEnabled">Allow Registration</Label>
            </div>
            <div>
              <Label htmlFor="maxUsers">Max Users</Label>
              <Input
                id="maxUsers"
                type="number"
                value={settings.general.maxUsers}
                onChange={(e) => handleSettingChange('general', 'maxUsers', parseInt(e.target.value))}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Security Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={settings.security.sessionTimeout}
                onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
              <Input
                id="maxLoginAttempts"
                type="number"
                value={settings.security.maxLoginAttempts}
                onChange={(e) => handleSettingChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                className="mt-1"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="passwordMinLength">Password Min Length</Label>
              <Input
                id="passwordMinLength"
                type="number"
                value={settings.security.passwordMinLength}
                onChange={(e) => handleSettingChange('security', 'passwordMinLength', parseInt(e.target.value))}
                className="mt-1"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="requireEmailVerification"
                checked={settings.security.requireEmailVerification}
                onCheckedChange={(checked) => handleSettingChange('security', 'requireEmailVerification', checked)}
              />
              <Label htmlFor="requireEmailVerification">Require Email Verification</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="enableTwoFactor"
                checked={settings.security.enableTwoFactor}
                onCheckedChange={(checked) => handleSettingChange('security', 'enableTwoFactor', checked)}
              />
              <Label htmlFor="enableTwoFactor">Enable Two-Factor Authentication</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span>Notification Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="emailNotifications"
                checked={settings.notifications.emailNotifications}
                onCheckedChange={(checked) => handleSettingChange('notifications', 'emailNotifications', checked)}
              />
              <Label htmlFor="emailNotifications">Email Notifications</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="adminAlerts"
                checked={settings.notifications.adminAlerts}
                onCheckedChange={(checked) => handleSettingChange('notifications', 'adminAlerts', checked)}
              />
              <Label htmlFor="adminAlerts">Admin Alerts</Label>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="userNotifications"
                checked={settings.notifications.userNotifications}
                onCheckedChange={(checked) => handleSettingChange('notifications', 'userNotifications', checked)}
              />
              <Label htmlFor="userNotifications">User Notifications</Label>
            </div>
            <div>
              <Label htmlFor="alertThreshold">Alert Threshold</Label>
              <Input
                id="alertThreshold"
                type="number"
                value={settings.notifications.alertThreshold}
                onChange={(e) => handleSettingChange('notifications', 'alertThreshold', parseInt(e.target.value))}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5" />
            <span>Analytics Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dataRetentionDays">Data Retention (days)</Label>
              <Input
                id="dataRetentionDays"
                type="number"
                value={settings.analytics.dataRetentionDays}
                onChange={(e) => handleSettingChange('analytics', 'dataRetentionDays', parseInt(e.target.value))}
                className="mt-1"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="enableTracking"
                checked={settings.analytics.enableTracking}
                onCheckedChange={(checked) => handleSettingChange('analytics', 'enableTracking', checked)}
              />
              <Label htmlFor="enableTracking">Enable Analytics Tracking</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="anonymizeData"
                checked={settings.analytics.anonymizeData}
                onCheckedChange={(checked) => handleSettingChange('analytics', 'anonymizeData', checked)}
              />
              <Label htmlFor="anonymizeData">Anonymize Data</Label>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="exportEnabled"
                checked={settings.analytics.exportEnabled}
                onCheckedChange={(checked) => handleSettingChange('analytics', 'exportEnabled', checked)}
              />
              <Label htmlFor="exportEnabled">Enable Data Export</Label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
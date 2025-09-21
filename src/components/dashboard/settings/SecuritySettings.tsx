'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Clock, Bell, Smartphone } from 'lucide-react';
import SettingsCard from './SettingsCard';
import SettingsSection from './SettingsSection';
import ToggleSwitch from './ToggleSwitch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { useSettings } from './hooks/useSettings';

interface SecuritySettingsProps {
  className?: string;
}

export default function SecuritySettings({ className = '' }: SecuritySettingsProps) {
  const { settings, updateSection, saving, error } = useSettings();
  
  const [formData, setFormData] = useState({
    sessionTimeout: 24,
    loginNotifications: true,
    deviceManagement: true
  });

  const [isDirty, setIsDirty] = useState(false);

  // Initialize form data from settings
  useEffect(() => {
    if (settings?.security) {
      setFormData({
        sessionTimeout: settings.security.sessionTimeout || 24,
        loginNotifications: settings.security.loginNotifications ?? true,
        deviceManagement: settings.security.deviceManagement ?? true
      });
    }
  }, [settings]);

  const handleToggleChange = (setting: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      [setting]: value
    }));
    setIsDirty(true);
  };

  const handleSessionTimeoutChange = (value: number[]) => {
    setFormData(prev => ({
      ...prev,
      sessionTimeout: value[0]
    }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    try {
      await updateSection('security', formData);
      setIsDirty(false);
    } catch (error) {
      console.error('Failed to update security settings:', error);
    }
  };

  const handleReset = () => {
    if (settings?.security) {
      setFormData({
        sessionTimeout: settings.security.sessionTimeout || 24,
        loginNotifications: settings.security.loginNotifications ?? true,
        deviceManagement: settings.security.deviceManagement ?? true
      });
    }
    setIsDirty(false);
  };

  const handleManageDevices = () => {
    // In a real app, this would show device management
    alert('Device management would be implemented here');
  };

  const formatSessionTimeout = (hours: number) => {
    if (hours === 1) return '1 hour';
    if (hours < 24) return `${hours} hours`;
    if (hours === 24) return '1 day';
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    if (remainingHours === 0) return `${days} days`;
    return `${days} days, ${remainingHours} hours`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center gap-3">
        <Shield className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Security Settings
        </h2>
      </div>
      
      <p className="text-gray-600 dark:text-gray-400">
        Manage your account security and authentication settings.
      </p>

      <SettingsCard
        title="Session Management"
        description="Control how long your sessions remain active"
        icon={<Clock className="w-5 h-5" />}
        actions={
          isDirty && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleReset}>
                Reset
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )
        }
      >
        <div className="space-y-6">
          <SettingsSection title="Session Timeout" description="Set how long your session remains active">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Session Timeout: {formatSessionTimeout(formData.sessionTimeout)}</Label>
                <Slider
                  value={[formData.sessionTimeout]}
                  onValueChange={handleSessionTimeoutChange}
                  max={168}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>1 hour</span>
                  <span>24 hours</span>
                  <span>7 days</span>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                After this time, you'll be automatically logged out for security
              </p>
            </div>
          </SettingsSection>

          <SettingsSection title="Login Notifications" description="Get notified of new login attempts">
            <ToggleSwitch
              checked={formData.loginNotifications}
              onCheckedChange={(value) => handleToggleChange('loginNotifications', value)}
              label="Notify me of new logins"
              description="Receive email notifications when someone logs into your account from a new device"
            />
          </SettingsSection>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Device Management"
        description="Manage your active devices and sessions"
        icon={<Smartphone className="w-5 h-5" />}
        actions={
          isDirty && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleReset}>
                Reset
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )
        }
      >
        <div className="space-y-6">
          <SettingsSection title="Device Tracking" description="Track and manage your active devices">
            <ToggleSwitch
              checked={formData.deviceManagement}
              onCheckedChange={(value) => handleToggleChange('deviceManagement', value)}
              label="Enable device management"
              description="Track your active devices and manage sessions"
            />
          </SettingsSection>

          <SettingsSection title="Active Devices" description="View and manage your active sessions">
            <div className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Current Device</h4>
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">Active</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">Windows 10 • Chrome • Localhost</p>
                <p className="text-xs text-gray-500">Last active: Just now</p>
              </div>
              
              <Button onClick={handleManageDevices} variant="outline" size="sm">
                Manage All Devices
              </Button>
            </div>
          </SettingsSection>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Security Information"
        description="Learn more about account security"
        icon={<Shield className="w-5 h-5" />}
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Security Best Practices</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Use a strong, unique password</li>
              <li>• Regularly review your active devices</li>
              <li>• Enable login notifications to monitor account activity</li>
              <li>• Log out from shared or public computers</li>
              <li>• Keep your browser and system updated</li>
            </ul>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Account Recovery</h4>
            <p className="text-sm text-gray-700 mb-3">
              If you lose access to your account, you can recover it using your email address and security questions.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Update Recovery Email
              </Button>
              <Button variant="outline" size="sm">
                Security Questions
              </Button>
            </div>
          </div>
        </div>
      </SettingsCard>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
} 
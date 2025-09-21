'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, Save, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';

interface AdminSettings {
  systemName: string;
  maintenanceMode: boolean;
  userRegistration: boolean;
  emailNotifications: boolean;
  analyticsEnabled: boolean;
  maxFileSize: number;
  sessionTimeout: number;
  apiRateLimit: number;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AdminSettings>({
    systemName: 'AI Toolbox',
    maintenanceMode: false,
    userRegistration: true,
    emailNotifications: true,
    analyticsEnabled: true,
    maxFileSize: 10,
    sessionTimeout: 24,
    apiRateLimit: 100
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSettings({
      systemName: 'AI Toolbox',
      maintenanceMode: false,
      userRegistration: true,
      emailNotifications: true,
      analyticsEnabled: true,
      maxFileSize: 10,
      sessionTimeout: 24,
      apiRateLimit: 100
    });
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="w-6 h-6 text-gray-700 dark:text-gray-200" />
          Admin Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Configure system-wide settings and preferences.
        </p>
      </div>

      <div className="space-y-6">
        {/* System Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>System Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="systemName">System Name</Label>
                <Input
                  id="systemName"
                  value={settings.systemName}
                  onChange={(e) => setSettings(prev => ({ ...prev, systemName: e.target.value }))}
                  placeholder="AI Toolbox"
                />
              </div>
              <div>
                <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                <Input
                  id="maxFileSize"
                  type="number"
                  value={settings.maxFileSize}
                  onChange={(e) => setSettings(prev => ({ ...prev, maxFileSize: parseInt(e.target.value) }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Security & Access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                <p className="text-sm text-gray-500">Temporarily disable user access</p>
              </div>
              <Switch
                id="maintenanceMode"
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, maintenanceMode: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="userRegistration">Allow User Registration</Label>
                <p className="text-sm text-gray-500">Enable new user sign-ups</p>
              </div>
              <Switch
                id="userRegistration"
                checked={settings.userRegistration}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, userRegistration: checked }))}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => setSettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="apiRateLimit">API Rate Limit (requests/min)</Label>
                <Input
                  id="apiRateLimit"
                  type="number"
                  value={settings.apiRateLimit}
                  onChange={(e) => setSettings(prev => ({ ...prev, apiRateLimit: parseInt(e.target.value) }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="emailNotifications">Email Notifications</Label>
                <p className="text-sm text-gray-500">Send system notifications via email</p>
              </div>
              <Switch
                id="emailNotifications"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailNotifications: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="analyticsEnabled">Analytics Collection</Label>
                <p className="text-sm text-gray-500">Collect usage analytics data</p>
              </div>
              <Switch
                id="analyticsEnabled"
                checked={settings.analyticsEnabled}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, analyticsEnabled: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {saved && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">Settings saved successfully!</span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={loading}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={loading}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Settings'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
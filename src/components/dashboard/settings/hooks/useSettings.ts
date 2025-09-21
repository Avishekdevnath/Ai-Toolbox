'use client';

import { useState, useEffect, useCallback } from 'react';

interface UserSettings {
  profile: {
    displayName: string;
    bio: string;
    avatar: string;
    timezone: string;
    language: string;
    dateFormat: string;
  };
  notifications: {
    email: {
      analysisResults: boolean;
      weeklyReports: boolean;
      systemUpdates: boolean;
      marketing: boolean;
    };
    push: {
      analysisComplete: boolean;
      newFeatures: boolean;
      reminders: boolean;
    };
    frequency: 'immediate' | 'daily' | 'weekly';
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends';
    shareAnalytics: boolean;
    allowDataCollection: boolean;
    showUsageStats: boolean;
  };
  application: {
    theme: 'light' | 'dark' | 'auto';
    compactMode: boolean;
    autoSave: boolean;
    defaultTool: string;
    resultsPerPage: number;
  };
  integrations: {
    exportFormat: 'json' | 'csv' | 'pdf';
    autoExport: boolean;
    webhookUrl?: string;
    apiKey?: string;
  };
  security: {
    twoFactorEnabled: boolean;
    sessionTimeout: number;
    loginNotifications: boolean;
    deviceManagement: boolean;
  };
  dataManagement: {
    autoDeleteOldAnalyses: boolean;
    retentionPeriod: number;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
    exportData: boolean;
  };
}

interface UseSettingsReturn {
  settings: UserSettings | null;
  loading: boolean;
  error: string | null;
  saving: boolean;
  fetchSettings: () => Promise<void>;
  updateSettings: (updates: Partial<UserSettings>) => Promise<boolean>;
  updateSection: (section: string, updates: any) => Promise<boolean>;
  resetSettings: () => void;
}

export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/user/settings');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch settings');
      }

      setSettings(data.data);
    } catch (err: any) {
      console.error('Error fetching settings:', err);
      setError(err.message || 'Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (updates: Partial<UserSettings>): Promise<boolean> => {
    try {
      setSaving(true);
      setError(null);

      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update settings');
      }

      setSettings(data.data);
      return true;
    } catch (err: any) {
      console.error('Error updating settings:', err);
      setError(err.message || 'Failed to update settings');
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  const updateSection = useCallback(async (section: string, updates: any): Promise<boolean> => {
    try {
      setSaving(true);
      setError(null);

      const response = await fetch(`/api/user/settings/${section}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to update ${section} settings`);
      }

      setSettings(prev => prev ? {
        ...prev,
        [section]: data.data
      } : null);

      return true;
    } catch (err: any) {
      console.error(`Error updating ${section} settings:`, err);
      setError(err.message || `Failed to update ${section} settings`);
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(null);
    setError(null);
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    error,
    saving,
    fetchSettings,
    updateSettings,
    updateSection,
    resetSettings,
  };
} 
'use client';

import React, { useState, useEffect } from 'react';
import { User, Globe, Calendar, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SettingsCard from './SettingsCard';
import SettingsSection from './SettingsSection';
import FileUpload from './FileUpload';
import { useSettings } from './hooks/useSettings';
import { useSettingsValidation } from './hooks/useSettingsValidation';

interface ProfileSettingsProps {
  className?: string;
}

export default function ProfileSettings({ className = '' }: ProfileSettingsProps) {
  const { settings, updateSection, saving, error } = useSettings();
  const { validateForm, errors, clearErrors } = useSettingsValidation();
  
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    avatar: '',
    timezone: 'UTC',
    language: 'en',
    dateFormat: 'MM/DD/YYYY'
  });

  const [isDirty, setIsDirty] = useState(false);

  // Initialize form data from settings
  useEffect(() => {
    if (settings?.profile) {
      setFormData({
        displayName: settings.profile.displayName || '',
        bio: settings.profile.bio || '',
        avatar: settings.profile.avatar || '',
        timezone: settings.profile.timezone || 'UTC',
        language: settings.profile.language || 'en',
        dateFormat: settings.profile.dateFormat || 'MM/DD/YYYY'
      });
    }
  }, [settings]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    clearErrors();
  };

  const handleAvatarUpload = (file: File | null) => {
    if (file) {
      // In a real app, you'd upload to cloud storage and get URL
      const avatarUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, avatar: avatarUrl }));
      setIsDirty(true);
    }
  };

  const handleSave = async () => {
    // Validate form
    const validationErrors = validateForm(formData, {
      displayName: { maxLength: 50 },
      bio: { maxLength: 500 }
    });

    if (validationErrors.length > 0) {
      return;
    }

    try {
      await updateSection('profile', formData);
      setIsDirty(false);
    } catch (error) {
      console.error('Failed to update profile settings:', error);
    }
  };

  const handleReset = () => {
    if (settings?.profile) {
      setFormData({
        displayName: settings.profile.displayName || '',
        bio: settings.profile.bio || '',
        avatar: settings.profile.avatar || '',
        timezone: settings.profile.timezone || 'UTC',
        language: settings.profile.language || 'en',
        dateFormat: settings.profile.dateFormat || 'MM/DD/YYYY'
      });
    }
    setIsDirty(false);
    clearErrors();
  };

  const timezoneOptions = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'London (GMT)' },
    { value: 'Europe/Paris', label: 'Paris (CET)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEDT)' }
  ];

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
    { value: 'fr', label: 'Français' },
    { value: 'de', label: 'Deutsch' },
    { value: 'zh', label: '中文' },
    { value: 'ja', label: '日本語' },
    { value: 'ko', label: '한국어' }
  ];

  const dateFormatOptions = [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US)' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (EU)' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center gap-3">
        <User className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Profile Settings
        </h2>
      </div>
      
      <p className="text-gray-600 dark:text-gray-400">
        Manage your personal information and profile preferences.
      </p>

      <SettingsCard
        title="Personal Information"
        description="Update your display name, bio, and profile picture"
        icon={<User className="w-5 h-5" />}
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
          {/* Avatar Upload */}
          <SettingsSection title="Profile Picture" description="Upload a profile picture">
            <FileUpload
              value={formData.avatar}
              onChange={handleAvatarUpload}
              accept="image/*"
              maxSize={5}
              label="Profile Picture"
              description="Upload a profile picture (max 5MB)"
            />
          </SettingsSection>

          {/* Display Name */}
          <SettingsSection title="Display Name" description="How your name appears to others">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) => handleInputChange('displayName', e.target.value)}
                placeholder="Enter your display name"
                maxLength={50}
                className={errors.find(e => e.field === 'displayName') ? 'border-red-500' : ''}
              />
              {errors.find(e => e.field === 'displayName') && (
                <p className="text-sm text-red-600">
                  {errors.find(e => e.field === 'displayName')?.message}
                </p>
              )}
              <p className="text-xs text-gray-500">
                {formData.displayName.length}/50 characters
              </p>
            </div>
          </SettingsSection>

          {/* Bio */}
          <SettingsSection title="Bio" description="Tell others about yourself">
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Tell us about yourself..."
                maxLength={500}
                rows={3}
                className={errors.find(e => e.field === 'bio') ? 'border-red-500' : ''}
              />
              {errors.find(e => e.field === 'bio') && (
                <p className="text-sm text-red-600">
                  {errors.find(e => e.field === 'bio')?.message}
                </p>
              )}
              <p className="text-xs text-gray-500">
                {formData.bio.length}/500 characters
              </p>
            </div>
          </SettingsSection>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Regional Settings"
        description="Configure your timezone, language, and date format"
        icon={<Globe className="w-5 h-5" />}
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
          {/* Timezone */}
          <SettingsSection title="Timezone" description="Set your local timezone">
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={formData.timezone} onValueChange={(value) => handleInputChange('timezone', value)}>
                <SelectTrigger id="timezone">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {timezoneOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </SettingsSection>

          {/* Language */}
          <SettingsSection title="Language" description="Choose your preferred language">
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select value={formData.language} onValueChange={(value) => handleInputChange('language', value)}>
                <SelectTrigger id="language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languageOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </SettingsSection>

          {/* Date Format */}
          <SettingsSection title="Date Format" description="Choose how dates are displayed">
            <div className="space-y-2">
              <Label htmlFor="dateFormat">Date Format</Label>
              <Select value={formData.dateFormat} onValueChange={(value) => handleInputChange('dateFormat', value)}>
                <SelectTrigger id="dateFormat">
                  <SelectValue placeholder="Select date format" />
                </SelectTrigger>
                <SelectContent>
                  {dateFormatOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </SettingsSection>
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
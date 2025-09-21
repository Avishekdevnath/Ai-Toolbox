'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { 
  User, 
  Bell, 
  Shield, 
  Settings, 
  Database, 
  Zap,
  ChevronRight,
  Palette
} from 'lucide-react';
import ProfileSettings from '@/components/dashboard/settings/ProfileSettings';
import NotificationSettings from '@/components/dashboard/settings/NotificationSettings';
import PrivacySettings from '@/components/dashboard/settings/PrivacySettings';
import ApplicationSettings from '@/components/dashboard/settings/ApplicationSettings';
import SecuritySettings from '@/components/dashboard/settings/SecuritySettings';
import DataManagementSettings from '@/components/dashboard/settings/DataManagementSettings';
import IntegrationSettings from '@/components/dashboard/settings/IntegrationSettings';

interface SettingsSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  component: React.ComponentType;
}

const settingsSections: SettingsSection[] = [
  {
    id: 'profile',
    title: 'Profile',
    icon: <User className="w-5 h-5" />,
    component: ProfileSettings
  },
  {
    id: 'notifications',
    title: 'Notifications',
    icon: <Bell className="w-5 h-5" />,
    component: NotificationSettings
  },
  {
    id: 'privacy',
    title: 'Privacy',
    icon: <Shield className="w-5 h-5" />,
    component: PrivacySettings
  },
  {
    id: 'application',
    title: 'Application',
    icon: <Palette className="w-5 h-5" />,
    component: ApplicationSettings
  },
  {
    id: 'security',
    title: 'Security',
    icon: <Shield className="w-5 h-5" />,
    component: SecuritySettings
  },
  {
    id: 'data-management',
    title: 'Data Management',
    icon: <Database className="w-5 h-5" />,
    component: DataManagementSettings
  },
  {
    id: 'integrations',
    title: 'Integrations',
    icon: <Zap className="w-5 h-5" />,
    component: IntegrationSettings
  }
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner text="Loading settings..." />
      </div>
    );
  }

  const activeComponent = settingsSections.find(section => section.id === activeSection)?.component;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-3 md:px-4 py-4 md:py-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-sm md:text-base text-gray-600">Manage your account preferences and settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <Card className="p-3 md:p-4">
              <nav className="space-y-1 md:space-y-2">
                {settingsSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center justify-between p-2 md:p-3 rounded-lg text-left transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2 md:space-x-3">
                      <div className="w-4 h-4 md:w-5 md:h-5">{section.icon}</div>
                      <span className="font-medium text-sm md:text-base">{section.title}</span>
                    </div>
                    <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
                  </button>
                ))}
              </nav>
            </Card>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            <Card className="p-4 md:p-6">
              {activeComponent && <activeComponent />}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 
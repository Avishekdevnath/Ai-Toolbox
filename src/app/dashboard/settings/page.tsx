'use client';

import React, { useState } from 'react';
import { User, Bell, Shield, Palette, Database, Zap, ChevronRight } from 'lucide-react';
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
  { id: 'profile', title: 'Profile', icon: <User size={15} />, component: ProfileSettings },
  { id: 'notifications', title: 'Notifications', icon: <Bell size={15} />, component: NotificationSettings },
  { id: 'privacy', title: 'Privacy', icon: <Shield size={15} />, component: PrivacySettings },
  { id: 'application', title: 'Application', icon: <Palette size={15} />, component: ApplicationSettings },
  { id: 'security', title: 'Security', icon: <Shield size={15} />, component: SecuritySettings },
  { id: 'data-management', title: 'Data Management', icon: <Database size={15} />, component: DataManagementSettings },
  { id: 'integrations', title: 'Integrations', icon: <Zap size={15} />, component: IntegrationSettings },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('profile');

  const ActiveComponent = settingsSections.find(s => s.id === activeSection)?.component;
  const activeTitle = settingsSections.find(s => s.id === activeSection)?.title;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-slate-800">Settings</h1>
        <p className="text-[12px] text-slate-400 mt-0.5">Manage your account preferences and settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        <div className="lg:col-span-1">
          <nav className="bg-white border border-slate-200 rounded-xl p-2 space-y-0.5">
            {settingsSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors ${
                  activeSection === section.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={activeSection === section.id ? 'text-blue-600' : 'text-slate-400'}>{section.icon}</span>
                  <span className="text-[13px] font-medium">{section.title}</span>
                </div>
                <ChevronRight size={13} className={activeSection === section.id ? 'text-blue-500' : 'text-slate-300'} />
              </button>
            ))}
          </nav>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            {ActiveComponent && React.createElement(ActiveComponent)}
          </div>
        </div>
      </div>
    </div>
  );
}

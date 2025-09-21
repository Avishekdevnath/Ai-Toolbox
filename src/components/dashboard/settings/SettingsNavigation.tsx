'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Bell, 
  Shield, 
  Settings, 
  Palette, 
  Database, 
  Zap,
  ChevronRight
} from 'lucide-react';

interface SettingsSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
}

const settingsSections: SettingsSection[] = [
  {
    id: 'profile',
    title: 'Profile',
    description: 'Manage your personal information',
    icon: <User className="w-5 h-5" />,
    href: '#profile'
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Control your notification preferences',
    icon: <Bell className="w-5 h-5" />,
    href: '#notifications'
  },
  {
    id: 'privacy',
    title: 'Privacy',
    description: 'Manage your privacy settings',
    icon: <Shield className="w-5 h-5" />,
    href: '#privacy'
  },
  {
    id: 'application',
    title: 'Application',
    description: 'Customize your app experience',
    icon: <Settings className="w-5 h-5" />,
    href: '#application'
  },
  {
    id: 'security',
    title: 'Security',
    description: 'Manage your account security',
    icon: <Shield className="w-5 h-5" />,
    href: '#security'
  },
  {
    id: 'data-management',
    title: 'Data Management',
    description: 'Control your data and backups',
    icon: <Database className="w-5 h-5" />,
    href: '#data-management'
  },
  {
    id: 'integrations',
    title: 'Integrations',
    description: 'Manage API and webhook settings',
    icon: <Zap className="w-5 h-5" />,
    href: '#integrations'
  }
];

interface SettingsNavigationProps {
  activeSection?: string;
  onSectionChange?: (sectionId: string) => void;
}

export default function SettingsNavigation({ 
  activeSection = 'profile', 
  onSectionChange 
}: SettingsNavigationProps) {
  const handleSectionClick = (sectionId: string) => {
    if (onSectionChange) {
      onSectionChange(sectionId);
    }
  };

  return (
    <Card className="p-4">
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
          Settings
        </h3>
        
        <nav className="space-y-1">
          {settingsSections.map((section) => {
            const isActive = activeSection === section.id;
            
            return (
              <Button
                key={section.id}
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start h-auto p-3 ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
                onClick={() => handleSectionClick(section.id)}
              >
                <div className="flex items-center w-full">
                  <div className={`mr-3 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {section.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <div className={`font-medium ${isActive ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-white'}`}>
                      {section.title}
                    </div>
                    <div className={`text-sm ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                      {section.description}
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 ml-2 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`} />
                </div>
              </Button>
            );
          })}
        </nav>
      </div>
    </Card>
  );
} 
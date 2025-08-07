'use client';

import { useEffect } from 'react';
import { AlertSystem, useAlertSystem } from "@/components/AlertSystem";
import { WarningSystem, useWarningSystem } from "@/components/WarningSystem";

export default function DashboardClient() {
  const { alerts, removeAlert, showSuccess, showWarning } = useAlertSystem();
  const { warnings, removeWarning, showSecurityWarning } = useWarningSystem();

  // Show welcome message on first visit
  useEffect(() => {
    const hasVisited = localStorage.getItem('dashboard-visited');
    if (!hasVisited) {
      showSuccess(
        'Welcome to AI Toolbox!',
        'Your account is now set up and ready to use. Explore our powerful AI features.',
        { duration: 5000 }
      );
      localStorage.setItem('dashboard-visited', 'true');
    }

    // Show security tip
    showSecurityWarning(
      'Security Tip',
      'Consider enabling two-factor authentication for enhanced account security.',
      'medium',
      {
        action: {
          label: 'Go to Security',
          onClick: () => window.location.href = '/security',
        },
        secondaryAction: {
          label: 'Dismiss',
          onClick: () => {},
        },
        dismissible: true,
      }
    );
  }, []);

  return (
    <>
      <AlertSystem alerts={alerts} onDismiss={removeAlert} />
      <WarningSystem warnings={warnings} onDismiss={removeWarning} onAction={(id, type) => {
        // Handle warning actions
        removeWarning(id);
      }} />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome to Your Dashboard
            </h2>
            <p className="text-gray-600 mb-6">
              You're successfully authenticated! This is your protected dashboard where you can access all the AI tools and features.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  AI Models
                </h3>
                <p className="text-blue-700">
                  Access to the latest AI models and algorithms for your projects.
                </p>
              </div>
              
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  Real-time Processing
                </h3>
                <p className="text-green-700">
                  Lightning-fast processing and real-time results for your applications.
                </p>
              </div>
              
              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-900 mb-2">
                  Secure & Private
                </h3>
                <p className="text-purple-700">
                  Enterprise-grade security and privacy protection for your data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
} 
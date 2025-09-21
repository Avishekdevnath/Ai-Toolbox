'use client';

import { AlertSystem, useAlertSystem } from '@/components/AlertSystem';
import { WarningSystem, useWarningSystem } from '@/components/WarningSystem';

interface GlobalNotificationProviderProps {
  children: React.ReactNode;
}

export default function GlobalNotificationProvider({ children }: GlobalNotificationProviderProps) {
  const { alerts, removeAlert, showSuccess, showError, showWarning, showInfo, showLoading } = useAlertSystem();
  const { warnings, removeWarning, showSecurityWarning, showPrivacyWarning, showPerformanceWarning, showMaintenanceWarning, showUpdateWarning } = useWarningSystem();

  // Make the notification systems available globally
  if (typeof window !== 'undefined') {
    (window as any).showSuccess = showSuccess;
    (window as any).showError = showError;
    (window as any).showWarning = showWarning;
    (window as any).showInfo = showInfo;
    (window as any).showLoading = showLoading;
    (window as any).showSecurityWarning = showSecurityWarning;
    (window as any).showPrivacyWarning = showPrivacyWarning;
    (window as any).showPerformanceWarning = showPerformanceWarning;
    (window as any).showMaintenanceWarning = showMaintenanceWarning;
    (window as any).showUpdateWarning = showUpdateWarning;
  }

  return (
    <>
      <AlertSystem alerts={alerts} onDismiss={removeAlert} />
      <WarningSystem 
        warnings={warnings} 
        onDismiss={removeWarning} 
        onAction={(id, type) => {
          removeWarning(id);
        }} 
      />
      {children}
    </>
  );
} 
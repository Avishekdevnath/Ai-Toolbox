'use client';

import { useState, useEffect } from 'react';

export type WarningType = 'security' | 'privacy' | 'performance' | 'maintenance' | 'update';

export interface Warning {
  id: string;
  type: WarningType;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  dismissible?: boolean;
  actions?: {
    primary?: {
      label: string;
      onClick: () => void;
    };
    secondary?: {
      label: string;
      onClick: () => void;
    };
  };
  autoDismiss?: number; // milliseconds
}

interface WarningSystemProps {
  warnings: Warning[];
  onDismiss: (id: string) => void;
  onAction: (id: string, actionType: 'primary' | 'secondary') => void;
  maxWarnings?: number;
}

interface WarningItemProps {
  warning: Warning;
  onDismiss: (id: string) => void;
  onAction: (id: string, actionType: 'primary' | 'secondary') => void;
}

export function WarningItem({ warning, onDismiss, onAction }: WarningItemProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isDismissing, setIsDismissing] = useState(false);

  useEffect(() => {
    if (warning.autoDismiss && warning.autoDismiss > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, warning.autoDismiss);
      return () => clearTimeout(timer);
    }
  }, [warning.autoDismiss]);

  const handleDismiss = () => {
    setIsDismissing(true);
    setTimeout(() => {
      setIsVisible(false);
      onDismiss(warning.id);
    }, 300);
  };

  const handleAction = (actionType: 'primary' | 'secondary') => {
    onAction(warning.id, actionType);
  };

  const getWarningStyles = () => {
    const baseStyles = {
      container: 'border rounded-lg p-4 transition-all duration-300',
      icon: '',
      title: '',
      message: '',
      button: '',
      primaryAction: '',
      secondaryAction: '',
    };

    switch (warning.severity) {
      case 'critical':
        return {
          ...baseStyles,
          container: `${baseStyles.container} bg-red-50 border-red-300 text-red-800`,
          icon: 'text-red-500',
          title: 'text-red-900 font-semibold',
          message: 'text-red-700',
          button: 'text-red-500 hover:text-red-700',
          primaryAction: 'bg-red-600 hover:bg-red-700 text-white',
          secondaryAction: 'bg-red-100 hover:bg-red-200 text-red-800',
        };
      case 'high':
        return {
          ...baseStyles,
          container: `${baseStyles.container} bg-orange-50 border-orange-300 text-orange-800`,
          icon: 'text-orange-500',
          title: 'text-orange-900 font-semibold',
          message: 'text-orange-700',
          button: 'text-orange-500 hover:text-orange-700',
          primaryAction: 'bg-orange-600 hover:bg-orange-700 text-white',
          secondaryAction: 'bg-orange-100 hover:bg-orange-200 text-orange-800',
        };
      case 'medium':
        return {
          ...baseStyles,
          container: `${baseStyles.container} bg-yellow-50 border-yellow-300 text-yellow-800`,
          icon: 'text-yellow-500',
          title: 'text-yellow-900 font-semibold',
          message: 'text-yellow-700',
          button: 'text-yellow-500 hover:text-yellow-700',
          primaryAction: 'bg-yellow-600 hover:bg-yellow-700 text-white',
          secondaryAction: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800',
        };
      case 'low':
        return {
          ...baseStyles,
          container: `${baseStyles.container} bg-blue-50 border-blue-300 text-blue-800`,
          icon: 'text-blue-500',
          title: 'text-blue-900 font-semibold',
          message: 'text-blue-700',
          button: 'text-blue-500 hover:text-blue-700',
          primaryAction: 'bg-blue-600 hover:bg-blue-700 text-white',
          secondaryAction: 'bg-blue-100 hover:bg-blue-200 text-blue-800',
        };
      default:
        return baseStyles;
    }
  };

  const getIcon = () => {
    switch (warning.type) {
      case 'security':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
        );
      case 'privacy':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
      case 'performance':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
          </svg>
        );
      case 'maintenance':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
        );
      case 'update':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const styles = getWarningStyles();

  if (!isVisible) return null;

  return (
    <div
      className={`${
        isDismissing ? 'opacity-0 transform translate-x-full' : 'opacity-100 transform translate-x-0'
      } ${styles.container}`}
    >
      <div className="flex items-start">
        <div className={`flex-shrink-0 ${styles.icon}`}>
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <div className="flex items-center justify-between">
            <h3 className={`text-sm font-medium ${styles.title}`}>
              {warning.title}
            </h3>
            {warning.dismissible && (
              <button
                onClick={handleDismiss}
                className={`ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex ${styles.button} focus:outline-none focus:ring-2 focus:ring-offset-2`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
          <div className={`mt-1 text-sm ${styles.message}`}>
            {warning.message}
          </div>
          {warning.actions && (
            <div className="mt-3 flex space-x-2">
              {warning.actions.primary && (
                <button
                  onClick={() => handleAction('primary')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${styles.primaryAction}`}
                >
                  {warning.actions.primary.label}
                </button>
              )}
              {warning.actions.secondary && (
                <button
                  onClick={() => handleAction('secondary')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${styles.secondaryAction}`}
                >
                  {warning.actions.secondary.label}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function WarningSystem({ warnings, onDismiss, onAction, maxWarnings = 3 }: WarningSystemProps) {
  const visibleWarnings = warnings.slice(0, maxWarnings);

  if (visibleWarnings.length === 0) return null;

  return (
    <div className="fixed top-4 left-4 z-50 space-y-3 max-w-sm w-full">
      {visibleWarnings.map((warning) => (
        <WarningItem
          key={warning.id}
          warning={warning}
          onDismiss={onDismiss}
          onAction={onAction}
        />
      ))}
    </div>
  );
}

// Hook for managing warnings
export function useWarningSystem() {
  const [warnings, setWarnings] = useState<Warning[]>([]);

  const addWarning = (warning: Omit<Warning, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newWarning = { ...warning, id, dismissible: warning.dismissible ?? true };
    setWarnings(prev => [...prev, newWarning]);
    return id;
  };

  const removeWarning = (id: string) => {
    setWarnings(prev => prev.filter(warning => warning.id !== id));
  };

  const clearWarnings = () => {
    setWarnings([]);
  };

  const showSecurityWarning = (
    title: string, 
    message: string, 
    severity: Warning['severity'] = 'medium',
    actions?: Warning['actions'],
    options?: Partial<Warning>
  ) => {
    return addWarning({ 
      type: 'security', 
      title, 
      message, 
      severity, 
      actions, 
      ...options 
    });
  };

  const showPrivacyWarning = (
    title: string, 
    message: string, 
    severity: Warning['severity'] = 'medium',
    actions?: Warning['actions'],
    options?: Partial<Warning>
  ) => {
    return addWarning({ 
      type: 'privacy', 
      title, 
      message, 
      severity, 
      actions, 
      ...options 
    });
  };

  const showPerformanceWarning = (
    title: string, 
    message: string, 
    severity: Warning['severity'] = 'low',
    actions?: Warning['actions'],
    options?: Partial<Warning>
  ) => {
    return addWarning({ 
      type: 'performance', 
      title, 
      message, 
      severity, 
      actions, 
      ...options 
    });
  };

  const showMaintenanceWarning = (
    title: string, 
    message: string, 
    severity: Warning['severity'] = 'medium',
    actions?: Warning['actions'],
    options?: Partial<Warning>
  ) => {
    return addWarning({ 
      type: 'maintenance', 
      title, 
      message, 
      severity, 
      actions, 
      ...options 
    });
  };

  const showUpdateWarning = (
    title: string, 
    message: string, 
    severity: Warning['severity'] = 'low',
    actions?: Warning['actions'],
    options?: Partial<Warning>
  ) => {
    return addWarning({ 
      type: 'update', 
      title, 
      message, 
      severity, 
      actions, 
      ...options 
    });
  };

  return {
    warnings,
    addWarning,
    removeWarning,
    clearWarnings,
    showSecurityWarning,
    showPrivacyWarning,
    showPerformanceWarning,
    showMaintenanceWarning,
    showUpdateWarning,
  };
} 
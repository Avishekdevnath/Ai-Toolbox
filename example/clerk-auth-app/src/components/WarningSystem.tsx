'use client';

import { useState, useEffect } from 'react';

export type WarningType = 'security' | 'privacy' | 'session' | 'browser' | 'network';

export interface Warning {
  id: string;
  type: WarningType;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  dismissible?: boolean;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

interface WarningSystemProps {
  warnings: Warning[];
  onDismiss: (id: string) => void;
  onAction: (id: string, actionType: 'primary' | 'secondary') => void;
}

interface WarningItemProps {
  warning: Warning;
  onDismiss: (id: string) => void;
  onAction: (id: string, actionType: 'primary' | 'secondary') => void;
}

export function WarningItem({ warning, onDismiss, onAction }: WarningItemProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isDismissing, setIsDismissing] = useState(false);

  const handleDismiss = () => {
    if (warning.persistent) return;
    
    setIsDismissing(true);
    setTimeout(() => {
      setIsVisible(false);
      onDismiss(warning.id);
    }, 300);
  };

  const handleAction = (actionType: 'primary' | 'secondary') => {
    if (actionType === 'primary' && warning.action) {
      warning.action.onClick();
    } else if (actionType === 'secondary' && warning.secondaryAction) {
      warning.secondaryAction.onClick();
    }
    
    if (!warning.persistent) {
      handleDismiss();
    }
  };

  const getWarningStyles = () => {
    const baseStyles = {
      container: 'border-l-4 p-4 rounded-r-lg',
      icon: 'flex-shrink-0',
      title: 'text-sm font-medium',
      message: 'text-sm mt-1',
      button: 'inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md transition-colors',
    };

    switch (warning.severity) {
      case 'critical':
        return {
          ...baseStyles,
          container: `${baseStyles.container} bg-red-50 border-red-400`,
          icon: `${baseStyles.icon} text-red-400`,
          title: `${baseStyles.title} text-red-800`,
          message: `${baseStyles.message} text-red-700`,
          primaryButton: `${baseStyles.button} border-red-300 text-red-700 bg-red-100 hover:bg-red-200`,
          secondaryButton: `${baseStyles.button} border-gray-300 text-gray-700 bg-white hover:bg-gray-50`,
        };
      case 'high':
        return {
          ...baseStyles,
          container: `${baseStyles.container} bg-orange-50 border-orange-400`,
          icon: `${baseStyles.icon} text-orange-400`,
          title: `${baseStyles.title} text-orange-800`,
          message: `${baseStyles.message} text-orange-700`,
          primaryButton: `${baseStyles.button} border-orange-300 text-orange-700 bg-orange-100 hover:bg-orange-200`,
          secondaryButton: `${baseStyles.button} border-gray-300 text-gray-700 bg-white hover:bg-gray-50`,
        };
      case 'medium':
        return {
          ...baseStyles,
          container: `${baseStyles.container} bg-yellow-50 border-yellow-400`,
          icon: `${baseStyles.icon} text-yellow-400`,
          title: `${baseStyles.title} text-yellow-800`,
          message: `${baseStyles.message} text-yellow-700`,
          primaryButton: `${baseStyles.button} border-yellow-300 text-yellow-700 bg-yellow-100 hover:bg-yellow-200`,
          secondaryButton: `${baseStyles.button} border-gray-300 text-gray-700 bg-white hover:bg-gray-50`,
        };
      case 'low':
        return {
          ...baseStyles,
          container: `${baseStyles.container} bg-blue-50 border-blue-400`,
          icon: `${baseStyles.icon} text-blue-400`,
          title: `${baseStyles.title} text-blue-800`,
          message: `${baseStyles.message} text-blue-700`,
          primaryButton: `${baseStyles.button} border-blue-300 text-blue-700 bg-blue-100 hover:bg-blue-200`,
          secondaryButton: `${baseStyles.button} border-gray-300 text-gray-700 bg-white hover:bg-gray-50`,
        };
      default:
        return {
          ...baseStyles,
          container: `${baseStyles.container} bg-gray-50 border-gray-400`,
          icon: `${baseStyles.icon} text-gray-400`,
          title: `${baseStyles.title} text-gray-800`,
          message: `${baseStyles.message} text-gray-700`,
          primaryButton: `${baseStyles.button} border-gray-300 text-gray-700 bg-gray-100 hover:bg-gray-200`,
          secondaryButton: `${baseStyles.button} border-gray-300 text-gray-700 bg-white hover:bg-gray-50`,
        };
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
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
          </svg>
        );
      case 'session':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
      case 'browser':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'network':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
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
      className={`transition-all duration-300 ${
        isDismissing ? 'opacity-0 transform translate-x-full' : 'opacity-100 transform translate-x-0'
      } ${styles.container}`}
    >
      <div className="flex">
        <div className={`${styles.icon}`}>
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <div className="flex items-center justify-between">
            <h3 className={styles.title}>
              {warning.title}
            </h3>
            {warning.dismissible && !warning.persistent && (
              <button
                onClick={handleDismiss}
                className="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
          <div className={styles.message}>
            {warning.message}
          </div>
          <div className="mt-3 flex space-x-3">
            {warning.action && (
              <button
                onClick={() => handleAction('primary')}
                className={styles.primaryButton}
              >
                {warning.action.label}
              </button>
            )}
            {warning.secondaryAction && (
              <button
                onClick={() => handleAction('secondary')}
                className={styles.secondaryButton}
              >
                {warning.secondaryAction.label}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function WarningSystem({ warnings, onDismiss, onAction }: WarningSystemProps) {
  if (warnings.length === 0) return null;

  return (
    <div className="space-y-4">
      {warnings.map((warning) => (
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

  const showSecurityWarning = (title: string, message: string, severity: Warning['severity'] = 'medium', options?: Partial<Warning>) => {
    return addWarning({ type: 'security', title, message, severity, ...options });
  };

  const showPrivacyWarning = (title: string, message: string, severity: Warning['severity'] = 'medium', options?: Partial<Warning>) => {
    return addWarning({ type: 'privacy', title, message, severity, ...options });
  };

  const showSessionWarning = (title: string, message: string, severity: Warning['severity'] = 'medium', options?: Partial<Warning>) => {
    return addWarning({ type: 'session', title, message, severity, ...options });
  };

  const showBrowserWarning = (title: string, message: string, severity: Warning['severity'] = 'low', options?: Partial<Warning>) => {
    return addWarning({ type: 'browser', title, message, severity, ...options });
  };

  const showNetworkWarning = (title: string, message: string, severity: Warning['severity'] = 'medium', options?: Partial<Warning>) => {
    return addWarning({ type: 'network', title, message, severity, ...options });
  };

  return {
    warnings,
    addWarning,
    removeWarning,
    clearWarnings,
    showSecurityWarning,
    showPrivacyWarning,
    showSessionWarning,
    showBrowserWarning,
    showNetworkWarning,
  };
} 
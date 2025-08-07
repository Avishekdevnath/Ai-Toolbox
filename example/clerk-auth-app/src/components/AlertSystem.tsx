'use client';

import { useState, useEffect } from 'react';

export type AlertType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface Alert {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  duration?: number;
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface AlertSystemProps {
  alerts: Alert[];
  onDismiss: (id: string) => void;
  maxAlerts?: number;
}

interface AlertItemProps {
  alert: Alert;
  onDismiss: (id: string) => void;
}

export function AlertItem({ alert, onDismiss }: AlertItemProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isDismissing, setIsDismissing] = useState(false);

  useEffect(() => {
    if (alert.duration && alert.duration > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, alert.duration);
      return () => clearTimeout(timer);
    }
  }, [alert.duration]);

  const handleDismiss = () => {
    setIsDismissing(true);
    setTimeout(() => {
      setIsVisible(false);
      onDismiss(alert.id);
    }, 300);
  };

  const getAlertStyles = () => {
    switch (alert.type) {
      case 'success':
        return {
          container: 'bg-green-50 border-green-200 text-green-800',
          icon: 'text-green-400',
          title: 'text-green-800',
          message: 'text-green-700',
          button: 'text-green-500 hover:text-green-700',
          action: 'bg-green-100 hover:bg-green-200 text-green-800',
        };
      case 'error':
        return {
          container: 'bg-red-50 border-red-200 text-red-800',
          icon: 'text-red-400',
          title: 'text-red-800',
          message: 'text-red-700',
          button: 'text-red-500 hover:text-red-700',
          action: 'bg-red-100 hover:bg-red-200 text-red-800',
        };
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
          icon: 'text-yellow-400',
          title: 'text-yellow-800',
          message: 'text-yellow-700',
          button: 'text-yellow-500 hover:text-yellow-700',
          action: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800',
        };
      case 'info':
        return {
          container: 'bg-blue-50 border-blue-200 text-blue-800',
          icon: 'text-blue-400',
          title: 'text-blue-800',
          message: 'text-blue-700',
          button: 'text-blue-500 hover:text-blue-700',
          action: 'bg-blue-100 hover:bg-blue-200 text-blue-800',
        };
      case 'loading':
        return {
          container: 'bg-gray-50 border-gray-200 text-gray-800',
          icon: 'text-gray-400',
          title: 'text-gray-800',
          message: 'text-gray-700',
          button: 'text-gray-500 hover:text-gray-700',
          action: 'bg-gray-100 hover:bg-gray-200 text-gray-800',
        };
      default:
        return {
          container: 'bg-gray-50 border-gray-200 text-gray-800',
          icon: 'text-gray-400',
          title: 'text-gray-800',
          message: 'text-gray-700',
          button: 'text-gray-500 hover:text-gray-700',
          action: 'bg-gray-100 hover:bg-gray-200 text-gray-800',
        };
    }
  };

  const getIcon = () => {
    switch (alert.type) {
      case 'success':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
      case 'loading':
        return (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
        );
      default:
        return null;
    }
  };

  const styles = getAlertStyles();

  if (!isVisible) return null;

  return (
    <div
      className={`border rounded-lg p-4 transition-all duration-300 ${
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
              {alert.title}
            </h3>
            {alert.dismissible && (
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
            {alert.message}
          </div>
          {alert.action && (
            <div className="mt-3">
              <button
                onClick={alert.action.onClick}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${styles.action}`}
              >
                {alert.action.label}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function AlertSystem({ alerts, onDismiss, maxAlerts = 5 }: AlertSystemProps) {
  const visibleAlerts = alerts.slice(0, maxAlerts);

  if (visibleAlerts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full">
      {visibleAlerts.map((alert) => (
        <AlertItem
          key={alert.id}
          alert={alert}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
}

// Hook for managing alerts
export function useAlertSystem() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const addAlert = (alert: Omit<Alert, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newAlert = { ...alert, id, dismissible: alert.dismissible ?? true };
    setAlerts(prev => [...prev, newAlert]);
    return id;
  };

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const clearAlerts = () => {
    setAlerts([]);
  };

  const showSuccess = (title: string, message: string, options?: Partial<Alert>) => {
    return addAlert({ type: 'success', title, message, ...options });
  };

  const showError = (title: string, message: string, options?: Partial<Alert>) => {
    return addAlert({ type: 'error', title, message, ...options });
  };

  const showWarning = (title: string, message: string, options?: Partial<Alert>) => {
    return addAlert({ type: 'warning', title, message, ...options });
  };

  const showInfo = (title: string, message: string, options?: Partial<Alert>) => {
    return addAlert({ type: 'info', title, message, ...options });
  };

  const showLoading = (title: string, message: string, options?: Partial<Alert>) => {
    return addAlert({ type: 'loading', title, message, dismissible: false, ...options });
  };

  return {
    alerts,
    addAlert,
    removeAlert,
    clearAlerts,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
  };
} 
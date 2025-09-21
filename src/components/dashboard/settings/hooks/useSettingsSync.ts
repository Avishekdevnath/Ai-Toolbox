'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useState } from 'react';

interface SettingsSyncOptions {
  storageKey?: string;
  debounceMs?: number;
  enableCrossTabSync?: boolean;
}

interface UseSettingsSyncReturn {
  saveToStorage: (data: any) => void;
  loadFromStorage: () => any;
  clearStorage: () => void;
  subscribeToChanges: (callback: (data: any) => void) => () => void;
}

export function useSettingsSync(options: SettingsSyncOptions = {}): UseSettingsSyncReturn {
  const {
    storageKey = 'ai-toolbox-settings',
    debounceMs = 1000,
    enableCrossTabSync = true
  } = options;

  const timeoutRef = useRef<NodeJS.Timeout>();
  const listenersRef = useRef<Set<(data: any) => void>>(new Set());

  // Debounced save function
  const debouncedSave = useCallback((data: any) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify({
          data,
          timestamp: Date.now()
        }));
      } catch (error) {
        console.error('Failed to save settings to localStorage:', error);
      }
    }, debounceMs);
  }, [storageKey, debounceMs]);

  // Save to storage
  const saveToStorage = useCallback((data: any) => {
    debouncedSave(data);
  }, [debouncedSave]);

  // Load from storage
  const loadFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.data;
      }
    } catch (error) {
      console.error('Failed to load settings from localStorage:', error);
    }
    return null;
  }, [storageKey]);

  // Clear storage
  const clearStorage = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Failed to clear settings from localStorage:', error);
    }
  }, [storageKey]);

  // Subscribe to changes
  const subscribeToChanges = useCallback((callback: (data: any) => void) => {
    listenersRef.current.add(callback);

    // Return unsubscribe function
    return () => {
      listenersRef.current.delete(callback);
    };
  }, []);

  // Notify all listeners
  const notifyListeners = useCallback((data: any) => {
    listenersRef.current.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in settings sync listener:', error);
      }
    });
  }, []);

  // Handle storage events (cross-tab sync)
  useEffect(() => {
    if (!enableCrossTabSync) return;

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === storageKey && event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue);
          notifyListeners(parsed.data);
        } catch (error) {
          console.error('Failed to parse settings from storage event:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [storageKey, enableCrossTabSync, notifyListeners]);

  // Handle beforeunload to save any pending changes
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        // Force immediate save
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          localStorage.setItem(storageKey, JSON.stringify({
            ...parsed,
            timestamp: Date.now()
          }));
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [storageKey]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    saveToStorage,
    loadFromStorage,
    clearStorage,
    subscribeToChanges,
  };
}

// Hook for syncing settings with optimistic updates
export function useOptimisticSettingsSync(initialSettings: any, options?: SettingsSyncOptions) {
  const [settings, setSettings] = useState(initialSettings);
  const { saveToStorage, subscribeToChanges } = useSettingsSync(options);

  // Optimistic update function
  const updateSettings = useCallback((updates: any) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    saveToStorage(newSettings);
  }, [settings, saveToStorage]);

  // Subscribe to changes from other tabs
  useEffect(() => {
    const unsubscribe = subscribeToChanges((data) => {
      setSettings(data);
    });

    return unsubscribe;
  }, [subscribeToChanges]);

  return {
    settings,
    updateSettings,
    setSettings,
  };
} 
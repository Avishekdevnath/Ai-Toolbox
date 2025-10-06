'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface UseRealtimeCollaborationProps {
  snippetId: string;
  onContentChange: (content: string) => void;
  onTitleChange: (title: string) => void;
  onLanguageChange: (language: string) => void;
  onVisibilityChange: (isPublic: boolean) => void;
  onCursorChange: (position: number) => void;
}

export function useRealtimeCollaboration({
  snippetId,
  onContentChange,
  onTitleChange,
  onLanguageChange,
  onVisibilityChange,
  onCursorChange,
}: UseRealtimeCollaborationProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const [isLocalChange, setIsLocalChange] = useState(false);
  const lastSyncRef = useRef<number>(0);
  const userIdRef = useRef<string>(Math.random().toString(36).substring(2, 15));
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Poll for updates
  const pollForUpdates = useCallback(async () => {
    if (!snippetId || isLocalChange) return;

    try {
      const response = await fetch(`/api/collaborate/${snippetId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.lastUpdated > lastSyncRef.current) {
          lastSyncRef.current = data.data.lastUpdated;
          setActiveUsers(data.data.activeUsers || []);
          setIsConnected(true);
          
          // Only update if the data is actually different and not empty
          if (data.data.content !== undefined && data.data.content !== '') {
            onContentChange(data.data.content);
          }
          if (data.data.title !== undefined && data.data.title !== '') {
            onTitleChange(data.data.title);
          }
          if (data.data.language !== undefined) {
            onLanguageChange(data.data.language);
          }
          if (data.data.isPublic !== undefined) {
            onVisibilityChange(data.data.isPublic);
          }
        }
      }
    } catch (error) {
      console.error('Error polling for updates:', error);
      setIsConnected(false);
    }
  }, [snippetId, isLocalChange, onContentChange, onTitleChange, onLanguageChange, onVisibilityChange]);

  // Start SSE subscription and refresh on visibility/focus
  useEffect(() => {
    if (!snippetId) return;

    // Initial fetch
    pollForUpdates();

    // Subscribe to server-sent events for updates-after-save
    try {
      const es = new EventSource(`/api/collaborate/${snippetId}?stream=1`);
      eventSourceRef.current = es;
      es.addEventListener('update', () => {
        // Only fetch fresh data when server signals an update
        pollForUpdates();
      });
      // Optional: handle errors
      es.onerror = () => {
        // fallback: refresh once on error
        pollForUpdates();
      };
    } catch {}

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        pollForUpdates();
      }
    };
    const handleFocus = () => {
      pollForUpdates();
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleFocus);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = null as any;
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleFocus);
    };
  }, [snippetId, pollForUpdates]);

  const sendUpdate = async (type: string, data: any) => {
    if (!snippetId) return;

    try {
      setIsLocalChange(true);
      const response = await fetch(`/api/collaborate/${snippetId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          data,
          userId: userIdRef.current,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          lastSyncRef.current = result.data.lastUpdated;
          setActiveUsers(result.data.activeUsers || []);
        }
      }
    } catch (error) {
      console.error('Error sending update:', error);
    } finally {
      // Shorter timeout for better responsiveness
      setTimeout(() => setIsLocalChange(false), 200);
    }
  };

  const emitContentChange = (content: string, cursorPosition: number) => {
    // Debounce content changes to prevent too frequent updates
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      sendUpdate('content-change', { content, cursorPosition });
    }, 300); // 300ms debounce
  };

  const emitTitleChange = (title: string) => {
    sendUpdate('title-change', { title });
  };

  const emitLanguageChange = (language: string) => {
    sendUpdate('language-change', { language });
  };

  const emitVisibilityChange = (isPublic: boolean) => {
    sendUpdate('visibility-change', { isPublic });
  };

  const emitCursorPosition = (cursorPosition: number) => {
    // Cursor position is not critical for real-time sync, so we don't send it
    // This could be enhanced later for live cursor indicators
  };

  return {
    isConnected,
    activeUsers,
    emitContentChange,
    emitTitleChange,
    emitLanguageChange,
    emitVisibilityChange,
    emitCursorPosition,
  };
}

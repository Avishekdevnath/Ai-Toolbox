'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, Eye, EyeOff, Maximize, Minimize, Copy, Keyboard } from 'lucide-react';

interface QuizSecurityProps {
  preventCopyPaste?: boolean;
  fullscreenMode?: boolean;
  onViolation?: (violation: string) => void;
  onFullscreenExit?: () => void;
  className?: string;
}

interface SecurityViolation {
  type: 'copy' | 'paste' | 'contextmenu' | 'fullscreen_exit' | 'window_blur' | 'keyboard_shortcut';
  timestamp: Date;
  details: string;
}

export default function QuizSecurity({
  preventCopyPaste = false,
  fullscreenMode = false,
  onViolation,
  onFullscreenExit,
  className = ''
}: QuizSecurityProps) {
  const [violations, setViolations] = useState<SecurityViolation[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [windowFocused, setWindowFocused] = useState(true);
  const [warningCount, setWarningCount] = useState(0);

  // Record security violation
  const recordViolation = useCallback((type: SecurityViolation['type'], details: string) => {
    const violation: SecurityViolation = {
      type,
      timestamp: new Date(),
      details
    };

    setViolations(prev => [...prev, violation]);
    setWarningCount(prev => prev + 1);

    if (onViolation) {
      onViolation(`${type}: ${details}`);
    }
  }, [onViolation]);

  // Prevent copy events
  const handleCopy = useCallback((e: ClipboardEvent) => {
    if (preventCopyPaste) {
      e.preventDefault();
      recordViolation('copy', 'Attempted to copy content');
    }
  }, [preventCopyPaste, recordViolation]);

  // Prevent paste events
  const handlePaste = useCallback((e: ClipboardEvent) => {
    if (preventCopyPaste) {
      e.preventDefault();
      recordViolation('paste', 'Attempted to paste content');
    }
  }, [preventCopyPaste, recordViolation]);

  // Prevent context menu
  const handleContextMenu = useCallback((e: MouseEvent) => {
    e.preventDefault();
    recordViolation('contextmenu', 'Right-click context menu attempted');
  }, [recordViolation]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const ctrlKey = isMac ? e.metaKey : e.ctrlKey;

    // Prevent common cheating shortcuts
    if (ctrlKey && (e.key === 'c' || e.key === 'C')) {
      if (preventCopyPaste) {
        e.preventDefault();
        recordViolation('keyboard_shortcut', 'Ctrl+C copy shortcut attempted');
      }
    }

    // Prevent screenshot shortcuts
    if ((e.key === 'PrintScreen') ||
        (isMac && e.key === '3' && e.shiftKey) ||
        (isMac && e.key === '4' && e.shiftKey)) {
      recordViolation('keyboard_shortcut', 'Screenshot shortcut attempted');
    }

    // Prevent tab switching (may indicate cheating)
    if (e.key === 'Tab' && e.altKey) {
      recordViolation('keyboard_shortcut', 'Alt+Tab attempted');
    }
  }, [preventCopyPaste, recordViolation]);

  // Handle window focus/blur
  const handleWindowBlur = useCallback(() => {
    setWindowFocused(false);
    recordViolation('window_blur', 'Window lost focus');
  }, [recordViolation]);

  const handleWindowFocus = useCallback(() => {
    setWindowFocused(true);
  }, []);

  // Handle fullscreen changes
  const handleFullscreenChange = useCallback(() => {
    const isCurrentlyFullscreen = !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    );

    setIsFullscreen(isCurrentlyFullscreen);

    if (!isCurrentlyFullscreen && fullscreenMode) {
      recordViolation('fullscreen_exit', 'Exited fullscreen mode');
      if (onFullscreenExit) {
        onFullscreenExit();
      }
    }
  }, [fullscreenMode, onFullscreenExit, recordViolation]);

  // Request fullscreen
  const requestFullscreen = useCallback(async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      } else if ((document.documentElement as any).webkitRequestFullscreen) {
        await (document.documentElement as any).webkitRequestFullscreen();
      } else if ((document.documentElement as any).mozRequestFullScreen) {
        await (document.documentElement as any).mozRequestFullScreen();
      } else if ((document.documentElement as any).msRequestFullscreen) {
        await (document.documentElement as any).msRequestFullscreen();
      }
    } catch (error) {
      console.error('Failed to enter fullscreen:', error);
    }
  }, []);

  // Exit fullscreen
  const exitFullscreen = useCallback(async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        await (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen();
      }
    } catch (error) {
      console.error('Failed to exit fullscreen:', error);
    }
  }, []);

  // Setup security measures
  useEffect(() => {
    if (preventCopyPaste) {
      document.addEventListener('copy', handleCopy);
      document.addEventListener('paste', handlePaste);
      document.addEventListener('contextmenu', handleContextMenu);
    }

    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    // Auto-enter fullscreen if required
    if (fullscreenMode && !isFullscreen) {
      const timer = setTimeout(() => {
        requestFullscreen();
      }, 1000); // Small delay to ensure DOM is ready

      return () => clearTimeout(timer);
    }

    return () => {
      if (preventCopyPaste) {
        document.removeEventListener('copy', handleCopy);
        document.removeEventListener('paste', handlePaste);
        document.removeEventListener('contextmenu', handleContextMenu);
      }

      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [preventCopyPaste, fullscreenMode, isFullscreen, handleCopy, handlePaste, handleContextMenu, handleKeyDown, handleWindowBlur, handleWindowFocus, handleFullscreenChange, requestFullscreen]);

  // Show security warnings
  const showSecurityWarnings = warningCount > 0 || !windowFocused;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Security Status Bar */}
      <Card className={`border-l-4 ${showSecurityWarnings ? 'border-l-red-500' : 'border-l-green-500'}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className={`w-5 h-5 ${showSecurityWarnings ? 'text-red-600' : 'text-green-600'}`} />
              <div>
                <div className="font-medium">Security Monitor</div>
                <div className="text-sm text-gray-600">
                  {showSecurityWarnings ? `${warningCount} security events detected` : 'All security measures active'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant={windowFocused ? 'default' : 'destructive'}>
                {windowFocused ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
                {windowFocused ? 'Focused' : 'Blurred'}
              </Badge>

              {fullscreenMode && (
                <Badge variant={isFullscreen ? 'default' : 'destructive'}>
                  {isFullscreen ? <Maximize className="w-3 h-3 mr-1" /> : <Minimize className="w-3 h-3 mr-1" />}
                  {isFullscreen ? 'Fullscreen' : 'Windowed'}
                </Badge>
              )}
            </div>
          </div>

          {/* Security Controls */}
          {fullscreenMode && (
            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={requestFullscreen}
                disabled={isFullscreen}
              >
                <Maximize className="w-4 h-4 mr-2" />
                Enter Fullscreen
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={exitFullscreen}
                disabled={!isFullscreen}
              >
                <Minimize className="w-4 h-4 mr-2" />
                Exit Fullscreen
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Warnings */}
      {showSecurityWarnings && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="font-medium mb-2">Security Alert</div>
            <div className="space-y-1 text-sm">
              {!windowFocused && (
                <div>• Window lost focus - ensure quiz remains in foreground</div>
              )}
              {violations.slice(-3).map((violation, index) => (
                <div key={index}>
                  • {violation.details} ({violation.timestamp.toLocaleTimeString()})
                </div>
              ))}
            </div>
            <div className="mt-2 text-xs">
              Continued violations may result in quiz termination.
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Security Measures Indicator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Active Security Measures
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Copy className={`w-5 h-5 ${preventCopyPaste ? 'text-green-600' : 'text-gray-400'}`} />
              <div>
                <div className="font-medium">Copy/Paste Prevention</div>
                <div className="text-sm text-gray-600">
                  {preventCopyPaste ? 'Active' : 'Disabled'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Keyboard className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-medium">Keyboard Shortcuts</div>
                <div className="text-sm text-gray-600">Monitored</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Maximize className={`w-5 h-5 ${fullscreenMode ? 'text-green-600' : 'text-gray-400'}`} />
              <div>
                <div className="font-medium">Fullscreen Mode</div>
                <div className="text-sm text-gray-600">
                  {fullscreenMode ? 'Required' : 'Optional'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-medium">Window Focus</div>
                <div className="text-sm text-gray-600">Monitored</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Violations Log */}
      {violations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Security Violations Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {violations.slice(-10).reverse().map((violation, index) => (
                <div key={index} className="flex items-center justify-between py-2 px-3 bg-red-50 rounded">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span className="text-sm">{violation.details}</span>
                  </div>
                  <span className="text-xs text-gray-600">
                    {violation.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Notice */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <div className="font-medium text-blue-900 mb-1">Security Information</div>
              <div className="text-blue-800">
                This quiz employs various security measures to maintain academic integrity.
                All attempts to circumvent these measures are logged and may result in quiz termination.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


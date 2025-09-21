/**
 * Error Monitoring System
 * Senior SDE Level Implementation
 */

export interface ErrorEvent {
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: number;
  url: string;
  userAgent: string;
  userId?: string;
  sessionId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'javascript' | 'react' | 'api' | 'network' | 'unknown';
  metadata?: Record<string, any>;
}

export class ErrorMonitor {
  private static instance: ErrorMonitor;
  private errors: ErrorEvent[] = [];
  private maxErrors = 100; // Prevent memory leaks
  private sessionId: string;

  private constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeErrorHandling();
  }

  static getInstance(): ErrorMonitor {
    if (!ErrorMonitor.instance) {
      ErrorMonitor.instance = new ErrorMonitor();
    }
    return ErrorMonitor.instance;
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeErrorHandling(): void {
    if (typeof window !== 'undefined') {
      // Global error handler
      window.addEventListener('error', (event) => {
        this.captureError(event.error, {
          category: 'javascript',
          severity: 'high',
          metadata: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
          },
        });
      });

      // Unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        this.captureError(new Error(event.reason), {
          category: 'javascript',
          severity: 'high',
          metadata: {
            type: 'unhandledrejection',
            reason: event.reason,
          },
        });
      });

      // React error boundary fallback
      window.addEventListener('react-error', (event: any) => {
        this.captureError(event.error, {
          category: 'react',
          severity: 'high',
          metadata: {
            componentStack: event.componentStack,
          },
        });
      });
    }
  }

  captureError(
    error: Error,
    options: {
      category?: ErrorEvent['category'];
      severity?: ErrorEvent['severity'];
      metadata?: Record<string, any>;
      userId?: string;
    } = {}
  ): void {
    const errorEvent: ErrorEvent = {
      message: error.message,
      stack: error.stack,
      timestamp: Date.now(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      userId: options.userId,
      sessionId: this.sessionId,
      severity: options.severity || 'medium',
      category: options.category || 'unknown',
      metadata: options.metadata,
    };

    this.errors.push(errorEvent);

    // Prevent memory leaks
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error captured:', errorEvent);
    }

    // Send to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoringService(errorEvent);
    }
  }

  private async sendToMonitoringService(errorEvent: ErrorEvent): Promise<void> {
    try {
      // Send to your error monitoring service (Sentry, LogRocket, etc.)
      await fetch('/api/error-monitoring', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorEvent),
      });
    } catch (error) {
      // Fallback to console if monitoring service fails
      console.error('Failed to send error to monitoring service:', error);
    }
  }

  getErrors(): ErrorEvent[] {
    return [...this.errors];
  }

  getErrorsBySeverity(severity: ErrorEvent['severity']): ErrorEvent[] {
    return this.errors.filter(error => error.severity === severity);
  }

  getErrorsByCategory(category: ErrorEvent['category']): ErrorEvent[] {
    return this.errors.filter(error => error.category === category);
  }

  clearErrors(): void {
    this.errors = [];
  }

  getErrorStats(): {
    total: number;
    bySeverity: Record<ErrorEvent['severity'], number>;
    byCategory: Record<ErrorEvent['category'], number>;
  } {
    const bySeverity = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };

    const byCategory = {
      javascript: 0,
      react: 0,
      api: 0,
      network: 0,
      unknown: 0,
    };

    this.errors.forEach(error => {
      bySeverity[error.severity]++;
      byCategory[error.category]++;
    });

    return {
      total: this.errors.length,
      bySeverity,
      byCategory,
    };
  }
}

// Utility functions
export const errorMonitor = ErrorMonitor.getInstance();

export const captureError = (
  error: Error,
  options?: Parameters<typeof errorMonitor.captureError>[1]
): void => {
  errorMonitor.captureError(error, options);
};

export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
) => {
  return class ErrorBoundaryWrapper extends React.Component<P, { hasError: boolean; error?: Error }> {
    constructor(props: P) {
      super(props);
      this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error) {
      return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      errorMonitor.captureError(error, {
        category: 'react',
        severity: 'high',
        metadata: {
          componentStack: errorInfo.componentStack,
        },
      });
    }

    resetError = () => {
      this.setState({ hasError: false, error: undefined });
    };

    render() {
      if (this.state.hasError) {
        if (fallback) {
          const FallbackComponent = fallback;
          return <FallbackComponent error={this.state.error!} resetError={this.resetError} />;
        }
        return (
          <div className="error-boundary-fallback">
            <h2>Something went wrong</h2>
            <button onClick={this.resetError}>Try again</button>
          </div>
        );
      }

      return <Component {...this.props} />;
    }
  };
}; 
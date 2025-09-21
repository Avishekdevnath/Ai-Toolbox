'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  Copy, 
  Bug,
  Clock,
  User,
  Globe
} from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  timestamp: string;
  userAgent: string;
  url: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      timestamp: '',
      userAgent: '',
      url: ''
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      errorId: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Log error to console for debugging
    console.group('🚨 Error Details');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Error ID:', this.state.errorId);
    console.error('Timestamp:', this.state.timestamp);
    console.error('URL:', window.location.href);
    console.error('User Agent:', navigator.userAgent);
    console.groupEnd();

    // In production, you would send this to your error reporting service
    // this.logErrorToService(error, errorInfo);
  }

  copyErrorDetails = () => {
    const errorDetails = {
      errorId: this.state.errorId,
      timestamp: this.state.timestamp,
      url: this.state.url,
      userAgent: this.state.userAgent,
      error: {
        name: this.state.error?.name,
        message: this.state.error?.message,
        stack: this.state.error?.stack
      },
      errorInfo: {
        componentStack: this.state.errorInfo?.componentStack
      }
    };

    const errorText = JSON.stringify(errorDetails, null, 2);
    
    navigator.clipboard.writeText(errorText).then(() => {
      // Show success feedback
      const button = document.getElementById('copy-error-btn');
      if (button) {
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        button.classList.add('bg-green-600');
        setTimeout(() => {
          button.textContent = originalText;
          button.classList.remove('bg-green-600');
        }, 2000);
      }
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = errorText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      alert('Error details copied to clipboard!');
    });
  };

  reloadPage = () => {
    window.location.reload();
  };

  goHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Something went wrong
              </CardTitle>
              <p className="text-gray-600 mt-2">
                We encountered an unexpected error. Please try again.
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Error Details */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 flex items-center gap-2">
                    <Bug className="w-4 h-4" />
                    Error Details
                  </h3>
                  <Badge variant="secondary" className="text-xs">
                    ID: {this.state.errorId}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-gray-600">
                      {new Date(this.state.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-3 h-3 text-gray-400" />
                    <span className="text-gray-600 truncate">
                      {this.state.url}
                    </span>
                  </div>
                </div>

                {this.state.error && (
                  <div className="bg-white rounded border p-3">
                    <div className="text-sm">
                      <div className="font-medium text-red-600 mb-1">
                        {this.state.error.name}: {this.state.error.message}
                      </div>
                      {this.state.error.stack && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                            Stack Trace
                          </summary>
                          <pre className="text-xs text-gray-500 mt-2 whitespace-pre-wrap overflow-x-auto">
                            {this.state.error.stack}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={this.copyErrorDetails}
                  variant="outline"
                  className="flex-1"
                  id="copy-error-btn"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Error Details
                </Button>
                <Button 
                  onClick={this.reloadPage}
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button 
                  onClick={this.goHome}
                  variant="outline"
                  className="flex-1"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </div>

              {/* Additional Help */}
              <div className="text-center text-sm text-gray-500">
                <p>
                  If this problem persists, please contact support with the error ID: 
                  <code className="bg-gray-100 px-1 rounded text-xs ml-1">
                    {this.state.errorId}
                  </code>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for functional components
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((error: Error) => {
    console.error('Error caught by useErrorHandler:', error);
    setError(error);
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  return { error, handleError, clearError };
}

// Higher-order component for error handling
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
} 
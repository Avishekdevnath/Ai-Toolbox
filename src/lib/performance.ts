/**
 * Performance Monitoring Utilities
 * Senior SDE Level Implementation
 */

export interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, PerformanceMetrics> = new Map();

  private constructor() {
    this.initializeWebVitals();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private initializeWebVitals(): void {
    if (typeof window !== 'undefined') {
      // Monitor Core Web Vitals
      this.observeLCP();
      this.observeFID();
      this.observeCLS();
      this.observeFCP();
    }
  }

  private observeLCP(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry;
        this.recordMetric('largestContentfulPaint', lastEntry.startTime);
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }
  }

  private observeFID(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.recordMetric('firstInputDelay', entry.processingStart - entry.startTime);
        });
      });
      observer.observe({ entryTypes: ['first-input'] });
    }
  }

  private observeCLS(): void {
    if ('PerformanceObserver' in window) {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.recordMetric('cumulativeLayoutShift', clsValue);
      });
      observer.observe({ entryTypes: ['layout-shift'] });
    }
  }

  private observeFCP(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const firstEntry = entries[0];
        this.recordMetric('firstContentfulPaint', firstEntry.startTime);
      });
      observer.observe({ entryTypes: ['first-contentful-paint'] });
    }
  }

  private recordMetric(metricName: keyof PerformanceMetrics, value: number): void {
    const currentMetrics = this.metrics.get(window.location.pathname) || {
      pageLoadTime: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      cumulativeLayoutShift: 0,
      firstInputDelay: 0,
    };

    currentMetrics[metricName] = value;
    this.metrics.set(window.location.pathname, currentMetrics);

    // Log to analytics in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(metricName, value);
    }
  }

  private sendToAnalytics(metricName: string, value: number): void {
    // Send to your analytics service (Google Analytics, etc.)
    if (typeof gtag !== 'undefined') {
      gtag('event', 'web_vitals', {
        event_category: 'Web Vitals',
        event_label: metricName,
        value: Math.round(value),
      });
    }
  }

  getMetrics(pagePath?: string): PerformanceMetrics | undefined {
    const path = pagePath || window.location.pathname;
    return this.metrics.get(path);
  }

  getAllMetrics(): Map<string, PerformanceMetrics> {
    return new Map(this.metrics);
  }

  resetMetrics(): void {
    this.metrics.clear();
  }
}

// Utility functions for easy access
export const performanceMonitor = PerformanceMonitor.getInstance();

export const trackPageLoad = (): void => {
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      performanceMonitor['recordMetric']('pageLoadTime', loadTime);
    });
  }
};

export const trackUserInteraction = (eventName: string, data?: any): void => {
  if (process.env.NODE_ENV === 'production' && typeof gtag !== 'undefined') {
    gtag('event', eventName, data);
  }
};

export const measureComponentRender = (componentName: string): () => void => {
  const startTime = performance.now();
  return () => {
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} render time: ${renderTime.toFixed(2)}ms`);
    }
    
    trackUserInteraction('component_render', {
      component_name: componentName,
      render_time: renderTime,
    });
  };
}; 
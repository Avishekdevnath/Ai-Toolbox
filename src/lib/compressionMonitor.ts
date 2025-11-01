/**
 * Compression Monitor
 * Monitors response compression effectiveness
 */

export interface CompressionMetrics {
  endpoint: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  encoding: string;
  timestamp: string;
}

class CompressionMonitor {
  private static instance: CompressionMonitor;
  private metrics: CompressionMetrics[] = [];
  private readonly MAX_METRICS = 1000;

  private constructor() {}

  static getInstance(): CompressionMonitor {
    if (!CompressionMonitor.instance) {
      CompressionMonitor.instance = new CompressionMonitor();
    }
    return CompressionMonitor.instance;
  }

  /**
   * Record compression metrics
   */
  recordCompression(metric: CompressionMetrics): void {
    this.metrics.push(metric);

    // Keep only last MAX_METRICS entries
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }

    // Log poor compression
    if (metric.compressionRatio < 20) {
      console.warn(`⚠️ Low compression ratio: ${metric.compressionRatio}% for ${metric.endpoint}`);
    }
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): CompressionMetrics[] {
    return [...this.metrics];
  }

  /**
   * Get compression statistics
   */
  getStats(): {
    totalResponses: number;
    averageCompressionRatio: number;
    averageOriginalSize: number;
    averageCompressedSize: number;
    totalBytesSaved: number;
    encodingDistribution: Record<string, number>;
    byEndpoint: Record<string, {
      count: number;
      avgRatio: number;
      avgOriginalSize: number;
      avgCompressedSize: number;
    }>;
  } {
    if (this.metrics.length === 0) {
      return {
        totalResponses: 0,
        averageCompressionRatio: 0,
        averageOriginalSize: 0,
        averageCompressedSize: 0,
        totalBytesSaved: 0,
        encodingDistribution: {},
        byEndpoint: {},
      };
    }

    // Calculate averages
    const totalOriginal = this.metrics.reduce((sum, m) => sum + m.originalSize, 0);
    const totalCompressed = this.metrics.reduce((sum, m) => sum + m.compressedSize, 0);
    const avgCompressionRatio = this.metrics.reduce((sum, m) => sum + m.compressionRatio, 0) / this.metrics.length;

    // Encoding distribution
    const encodingDistribution: Record<string, number> = {};
    this.metrics.forEach(m => {
      encodingDistribution[m.encoding] = (encodingDistribution[m.encoding] || 0) + 1;
    });

    // By endpoint
    const endpointData = new Map<string, {
      count: number;
      totalRatio: number;
      totalOriginal: number;
      totalCompressed: number;
    }>();

    this.metrics.forEach(m => {
      const data = endpointData.get(m.endpoint) || {
        count: 0,
        totalRatio: 0,
        totalOriginal: 0,
        totalCompressed: 0,
      };

      data.count += 1;
      data.totalRatio += m.compressionRatio;
      data.totalOriginal += m.originalSize;
      data.totalCompressed += m.compressedSize;

      endpointData.set(m.endpoint, data);
    });

    const byEndpoint: Record<string, any> = {};
    endpointData.forEach((data, endpoint) => {
      byEndpoint[endpoint] = {
        count: data.count,
        avgRatio: Math.round(data.totalRatio / data.count),
        avgOriginalSize: Math.round(data.totalOriginal / data.count),
        avgCompressedSize: Math.round(data.totalCompressed / data.count),
      };
    });

    return {
      totalResponses: this.metrics.length,
      averageCompressionRatio: Math.round(avgCompressionRatio),
      averageOriginalSize: Math.round(totalOriginal / this.metrics.length),
      averageCompressedSize: Math.round(totalCompressed / this.metrics.length),
      totalBytesSaved: totalOriginal - totalCompressed,
      encodingDistribution,
      byEndpoint,
    };
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = [];
  }
}

export const compressionMonitor = CompressionMonitor.getInstance();

/**
 * Measure compression ratio
 */
export function measureCompression(
  endpoint: string,
  originalContent: string,
  compressedContent: string | Buffer,
  encoding: string
): CompressionMetrics {
  const originalSize = Buffer.byteLength(originalContent);
  const compressedSize = typeof compressedContent === 'string' 
    ? Buffer.byteLength(compressedContent)
    : compressedContent.length;

  const compressionRatio = originalSize > 0
    ? Math.round(((originalSize - compressedSize) / originalSize) * 100)
    : 0;

  const metric: CompressionMetrics = {
    endpoint,
    originalSize,
    compressedSize,
    compressionRatio,
    encoding,
    timestamp: new Date().toISOString(),
  };

  compressionMonitor.recordCompression(metric);

  return metric;
}

/**
 * Format bytes to human readable
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${Math.round(bytes / Math.pow(k, i) * 100) / 100} ${sizes[i]}`;
}


import mongoose from 'mongoose';
import { UserAnalysisHistoryModel } from '@/models/UserAnalysisHistoryModel';
import { createHash } from 'crypto';

export interface DuplicateDetectionRequest {
  userId: string;
  toolSlug: string;
  toolName: string;
  analysisType: string;
  parameters: any;
  isAnonymous?: boolean;
}

export interface DuplicateDetectionResult {
  isDuplicate: boolean;
  confidence: number;
  existingAnalysis?: any;
  similarityScore?: number;
  timeDifference?: number;
}

export interface DuplicateAnalysis {
  _id: string;
  userId: string;
  toolSlug: string;
  toolName: string;
  analysisType: string;
  parameters: any;
  result: any;
  duration: number;
  success: boolean;
  error?: string;
  metadata: {
    userAgent: string;
    ipAddress: string;
    timestamp: Date;
    sessionId?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export class DuplicateDetectionService {
  private static instance: DuplicateDetectionService;
  private cache: Map<string, { result: DuplicateDetectionResult; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  public static getInstance(): DuplicateDetectionService {
    if (!DuplicateDetectionService.instance) {
      DuplicateDetectionService.instance = new DuplicateDetectionService();
    }
    return DuplicateDetectionService.instance;
  }

  /**
   * Generate a hash for the analysis parameters
   */
  private generateParameterHash(parameters: any): string {
    const sortedParams = this.sortObjectKeys(parameters);
    const paramString = JSON.stringify(sortedParams);
    return createHash('sha256').update(paramString).digest('hex');
  }

  /**
   * Sort object keys recursively for consistent hashing
   */
  private sortObjectKeys(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sortObjectKeys(item));
    }

    const sorted: any = {};
    Object.keys(obj).sort().forEach(key => {
      sorted[key] = this.sortObjectKeys(obj[key]);
    });

    return sorted;
  }

  /**
   * Calculate similarity between two parameter objects
   */
  private calculateSimilarity(params1: any, params2: any): number {
    const hash1 = this.generateParameterHash(params1);
    const hash2 = this.generateParameterHash(params2);
    
    if (hash1 === hash2) {
      return 1.0; // Exact match
    }

    // For non-exact matches, calculate similarity based on common keys
    const keys1 = this.getAllKeys(params1);
    const keys2 = this.getAllKeys(params2);
    
    const commonKeys = keys1.filter(key => keys2.includes(key));
    const totalKeys = new Set([...keys1, ...keys2]).size;
    
    if (totalKeys === 0) return 0;
    
    return commonKeys.length / totalKeys;
  }

  /**
   * Get all keys from an object recursively
   */
  private getAllKeys(obj: any, prefix: string = ''): string[] {
    const keys: string[] = [];
    
    if (obj === null || typeof obj !== 'object') {
      return keys;
    }

    Object.keys(obj).forEach(key => {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      keys.push(fullKey);
      
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        keys.push(...this.getAllKeys(obj[key], fullKey));
      }
    });

    return keys;
  }

  /**
   * Check for exact duplicates
   */
  private async checkExactDuplicates(request: DuplicateDetectionRequest): Promise<DuplicateAnalysis[]> {
    try {
      const parameterHash = this.generateParameterHash(request.parameters);
      
      const duplicates = await UserAnalysisHistoryModel.find({
        userId: request.userId,
        toolSlug: request.toolSlug,
        analysisType: request.analysisType,
        success: true
      }).sort({ createdAt: -1 }).limit(10);

      // Filter by parameter hash
      const exactDuplicates = duplicates.filter(analysis => {
        const existingHash = this.generateParameterHash(analysis.parameters);
        return existingHash === parameterHash;
      });

      return exactDuplicates;
    } catch (error) {
      console.error('Error checking exact duplicates:', error);
      return [];
    }
  }

  /**
   * Check for similar analyses
   */
  private async checkSimilarAnalyses(request: DuplicateDetectionRequest): Promise<DuplicateAnalysis[]> {
    try {
      const similarAnalyses = await UserAnalysisHistoryModel.find({
        userId: request.userId,
        toolSlug: request.toolSlug,
        analysisType: request.analysisType,
        success: true,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
      }).sort({ createdAt: -1 }).limit(20);

      const threshold = 0.8; // 80% similarity threshold
      const similar: DuplicateAnalysis[] = [];

      for (const analysis of similarAnalyses) {
        const similarity = this.calculateSimilarity(request.parameters, analysis.parameters);
        if (similarity >= threshold) {
          similar.push(analysis);
        }
      }

      return similar;
    } catch (error) {
      console.error('Error checking similar analyses:', error);
      return [];
    }
  }

  /**
   * Detect duplicates for a given analysis request
   */
  public async detectDuplicates(request: DuplicateDetectionRequest): Promise<DuplicateDetectionResult> {
    const cacheKey = `${request.userId}_${request.toolSlug}_${this.generateParameterHash(request.parameters)}`;
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.result;
    }

    try {
      // Check for exact duplicates first
      const exactDuplicates = await this.checkExactDuplicates(request);
      
      if (exactDuplicates.length > 0) {
        const mostRecent = exactDuplicates[0];
        const timeDifference = Date.now() - mostRecent.createdAt.getTime();
        
        const result: DuplicateDetectionResult = {
          isDuplicate: true,
          confidence: 1.0,
          existingAnalysis: mostRecent,
          similarityScore: 1.0,
          timeDifference
        };

        // Cache the result
        this.cache.set(cacheKey, { result, timestamp: Date.now() });
        
        return result;
      }

      // Check for similar analyses
      const similarAnalyses = await this.checkSimilarAnalyses(request);
      
      if (similarAnalyses.length > 0) {
        const mostSimilar = similarAnalyses[0];
        const similarity = this.calculateSimilarity(request.parameters, mostSimilar.parameters);
        const timeDifference = Date.now() - mostSimilar.createdAt.getTime();
        
        const result: DuplicateDetectionResult = {
          isDuplicate: similarity >= 0.9, // 90% similarity threshold for duplicates
          confidence: similarity,
          existingAnalysis: mostSimilar,
          similarityScore: similarity,
          timeDifference
        };

        // Cache the result
        this.cache.set(cacheKey, { result, timestamp: Date.now() });
        
        return result;
      }

      // No duplicates found
      const result: DuplicateDetectionResult = {
        isDuplicate: false,
        confidence: 0.0
      };

      // Cache the result
      this.cache.set(cacheKey, { result, timestamp: Date.now() });
      
      return result;
    } catch (error) {
      console.error('Error detecting duplicates:', error);
      
      const result: DuplicateDetectionResult = {
        isDuplicate: false,
        confidence: 0.0
      };

      return result;
    }
  }

  /**
   * Get duplicate statistics for a user
   */
  public async getDuplicateStats(userId: string): Promise<{
    totalAnalyses: number;
    duplicates: number;
    duplicateRate: number;
    mostDuplicatedTool: string;
    averageSimilarity: number;
  }> {
    try {
      const userAnalyses = await UserAnalysisHistoryModel.find({
        userId,
        success: true
      }).sort({ createdAt: -1 });

      if (userAnalyses.length === 0) {
        return {
          totalAnalyses: 0,
          duplicates: 0,
          duplicateRate: 0,
          mostDuplicatedTool: '',
          averageSimilarity: 0
        };
      }

      let duplicates = 0;
      let totalSimilarity = 0;
      const toolDuplicates: { [key: string]: number } = {};

      for (let i = 0; i < userAnalyses.length; i++) {
        const currentAnalysis = userAnalyses[i];
        
        // Check for duplicates in previous analyses
        for (let j = i + 1; j < userAnalyses.length; j++) {
          const previousAnalysis = userAnalyses[j];
          
          if (currentAnalysis.toolSlug === previousAnalysis.toolSlug &&
              currentAnalysis.analysisType === previousAnalysis.analysisType) {
            
            const similarity = this.calculateSimilarity(
              currentAnalysis.parameters,
              previousAnalysis.parameters
            );

            if (similarity >= 0.9) {
              duplicates++;
              totalSimilarity += similarity;
              
              if (!toolDuplicates[currentAnalysis.toolSlug]) {
                toolDuplicates[currentAnalysis.toolSlug] = 0;
              }
              toolDuplicates[currentAnalysis.toolSlug]++;
              
              break; // Found a duplicate, move to next analysis
            }
          }
        }
      }

      const mostDuplicatedTool = Object.keys(toolDuplicates).reduce((a, b) => 
        toolDuplicates[a] > toolDuplicates[b] ? a : b, ''
      );

      return {
        totalAnalyses: userAnalyses.length,
        duplicates,
        duplicateRate: userAnalyses.length > 0 ? (duplicates / userAnalyses.length) * 100 : 0,
        mostDuplicatedTool,
        averageSimilarity: duplicates > 0 ? totalSimilarity / duplicates : 0
      };
    } catch (error) {
      console.error('Error getting duplicate stats:', error);
      return {
        totalAnalyses: 0,
        duplicates: 0,
        duplicateRate: 0,
        mostDuplicatedTool: '',
        averageSimilarity: 0
      };
    }
  }

  /**
   * Clear cache
   */
  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): {
    size: number;
    entries: number;
  } {
    return {
      size: this.cache.size,
      entries: this.cache.size
    };
  }
}

// Export singleton instance
export const duplicateDetectionService = DuplicateDetectionService.getInstance(); 
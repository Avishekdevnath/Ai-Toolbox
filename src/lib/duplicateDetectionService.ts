import { UserAnalysisHistory } from '@/models/UserAnalysisHistoryModel';
import { 
  generateParameterHash, 
  createParameterHashObject, 
  compareParameters,
  normalizeParameters,
  ParameterComparison 
} from './parameterHashUtils';

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  existingAnalysis?: any;
  similarity: number;
  differences: string[];
  shouldShowWarning: boolean;
  parameterHash: string;
}

export interface AnalysisRequest {
  userId: string;
  toolSlug: string;
  toolName: string;
  analysisType: string;
  parameters: Record<string, any>;
  isAnonymous?: boolean;
}

export interface AnalysisResult {
  success: boolean;
  analysisId?: string;
  isDuplicate?: boolean;
  existingAnalysis?: any;
  result?: any;
  metadata?: any;
  error?: string;
}

/**
 * Duplicate Detection Service
 * 
 * This service handles checking for duplicate analysis requests and
 * managing cached results to prevent unnecessary regeneration.
 */
export class DuplicateDetectionService {
  
  /**
   * Check if an analysis request is a duplicate
   */
  static async checkForDuplicates(request: AnalysisRequest): Promise<DuplicateCheckResult> {
    try {
      const { userId, toolSlug, parameters } = request;
      
      // Generate parameter hash
      const parameterHash = generateParameterHash(parameters, toolSlug, userId);
      
      // Check for exact match in database
      const existingAnalysis = await (UserAnalysisHistory as any).findByParameterHash(userId, parameterHash);
      
      if (existingAnalysis) {
        // Update access count
        await (UserAnalysisHistory as any).updateAccess(existingAnalysis._id);
        
        return {
          isDuplicate: true,
          existingAnalysis,
          similarity: 1.0,
          differences: [],
          shouldShowWarning: true,
          parameterHash
        };
      }
      
      // Check for similar analyses
      const normalizedParams = normalizeParameters(parameters);
      const similarAnalyses = await (UserAnalysisHistory as any).findSimilarAnalyses(
        userId, 
        normalizedParams, 
        toolSlug
      );
      
      if (similarAnalyses.length > 0) {
        // Find the most similar analysis
        let bestMatch = null;
        let highestSimilarity = 0;
        
        for (const analysis of similarAnalyses) {
          const comparison = compareParameters(
            parameters,
            analysis.inputData,
            toolSlug,
            analysis.toolSlug,
            userId,
            analysis.userId
          );
          
          if (comparison.similarity > highestSimilarity) {
            highestSimilarity = comparison.similarity;
            bestMatch = analysis;
          }
        }
        
        // If similarity is very high (>90%), consider it a duplicate
        if (highestSimilarity > 0.9) {
          return {
            isDuplicate: true,
            existingAnalysis: bestMatch,
            similarity: highestSimilarity,
            differences: bestMatch ? findKeyDifferences(parameters, bestMatch.inputData) : [],
            shouldShowWarning: true,
            parameterHash
          };
        }
      }
      
      return {
        isDuplicate: false,
        similarity: 0,
        differences: [],
        shouldShowWarning: false,
        parameterHash
      };
      
    } catch (error) {
      console.error('Error checking for duplicates:', error);
      return {
        isDuplicate: false,
        similarity: 0,
        differences: [],
        shouldShowWarning: false,
        parameterHash: ''
      };
    }
  }
  
  /**
   * Save analysis result with duplicate detection info
   */
  static async saveAnalysisResult(
    request: AnalysisRequest,
    result: any,
    metadata: any,
    isDuplicate: boolean = false,
    originalAnalysisId?: string
  ): Promise<string> {
    try {
      const { userId, toolSlug, toolName, analysisType, parameters, isAnonymous = false } = request;
      
      // Generate parameter hash and normalized parameters
      const parameterHash = generateParameterHash(parameters, toolSlug, userId);
      const normalizedParams = normalizeParameters(parameters);
      
      // Create analysis record
      const analysis = new (UserAnalysisHistory as any)({
        userId,
        analysisType,
        toolSlug,
        toolName,
        inputData: parameters,
        result,
        metadata: {
          ...metadata,
          userAgent: metadata.userAgent || 'Unknown',
          ipAddress: metadata.ipAddress || 'Unknown'
        },
        status: 'completed',
        isAnonymous,
        parameterHash,
        isDuplicate,
        originalAnalysisId,
        regenerationCount: isDuplicate ? 1 : 0,
        normalizedParameters: normalizedParams
      });
      
      await analysis.save();
      return analysis._id.toString();
      
    } catch (error) {
      console.error('Error saving analysis result:', error);
      throw new Error('Failed to save analysis result');
    }
  }
  
  /**
   * Get cached result for duplicate analysis
   */
  static async getCachedResult(analysisId: string, userId: string): Promise<any> {
    try {
      const analysis = await (UserAnalysisHistory as any).getAnalysisById(analysisId);
      
      if (!analysis || analysis.userId !== userId) {
        throw new Error('Analysis not found or access denied');
      }
      
      // Update access count
      await (UserAnalysisHistory as any).updateAccess(analysisId);
      
      return {
        result: analysis.result,
        metadata: analysis.metadata,
        createdAt: analysis.createdAt,
        isDuplicate: analysis.isDuplicate,
        originalAnalysis: analysis.originalAnalysisId
      };
      
    } catch (error) {
      console.error('Error getting cached result:', error);
      throw error;
    }
  }
  
  /**
   * Force regenerate analysis (bypass duplicate detection)
   */
  static async forceRegenerate(
    request: AnalysisRequest,
    result: any,
    metadata: any
  ): Promise<string> {
    try {
      // Save as new analysis (not duplicate)
      return await this.saveAnalysisResult(request, result, metadata, false);
    } catch (error) {
      console.error('Error forcing regeneration:', error);
      throw error;
    }
  }
  
  /**
   * Get duplicate analysis groups for user
   */
  static async getDuplicateGroups(userId: string): Promise<any[]> {
    try {
      const duplicates = await (UserAnalysisHistory as any).findDuplicates(userId, '');
      
      // Group by parameter hash
      const groups: Record<string, any[]> = {};
      
      for (const analysis of duplicates) {
        if (!groups[analysis.parameterHash]) {
          groups[analysis.parameterHash] = [];
        }
        groups[analysis.parameterHash].push(analysis);
      }
      
      return Object.values(groups).filter(group => group.length > 1);
      
    } catch (error) {
      console.error('Error getting duplicate groups:', error);
      return [];
    }
  }
  
  /**
   * Clean up old duplicate analyses
   */
  static async cleanupDuplicates(userId: string, daysOld: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      
      const result = await (UserAnalysisHistory as any).deleteMany({
        userId,
        isDuplicate: true,
        createdAt: { $lt: cutoffDate }
      });
      
      return result.deletedCount || 0;
      
    } catch (error) {
      console.error('Error cleaning up duplicates:', error);
      return 0;
    }
  }
  
  /**
   * Get analysis statistics for user
   */
  static async getUserAnalysisStats(userId: string): Promise<any> {
    try {
      const stats = await (UserAnalysisHistory as any).getUserStats(userId);
      const toolStats = await (UserAnalysisHistory as any).getToolUsageStats(userId);
      const duplicateGroups = await this.getDuplicateGroups(userId);
      
      return {
        ...stats,
        toolStats,
        duplicateGroups: duplicateGroups.length,
        savings: {
          tokens: stats.totalTokens - (stats.uniqueAnalyses * 500), // Estimate
          cost: stats.totalCost - (stats.uniqueAnalyses * 0.002), // Estimate
          percentage: stats.totalAnalyses > 0 ? 
            ((stats.duplicateAnalyses / stats.totalAnalyses) * 100).toFixed(1) : 0
        }
      };
      
    } catch (error) {
      console.error('Error getting user stats:', error);
      return {
        totalAnalyses: 0,
        totalTokens: 0,
        totalCost: 0,
        uniqueAnalyses: 0,
        duplicateAnalyses: 0,
        toolStats: [],
        duplicateGroups: 0,
        savings: { tokens: 0, cost: 0, percentage: 0 }
      };
    }
  }
}

/**
 * Helper function to find key differences between parameters
 */
function findKeyDifferences(params1: Record<string, any>, params2: Record<string, any>): string[] {
  const differences: string[] = [];
  const allKeys = new Set([...Object.keys(params1), ...Object.keys(params2)]);
  
  for (const key of allKeys) {
    const value1 = params1[key];
    const value2 = params2[key];
    
    if (value1 !== value2) {
      if (value1 === undefined) {
        differences.push(`Missing: ${key}`);
      } else if (value2 === undefined) {
        differences.push(`Extra: ${key}`);
      } else {
        differences.push(`Different: ${key}`);
      }
    }
  }
  
  return differences.slice(0, 5); // Limit to 5 differences
}

/**
 * Check if user has enabled duplicate detection
 */
export function isDuplicateDetectionEnabled(userId: string): boolean {
  // In the future, this could check user preferences
  // For now, always enabled
  return true;
}

/**
 * Get duplicate detection settings for user
 */
export function getDuplicateDetectionSettings(userId: string): {
  enabled: boolean;
  similarityThreshold: number;
  showWarnings: boolean;
  autoUseCache: boolean;
} {
  return {
    enabled: true,
    similarityThreshold: 0.9,
    showWarnings: true,
    autoUseCache: false
  };
} 
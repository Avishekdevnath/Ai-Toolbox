import { getSwotAnalysisModel, ISwotAnalysis } from '@/models/SwotAnalysisModel';
import { ObjectId } from 'mongodb';

export interface SwotAnalysisCreateData {
  userId: string;
  analysisType: 'personal' | 'business' | 'project' | 'career' | 'investment' | 'emotional';
  name: string;
  inputData: {
    swotType: string;
    formData: any;
  };
  result: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
    aiTips?: {
      leverageStrengths: string[];
      addressWeaknesses: string[];
      capitalizeOpportunities: string[];
      mitigateThreats: string[];
      strategicRecommendations: string[];
      motivationalSummary: string;
    };
  };
  metadata: {
    processingTime: number;
    tokensUsed?: number;
    model?: string;
    cost?: number;
    userAgent?: string;
    ipAddress?: string;
    isDuplicate?: boolean;
    originalAnalysisId?: string;
  };
  parameterHash: string;
  isDuplicate?: boolean;
  originalAnalysisId?: string;
  normalizedParameters: Record<string, any>;
}

export interface SwotAnalysisUpdateData {
  result?: Partial<ISwotAnalysis['result']>;
  metadata?: Partial<ISwotAnalysis['metadata']>;
  status?: ISwotAnalysis['status'];
  lastAccessed?: Date;
  accessCount?: number;
}

export interface SwotAnalysisQuery {
  userId?: string;
  analysisType?: string;
  status?: string;
  limit?: number;
  skip?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class SwotAnalysisService {
  private static instance: SwotAnalysisService;
  private model: any = null;

  private constructor() {}

  public static getInstance(): SwotAnalysisService {
    if (!SwotAnalysisService.instance) {
      SwotAnalysisService.instance = new SwotAnalysisService();
    }
    return SwotAnalysisService.instance;
  }

  private async getModel() {
    if (!this.model) {
      this.model = await getSwotAnalysisModel();
    }
    return this.model;
  }

  /**
   * Create a new SWOT analysis
   */
  async createAnalysis(data: SwotAnalysisCreateData): Promise<ISwotAnalysis> {
    try {
      const model = await this.getModel();
      const analysis = new model({
        ...data,
        status: 'completed',
        isAnonymous: false,
        lastAccessed: new Date(),
        accessCount: 1,
        isDuplicate: data.isDuplicate || false,
        regenerationCount: data.isDuplicate ? 1 : 0
      });

      await analysis.save();
      return analysis;
    } catch (error) {
      console.error('Error creating SWOT analysis:', error);
      throw new Error('Failed to create SWOT analysis');
    }
  }

  /**
   * Get SWOT analysis by ID
   */
  async getAnalysisById(analysisId: string, userId: string): Promise<ISwotAnalysis | null> {
    try {
      const model = await this.getModel();
      const analysis = await model.findOne({
        _id: new ObjectId(analysisId),
        userId,
        status: 'completed'
      });

      if (analysis) {
        // Increment access count
        await analysis.incrementAccess();
      }

      return analysis;
    } catch (error) {
      console.error('Error getting SWOT analysis by ID:', error);
      return null;
    }
  }

  /**
   * Get user's SWOT analyses with pagination
   */
  async getUserAnalyses(
    userId: string,
    query: SwotAnalysisQuery = {}
  ): Promise<{ analyses: ISwotAnalysis[]; total: number }> {
    try {
      const model = await this.getModel();
      const {
        analysisType,
        status = 'completed',
        limit = 50,
        skip = 0,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = query;

      const filter: any = { userId, status };
      if (analysisType) {
        filter.analysisType = analysisType;
      }

      const sort: any = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      const [analyses, total] = await Promise.all([
        model.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .exec(),
        model.countDocuments(filter)
      ]);

      return { analyses, total };
    } catch (error) {
      console.error('Error getting user SWOT analyses:', error);
      return { analyses: [], total: 0 };
    }
  }

  /**
   * Get analysis by parameter hash (for duplicate detection)
   */
  async getAnalysisByParameterHash(
    userId: string,
    parameterHash: string
  ): Promise<ISwotAnalysis | null> {
    try {
      const model = await this.getModel();
      return await model.findByParameterHash(userId, parameterHash);
    } catch (error) {
      console.error('Error getting analysis by parameter hash:', error);
      return null;
    }
  }

  /**
   * Update SWOT analysis
   */
  async updateAnalysis(
    analysisId: string,
    userId: string,
    updateData: SwotAnalysisUpdateData
  ): Promise<ISwotAnalysis | null> {
    try {
      const model = await this.getModel();
      const analysis = await model.findOneAndUpdate(
        { _id: new ObjectId(analysisId), userId },
        { $set: updateData },
        { new: true }
      );
      return analysis;
    } catch (error) {
      console.error('Error updating SWOT analysis:', error);
      return null;
    }
  }

  /**
   * Delete SWOT analysis
   */
  async deleteAnalysis(analysisId: string, userId: string): Promise<boolean> {
    try {
      const model = await this.getModel();
      const result = await model.deleteOne({
        _id: new ObjectId(analysisId),
        userId
      });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting SWOT analysis:', error);
      return false;
    }
  }

  /**
   * Get user's SWOT analysis statistics
   */
  async getUserStats(userId: string): Promise<{
    totalAnalyses: number;
    totalAccessCount: number;
    analysisTypes: string[];
    lastAnalysis: Date | null;
    analysesByType: Record<string, number>;
  }> {
    try {
      const model = await this.getModel();
      const stats = await model.getUserStats(userId);
      
      if (stats.length === 0) {
        return {
          totalAnalyses: 0,
          totalAccessCount: 0,
          analysisTypes: [],
          lastAnalysis: null,
          analysesByType: {}
        };
      }

      const stat = stats[0];
      
      // Get analyses by type
      const analysesByType = await model.aggregate([
        { $match: { userId, status: 'completed' } },
        { $group: { _id: '$analysisType', count: { $sum: 1 } } }
      ]);

      const analysesByTypeMap: Record<string, number> = {};
      analysesByType.forEach((item: any) => {
        analysesByTypeMap[item._id] = item.count;
      });

      return {
        totalAnalyses: stat.totalAnalyses,
        totalAccessCount: stat.totalAccessCount,
        analysisTypes: stat.analysisTypes,
        lastAnalysis: stat.lastAnalysis,
        analysesByType: analysesByTypeMap
      };
    } catch (error) {
      console.error('Error getting user SWOT stats:', error);
      return {
        totalAnalyses: 0,
        totalAccessCount: 0,
        analysisTypes: [],
        lastAnalysis: null,
        analysesByType: {}
      };
    }
  }

  /**
   * Search analyses by name or content
   */
  async searchAnalyses(
    userId: string,
    searchTerm: string,
    limit = 20
  ): Promise<ISwotAnalysis[]> {
    try {
      const model = await this.getModel();
      const regex = new RegExp(searchTerm, 'i');
      
      return await model.find({
        userId,
        status: 'completed',
        $or: [
          { name: regex },
          { 'result.strengths': { $in: [regex] } },
          { 'result.weaknesses': { $in: [regex] } },
          { 'result.opportunities': { $in: [regex] } },
          { 'result.threats': { $in: [regex] } }
        ]
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
    } catch (error) {
      console.error('Error searching SWOT analyses:', error);
      return [];
    }
  }

  /**
   * Get recent analyses
   */
  async getRecentAnalyses(userId: string, limit = 5): Promise<ISwotAnalysis[]> {
    try {
      const model = await this.getModel();
      return await model.find({
        userId,
        status: 'completed'
      })
      .sort({ lastAccessed: -1 })
      .limit(limit)
      .exec();
    } catch (error) {
      console.error('Error getting recent analyses:', error);
      return [];
    }
  }

  /**
   * Clean up old analyses (for maintenance)
   */
  async cleanupOldAnalyses(userId: string, olderThanDays = 365): Promise<number> {
    try {
      const model = await this.getModel();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const result = await model.deleteMany({
        userId,
        createdAt: { $lt: cutoffDate },
        accessCount: { $lt: 2 } // Only delete analyses that haven't been accessed much
      });

      return result.deletedCount;
    } catch (error) {
      console.error('Error cleaning up old analyses:', error);
      return 0;
    }
  }
}

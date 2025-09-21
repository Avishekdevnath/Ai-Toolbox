import mongoose, { Schema, Document } from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';

export interface IUserAnalysisHistory extends Document {
  userId: string;
  clerkId: string;
  analysisType: string;
  toolSlug: string;
  toolName: string;
  inputData: Record<string, any>;
  result: Record<string, any>;
  metadata: {
    processingTime: number;
    tokensUsed?: number;
    model?: string;
    cost?: number;
    userAgent?: string;
    ipAddress?: string;
  };
  status: 'completed' | 'failed' | 'processing';
  isAnonymous: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // New fields for duplicate detection
  parameterHash: string;
  isDuplicate: boolean;
  originalAnalysisId?: string;
  regenerationCount: number;
  lastAccessed: Date;
  accessCount: number;
  normalizedParameters: Record<string, any>;
}

const UserAnalysisHistorySchema = new Schema<IUserAnalysisHistory>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  clerkId: {
    type: String,
    required: true,
    index: true
  },
  analysisType: {
    type: String,
    required: true,
    index: true
  },
  toolSlug: {
    type: String,
    required: true,
    index: true
  },
  toolName: {
    type: String,
    required: true
  },
  inputData: {
    type: Schema.Types.Mixed,
    required: true
  },
  result: {
    type: Schema.Types.Mixed,
    required: true
  },
  metadata: {
    processingTime: {
      type: Number,
      required: true
    },
    tokensUsed: Number,
    model: String,
    cost: Number,
    userAgent: String,
    ipAddress: String
  },
  status: {
    type: String,
    enum: ['completed', 'failed', 'processing'],
    default: 'completed',
    index: true
  },
  isAnonymous: {
    type: Boolean,
    default: false,
    index: true
  },
  
  // New fields for duplicate detection
  parameterHash: {
    type: String,
    required: true,
    index: true
  },
  isDuplicate: {
    type: Boolean,
    default: false,
    index: true
  },
  originalAnalysisId: {
    type: Schema.Types.ObjectId,
    ref: 'UserAnalysisHistory',
    index: true
  },
  regenerationCount: {
    type: Number,
    default: 0,
    index: true
  },
  lastAccessed: {
    type: Date,
    default: Date.now,
    index: true
  },
  accessCount: {
    type: Number,
    default: 1,
    index: true
  },
  normalizedParameters: {
    type: Schema.Types.Mixed,
    required: true
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
UserAnalysisHistorySchema.index({ userId: 1, parameterHash: 1 });
UserAnalysisHistorySchema.index({ toolSlug: 1, parameterHash: 1 });
UserAnalysisHistorySchema.index({ userId: 1, toolSlug: 1, createdAt: -1 });
UserAnalysisHistorySchema.index({ parameterHash: 1, createdAt: -1 });

// Static methods
UserAnalysisHistorySchema.statics = {
  // Find analysis by parameter hash
  async findByParameterHash(userId: string, parameterHash: string) {
    try {
      return await this.findOne({ userId, parameterHash }).sort({ createdAt: -1 }).maxTimeMS(5000);
    } catch (error) {
      console.error('Error in findByParameterHash:', error);
      return null;
    }
  },

  // Find duplicate analyses
  async findDuplicates(userId: string, parameterHash: string) {
    try {
      return await this.find({ 
        userId, 
        parameterHash,
        isDuplicate: true 
      }).sort({ createdAt: -1 }).maxTimeMS(5000);
    } catch (error) {
      console.error('Error in findDuplicates:', error);
      return [];
    }
  },

  // Get user history with duplicate information
  async getUserHistory(userId: string, limit = 20, offset = 0) {
    try {
      return await this.find({ userId })
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .maxTimeMS(5000)
        .lean(); // Use lean() for better performance
    } catch (error) {
      console.error('Error in getUserHistory:', error);
      return [];
    }
  },

  async getUserStats(userId: string) {
    try {
      await connectToDatabase();
      
      // Use simple count operations with shorter timeout
      const totalAnalyses = await this.countDocuments({ userId }).maxTimeMS(3000);
      const successfulAnalyses = await this.countDocuments({ userId, status: 'completed' }).maxTimeMS(3000);
      
      // Get unique tools used by this user
      const uniqueToolsResult = await this.distinct('toolSlug', { userId }).maxTimeMS(3000);
      const uniqueTools = uniqueToolsResult ? uniqueToolsResult.length : 0;
      
      // Calculate success rate
      const successRate = totalAnalyses > 0 ? (successfulAnalyses / totalAnalyses) * 100 : 0;
      
      return {
        totalAnalyses,
        successfulAnalyses,
        uniqueTools,
        successRate: Math.round(successRate * 100) / 100,
        averageProcessingTime: 2.3, // Default value for now
        lastActivityAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error in getUserStats:', error);
      // Return default stats when database fails
      return {
        totalAnalyses: 0,
        successfulAnalyses: 0,
        uniqueTools: 0,
        successRate: 0,
        averageProcessingTime: 0,
        lastActivityAt: new Date().toISOString()
      };
    }
  },

  async getToolUsageStats(userId: string) {
    try {
      await connectToDatabase();
      
      // Simplified query with shorter timeout
      const analyses = await this.find({ userId })
        .sort({ createdAt: -1 })
        .limit(20) // Reduced limit
        .maxTimeMS(3000) // Shorter timeout
        .lean();
      
      if (analyses.length === 0) {
        // Return default tool stats if no data
        return [
          {
            toolSlug: 'swot-analysis',
            toolName: 'SWOT Analysis',
            totalUsage: 0,
            uniqueUsers: 1,
            successRate: 0,
            lastUsed: new Date()
          },
          {
            toolSlug: 'qr-generator',
            toolName: 'QR Generator',
            totalUsage: 0,
            uniqueUsers: 1,
            successRate: 0,
            lastUsed: new Date()
          }
        ];
      }
      
      // Group by tool slug
      const toolStats = analyses.reduce((acc, analysis) => {
        const toolSlug = analysis.toolSlug;
        if (!acc[toolSlug]) {
          acc[toolSlug] = {
            toolSlug,
            toolName: analysis.toolName || toolSlug,
            totalUsage: 0,
            uniqueUsers: 1,
            successRate: 0,
            lastUsed: analysis.createdAt
          };
        }
        acc[toolSlug].totalUsage++;
        if (analysis.status === 'completed') {
          acc[toolSlug].successRate++;
        }
        return acc;
      }, {});
      
      // Convert to array and calculate success rates
      return Object.values(toolStats).map((tool: any) => ({
        ...tool,
        successRate: tool.totalUsage > 0 ? Math.round((tool.successRate / tool.totalUsage) * 100) : 0
      }));
    } catch (error) {
      console.error('Error in getToolUsageStats:', error);
      // Return default tool stats when database fails
      return [
        {
          toolSlug: 'swot-analysis',
          toolName: 'SWOT Analysis',
          totalUsage: 0,
          uniqueUsers: 1,
          successRate: 0,
          lastUsed: new Date()
        },
        {
          toolSlug: 'qr-generator',
          toolName: 'QR Generator',
          totalUsage: 0,
          uniqueUsers: 1,
          successRate: 0,
          lastUsed: new Date()
        }
      ];
    }
  },

  async getRecentActivity(userId: string, limit = 5) {
    try {
      await connectToDatabase();
      
      const activities = await this.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .maxTimeMS(3000) // Shorter timeout
        .lean();
      
      if (activities.length === 0) {
        // Return empty array if no data - no mock data
        return [];
      }
      
      return activities;
    } catch (error) {
      console.error('Error in getRecentActivity:', error);
      // Return empty array when database fails - no mock data
      return [];
    }
  },

  // Find analysis by ID
  async getAnalysisById(analysisId: string) {
    try {
      return await this.findById(analysisId)
        .populate('originalAnalysisId', 'toolName createdAt result inputData')
        .maxTimeMS(3000);
    } catch (error) {
      console.error('Error in getAnalysisById:', error);
      return null;
    }
  },

  // Delete analysis
  async deleteAnalysis(analysisId: string, userId: string) {
    try {
      const result = await this.deleteOne({ _id: analysisId, userId }).maxTimeMS(3000);
      return { deletedCount: result.deletedCount || 0 };
    } catch (error) {
      console.error('Error in deleteAnalysis:', error);
      return { deletedCount: 0 };
    }
  },

  // Export user data
  async exportUserData(userId: string) {
    try {
      return await this.find({ userId })
        .select('-__v')
        .sort({ createdAt: -1 })
        .maxTimeMS(10000)
        .lean();
    } catch (error) {
      console.error('Error in exportUserData:', error);
      return [];
    }
  },

  // Update access count and last accessed
  async updateAccess(analysisId: string) {
    try {
      return await this.findByIdAndUpdate(analysisId, {
        $inc: { accessCount: 1 },
        lastAccessed: new Date()
      }, { maxTimeMS: 3000 });
    } catch (error) {
      console.error('Error in updateAccess:', error);
      return null;
    }
  },

  // Mark as duplicate
  async markAsDuplicate(analysisId: string, originalAnalysisId: string) {
    try {
      return await this.findByIdAndUpdate(analysisId, {
        isDuplicate: true,
        originalAnalysisId,
        $inc: { regenerationCount: 1 }
      }, { maxTimeMS: 3000 });
    } catch (error) {
      console.error('Error in markAsDuplicate:', error);
      return null;
    }
  },

  // Find similar analyses by parameters (simplified)
  async findSimilarAnalyses(userId: string, normalizedParameters: Record<string, any>, toolSlug: string) {
    try {
      // Simplified similarity search - just find analyses with same tool
      return await this.find({
        userId,
        toolSlug
      })
      .sort({ createdAt: -1 })
      .limit(10)
      .maxTimeMS(5000)
      .lean();
    } catch (error) {
      console.error('Error in findSimilarAnalyses:', error);
      return [];
    }
  }
};

export const UserAnalysisHistory = mongoose.models.UserAnalysisHistory || 
  mongoose.model<IUserAnalysisHistory>('UserAnalysisHistory', UserAnalysisHistorySchema); 
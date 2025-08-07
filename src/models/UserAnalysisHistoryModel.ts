import mongoose, { Schema, Document } from 'mongoose';

export interface IUserAnalysisHistory extends Document {
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

const UserAnalysisHistorySchema = new Schema<IUserAnalysisHistory>({
  userId: {
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
  analysisType: {
    type: String,
    required: true
  },
  parameters: {
    type: Schema.Types.Mixed,
    required: true
  },
  result: {
    type: Schema.Types.Mixed,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    default: 0
  },
  success: {
    type: Boolean,
    required: true,
    default: true
  },
  error: {
    type: String
  },
  metadata: {
    userAgent: {
      type: String,
      required: true
    },
    ipAddress: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    sessionId: {
      type: String
    }
  }
}, {
  timestamps: true,
  collection: 'useranalysishistories'
});

// Indexes
UserAnalysisHistorySchema.index({ userId: 1 });
UserAnalysisHistorySchema.index({ toolSlug: 1 });
UserAnalysisHistorySchema.index({ createdAt: 1 });
UserAnalysisHistorySchema.index({ userId: 1, toolSlug: 1 });
UserAnalysisHistorySchema.index({ success: 1 });

// Static methods
UserAnalysisHistorySchema.statics = {
  // Get analysis history for a user
  async getUserHistory(userId: string, limit: number = 50) {
    try {
      return await this.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .maxTimeMS(5000);
    } catch (error) {
      console.error('Error getting user history:', error);
      return [];
    }
  },

  // Get analysis history for a specific tool
  async getToolHistory(userId: string, toolSlug: string, limit: number = 20) {
    try {
      return await this.find({ userId, toolSlug })
        .sort({ createdAt: -1 })
        .limit(limit)
        .maxTimeMS(5000);
    } catch (error) {
      console.error('Error getting tool history:', error);
      return [];
    }
  },

  // Get recent analyses across all users
  async getRecentAnalyses(limit: number = 100) {
    try {
      return await this.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .maxTimeMS(5000);
    } catch (error) {
      console.error('Error getting recent analyses:', error);
      return [];
    }
  },

  // Get analysis statistics
  async getAnalysisStats(userId?: string) {
    try {
      const match = userId ? { userId } : {};
      
      const stats = await this.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            totalAnalyses: { $sum: 1 },
            successfulAnalyses: { $sum: { $cond: ['$success', 1, 0] } },
            failedAnalyses: { $sum: { $cond: ['$success', 0, 1] } },
            averageDuration: { $avg: '$duration' },
            totalDuration: { $sum: '$duration' }
          }
        }
      ]);

      const toolStats = await this.aggregate([
        { $match: match },
        {
          $group: {
            _id: '$toolSlug',
            count: { $sum: 1 },
            toolName: { $first: '$toolName' }
          }
        },
        { $sort: { count: -1 } }
      ]);

      return {
        overall: stats[0] || {
          totalAnalyses: 0,
          successfulAnalyses: 0,
          failedAnalyses: 0,
          averageDuration: 0,
          totalDuration: 0
        },
        byTool: toolStats
      };
    } catch (error) {
      console.error('Error getting analysis stats:', error);
      return {
        overall: {
          totalAnalyses: 0,
          successfulAnalyses: 0,
          failedAnalyses: 0,
          averageDuration: 0,
          totalDuration: 0
        },
        byTool: []
      };
    }
  },

  // Delete old analyses
  async deleteOldAnalyses(daysOld: number = 90) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      
      const result = await this.deleteMany({
        createdAt: { $lt: cutoffDate }
      });
      
      return result.deletedCount;
    } catch (error) {
      console.error('Error deleting old analyses:', error);
      return 0;
    }
  }
};

// Instance methods
UserAnalysisHistorySchema.methods = {
  // Mark analysis as failed
  async markAsFailed(error: string) {
    this.success = false;
    this.error = error;
    return await this.save();
  },

  // Update duration
  async updateDuration(duration: number) {
    this.duration = duration;
    return await this.save();
  }
};

// Export the model
export const UserAnalysisHistoryModel = mongoose.models.UserAnalysisHistory || mongoose.model<IUserAnalysisHistory>('UserAnalysisHistory', UserAnalysisHistorySchema); 
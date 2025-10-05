import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IToolUsage extends Document {
  userId: string;
  toolSlug: string;
  toolName: string;
  usageType: 'view' | 'generate' | 'download' | 'share';
  metadata?: Record<string, any>;
  userAgent?: string;
  ipAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IToolUsageModel extends Model<IToolUsage> {
  getToolUsageStats(days?: number): Promise<any[]>;
  getRecentActivity(limit?: number): Promise<any[]>;
  getUserActivity(userId: string, days?: number): Promise<any[]>;
}

const ToolUsageSchema = new Schema<IToolUsage>({
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
  usageType: {
    type: String,
    enum: ['view', 'generate', 'download', 'share'],
    default: 'view'
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  },
  userAgent: {
    type: String
  },
  ipAddress: {
    type: String
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
ToolUsageSchema.index({ toolSlug: 1, createdAt: -1 });
ToolUsageSchema.index({ userId: 1, createdAt: -1 });
ToolUsageSchema.index({ usageType: 1, createdAt: -1 });

// Static methods for analytics
ToolUsageSchema.statics.getToolUsageStats = async function(days: number = 1) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const stats = await this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$toolSlug',
        toolName: { $first: '$toolName' },
        totalUsage: { $sum: 1 },
        uniqueUsers: { $addToSet: '$userId' },
        usageByType: {
          $push: '$usageType'
        }
      }
    },
    {
      $project: {
        toolSlug: '$_id',
        toolName: 1,
        totalUsage: 1,
        uniqueUsers: { $size: '$uniqueUsers' },
        usageByType: 1
      }
    },
    {
      $sort: { totalUsage: -1 }
    }
  ]);

  return stats;
};

ToolUsageSchema.statics.getRecentActivity = async function(limit: number = 10) {
  return await this.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('userId', 'firstName lastName email')
    .lean();
};

ToolUsageSchema.statics.getUserActivity = async function(userId: string, days: number = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return await this.find({
    userId,
    createdAt: { $gte: startDate }
  })
  .sort({ createdAt: -1 })
  .lean();
};

export const ToolUsage = mongoose.models.ToolUsage as IToolUsageModel || mongoose.model<IToolUsage, IToolUsageModel>('ToolUsage', ToolUsageSchema); 
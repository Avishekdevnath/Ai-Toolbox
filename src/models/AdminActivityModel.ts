import mongoose, { Schema, Document } from 'mongoose';

export interface IAdminActivity extends Document {
  adminId: string;
  adminEmail: string;
  adminRole: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: {
    before?: any;
    after?: any;
    changes?: any;
    reason?: string;
  };
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'failed' | 'pending';
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AdminActivitySchema = new Schema<IAdminActivity>({
  adminId: {
    type: String,
    required: true,
    index: true,
  },
  adminEmail: {
    type: String,
    required: true,
    index: true,
  },
  adminRole: {
    type: String,
    required: true,
    enum: ['super_admin', 'admin', 'moderator'],
  },
  action: {
    type: String,
    required: true,
    index: true,
  },
  resource: {
    type: String,
    required: true,
    index: true,
  },
  resourceId: {
    type: String,
    required: false,
    index: true,
  },
  details: {
    before: { type: Schema.Types.Mixed },
    after: { type: Schema.Types.Mixed },
    changes: { type: Schema.Types.Mixed },
    reason: { type: String },
  },
  ipAddress: {
    type: String,
    required: false,
  },
  userAgent: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    enum: ['success', 'failed', 'pending'],
    default: 'success',
    required: true,
  },
  errorMessage: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create indexes for better query performance
AdminActivitySchema.index({ adminId: 1, createdAt: -1 });
AdminActivitySchema.index({ action: 1, createdAt: -1 });
AdminActivitySchema.index({ resource: 1, createdAt: -1 });
AdminActivitySchema.index({ status: 1, createdAt: -1 });
AdminActivitySchema.index({ createdAt: -1 });

// Static methods for audit trail
AdminActivitySchema.statics.logActivity = async function(activityData: {
  adminId: string;
  adminEmail: string;
  adminRole: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  status?: 'success' | 'failed' | 'pending';
  errorMessage?: string;
}) {
  const activity = new this(activityData);
  return activity.save();
};

AdminActivitySchema.statics.getAdminActivity = async function(adminId: string, limit: number = 50) {
  return this.find({ adminId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .exec();
};

AdminActivitySchema.statics.getRecentActivity = async function(limit: number = 20) {
  return this.find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .exec();
};

AdminActivitySchema.statics.getActivityByResource = async function(resource: string, resourceId?: string, limit: number = 50) {
  const query: any = { resource };
  if (resourceId) {
    query.resourceId = resourceId;
  }

  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .exec();
};

AdminActivitySchema.statics.getActivityStats = async function(days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          adminId: '$adminId',
          adminEmail: '$adminEmail',
          adminRole: '$adminRole'
        },
        totalActions: { $sum: 1 },
        successfulActions: {
          $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] }
        },
        failedActions: {
          $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
        },
        actions: {
          $push: {
            action: '$action',
            resource: '$resource',
            status: '$status',
            createdAt: '$createdAt'
          }
        }
      }
    },
    {
      $project: {
        adminId: '$_id.adminId',
        adminEmail: '$_id.adminEmail',
        adminRole: '$_id.adminRole',
        totalActions: 1,
        successfulActions: 1,
        failedActions: 1,
        successRate: {
          $multiply: [
            { $divide: ['$successfulActions', '$totalActions'] },
            100
          ]
        },
        actions: 1
      }
    },
    {
      $sort: { totalActions: -1 }
    }
  ]);
};

export const AdminActivity = mongoose.models.AdminActivity || mongoose.model<IAdminActivity>('AdminActivity', AdminActivitySchema); 
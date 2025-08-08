import mongoose, { Schema, Document } from 'mongoose';

export interface ISystemActivity extends Document {
  type: 'user_activity' | 'tool_usage' | 'system_event' | 'security_event' | 'admin_action';
  userId?: mongoose.Types.ObjectId;
  userEmail?: string;
  action: string;
  toolSlug?: string;
  details?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
}

const SystemActivitySchema = new Schema<ISystemActivity>({
  type: {
    type: String,
    enum: ['user_activity', 'tool_usage', 'system_event', 'security_event', 'admin_action'],
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  userEmail: {
    type: String,
    required: false
  },
  action: {
    type: String,
    required: true
  },
  toolSlug: {
    type: String,
    required: false
  },
  details: {
    type: String,
    required: false
  },
  metadata: {
    type: Schema.Types.Mixed,
    required: false
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  ipAddress: {
    type: String,
    required: false
  },
  userAgent: {
    type: String,
    required: false
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
SystemActivitySchema.index({ timestamp: -1 });
SystemActivitySchema.index({ type: 1, timestamp: -1 });
SystemActivitySchema.index({ userId: 1, timestamp: -1 });
SystemActivitySchema.index({ toolSlug: 1, timestamp: -1 });
SystemActivitySchema.index({ isRead: 1 });

export const SystemActivity = mongoose.models.SystemActivity || mongoose.model<ISystemActivity>('SystemActivity', SystemActivitySchema); 
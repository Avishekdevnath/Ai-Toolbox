import mongoose, { Schema, Document } from 'mongoose';

export interface ISystemAlert extends Document {
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  category: 'system' | 'security' | 'performance' | 'user' | 'tool';
  severity: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
  isActive: boolean;
  expiresAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const SystemAlertSchema = new Schema<ISystemAlert>({
  type: {
    type: String,
    enum: ['info', 'warning', 'error', 'success'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['system', 'security', 'performance', 'user', 'tool'],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date,
    required: false
  },
  metadata: {
    type: Schema.Types.Mixed,
    required: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
SystemAlertSchema.index({ createdAt: -1 });
SystemAlertSchema.index({ isActive: 1, isRead: 1 });
SystemAlertSchema.index({ category: 1, severity: 1 });
SystemAlertSchema.index({ expiresAt: 1 });

export const SystemAlert = mongoose.models.SystemAlert || mongoose.model<ISystemAlert>('SystemAlert', SystemAlertSchema); 
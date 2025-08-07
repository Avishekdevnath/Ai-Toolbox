import mongoose, { Schema, Document } from 'mongoose';

export interface IUserRole extends Document {
  userId: string; // Clerk user ID
  email: string;
  role: 'super_admin' | 'admin' | 'moderator' | 'user';
  permissions: string[];
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserRoleSchema = new Schema<IUserRole>({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
    index: true,
  },
  role: {
    type: String,
    enum: ['super_admin', 'admin', 'moderator', 'user'],
    default: 'user',
    required: true,
  },
  permissions: [{
    type: String,
    enum: [
      'manage_users',
      'manage_tools', 
      'view_analytics',
      'manage_system',
      'manage_content',
      'view_audit_logs',
      'manage_admins',
      'view_dashboard',
      'manage_settings'
    ],
    default: ['view_dashboard']
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLoginAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field on save
UserRoleSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create indexes for better query performance
UserRoleSchema.index({ role: 1, isActive: 1 });
UserRoleSchema.index({ email: 1, isActive: 1 });

export const UserRole = mongoose.models.UserRole || mongoose.model<IUserRole>('UserRole', UserRoleSchema); 
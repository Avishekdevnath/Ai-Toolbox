import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IAdminUser extends Document {
  email: string;
  password: string;
  role: 'super_admin' | 'admin' | 'moderator';
  permissions: string[];
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Instance methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  isLocked(): boolean;
  incrementLoginAttempts(): Promise<void>;
  resetLoginAttempts(): Promise<void>;
}

const AdminUserSchema = new Schema<IAdminUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['super_admin', 'admin', 'moderator'],
    default: 'admin',
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
  firstName: {
    type: String,
    trim: true,
  },
  lastName: {
    type: String,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLoginAt: {
    type: Date,
  },
  loginAttempts: {
    type: Number,
    default: 0,
  },
  lockUntil: {
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

// Role-based permissions mapping
const ROLE_PERMISSIONS: Record<string, string[]> = {
  super_admin: [
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
  admin: [
    'manage_users',
    'manage_tools',
    'view_analytics',
    'manage_content',
    'view_audit_logs',
    'view_dashboard',
    'manage_settings'
  ],
  moderator: [
    'view_analytics',
    'view_dashboard'
  ]
};

// Pre-save middleware to hash password and set permissions
AdminUserSchema.pre('save', async function(next) {
  const adminUser = this;
  
  // Only hash the password if it has been modified (or is new)
  if (!adminUser.isModified('password')) {
    // Set permissions based on role if not already set
    if (!adminUser.permissions || adminUser.permissions.length === 0) {
      adminUser.permissions = ROLE_PERMISSIONS[adminUser.role] || ROLE_PERMISSIONS.admin;
    }
    return next();
  }

  try {
    // Hash the password
    const salt = await bcrypt.genSalt(12);
    adminUser.password = await bcrypt.hash(adminUser.password, salt);
    
    // Set permissions based on role
    adminUser.permissions = ROLE_PERMISSIONS[adminUser.role] || ROLE_PERMISSIONS.admin;
    
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Pre-save middleware to update timestamp
AdminUserSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Instance method to compare password
AdminUserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Instance method to check if account is locked
AdminUserSchema.methods.isLocked = function(): boolean {
  return !!(this.lockUntil && this.lockUntil > new Date());
};

// Instance method to increment login attempts
AdminUserSchema.methods.incrementLoginAttempts = async function(): Promise<void> {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < new Date()) {
    await this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
    return;
  }
  
  const updates: any = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { lockUntil: new Date(Date.now() + 2 * 60 * 60 * 1000) };
  }
  
  await this.updateOne(updates);
};

// Instance method to reset login attempts
AdminUserSchema.methods.resetLoginAttempts = async function(): Promise<void> {
  await this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 },
    $set: { lastLoginAt: new Date() }
  });
};

// Only essential indexes - email is already unique from schema

export const AdminUser = mongoose.models.AdminUser || mongoose.model<IAdminUser>('AdminUser', AdminUserSchema); 
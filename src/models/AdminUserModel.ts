import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

// Admin User Interface
export interface IAdminUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'super_admin' | 'admin' | 'moderator';
  permissions: string[];
  isActive: boolean;
  loginAttempts: number;
  lockUntil?: Date;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Virtual properties
  fullName: string;
  displayName: string;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  incrementLoginAttempts(): Promise<void>;
  resetLoginAttempts(): Promise<void>;
  lockAccount(): Promise<void>;
  unlockAccount(): Promise<void>;
  isAccountLocked(): boolean;
  hasPermission(permission: string): boolean;
  hasAnyPermission(permissions: string[]): boolean;
  hasAllPermissions(permissions: string[]): boolean;
  isSuperAdmin(): boolean;
  isAdmin(): boolean;
  isModerator(): boolean;
}

// Admin User Schema
const AdminUserSchema = new Schema<IAdminUser>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long']
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: {
      values: ['super_admin', 'admin', 'moderator'],
      message: 'Role must be super_admin, admin, or moderator'
    },
    default: 'admin'
  },
  permissions: {
    type: [String],
    required: [true, 'At least one permission is required'],
    validate: {
      validator: function(permissions: string[]) {
        const validPermissions = [
          'manage_users',
          'manage_tools',
          'view_analytics',
          'manage_system',
          'manage_content',
          'view_audit_logs',
          'manage_admins',
          'view_dashboard',
          'manage_settings'
        ];
        return permissions.every(permission => validPermissions.includes(permission));
      },
      message: 'Invalid permission provided'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  loginAttempts: {
    type: Number,
    default: 0,
    min: [0, 'Login attempts cannot be negative']
  },
  lockUntil: {
    type: Date,
    default: null
  },
  lastLoginAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.loginAttempts;
      delete ret.lockUntil;
      return ret;
    }
  }
});

// Indexes
AdminUserSchema.index({ role: 1 });
AdminUserSchema.index({ isActive: 1 });
AdminUserSchema.index({ createdAt: -1 });

// Pre-save middleware to hash password
AdminUserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Pre-save middleware to update permissions based on role
AdminUserSchema.pre('save', function(next) {
  if (this.isModified('role')) {
    const rolePermissions = {
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
    
    this.permissions = rolePermissions[this.role] || [];
  }
  next();
});

// Instance methods
AdminUserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

AdminUserSchema.methods.incrementLoginAttempts = async function(): Promise<void> {
  this.loginAttempts += 1;
  
  // Lock account after 5 failed attempts for 15 minutes
  if (this.loginAttempts >= 5 && !this.isAccountLocked()) {
    this.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  }
  
  await this.save();
};

AdminUserSchema.methods.resetLoginAttempts = async function(): Promise<void> {
  this.loginAttempts = 0;
  this.lockUntil = null;
  this.lastLoginAt = new Date();
  await this.save();
};

AdminUserSchema.methods.lockAccount = async function(): Promise<void> {
  this.isActive = false;
  this.lockUntil = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  await this.save();
};

AdminUserSchema.methods.unlockAccount = async function(): Promise<void> {
  this.isActive = true;
  this.lockUntil = null;
  this.loginAttempts = 0;
  await this.save();
};

AdminUserSchema.methods.isAccountLocked = function(): boolean {
  return !!(this.lockUntil && this.lockUntil > new Date());
};

AdminUserSchema.methods.hasPermission = function(permission: string): boolean {
  return this.permissions.includes(permission);
};

AdminUserSchema.methods.hasAnyPermission = function(permissions: string[]): boolean {
  return permissions.some(permission => this.permissions.includes(permission));
};

AdminUserSchema.methods.hasAllPermissions = function(permissions: string[]): boolean {
  return permissions.every(permission => this.permissions.includes(permission));
};

AdminUserSchema.methods.isSuperAdmin = function(): boolean {
  return this.role === 'super_admin';
};

AdminUserSchema.methods.isAdmin = function(): boolean {
  return this.role === 'admin' || this.role === 'super_admin';
};

AdminUserSchema.methods.isModerator = function(): boolean {
  return this.role === 'moderator' || this.role === 'admin' || this.role === 'super_admin';
};

// Static methods
AdminUserSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

AdminUserSchema.statics.findActiveAdmins = function() {
  return this.find({ isActive: true });
};

AdminUserSchema.statics.findByRole = function(role: string) {
  return this.find({ role });
};

AdminUserSchema.statics.findWithPermission = function(permission: string) {
  return this.find({ permissions: permission });
};

// Virtual for full name
AdminUserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for display name
AdminUserSchema.virtual('displayName').get(function() {
  return `${this.firstName} ${this.lastName}` || this.email;
});

// Export the model
export const AdminUser = mongoose.models?.adminusers || mongoose.model<IAdminUser>('adminusers', AdminUserSchema);

export default AdminUser; 
import mongoose, { Schema, Document } from 'mongoose';

export interface IUserRole extends Document {
  userId: string; // User ID
  role: 'user' | 'admin' | 'moderator';
  permissions: string[];
  assignedBy: string;
  assignedAt: Date;
  expiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserRoleSchema = new Schema<IUserRole>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user',
    required: true
  },
  permissions: [{
    type: String,
    default: []
  }],
  assignedBy: {
    type: String,
    required: true
  },
  assignedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'userroles'
});

// Indexes
UserRoleSchema.index({ userId: 1 }, { unique: true });
UserRoleSchema.index({ role: 1 });
UserRoleSchema.index({ isActive: 1 });
UserRoleSchema.index({ expiresAt: 1 });

// Static methods
UserRoleSchema.statics = {
  // Get user role
  async getUserRole(userId: string) {
    try {
      return await this.findOne({ userId, isActive: true }).maxTimeMS(3000);
    } catch (error) {
      console.error('Error getting user role:', error);
      return null;
    }
  },

  // Assign role to user
  async assignRole(userId: string, role: 'user' | 'admin' | 'moderator', assignedBy: string, permissions: string[] = []) {
    try {
      const userRole = await this.findOneAndUpdate(
        { userId },
        {
          role,
          permissions,
          assignedBy,
          assignedAt: new Date(),
          isActive: true
        },
        { new: true, upsert: true }
      );
      return userRole;
    } catch (error) {
      console.error('Error assigning role:', error);
      return null;
    }
  },

  // Update user role
  async updateRole(userId: string, updates: Partial<IUserRole>) {
    try {
      const userRole = await this.findOneAndUpdate(
        { userId },
        { $set: updates },
        { new: true }
      );
      return userRole;
    } catch (error) {
      console.error('Error updating role:', error);
      return null;
    }
  },

  // Deactivate user role
  async deactivateRole(userId: string) {
    try {
      const result = await this.updateOne(
        { userId },
        { isActive: false }
      );
      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error deactivating role:', error);
      return false;
    }
  },

  // Get all users with a specific role
  async getUsersByRole(role: 'user' | 'admin' | 'moderator') {
    try {
      return await this.find({ role, isActive: true }).maxTimeMS(5000);
    } catch (error) {
      console.error('Error getting users by role:', error);
      return [];
    }
  },

  // Get role statistics
  async getRoleStats() {
    try {
      const stats = await this.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 }
          }
        }
      ]);

      return stats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {} as Record<string, number>);
    } catch (error) {
      console.error('Error getting role stats:', error);
      return {};
    }
  }
};

// Instance methods
UserRoleSchema.methods = {
  // Check if user has permission
  hasPermission(permission: string): boolean {
    return this.permissions.includes(permission);
  },

  // Add permission
  async addPermission(permission: string) {
    if (!this.permissions.includes(permission)) {
      this.permissions.push(permission);
      await this.save();
    }
  },

  // Remove permission
  async removePermission(permission: string) {
    this.permissions = this.permissions.filter(p => p !== permission);
    await this.save();
  },

  // Check if role is expired
  isExpired(): boolean {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
  }
};

// Export the model
export const UserRoleModel = mongoose.models.UserRole || mongoose.model<IUserRole>('UserRole', UserRoleSchema); 
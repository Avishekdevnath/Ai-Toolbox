import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAdminNotification extends Document {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'system' | 'security' | 'user' | 'tool' | 'analytics' | 'maintenance';
  targetRoles?: string[];
  targetAdmins?: string[];
  isRead: boolean;
  isDismissed: boolean;
  expiresAt?: Date;
  metadata?: {
    resourceId?: string;
    resourceType?: string;
    action?: string;
    userId?: string;
    toolSlug?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  readAt?: Date;
  dismissedAt?: Date;
}

export interface IAdminNotificationModel extends Model<IAdminNotification> {
  getUnreadCount(adminId: string, adminRole: string): Promise<number>;
  createNotification(notificationData: any): Promise<any>;
}

const AdminNotificationSchema = new Schema<IAdminNotification>({
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['info', 'warning', 'error', 'success'],
    default: 'info',
    required: true,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
    required: true,
  },
  category: {
    type: String,
    enum: ['system', 'security', 'user', 'tool', 'analytics', 'maintenance'],
    required: true,
  },
  targetRoles: [{
    type: String,
    enum: ['super_admin', 'admin', 'moderator'],
  }],
  targetAdmins: [{
    type: String,
  }],
  isRead: {
    type: Boolean,
    default: false,
    index: true,
  },
  isDismissed: {
    type: Boolean,
    default: false,
    index: true,
  },
  expiresAt: {
    type: Date,
    required: false,
  },
  metadata: {
    resourceId: { type: String },
    resourceType: { type: String },
    action: { type: String },
    userId: { type: String },
    toolSlug: { type: String },
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
  readAt: {
    type: Date,
    required: false,
  },
  dismissedAt: {
    type: Date,
    required: false,
  },
});

// Create indexes
AdminNotificationSchema.index({ type: 1, createdAt: -1 });
AdminNotificationSchema.index({ priority: 1, createdAt: -1 });
AdminNotificationSchema.index({ category: 1, createdAt: -1 });
AdminNotificationSchema.index({ targetRoles: 1, createdAt: -1 });
AdminNotificationSchema.index({ targetAdmins: 1, createdAt: -1 });
AdminNotificationSchema.index({ isRead: 1, createdAt: -1 });
AdminNotificationSchema.index({ isDismissed: 1, createdAt: -1 });
AdminNotificationSchema.index({ expiresAt: 1 });

// Static methods
AdminNotificationSchema.statics.createNotification = async function(notificationData: {
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'error' | 'success';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  category: 'system' | 'security' | 'user' | 'tool' | 'analytics' | 'maintenance';
  targetRoles?: string[];
  targetAdmins?: string[];
  expiresAt?: Date;
  metadata?: any;
}) {
  const notification = new this(notificationData);
  return notification.save();
};

AdminNotificationSchema.statics.getNotificationsForAdmin = async function(adminId: string, adminRole: string, options: {
  unreadOnly?: boolean;
  limit?: number;
  category?: string;
  priority?: string;
} = {}) {
  const query: any = {
    $and: [
      {
        $or: [
          { targetAdmins: adminId },
          { targetRoles: adminRole },
          { targetRoles: { $exists: false }, targetAdmins: { $exists: false } }
        ]
      },
      {
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: { $gt: new Date() } }
        ]
      }
    ],
    isDismissed: false,
  };

  if (options.unreadOnly) {
    query.isRead = false;
  }

  if (options.category) {
    query.category = options.category;
  }

  if (options.priority) {
    query.priority = options.priority;
  }

  return this.find(query)
    .sort({ priority: -1, createdAt: -1 })
    .limit(options.limit || 50)
    .exec();
};

AdminNotificationSchema.statics.markAsRead = async function(notificationId: string, adminId: string) {
  return this.findByIdAndUpdate(notificationId, {
    isRead: true,
    readAt: new Date(),
    updatedAt: new Date(),
  }).exec();
};

AdminNotificationSchema.statics.dismissNotification = async function(notificationId: string, adminId: string) {
  return this.findByIdAndUpdate(notificationId, {
    isDismissed: true,
    dismissedAt: new Date(),
    updatedAt: new Date(),
  }).exec();
};

AdminNotificationSchema.statics.getUnreadCount = async function(adminId: string, adminRole: string) {
  const query = {
    $and: [
      {
        $or: [
          { targetAdmins: adminId },
          { targetRoles: adminRole },
          { targetRoles: { $exists: false }, targetAdmins: { $exists: false } }
        ]
      },
      {
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: { $gt: new Date() } }
        ]
      }
    ],
    isRead: false,
    isDismissed: false
  };

  return this.countDocuments(query).exec();
};

AdminNotificationSchema.statics.cleanupExpiredNotifications = async function() {
  return this.deleteMany({
    expiresAt: { $lt: new Date() }
  }).exec();
};

export const AdminNotification = mongoose.models.AdminNotification as IAdminNotificationModel || mongoose.model<IAdminNotification, IAdminNotificationModel>('AdminNotification', AdminNotificationSchema); 
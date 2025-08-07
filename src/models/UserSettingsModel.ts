import mongoose, { Schema, Document } from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';

export interface IUserSettings extends Document {
  userId: string;
  clerkId: string;
  
  // Profile Settings
  profile: {
    displayName: string;
    bio: string;
    avatar: string;
    timezone: string;
    language: string;
    dateFormat: string;
  };
  
  // Notification Settings
  notifications: {
    email: {
      analysisResults: boolean;
      weeklyReports: boolean;
      systemUpdates: boolean;
      marketing: boolean;
    };
    push: {
      analysisComplete: boolean;
      newFeatures: boolean;
      reminders: boolean;
    };
    frequency: 'immediate' | 'daily' | 'weekly';
  };
  
  // Privacy Settings
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends';
    shareAnalytics: boolean;
    allowDataCollection: boolean;
    showUsageStats: boolean;
  };
  
  // Application Settings
  application: {
    theme: 'light' | 'dark' | 'auto';
    compactMode: boolean;
    autoSave: boolean;
    defaultTool: string;
    resultsPerPage: number;
  };
  
  // API & Integration Settings
  integrations: {
    exportFormat: 'json' | 'csv' | 'pdf';
    autoExport: boolean;
    webhookUrl?: string;
    apiKey?: string;
  };
  
  // Security Settings
  security: {
    twoFactorEnabled: boolean;
    sessionTimeout: number;
    loginNotifications: boolean;
    deviceManagement: boolean;
  };
  
  // Data Management
  dataManagement: {
    autoDeleteOldAnalyses: boolean;
    retentionPeriod: number; // days
    backupFrequency: 'daily' | 'weekly' | 'monthly';
    exportData: boolean;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

const UserSettingsSchema = new Schema<IUserSettings>({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  clerkId: {
    type: String,
    required: true,
    index: true
  },
  
  // Profile Settings
  profile: {
    displayName: {
      type: String,
      default: '',
      maxlength: 100,
      trim: true
    },
    bio: {
      type: String,
      default: '',
      maxlength: 500,
      trim: true
    },
    avatar: {
      type: String,
      default: ''
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    language: {
      type: String,
      default: 'en',
      enum: ['en', 'es', 'fr', 'de', 'zh', 'ja', 'ko']
    },
    dateFormat: {
      type: String,
      default: 'MM/DD/YYYY',
      enum: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']
    }
  },
  
  // Notification Settings
  notifications: {
    email: {
      analysisResults: {
        type: Boolean,
        default: true
      },
      weeklyReports: {
        type: Boolean,
        default: false
      },
      systemUpdates: {
        type: Boolean,
        default: true
      },
      marketing: {
        type: Boolean,
        default: false
      }
    },
    push: {
      analysisComplete: {
        type: Boolean,
        default: true
      },
      newFeatures: {
        type: Boolean,
        default: true
      },
      reminders: {
        type: Boolean,
        default: false
      }
    },
    frequency: {
      type: String,
      default: 'immediate',
      enum: ['immediate', 'daily', 'weekly']
    }
  },
  
  // Privacy Settings
  privacy: {
    profileVisibility: {
      type: String,
      default: 'private',
      enum: ['public', 'private', 'friends']
    },
    shareAnalytics: {
      type: Boolean,
      default: false
    },
    allowDataCollection: {
      type: Boolean,
      default: true
    },
    showUsageStats: {
      type: Boolean,
      default: true
    }
  },
  
  // Application Settings
  application: {
    theme: {
      type: String,
      default: 'auto',
      enum: ['light', 'dark', 'auto']
    },
    compactMode: {
      type: Boolean,
      default: false
    },
    autoSave: {
      type: Boolean,
      default: true
    },
    defaultTool: {
      type: String,
      default: 'swot-analysis'
    },
    resultsPerPage: {
      type: Number,
      default: 20,
      min: 5,
      max: 100
    }
  },
  
  // Integration Settings
  integrations: {
    exportFormat: {
      type: String,
      default: 'json',
      enum: ['json', 'csv', 'pdf']
    },
    autoExport: {
      type: Boolean,
      default: false
    },
    webhookUrl: {
      type: String,
      default: ''
    },
    apiKey: {
      type: String,
      default: ''
    }
  },
  
  // Security Settings
  security: {
    twoFactorEnabled: {
      type: Boolean,
      default: false
    },
    sessionTimeout: {
      type: Number,
      default: 24, // hours
      min: 1,
      max: 168 // 1 week
    },
    loginNotifications: {
      type: Boolean,
      default: true
    },
    deviceManagement: {
      type: Boolean,
      default: true
    }
  },
  
  // Data Management
  dataManagement: {
    autoDeleteOldAnalyses: {
      type: Boolean,
      default: false
    },
    retentionPeriod: {
      type: Number,
      default: 365, // days
      min: 30,
      max: 2555 // 7 years
    },
    backupFrequency: {
      type: String,
      default: 'weekly',
      enum: ['daily', 'weekly', 'monthly']
    },
    exportData: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
UserSettingsSchema.index({ 'profile.displayName': 1 });
UserSettingsSchema.index({ 'application.theme': 1 });
UserSettingsSchema.index({ 'privacy.profileVisibility': 1 });

// Static methods
UserSettingsSchema.statics = {
  // Get user settings by userId
  async getUserSettings(userId: string) {
    try {
      await connectToDatabase();
      let settings = await this.findOne({ userId }).lean();
      
      if (!settings) {
        // Create default settings if none exist
        settings = await this.create({
          userId,
          clerkId: userId,
          profile: {
            displayName: '',
            bio: '',
            avatar: '',
            timezone: 'UTC',
            language: 'en',
            dateFormat: 'MM/DD/YYYY'
          },
          notifications: {
            email: {
              analysisResults: true,
              weeklyReports: false,
              systemUpdates: true,
              marketing: false
            },
            push: {
              analysisComplete: true,
              newFeatures: true,
              reminders: false
            },
            frequency: 'immediate'
          },
          privacy: {
            profileVisibility: 'private',
            shareAnalytics: false,
            allowDataCollection: true,
            showUsageStats: true
          },
          application: {
            theme: 'auto',
            compactMode: false,
            autoSave: true,
            defaultTool: '',
            resultsPerPage: 20
          },
          integrations: {
            exportFormat: 'json',
            autoExport: false,
            webhookUrl: '',
            apiKey: ''
          },
          security: {
            twoFactorEnabled: false,
            sessionTimeout: 24,
            loginNotifications: true,
            deviceManagement: true
          },
          dataManagement: {
            autoDeleteOldAnalyses: false,
            retentionPeriod: 365,
            backupFrequency: 'weekly',
            exportData: false
          }
        });
      }
      
      return settings;
    } catch (error) {
      console.error('Error getting user settings:', error);
      
      // Return default settings if database is unavailable
      return {
        userId,
        clerkId: userId,
        profile: {
          displayName: '',
          bio: '',
          avatar: '',
          timezone: 'UTC',
          language: 'en',
          dateFormat: 'MM/DD/YYYY'
        },
        notifications: {
          email: {
            analysisResults: true,
            weeklyReports: false,
            systemUpdates: true,
            marketing: false
          },
          push: {
            analysisComplete: true,
            newFeatures: true,
            reminders: false
          },
          frequency: 'immediate'
        },
        privacy: {
          profileVisibility: 'private',
          shareAnalytics: false,
          allowDataCollection: true,
          showUsageStats: true
        },
        application: {
          theme: 'auto',
          compactMode: false,
          autoSave: true,
          defaultTool: '',
          resultsPerPage: 20
        },
        integrations: {
          exportFormat: 'json',
          autoExport: false,
          webhookUrl: '',
          apiKey: ''
        },
        security: {
          twoFactorEnabled: false,
          sessionTimeout: 24,
          loginNotifications: true,
          deviceManagement: true
        },
        dataManagement: {
          autoDeleteOldAnalyses: false,
          retentionPeriod: 365,
          backupFrequency: 'weekly',
          exportData: false
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
  },

  // Update user settings
  async updateUserSettings(userId: string, updates: Partial<IUserSettings>) {
    try {
      const result = await this.findOneAndUpdate(
        { userId },
        { $set: updates },
        { new: true, upsert: true, maxTimeMS: 5000 }
      );
      return result;
    } catch (error) {
      console.error('Error updating user settings:', error);
      return null;
    }
  },

  // Update specific settings section
  async updateSettingsSection(userId: string, section: string, updates: any) {
    try {
      const updateObj = {};
      updateObj[section] = updates;
      
      const result = await this.findOneAndUpdate(
        { userId },
        { $set: updateObj },
        { new: true, upsert: true, maxTimeMS: 5000 }
      );
      return result;
    } catch (error) {
      console.error(`Error updating ${section} settings:`, error);
      return null;
    }
  },

  // Delete user settings
  async deleteUserSettings(userId: string) {
    try {
      const result = await this.deleteOne({ userId }).maxTimeMS(3000);
      return { deletedCount: result.deletedCount || 0 };
    } catch (error) {
      console.error('Error deleting user settings:', error);
      return { deletedCount: 0 };
    }
  },

  // Get settings by clerkId
  async getSettingsByClerkId(clerkId: string) {
    try {
      return await this.findOne({ clerkId }).maxTimeMS(3000);
    } catch (error) {
      console.error('Error getting settings by clerkId:', error);
      return null;
    }
  }
};

// Instance methods
UserSettingsSchema.methods = {
  // Update profile settings
  async updateProfile(profileUpdates: any) {
    try {
      this.profile = { ...this.profile, ...profileUpdates };
      return await this.save();
    } catch (error) {
      console.error('Error updating profile:', error);
      return null;
    }
  },

  // Update notification settings
  async updateNotifications(notificationUpdates: any) {
    try {
      this.notifications = { ...this.notifications, ...notificationUpdates };
      return await this.save();
    } catch (error) {
      console.error('Error updating notifications:', error);
      return null;
    }
  },

  // Update privacy settings
  async updatePrivacy(privacyUpdates: any) {
    try {
      this.privacy = { ...this.privacy, ...privacyUpdates };
      return await this.save();
    } catch (error) {
      console.error('Error updating privacy:', error);
      return null;
    }
  },

  // Update application settings
  async updateApplication(appUpdates: any) {
    try {
      this.application = { ...this.application, ...appUpdates };
      return await this.save();
    } catch (error) {
      console.error('Error updating application settings:', error);
      return null;
    }
  }
};

export const UserSettings = mongoose.models.UserSettings || mongoose.model<IUserSettings>('UserSettings', UserSettingsSchema); 
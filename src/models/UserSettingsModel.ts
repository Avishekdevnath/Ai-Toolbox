import mongoose, { Schema, Document } from 'mongoose';

export interface IUserSettings extends Document {
  userId: string;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    marketing: boolean;
    updates: boolean;
    security: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends';
    dataSharing: boolean;
    analytics: boolean;
    thirdParty: boolean;
  };
  accessibility: {
    highContrast: boolean;
    largeText: boolean;
    screenReader: boolean;
    reducedMotion: boolean;
  };
  preferences: {
    defaultTool: string;
    autoSave: boolean;
    showTutorials: boolean;
    compactMode: boolean;
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
  theme: {
    type: String,
    enum: ['light', 'dark', 'auto'],
    default: 'auto'
  },
  language: {
    type: String,
    default: 'en'
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  notifications: {
    email: {
      type: Boolean,
      default: true
    },
    push: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: false
    },
    marketing: {
      type: Boolean,
      default: false
    },
    updates: {
      type: Boolean,
      default: true
    },
    security: {
      type: Boolean,
      default: true
    }
  },
  privacy: {
    profileVisibility: {
      type: String,
      enum: ['public', 'private', 'friends'],
      default: 'public'
    },
    dataSharing: {
      type: Boolean,
      default: false
    },
    analytics: {
      type: Boolean,
      default: true
    },
    thirdParty: {
      type: Boolean,
      default: false
    }
  },
  accessibility: {
    highContrast: {
      type: Boolean,
      default: false
    },
    largeText: {
      type: Boolean,
      default: false
    },
    screenReader: {
      type: Boolean,
      default: false
    },
    reducedMotion: {
      type: Boolean,
      default: false
    }
  },
  preferences: {
    defaultTool: {
      type: String,
      default: 'swot-analysis'
    },
    autoSave: {
      type: Boolean,
      default: true
    },
    showTutorials: {
      type: Boolean,
      default: true
    },
    compactMode: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true,
  collection: 'usersettings'
});

// Indexes
UserSettingsSchema.index({ userId: 1 }, { unique: true });
UserSettingsSchema.index({ theme: 1 });
UserSettingsSchema.index({ language: 1 });
UserSettingsSchema.index({ createdAt: 1 });

// Static methods
UserSettingsSchema.statics = {
  // Get settings by user ID
  async getSettingsByUserId(userId: string) {
    try {
      return await this.findOne({ userId }).maxTimeMS(3000);
    } catch (error) {
      console.error('Error getting settings by userId:', error);
      return null;
    }
  },

  // Create default settings for a user
  async createDefaultSettings(userId: string) {
    try {
      const defaultSettings = new this({
        userId,
        theme: 'auto',
        language: 'en',
        timezone: 'UTC',
        notifications: {
          email: true,
          push: true,
          sms: false,
          marketing: false,
          updates: true,
          security: true
        },
        privacy: {
          profileVisibility: 'public',
          dataSharing: false,
          analytics: true,
          thirdParty: false
        },
        accessibility: {
          highContrast: false,
          largeText: false,
          screenReader: false,
          reducedMotion: false
        },
        preferences: {
          defaultTool: 'swot-analysis',
          autoSave: true,
          showTutorials: true,
          compactMode: false
        }
      });

      return await defaultSettings.save();
    } catch (error) {
      console.error('Error creating default settings:', error);
      return null;
    }
  },

  // Update settings
  async updateSettings(userId: string, updates: Partial<IUserSettings>) {
    try {
      const result = await this.findOneAndUpdate(
        { userId },
        { $set: updates },
        { new: true, upsert: true }
      );
      return result;
    } catch (error) {
      console.error('Error updating settings:', error);
      return null;
    }
  },

  // Delete settings
  async deleteSettings(userId: string) {
    try {
      const result = await this.deleteOne({ userId });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting settings:', error);
      return false;
    }
  },

  // Get all settings with pagination
  async getAllSettings(page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit;
      const settings = await this.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .maxTimeMS(5000);

      const total = await this.countDocuments();

      return {
        settings,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting all settings:', error);
      return { settings: [], pagination: { page, limit, total: 0, pages: 0 } };
    }
  },

  // Get settings statistics
  async getSettingsStats() {
    try {
      const totalSettings = await this.countDocuments();
      const themeStats = await this.aggregate([
        { $group: { _id: '$theme', count: { $sum: 1 } } }
      ]);
      const languageStats = await this.aggregate([
        { $group: { _id: '$language', count: { $sum: 1 } } }
      ]);

      return {
        totalSettings,
        themeStats,
        languageStats
      };
    } catch (error) {
      console.error('Error getting settings stats:', error);
      return { totalSettings: 0, themeStats: [], languageStats: [] };
    }
  }
};

// Instance methods
UserSettingsSchema.methods = {
  // Update theme
  async updateTheme(theme: 'light' | 'dark' | 'auto') {
    this.theme = theme;
    return await this.save();
  },

  // Update language
  async updateLanguage(language: string) {
    this.language = language;
    return await this.save();
  },

  // Update timezone
  async updateTimezone(timezone: string) {
    this.timezone = timezone;
    return await this.save();
  },

  // Update notification settings
  async updateNotifications(notifications: Partial<IUserSettings['notifications']>) {
    this.notifications = { ...this.notifications, ...notifications };
    return await this.save();
  },

  // Update privacy settings
  async updatePrivacy(privacy: Partial<IUserSettings['privacy']>) {
    this.privacy = { ...this.privacy, ...privacy };
    return await this.save();
  },

  // Update accessibility settings
  async updateAccessibility(accessibility: Partial<IUserSettings['accessibility']>) {
    this.accessibility = { ...this.accessibility, ...accessibility };
    return await this.save();
  },

  // Update preferences
  async updatePreferences(preferences: Partial<IUserSettings['preferences']>) {
    this.preferences = { ...this.preferences, ...preferences };
    return await this.save();
  },

  // Reset to default settings
  async resetToDefaults() {
    this.theme = 'auto';
    this.language = 'en';
    this.timezone = 'UTC';
    this.notifications = {
      email: true,
      push: true,
      sms: false,
      marketing: false,
      updates: true,
      security: true
    };
    this.privacy = {
      profileVisibility: 'public',
      dataSharing: false,
      analytics: true,
      thirdParty: false
    };
    this.accessibility = {
      highContrast: false,
      largeText: false,
      screenReader: false,
      reducedMotion: false
    };
    this.preferences = {
      defaultTool: 'swot-analysis',
      autoSave: true,
      showTutorials: true,
      compactMode: false
    };
    return await this.save();
  }
};

// Export the model
export const UserSettingsModel = mongoose.models.UserSettings || mongoose.model<IUserSettings>('UserSettings', UserSettingsSchema); 
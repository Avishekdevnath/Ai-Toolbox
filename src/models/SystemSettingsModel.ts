import mongoose, { Schema, Document } from 'mongoose';

export interface ISystemSettings extends Document {
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  category: 'general' | 'security' | 'email' | 'tools' | 'analytics' | 'maintenance';
  description?: string;
  isPublic: boolean;
  isEditable: boolean;
  updatedBy?: string;
  updatedAt: Date;
  createdAt: Date;
}

const SystemSettingsSchema = new Schema<ISystemSettings>({
  key: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  value: {
    type: Schema.Types.Mixed,
    required: true,
  },
  type: {
    type: String,
    enum: ['string', 'number', 'boolean', 'object', 'array'],
    required: true,
  },
  category: {
    type: String,
    enum: ['general', 'security', 'email', 'tools', 'analytics', 'maintenance'],
    required: true,
    index: true,
  },
  description: {
    type: String,
    required: false,
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  isEditable: {
    type: Boolean,
    default: true,
  },
  updatedBy: {
    type: String,
    required: false,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create indexes
SystemSettingsSchema.index({ key: 1 });
SystemSettingsSchema.index({ category: 1 });
SystemSettingsSchema.index({ isPublic: 1 });

// Static methods
SystemSettingsSchema.statics.getSetting = async function(key: string) {
  const setting = await this.findOne({ key }).exec();
  return setting ? setting.value : null;
};

SystemSettingsSchema.statics.setSetting = async function(key: string, value: any, options: {
  type?: 'string' | 'number' | 'boolean' | 'object' | 'array';
  category?: 'general' | 'security' | 'email' | 'tools' | 'analytics' | 'maintenance';
  description?: string;
  isPublic?: boolean;
  isEditable?: boolean;
  updatedBy?: string;
} = {}) {
  const updateData: any = {
    value,
    updatedAt: new Date(),
  };

  if (options.type) updateData.type = options.type;
  if (options.category) updateData.category = options.category;
  if (options.description) updateData.description = options.description;
  if (options.isPublic !== undefined) updateData.isPublic = options.isPublic;
  if (options.isEditable !== undefined) updateData.isEditable = options.isEditable;
  if (options.updatedBy) updateData.updatedBy = options.updatedBy;

  return this.findOneAndUpdate(
    { key },
    updateData,
    { upsert: true, new: true, runValidators: true }
  ).exec();
};

SystemSettingsSchema.statics.getSettingsByCategory = async function(category: string) {
  return this.find({ category }).exec();
};

SystemSettingsSchema.statics.getPublicSettings = async function() {
  return this.find({ isPublic: true }).exec();
};

SystemSettingsSchema.statics.deleteSetting = async function(key: string) {
  return this.findOneAndDelete({ key }).exec();
};

export const SystemSettings = mongoose.models.SystemSettings || mongoose.model<ISystemSettings>('SystemSettings', SystemSettingsSchema); 
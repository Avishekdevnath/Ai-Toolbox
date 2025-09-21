import mongoose, { Schema, Document } from 'mongoose';

export interface IUserFavorite extends Document {
  userId: string;
  toolSlug: string;
  toolName: string;
  category: string;
  addedAt: Date;
  notes?: string;
  tags?: string[];
}

const UserFavoriteSchema = new Schema<IUserFavorite>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  toolSlug: {
    type: String,
    required: true
  },
  toolName: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    maxlength: 500
  },
  tags: [{
    type: String,
    maxlength: 50
  }]
}, {
  timestamps: true
});

// Compound index to prevent duplicate favorites
UserFavoriteSchema.index({ userId: 1, toolSlug: 1 }, { unique: true });

// Static methods
UserFavoriteSchema.statics.getUserFavorites = async function(userId: string) {
  return await this.find({ userId }).sort({ addedAt: -1 }).lean();
};

UserFavoriteSchema.statics.addFavorite = async function(favoriteData: {
  userId: string;
  toolSlug: string;
  toolName: string;
  category: string;
  notes?: string;
  tags?: string[];
}) {
  try {
    return await this.create(favoriteData);
  } catch (error: any) {
    if (error.code === 11000) {
      throw new Error('Tool already in favorites');
    }
    throw error;
  }
};

UserFavoriteSchema.statics.removeFavorite = async function(userId: string, toolSlug: string) {
  return await this.findOneAndDelete({ userId, toolSlug });
};

UserFavoriteSchema.statics.updateFavorite = async function(userId: string, toolSlug: string, updates: {
  notes?: string;
  tags?: string[];
}) {
  return await this.findOneAndUpdate(
    { userId, toolSlug },
    { $set: updates },
    { new: true }
  );
};

UserFavoriteSchema.statics.getFavoriteStats = async function(userId: string) {
  const stats = await this.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 }
      }
    }
  ]);
  
  return stats.reduce((acc, stat) => {
    acc[stat._id] = stat.count;
    return acc;
  }, {} as Record<string, number>);
};

export const UserFavorite = mongoose.models.UserFavorite || mongoose.model<IUserFavorite>('UserFavorite', UserFavoriteSchema); 
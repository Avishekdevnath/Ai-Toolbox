import mongoose, { Schema, Document } from 'mongoose';

export interface IToolRating extends Document {
  userId: string;
  toolSlug: string;
  toolName: string;
  rating: number; // 1-5 stars
  review?: string;
  helpful: number;
  reported: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ToolRatingSchema = new Schema<IToolRating>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  toolSlug: {
    type: String,
    required: true,
    index: true
  },
  toolName: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    maxlength: 1000
  },
  helpful: {
    type: Number,
    default: 0
  },
  reported: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate ratings from same user
ToolRatingSchema.index({ userId: 1, toolSlug: 1 }, { unique: true });

// Static methods
ToolRatingSchema.statics.getToolRatings = async function(toolSlug: string, limit: number = 10, skip: number = 0) {
  return await this.find({ toolSlug, reported: false })
    .sort({ helpful: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
};

ToolRatingSchema.statics.getToolStats = async function(toolSlug: string) {
  const stats = await this.aggregate([
    { $match: { toolSlug, reported: false } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalRatings: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    }
  ]);

  if (stats.length === 0) {
    return {
      averageRating: 0,
      totalRatings: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  }

  const stat = stats[0];
  const distribution = stat.ratingDistribution.reduce((acc: Record<number, number>, rating: number) => {
    acc[rating] = (acc[rating] || 0) + 1;
    return acc;
  }, {});

  return {
    averageRating: Math.round(stat.averageRating * 100) / 100,
    totalRatings: stat.totalRatings,
    ratingDistribution: distribution
  };
};

ToolRatingSchema.statics.addRating = async function(ratingData: {
  userId: string;
  toolSlug: string;
  toolName: string;
  rating: number;
  review?: string;
}) {
  try {
    return await this.create(ratingData);
  } catch (error: any) {
    if (error.code === 11000) {
      // Update existing rating
      return await this.findOneAndUpdate(
        { userId: ratingData.userId, toolSlug: ratingData.toolSlug },
        { $set: { rating: ratingData.rating, review: ratingData.review } },
        { new: true }
      );
    }
    throw error;
  }
};

ToolRatingSchema.statics.markHelpful = async function(ratingId: string) {
  return await this.findByIdAndUpdate(
    ratingId,
    { $inc: { helpful: 1 } },
    { new: true }
  );
};

ToolRatingSchema.statics.reportRating = async function(ratingId: string) {
  return await this.findByIdAndUpdate(
    ratingId,
    { $set: { reported: true } },
    { new: true }
  );
};

export const ToolRating = mongoose.models.ToolRating || mongoose.model<IToolRating>('ToolRating', ToolRatingSchema); 
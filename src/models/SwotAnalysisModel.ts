import mongoose, { Schema, Document } from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';

export interface ISwotAnalysis extends Document {
  userId: string;
  analysisType: 'personal' | 'business' | 'project' | 'career' | 'investment' | 'emotional';
  name: string;
  inputData: {
    swotType: string;
    formData: {
      name: string;
      age?: string;
      profession?: string;
      goals?: string;
      challenges?: string;
      skills?: string;
      businessType?: string;
      industry?: string;
      companySize?: string;
      yearsInBusiness?: string;
      businessDescription?: string;
      projectName?: string;
      projectType?: string;
      duration?: string;
      budget?: string;
      projectDescription?: string;
      currentRole?: string;
      targetRole?: string;
      experience?: string;
      careerGoals?: string;
      investmentType?: string;
      amount?: string;
      timeHorizon?: string;
      riskTolerance?: string;
      emotionalGoals?: string;
      stressFactors?: string;
      emotionalStrengths?: string;
      relationshipStatus?: string;
      copingMechanisms?: string;
    };
  };
  result: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
    aiTips?: {
      leverageStrengths: string[];
      addressWeaknesses: string[];
      capitalizeOpportunities: string[];
      mitigateThreats: string[];
      strategicRecommendations: string[];
      motivationalSummary: string;
    };
  };
  metadata: {
    processingTime: number;
    tokensUsed?: number;
    model?: string;
    cost?: number;
    userAgent?: string;
    ipAddress?: string;
    isDuplicate?: boolean;
    originalAnalysisId?: string;
  };
  status: 'completed' | 'failed' | 'processing';
  isAnonymous: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastAccessed: Date;
  accessCount: number;
  
  // Duplicate detection fields
  parameterHash: string;
  isDuplicate: boolean;
  originalAnalysisId?: string;
  regenerationCount: number;
  normalizedParameters: Record<string, any>;
}

const SwotAnalysisSchema = new Schema<ISwotAnalysis>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  analysisType: {
    type: String,
    required: true,
    enum: ['personal', 'business', 'project', 'career', 'investment', 'emotional'],
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  inputData: {
    swotType: {
      type: String,
      required: true
    },
    formData: {
      type: Schema.Types.Mixed,
      required: true
    }
  },
  result: {
    strengths: [{
      type: String,
      required: true
    }],
    weaknesses: [{
      type: String,
      required: true
    }],
    opportunities: [{
      type: String,
      required: true
    }],
    threats: [{
      type: String,
      required: true
    }],
    aiTips: {
      leverageStrengths: [String],
      addressWeaknesses: [String],
      capitalizeOpportunities: [String],
      mitigateThreats: [String],
      strategicRecommendations: [String],
      motivationalSummary: String
    }
  },
  metadata: {
    processingTime: {
      type: Number,
      required: true
    },
    tokensUsed: Number,
    model: String,
    cost: Number,
    userAgent: String,
    ipAddress: String,
    isDuplicate: {
      type: Boolean,
      default: false
    },
    originalAnalysisId: {
      type: Schema.Types.ObjectId,
      ref: 'SwotAnalysis'
    }
  },
  status: {
    type: String,
    enum: ['completed', 'failed', 'processing'],
    default: 'completed',
    index: true
  },
  isAnonymous: {
    type: Boolean,
    default: false,
    index: true
  },
  lastAccessed: {
    type: Date,
    default: Date.now,
    index: true
  },
  accessCount: {
    type: Number,
    default: 1,
    index: true
  },
  
  // Duplicate detection fields
  parameterHash: {
    type: String,
    required: true,
    index: true
  },
  isDuplicate: {
    type: Boolean,
    default: false,
    index: true
  },
  originalAnalysisId: {
    type: Schema.Types.ObjectId,
    ref: 'SwotAnalysis',
    index: true
  },
  regenerationCount: {
    type: Number,
    default: 0,
    index: true
  },
  normalizedParameters: {
    type: Schema.Types.Mixed,
    required: true
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
SwotAnalysisSchema.index({ userId: 1, createdAt: -1 });
SwotAnalysisSchema.index({ userId: 1, analysisType: 1 });
SwotAnalysisSchema.index({ userId: 1, parameterHash: 1 });
SwotAnalysisSchema.index({ analysisType: 1, createdAt: -1 });
SwotAnalysisSchema.index({ status: 1, createdAt: -1 });

// Static methods
SwotAnalysisSchema.statics.findByUserId = function(userId: string, limit = 50, skip = 0) {
  return this.find({ userId, status: 'completed' })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

SwotAnalysisSchema.statics.findByParameterHash = function(userId: string, parameterHash: string) {
  return this.findOne({ userId, parameterHash, status: 'completed' });
};

SwotAnalysisSchema.statics.findSimilarAnalyses = function(userId: string, normalizedParams: any, analysisType: string) {
  // This would implement similarity search logic
  // For now, return empty array
  return this.find({ userId, analysisType, status: 'completed' }).limit(5);
};

SwotAnalysisSchema.statics.updateAccess = function(analysisId: string) {
  return this.findByIdAndUpdate(
    analysisId,
    {
      $inc: { accessCount: 1 },
      $set: { lastAccessed: new Date() }
    },
    { new: true }
  );
};

SwotAnalysisSchema.statics.getUserStats = function(userId: string) {
  return this.aggregate([
    { $match: { userId, status: 'completed' } },
    {
      $group: {
        _id: null,
        totalAnalyses: { $sum: 1 },
        totalAccessCount: { $sum: '$accessCount' },
        analysisTypes: { $addToSet: '$analysisType' },
        lastAnalysis: { $max: '$createdAt' }
      }
    }
  ]);
};

// Instance methods
SwotAnalysisSchema.methods.incrementAccess = function() {
  this.accessCount += 1;
  this.lastAccessed = new Date();
  return this.save();
};

SwotAnalysisSchema.methods.getSummary = function() {
  return {
    id: this._id,
    name: this.name,
    analysisType: this.analysisType,
    strengthsCount: this.result.strengths.length,
    weaknessesCount: this.result.weaknesses.length,
    opportunitiesCount: this.result.opportunities.length,
    threatsCount: this.result.threats.length,
    createdAt: this.createdAt,
    lastAccessed: this.lastAccessed,
    accessCount: this.accessCount,
    isDuplicate: this.isDuplicate
  };
};

// Create and export the model
let SwotAnalysis: mongoose.Model<ISwotAnalysis> | null = null;

export const getSwotAnalysisModel = async () => {
  if (!SwotAnalysis) {
    await connectToDatabase();
    SwotAnalysis = mongoose.model<ISwotAnalysis>('SwotAnalysis', SwotAnalysisSchema);
  }
  return SwotAnalysis;
};

export default SwotAnalysis;

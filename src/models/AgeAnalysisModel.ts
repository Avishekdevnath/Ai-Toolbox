import mongoose, { Schema, Document } from 'mongoose';

export interface IAgeAnalysis extends Document {
  userId?: string;
  input: any;
  result: any;
  hash: string;
  createdAt: Date;
  updatedAt: Date;
}

const AgeAnalysisSchema = new Schema<IAgeAnalysis>({
  userId: { type: String, required: false },
  input: { type: Schema.Types.Mixed, required: true },
  result: { type: Schema.Types.Mixed, required: true },
  hash: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const AgeAnalysisModel = mongoose.models.AgeAnalysis || mongoose.model<IAgeAnalysis>('AgeAnalysis', AgeAnalysisSchema); 
import mongoose, { Schema, Document, models } from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';

export interface IFormResponse extends Document {
  formId: mongoose.Types.ObjectId;
  responder?: { name?: string; email?: string; studentId?: string; ip?: string; userAgent?: string };
  startedAt?: Date;
  submittedAt: Date;
  durationMs?: number;
  answers: Array<{ fieldId: string; questionCode?: string; value: any }>;
  score?: number;
  maxScore?: number;
  meta?: Record<string, any>;
}

const FormResponseSchema = new Schema<IFormResponse>({
  formId: { type: Schema.Types.ObjectId, ref: 'Form', required: true },
  responder: {
    name: String,
    email: { type: String, lowercase: true, trim: true },
    studentId: { type: String, trim: true },
    ip: String,
    userAgent: String,
  },
  startedAt: { type: Date },
  submittedAt: { type: Date, default: () => new Date(), index: true },
  durationMs: Number,
  answers: [{ fieldId: String, questionCode: String, value: Schema.Types.Mixed }],
  score: Number,
  maxScore: Number,
  meta: Schema.Types.Mixed,
}, { timestamps: true, collection: 'formresponses' });

FormResponseSchema.index({ 'responder.email': 1, formId: 1 });
FormResponseSchema.index({ 'responder.studentId': 1, formId: 1 });
// Optimize listing/counts by form and sort by recent submissions
FormResponseSchema.index({ formId: 1, submittedAt: -1 });

// Ensure formId is always stored as an ObjectId, even if a string is provided
FormResponseSchema.pre('validate', function (next) {
  try {
    // @ts-ignore - this refers to the mongoose document instance
    if (this.formId && !(this.formId instanceof mongoose.Types.ObjectId)) {
      // @ts-ignore
      this.formId = new mongoose.Types.ObjectId(String(this.formId));
    }
    next();
  } catch (e) {
    next(e as any);
  }
});

export async function getFormResponseModel() {
  await connectToDatabase();
  return (models.FormResponse as mongoose.Model<IFormResponse>) || mongoose.model<IFormResponse>('FormResponse', FormResponseSchema);
}



import mongoose, { Schema, models } from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';

export interface IAdminNote {
  text: string;
  adminId: string;
  createdAt: Date;
}

export interface IFeedback {
  _id: mongoose.Types.ObjectId;
  visitorId: string | null;
  userId: string | null;
  type: 'bug' | 'feature';
  title: string;
  description: string;
  url: string;
  status: 'new' | 'in_review' | 'planned' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | null;
  recentTools: string[];
  adminNotes: IAdminNote[];
  userAgent: string;
  createdAt: Date;
  updatedAt: Date;
}

const AdminNoteSchema = new Schema<IAdminNote>({
  text: { type: String, required: true },
  adminId: { type: String, required: true },
  createdAt: { type: Date, default: () => new Date() },
}, { _id: false });

const FeedbackSchema = new Schema<IFeedback>({
  visitorId: { type: String, default: null },
  userId: { type: String, default: null },
  type: { type: String, enum: ['bug', 'feature'], required: true },
  title: { type: String, required: true, maxlength: 100, trim: true },
  description: { type: String, required: true, maxlength: 2000, trim: true },
  url: { type: String, required: true },
  status: { type: String, enum: ['new', 'in_review', 'planned', 'resolved', 'closed'], default: 'new' },
  priority: { type: String, enum: ['low', 'medium', 'high', null], default: null },
  recentTools: { type: [String], default: [] },
  adminNotes: { type: [AdminNoteSchema], default: [] },
  userAgent: { type: String, required: true },
}, { timestamps: true, collection: 'feedback' });

FeedbackSchema.index({ status: 1, createdAt: -1 });
FeedbackSchema.index({ type: 1, status: 1 });
FeedbackSchema.index({ visitorId: 1 });

export async function getFeedbackModel() {
  await connectToDatabase();
  return (models.Feedback as mongoose.Model<IFeedback>) ||
    mongoose.model<IFeedback>('Feedback', FeedbackSchema);
}

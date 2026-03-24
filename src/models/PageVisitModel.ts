import mongoose, { Schema, models } from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';

export interface IPageVisit {
  _id: mongoose.Types.ObjectId;
  visitorId: string;
  userId: string | null;
  path: string;
  referrer: string | null;
  userAgent: string;
  createdAt: Date;
}

const PageVisitSchema = new Schema<IPageVisit>({
  visitorId: { type: String, required: true },
  userId: { type: String, default: null },
  path: { type: String, required: true },
  referrer: { type: String, default: null },
  userAgent: { type: String, required: true },
}, { timestamps: { createdAt: true, updatedAt: false }, collection: 'page_visits' });

PageVisitSchema.index({ visitorId: 1, createdAt: -1 });
PageVisitSchema.index({ userId: 1, createdAt: -1 });
PageVisitSchema.index({ path: 1, createdAt: -1 });
// TTL: auto-delete after 90 days
PageVisitSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

export async function getPageVisitModel() {
  await connectToDatabase();
  return (models.PageVisit as mongoose.Model<IPageVisit>) ||
    mongoose.model<IPageVisit>('PageVisit', PageVisitSchema);
}

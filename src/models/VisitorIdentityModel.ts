import mongoose, { Schema, models } from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';

export interface IVisitorIdentity {
  _id: mongoose.Types.ObjectId;
  visitorId: string;
  userId: string | null;
  firstSeenAt: Date;
  lastSeenAt: Date;
}

const VisitorIdentitySchema = new Schema<IVisitorIdentity>({
  visitorId: { type: String, required: true },
  userId: { type: String, default: null },
  firstSeenAt: { type: Date, required: true },
  lastSeenAt: { type: Date, required: true },
}, { timestamps: false, collection: 'visitor_identities' });

VisitorIdentitySchema.index({ visitorId: 1 }, { unique: true });
VisitorIdentitySchema.index({ userId: 1 }, { sparse: true });

export async function getVisitorIdentityModel() {
  await connectToDatabase();
  return (models.VisitorIdentity as mongoose.Model<IVisitorIdentity>) ||
    mongoose.model<IVisitorIdentity>('VisitorIdentity', VisitorIdentitySchema);
}

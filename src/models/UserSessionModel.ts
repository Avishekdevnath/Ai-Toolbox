import mongoose, { Schema, Document } from 'mongoose';

export interface IUserSession extends Document {
  userId: string;
  sessionType: 'login' | 'logout' | 'active';
  userAgent?: string;
  ipAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSessionSchema = new Schema<IUserSession>({
  userId: { type: String, required: true, index: true },
  sessionType: { type: String, enum: ['login', 'logout', 'active'], default: 'active' },
  userAgent: { type: String },
  ipAddress: { type: String },
}, { timestamps: true });

UserSessionSchema.index({ userId: 1, createdAt: -1 });

export const UserSession = mongoose.models.UserSession || mongoose.model<IUserSession>('UserSession', UserSessionSchema);



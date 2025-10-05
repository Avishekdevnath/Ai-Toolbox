import mongoose, { Schema, Document, models } from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';

export interface IPendingRegistration extends Document {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  passwordHash: string;
  otpCodeHash: string;
  otpExpiresAt: Date;
  resendAvailableAt?: Date;
  attempts: number;
  createdAt: Date;
  updatedAt: Date;
}

const PendingRegistrationSchema = new Schema<IPendingRegistration>({
  email: { type: String, required: true, lowercase: true, trim: true },
  username: { type: String, required: true, lowercase: true, trim: true },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  phoneNumber: { type: String },
  passwordHash: { type: String, required: true },
  otpCodeHash: { type: String, required: true },
  otpExpiresAt: { type: Date, required: true, index: true },
  resendAvailableAt: { type: Date },
  attempts: { type: Number, default: 0 },
}, { timestamps: true, collection: 'pendingregistrations' });

// Create indexes separately to avoid duplicates
PendingRegistrationSchema.index({ email: 1 }, { unique: false });
PendingRegistrationSchema.index({ username: 1 }, { unique: false });

export async function getPendingRegistrationModel() {
  await connectToDatabase();
  return (models.PendingRegistration as mongoose.Model<IPendingRegistration>) ||
    mongoose.model<IPendingRegistration>('PendingRegistration', PendingRegistrationSchema);
}

import mongoose, { Schema, models } from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';

export interface IContactMessage {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

const ContactMessageSchema = new Schema<IContactMessage>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true, index: true },
  phone: { type: String, required: false, trim: true },
  subject: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true, maxlength: 5000 },
  status: { type: String, enum: ['new', 'read', 'archived'], default: 'new', index: true },
}, { timestamps: true, collection: 'contactmessages' });

ContactMessageSchema.index({ createdAt: -1 });

export async function getContactMessageModel() {
  await connectToDatabase();
  return (models.ContactMessage as mongoose.Model<IContactMessage>) ||
    mongoose.model<IContactMessage>('ContactMessage', ContactMessageSchema);
}



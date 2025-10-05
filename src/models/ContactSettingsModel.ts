import mongoose, { Schema, models } from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';

export interface IContactSettings {
  _id: mongoose.Types.ObjectId;
  email?: string;
  phone?: string;
  address?: string;
  portfolioUrl?: string;
  liveChatUrl?: string;
  pageTitle?: string;
  pageDescription?: string;
  additionalInfo?: {
    title?: string;
    description?: string;
    responseTime?: string;
    isActive?: boolean;
  };
  contactMethods?: Array<{
    title: string;
    description: string;
    value: string;
    href: string;
    icon: string;
    color?: string;
    isActive: boolean;
    order: number;
    _id?: string;
  }>;
  features?: Array<{
    title: string;
    description: string;
    icon: string;
    isActive: boolean;
  }>;
  updatedAt: Date;
  createdAt: Date;
}

const ContactSettingsSchema = new Schema<IContactSettings>({
  email: { type: String, trim: true, lowercase: true },
  phone: { type: String, trim: true },
  address: { type: String, trim: true },
  portfolioUrl: { type: String, trim: true },
  liveChatUrl: { type: String, trim: true },
  pageTitle: { type: String, trim: true, default: 'Contact Us' },
  pageDescription: { type: String, trim: true },
  additionalInfo: {
    title: { type: String, trim: true },
    description: { type: String, trim: true },
    responseTime: { type: String, trim: true },
    isActive: { type: Boolean, default: true }
  },
  contactMethods: [{
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
    href: { type: String, required: true, trim: true },
    icon: { type: String, required: true, trim: true },
    color: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 }
  }],
  features: [{
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    icon: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true }
  }]
}, { timestamps: true, collection: 'contactsettings' });

export async function getContactSettingsModel() {
  await connectToDatabase();
  return (models.ContactSettings as mongoose.Model<IContactSettings>) ||
    mongoose.model<IContactSettings>('ContactSettings', ContactSettingsSchema);
}



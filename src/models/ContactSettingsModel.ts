import mongoose from 'mongoose';
import contactSettingsSchema from '../schemas/contactSettingsSchema';

export interface IContactMethod {
  title: string;
  description: string;
  value: string;
  href: string;
  icon: string;
  color: string;
  isActive: boolean;
  order: number;
}

export interface IContactFeature {
  icon: string;
  title: string;
  description: string;
  isActive: boolean;
  order: number;
}

export interface IAdditionalInfo {
  title: string;
  description: string;
  responseTime: string;
  isActive: boolean;
}

export interface IContactSettings {
  contactMethods: IContactMethod[];
  pageTitle: string;
  pageDescription: string;
  features: IContactFeature[];
  additionalInfo: IAdditionalInfo;
  updatedBy: mongoose.Types.ObjectId;
  updatedAt: Date;
  createdAt: Date;
}

export const ContactSettingsModel = mongoose.models.ContactSettings || 
  mongoose.model<IContactSettings>('ContactSettings', contactSettingsSchema); 
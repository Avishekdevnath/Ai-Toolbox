import mongoose, { Schema, models } from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';

export interface IAboutInfo {
  _id: mongoose.Types.ObjectId;
  // Personal Information
  name: string;
  title: string;
  description: string;
  avatar?: string;
  
  // Contact Information
  email: string;
  phone: string;
  location: string;
  portfolioUrl: string;
  
  // Social Links
  socialLinks?: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    instagram?: string;
    website?: string;
  };
  
  // Professional Information
  experience?: Array<{
    title: string;
    company: string;
    location: string;
    period: string;
    type: string;
    skills: string[];
    website?: string;
    description?: string;
    isActive: boolean;
    order: number;
  }>;
  
  education?: Array<{
    title: string;
    institution: string;
    field: string;
    period: string;
    isActive: boolean;
    order: number;
  }>;
  
  skills?: Array<{
    name: string;
    category: 'frontend' | 'backend' | 'database' | 'devops' | 'other';
    level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    isActive: boolean;
    order: number;
  }>;
  
  // Page Settings
  pageSettings?: {
    showExperience: boolean;
    showEducation: boolean;
    showSkills: boolean;
    showContact: boolean;
    customSections?: Array<{
      title: string;
      content: string;
      isActive: boolean;
      order: number;
    }>;
  };
  
  updatedAt: Date;
  createdAt: Date;
}

const AboutInfoSchema = new Schema<IAboutInfo>({
  name: { type: String, required: true, trim: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  avatar: { type: String, trim: true },
  
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  portfolioUrl: { type: String, required: true, trim: true },
  
  socialLinks: {
    linkedin: { type: String, trim: true },
    github: { type: String, trim: true },
    twitter: { type: String, trim: true },
    instagram: { type: String, trim: true },
    website: { type: String, trim: true }
  },
  
  experience: [{
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    period: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    skills: [{ type: String, trim: true }],
    website: { type: String, trim: true },
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 }
  }],
  
  education: [{
    title: { type: String, required: true, trim: true },
    institution: { type: String, required: true, trim: true },
    field: { type: String, required: true, trim: true },
    period: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 }
  }],
  
  skills: [{
    name: { type: String, required: true, trim: true },
    category: { 
      type: String, 
      enum: ['frontend', 'backend', 'database', 'devops', 'other'],
      default: 'other'
    },
    level: { 
      type: String, 
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'intermediate'
    },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 }
  }],
  
  pageSettings: {
    showExperience: { type: Boolean, default: true },
    showEducation: { type: Boolean, default: true },
    showSkills: { type: Boolean, default: true },
    showContact: { type: Boolean, default: true },
    customSections: [{
      title: { type: String, required: true, trim: true },
      content: { type: String, required: true, trim: true },
      isActive: { type: Boolean, default: true },
      order: { type: Number, default: 0 }
    }]
  }
}, { timestamps: true, collection: 'aboutinfo' });

export async function getAboutInfoModel() {
  await connectToDatabase();
  return (models.AboutInfo as mongoose.Model<IAboutInfo>) ||
    mongoose.model<IAboutInfo>('AboutInfo', AboutInfoSchema);
}

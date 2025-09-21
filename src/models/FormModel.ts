import mongoose, { Schema, Document, models } from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';

export type FormType = 'survey' | 'general' | 'attendance' | 'quiz';
export type FormStatus = 'draft' | 'published' | 'archived';

export interface IFormField {
  id: string;
  questionCode?: string;
  label: string;
  type: 'short_text' | 'long_text' | 'email' | 'number' | 'date' | 'time' | 'dropdown' | 'checkbox' | 'radio' | 'single_select' | 'matrix' | 'file' | 'rating' | 'scale' | 'section' | 'image' | 'video';
  required: boolean;
  options?: string[];
  multiple?: boolean;
  placeholder?: string;
  helpText?: string;
  imageUrl?: string;
  visibility?: 'public' | 'internal';
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    unique?: boolean;
    selection?: { min?: number; max?: number };
  };
  quiz?: {
    correctOptions?: number[];
    points?: number;
  };
}

export interface IForm extends Document {
  ownerId: string;
  title: string;
  description?: string;
  type: FormType;
  slug?: string;  // URL-friendly identifier for the form
  fields: IFormField[];
  settings: {
    isPublic: boolean;
    allowMultipleSubmissions: boolean;
    allowAnonymous: boolean;
    identitySchema?: { requireName?: boolean; requireEmail?: boolean; requireStudentId?: boolean };
    timer?: { enabled: boolean; minutes: number };
    startAt?: Date;
    endAt?: Date;
    quiz?: { scoringEnabled: boolean; passingScore?: number };
  };
  submissionPolicy?: {
    dedupeBy?: Array<'email' | 'studentId'>;
    oneAttemptPerIdentity?: boolean;
  };
  status: FormStatus;
  createdAt: Date;
  updatedAt: Date;
}

const FormFieldSchema = new Schema<IFormField>({
  id: { type: String, required: true },
  questionCode: { type: String, trim: true },
  label: { type: String, required: true, trim: true },
  type: { type: String, required: true },
  required: { type: Boolean, default: false },
  options: [{ type: String }],
  multiple: { type: Boolean, default: false },
  placeholder: { type: String },
  helpText: { type: String },
  imageUrl: { type: String },
  visibility: { type: String, enum: ['public', 'internal'], default: 'public' },
  validation: {
    min: Number,
    max: Number,
    pattern: String,
    unique: Boolean,
    selection: {
      min: Number,
      max: Number,
    },
  },
  quiz: {
    correctOptions: [{ type: Number }],
    points: { type: Number },
  },
}, { _id: false });

const FormSchema = new Schema<IForm>({
  ownerId: { type: String, required: true, index: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  type: { type: String, enum: ['survey', 'general', 'attendance', 'quiz'], required: true, index: true },
  slug: { type: String, trim: true },
  fields: { type: [FormFieldSchema], default: [] },
  settings: {
    isPublic: { type: Boolean, default: false },
    allowMultipleSubmissions: { type: Boolean, default: true },
    allowAnonymous: { type: Boolean, default: false },
    identitySchema: {
      requireName: { type: Boolean, default: false },
      requireEmail: { type: Boolean, default: false },
      requireStudentId: { type: Boolean, default: false },
    },
    timer: {
      enabled: { type: Boolean, default: false },
      minutes: { type: Number, default: 0 },
    },
    startAt: { type: Date },
    endAt: { type: Date },
    quiz: {
      scoringEnabled: { type: Boolean, default: false },
      passingScore: { type: Number },
    },
  },
  submissionPolicy: {
    dedupeBy: [{ type: String, enum: ['email', 'studentId'] }],
    oneAttemptPerIdentity: { type: Boolean, default: false },
  },
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft', index: true },
}, { timestamps: true, collection: 'forms' });

FormSchema.index({ ownerId: 1, updatedAt: -1 });
FormSchema.index({ status: 1, type: 1 });
FormSchema.index({ slug: 1 }, { unique: true, sparse: true });

export async function getFormModel() {
  await connectToDatabase();
  return (models.Form as mongoose.Model<IForm>) || mongoose.model<IForm>('Form', FormSchema);
}



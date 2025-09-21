import mongoose, { Schema, Document, models } from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';

export interface ICodeSnippet extends Document {
  ownerId?: mongoose.Types.ObjectId;
  slug: string;
  title?: string;
  language: string;
  content: string;
  rawContent?: string;
  isPublic: boolean;
  viewCount: number;
  favoriteCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const CodeSnippetSchema = new Schema<ICodeSnippet>({
  ownerId: { type: Schema.Types.ObjectId, ref: 'User' },
  slug: { type: String, required: true, unique: true, index: true },
  title: { type: String, trim: true, maxlength: 120 },
  language: { type: String, required: true, trim: true, lowercase: true },
  content: { type: String, default: '' },
  rawContent: { type: String },
  isPublic: { type: Boolean, default: true },
  viewCount: { type: Number, default: 0 },
  favoriteCount: { type: Number, default: 0 },
}, { timestamps: true, collection: 'codesnippets' });

CodeSnippetSchema.index({ ownerId: 1, updatedAt: -1 });

export async function getCodeSnippetModel() {
  await connectToDatabase();
  // If model exists but schema definition changed, delete and re-register
  if (models.CodeSnippet?.schema?.paths?.content?.default === undefined) {
    delete models.CodeSnippet;
  }
  return (
    models.CodeSnippet as mongoose.Model<ICodeSnippet>
  ) || mongoose.model<ICodeSnippet>('CodeSnippet', CodeSnippetSchema);
}

import { createWorker } from 'tesseract.js';
import { google } from 'googleapis';
import { ObjectId } from 'mongodb';
import { getDatabase } from './mongodb';

// Enhanced interfaces for online storage
export interface StoredResume {
  _id?: ObjectId;
  fileName: string;
  originalText: string;
  processedText: string;
  fileType: string;
  fileSize: number;
  uploadDate: Date;
  analysisId?: ObjectId;
  googleDriveId?: string;
  userId?: string;
}

export interface StoredAnalysis {
  _id?: ObjectId;
  resumeId: ObjectId;
  analysis: ResumeAnalysis;
  industry: string;
  jobTitle: string;
  experienceLevel: string;
  analysisDate: Date;
  userId?: string;
}

// Google Drive configuration
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const GOOGLE_DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || 'your-folder-id';

// MongoDB configuration

// Initialize Google Drive API
function getGoogleDriveAuth() {
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    scopes: SCOPES,
  });
  return auth;
}

// Enhanced text extraction with OCR
export async function extractTextWithOCR(file: File): Promise<string> {
  try {
    // First try standard text extraction
    const standardText = await extractTextFromFile(file);
    if (standardText.trim().length > 50) {
      return standardText;
    }

    // If standard extraction fails or returns minimal text, try OCR
    console.log('Standard extraction failed, attempting OCR...');
    return await performOCR(file);
  } catch (error) {
    console.log('Standard extraction failed, attempting OCR...');
    return await performOCR(file);
  }
}

// OCR processing using Tesseract.js
async function performOCR(file: File): Promise<string> {
  try {
    const worker = await createWorker('eng');
    
    // Convert file to base64 for OCR
    const arrayBuffer = await file.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    
    const { data: { text } } = await worker.recognize(
      `data:${file.type};base64,${base64}`
    );
    
    await worker.terminate();
    
    if (!text || text.trim().length === 0) {
      throw new Error('OCR could not extract any text from the document');
    }
    
    return text.trim();
  } catch (error) {
    throw new Error(`OCR processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Store file in Google Drive
export async function uploadToGoogleDrive(file: File, fileName: string): Promise<string> {
  try {
    const auth = getGoogleDriveAuth();
    const drive = google.drive({ version: 'v3', auth });
    
    const fileMetadata = {
      name: fileName,
      parents: [GOOGLE_DRIVE_FOLDER_ID],
    };
    
    const media = {
      mimeType: file.type,
      body: file.stream(),
    };
    
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id',
    });
    
    return response.data.id || '';
  } catch (error) {
    console.error('Google Drive upload failed:', error);
    throw new Error('Failed to upload file to Google Drive');
  }
}

// Store resume data in MongoDB
export async function storeResumeInDB(
  fileName: string,
  originalText: string,
  processedText: string,
  fileType: string,
  fileSize: number,
  googleDriveId?: string,
  userId?: string
): Promise<ObjectId> {
  try {
    const db = await getDatabase();
    const collection = db.collection('resumes');
    
    const resume: StoredResume = {
      fileName,
      originalText,
      processedText,
      fileType,
      fileSize,
      uploadDate: new Date(),
      googleDriveId,
      userId,
    };
    
    const result = await collection.insertOne(resume);
    return result.insertedId;
  } catch (error) {
    console.error('MongoDB storage failed:', error);
    throw new Error('Failed to store resume in database');
  }
}

// Store analysis results in MongoDB
export async function storeAnalysisInDB(
  resumeId: ObjectId,
  analysis: ResumeAnalysis,
  industry: string,
  jobTitle: string,
  experienceLevel: string,
  userId?: string
): Promise<ObjectId> {
  try {
    const db = await getDatabase();
    const collection = db.collection('analyses');
    
    const analysisDoc: StoredAnalysis = {
      resumeId,
      analysis,
      industry,
      jobTitle,
      experienceLevel,
      analysisDate: new Date(),
      userId,
    };
    
    const result = await collection.insertOne(analysisDoc);
    return result.insertedId;
  } catch (error) {
    console.error('MongoDB analysis storage failed:', error);
    throw new Error('Failed to store analysis in database');
  }
}

// Retrieve stored analysis
export async function getStoredAnalysis(analysisId: ObjectId): Promise<StoredAnalysis | null> {
  try {
    const db = await getDatabase();
    const collection = db.collection('analyses');
    
    return await collection.findOne({ _id: analysisId });
  } catch (error) {
    console.error('Failed to retrieve analysis:', error);
    return null;
  }
}

// Enhanced file processing with multiple fallbacks
export async function processResumeFile(
  file: File,
  userId?: string
): Promise<{
  text: string;
  resumeId: ObjectId;
  googleDriveId?: string;
}> {
  try {
    // Extract text with OCR fallback
    const extractedText = await extractTextWithOCR(file);
    
    // Upload to Google Drive (optional)
    let googleDriveId: string | undefined;
    try {
      googleDriveId = await uploadToGoogleDrive(file, file.name);
    } catch (error) {
      console.warn('Google Drive upload failed, continuing without cloud storage:', error);
    }
    
    // Store in MongoDB
    const resumeId = await storeResumeInDB(
      file.name,
      extractedText,
      extractedText,
      file.type,
      file.size,
      googleDriveId,
      userId
    );
    
    return {
      text: extractedText,
      resumeId,
      googleDriveId,
    };
  } catch (error) {
    throw new Error(`Failed to process resume file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Import existing interfaces and functions
export interface ResumeRequest {
  resumeText: string;
  industry: string;
  jobTitle: string;
  experienceLevel: string;
  fileName?: string;
}

export interface ResumeAnalysis {
  overallScore: number;
  scoreBreakdown: {
    content: number;
    structure: number;
    keywords: number;
    atsOptimization: number;
  };
  strengths: string[];
  weaknesses: string[];
  suggestions: Suggestion[];
  sectionAnalysis: SectionAnalysis[];
  keywordAnalysis: KeywordAnalysis;
  atsOptimization: ATSOptimization;
  actionPlan: ActionItem[];
  summary: string;
}

export interface Suggestion {
  category: 'content' | 'structure' | 'keywords' | 'format';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  impact: string;
}

export interface SectionAnalysis {
  section: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

export interface KeywordAnalysis {
  foundKeywords: string[];
  missingKeywords: string[];
  suggestedKeywords: string[];
  keywordDensity: Record<string, number>;
}

export interface ATSOptimization {
  score: number;
  issues: string[];
  recommendations: string[];
  formatCompliance: {
    isCompliant: boolean;
    issues: string[];
  };
}

export interface ActionItem {
  priority: 'high' | 'medium' | 'low';
  action: string;
  timeline: string;
  impact: string;
}

export interface ResumeResponse {
  success: boolean;
  analysis?: ResumeAnalysis;
  error?: string;
  analysisId?: ObjectId;
}

// Import existing utility functions
export { 
  industryKeywords, 
  experienceLevels, 
  analyzeResumeSections, 
  calculateBasicScore, 
  validateResumeText 
} from './resumeUtils';

// Enhanced text extraction with multiple methods
async function extractTextFromFile(file: File): Promise<string> {
  try {
    if (file.type === 'application/pdf') {
      return await extractPdfText(file);
    } else if (file.type.includes('word') || file.type.includes('document')) {
      return await extractDocxText(file);
    } else if (file.type === 'text/plain') {
      return await file.text();
    } else if (file.type.startsWith('image/')) {
      // For image files, use OCR directly
      return await performOCR(file);
    } else {
      throw new Error('Unsupported file type. Please upload PDF, DOCX, TXT, or image files.');
    }
  } catch (error) {
    throw new Error(`Failed to extract text from file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Enhanced PDF extraction with multiple fallbacks
async function extractPdfText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  
  // Method 1: Try PDF.js with minimal configuration
  try {
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = null;
    
    const loadingTask = pdfjsLib.getDocument({ 
      data: arrayBuffer,
      disableWorker: true,
      disableRange: true,
      disableStream: true,
      disableAutoFetch: true
    });
    
    const pdfDocument = await loadingTask.promise;
    let fullText = '';
    
    for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }
    
    const trimmedText = fullText.trim();
    if (trimmedText.length > 10) {
      return trimmedText;
    }
  } catch (error) {
    console.log('PDF.js extraction failed, trying OCR...');
  }
  
  // Method 2: If PDF.js fails or returns minimal text, use OCR
  return await performOCR(file);
}

// Enhanced DOCX extraction
async function extractDocxText(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const mammoth = await import('mammoth');
    
    const result = await mammoth.extractRawText({ arrayBuffer });
    const text = result.value.trim();
    
    if (text.length > 10) {
      return text;
    } else {
      throw new Error('DOCX extraction returned minimal text');
    }
  } catch (error) {
    console.log('DOCX extraction failed, trying OCR...');
    return await performOCR(file);
  }
} 
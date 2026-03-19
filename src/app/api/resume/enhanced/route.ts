import { NextRequest, NextResponse } from 'next/server';
import { 
  storeUploadedResumeFile, 
  storeAnalysisInDB, 
  getStoredAnalysis
} from '@/lib/enhancedResumeUtils';
import {
  ResumeResponse,
} from '@/schemas/resumeSchema';
import { buildResumeFileAnalysisPrompt } from '@/lib/resumePromptBuilder';
import { analyzeResumeFileWithOpenAI } from '@/lib/openaiResumeService';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const industry = formData.get('industry') as string;
    const jobTitle = formData.get('jobTitle') as string;
    const experienceLevel = formData.get('experienceLevel') as string;
    const analysisId = formData.get('analysisId') as string;

    // If analysisId is provided, retrieve stored analysis
    if (analysisId) {
      const { ObjectId } = await import('mongodb');
      const storedAnalysis = await getStoredAnalysis(new ObjectId(analysisId));
      
      if (storedAnalysis) {
        return NextResponse.json({
          success: true,
          analysis: storedAnalysis.analysis,
          analysisId: storedAnalysis._id,
        } as ResumeResponse);
      } else {
        return NextResponse.json({
          success: false,
          error: 'Analysis not found'
        } as ResumeResponse);
      }
    }

    // Validate required fields
    if (!file || !industry || !jobTitle || !experienceLevel) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: file, industry, jobTitle, experienceLevel'
      } as ResumeResponse);
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/bmp',
      'image/tiff'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        success: false,
        error: 'Unsupported file type. Please upload PDF, DOCX, TXT, or image files.'
      } as ResumeResponse);
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({
        success: false,
        error: 'File size too large. Please upload files smaller than 10MB.'
      } as ResumeResponse);
    }

    console.log('Processing resume file:', file.name, 'Type:', file.type, 'Size:', file.size);

    const prompt = buildResumeFileAnalysisPrompt({
      industry,
      jobTitle,
      experienceLevel,
      fileName: file.name,
    });

    console.log('Sending uploaded resume to OpenAI for analysis...');
    const analysis = await analyzeResumeFileWithOpenAI(file, prompt);
    console.log('OpenAI resume analysis generated successfully');

    const { resumeId, blobPathname, blobUrl } = await storeUploadedResumeFile(file);
    console.log('Resume stored in DB with ID:', resumeId);
    if (blobPathname) {
      console.log('File uploaded to Vercel Blob with pathname:', blobPathname);
    }
    if (blobUrl) {
      console.log('Private blob URL created:', blobUrl);
    }

    // Store analysis in MongoDB
    const analysisIdResult = await storeAnalysisInDB(
      resumeId,
      analysis,
      industry,
      jobTitle,
      experienceLevel
    );

    console.log('Analysis stored in DB with ID:', analysisIdResult);

    return NextResponse.json({
      success: true,
      analysis,
      analysisId: analysisIdResult,
    } as ResumeResponse);

  } catch (error) {
    console.error('Resume analysis error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json({
      success: false,
      error: `Resume analysis failed: ${errorMessage}`
    } as ResumeResponse, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const analysisId = searchParams.get('analysisId');

    if (!analysisId) {
      return NextResponse.json({
        success: false,
        error: 'Analysis ID is required'
      } as ResumeResponse);
    }

    const { ObjectId } = await import('mongodb');
    const storedAnalysis = await getStoredAnalysis(new ObjectId(analysisId));

    if (!storedAnalysis) {
      return NextResponse.json({
        success: false,
        error: 'Analysis not found'
      } as ResumeResponse);
    }

    return NextResponse.json({
      success: true,
      analysis: storedAnalysis.analysis,
      analysisId: storedAnalysis._id,
    } as ResumeResponse);

  } catch (error) {
    console.error('Error retrieving analysis:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve analysis'
    } as ResumeResponse);
  }
} 

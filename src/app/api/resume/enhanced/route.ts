import { NextRequest, NextResponse } from 'next/server';
import { 
  processResumeFile, 
  storeAnalysisInDB, 
  getStoredAnalysis
} from '@/lib/enhancedResumeUtils';
import {
  ResumeRequest,
  ResumeResponse,
  ResumeAnalysis
} from '@/schemas/resumeSchema';
import { buildResumeAnalysisPrompt } from '@/lib/resumePromptBuilder';
import { generateGeminiResponse } from '@/lib/gemini';

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

    // Process the file with OCR and storage
    const { text, resumeId, googleDriveId } = await processResumeFile(file);

    console.log('Text extracted successfully. Length:', text.length);
    console.log('Resume stored in DB with ID:', resumeId);
    if (googleDriveId) {
      console.log('File uploaded to Google Drive with ID:', googleDriveId);
    }

    // Validate extracted text
    if (!text || text.trim().length < 50) {
      return NextResponse.json({
        success: false,
        error: 'Could not extract sufficient text from the document. Please ensure the document contains readable text or try uploading a different format.'
      } as ResumeResponse);
    }

    // Build the analysis prompt
    const prompt = buildResumeAnalysisPrompt({
      resumeText: text,
      industry,
      jobTitle,
      experienceLevel,
      fileName: file.name
    });

    console.log('Sending analysis request to Gemini...');

    // Generate AI analysis
    const aiResponse = await generateGeminiResponse(prompt);

    if (!aiResponse.success || !aiResponse.text) {
      return NextResponse.json({
        success: false,
        error: 'Failed to generate AI analysis. Please try again.'
      } as ResumeResponse);
    }

    console.log('AI analysis generated successfully');

    // Parse the AI response
    let analysis: ResumeAnalysis;
    try {
      analysis = JSON.parse(aiResponse.text);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return NextResponse.json({
        success: false,
        error: 'Failed to parse AI analysis response. Please try again.'
      } as ResumeResponse);
    }

    // Validate analysis structure
    if (!analysis.overallScore || !analysis.strengths || !analysis.weaknesses) {
      return NextResponse.json({
        success: false,
        error: 'Invalid analysis structure received from AI. Please try again.'
      } as ResumeResponse);
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
    } as ResumeResponse);
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
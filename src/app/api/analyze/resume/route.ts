import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface ResumeRequest {
  resumeText: string;
  targetJobTitle?: string;
}

interface ResumeAnalysis {
  overallScore: number;
  sections: {
    contact: { score: number; feedback: string[] };
    summary: { score: number; feedback: string[] };
    experience: { score: number; feedback: string[] };
    education: { score: number; feedback: string[] };
    skills: { score: number; feedback: string[] };
  };
  suggestions: string[];
  atsOptimization: {
    score: number;
    issues: string[];
    improvements: string[];
  };
  industryFit: {
    score: number;
    analysis: string;
    recommendations: string[];
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: ResumeRequest = await request.json();
    const { resumeText, targetJobTitle } = body;

    if (!resumeText) {
      return NextResponse.json(
        { error: 'Resume text is required' },
        { status: 400 }
      );
    }

    // Generate AI analysis if available
    if (process.env.GOOGLE_AI_API_KEY) {
      try {
        const analysis = await generateAIAnalysis(resumeText, targetJobTitle);
        return NextResponse.json(analysis);
      } catch (aiError) {
        console.log('AI analysis failed, using fallback:', aiError);
        // Fall back to basic analysis
      }
    }

    // Fallback: Generate basic analysis
    const analysis = generateFallbackAnalysis(resumeText, targetJobTitle);
    
    return NextResponse.json(analysis);

  } catch (error) {
    console.error('Resume analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze resume' },
      { status: 500 }
    );
  }
}

async function generateAIAnalysis(
  resumeText: string, 
  targetJobTitle?: string
): Promise<ResumeAnalysis> {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `Analyze this resume and provide comprehensive feedback.

Resume Text:
${resumeText}

${targetJobTitle ? `Target Job Title: ${targetJobTitle}` : ''}

Provide analysis in this JSON format:
{
  "overallScore": 85,
  "sections": {
    "contact": { "score": 90, "feedback": ["feedback1", "feedback2"] },
    "summary": { "score": 80, "feedback": ["feedback1", "feedback2"] },
    "experience": { "score": 85, "feedback": ["feedback1", "feedback2"] },
    "education": { "score": 90, "feedback": ["feedback1", "feedback2"] },
    "skills": { "score": 75, "feedback": ["feedback1", "feedback2"] }
  },
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "atsOptimization": {
    "score": 80,
    "issues": ["issue1", "issue2"],
    "improvements": ["improvement1", "improvement2"]
  },
  "industryFit": {
    "score": 85,
    "analysis": "Brief analysis of industry fit",
    "recommendations": ["rec1", "rec2"]
  }
}

Focus on:
- Overall structure and formatting
- Content quality and relevance
- ATS optimization
- Industry-specific requirements
- Action verbs and quantifiable achievements
- Professional presentation`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  try {
    const parsed = JSON.parse(text);
    return parsed;
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    throw error;
  }
}

function generateFallbackAnalysis(resumeText: string, targetJobTitle?: string): ResumeAnalysis {
  const text = resumeText.toLowerCase();
  const words = text.split(/\s+/);
  const lines = resumeText.split('\n');
  
  // Basic scoring logic
  let contactScore = 90;
  let summaryScore = 80;
  let experienceScore = 85;
  let educationScore = 90;
  let skillsScore = 75;
  let atsScore = 80;
  let industryScore = 85;

  // Contact analysis
  const contactFeedback: string[] = [];
  if (!text.includes('@') || !text.includes('.com')) {
    contactScore -= 20;
    contactFeedback.push('Missing or unclear email address');
  }
  if (!text.includes('phone') && !text.includes('mobile') && !text.includes('cell')) {
    contactScore -= 15;
    contactFeedback.push('Phone number not clearly indicated');
  }
  if (contactScore >= 85) {
    contactFeedback.push('Contact information is complete and professional');
  }

  // Summary analysis
  const summaryFeedback: string[] = [];
  if (text.includes('summary') || text.includes('objective') || text.includes('profile')) {
    summaryScore += 10;
    summaryFeedback.push('Professional summary section found');
  } else {
    summaryScore -= 20;
    summaryFeedback.push('Missing professional summary section');
  }
  if (text.includes('experience') && text.includes('skills')) {
    summaryFeedback.push('Summary mentions relevant experience and skills');
  }

  // Experience analysis
  const experienceFeedback: string[] = [];
  const actionVerbs = ['developed', 'managed', 'implemented', 'created', 'designed', 'led', 'coordinated', 'analyzed'];
  const hasActionVerbs = actionVerbs.some(verb => text.includes(verb));
  if (hasActionVerbs) {
    experienceScore += 10;
    experienceFeedback.push('Good use of action verbs in experience descriptions');
  } else {
    experienceScore -= 15;
    experienceFeedback.push('Consider using more action verbs to start bullet points');
  }

  // Check for quantifiable achievements
  const hasNumbers = /\d+/.test(text);
  if (hasNumbers) {
    experienceScore += 10;
    experienceFeedback.push('Resume includes quantifiable achievements');
  } else {
    experienceScore -= 10;
    experienceFeedback.push('Add specific numbers and percentages to quantify achievements');
  }

  // Education analysis
  const educationFeedback: string[] = [];
  if (text.includes('degree') || text.includes('bachelor') || text.includes('master') || text.includes('phd')) {
    educationFeedback.push('Education section is present');
  } else {
    educationScore -= 20;
    educationFeedback.push('Education section may be missing or unclear');
  }

  // Skills analysis
  const skillsFeedback: string[] = [];
  if (text.includes('skills') || text.includes('technical') || text.includes('proficient')) {
    skillsFeedback.push('Skills section identified');
  } else {
    skillsScore -= 20;
    skillsFeedback.push('Skills section may be missing');
  }

  // ATS optimization
  const atsIssues: string[] = [];
  const atsImprovements: string[] = [];
  
  if (text.includes('table') || text.includes('column')) {
    atsScore -= 20;
    atsIssues.push('Tables or complex formatting may cause ATS parsing issues');
    atsImprovements.push('Use simple, clean formatting without tables');
  }
  
  if (text.includes('font') || text.includes('color')) {
    atsScore -= 10;
    atsIssues.push('Custom fonts or colors may not display properly in ATS');
    atsImprovements.push('Use standard fonts and black text');
  }
  
  if (lines.length > 50) {
    atsScore -= 10;
    atsIssues.push('Resume may be too long for some ATS systems');
    atsImprovements.push('Keep resume to 1-2 pages');
  }

  // Industry fit analysis
  const industryAnalysis = targetJobTitle 
    ? `Resume appears to be ${industryScore >= 80 ? 'well-suited' : 'moderately suited'} for ${targetJobTitle} position`
    : 'Industry fit analysis requires target job title';
  
  const industryRecommendations: string[] = [];
  if (targetJobTitle) {
    if (text.includes(targetJobTitle.toLowerCase())) {
      industryRecommendations.push(`Good alignment with ${targetJobTitle} role`);
    } else {
      industryRecommendations.push(`Consider adding keywords related to ${targetJobTitle}`);
    }
  }

  // Overall suggestions
  const suggestions: string[] = [];
  if (experienceScore < 80) {
    suggestions.push('Strengthen work experience section with more specific achievements');
  }
  if (skillsScore < 80) {
    suggestions.push('Add a dedicated skills section with relevant technical and soft skills');
  }
  if (atsScore < 80) {
    suggestions.push('Optimize resume for ATS systems with simpler formatting');
  }
  if (!hasNumbers) {
    suggestions.push('Add quantifiable metrics to demonstrate impact');
  }

  // Calculate overall score
  const overallScore = Math.round((contactScore + summaryScore + experienceScore + educationScore + skillsScore) / 5);

  return {
    overallScore,
    sections: {
      contact: { score: contactScore, feedback: contactFeedback },
      summary: { score: summaryScore, feedback: summaryFeedback },
      experience: { score: experienceScore, feedback: experienceFeedback },
      education: { score: educationScore, feedback: educationFeedback },
      skills: { score: skillsScore, feedback: skillsFeedback }
    },
    suggestions,
    atsOptimization: {
      score: atsScore,
      issues: atsIssues,
      improvements: atsImprovements
    },
    industryFit: {
      score: industryScore,
      analysis: industryAnalysis,
      recommendations: industryRecommendations
    }
  };
} 
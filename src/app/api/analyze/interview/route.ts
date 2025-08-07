import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface InterviewRequest {
  jobTitle: string;
  company?: string;
  experienceLevel: string;
  type: 'job-specific' | 'general';
}

interface InterviewQuestion {
  id: string;
  question: string;
  category: 'technical' | 'behavioral' | 'situational' | 'general';
  difficulty: 'easy' | 'medium' | 'hard';
  tips?: string[];
}

interface InterviewResponse {
  questions: InterviewQuestion[];
  totalQuestions: number;
  estimatedDuration: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: InterviewRequest = await request.json();
    const { jobTitle, company, experienceLevel, type } = body;

    if (!jobTitle) {
      return NextResponse.json(
        { error: 'Job title is required' },
        { status: 400 }
      );
    }

    // Generate questions using AI if available
    if (process.env.GOOGLE_AI_API_KEY) {
      try {
        const questions = await generateAIQuestions(jobTitle, company, experienceLevel, type);
        return NextResponse.json({
          questions,
          totalQuestions: questions.length,
          estimatedDuration: questions.length * 3 // 3 minutes per question
        });
      } catch (aiError) {
        console.log('AI generation failed, using fallback questions:', aiError);
        // Fall back to default questions
      }
    }

    // Fallback: Generate questions based on job title and experience level
    const questions = generateFallbackQuestions(jobTitle, experienceLevel);
    
    return NextResponse.json({
      questions,
      totalQuestions: questions.length,
      estimatedDuration: questions.length * 3
    });

  } catch (error) {
    console.error('Interview generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate interview questions' },
      { status: 500 }
    );
  }
}

async function generateAIQuestions(
  jobTitle: string, 
  company?: string, 
  experienceLevel: string, 
  type: string
): Promise<InterviewQuestion[]> {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `Generate 5-7 interview questions for a ${experienceLevel} level ${jobTitle} position${company ? ` at ${company}` : ''}. 

Requirements:
- Mix of technical, behavioral, and situational questions
- Vary difficulty levels based on experience level
- Include specific tips for each question
- Make questions relevant to the job title
- Return as JSON array with structure:
{
  "questions": [
    {
      "id": "1",
      "question": "Question text",
      "category": "technical|behavioral|situational|general",
      "difficulty": "easy|medium|hard",
      "tips": ["tip1", "tip2"]
    }
  ]
}

Job Title: ${jobTitle}
Experience Level: ${experienceLevel}
Company: ${company || 'Not specified'}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  try {
    const parsed = JSON.parse(text);
    return parsed.questions || [];
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    throw error;
  }
}

function generateFallbackQuestions(jobTitle: string, experienceLevel: string): InterviewQuestion[] {
  const baseQuestions: InterviewQuestion[] = [
    {
      id: '1',
      question: 'Tell me about yourself and your background.',
      category: 'general',
      difficulty: 'easy',
      tips: ['Keep it concise (1-2 minutes)', 'Focus on relevant experience', 'End with why you\'re interested in this role']
    },
    {
      id: '2',
      question: 'Why are you interested in this position?',
      category: 'behavioral',
      difficulty: 'medium',
      tips: ['Research the company beforehand', 'Connect your skills to the role', 'Show genuine interest']
    },
    {
      id: '3',
      question: 'What are your greatest strengths and weaknesses?',
      category: 'behavioral',
      difficulty: 'medium',
      tips: ['Be honest about weaknesses', 'Show how you\'re working on them', 'Focus on strengths relevant to the job']
    },
    {
      id: '4',
      question: 'Describe a challenging situation you faced at work and how you handled it.',
      category: 'situational',
      difficulty: 'hard',
      tips: ['Use STAR method (Situation, Task, Action, Result)', 'Focus on problem-solving skills', 'Show positive outcomes']
    },
    {
      id: '5',
      question: 'Where do you see yourself in 5 years?',
      category: 'general',
      difficulty: 'medium',
      tips: ['Show ambition but be realistic', 'Connect to the company\'s growth', 'Demonstrate long-term thinking']
    }
  ];

  // Add job-specific questions
  const jobSpecificQuestions: InterviewQuestion[] = [];
  
  if (jobTitle.toLowerCase().includes('software') || jobTitle.toLowerCase().includes('developer')) {
    jobSpecificQuestions.push(
      {
        id: '6',
        question: 'Explain a technical project you worked on recently.',
        category: 'technical',
        difficulty: 'hard',
        tips: ['Explain the problem clearly', 'Describe your technical approach', 'Highlight the impact and results']
      },
      {
        id: '7',
        question: 'How do you stay updated with the latest technologies?',
        category: 'technical',
        difficulty: 'medium',
        tips: ['Mention specific resources', 'Show continuous learning mindset', 'Give examples of recent learning']
      }
    );
  } else if (jobTitle.toLowerCase().includes('product') || jobTitle.toLowerCase().includes('manager')) {
    jobSpecificQuestions.push(
      {
        id: '6',
        question: 'How do you prioritize competing demands and deadlines?',
        category: 'situational',
        difficulty: 'hard',
        tips: ['Show systematic approach', 'Mention stakeholder communication', 'Demonstrate decision-making process']
      },
      {
        id: '7',
        question: 'Describe a time when you had to lead a team through a difficult change.',
        category: 'behavioral',
        difficulty: 'hard',
        tips: ['Focus on leadership skills', 'Show empathy and communication', 'Highlight positive outcomes']
      }
    );
  } else if (jobTitle.toLowerCase().includes('marketing') || jobTitle.toLowerCase().includes('sales')) {
    jobSpecificQuestions.push(
      {
        id: '6',
        question: 'How do you measure the success of a marketing campaign?',
        category: 'technical',
        difficulty: 'medium',
        tips: ['Mention specific metrics', 'Show analytical thinking', 'Connect to business goals']
      },
      {
        id: '7',
        question: 'Tell me about a time when you had to handle a difficult customer.',
        category: 'situational',
        difficulty: 'medium',
        tips: ['Show problem-solving skills', 'Demonstrate empathy', 'Focus on resolution']
      }
    );
  }

  return [...baseQuestions, ...jobSpecificQuestions];
} 
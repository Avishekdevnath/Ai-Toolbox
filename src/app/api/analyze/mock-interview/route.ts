import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface MockInterviewRequest {
  interviewType: string;
  industry?: string;
  duration: number;
}

interface InterviewQuestion {
  id: string;
  question: string;
  category: 'behavioral' | 'technical' | 'case-study' | 'general';
  difficulty: 'easy' | 'medium' | 'hard';
  followUpQuestions?: string[];
}

interface MockInterviewResponse {
  questions: InterviewQuestion[];
  totalQuestions: number;
  estimatedDuration: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: MockInterviewRequest = await request.json();
    const { interviewType, industry, duration } = body;

    if (!interviewType) {
      return NextResponse.json(
        { error: 'Interview type is required' },
        { status: 400 }
      );
    }

    // Generate questions using AI if available
    if (process.env.GOOGLE_AI_API_KEY) {
      try {
        const questions = await generateAIQuestions(interviewType, industry, duration);
        return NextResponse.json({
          questions,
          totalQuestions: questions.length,
          estimatedDuration: duration
        });
      } catch (aiError) {
        console.log('AI generation failed, using fallback questions:', aiError);
        // Fall back to default questions
      }
    }

    // Fallback: Generate questions based on interview type
    const questions = generateFallbackQuestions(interviewType, industry, duration);
    
    return NextResponse.json({
      questions,
      totalQuestions: questions.length,
      estimatedDuration: duration
    });

  } catch (error) {
    console.error('Mock interview generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate mock interview' },
      { status: 500 }
    );
  }
}

async function generateAIQuestions(
  interviewType: string, 
  industry?: string, 
  duration: number
): Promise<InterviewQuestion[]> {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const numQuestions = Math.max(5, Math.min(10, Math.floor(duration / 5))); // 1 question per 5 minutes

  const prompt = `Generate ${numQuestions} interview questions for a ${interviewType} interview${industry ? ` in the ${industry} industry` : ''}.

Requirements:
- Mix of question types based on interview type
- Vary difficulty levels
- Include follow-up questions for each main question
- Make questions relevant to the interview type and industry
- Return as JSON array with structure:
{
  "questions": [
    {
      "id": "1",
      "question": "Main question text",
      "category": "behavioral|technical|case-study|general",
      "difficulty": "easy|medium|hard",
      "followUpQuestions": ["follow-up 1", "follow-up 2"]
    }
  ]
}

Interview Type: ${interviewType}
Industry: ${industry || 'General'}
Duration: ${duration} minutes
Number of Questions: ${numQuestions}`;

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

function generateFallbackQuestions(interviewType: string, industry?: string, duration: number): InterviewQuestion[] {
  const baseQuestions: InterviewQuestion[] = [
    {
      id: '1',
      question: 'Tell me about yourself and your professional background.',
      category: 'general',
      difficulty: 'easy',
      followUpQuestions: ['What motivates you in your career?', 'What are your career goals?']
    },
    {
      id: '2',
      question: 'Describe a time when you had to work with a difficult team member.',
      category: 'behavioral',
      difficulty: 'medium',
      followUpQuestions: ['How did you resolve the conflict?', 'What did you learn from this experience?']
    },
    {
      id: '3',
      question: 'What is your greatest professional achievement?',
      category: 'behavioral',
      difficulty: 'medium',
      followUpQuestions: ['What challenges did you face?', 'How did you measure success?']
    },
    {
      id: '4',
      question: 'How do you handle stress and pressure in the workplace?',
      category: 'behavioral',
      difficulty: 'medium',
      followUpQuestions: ['Can you give a specific example?', 'What strategies do you use?']
    },
    {
      id: '5',
      question: 'Where do you see yourself in 5 years?',
      category: 'general',
      difficulty: 'easy',
      followUpQuestions: ['How does this role fit into your plan?', 'What skills do you want to develop?']
    }
  ];

  // Add type-specific questions
  if (interviewType === 'technical') {
    baseQuestions.push(
      {
        id: '6',
        question: 'Explain a complex technical problem you solved recently.',
        category: 'technical',
        difficulty: 'hard',
        followUpQuestions: ['What was your approach?', 'How did you validate the solution?']
      },
      {
        id: '7',
        question: 'How do you stay updated with the latest technologies?',
        category: 'technical',
        difficulty: 'medium',
        followUpQuestions: ['What resources do you use?', 'How do you apply new knowledge?']
      }
    );
  } else if (interviewType === 'case-study') {
    baseQuestions.push(
      {
        id: '6',
        question: 'How would you approach solving a business problem with limited resources?',
        category: 'case-study',
        difficulty: 'hard',
        followUpQuestions: ['What factors would you consider?', 'How would you prioritize?']
      },
      {
        id: '7',
        question: 'Describe a time when you had to make a difficult business decision.',
        category: 'case-study',
        difficulty: 'hard',
        followUpQuestions: ['What was your decision-making process?', 'What was the outcome?']
      }
    );
  } else if (interviewType === 'behavioral') {
    baseQuestions.push(
      {
        id: '6',
        question: 'Tell me about a time when you failed at something.',
        category: 'behavioral',
        difficulty: 'hard',
        followUpQuestions: ['What did you learn from this experience?', 'How did you grow from it?']
      },
      {
        id: '7',
        question: 'Describe a situation where you had to lead a team.',
        category: 'behavioral',
        difficulty: 'medium',
        followUpQuestions: ['What was your leadership style?', 'How did you motivate the team?']
      }
    );
  }

  // Add industry-specific questions
  if (industry) {
    const industryLower = industry.toLowerCase();
    if (industryLower.includes('tech') || industryLower.includes('software')) {
      baseQuestions.push({
        id: '8',
        question: 'How do you approach learning new programming languages or frameworks?',
        category: 'technical',
        difficulty: 'medium',
        followUpQuestions: ['What was the most challenging technology you learned?', 'How do you stay current?']
      });
    } else if (industryLower.includes('finance') || industryLower.includes('banking')) {
      baseQuestions.push({
        id: '8',
        question: 'How do you handle working with sensitive financial data?',
        category: 'behavioral',
        difficulty: 'medium',
        followUpQuestions: ['What security measures do you follow?', 'How do you ensure accuracy?']
      });
    } else if (industryLower.includes('healthcare') || industryLower.includes('medical')) {
      baseQuestions.push({
        id: '8',
        question: 'How do you handle working in a high-stakes environment where mistakes can have serious consequences?',
        category: 'behavioral',
        difficulty: 'hard',
        followUpQuestions: ['What procedures do you follow?', 'How do you manage stress?']
      });
    }
  }

  // Adjust number of questions based on duration
  const targetQuestions = Math.max(5, Math.min(10, Math.floor(duration / 5)));
  return baseQuestions.slice(0, targetQuestions);
} 
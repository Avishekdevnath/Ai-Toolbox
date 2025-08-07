import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface FeedbackRequest {
  question: string;
  answer: string;
  category: string;
  difficulty: string;
}

interface FeedbackResponse {
  feedback: string;
  score: number;
  suggestions: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body: FeedbackRequest = await request.json();
    const { question, answer, category, difficulty } = body;

    if (!question || !answer) {
      return NextResponse.json(
        { error: 'Question and answer are required' },
        { status: 400 }
      );
    }

    // Generate AI feedback if available
    if (process.env.GOOGLE_AI_API_KEY) {
      try {
        const feedback = await generateAIFeedback(question, answer, category, difficulty);
        return NextResponse.json(feedback);
      } catch (aiError) {
        console.log('AI feedback generation failed, using fallback:', aiError);
        // Fall back to default feedback
      }
    }

    // Fallback: Generate basic feedback
    const feedback = generateFallbackFeedback(answer, category, difficulty);
    
    return NextResponse.json(feedback);

  } catch (error) {
    console.error('Feedback generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate feedback' },
      { status: 500 }
    );
  }
}

async function generateAIFeedback(
  question: string, 
  answer: string, 
  category: string, 
  difficulty: string
): Promise<FeedbackResponse> {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `Analyze this interview answer and provide constructive feedback.

Question: "${question}"
Answer: "${answer}"
Category: ${category}
Difficulty: ${difficulty}

Provide feedback in this JSON format:
{
  "feedback": "Constructive feedback about the answer (2-3 sentences)",
  "score": 85,
  "suggestions": ["specific suggestion 1", "specific suggestion 2"]
}

Focus on:
- Answer completeness and relevance
- Specific examples and details
- Communication clarity
- Areas for improvement
- Positive aspects to maintain

Be encouraging but honest. Score should be 0-100.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  try {
    const parsed = JSON.parse(text);
    return {
      feedback: parsed.feedback || 'Good answer! Consider adding more specific examples.',
      score: parsed.score || 75,
      suggestions: parsed.suggestions || ['Add more specific examples', 'Be more concise']
    };
  } catch (error) {
    console.error('Failed to parse AI feedback response:', error);
    throw error;
  }
}

function generateFallbackFeedback(answer: string, category: string, difficulty: string): FeedbackResponse {
  const answerLength = answer.length;
  const hasExamples = answer.toLowerCase().includes('example') || answer.toLowerCase().includes('when') || answer.toLowerCase().includes('time');
  const hasSpecifics = answer.length > 100;
  
  let feedback = '';
  let score = 70;
  const suggestions: string[] = [];

  if (answerLength < 50) {
    feedback = 'Your answer is quite brief. Consider expanding with more details and specific examples.';
    score = 60;
    suggestions.push('Add more details about your experience');
    suggestions.push('Include specific examples');
  } else if (answerLength < 150) {
    feedback = 'Good start! Your answer could benefit from more specific examples and details.';
    score = 75;
    suggestions.push('Add specific examples from your experience');
    suggestions.push('Include measurable results if possible');
  } else if (answerLength < 300) {
    feedback = 'Well-structured answer! You provided good detail and examples.';
    score = 85;
    suggestions.push('Consider adding quantifiable results');
    suggestions.push('Show how this relates to the target role');
  } else {
    feedback = 'Excellent detailed answer! You provided comprehensive information with good examples.';
    score = 90;
    suggestions.push('Great job on being thorough');
    suggestions.push('Consider being slightly more concise');
  }

  if (!hasExamples) {
    suggestions.push('Include specific examples from your experience');
  }

  if (category === 'behavioral' && !hasSpecifics) {
    suggestions.push('Use the STAR method (Situation, Task, Action, Result)');
  }

  if (category === 'technical' && !answer.toLowerCase().includes('how')) {
    suggestions.push('Explain your technical approach and methodology');
  }

  return {
    feedback,
    score,
    suggestions: suggestions.slice(0, 3) // Limit to 3 suggestions
  };
} 
import { NextRequest, NextResponse } from 'next/server';
import { model } from '@/lib/gemini';
import { sessionManager } from '@/lib/interviewUtils';
import { validateInterviewSetup } from '@/lib/interviewUtils';
import { 
  InterviewQuestion, 
  AnswerEvaluation,
  buildQuestionPrompt,
  buildEvaluationPrompt,
  parseEvaluationResponse,
  calculateOverallScore,
  generateInterviewSummary,
  getFallbackQuestion
} from '@/lib/interviewAI';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'start':
        return await handleStartInterview(data);
      case 'next-question':
        return await handleNextQuestion(data);
      case 'submit-answer':
        return await handleSubmitAnswer(data);
      case 'get-results':
        return await handleGetResults(data);
      case 'pause':
        return await handlePauseSession(data);
      case 'resume':
        return await handleResumeSession(data);
      case 'parse-job-posting':
        return await handleParseJobPosting(data);
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Interview API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Parse job posting
async function handleParseJobPosting(data: { jobPosting: string }) {
  try {
    const { jobPosting } = data;
    
    if (!jobPosting) {
      return NextResponse.json(
        { success: false, error: 'Job posting text is required' },
        { status: 400 }
      );
    }

    if (!model) {
      // Return basic parsing if AI is not available
      return NextResponse.json({
        success: true,
        jobData: {
          title: 'Software Engineer',
          requirements: ['Programming skills', 'Problem solving'],
          skills: ['JavaScript', 'React', 'Node.js'],
          responsibilities: ['Develop web applications', 'Collaborate with team'],
          experienceLevel: 'mid',
          industry: 'Technology'
        }
      });
    }

    const prompt = `Parse the following job posting and extract key information:

Job Posting:
${jobPosting}

Extract and return the following information in JSON format:
{
  "title": "Job title",
  "requirements": ["requirement1", "requirement2", "requirement3"],
  "skills": ["skill1", "skill2", "skill3"],
  "responsibilities": ["responsibility1", "responsibility2", "responsibility3"],
  "experienceLevel": "entry|mid|senior",
  "salaryRange": "salary range if mentioned",
  "industry": "industry name"
}

Focus on extracting:
- Job title from the posting
- Required qualifications and experience
- Technical skills and technologies
- Job responsibilities and duties
- Experience level (entry, mid, senior)
- Industry sector
- Salary information if available

Return only the JSON, no additional text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error('No response from AI');
    }

    // Clean and parse the JSON response
    const cleanResponse = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsedJob = JSON.parse(cleanResponse);
    
    return NextResponse.json({
      success: true,
      jobData: parsedJob
    });
  } catch (error) {
    console.error('Error parsing job posting:', error);
    
    // Return fallback data if parsing fails
    return NextResponse.json({
      success: true,
      jobData: {
        title: 'Software Engineer',
        requirements: ['Programming skills', 'Problem solving', 'Team collaboration'],
        skills: ['JavaScript', 'React', 'Node.js', 'Git'],
        responsibilities: ['Develop web applications', 'Collaborate with team', 'Code review'],
        experienceLevel: 'mid',
        industry: 'Technology'
      }
    });
  }
}

// Helper to generate a personalized question
function getPersonalizedQuestion(session) {
  return {
    id: `personalized_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    questionCode: `PERS_${session.position.replace(/\s+/g, '-').toUpperCase()}_${session.industry.replace(/\s+/g, '-').toUpperCase()}`,
    category: 'personalized',
    difficulty: session.difficulty,
    question: `Hi ${session.candidateName || 'candidate'}, can you tell me about yourself and why you're interested in the ${session.position} role in the ${session.industry} industry?`,
    expectedKeywords: ['background', 'motivation', 'interest', 'experience'],
    sampleAnswers: [
      `I'm passionate about ${session.industry} and have experience in ${session.position}. I'm interested in this role because...`
    ],
    timeLimit: 180,
    maxScore: 10,
    roleSpecific: false
  };
}

// Helper to generate a salary negotiation question
function getSalaryNegotiationQuestion(session) {
  return {
    id: `salary_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    questionCode: `SALARY_${session.position.replace(/\s+/g, '-').toUpperCase()}_${session.industry.replace(/\s+/g, '-').toUpperCase()}`,
    category: 'salary',
    difficulty: session.difficulty,
    question: `What are your salary expectations for this ${session.position} position in the ${session.industry} industry?`,
    expectedKeywords: ['salary', 'expectations', 'compensation', 'negotiation'],
    sampleAnswers: [
      'Based on my experience and market research, I expect a salary in the range of ...',
      'I am open to discussing compensation based on the responsibilities and company standards.'
    ],
    timeLimit: 180,
    maxScore: 10,
    roleSpecific: false
  };
}

// Start a new interview session
async function handleStartInterview(data: {
  type: 'technical' | 'behavioral' | 'mixed' | 'role-based' | 'job-specific';
  industry: string;
  position: string;
  difficulty: 'easy' | 'medium' | 'hard';
  totalQuestions: number;
  experienceLevel?: 'entry' | 'mid' | 'senior';
  jobRequirements?: string[];
  roleCompetencies?: string[];
  candidateName?: string;
}) {
  try {
    // Validate input
    const validation = validateInterviewSetup(data);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.errors.join(', ') },
        { status: 400 }
      );
    }

    // Create new session
    const session = await sessionManager.createSession(
      data.type,
      data.industry,
      data.position,
      data.difficulty,
      data.totalQuestions,
      data.experienceLevel,
      data.jobRequirements,
      data.roleCompetencies
    );
    session.candidateName = data.candidateName || '';

    // Inject personalized question as first
    const personalizedQ = getPersonalizedQuestion(session);
    session.questions.push(personalizedQ);
    session.maxPossibleScore += personalizedQ.maxScore;

    // If only 1 question, salary negotiation is last
    if (session.totalQuestions === 1) {
      const salaryQ = getSalaryNegotiationQuestion(session);
      session.questions.push(salaryQ);
      session.maxPossibleScore += salaryQ.maxScore;
    }

    // Get first question (personalized)
    return NextResponse.json({
      success: true,
      session,
      currentQuestion: personalizedQ
    });
  } catch (error) {
    console.error('Error starting interview:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to start interview' },
      { status: 500 }
    );
  }
}

// Get next question for the session
async function handleNextQuestion(data: { sessionId: string }) {
  try {
    const { sessionId } = data;
    
    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const session = sessionManager.getSession(sessionId);
    if (!session || session.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'Session not found or not active' },
        { status: 404 }
      );
    }

    if (session.currentQuestionIndex >= session.totalQuestions) {
      return NextResponse.json(
        { success: false, error: 'Interview completed' },
        { status: 400 }
      );
    }

    // Personalized is always first, salary negotiation is always last
    let question;
    if (session.currentQuestionIndex === 0) {
      question = session.questions[0];
    } else if (session.currentQuestionIndex === session.totalQuestions - 1) {
      // Salary negotiation last
      question = getSalaryNegotiationQuestion(session);
      session.questions.push(question);
      session.maxPossibleScore += question.maxScore;
    } else {
      // Technical or as per type
      question = await generateAdaptiveQuestion(session);
      if (!question) {
        return NextResponse.json(
          { success: false, error: 'Failed to generate question' },
          { status: 500 }
        );
      }
      session.questions.push(question);
      session.maxPossibleScore += question.maxScore;
    }
    
    return NextResponse.json({
      success: true,
      question
    });
  } catch (error) {
    console.error('Error getting next question:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get next question' },
      { status: 500 }
    );
  }
}

// Submit answer for current question
async function handleSubmitAnswer(data: {
  sessionId: string;
  answer: string;
  timeSpent: number;
}) {
  try {
    const { sessionId, answer, timeSpent } = data;
    
    if (!sessionId || !answer) {
      return NextResponse.json(
        { success: false, error: 'Session ID and answer are required' },
        { status: 400 }
      );
    }

    const session = sessionManager.getSession(sessionId);
    if (!session || session.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'Session not found or not active' },
        { status: 404 }
      );
    }

    const currentQuestion = session.questions[session.currentQuestionIndex];
    if (!currentQuestion) {
      return NextResponse.json(
        { success: false, error: 'No current question found' },
        { status: 400 }
      );
    }

    // Evaluate the answer using AI
    const evaluation = await evaluateAnswerWithDetailedFeedback(
      currentQuestion, 
      answer, 
      timeSpent,
      session
    );

    // Store the answer
    const interviewAnswer = {
      questionId: currentQuestion.id,
      questionCode: currentQuestion.questionCode,
      answer,
      timeSpent,
      timestamp: new Date()
    };

    session.answers.push(interviewAnswer);
    session.totalScore += evaluation.score;
    session.currentQuestionIndex++;

    // Check if interview is complete
    if (session.currentQuestionIndex >= session.totalQuestions) {
      session.status = 'completed';
      session.endTime = new Date();
    }
    
    return NextResponse.json({
      success: true,
      evaluation,
      session,
      isComplete: session.status === 'completed'
    });
  } catch (error) {
    console.error('Error submitting answer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit answer' },
      { status: 500 }
    );
  }
}

// Get interview results
async function handleGetResults(data: { sessionId: string }) {
  try {
    const { sessionId } = data;
    
    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const session = sessionManager.getSession(sessionId);
    if (!session || session.status !== 'completed') {
      return NextResponse.json(
        { success: false, error: 'Interview results not found or interview not completed' },
        { status: 404 }
      );
    }

    // Re-evaluate all answers to get evaluations
    const evaluations: AnswerEvaluation[] = [];
    for (let i = 0; i < session.questions.length; i++) {
      const question = session.questions[i];
      const answer = session.answers[i];
      
      if (question && answer) {
        const evaluation = await evaluateAnswerWithDetailedFeedback(
          question, 
          answer.answer, 
          answer.timeSpent,
          session
        );
        evaluations.push(evaluation);
      }
    }

    const overallScore = calculateOverallScore(evaluations);
    const summary = await generateComprehensiveSummary(session, evaluations);

    return NextResponse.json({
      success: true,
      results: {
        session,
        overallScore,
        summary,
        evaluations
      }
    });
  } catch (error) {
    console.error('Error getting results:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get interview results' },
      { status: 500 }
    );
  }
}

// Pause interview session
async function handlePauseSession(data: { sessionId: string }) {
  try {
    const { sessionId } = data;
    
    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const success = sessionManager.pauseSession(sessionId);
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to pause session' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Session paused successfully'
    });
  } catch (error) {
    console.error('Error pausing session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to pause session' },
      { status: 500 }
    );
  }
}

// Resume interview session
async function handleResumeSession(data: { sessionId: string }) {
  try {
    const { sessionId } = data;
    
    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const success = sessionManager.resumeSession(sessionId);
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to resume session' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Session resumed successfully'
    });
  } catch (error) {
    console.error('Error resuming session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to resume session' },
      { status: 500 }
    );
  }
}

// Helper function to get fallback question with variety
function getFallbackQuestionWithVariety(session: any, category: string): InterviewQuestion | null {
  const positionFallbacks = fallbackQuestions[session.position as keyof typeof fallbackQuestions];
  if (!positionFallbacks) return null;

  const categoryFallbacks = positionFallbacks[category as keyof typeof positionFallbacks];
  if (!categoryFallbacks) return null;

  const difficultyFallbacks = categoryFallbacks[session.difficulty as keyof typeof categoryFallbacks];
  if (!difficultyFallbacks || difficultyFallbacks.length === 0) return null;

  // Get previously used questions to avoid repetition
  const usedQuestions = session.questions.map((q: any) => q.question);
  
  // Filter out already used questions
  const availableQuestions = difficultyFallbacks.filter((q: any) => 
    !usedQuestions.includes(q.question)
  );

  // If all questions have been used, use any question but with a different ID
  const questionsToUse = availableQuestions.length > 0 ? availableQuestions : difficultyFallbacks;
  
  if (questionsToUse.length === 0) return null;

  const selectedQuestion = questionsToUse[Math.floor(Math.random() * questionsToUse.length)];
  
  // Create a new question object with unique ID to avoid conflicts
  return {
    ...selectedQuestion,
    id: `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    questionCode: selectedQuestion.id ? `FB_${String(selectedQuestion.id).toUpperCase()}` : undefined
  };
}

// Enhanced AI-driven question generation with topic exploration
async function generateAdaptiveQuestion(session: any): Promise<InterviewQuestion | null> {
  try {
    // Get conversation context from previous questions and answers
    const conversationHistory = session.questions.map((q: any, index: number) => {
      const answer = session.answers[index];
      return {
        question: q.question,
        answer: answer?.answer || '',
        category: q.category,
        topic: q.topic || 'general',
        depth: q.depth || 'introductory'
      };
    });

    // Analyze current topic and determine next question strategy
    const currentTopic = getCurrentTopic(session);
    const shouldDeepDive = shouldExploreTopicDeeper(session, currentTopic);
    const nextTopic = shouldDeepDive ? currentTopic : getNextTopic(session);

    // Build adaptive prompt
    const adaptivePrompt = buildAdaptiveQuestionPrompt(
      session,
      conversationHistory,
      currentTopic,
      nextTopic,
      shouldDeepDive
    );

    if (!model) {
      throw new Error('AI model not available');
    }

    const result = await model.generateContent(adaptivePrompt);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error('No response from AI');
    }

    // Parse the adaptive response
    const questionData = parseAdaptiveResponse(text);
    
    // Create enhanced question object with topic tracking
    const question: InterviewQuestion = {
      id: `adaptive_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      questionCode: `ADAPT_${(questionData.topic || nextTopic || 'general').toUpperCase()}_${(questionData.difficulty || session.difficulty).toUpperCase()}`,
      category: questionData.category || 'technical',
      difficulty: questionData.difficulty || session.difficulty,
      question: questionData.question,
      expectedKeywords: questionData.expectedKeywords || [],
      sampleAnswers: questionData.sampleAnswers || [],
      timeLimit: questionData.timeLimit || 240,
      maxScore: questionData.maxScore || 10,
      roleSpecific: true,
      jobRequirements: session.jobRequirements,
      topic: questionData.topic || nextTopic,
      depth: questionData.depth || (shouldDeepDive ? 'advanced' : 'introductory'),
      context: questionData.context || '',
      followUpStrategy: questionData.followUpStrategy || 'explore'
    };

    return question;
  } catch (error) {
    console.error('Error generating adaptive question:', error);
    return getFallbackQuestionWithVariety(session, 'technical');
  }
}

// Analyze current conversation topic
function getCurrentTopic(session: any): string {
  if (session.questions.length === 0) {
    return 'introduction';
  }

  const recentQuestions = session.questions.slice(-3);
  const topics = recentQuestions.map((q: any) => q.topic).filter(Boolean);
  
  if (topics.length === 0) {
    return 'general_technical';
  }

  // Return the most recent topic
  return topics[topics.length - 1];
}

// Determine if we should explore current topic deeper
function shouldExploreTopicDeeper(session: any, currentTopic: string): boolean {
  if (session.questions.length === 0) return false;

  const topicQuestions = session.questions.filter((q: any) => q.topic === currentTopic);
  const topicAnswers = topicQuestions.map((q: any, index: number) => {
    const answerIndex = session.questions.indexOf(q);
    return session.answers[answerIndex];
  }).filter(Boolean);

  // Check if recent answers show expertise
  const recentScores = topicAnswers.slice(-2).map((a: any) => a.score || 0);
  const avgScore = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;

  // Deep dive if:
  // 1. Good performance on topic (score >= 7)
  // 2. Topic has potential for deeper exploration
  // 3. Haven't explored too deeply yet (max 3 questions per topic)
  return avgScore >= 7 && topicQuestions.length < 3 && hasDeeperPotential(currentTopic);
}

// Check if topic has potential for deeper exploration
function hasDeeperPotential(topic: string): boolean {
  const deepTopics = [
    'system_design', 'algorithms', 'databases', 'networking', 
    'security', 'cloud_computing', 'microservices', 'performance',
    'scalability', 'architecture', 'testing', 'devops'
  ];
  return deepTopics.includes(topic);
}

// Get next topic to explore
function getNextTopic(session: any): string {
  const exploredTopics = session.questions.map((q: any) => q.topic).filter(Boolean);
  const allTopics = [
    'introduction', 'system_design', 'algorithms', 'databases', 
    'networking', 'security', 'cloud_computing', 'microservices',
    'performance', 'scalability', 'architecture', 'testing', 
    'devops', 'frontend', 'backend', 'mobile', 'ai_ml'
  ];

  const unexploredTopics = allTopics.filter(topic => !exploredTopics.includes(topic));
  
  if (unexploredTopics.length > 0) {
    return unexploredTopics[0];
  }

  // If all topics explored, return a random one for variety
  return allTopics[Math.floor(Math.random() * allTopics.length)];
}

// Build adaptive question prompt
function buildAdaptiveQuestionPrompt(
  session: any,
  conversationHistory: any[],
  currentTopic: string,
  nextTopic: string,
  shouldDeepDive: boolean
): string {
  const position = session.position;
  const industry = session.industry;
  const difficulty = session.difficulty;
  const experienceLevel = session.experienceLevel || 'mid';

  let topicStrategy = '';
  if (shouldDeepDive) {
    topicStrategy = `The candidate has shown strong knowledge in ${currentTopic}. Generate a deeper, more advanced question that explores advanced concepts, edge cases, or real-world applications in this area.`;
  } else {
    topicStrategy = `Move to a new topic: ${nextTopic}. Generate an introductory question that assesses the candidate's knowledge in this area.`;
  }

  const historyContext = conversationHistory.length > 0 ? 
    `\n\nRecent conversation context:\n${conversationHistory.slice(-3).map(h => `Q: ${h.question}\nA: ${h.answer}`).join('\n\n')}` : '';

  return `You are an expert technical interviewer conducting an adaptive interview for a ${position} role in the ${industry} industry. 

${topicStrategy}

Position: ${position}
Industry: ${industry}
Experience Level: ${experienceLevel}
Difficulty: ${difficulty}

${historyContext}

Generate a contextual, adaptive question that:
1. Builds upon the conversation context
2. Assesses both technical knowledge and problem-solving approach
3. Provides opportunities for the candidate to demonstrate expertise
4. Includes specific follow-up strategies based on the answer

Return the response in this JSON format:
{
  "question": "The actual question text",
  "category": "technical|behavioral|problem-solving",
  "difficulty": "easy|medium|hard",
  "expectedKeywords": ["keyword1", "keyword2", "keyword3"],
  "sampleAnswers": ["sample answer 1", "sample answer 2"],
  "timeLimit": 240,
  "maxScore": 10,
  "topic": "${shouldDeepDive ? currentTopic : nextTopic}",
  "depth": "${shouldDeepDive ? 'advanced' : 'introductory'}",
  "context": "Brief context about why this question is being asked",
  "followUpStrategy": "explore|deepen|move_on|challenge"
}

Make the question specific, relevant, and engaging. Focus on real-world scenarios and practical applications.`;
}

// Parse adaptive AI response
function parseAdaptiveResponse(text: string): any {
  try {
    // Strategy 1: Direct JSON parsing
    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.log('Direct JSON parsing failed, trying alternative methods');
    
    // Strategy 2: Extract JSON from text
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (error2) {
      console.log('JSON extraction failed');
      throw new Error('Unable to parse AI response');
    }
  }
}

// Enhanced evaluation with detailed feedback
async function evaluateAnswerWithDetailedFeedback(
  question: InterviewQuestion,
  answer: string,
  timeSpent: number,
  session: any
): Promise<AnswerEvaluation> {
  try {
    const detailedPrompt = buildDetailedEvaluationPrompt(question, answer, timeSpent, session);

    if (!model) {
      return getBasicEvaluation(question, answer);
    }

    const result = await model.generateContent(detailedPrompt);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error('No response from AI');
    }

    const evaluationData = parseDetailedEvaluationResponse(text);
    
    return {
      score: Math.min(evaluationData.score, question.maxScore),
      maxScore: question.maxScore,
      feedback: evaluationData.feedback,
      strengths: evaluationData.strengths || [],
      weaknesses: evaluationData.weaknesses || [],
      suggestions: evaluationData.suggestions || [],
      aiAnalysis: {
        technicalAccuracy: evaluationData.aiAnalysis?.technicalAccuracy || 0,
        communicationSkills: evaluationData.aiAnalysis?.communicationSkills || 0,
        problemSolving: evaluationData.aiAnalysis?.problemSolving || 0,
        confidence: evaluationData.aiAnalysis?.confidence || 0,
        relevance: evaluationData.aiAnalysis?.relevance || 0
      },
      jobFitScore: evaluationData.jobFitScore,
      roleCompetencyScore: evaluationData.roleCompetencyScore,
      topicAnalysis: evaluationData.topicAnalysis || '',
      improvementSuggestions: evaluationData.improvementSuggestions || [],
      nextSteps: evaluationData.nextSteps || ''
    };
  } catch (error) {
    console.error('Error evaluating answer:', error);
    return getBasicEvaluation(question, answer);
  }
}

// Build detailed evaluation prompt
function buildDetailedEvaluationPrompt(question: InterviewQuestion, answer: string, timeSpent: number, session: any): string {
  return `You are an expert technical interviewer evaluating a candidate's answer for a ${session.position} role.

Question: ${question.question}
Topic: ${question.topic || 'general'}
Depth: ${question.depth || 'introductory'}
Expected Keywords: ${question.expectedKeywords.join(', ')}
Candidate's Answer: ${answer}
Time Spent: ${timeSpent} seconds

Provide a comprehensive evaluation that includes:

1. Technical accuracy and depth of knowledge
2. Communication clarity and structure
3. Problem-solving approach and methodology
4. Relevance to the role and industry
5. Areas for improvement and specific suggestions
6. Topic-specific insights and next learning steps

Return the evaluation in this JSON format:
{
  "score": 8,
  "feedback": "Detailed, constructive feedback on the answer",
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2"],
  "suggestions": ["specific suggestion 1", "specific suggestion 2"],
  "aiAnalysis": {
    "technicalAccuracy": 8,
    "communicationSkills": 7,
    "problemSolving": 8,
    "confidence": 6,
    "relevance": 9
  },
  "jobFitScore": 8,
  "roleCompetencyScore": 7,
  "topicAnalysis": "Analysis of the candidate's knowledge in this specific topic area",
  "improvementSuggestions": ["specific improvement 1", "specific improvement 2"],
  "nextSteps": "Recommended next steps for learning or improvement in this area"
}

Provide specific, actionable feedback that helps the candidate understand their performance and how to improve.`;
}

// Parse detailed evaluation response
function parseDetailedEvaluationResponse(text: string): any {
  try {
    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.log('Detailed evaluation parsing failed, using basic parsing');
    return parseEvaluationResponse(text);
  }
}

// Get basic evaluation as fallback
function getBasicEvaluation(question: InterviewQuestion, answer: string): AnswerEvaluation {
  return {
    score: Math.min(5, question.maxScore),
    maxScore: question.maxScore,
    feedback: 'Evaluation system temporarily unavailable. Please review your answer for clarity and relevance.',
    strengths: ['Good attempt at answering the question'],
    weaknesses: ['Evaluation system temporarily unavailable'],
    suggestions: ['Try to be more specific in your answers', 'Include relevant examples'],
    aiAnalysis: {
      technicalAccuracy: 5,
      communicationSkills: 5,
      problemSolving: 5,
      confidence: 5,
      relevance: 5
    },
    topicAnalysis: 'Basic evaluation completed',
    improvementSuggestions: ['Practice more', 'Study the topic'],
    nextSteps: 'Continue learning and practicing'
  };
}

// Generate comprehensive interview summary with topic analysis
async function generateComprehensiveSummary(session: any, evaluations: AnswerEvaluation[]) {
  try {
    const overallScore = calculateOverallScore(evaluations);
    const totalQuestions = session.questions.length;
    const completionTime = session.endTime ? 
      Math.round((session.endTime.getTime() - session.startTime.getTime()) / 1000 / 60) : 0;

    // Analyze performance by topic
    const topicAnalysis = analyzeTopicPerformance(session, evaluations);
    
    // Generate strengths and weaknesses
    const allStrengths = evaluations.flatMap(e => e.strengths);
    const allWeaknesses = evaluations.flatMap(e => e.weaknesses);
    const allSuggestions = evaluations.flatMap(e => e.suggestions);

    // Count frequency of strengths/weaknesses
    const strengthCounts = allStrengths.reduce((acc, strength) => {
      acc[strength] = (acc[strength] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const weaknessCounts = allWeaknesses.reduce((acc, weakness) => {
      acc[weakness] = (acc[weakness] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Get top strengths and weaknesses
    const topStrengths = Object.entries(strengthCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([strength]) => strength);

    const topWeaknesses = Object.entries(weaknessCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([weakness]) => weakness);

    // Generate performance summary
    let performanceSummary = '';
    if (overallScore.percentage >= 85) {
      performanceSummary = `Excellent performance! You scored ${overallScore.percentage}% with a grade of ${overallScore.grade}. Your responses demonstrated strong technical knowledge and excellent communication skills across multiple topic areas.`;
    } else if (overallScore.percentage >= 70) {
      performanceSummary = `Good performance! You scored ${overallScore.percentage}% with a grade of ${overallScore.grade}. You showed solid understanding with room for improvement in certain areas.`;
    } else if (overallScore.percentage >= 55) {
      performanceSummary = `Fair performance. You scored ${overallScore.percentage}% with a grade of ${overallScore.grade}. Focus on the areas for improvement to enhance your interview skills.`;
    } else {
      performanceSummary = `You scored ${overallScore.percentage}% with a grade of ${overallScore.grade}. This indicates areas that need significant improvement. Review the feedback carefully and practice more.`;
    }

    // Generate topic-specific recommendations
    const topicRecommendations = generateTopicRecommendations(topicAnalysis);

    // Generate comprehensive recommendations
    const recommendations = generateComprehensiveRecommendations(overallScore, topicAnalysis, evaluations);

    return {
      summary: performanceSummary,
      recommendations: recommendations.slice(0, 8), // Top 8 recommendations
      strengths: topStrengths,
      areasForImprovement: topWeaknesses,
      topicAnalysis,
      overallStats: {
        totalScore: overallScore.totalScore,
        maxPossibleScore: overallScore.maxPossibleScore,
        percentage: overallScore.percentage,
        grade: overallScore.grade,
        completionTime: `${completionTime} minutes`,
        questionsAnswered: totalQuestions,
        topicsExplored: Object.keys(topicAnalysis).length
      },
      jobFitAnalysis: overallScore.jobFitScore ? 
        `Job Fit Score: ${Math.round(overallScore.jobFitScore)}/10 - ${overallScore.jobFitScore >= 7 ? 'Excellent match' : overallScore.jobFitScore >= 5 ? 'Good match' : 'Needs alignment'}` : 
        'Job fit analysis not available',
      marketPositioning: `Based on your performance, you are positioned as a ${overallScore.percentage >= 85 ? 'top-tier' : overallScore.percentage >= 70 ? 'competitive' : overallScore.percentage >= 55 ? 'developing' : 'entry-level'} candidate for ${session.position} roles.`,
      learningPath: generateLearningPath(topicAnalysis, session.position)
    };
  } catch (error) {
    console.error('Error generating comprehensive summary:', error);
    return getBasicSummary(session);
  }
}

// Analyze performance by topic
function analyzeTopicPerformance(session: any, evaluations: AnswerEvaluation[]) {
  const topicAnalysis: Record<string, any> = {};
  
  session.questions.forEach((question: any, index: number) => {
    const evaluation = evaluations[index];
    const topic = question.topic || 'general';
    
    if (!topicAnalysis[topic]) {
      topicAnalysis[topic] = {
        questions: 0,
        totalScore: 0,
        maxScore: 0,
        strengths: [],
        weaknesses: [],
        recommendations: []
      };
    }
    
    topicAnalysis[topic].questions++;
    topicAnalysis[topic].totalScore += evaluation.score;
    topicAnalysis[topic].maxScore += evaluation.maxScore;
    topicAnalysis[topic].strengths.push(...evaluation.strengths);
    topicAnalysis[topic].weaknesses.push(...evaluation.weaknesses);
  });
  
  // Calculate averages and generate insights
  Object.keys(topicAnalysis).forEach(topic => {
    const analysis = topicAnalysis[topic];
    analysis.averageScore = Math.round((analysis.totalScore / analysis.maxScore) * 100);
    analysis.performance = analysis.averageScore >= 80 ? 'Excellent' : 
                          analysis.averageScore >= 65 ? 'Good' : 
                          analysis.averageScore >= 50 ? 'Fair' : 'Needs Improvement';
  });
  
  return topicAnalysis;
}

// Generate topic-specific recommendations
function generateTopicRecommendations(topicAnalysis: Record<string, any>): string[] {
  const recommendations: string[] = [];
  
  Object.entries(topicAnalysis).forEach(([topic, analysis]) => {
    if (analysis.averageScore < 70) {
      recommendations.push(`Focus on improving your knowledge in ${topic.replace(/_/g, ' ')} - current performance: ${analysis.performance}`);
    } else if (analysis.averageScore >= 85) {
      recommendations.push(`Excellent performance in ${topic.replace(/_/g, ' ')} - consider specializing in this area`);
    }
  });
  
  return recommendations;
}

// Generate comprehensive recommendations
function generateComprehensiveRecommendations(overallScore: any, topicAnalysis: Record<string, any>, evaluations: AnswerEvaluation[]): string[] {
  const recommendations: string[] = [];
  
  // Overall performance recommendations
  if (overallScore.percentage < 70) {
    recommendations.push('Practice more mock interviews to improve your confidence and communication skills');
    recommendations.push('Review technical concepts related to your target role');
    recommendations.push('Prepare specific examples and stories for behavioral questions');
  }
  
  // Topic-specific recommendations
  Object.entries(topicAnalysis).forEach(([topic, analysis]) => {
    if (analysis.averageScore < 60) {
      recommendations.push(`Strengthen your fundamentals in ${topic.replace(/_/g, ' ')} through focused study and practice`);
    }
  });
  
  // Communication and presentation recommendations
  const communicationScores = evaluations.map(e => e.aiAnalysis.communicationSkills);
  const avgCommunication = communicationScores.reduce((a, b) => a + b, 0) / communicationScores.length;
  
  if (avgCommunication < 6) {
    recommendations.push('Work on improving your communication skills - practice explaining technical concepts clearly');
  }
  
  // General recommendations
  recommendations.push('Record yourself answering questions to improve delivery');
  recommendations.push('Practice with a friend or mentor for additional feedback');
  recommendations.push('Stay updated with industry trends and technologies');
  recommendations.push('Build a portfolio of projects to demonstrate practical skills');
  
  return recommendations;
}

// Generate personalized learning path
function generateLearningPath(topicAnalysis: Record<string, any>, position: string): string[] {
  const learningPath: string[] = [];
  
  // Identify weak areas for immediate focus
  const weakTopics = Object.entries(topicAnalysis)
    .filter(([, analysis]) => analysis.averageScore < 60)
    .map(([topic]) => topic);
  
  if (weakTopics.length > 0) {
    learningPath.push(`Immediate Focus: Strengthen fundamentals in ${weakTopics.slice(0, 2).map(t => t.replace(/_/g, ' ')).join(' and ')}`);
  }
  
  // Identify strong areas for specialization
  const strongTopics = Object.entries(topicAnalysis)
    .filter(([, analysis]) => analysis.averageScore >= 80)
    .map(([topic]) => topic);
  
  if (strongTopics.length > 0) {
    learningPath.push(`Specialization Opportunity: Consider deepening expertise in ${strongTopics[0].replace(/_/g, ' ')}`);
  }
  
  // Role-specific learning path
  if (position.toLowerCase().includes('frontend')) {
    learningPath.push('Advanced Learning: Master modern frontend frameworks and state management');
  } else if (position.toLowerCase().includes('backend')) {
    learningPath.push('Advanced Learning: Focus on system design, scalability, and performance optimization');
  } else if (position.toLowerCase().includes('full stack')) {
    learningPath.push('Advanced Learning: Develop expertise in both frontend and backend technologies');
  }
  
  learningPath.push('Continuous Improvement: Stay updated with industry best practices and emerging technologies');
  
  return learningPath;
}

// Get basic summary as fallback
function getBasicSummary(session: any) {
  return {
    summary: 'Interview completed successfully. Detailed analysis temporarily unavailable.',
    recommendations: ['Practice more mock interviews', 'Review technical concepts', 'Prepare behavioral examples'],
    strengths: ['Completed the interview successfully'],
    areasForImprovement: ['Detailed analysis unavailable'],
    topicAnalysis: {},
    overallStats: {
      totalScore: session.totalScore,
      maxPossibleScore: session.maxPossibleScore,
      percentage: Math.round((session.totalScore / session.maxPossibleScore) * 100),
      grade: 'N/A',
      completionTime: 'Unknown',
      questionsAnswered: session.questions.length,
      topicsExplored: 0
    },
    jobFitAnalysis: 'Analysis not available',
    marketPositioning: 'Positioning analysis not available',
    learningPath: ['Continue learning and practicing']
  };
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { message: 'Interview API is running' },
    { status: 200 }
  );
} 
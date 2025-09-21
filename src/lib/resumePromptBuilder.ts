import { ResumeRequest, industryKeywords, experienceLevels } from './resumeUtils';

export function buildResumeAnalysisPrompt(request: ResumeRequest): string {
  const { resumeText, industry, jobTitle, experienceLevel } = request;
  const industryKeywordsList = industryKeywords[industry.toLowerCase()] || [];
  const experienceLevelInfo = experienceLevels[experienceLevel as keyof typeof experienceLevels];
  
  return `You are an expert resume reviewer and career coach with 15+ years of experience in HR and recruitment. Analyze this resume and provide comprehensive feedback.

RESUME CONTENT:
${resumeText}

CONTEXT:
- Target Industry: ${industry}
- Target Job Title: ${jobTitle}
- Experience Level: ${experienceLevel}
- Industry Keywords: ${industryKeywordsList.join(', ')}
- Experience Level Focus: ${experienceLevelInfo?.focus || 'General'}

Please provide a comprehensive analysis in JSON format:
{
  "overallScore": number (0-100),
  "scoreBreakdown": {
    "content": number (0-25),
    "structure": number (0-25),
    "keywords": number (0-25),
    "atsOptimization": number (0-25)
  },
  "strengths": [
    "Specific strength about the resume",
    "Another notable strength"
  ],
  "weaknesses": [
    "Specific area that needs improvement",
    "Another weakness to address"
  ],
  "suggestions": [
    {
      "category": "content|structure|keywords|format",
      "title": "Suggestion title",
      "description": "Detailed explanation of the suggestion",
      "priority": "high|medium|low",
      "impact": "How this change will improve the resume"
    }
  ],
  "sectionAnalysis": [
    {
      "section": "contact|summary|experience|education|skills|certifications|projects|languages",
      "score": number (0-100),
      "strengths": ["Strength 1", "Strength 2"],
      "weaknesses": ["Weakness 1", "Weakness 2"],
      "suggestions": ["Suggestion 1", "Suggestion 2"]
    }
  ],
  "keywordAnalysis": {
    "foundKeywords": ["keyword1", "keyword2"],
    "missingKeywords": ["missing1", "missing2"],
    "suggestedKeywords": ["suggested1", "suggested2"],
    "keywordDensity": {
      "keyword1": number (percentage),
      "keyword2": number (percentage)
    }
  },
  "atsOptimization": {
    "score": number (0-100),
    "issues": ["Issue 1", "Issue 2"],
    "recommendations": ["Recommendation 1", "Recommendation 2"],
    "formatCompliance": {
      "isCompliant": boolean,
      "issues": ["Format issue 1", "Format issue 2"]
    }
  },
  "actionPlan": [
    {
      "priority": "high|medium|low",
      "action": "Specific action to take",
      "timeline": "When to complete this",
      "impact": "Expected impact of this action"
    }
  ],
  "summary": "Overall assessment and key recommendations in 2-3 sentences"
}

Guidelines for analysis:
1. Be specific and actionable in suggestions
2. Consider the target industry and job requirements
3. Focus on ATS (Applicant Tracking System) optimization
4. Provide industry-specific keyword recommendations
5. Consider experience level expectations
6. Evaluate both content and format
7. Prioritize suggestions by impact and effort

Return only the JSON, no additional text.`;
}

export function buildSectionSpecificPrompt(section: string, content: string, industry: string, jobTitle: string): string {
  return `You are an expert resume reviewer. Analyze this specific section of a resume:

SECTION: ${section.toUpperCase()}
CONTENT:
${content}

TARGET INDUSTRY: ${industry}
TARGET JOB TITLE: ${jobTitle}

Provide analysis in JSON format:
{
  "score": number (0-100),
  "strengths": ["Strength 1", "Strength 2"],
  "weaknesses": ["Weakness 1", "Weakness 2"],
  "suggestions": ["Specific suggestion 1", "Specific suggestion 2"],
  "improvements": ["Detailed improvement 1", "Detailed improvement 2"]
}

Focus on:
- Relevance to target job
- Industry-specific terminology
- Clarity and impact
- Quantifiable achievements
- Professional presentation

Return only the JSON, no additional text.`;
}

export function buildATSOptimizationPrompt(resumeText: string, industry: string): string {
  const industryKeywordsList = industryKeywords[industry.toLowerCase()] || [];
  
  return `You are an ATS (Applicant Tracking System) optimization expert. Analyze this resume for ATS compatibility:

RESUME TEXT:
${resumeText}

TARGET INDUSTRY: ${industry}
INDUSTRY KEYWORDS: ${industryKeywordsList.join(', ')}

Provide ATS optimization analysis in JSON format:
{
  "score": number (0-100),
  "issues": [
    "Specific ATS issue 1",
    "Specific ATS issue 2"
  ],
  "recommendations": [
    "Specific recommendation 1",
    "Specific recommendation 2"
  ],
  "formatCompliance": {
    "isCompliant": boolean,
    "issues": [
      "Format compliance issue 1",
      "Format compliance issue 2"
    ]
  },
  "keywordOptimization": {
    "foundKeywords": ["keyword1", "keyword2"],
    "missingKeywords": ["missing1", "missing2"],
    "keywordDensity": {
      "keyword1": number (percentage),
      "keyword2": number (percentage)
    }
  },
  "atsBestPractices": [
    "Best practice 1",
    "Best practice 2"
  ]
}

Focus on:
- Keyword optimization
- Format compatibility
- File format considerations
- Section structure
- Professional formatting
- Industry-specific terminology

Return only the JSON, no additional text.`;
}

export function buildKeywordAnalysisPrompt(resumeText: string, industry: string, jobTitle: string): string {
  const industryKeywordsList = industryKeywords[industry.toLowerCase()] || [];
  
  return `You are a keyword optimization expert. Analyze this resume for keyword effectiveness:

RESUME TEXT:
${resumeText}

TARGET INDUSTRY: ${industry}
TARGET JOB TITLE: ${jobTitle}
INDUSTRY KEYWORDS: ${industryKeywordsList.join(', ')}

Provide keyword analysis in JSON format:
{
  "foundKeywords": [
    "keyword found in resume 1",
    "keyword found in resume 2"
  ],
  "missingKeywords": [
    "important missing keyword 1",
    "important missing keyword 2"
  ],
  "suggestedKeywords": [
    "suggested keyword 1",
    "suggested keyword 2"
  ],
  "keywordDensity": {
    "keyword1": number (percentage),
    "keyword2": number (percentage)
  },
  "keywordPlacement": {
    "wellPlaced": ["keyword1", "keyword2"],
    "needsRepositioning": ["keyword3", "keyword4"]
  },
  "synonyms": {
    "original": "suggested synonym",
    "original2": "suggested synonym2"
  }
}

Focus on:
- Industry-specific terminology
- Job title relevance
- Skill-based keywords
- Action verbs
- Technical terms
- Soft skills
- Certifications and qualifications

Return only the JSON, no additional text.`;
}

export function buildIndustrySpecificPrompt(resumeText: string, industry: string, jobTitle: string): string {
  const industryKeywordsList = industryKeywords[industry.toLowerCase()] || [];
  
  return `You are an industry-specific resume expert for ${industry}. Analyze this resume for ${industry} industry standards:

RESUME TEXT:
${resumeText}

TARGET JOB TITLE: ${jobTitle}
INDUSTRY KEYWORDS: ${industryKeywordsList.join(', ')}

Provide industry-specific analysis in JSON format:
{
  "industryAlignment": number (0-100),
  "industryStrengths": [
    "Industry-specific strength 1",
    "Industry-specific strength 2"
  ],
  "industryWeaknesses": [
    "Industry-specific weakness 1",
    "Industry-specific weakness 2"
  ],
  "industrySuggestions": [
    {
      "suggestion": "Industry-specific suggestion",
      "reason": "Why this is important for this industry",
      "priority": "high|medium|low"
    }
  ],
  "industryKeywords": {
    "found": ["found keyword 1", "found keyword 2"],
    "missing": ["missing keyword 1", "missing keyword 2"],
    "suggested": ["suggested keyword 1", "suggested keyword 2"]
  },
  "industryStandards": {
    "meets": ["standard 1", "standard 2"],
    "missing": ["missing standard 1", "missing standard 2"]
  },
  "industryTrends": [
    "Current industry trend 1",
    "Current industry trend 2"
  ]
}

Focus on:
- Industry-specific terminology
- Current industry trends
- Required certifications
- Industry standards
- Relevant experience types
- Industry-specific achievements

Return only the JSON, no additional text.`;
} 
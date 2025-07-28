// Interfaces moved to schemas/resumeSchema.ts

// Industry keywords moved to schemas/resumeSchema.ts

// Export industry keywords for backward compatibility
export const industryKeywords = {
  'technology': ['software', 'programming', 'development', 'coding', 'web', 'mobile', 'AI', 'machine learning', 'data science', 'cybersecurity', 'cloud', 'devops'],
  'healthcare': ['medical', 'healthcare', 'patient', 'clinical', 'nursing', 'pharmacy', 'therapy', 'diagnosis', 'treatment', 'hospital', 'clinic'],
  'finance': ['financial', 'banking', 'investment', 'accounting', 'audit', 'risk', 'compliance', 'trading', 'portfolio', 'wealth management', 'insurance'],
  'education': ['teaching', 'education', 'curriculum', 'student', 'academic', 'research', 'instruction', 'learning', 'assessment', 'pedagogy'],
  'marketing': ['marketing', 'advertising', 'brand', 'campaign', 'social media', 'content', 'SEO', 'analytics', 'customer', 'sales', 'promotion'],
  'consulting': ['consulting', 'strategy', 'business', 'analysis', 'project management', 'change management', 'process improvement', 'advisory'],
  'retail': ['retail', 'sales', 'customer service', 'inventory', 'merchandising', 'e-commerce', 'store management', 'point of sale'],
  'manufacturing': ['manufacturing', 'production', 'quality control', 'supply chain', 'operations', 'engineering', 'maintenance', 'safety'],
  'government': ['government', 'public service', 'policy', 'administration', 'regulatory', 'compliance', 'public affairs', 'legislation'],
  'nonprofit': ['nonprofit', 'charity', 'volunteer', 'fundraising', 'advocacy', 'community', 'social impact', 'grant writing']
};

// Experience level expectations
export const experienceLevels = {
  'entry-level': {
    keywords: ['Entry-level', 'Junior', 'Graduate', 'Internship', 'Training'],
    focus: 'Basic skills, education, internships, volunteer work'
  },
  'mid-level': {
    keywords: ['Mid-level', 'Intermediate', '3-5 years', 'Team Lead', 'Project Management'],
    focus: 'Project experience, team collaboration, technical skills'
  },
  'senior-level': {
    keywords: ['Senior', 'Lead', 'Manager', '5+ years', 'Strategic', 'Leadership'],
    focus: 'Leadership, strategic thinking, mentoring, complex projects'
  },
  'executive': {
    keywords: ['Director', 'VP', 'C-level', 'Executive', 'Strategy', 'Leadership'],
    focus: 'Strategic leadership, business impact, team management'
  }
};

// Function to extract text from different file types
export async function extractTextFromFile(file: File): Promise<string> {
  try {
    if (file.type === 'application/pdf') {
      try {
        return await extractPdfText(file);
      } catch (pdfError) {
        // Try alternative PDF processing method
        try {
          return await extractPdfTextAlternative(file);
        } catch (altError) {
          throw new Error(`PDF processing failed. Please try converting to DOCX or copy text manually. Error: ${pdfError instanceof Error ? pdfError.message : 'Unknown error'}`);
        }
      }
    } else if (file.type.includes('word') || file.type.includes('document')) {
      return await extractDocxText(file);
    } else if (file.type === 'text/plain') {
      return await file.text();
    } else {
      throw new Error('Unsupported file type. Please upload PDF, DOCX, or TXT files.');
    }
  } catch (error) {
    throw new Error(`Failed to extract text from file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Extract text from PDF using PDF.js
async function extractPdfText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  
  // Import PDF.js with minimal configuration
  const pdfjsLib = await import('pdfjs-dist');
  
  // Completely disable workers
  pdfjsLib.GlobalWorkerOptions.workerSrc = null;
  
  try {
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
    
    return fullText.trim();
  } catch (error) {
    throw new Error(`Failed to process PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Alternative PDF processing method
async function extractPdfTextAlternative(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  
  // Try with different PDF.js configuration
  const pdfjsLib = await import('pdfjs-dist');
  
  // Disable all workers and use main thread
  pdfjsLib.GlobalWorkerOptions.workerSrc = null;
  
  try {
    const loadingTask = pdfjsLib.getDocument({ 
      data: arrayBuffer,
      disableWorker: true,
      disableRange: true,
      disableStream: true
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
    
    return fullText.trim();
  } catch (error) {
    throw new Error(`Alternative PDF processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Extract text from DOCX using mammoth
async function extractDocxText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const mammoth = await import('mammoth');
  
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value.trim();
}

// Function to analyze resume sections
export function analyzeResumeSections(text: string): Record<string, string> {
  const sections: Record<string, string> = {};
  
  // Common section headers
  const sectionPatterns = {
    contact: /(?:contact|personal|info)/i,
    summary: /(?:summary|objective|profile|about)/i,
    experience: /(?:experience|work|employment|career)/i,
    education: /(?:education|academic|degree|university|college)/i,
    skills: /(?:skills|competencies|technologies|tools)/i,
    certifications: /(?:certifications|certificates|licenses)/i,
    projects: /(?:projects|portfolio|achievements)/i,
    languages: /(?:languages|language)/i
  };
  
  const lines = text.split('\n');
  let currentSection = '';
  let currentContent: string[] = [];
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;
    
    // Check if line is a section header
    let isHeader = false;
    for (const [section, pattern] of Object.entries(sectionPatterns)) {
      if (pattern.test(trimmedLine)) {
        // Save previous section
        if (currentSection && currentContent.length > 0) {
          sections[currentSection] = currentContent.join('\n').trim();
        }
        
        currentSection = section;
        currentContent = [];
        isHeader = true;
        break;
      }
    }
    
    if (!isHeader && currentSection) {
      currentContent.push(trimmedLine);
    }
  }
  
  // Save last section
  if (currentSection && currentContent.length > 0) {
    sections[currentSection] = currentContent.join('\n').trim();
  }
  
  return sections;
}

// Function to calculate basic resume score
export function calculateBasicScore(text: string, industry: string, jobTitle: string): number {
  let score = 0;
  const industryKeywordsList = industryKeywords[industry.toLowerCase()] || [];
  const textLower = text.toLowerCase();
  
  // Check for industry keywords (30 points)
  const foundKeywords = industryKeywordsList.filter(keyword => 
    textLower.includes(keyword.toLowerCase())
  );
  score += Math.min(30, (foundKeywords.length / industryKeywordsList.length) * 30);
  
  // Check for job title relevance (20 points)
  if (textLower.includes(jobTitle.toLowerCase())) {
    score += 20;
  }
  
  // Check for contact information (10 points)
  if (/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(text)) {
    score += 10;
  }
  
  // Check for experience indicators (20 points)
  const experienceIndicators = ['experience', 'worked', 'employed', 'job', 'position', 'role'];
  const hasExperience = experienceIndicators.some(indicator => textLower.includes(indicator));
  if (hasExperience) score += 20;
  
  // Check for education (10 points)
  const educationIndicators = ['education', 'degree', 'university', 'college', 'bachelor', 'master'];
  const hasEducation = educationIndicators.some(indicator => textLower.includes(indicator));
  if (hasEducation) score += 10;
  
  // Check for skills section (10 points)
  const skillsIndicators = ['skills', 'competencies', 'technologies', 'tools'];
  const hasSkills = skillsIndicators.some(indicator => textLower.includes(indicator));
  if (hasSkills) score += 10;
  
  return Math.round(score);
}

// Function to validate resume text
export function validateResumeText(text: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!text || text.trim().length === 0) {
    errors.push('Resume text is empty');
  }
  
  if (text.length < 100) {
    errors.push('Resume seems too short (less than 100 characters)');
  }
  
  if (text.length > 50000) {
    errors.push('Resume is too long (more than 50,000 characters)');
  }
  
  // Check for basic sections
  const sections = analyzeResumeSections(text);
  if (!sections.contact && !sections.experience) {
    errors.push('Resume should contain contact information and experience sections');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
} 
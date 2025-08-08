import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from './config';

let genAI: GoogleGenerativeAI | null = null;
let model: any = null;

// Export the model for other files that need it
export { model };

// Local defaults
const DEFAULT_MODEL = 'gemini-1.5-flash';
const DEFAULT_MAX_TOKENS = 2048;
const DEFAULT_TEMPERATURE = 0.7;

/**
 * Initialize Google Gemini AI with centralized configuration
 */
function initializeGemini() {
  const isServer = typeof window === 'undefined';
  const apiKey = config.ai.googleApiKey || config.ai.geminiApiKey || '';
  const hasApiKey = apiKey.length > 0;

  if (isServer && hasApiKey) {
    try {
      genAI = new GoogleGenerativeAI(apiKey);
      model = genAI.getGenerativeModel({ 
        model: DEFAULT_MODEL,
        generationConfig: {
          maxOutputTokens: DEFAULT_MAX_TOKENS,
          temperature: DEFAULT_TEMPERATURE,
        }
      });
      console.log('✅ Gemini model initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Google AI:', error);
    }
  } else if (isServer && !hasApiKey) {
    console.warn('⚠️  GOOGLE_AI_API_KEY / GEMINI_API_KEY not found. AI features will be disabled.');
  }
}

/**
 * Generate response using Google Gemini AI
 */
export async function generateGeminiResponse(prompt: string): Promise<{
  success: boolean;
  text?: string;
  error?: string;
}> {
  if (!model) {
    return {
      success: false,
      error: 'Gemini AI model not initialized. Please set GOOGLE_AI_API_KEY or GEMINI_API_KEY.'
    };
  }

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return {
      success: true,
      text: text
    };
  } catch (error: any) {
    console.error('Gemini API error:', error);
    
    // Provide specific error messages based on error type
    let errorMessage = 'Failed to generate AI response';
    
    if (error.message?.includes('API key expired')) {
      errorMessage = 'Google AI API key has expired. Please renew your API key.';
    } else if (error.message?.includes('quota exceeded')) {
      errorMessage = 'Google AI API quota exceeded. Please check your usage limits.';
    } else if (error.message?.includes('invalid API key')) {
      errorMessage = 'Invalid Google AI API key. Please check your configuration.';
    } else if (error.message?.includes('rate limit')) {
      errorMessage = 'Rate limit exceeded. Please try again later.';
    } else if (error.message?.includes('content policy')) {
      errorMessage = 'Content violates Google AI safety policies. Please modify your request.';
    } else if (error.status === 400) {
      errorMessage = 'Invalid request to Google AI API. Please check your prompt.';
    } else if (error.status === 429) {
      errorMessage = 'Too many requests to Google AI API. Please try again later.';
    } else if (error.status === 500) {
      errorMessage = 'Google AI API server error. Please try again later.';
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Generate content with safety settings
 */
export async function generateContentWithSafety(
  prompt: string,
  safetySettings?: any
): Promise<{
  success: boolean;
  text?: string;
  error?: string;
}> {
  if (!genAI) {
    return {
      success: false,
      error: 'Gemini AI not initialized'
    };
  }

  try {
    const modelWithSafety = genAI.getGenerativeModel({ 
      model: DEFAULT_MODEL,
      generationConfig: {
        maxOutputTokens: DEFAULT_MAX_TOKENS,
        temperature: DEFAULT_TEMPERATURE,
      },
      safetySettings: safetySettings || [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
      ],
    });

    const result = await modelWithSafety.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return {
      success: true,
      text: text
    };
  } catch (error: any) {
    console.error('Gemini API error with safety settings:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate AI response with safety settings'
    };
  }
}

/**
 * Check if Gemini AI is available
 */
export function isGeminiAvailable(): boolean {
  return model !== null;
}

/**
 * Get Gemini AI configuration status
 */
export function getGeminiStatus(): {
  initialized: boolean;
  apiKeyConfigured: boolean;
  model: string;
  maxTokens: number;
  temperature: number;
} {
  const apiKey = config.ai.googleApiKey || config.ai.geminiApiKey || '';
  return {
    initialized: model !== null,
    apiKeyConfigured: apiKey.length > 0,
    model: DEFAULT_MODEL,
    maxTokens: DEFAULT_MAX_TOKENS,
    temperature: DEFAULT_TEMPERATURE,
  };
}

/**
 * Generate a simple response for testing
 */
export function generateContent() {
  if (!isGeminiAvailable()) {
    return {
      success: false,
      error: 'Gemini AI not available'
    };
  }
  
  return {
    success: true,
    text: 'Gemini AI is working correctly!'
  };
}

// Initialize Gemini AI when module is loaded
initializeGemini(); 
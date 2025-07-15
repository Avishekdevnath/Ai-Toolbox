import { GoogleGenerativeAI } from '@google/generative-ai';

// Check if we're on the server side and API key is available
const isServer = typeof window === 'undefined';
const hasApiKey = process.env.GOOGLE_AI_API_KEY;

// Only initialize if we have the API key and we're on the server
let genAI: GoogleGenerativeAI | null = null;
let model: any = null;

if (isServer && hasApiKey) {
  try {
    genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  } catch (error) {
    console.error('Failed to initialize Google AI:', error);
  }
}

// Helper function to generate Gemini response
export async function generateGeminiResponse(prompt: string): Promise<{ success: boolean; text?: string; error?: string }> {
  if (!model) {
    return {
      success: false,
      error: 'Google AI API key not configured'
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
  } catch (error) {
    console.error('Gemini API error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Export model for direct use in API routes (server-side only)
export { model };

export default genAI; 
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Robust JSON parsing utility for AI responses
 * Handles common formatting issues that AI models generate
 */
export function parseAIResponse(aiResponse: string): any {
  console.log('Raw AI Response:', aiResponse.substring(0, 500) + '...');
  
  // Clean the response
  let cleanResponse = aiResponse
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .replace(/[""]/g, '"') // smart quotes to normal
    .replace(/,\s*([}\]])/g, '$1') // remove trailing commas
    .replace(/\n\s*\n/g, '\n') // remove extra newlines
    .replace(/\s+/g, ' ') // normalize whitespace
    .trim();

  function fixAIJSON(jsonStr: string): string {
    return jsonStr
      .replace(/"\s*"([^"]+)"\s*"/g, '"$1"') // Fix double quotes around values
      .replace(/"\s+"/g, '"') // Fix extra spaces and quotes
      .replace(/(\w+):\s*([^",\{\}\[\]\d][^,\{\}\[\]]*?)(?=\s*[,}\]])/g, '$1: "$2"') // Fix unquoted string values
      .replace(/"reps":\s*([^"]+?)(?=\s*[,}\]])/g, '"reps": "$1"') // Fix specific patterns
      .replace(/"notes":\s*([^"]+?)(?=\s*[,}\]])/g, '"notes": "$1"')
      .replace(/"rest_days":\s*([^"]+?)(?=\s*[,}\]])/g, '"rest_days": "$1"')
      .replace(/"hydration_guidelines":\s*([^"]+?)(?=\s*[,}\]])/g, '"hydration_guidelines": "$1"')
      .replace(/"\s*([}\]])/g, '",$1') // Fix missing commas
      .replace(/,\s*([}\]])/g, '$1') // Remove trailing commas
      .replace(/"\s*(\d+(?:\.\d+)?)\s*"/g, '$1') // Fix number values that got quoted
      .replace(/"\s*(true|false)\s*"/g, '$1') // Fix boolean values
      .replace(/"\s*null\s*"/g, 'null') // Fix null values
      .replace(/\s+/g, ' ')
      .trim();
  }

  cleanResponse = fixAIJSON(cleanResponse);
  console.log('Cleaned Response:', cleanResponse.substring(0, 500) + '...');

  // Try to parse the cleaned response
  try {
    return JSON.parse(cleanResponse);
  } catch (parseError) {
    console.error('Failed to parse AI response:', parseError);
    
    // Try to extract JSON from the response
    const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        let extractedJson = fixAIJSON(jsonMatch[0]);
        return JSON.parse(extractedJson);
      } catch (secondParseError) {
        console.error('Second parse attempt failed:', secondParseError);
        
        // Try more aggressive cleaning
        try {
          let aggressiveClean = fixAIJSON(jsonMatch[0])
            .replace(/\s+/g, ' ')
            .trim();
          return JSON.parse(aggressiveClean);
        } catch (thirdParseError) {
          console.error('Third parse attempt failed:', thirdParseError);
          
          // Try manual fixes for common patterns
          try {
            let manualFix = jsonMatch[0]
              .replace(/"\s*"([^"]+)"\s*"/g, '"$1"')
              .replace(/"\s+"/g, '"')
              .replace(/"reps":\s*([^"]+?)(?=\s*[,}\]])/g, '"reps": "$1"')
              .replace(/"notes":\s*([^"]+?)(?=\s*[,}\]])/g, '"notes": "$1"')
              .replace(/"rest_days":\s*([^"]+?)(?=\s*[,}\]])/g, '"rest_days": "$1"')
              .replace(/"hydration_guidelines":\s*([^"]+?)(?=\s*[,}\]])/g, '"hydration_guidelines": "$1"')
              .replace(/"\s*(\d+(?:\.\d+)?)\s*"/g, '$1')
              .replace(/,\s*([}\]])/g, '$1')
              .replace(/\s+/g, ' ')
              .trim();
            return JSON.parse(manualFix);
          } catch (fourthParseError) {
            console.error('Fourth parse attempt failed:', fourthParseError);
            
            // Last resort: try to fix common unquoted string patterns
            try {
              let lastResort = jsonMatch[0]
                .replace(/(\w+):\s*([^",\{\}\[\]\d][^,\{\}\[\]]*?)(?=\s*[,}\]])/g, '$1: "$2"')
                .replace(/"\s*"([^"]+)"\s*"/g, '"$1"')
                .replace(/"\s+"/g, '"')
                .replace(/,\s*([}\]])/g, '$1')
                .replace(/\s+/g, ' ')
                .trim();
              return JSON.parse(lastResort);
            } catch (fifthParseError) {
              console.error('Fifth parse attempt failed:', fifthParseError);
              console.error('Original JSON that failed:', jsonMatch[0]);
              throw new Error('Failed to parse AI response after multiple attempts');
            }
          }
        }
      }
    } else {
      throw new Error('No valid JSON found in AI response');
    }
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { model } from '@/lib/gemini';
import clientPromise from '@/lib/mongodb';
import { buildDietPrompt, DietFormData } from '@/lib/dietPromptBuilder';

// Utility function to parse height from various formats
function parseHeightToCm(heightInput: string): number {
  const input = heightInput.trim().toLowerCase();
  
  // Handle feet and inches (e.g., "5ft 7in", "5'7\"", "5 feet 7 inches")
  const feetInchesMatch = input.match(/(\d+(?:\.\d+)?)\s*(?:ft|feet|')\s*(\d+(?:\.\d+)?)\s*(?:in|inches|")?/);
  if (feetInchesMatch) {
    const feet = parseFloat(feetInchesMatch[1]);
    const inches = parseFloat(feetInchesMatch[2]);
    return Math.round((feet * 30.48) + (inches * 2.54));
  }
  
  // Handle only feet (e.g., "5.5ft", "5 feet")
  const feetOnlyMatch = input.match(/(\d+(?:\.\d+)?)\s*(?:ft|feet|')/);
  if (feetOnlyMatch) {
    const feet = parseFloat(feetOnlyMatch[1]);
    return Math.round(feet * 30.48);
  }
  
  // Handle only inches (e.g., "67in", "67 inches")
  const inchesMatch = input.match(/(\d+(?:\.\d+)?)\s*(?:in|inches|")/);
  if (inchesMatch) {
    const inches = parseFloat(inchesMatch[1]);
    return Math.round(inches * 2.54);
  }
  
  // Handle centimeters (e.g., "170cm", "170 cm")
  const cmMatch = input.match(/(\d+(?:\.\d+)?)\s*cm/);
  if (cmMatch) {
    return Math.round(parseFloat(cmMatch[1]));
  }
  
  // Handle meters (e.g., "1.75m", "1.75 m")
  const mMatch = input.match(/(\d+(?:\.\d+)?)\s*m/);
  if (mMatch) {
    return Math.round(parseFloat(mMatch[1]) * 100);
  }
  
  // Handle plain numbers (assume cm if > 50, otherwise assume feet)
  const numberMatch = input.match(/^(\d+(?:\.\d+)?)$/);
  if (numberMatch) {
    const num = parseFloat(numberMatch[1]);
    if (num > 50) {
      return Math.round(num); // Assume centimeters
    } else {
      return Math.round(num * 30.48); // Assume feet
    }
  }
  
  throw new Error(`Unable to parse height: ${heightInput}`);
}

export async function POST(request: NextRequest) {
  try {
    const { dietPlanType, formData } = await request.json();
    
    if (!dietPlanType || !formData) {
      return NextResponse.json(
        { error: 'Diet plan type and form data are required' },
        { status: 400 }
      );
    }

    // Parse height to centimeters for consistent processing
    let heightInCm: number;
    try {
      heightInCm = parseHeightToCm(formData.height);
    } catch (error) {
      return NextResponse.json(
        { error: `Invalid height format. Please use formats like "5ft 7in", "170cm", "67in", or "1.75m"` },
        { status: 400 }
      );
    }

    // Convert weight to kg if needed
    let weightInKg = parseFloat(formData.weight);
    if (formData.weight_unit === 'lbs') {
      weightInKg = weightInKg * 0.453592;
    }

    // Use modular prompt builder
    const prompt = buildDietPrompt(dietPlanType, formData as DietFormData, heightInCm, weightInKg);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiResponse = response.text();
    
    if (!aiResponse) {
      throw new Error('No response from Google AI');
    }

    // Clean and parse the JSON response (remove markdown formatting)
    let cleanResponse = aiResponse
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .replace(/[""]/g, '"') // smart quotes to normal
      .replace(/,\s*([}\]])/g, '$1') // remove trailing commas
      .trim();
    
    // Log the cleaned response for debugging
    console.log('Cleaned AI response:', cleanResponse);
    
    let analysis;
    try {
      analysis = JSON.parse(cleanResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', cleanResponse);
      return NextResponse.json(
        { error: 'Failed to generate proper diet plan. Please try again.' },
        { status: 500 }
      );
    }

    // Validate that we have the required structure
    if (!analysis.daily_meal_plan) {
      console.error('Invalid meal plan structure:', analysis);
      return NextResponse.json(
        { error: 'Generated diet plan is missing daily meal plan data. Please try again.' },
        { status: 500 }
      );
    }

    // Save to MongoDB for audit trail
    try {
      const client = await clientPromise;
      const db = client.db('ai-toolbox');
      const collection = db.collection('diet-plans');
      
      await collection.insertOne({
        dietPlanType,
        formData: {
          ...formData,
          height_cm: heightInCm,
          weight_kg: weightInKg
        },
        analysis,
        createdAt: new Date(),
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      });
    } catch (dbError) {
      console.error('Database save error:', dbError);
      // Continue without failing the request
    }

    return NextResponse.json({
      success: true,
      analysis
    });

  } catch (error) {
    console.error('Diet Analysis API Error:', error);
    
    return NextResponse.json({
      success: false,
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'AI service temporarily unavailable'
    }, { status: 500 });
  }
} 
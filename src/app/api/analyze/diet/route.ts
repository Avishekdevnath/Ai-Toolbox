import { NextRequest, NextResponse } from 'next/server';
import { generateGeminiResponse } from '@/lib/gemini';
import { buildDietPrompt } from '@/lib/dietPromptBuilder';
import { parseAIResponse } from '@/lib/utils';

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

export async function POST(req: NextRequest) {
  try {
    const { dietPlanType, formData } = await req.json();

    if (!dietPlanType || !formData) {
      return NextResponse.json(
        { error: 'Missing required fields: dietPlanType and formData' },
        { status: 400 }
      );
    }

    const prompt = buildDietPrompt(dietPlanType, formData);
    
    const aiResult = await generateGeminiResponse(prompt);
    
    if (!aiResult.success || !aiResult.text) {
      return NextResponse.json(
        { error: aiResult.error || 'No response from AI service' },
        { status: 500 }
      );
    }

    let analysis;
    try {
      analysis = parseAIResponse(aiResult.text);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      
      // Generate a fallback diet plan structure
      const fallbackPlan = generateFallbackDietPlan(dietPlanType, formData);
      
      return NextResponse.json({
        success: true,
        analysis: fallbackPlan,
        note: 'Generated fallback plan due to AI response parsing issues'
      });
    }

    return NextResponse.json({
      success: true,
      analysis
    });

  } catch (error) {
    console.error('Diet analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to generate diet plan' },
      { status: 500 }
    );
  }
}

function generateFallbackDietPlan(dietPlanType: string, formData: any) {
  const planName = dietPlanType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  return {
    diet_plan: {
      name: `Personalized ${planName} Diet Plan`,
      description: `A comprehensive ${planName.toLowerCase()} diet plan tailored for ${formData.name}`,
      daily_calories: 2000,
      macronutrients: {
        protein: "150g",
        carbs: "200g",
        fat: "67g"
      },
      meals: [
        {
          meal: "Breakfast",
          time: "8:00 AM",
          foods: [
            {
              name: "Oatmeal with berries and nuts",
              quantity: "1 cup",
              calories: 350,
              protein: "12g",
              carbs: "60g",
              fat: "8g"
            }
          ],
          total_calories: 350,
          notes: "Start your day with this nutritious breakfast"
        },
        {
          meal: "Lunch",
          time: "12:30 PM",
          foods: [
            {
              name: "Grilled chicken salad",
              quantity: "1 large bowl",
              calories: 450,
              protein: "35g",
              carbs: "25g",
              fat: "22g"
            }
          ],
          total_calories: 450,
          notes: "Protein-rich lunch to keep you energized"
        },
        {
          meal: "Dinner",
          time: "7:00 PM",
          foods: [
            {
              name: "Salmon with vegetables",
              quantity: "1 serving",
              calories: 550,
              protein: "40g",
              carbs: "30g",
              fat: "25g"
            }
          ],
          total_calories: 550,
          notes: "Light dinner with healthy fats and protein"
        }
      ],
      supplements: [
        {
          name: "Multivitamin",
          dosage: "1 tablet daily",
          timing: "With breakfast",
          purpose: "General health support"
        }
      ],
      hydration: {
        daily_water: "8-10 glasses",
        additional_fluids: "Herbal tea, coconut water"
      },
      exercise_recommendations: {
        frequency: "3-4 times per week",
        duration: "30-45 minutes",
        types: ["Cardio", "Strength training"]
      },
      tips: [
        "Eat slowly and mindfully",
        "Stay hydrated throughout the day",
        "Plan meals in advance",
        "Listen to your body's hunger cues"
      ]
    }
  };
} 
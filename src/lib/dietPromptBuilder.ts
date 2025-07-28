import { DietFormData } from '@/schemas/aiAnalysisSchema';

function getDietSpecificPrompt(dietPlanType: string, formData: DietFormData): string {
  switch (dietPlanType) {
    case 'general':
      return `Goal: ${formData.goal || 'Not specified'}
Activity Level: ${formData.activity_level || 'Not specified'}
Dietary Restrictions: ${formData.dietary_restrictions || 'None specified'}
Health Conditions: ${formData.health_conditions || 'None specified'}`;

    case 'weight-loss':
      return `Target Weight: ${formData.target_weight || 'Not specified'} ${formData.weight_unit || 'kg'}
Timeline: ${formData.timeline || 'Not specified'} weeks
Activity Level: ${formData.activity_level || 'Not specified'}
Previous Diets: ${formData.previous_diets || 'None specified'}`;

    case 'muscle-gain':
      return `Training Frequency: ${formData.training_frequency || 'Not specified'}
Muscle Goals: ${formData.muscle_goals || 'Not specified'}
Activity Level: ${formData.activity_level || 'Not specified'}`;

    case 'keto':
      return `Keto Experience: ${formData.keto_experience || 'Not specified'}
Carb Preference: ${formData.carb_preference || 'Not specified'}
Activity Level: ${formData.activity_level || 'Not specified'}`;

    case 'vegan':
      return `Vegan Duration: ${formData.vegan_duration || 'Not specified'}
Protein Concerns: ${formData.protein_concerns || 'Not specified'}
Supplement Preferences: ${formData.supplement_preferences || 'None specified'}`;

    case 'diabetes':
      return `Diabetes Type: ${formData.diabetes_type || 'Not specified'}
Medication: ${formData.medication || 'Not specified'}
Blood Sugar Targets: ${formData.blood_sugar_targets || 'Not specified'}`;

    case 'heart-healthy':
      return `Heart Condition: ${formData.heart_condition || 'Not specified'}
Activity Level: ${formData.activity_level || 'Not specified'}
Cholesterol Levels: ${formData.cholesterol_levels || 'Not specified'}
Blood Pressure: ${formData.blood_pressure || 'Not specified'}`;

    case 'athletic':
      return `Sport Type: ${formData.sport_type || 'Not specified'}
Training Schedule: ${formData.training_schedule || 'Not specified'}
Competition Goals: ${formData.competition_goals || 'Not specified'}`;

    default:
      return 'General nutrition plan';
  }
}

export function buildDietPrompt(dietPlanType: string, formData: DietFormData): string {
  const basePrompt = `You are a professional nutritionist and dietitian. Create a personalized ${dietPlanType.replace('-', ' ')} diet plan based on the following information:

Name: ${formData.name}
Age: ${formData.age} years
Gender: ${formData.gender}
Weight: ${formData.weight} ${formData.weight_unit || 'kg'}
Height: ${formData.height}

${getDietSpecificPrompt(dietPlanType, formData)}

IMPORTANT: You must respond with ONLY a valid JSON object. Do not include any explanations, markdown formatting, or additional text outside the JSON.

The JSON must follow this exact structure and all string values must be properly quoted with double quotes:

{
  "diet_plan": {
    "name": "Personalized ${dietPlanType.replace('-', ' ')} Diet Plan",
    "description": "A comprehensive diet plan tailored to your specific needs and goals",
    "daily_calories": 2000,
    "macronutrients": {
      "protein": "150g",
      "carbs": "200g", 
      "fat": "67g"
    },
    "meals": [
      {
        "meal": "Breakfast",
        "time": "8:00 AM",
        "foods": [
          {
            "name": "Oatmeal with berries",
            "quantity": "1 cup",
            "calories": 300,
            "protein": "12g",
            "carbs": "54g",
            "fat": "6g"
          }
        ],
        "total_calories": 300,
        "notes": "Start your day with this nutritious breakfast"
      }
    ],
    "supplements": [
      {
        "name": "Multivitamin",
        "dosage": "1 tablet daily",
        "timing": "With breakfast",
        "purpose": "General health support"
      }
    ],
    "hydration": {
      "daily_water": "8-10 glasses",
      "additional_fluids": "Herbal tea, coconut water"
    },
    "exercise_recommendations": {
      "frequency": "3-4 times per week",
      "duration": "30-45 minutes",
      "types": ["Cardio", "Strength training"]
    },
    "tips": [
      "Eat slowly and mindfully",
      "Stay hydrated throughout the day",
      "Plan meals in advance"
    ]
  }
}

CRITICAL: Ensure all string values are properly quoted with double quotes. Do not use single quotes or leave values unquoted. The JSON must be syntactically valid and parseable.`;

  return basePrompt;
}

// Helper function to get BMI category
function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
} 
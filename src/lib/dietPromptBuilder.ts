export interface DietFormData {
  name: string;
  age: string;
  gender?: string;
  height: string;
  weight: string;
  weight_unit?: string;
  activity_level: string;
  goal?: string;
  dietary_restrictions?: string;
  health_conditions?: string;
  target_weight?: string;
  timeline?: string;
  previous_diets?: string;
  training_frequency?: string;
  current_body_fat?: string;
  muscle_goals?: string;
  keto_experience?: string;
  carb_preference?: string;
  vegan_duration?: string;
  protein_concerns?: string;
  supplement_preferences?: string;
  diabetes_type?: string;
  medication?: string;
  blood_sugar_targets?: string;
  heart_condition?: string;
  cholesterol_levels?: string;
  blood_pressure?: string;
  sport_type?: string;
  competition_goals?: string;
  training_schedule?: string;
}

export function buildDietPrompt(dietPlanType: string, formData: DietFormData, heightInCm: number, weightInKg: number): string {
  // Calculate BMI and BMR
  const heightInM = heightInCm / 100;
  const bmi = weightInKg / (heightInM * heightInM);
  
  // Calculate BMR using Mifflin-St Jeor Equation
  let bmr: number;
  if (formData.gender === 'male') {
    bmr = (10 * weightInKg) + (6.25 * heightInCm) - (5 * parseInt(formData.age)) + 5;
  } else if (formData.gender === 'female') {
    bmr = (10 * weightInKg) + (6.25 * heightInCm) - (5 * parseInt(formData.age)) - 161;
  } else {
    // Use average of male and female calculation
    const maleBmr = (10 * weightInKg) + (6.25 * heightInCm) - (5 * parseInt(formData.age)) + 5;
    const femaleBmr = (10 * weightInKg) + (6.25 * heightInCm) - (5 * parseInt(formData.age)) - 161;
    bmr = (maleBmr + femaleBmr) / 2;
  }

  const basePrompt = "You are a certified nutritionist and registered dietitian with 15+ years of experience. ";
  let prompt = '';
  
  switch (dietPlanType) {
    case 'general':
      prompt = `${basePrompt}Create a comprehensive general nutrition and fitness plan for:\n\nName: ${formData.name}\nAge: ${formData.age} years\nGender: ${formData.gender || 'Not specified'}\nHeight: ${heightInCm}cm (${heightInM.toFixed(2)}m)\nWeight: ${weightInKg.toFixed(1)}kg\nBMI: ${bmi.toFixed(1)} (${getBMICategory(bmi)})\nBMR: ${bmr.toFixed(0)} calories/day\nActivity Level: ${formData.activity_level}\nPrimary Goal: ${formData.goal}\nDietary Restrictions: ${formData.dietary_restrictions || 'None'}\nHealth Conditions: ${formData.health_conditions || 'None'}\n\nCreate a balanced nutrition and fitness plan focusing on overall health, wellness, and achieving the stated goal.`;
      break;
    case 'weight-loss':
      prompt = `${basePrompt}Create a comprehensive weight loss nutrition and fitness plan for:\n\nName: ${formData.name}\nAge: ${formData.age} years\nGender: ${formData.gender || 'Not specified'}\nHeight: ${heightInCm}cm (${heightInM.toFixed(2)}m)\nCurrent Weight: ${weightInKg.toFixed(1)}kg\nTarget Weight: ${formData.target_weight}kg\nBMI: ${bmi.toFixed(1)} (${getBMICategory(bmi)})\nBMR: ${bmr.toFixed(0)} calories/day\nTimeline: ${formData.timeline} weeks\nActivity Level: ${formData.activity_level}\nPrevious Diet Experience: ${formData.previous_diets || 'None specified'}\nDietary Restrictions: ${formData.dietary_restrictions || 'None'}\n\nCreate a sustainable, healthy weight loss plan with realistic calorie deficits, balanced nutrition, and effective exercise routines.`;
      break;
    case 'muscle-gain':
      prompt = `${basePrompt}Create a comprehensive muscle building nutrition and fitness plan for:\n\nName: ${formData.name}\nAge: ${formData.age} years\nGender: ${formData.gender || 'Not specified'}\nHeight: ${heightInCm}cm (${heightInM.toFixed(2)}m)\nWeight: ${weightInKg.toFixed(1)}kg\nBMI: ${bmi.toFixed(1)} (${getBMICategory(bmi)})\nBMR: ${bmr.toFixed(0)} calories/day\nTraining Frequency: ${formData.training_frequency}\nCurrent Body Fat: ${formData.current_body_fat || 'Not specified'}%\nMuscle Goals: ${formData.muscle_goals}\nActivity Level: ${formData.activity_level}\nDietary Restrictions: ${formData.dietary_restrictions || 'None'}\n\nCreate a high-protein nutrition plan and strength training routine optimized for muscle growth, recovery, and strength gains.`;
      break;
    case 'keto':
      prompt = `${basePrompt}Create a comprehensive ketogenic diet and fitness plan for:\n\nName: ${formData.name}\nAge: ${formData.age} years\nGender: ${formData.gender || 'Not specified'}\nHeight: ${heightInCm}cm (${heightInM.toFixed(2)}m)\nWeight: ${weightInKg.toFixed(1)}kg\nBMI: ${bmi.toFixed(1)} (${getBMICategory(bmi)})\nBMR: ${bmr.toFixed(0)} calories/day\nKeto Experience: ${formData.keto_experience}\nCarb Preference: ${formData.carb_preference}\nActivity Level: ${formData.activity_level}\nDietary Restrictions: ${formData.dietary_restrictions || 'None'}\n\nCreate a proper ketogenic diet plan with very low carbs (5-10%), high fat (70-80%), moderate protein (15-25%), and keto-friendly exercise routines.`;
      break;
    case 'vegan':
      prompt = `${basePrompt}Create a comprehensive plant-based vegan nutrition and fitness plan for:\n\nName: ${formData.name}\nAge: ${formData.age} years\nGender: ${formData.gender || 'Not specified'}\nHeight: ${heightInCm}cm (${heightInM.toFixed(2)}m)\nWeight: ${weightInKg.toFixed(1)}kg\nBMI: ${bmi.toFixed(1)} (${getBMICategory(bmi)})\nBMR: ${bmr.toFixed(0)} calories/day\nVegan Duration: ${formData.vegan_duration}\nProtein Concerns: ${formData.protein_concerns}\nSupplement Preferences: ${formData.supplement_preferences || 'Open to suggestions'}\nActivity Level: ${formData.activity_level}\nAdditional Restrictions: ${formData.dietary_restrictions || 'None beyond vegan'}\n\nCreate a complete vegan nutrition plan ensuring adequate B12, iron, protein, and all essential nutrients, plus plant-based fitness routines.`;
      break;
    case 'diabetes':
      prompt = `${basePrompt}Create a comprehensive diabetes-friendly nutrition and fitness plan for:\n\nName: ${formData.name}\nAge: ${formData.age} years\nGender: ${formData.gender || 'Not specified'}\nHeight: ${heightInCm}cm (${heightInM.toFixed(2)}m)\nWeight: ${weightInKg.toFixed(1)}kg\nBMI: ${bmi.toFixed(1)} (${getBMICategory(bmi)})\nBMR: ${bmr.toFixed(0)} calories/day\nDiabetes Type: ${formData.diabetes_type}\nCurrent Medication: ${formData.medication}\nBlood Sugar Targets: ${formData.blood_sugar_targets || 'Standard ADA guidelines'}\nActivity Level: ${formData.activity_level}\nAdditional Restrictions: ${formData.dietary_restrictions || 'None'}\n\nCreate a blood sugar-friendly nutrition plan with proper carb counting, glycemic index considerations, meal timing, and diabetes-safe exercise routines.`;
      break;
    case 'heart-healthy':
      prompt = `${basePrompt}Create a comprehensive heart-healthy nutrition and fitness plan for:\n\nName: ${formData.name}\nAge: ${formData.age} years\nGender: ${formData.gender || 'Not specified'}\nHeight: ${heightInCm}cm (${heightInM.toFixed(2)}m)\nWeight: ${weightInKg.toFixed(1)}kg\nBMI: ${bmi.toFixed(1)} (${getBMICategory(bmi)})\nBMR: ${bmr.toFixed(0)} calories/day\nHeart Condition: ${formData.heart_condition}\nCholesterol Levels: ${formData.cholesterol_levels || 'Not specified'}\nBlood Pressure: ${formData.blood_pressure || 'Not specified'}\nActivity Level: ${formData.activity_level}\nAdditional Restrictions: ${formData.dietary_restrictions || 'None'}\n\nCreate a cardiovascular-friendly nutrition plan focusing on heart health, cholesterol management, blood pressure control, and heart-safe exercise routines.`;
      break;
    case 'athletic':
      prompt = `${basePrompt}Create a comprehensive athletic performance nutrition and fitness plan for:\n\nName: ${formData.name}\nAge: ${formData.age} years\nGender: ${formData.gender || 'Not specified'}\nHeight: ${heightInCm}cm (${heightInM.toFixed(2)}m)\nWeight: ${weightInKg.toFixed(1)}kg\nBMI: ${bmi.toFixed(1)} (${getBMICategory(bmi)})\nBMR: ${bmr.toFixed(0)} calories/day\nSport Type: ${formData.sport_type}\nCompetition Goals: ${formData.competition_goals || 'Performance improvement'}\nTraining Schedule: ${formData.training_schedule}\nActivity Level: Very Active to Extra Active\nAdditional Restrictions: ${formData.dietary_restrictions || 'None'}\n\nCreate a performance-optimized nutrition plan with proper pre/post workout nutrition, hydration, energy optimization, and sport-specific training routines.`;
      break;
    default:
      prompt = `${basePrompt}Create a comprehensive nutrition and fitness plan based on the provided information.`;
  }

  return `${prompt}\n\nPlease provide a comprehensive and detailed nutrition and fitness analysis with:\n\n1. Daily calorie requirements based on their goals and BMR\n2. Detailed macro breakdown (protein, carbs, fat percentages)\n3. A complete daily meal plan with specific meals for breakfast, lunch, dinner, and 2 snacks\n4. A daily exercise routine with specific exercises, sets, reps, and timing\n5. BMI analysis and health implications\n6. BMR explanation and daily calorie needs\n7. Nutritional recommendations specific to their plan type\n8. Lifestyle and wellness tips\n9. Hydration guidelines\n10. Progress tracking suggestions\n\nFormat the response as a JSON object with this exact structure:\n{\n  "bmi_analysis": {\n    "bmi_value": ${bmi.toFixed(1)},\n    "bmi_category": "${getBMICategory(bmi)}",\n    "health_implications": "detailed health implications of current BMI",\n    "recommendations": "specific recommendations based on BMI"\n  },\n  "bmr_analysis": {\n    "bmr_value": ${bmr.toFixed(0)},\n    "daily_calorie_needs": "explanation of daily calorie requirements",\n    "activity_multiplier": "how activity level affects calorie needs"\n  },\n  "daily_calories": number,\n  "macros": {\n    "protein": "X%",\n    "carbs": "X%", \n    "fat": "X%"\n  },\n  "daily_meal_plan": {\n    "breakfast": "meal description with portions and calories",\n    "lunch": "meal description with portions and calories", \n    "dinner": "meal description with portions and calories",\n    "snack1": "snack description with calories",\n    "snack2": "snack description with calories",\n    "total_calories": number\n  },\n  "daily_exercise_routine": {\n    "morning": [\n      {\n        "exercise": "exercise name",\n        "sets": number,\n        "reps": "number or duration",\n        "time": "estimated time in minutes",\n        "notes": "form tips or modifications"\n      }\n    ],\n    "afternoon": [\n      {\n        "exercise": "exercise name",\n        "sets": number,\n        "reps": "number or duration",\n        "time": "estimated time in minutes",\n        "notes": "form tips or modifications"\n      }\n    ],\n    "evening": [\n      {\n        "exercise": "exercise name",\n        "sets": number,\n        "reps": "number or duration",\n        "time": "estimated time in minutes",\n        "notes": "form tips or modifications"\n      }\n    ],\n    "total_exercise_time": "total minutes per day",\n    "rest_days": "which days to rest and why"\n  },\n  "nutritional_recommendations": [\n    "recommendation 1",\n    "recommendation 2",\n    "recommendation 3",\n    "recommendation 4",\n    "recommendation 5"\n  ],\n  "lifestyle_tips": [\n    "tip 1", \n    "tip 2",\n    "tip 3",\n    "tip 4"\n  ],\n  "hydration_guidelines": "detailed hydration advice",\n  "progress_tracking": [\n    "tracking method 1",\n    "tracking method 2",\n    "tracking method 3"\n  ],\n  "notes": "Important considerations and disclaimers specific to this diet plan type"\n}\n\nMake sure the meal plan, exercise routine, and recommendations are specifically tailored to the ${dietPlanType} plan type and the individual's specific needs and goals.\n\nReturn only the JSON, no additional text.`;
}

// Helper function to get BMI category
function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
} 
// Comprehensive Nutritional Database
export interface FoodItem {
  id: string;
  name: string;
  category: 'protein' | 'carbohydrate' | 'fat' | 'vegetable' | 'fruit' | 'dairy' | 'grain' | 'nut' | 'seed' | 'spice' | 'beverage';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  potassium: number;
  vitamin_c: number;
  vitamin_d: number;
  calcium: number;
  iron: number;
  glycemic_index?: number;
  serving_size: string;
  dietary_flags: string[]; // 'vegan', 'gluten-free', 'keto-friendly', etc.
}

export interface MealTemplate {
  id: string;
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  diet_types: string[]; // 'general', 'weight-loss', 'muscle-gain', etc.
  foods: Array<{
    food: FoodItem;
    quantity: number;
    unit: string;
  }>;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  instructions: string;
  prep_time: number; // minutes
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface NutritionalProfile {
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number; // cm
  weight: number; // kg
  activity_level: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';
  goal: 'maintain' | 'lose' | 'gain';
  target_weight?: number;
  diet_type: string;
  dietary_restrictions: string[];
}

// Core food database with essential items
export const FOOD_DATABASE: FoodItem[] = [
  // Proteins
  {
    id: 'chicken_breast',
    name: 'Chicken Breast',
    category: 'protein',
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    fiber: 0,
    sugar: 0,
    sodium: 74,
    potassium: 256,
    vitamin_c: 0,
    vitamin_d: 0,
    calcium: 15,
    iron: 1,
    serving_size: '100g',
    dietary_flags: ['gluten-free', 'keto-friendly']
  },
  {
    id: 'salmon',
    name: 'Salmon',
    category: 'protein',
    calories: 208,
    protein: 25,
    carbs: 0,
    fat: 12,
    fiber: 0,
    sugar: 0,
    sodium: 59,
    potassium: 363,
    vitamin_c: 0,
    vitamin_d: 11.1,
    calcium: 9,
    iron: 0.3,
    serving_size: '100g',
    dietary_flags: ['gluten-free', 'keto-friendly', 'omega-3']
  },
  {
    id: 'eggs',
    name: 'Eggs',
    category: 'protein',
    calories: 155,
    protein: 13,
    carbs: 1.1,
    fat: 11,
    fiber: 0,
    sugar: 1.1,
    sodium: 124,
    potassium: 126,
    vitamin_c: 0,
    vitamin_d: 2,
    calcium: 56,
    iron: 1.8,
    serving_size: '100g (2 large eggs)',
    dietary_flags: ['gluten-free', 'keto-friendly']
  },
  {
    id: 'tofu',
    name: 'Tofu',
    category: 'protein',
    calories: 76,
    protein: 8,
    carbs: 1.9,
    fat: 4.8,
    fiber: 0.3,
    sugar: 0.6,
    sodium: 7,
    potassium: 121,
    vitamin_c: 0,
    vitamin_d: 0,
    calcium: 350,
    iron: 2.7,
    serving_size: '100g',
    dietary_flags: ['vegan', 'gluten-free', 'keto-friendly']
  },
  {
    id: 'greek_yogurt',
    name: 'Greek Yogurt',
    category: 'dairy',
    calories: 59,
    protein: 10,
    carbs: 3.6,
    fat: 0.4,
    fiber: 0,
    sugar: 3.2,
    sodium: 36,
    potassium: 141,
    vitamin_c: 0,
    vitamin_d: 0,
    calcium: 110,
    iron: 0.1,
    serving_size: '100g',
    dietary_flags: ['gluten-free', 'keto-friendly']
  },

  // Carbohydrates
  {
    id: 'brown_rice',
    name: 'Brown Rice',
    category: 'grain',
    calories: 111,
    protein: 2.6,
    carbs: 23,
    fat: 0.9,
    fiber: 1.8,
    sugar: 0.4,
    sodium: 5,
    potassium: 43,
    vitamin_c: 0,
    vitamin_d: 0,
    calcium: 10,
    iron: 0.4,
    glycemic_index: 68,
    serving_size: '100g cooked',
    dietary_flags: ['vegan', 'gluten-free']
  },
  {
    id: 'quinoa',
    name: 'Quinoa',
    category: 'grain',
    calories: 120,
    protein: 4.4,
    carbs: 22,
    fat: 1.9,
    fiber: 2.8,
    sugar: 0.9,
    sodium: 7,
    potassium: 172,
    vitamin_c: 0,
    vitamin_d: 0,
    calcium: 17,
    iron: 1.5,
    glycemic_index: 53,
    serving_size: '100g cooked',
    dietary_flags: ['vegan', 'gluten-free']
  },
  {
    id: 'sweet_potato',
    name: 'Sweet Potato',
    category: 'carbohydrate',
    calories: 86,
    protein: 1.6,
    carbs: 20,
    fat: 0.1,
    fiber: 3,
    sugar: 4.2,
    sodium: 55,
    potassium: 337,
    vitamin_c: 2.4,
    vitamin_d: 0,
    calcium: 30,
    iron: 0.6,
    glycemic_index: 44,
    serving_size: '100g',
    dietary_flags: ['vegan', 'gluten-free']
  },
  {
    id: 'oats',
    name: 'Oats',
    category: 'grain',
    calories: 389,
    protein: 17,
    carbs: 66,
    fat: 7,
    fiber: 10,
    sugar: 1,
    sodium: 2,
    potassium: 429,
    vitamin_c: 0,
    vitamin_d: 0,
    calcium: 54,
    iron: 4.7,
    glycemic_index: 55,
    serving_size: '100g dry',
    dietary_flags: ['vegan', 'gluten-free']
  },

  // Fats
  {
    id: 'avocado',
    name: 'Avocado',
    category: 'fat',
    calories: 160,
    protein: 2,
    carbs: 9,
    fat: 15,
    fiber: 7,
    sugar: 0.7,
    sodium: 7,
    potassium: 485,
    vitamin_c: 10,
    vitamin_d: 0,
    calcium: 12,
    iron: 0.6,
    serving_size: '100g',
    dietary_flags: ['vegan', 'gluten-free', 'keto-friendly']
  },
  {
    id: 'almonds',
    name: 'Almonds',
    category: 'nut',
    calories: 579,
    protein: 21,
    carbs: 22,
    fat: 50,
    fiber: 12,
    sugar: 4.4,
    sodium: 1,
    potassium: 733,
    vitamin_c: 0,
    vitamin_d: 0,
    calcium: 269,
    iron: 3.7,
    serving_size: '100g',
    dietary_flags: ['vegan', 'gluten-free', 'keto-friendly']
  },
  {
    id: 'olive_oil',
    name: 'Olive Oil',
    category: 'fat',
    calories: 884,
    protein: 0,
    carbs: 0,
    fat: 100,
    fiber: 0,
    sugar: 0,
    sodium: 2,
    potassium: 1,
    vitamin_c: 0,
    vitamin_d: 0,
    calcium: 1,
    iron: 0.6,
    serving_size: '100g',
    dietary_flags: ['vegan', 'gluten-free', 'keto-friendly']
  },

  // Vegetables
  {
    id: 'broccoli',
    name: 'Broccoli',
    category: 'vegetable',
    calories: 34,
    protein: 2.8,
    carbs: 7,
    fat: 0.4,
    fiber: 2.6,
    sugar: 1.5,
    sodium: 33,
    potassium: 316,
    vitamin_c: 89.2,
    vitamin_d: 0,
    calcium: 47,
    iron: 0.7,
    serving_size: '100g',
    dietary_flags: ['vegan', 'gluten-free', 'keto-friendly']
  },
  {
    id: 'spinach',
    name: 'Spinach',
    category: 'vegetable',
    calories: 23,
    protein: 2.9,
    carbs: 3.6,
    fat: 0.4,
    fiber: 2.2,
    sugar: 0.4,
    sodium: 79,
    potassium: 558,
    vitamin_c: 28.1,
    vitamin_d: 0,
    calcium: 99,
    iron: 2.7,
    serving_size: '100g',
    dietary_flags: ['vegan', 'gluten-free', 'keto-friendly']
  },
  {
    id: 'bell_pepper',
    name: 'Bell Pepper',
    category: 'vegetable',
    calories: 31,
    protein: 1,
    carbs: 7,
    fat: 0.3,
    fiber: 2.1,
    sugar: 4.2,
    sodium: 4,
    potassium: 211,
    vitamin_c: 127.7,
    vitamin_d: 0,
    calcium: 10,
    iron: 0.4,
    serving_size: '100g',
    dietary_flags: ['vegan', 'gluten-free', 'keto-friendly']
  },

  // Fruits
  {
    id: 'banana',
    name: 'Banana',
    category: 'fruit',
    calories: 89,
    protein: 1.1,
    carbs: 23,
    fat: 0.3,
    fiber: 2.6,
    sugar: 12,
    sodium: 1,
    potassium: 358,
    vitamin_c: 8.7,
    vitamin_d: 0,
    calcium: 5,
    iron: 0.3,
    glycemic_index: 51,
    serving_size: '100g',
    dietary_flags: ['vegan', 'gluten-free']
  },
  {
    id: 'blueberries',
    name: 'Blueberries',
    category: 'fruit',
    calories: 57,
    protein: 0.7,
    carbs: 14,
    fat: 0.3,
    fiber: 2.4,
    sugar: 10,
    sodium: 1,
    potassium: 77,
    vitamin_c: 9.7,
    vitamin_d: 0,
    calcium: 6,
    iron: 0.3,
    glycemic_index: 53,
    serving_size: '100g',
    dietary_flags: ['vegan', 'gluten-free']
  },
  {
    id: 'apple',
    name: 'Apple',
    category: 'fruit',
    calories: 52,
    protein: 0.3,
    carbs: 14,
    fat: 0.2,
    fiber: 2.4,
    sugar: 10,
    sodium: 1,
    potassium: 107,
    vitamin_c: 4.6,
    vitamin_d: 0,
    calcium: 6,
    iron: 0.1,
    glycemic_index: 36,
    serving_size: '100g',
    dietary_flags: ['vegan', 'gluten-free']
  }
];

// Meal templates for different diet types
export const MEAL_TEMPLATES: MealTemplate[] = [
  // Breakfast templates
  {
    id: 'protein_breakfast',
    name: 'Protein-Packed Breakfast',
    type: 'breakfast',
    diet_types: ['general', 'muscle-gain', 'weight-loss'],
    foods: [
      { food: FOOD_DATABASE.find(f => f.id === 'eggs')!, quantity: 2, unit: 'large' },
      { food: FOOD_DATABASE.find(f => f.id === 'oats')!, quantity: 50, unit: 'g' },
      { food: FOOD_DATABASE.find(f => f.id === 'blueberries')!, quantity: 30, unit: 'g' },
      { food: FOOD_DATABASE.find(f => f.id === 'almonds')!, quantity: 15, unit: 'g' }
    ],
    total_calories: 420,
    total_protein: 25,
    total_carbs: 45,
    total_fat: 18,
    instructions: 'Cook eggs to preference. Cook oats with water, top with berries and almonds.',
    prep_time: 15,
    difficulty: 'easy'
  },
  {
    id: 'keto_breakfast',
    name: 'Keto Breakfast Bowl',
    type: 'breakfast',
    diet_types: ['keto'],
    foods: [
      { food: FOOD_DATABASE.find(f => f.id === 'eggs')!, quantity: 3, unit: 'large' },
      { food: FOOD_DATABASE.find(f => f.id === 'avocado')!, quantity: 50, unit: 'g' },
      { food: FOOD_DATABASE.find(f => f.id === 'spinach')!, quantity: 30, unit: 'g' },
      { food: FOOD_DATABASE.find(f => f.id === 'olive_oil')!, quantity: 10, unit: 'g' }
    ],
    total_calories: 380,
    total_protein: 22,
    total_carbs: 8,
    total_fat: 32,
    instructions: 'Scramble eggs with spinach, serve with sliced avocado and drizzle with olive oil.',
    prep_time: 10,
    difficulty: 'easy'
  },
  {
    id: 'vegan_breakfast',
    name: 'Vegan Power Breakfast',
    type: 'breakfast',
    diet_types: ['vegan', 'general'],
    foods: [
      { food: FOOD_DATABASE.find(f => f.id === 'tofu')!, quantity: 100, unit: 'g' },
      { food: FOOD_DATABASE.find(f => f.id === 'quinoa')!, quantity: 60, unit: 'g' },
      { food: FOOD_DATABASE.find(f => f.id === 'bell_pepper')!, quantity: 50, unit: 'g' },
      { food: FOOD_DATABASE.find(f => f.id === 'spinach')!, quantity: 30, unit: 'g' }
    ],
    total_calories: 280,
    total_protein: 18,
    total_carbs: 35,
    total_fat: 8,
    instructions: 'Cook quinoa, scramble tofu with vegetables, combine and season.',
    prep_time: 20,
    difficulty: 'medium'
  },

  // Lunch templates
  {
    id: 'balanced_lunch',
    name: 'Balanced Lunch Bowl',
    type: 'lunch',
    diet_types: ['general', 'weight-loss', 'muscle-gain'],
    foods: [
      { food: FOOD_DATABASE.find(f => f.id === 'chicken_breast')!, quantity: 120, unit: 'g' },
      { food: FOOD_DATABASE.find(f => f.id === 'brown_rice')!, quantity: 80, unit: 'g' },
      { food: FOOD_DATABASE.find(f => f.id === 'broccoli')!, quantity: 100, unit: 'g' },
      { food: FOOD_DATABASE.find(f => f.id === 'olive_oil')!, quantity: 8, unit: 'g' }
    ],
    total_calories: 450,
    total_protein: 42,
    total_carbs: 45,
    total_fat: 15,
    instructions: 'Grill chicken, cook rice, steam broccoli, combine with olive oil.',
    prep_time: 25,
    difficulty: 'easy'
  },
  {
    id: 'diabetes_lunch',
    name: 'Diabetes-Friendly Lunch',
    type: 'lunch',
    diet_types: ['diabetes', 'heart-healthy'],
    foods: [
      { food: FOOD_DATABASE.find(f => f.id === 'salmon')!, quantity: 100, unit: 'g' },
      { food: FOOD_DATABASE.find(f => f.id === 'quinoa')!, quantity: 60, unit: 'g' },
      { food: FOOD_DATABASE.find(f => f.id === 'spinach')!, quantity: 50, unit: 'g' },
      { food: FOOD_DATABASE.find(f => f.id === 'bell_pepper')!, quantity: 40, unit: 'g' }
    ],
    total_calories: 380,
    total_protein: 32,
    total_carbs: 28,
    total_fat: 18,
    instructions: 'Bake salmon, cook quinoa, sauté vegetables, combine.',
    prep_time: 30,
    difficulty: 'medium'
  },

  // Dinner templates
  {
    id: 'muscle_dinner',
    name: 'Muscle Building Dinner',
    type: 'dinner',
    diet_types: ['muscle-gain', 'athletic'],
    foods: [
      { food: FOOD_DATABASE.find(f => f.id === 'chicken_breast')!, quantity: 150, unit: 'g' },
      { food: FOOD_DATABASE.find(f => f.id === 'sweet_potato')!, quantity: 120, unit: 'g' },
      { food: FOOD_DATABASE.find(f => f.id === 'broccoli')!, quantity: 100, unit: 'g' },
      { food: FOOD_DATABASE.find(f => f.id === 'greek_yogurt')!, quantity: 50, unit: 'g' }
    ],
    total_calories: 520,
    total_protein: 48,
    total_carbs: 45,
    total_fat: 12,
    instructions: 'Grill chicken, bake sweet potato, steam broccoli, serve with yogurt.',
    prep_time: 35,
    difficulty: 'easy'
  },
  {
    id: 'vegan_dinner',
    name: 'Vegan Protein Bowl',
    type: 'dinner',
    diet_types: ['vegan', 'general'],
    foods: [
      { food: FOOD_DATABASE.find(f => f.id === 'tofu')!, quantity: 120, unit: 'g' },
      { food: FOOD_DATABASE.find(f => f.id === 'quinoa')!, quantity: 80, unit: 'g' },
      { food: FOOD_DATABASE.find(f => f.id === 'spinach')!, quantity: 60, unit: 'g' },
      { food: FOOD_DATABASE.find(f => f.id === 'avocado')!, quantity: 40, unit: 'g' }
    ],
    total_calories: 420,
    total_protein: 22,
    total_carbs: 45,
    total_fat: 18,
    instructions: 'Marinate and grill tofu, cook quinoa, sauté spinach, add avocado.',
    prep_time: 25,
    difficulty: 'medium'
  }
];

// Calculate BMR using Mifflin-St Jeor Equation
export function calculateBMR(weight: number, height: number, age: number, gender: string): number {
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
}

// Calculate TDEE (Total Daily Energy Expenditure)
export function calculateTDEE(bmr: number, activityLevel: string): number {
  const activityMultipliers = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extra_active: 1.9
  };
  
  return bmr * (activityMultipliers[activityLevel as keyof typeof activityMultipliers] || 1.2);
}

// Calculate target calories based on goal
export function calculateTargetCalories(tdee: number, goal: string, targetWeight?: number, currentWeight?: number): number {
  switch (goal) {
    case 'lose':
      return tdee - 500; // 500 calorie deficit for ~1lb/week loss
    case 'gain':
      return tdee + 300; // 300 calorie surplus for muscle gain
    default:
      return tdee; // maintain
  }
}

// Calculate macronutrient ratios based on diet type
export function calculateMacros(calories: number, dietType: string): { protein: number; carbs: number; fat: number } {
  const macros = {
    general: { protein: 0.25, carbs: 0.45, fat: 0.30 },
    'weight-loss': { protein: 0.30, carbs: 0.40, fat: 0.30 },
    'muscle-gain': { protein: 0.30, carbs: 0.45, fat: 0.25 },
    keto: { protein: 0.20, carbs: 0.05, fat: 0.75 },
    vegan: { protein: 0.20, carbs: 0.55, fat: 0.25 },
    diabetes: { protein: 0.25, carbs: 0.40, fat: 0.35 },
    'heart-healthy': { protein: 0.20, carbs: 0.50, fat: 0.30 },
    athletic: { protein: 0.25, carbs: 0.55, fat: 0.20 }
  };

  const ratio = macros[dietType as keyof typeof macros] || macros.general;
  
  return {
    protein: Math.round((calories * ratio.protein) / 4), // 4 cal/g protein
    carbs: Math.round((calories * ratio.carbs) / 4), // 4 cal/g carbs
    fat: Math.round((calories * ratio.fat) / 9) // 9 cal/g fat
  };
}

// Generate meal plan using templates and nutritional requirements
export function generateMealPlan(profile: NutritionalProfile, targetCalories: number, macros: any): MealTemplate[] {
  const { diet_type, dietary_restrictions } = profile;
  
  // Filter meal templates based on diet type and restrictions
  const availableTemplates = MEAL_TEMPLATES.filter(template => {
    // Check if template supports the diet type
    if (!template.diet_types.includes(diet_type)) return false;
    
    // Check dietary restrictions
    const templateFoods = template.foods.map(f => f.food);
    const hasRestrictedFood = templateFoods.some(food => 
      dietary_restrictions.some(restriction => 
        !food.dietary_flags.includes(restriction)
      )
    );
    
    return !hasRestrictedFood;
  });

  // Distribute calories across meals
  const mealCalories = {
    breakfast: targetCalories * 0.25,
    lunch: targetCalories * 0.30,
    dinner: targetCalories * 0.35,
    snack: targetCalories * 0.10
  };

  const mealPlan: MealTemplate[] = [];
  
  // Select meals for each type
  ['breakfast', 'lunch', 'dinner'].forEach(mealType => {
    const typeTemplates = availableTemplates.filter(t => t.type === mealType);
    if (typeTemplates.length > 0) {
      // Select a random template that fits calorie requirements
      const suitableTemplates = typeTemplates.filter(t => 
        Math.abs(t.total_calories - mealCalories[mealType as keyof typeof mealCalories]) < 100
      );
      
      const selectedTemplate = suitableTemplates.length > 0 
        ? suitableTemplates[Math.floor(Math.random() * suitableTemplates.length)]
        : typeTemplates[Math.floor(Math.random() * typeTemplates.length)];
      
      mealPlan.push(selectedTemplate);
    }
  });

  return mealPlan;
}

// Get nutritional recommendations based on diet type
export function getNutritionalRecommendations(dietType: string): string[] {
  const recommendations = {
    general: [
      'Aim for a balanced plate with 50% vegetables, 25% protein, 25% whole grains',
      'Stay hydrated with 8-10 glasses of water daily',
      'Include a variety of colorful fruits and vegetables',
      'Limit processed foods and added sugars',
      'Practice portion control and mindful eating'
    ],
    'weight-loss': [
      'Create a moderate calorie deficit of 500 calories per day',
      'Focus on high-fiber foods to stay full longer',
      'Include lean protein with every meal',
      'Limit refined carbohydrates and added sugars',
      'Track your food intake to maintain awareness'
    ],
    'muscle-gain': [
      'Consume 1.6-2.2g of protein per kg of body weight',
      'Time protein intake around workouts (within 2 hours)',
      'Include complex carbohydrates for energy',
      'Don\'t neglect healthy fats for hormone production',
      'Ensure adequate recovery nutrition'
    ],
    keto: [
      'Keep net carbs below 20-50g per day',
      'Increase healthy fat intake to 70-80% of calories',
      'Monitor ketone levels to ensure ketosis',
      'Stay hydrated and supplement electrolytes',
      'Gradually transition to avoid keto flu'
    ],
    vegan: [
      'Combine plant proteins for complete amino acid profiles',
      'Supplement with B12, vitamin D, and omega-3',
      'Include iron-rich foods with vitamin C for absorption',
      'Monitor calcium intake from fortified foods',
      'Consider protein powder if needed for goals'
    ],
    diabetes: [
      'Monitor carbohydrate intake and timing',
      'Choose low glycemic index foods',
      'Include fiber-rich foods to slow glucose absorption',
      'Space meals evenly throughout the day',
      'Work with healthcare provider for medication timing'
    ],
    'heart-healthy': [
      'Limit saturated and trans fats',
      'Include omega-3 rich foods regularly',
      'Choose whole grains over refined grains',
      'Limit sodium to 2,300mg or less daily',
      'Include plenty of fruits, vegetables, and legumes'
    ],
    athletic: [
      'Fuel workouts with carbohydrates 2-3 hours before',
      'Replenish glycogen within 30 minutes post-workout',
      'Stay hydrated before, during, and after exercise',
      'Include protein for muscle repair and growth',
      'Adjust nutrition based on training intensity'
    ]
  };

  return recommendations[dietType as keyof typeof recommendations] || recommendations.general;
} 
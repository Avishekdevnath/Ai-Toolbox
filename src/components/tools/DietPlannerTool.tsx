'use client';

import { useState } from 'react';

type DietPlanType = 'general' | 'weight-loss' | 'muscle-gain' | 'keto' | 'vegan' | 'diabetes' | 'heart-healthy' | 'athletic' | '';

export default function DietPlannerTool() {
  const [step, setStep] = useState(1);
  const [dietPlanType, setDietPlanType] = useState<DietPlanType>('');
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    weight: '',
    height: '',
    activity_level: '',
    // General fields
    goal: '',
    dietary_restrictions: '',
    health_conditions: '',
    // Weight loss specific
    target_weight: '',
    timeline: '',
    previous_diets: '',
    // Muscle gain specific
    training_frequency: '',
    current_body_fat: '',
    muscle_goals: '',
    // Keto specific
    keto_experience: '',
    carb_preference: '',
    // Vegan specific
    vegan_duration: '',
    protein_concerns: '',
    supplement_preferences: '',
    // Diabetes specific
    diabetes_type: '',
    medication: '',
    blood_sugar_targets: '',
    // Heart healthy specific
    heart_condition: '',
    cholesterol_levels: '',
    blood_pressure: '',
    // Athletic specific
    sport_type: '',
    competition_goals: '',
    training_schedule: '',
  });
  const [dietPlan, setDietPlan] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');

  const dietPlanTypes = [
    {
      id: 'general',
      title: 'General Nutrition',
      description: 'Balanced diet plan for overall health and wellness',
      icon: '🍽️',
      color: 'blue'
    },
    {
      id: 'weight-loss',
      title: 'Weight Loss',
      description: 'Structured plan for healthy and sustainable weight reduction',
      icon: '⚖️',
      color: 'green'
    },
    {
      id: 'muscle-gain',
      title: 'Muscle Building',
      description: 'High-protein plans to support muscle growth and strength',
      icon: '💪',
      color: 'purple'
    },
    {
      id: 'keto',
      title: 'Ketogenic Diet',
      description: 'Low-carb, high-fat diet for ketosis and fat burning',
      icon: '🥑',
      color: 'orange'
    },
    {
      id: 'vegan',
      title: 'Plant-Based Vegan',
      description: 'Complete nutrition from plant-based sources only',
      icon: '🌱',
      color: 'green'
    },
    {
      id: 'diabetes',
      title: 'Diabetes Management',
      description: 'Blood sugar friendly meals for diabetes control',
      icon: '🩺',
      color: 'red'
    },
    {
      id: 'heart-healthy',
      title: 'Heart Healthy',
      description: 'Cardiovascular-friendly nutrition for heart health',
      icon: '❤️',
      color: 'pink'
    },
    {
      id: 'athletic',
      title: 'Athletic Performance',
      description: 'Performance-optimized nutrition for athletes and competitors',
      icon: '🏃',
      color: 'yellow'
    }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTypeSelect = (type: DietPlanType) => {
    setDietPlanType(type);
    setStep(2);
  };

  const validateForm = () => {
    if (!formData.name.trim() || !formData.age || !formData.weight || !formData.height) return false;
    
    switch (dietPlanType) {
      case 'general':
        return formData.goal.trim() && formData.activity_level;
      case 'weight-loss':
        return formData.target_weight && formData.timeline && formData.activity_level;
      case 'muscle-gain':
        return formData.training_frequency && formData.muscle_goals.trim();
      case 'keto':
        return formData.keto_experience && formData.carb_preference;
      case 'vegan':
        return formData.vegan_duration && formData.protein_concerns;
      case 'diabetes':
        return formData.diabetes_type && formData.medication;
      case 'heart-healthy':
        return formData.heart_condition && formData.activity_level;
      case 'athletic':
        return formData.sport_type.trim() && formData.training_schedule;
      default:
        return false;
    }
  };

  const generatePlan = async () => {
    setIsGenerating(true);

    try {
      const response = await fetch('/api/analyze/diet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dietPlanType,
          formData: {
            ...formData,
            weight_unit: weightUnit
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        setDietPlan(data.analysis);
        setStep(3);
        fetch('/api/tools/diet-planner/track-usage', { method: 'POST' });
      } else {
        throw new Error(data.error || 'Failed to generate diet plan');
      }
    } catch (error) {
      console.error('Diet plan generation error:', error);
      alert('AI analysis failed: ' + (error as Error).message + '\n\nPlease check your API key and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const resetWizard = () => {
    setStep(1);
    setDietPlanType('');
    setFormData({
      name: '', age: '', gender: '', weight: '', height: '', activity_level: '',
      goal: '', dietary_restrictions: '', health_conditions: '',
      target_weight: '', timeline: '', previous_diets: '',
      training_frequency: '', current_body_fat: '', muscle_goals: '',
      keto_experience: '', carb_preference: '',
      vegan_duration: '', protein_concerns: '', supplement_preferences: '',
      diabetes_type: '', medication: '', blood_sugar_targets: '',
      heart_condition: '', cholesterol_levels: '', blood_pressure: '',
      sport_type: '', competition_goals: '', training_schedule: '',
    });
    setDietPlan(null);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
          1
        </div>
        <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
          2
        </div>
        <div className={`w-12 h-0.5 ${step >= 3 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 3 ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
          3
        </div>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Choose Your Diet Plan Type
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Select the type of diet plan that best fits your goals and lifestyle
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dietPlanTypes.map((type) => (
          <div
            key={type.id}
            onClick={() => handleTypeSelect(type.id as DietPlanType)}
            className={`p-6 rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg ${
              type.color === 'blue' ? 'border-blue-200 hover:border-blue-500 bg-blue-50 dark:bg-blue-900/20' :
              type.color === 'green' ? 'border-green-200 hover:border-green-500 bg-green-50 dark:bg-green-900/20' :
              type.color === 'purple' ? 'border-purple-200 hover:border-purple-500 bg-purple-50 dark:bg-purple-900/20' :
              type.color === 'orange' ? 'border-orange-200 hover:border-orange-500 bg-orange-50 dark:bg-orange-900/20' :
              type.color === 'red' ? 'border-red-200 hover:border-red-500 bg-red-50 dark:bg-red-900/20' :
              type.color === 'pink' ? 'border-pink-200 hover:border-pink-500 bg-pink-50 dark:bg-pink-900/20' :
              type.color === 'yellow' ? 'border-yellow-200 hover:border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
              'border-gray-200 hover:border-gray-500 bg-gray-50 dark:bg-gray-900/20'
            }`}
          >
            <div className="text-center">
              <div className="text-4xl mb-3">{type.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {type.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {type.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBasicForm = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Name *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Your name"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
        />
      </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Age *
              </label>
              <input
                type="number"
                value={formData.age}
          onChange={(e) => handleInputChange('age', e.target.value)}
                placeholder="30"
          min="18" max="100"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Gender
        </label>
        <select
          value={formData.gender}
          onChange={(e) => handleInputChange('gender', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Weight *
              </label>
        <div className="flex space-x-2">
              <input
                type="number"
                value={formData.weight}
            onChange={(e) => handleInputChange('weight', e.target.value)}
            placeholder={weightUnit === 'kg' ? '70' : '154'}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
              />
          <select
            value={weightUnit}
            onChange={e => setWeightUnit(e.target.value as 'kg' | 'lbs')}
            className="px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-white"
          >
            <option value="kg">kg</option>
            <option value="lbs">lbs</option>
          </select>
        </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Height *
              </label>
              <input
          type="text"
                value={formData.height}
          onChange={(e) => handleInputChange('height', e.target.value)}
          placeholder="e.g. 5ft 7in, 170cm, 67in"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      {renderStepIndicator()}
      
      {step === 1 && renderStep1()}
      
      {step === 2 && (
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {dietPlanTypes.find(t => t.id === dietPlanType)?.title} Plan
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Enter your details for a personalized diet plan
            </p>
          </div>

          {renderBasicForm()}

          {/* Additional fields for General Nutrition */}
          {dietPlanType === 'general' && (
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Primary Goal *
                </label>
                <select
                  value={formData.goal}
                  onChange={(e) => handleInputChange('goal', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select your goal</option>
                  <option value="maintain_weight">Maintain Current Weight</option>
                  <option value="lose_weight">Lose Weight</option>
                  <option value="gain_weight">Gain Weight</option>
                  <option value="improve_health">Improve Overall Health</option>
                  <option value="increase_energy">Increase Energy</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Activity Level *
                </label>
                <select
                  value={formData.activity_level}
                  onChange={(e) => handleInputChange('activity_level', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select activity level</option>
                  <option value="sedentary">Sedentary (little/no exercise)</option>
                  <option value="lightly_active">Lightly Active (light exercise 1-3 days/week)</option>
                  <option value="moderately_active">Moderately Active (moderate exercise 3-5 days/week)</option>
                  <option value="very_active">Very Active (hard exercise 6-7 days/week)</option>
                  <option value="extra_active">Extra Active (very hard exercise/training 2x/day)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Dietary Restrictions
                </label>
                <textarea
                  value={formData.dietary_restrictions}
                  onChange={(e) => handleInputChange('dietary_restrictions', e.target.value)}
                  placeholder="Any allergies, intolerances, or foods to avoid..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* Additional fields for Weight Loss */}
          {dietPlanType === 'weight-loss' && (
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Target Weight *
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={formData.target_weight}
                    onChange={(e) => handleInputChange('target_weight', e.target.value)}
                    placeholder={weightUnit === 'kg' ? '65' : '143'}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                  />
                  <span className="px-3 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md">
                    {weightUnit}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Timeline (weeks) *
                </label>
                <select
                  value={formData.timeline}
                  onChange={(e) => handleInputChange('timeline', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select timeline</option>
                  <option value="4">4 weeks (1 month)</option>
                  <option value="8">8 weeks (2 months)</option>
                  <option value="12">12 weeks (3 months)</option>
                  <option value="16">16 weeks (4 months)</option>
                  <option value="20">20 weeks (5 months)</option>
                  <option value="24">24 weeks (6 months)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Activity Level *
                </label>
                <select
                  value={formData.activity_level}
                  onChange={(e) => handleInputChange('activity_level', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select activity level</option>
                  <option value="sedentary">Sedentary (little/no exercise)</option>
                  <option value="lightly_active">Lightly Active (light exercise 1-3 days/week)</option>
                  <option value="moderately_active">Moderately Active (moderate exercise 3-5 days/week)</option>
                  <option value="very_active">Very Active (hard exercise 6-7 days/week)</option>
                  <option value="extra_active">Extra Active (very hard exercise/training 2x/day)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Previous Diet Experience
                </label>
                <textarea
                  value={formData.previous_diets}
                  onChange={(e) => handleInputChange('previous_diets', e.target.value)}
                  placeholder="Any previous diets you've tried, what worked, what didn't..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          )}

          <div className="flex space-x-4 mt-6">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Back
            </button>
            <button
              onClick={generatePlan}
              disabled={!validateForm() || isGenerating}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isGenerating ? 'Generating Plan...' : 'Generate Diet Plan'}
            </button>
          </div>
        </div>
      )}

      {step === 3 && dietPlan && (
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Your Personalized Diet & Fitness Plan
            </h2>
              <button
              onClick={resetWizard}
              className="text-green-600 hover:text-green-700 text-sm"
              >
              Create New Plan
              </button>
          </div>

        <div className="space-y-6">
            {/* BMI Analysis */}
            {dietPlan.bmi_analysis && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4">
                  📊 BMI Analysis
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600">{dietPlan.bmi_analysis.bmi_value}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">BMI Value</div>
                  </div>
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
                    <div className="text-lg font-semibold text-blue-600">{dietPlan.bmi_analysis.bmi_category}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Category</div>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div>
                    <h4 className="font-medium text-blue-800 dark:text-blue-200">Health Implications:</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">{dietPlan.bmi_analysis.health_implications}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-800 dark:text-blue-200">Recommendations:</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">{dietPlan.bmi_analysis.recommendations}</p>
                  </div>
                </div>
              </div>
            )}

            {/* BMR Analysis */}
            {dietPlan.bmr_analysis && (
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-4">
                  🔥 BMR Analysis
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
                    <div className="text-2xl font-bold text-purple-600">{dietPlan.bmr_analysis.bmr_value}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">BMR (calories/day)</div>
                  </div>
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
                    <div className="text-xl font-bold text-green-600">{dietPlan.daily_calories}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Daily Calories</div>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div>
                    <h4 className="font-medium text-purple-800 dark:text-purple-200">Daily Calorie Needs:</h4>
                    <p className="text-sm text-purple-700 dark:text-purple-300">{dietPlan.bmr_analysis.daily_calorie_needs}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-purple-800 dark:text-purple-200">Activity Multiplier:</h4>
                    <p className="text-sm text-purple-700 dark:text-purple-300">{dietPlan.bmr_analysis.activity_multiplier}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Nutrition Overview */}
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-4">
                  Daily Nutrition Target: {dietPlan.daily_calories} calories
                </h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-3">
                  <div className="text-xl font-bold text-green-600">{dietPlan.macros.protein}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Protein</div>
                  </div>
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-3">
                  <div className="text-xl font-bold text-blue-600">{dietPlan.macros.carbs}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Carbs</div>
                  </div>
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-3">
                  <div className="text-xl font-bold text-yellow-600">{dietPlan.macros.fat}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Fat</div>
                </div>
                </div>
              </div>

            {/* Daily Meal Plan */}
            {dietPlan.daily_meal_plan && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  🍽️ Daily Meal Plan
                </h3>
                <div className="bg-white dark:bg-gray-600 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="space-y-2">
                      <h5 className="font-medium text-orange-600 text-sm">Breakfast</h5>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{dietPlan.daily_meal_plan.breakfast}</p>
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-medium text-green-600 text-sm">Lunch</h5>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{dietPlan.daily_meal_plan.lunch}</p>
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-medium text-blue-600 text-sm">Dinner</h5>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{dietPlan.daily_meal_plan.dinner}</p>
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-medium text-purple-600 text-sm">Snack 1</h5>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{dietPlan.daily_meal_plan.snack1}</p>
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-medium text-pink-600 text-sm">Snack 2</h5>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{dietPlan.daily_meal_plan.snack2}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-500">
                    <div className="text-center">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        Total Calories: {dietPlan.daily_meal_plan.total_calories}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Daily Exercise Routine */}
            {dietPlan.daily_exercise_routine && (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-4">
                  💪 Daily Exercise Routine
                </h3>
                
                {/* Morning Exercises */}
                {dietPlan.daily_exercise_routine.morning && dietPlan.daily_exercise_routine.morning.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium text-red-800 dark:text-red-200 mb-3">🌅 Morning ({dietPlan.daily_exercise_routine.morning.reduce((acc: number, ex: any) => acc + (ex.time || 0), 0)} min)</h4>
                    <div className="space-y-3">
                      {dietPlan.daily_exercise_routine.morning.map((exercise: any, index: number) => (
                        <div key={index} className="bg-white dark:bg-gray-700 rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900 dark:text-white">{exercise.exercise}</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {exercise.sets} sets × {exercise.reps} • {exercise.time} min
                              </p>
                              {exercise.notes && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{exercise.notes}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Afternoon Exercises */}
                {dietPlan.daily_exercise_routine.afternoon && dietPlan.daily_exercise_routine.afternoon.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium text-red-800 dark:text-red-200 mb-3">☀️ Afternoon ({dietPlan.daily_exercise_routine.afternoon.reduce((acc: number, ex: any) => acc + (ex.time || 0), 0)} min)</h4>
                    <div className="space-y-3">
                      {dietPlan.daily_exercise_routine.afternoon.map((exercise: any, index: number) => (
                        <div key={index} className="bg-white dark:bg-gray-700 rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900 dark:text-white">{exercise.exercise}</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {exercise.sets} sets × {exercise.reps} • {exercise.time} min
                              </p>
                              {exercise.notes && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{exercise.notes}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Evening Exercises */}
                {dietPlan.daily_exercise_routine.evening && dietPlan.daily_exercise_routine.evening.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium text-red-800 dark:text-red-200 mb-3">🌙 Evening ({dietPlan.daily_exercise_routine.evening.reduce((acc: number, ex: any) => acc + (ex.time || 0), 0)} min)</h4>
                    <div className="space-y-3">
                      {dietPlan.daily_exercise_routine.evening.map((exercise: any, index: number) => (
                        <div key={index} className="bg-white dark:bg-gray-700 rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900 dark:text-white">{exercise.exercise}</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {exercise.sets} sets × {exercise.reps} • {exercise.time} min
                              </p>
                              {exercise.notes && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{exercise.notes}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Exercise Summary */}
                <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-xl font-bold text-red-600">{dietPlan.daily_exercise_routine.total_exercise_time}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Exercise Time</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-red-600">{dietPlan.daily_exercise_routine.rest_days}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Rest Days</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tips and Recommendations */}
            {Array.isArray(dietPlan.nutritional_recommendations) && dietPlan.nutritional_recommendations.length > 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <h4 className="font-medium text-green-800 dark:text-green-200 mb-3">
                  🥬 Nutritional Tips
                </h4>
                <ul className="space-y-2">
                  {dietPlan.nutritional_recommendations.map((tip: string, index: number) => (
                    <li key={index} className="text-sm text-green-700 dark:text-green-300 flex items-start">
                      <span className="mr-2 mt-1 text-green-500">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
      </div>

        <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
              <strong>Disclaimer:</strong> This comprehensive diet and fitness plan is generated by AI and should not replace professional medical advice, nutritional counseling, or personal training guidance. Always consult healthcare professionals before starting any new diet or exercise program.
          </p>
          </div>
        </div>
      )}
    </div>
  );
} 
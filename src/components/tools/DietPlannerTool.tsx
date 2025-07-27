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
    // Check basic required fields
    const basicFieldsValid = formData.name.trim() && formData.age && formData.weight && formData.height;
    
    if (!basicFieldsValid) {
      console.log('Basic fields validation failed:', {
        name: formData.name.trim(),
        age: formData.age,
        weight: formData.weight,
        height: formData.height
      });
      return false;
    }
    
    // Check diet-specific fields
    let specificFieldsValid = false;
    
    switch (dietPlanType) {
      case 'general':
        specificFieldsValid = formData.goal.trim() && formData.activity_level;
        console.log('General validation:', { goal: formData.goal.trim(), activity_level: formData.activity_level });
        break;
      case 'weight-loss':
        specificFieldsValid = formData.target_weight && formData.timeline && formData.activity_level;
        console.log('Weight-loss validation:', { target_weight: formData.target_weight, timeline: formData.timeline, activity_level: formData.activity_level });
        break;
      case 'muscle-gain':
        specificFieldsValid = formData.training_frequency && formData.muscle_goals.trim();
        console.log('Muscle-gain validation:', { training_frequency: formData.training_frequency, muscle_goals: formData.muscle_goals.trim() });
        break;
      case 'keto':
        specificFieldsValid = formData.keto_experience && formData.carb_preference;
        console.log('Keto validation:', { keto_experience: formData.keto_experience, carb_preference: formData.carb_preference });
        break;
      case 'vegan':
        specificFieldsValid = formData.vegan_duration && formData.protein_concerns;
        console.log('Vegan validation:', { vegan_duration: formData.vegan_duration, protein_concerns: formData.protein_concerns });
        break;
      case 'diabetes':
        specificFieldsValid = formData.diabetes_type && formData.medication;
        console.log('Diabetes validation:', { diabetes_type: formData.diabetes_type, medication: formData.medication });
        break;
      case 'heart-healthy':
        specificFieldsValid = formData.heart_condition && formData.activity_level;
        console.log('Heart-healthy validation:', { heart_condition: formData.heart_condition, activity_level: formData.activity_level });
        break;
      case 'athletic':
        specificFieldsValid = formData.sport_type.trim() && formData.training_schedule;
        console.log('Athletic validation:', { sport_type: formData.sport_type.trim(), training_schedule: formData.training_schedule });
        break;
      default:
        console.log('Unknown diet plan type:', dietPlanType);
        return false;
    }
    
    console.log('Form validation result:', { basicFieldsValid, specificFieldsValid, dietPlanType });
    return specificFieldsValid;
  };

  const getValidationStatus = () => {
    const basicFields = {
      name: !!formData.name.trim(),
      age: !!formData.age,
      weight: !!formData.weight,
      height: !!formData.height
    };
    
    let specificFields = {};
    
    switch (dietPlanType) {
      case 'general':
        specificFields = {
          goal: !!formData.goal.trim(),
          activity_level: !!formData.activity_level
        };
        break;
      case 'weight-loss':
        specificFields = {
          target_weight: !!formData.target_weight,
          timeline: !!formData.timeline,
          activity_level: !!formData.activity_level
        };
        break;
      case 'muscle-gain':
        specificFields = {
          training_frequency: !!formData.training_frequency,
          muscle_goals: !!formData.muscle_goals.trim()
        };
        break;
      case 'keto':
        specificFields = {
          keto_experience: !!formData.keto_experience,
          carb_preference: !!formData.carb_preference
        };
        break;
      case 'vegan':
        specificFields = {
          vegan_duration: !!formData.vegan_duration,
          protein_concerns: !!formData.protein_concerns
        };
        break;
      case 'diabetes':
        specificFields = {
          diabetes_type: !!formData.diabetes_type,
          medication: !!formData.medication
        };
        break;
      case 'heart-healthy':
        specificFields = {
          heart_condition: !!formData.heart_condition,
          activity_level: !!formData.activity_level
        };
        break;
      case 'athletic':
        specificFields = {
          sport_type: !!formData.sport_type.trim(),
          training_schedule: !!formData.training_schedule
        };
        break;
      default:
        specificFields = {};
    }
    
    return { basicFields, specificFields };
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

      // Check if response is ok
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Check if response has content
      const responseText = await response.text();
      if (!responseText || responseText.trim() === '') {
        throw new Error('Empty response from server');
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response:', responseText);
        throw new Error('Invalid response format from server');
      }

      if (data.success) {
        setDietPlan(data.analysis);
        setStep(3);
        // Track usage without blocking the main flow
        fetch('/api/tools/diet-planner/track-usage', { method: 'POST' }).catch(err => {
          console.error('Usage tracking failed:', err);
        });
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
      training_frequency: '', muscle_goals: '',
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

          {/* Additional fields for Muscle Building */}
          {dietPlanType === 'muscle-gain' && (
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Training Frequency *
                </label>
                <select
                  value={formData.training_frequency}
                  onChange={(e) => handleInputChange('training_frequency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select training frequency</option>
                  <option value="3_days">3 days per week</option>
                  <option value="4_days">4 days per week</option>
                  <option value="5_days">5 days per week</option>
                  <option value="6_days">6 days per week</option>
                  <option value="7_days">7 days per week</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Muscle Goals *
                </label>
                <textarea
                  value={formData.muscle_goals}
                  onChange={(e) => handleInputChange('muscle_goals', e.target.value)}
                  placeholder="Describe your specific muscle building goals (e.g., build chest, increase overall mass, improve strength...)"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* Additional fields for Keto Diet */}
          {dietPlanType === 'keto' && (
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Keto Experience *
                </label>
                <select
                  value={formData.keto_experience}
                  onChange={(e) => handleInputChange('keto_experience', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select your keto experience</option>
                  <option value="beginner">Beginner (never tried keto)</option>
                  <option value="intermediate">Intermediate (tried keto before)</option>
                  <option value="advanced">Advanced (currently on keto)</option>
                  <option value="expert">Expert (long-term keto practitioner)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Carb Preference *
                </label>
                <select
                  value={formData.carb_preference}
                  onChange={(e) => handleInputChange('carb_preference', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select your carb preference</option>
                  <option value="strict">Strict keto (20g net carbs/day)</option>
                  <option value="moderate">Moderate keto (30-50g net carbs/day)</option>
                  <option value="flexible">Flexible keto (50-100g net carbs/day)</option>
                  <option value="cyclical">Cyclical keto (carb cycling)</option>
                </select>
              </div>
            </div>
          )}

          {/* Additional fields for Vegan Diet */}
          {dietPlanType === 'vegan' && (
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Vegan Duration *
                </label>
                <select
                  value={formData.vegan_duration}
                  onChange={(e) => handleInputChange('vegan_duration', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select your vegan experience</option>
                  <option value="new">New to vegan (less than 6 months)</option>
                  <option value="intermediate">Intermediate (6 months - 2 years)</option>
                  <option value="experienced">Experienced (2-5 years)</option>
                  <option value="long_term">Long-term (5+ years)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Protein Concerns *
                </label>
                <select
                  value={formData.protein_concerns}
                  onChange={(e) => handleInputChange('protein_concerns', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select your protein concerns</option>
                  <option value="adequate">Ensuring adequate protein intake</option>
                  <option value="variety">Getting protein variety</option>
                  <option value="absorption">Protein absorption and bioavailability</option>
                  <option value="none">No specific concerns</option>
                </select>
              </div>
            </div>
          )}

          {/* Additional fields for Diabetes Diet */}
          {dietPlanType === 'diabetes' && (
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Diabetes Type *
                </label>
                <select
                  value={formData.diabetes_type}
                  onChange={(e) => handleInputChange('diabetes_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select diabetes type</option>
                  <option value="type1">Type 1 Diabetes</option>
                  <option value="type2">Type 2 Diabetes</option>
                  <option value="gestational">Gestational Diabetes</option>
                  <option value="prediabetes">Prediabetes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Medication *
                </label>
                <select
                  value={formData.medication}
                  onChange={(e) => handleInputChange('medication', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select medication type</option>
                  <option value="insulin">Insulin</option>
                  <option value="oral">Oral medication</option>
                  <option value="both">Both insulin and oral medication</option>
                  <option value="none">No medication (diet controlled)</option>
                </select>
              </div>
            </div>
          )}

          {/* Additional fields for Heart-Healthy Diet */}
          {dietPlanType === 'heart-healthy' && (
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Heart Condition *
                </label>
                <select
                  value={formData.heart_condition}
                  onChange={(e) => handleInputChange('heart_condition', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select heart condition</option>
                  <option value="high_blood_pressure">High Blood Pressure</option>
                  <option value="high_cholesterol">High Cholesterol</option>
                  <option value="heart_disease">Heart Disease</option>
                  <option value="prevention">Prevention (no current condition)</option>
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
            </div>
          )}

          {/* Additional fields for Athletic Diet */}
          {dietPlanType === 'athletic' && (
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sport Type *
                </label>
                <input
                  type="text"
                  value={formData.sport_type}
                  onChange={(e) => handleInputChange('sport_type', e.target.value)}
                  placeholder="e.g., Running, Swimming, Football, Basketball, Tennis..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Training Schedule *
                </label>
                <select
                  value={formData.training_schedule}
                  onChange={(e) => handleInputChange('training_schedule', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select training schedule</option>
                  <option value="daily">Daily training</option>
                  <option value="5_6_days">5-6 days per week</option>
                  <option value="3_4_days">3-4 days per week</option>
                  <option value="2_3_days">2-3 days per week</option>
                  <option value="competition">Competition season</option>
                </select>
              </div>
            </div>
          )}

          {/* Validation Status */}
          {step === 2 && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Form Validation Status
              </h4>
              {(() => {
                const { basicFields, specificFields } = getValidationStatus();
                const allBasicValid = Object.values(basicFields).every(Boolean);
                const allSpecificValid = Object.values(specificFields).every(Boolean);
                
                return (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${allBasicValid ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Basic Information: {allBasicValid ? 'Complete' : 'Incomplete'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${allSpecificValid ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {dietPlanType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Fields: {allSpecificValid ? 'Complete' : 'Incomplete'}
                      </span>
                    </div>
                    {(!allBasicValid || !allSpecificValid) && (
                      <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                        Please fill in all required fields marked with *
                      </div>
                    )}
                  </div>
                );
              })()}
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
          </div>

        <div className="space-y-6">
            {/* Plan Overview */}
            {dietPlan.diet_plan && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4">
                  📋 {dietPlan.diet_plan.name}
                </h3>
                <p className="text-blue-700 dark:text-blue-300 mb-4">
                  {dietPlan.diet_plan.description}
                </p>
                
                {/* Daily Calories */}
                <div className="bg-white dark:bg-gray-700 rounded-lg p-4 mb-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{dietPlan.diet_plan.daily_calories}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Daily Calories</div>
                  </div>
                </div>

                {/* Macronutrients */}
                {dietPlan.diet_plan.macronutrients && (
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-3">
                      <div className="text-xl font-bold text-green-600">{dietPlan.diet_plan.macronutrients.protein}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Protein</div>
                    </div>
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-3">
                      <div className="text-xl font-bold text-blue-600">{dietPlan.diet_plan.macronutrients.carbs}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Carbs</div>
                    </div>
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-3">
                      <div className="text-xl font-bold text-yellow-600">{dietPlan.diet_plan.macronutrients.fat}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Fat</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Meals */}
            {dietPlan.diet_plan && dietPlan.diet_plan.meals && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-4">
                  🍽️ Daily Meal Plan
                </h3>
                <div className="space-y-4">
                  {dietPlan.diet_plan.meals.map((meal: any, index: number) => (
                    <div key={index} className="bg-white dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold text-green-800 dark:text-green-200">{meal.meal}</h4>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{meal.time}</span>
                      </div>
                      
                      {meal.foods && meal.foods.length > 0 && (
                        <div className="space-y-2 mb-3">
                          {meal.foods.map((food: any, foodIndex: number) => (
                            <div key={foodIndex} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-600 rounded">
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">{food.name}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">{food.quantity}</div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium text-gray-900 dark:text-white">{food.calories} cal</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  P: {food.protein} | C: {food.carbs} | F: {food.fat}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-500">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{meal.notes}</span>
                        <span className="font-semibold text-green-600">Total: {meal.total_calories} cal</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Supplements */}
            {dietPlan.diet_plan && dietPlan.diet_plan.supplements && dietPlan.diet_plan.supplements.length > 0 && (
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-4">
                  💊 Supplements
                </h3>
                <div className="space-y-3">
                  {dietPlan.diet_plan.supplements.map((supplement: any, index: number) => (
                    <div key={index} className="bg-white dark:bg-gray-700 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-white">{supplement.name}</h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{supplement.dosage}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600 dark:text-gray-400">{supplement.timing}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{supplement.purpose}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hydration */}
            {dietPlan.diet_plan && dietPlan.diet_plan.hydration && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4">
                  💧 Hydration Guidelines
                </h3>
                <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-blue-800 dark:text-blue-200">Daily Water Intake</h5>
                      <p className="text-blue-700 dark:text-blue-300">{dietPlan.diet_plan.hydration.daily_water}</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-blue-800 dark:text-blue-200">Additional Fluids</h5>
                      <p className="text-blue-700 dark:text-blue-300">{dietPlan.diet_plan.hydration.additional_fluids}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Exercise Recommendations */}
            {dietPlan.diet_plan && dietPlan.diet_plan.exercise_recommendations && (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-4">
                  💪 Exercise Recommendations
                </h3>
                <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div>
                      <h5 className="font-medium text-red-800 dark:text-red-200">Frequency</h5>
                      <p className="text-red-700 dark:text-red-300">{dietPlan.diet_plan.exercise_recommendations.frequency}</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-red-800 dark:text-red-200">Duration</h5>
                      <p className="text-red-700 dark:text-red-300">{dietPlan.diet_plan.exercise_recommendations.duration}</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-red-800 dark:text-red-200">Types</h5>
                      <p className="text-red-700 dark:text-red-300">{Array.isArray(dietPlan.diet_plan.exercise_recommendations.types) ? dietPlan.diet_plan.exercise_recommendations.types.join(', ') : dietPlan.diet_plan.exercise_recommendations.types}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tips */}
            {dietPlan.diet_plan && dietPlan.diet_plan.tips && dietPlan.diet_plan.tips.length > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-4">
                  💡 Tips & Recommendations
                </h3>
                <ul className="space-y-2">
                  {dietPlan.diet_plan.tips.map((tip: string, index: number) => (
                    <li key={index} className="text-sm text-yellow-700 dark:text-yellow-300 flex items-start">
                      <span className="mr-2 mt-1 text-yellow-500">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Fallback for old structure */}
            {!dietPlan.diet_plan && (
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200 mb-4">
                  ⚠️ Diet Plan (Legacy Format)
                </h3>
                <pre className="text-sm text-orange-700 dark:text-orange-300 overflow-auto">
                  {JSON.stringify(dietPlan, null, 2)}
                </pre>
              </div>
            )}
      </div>

        <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
              <strong>Disclaimer:</strong> This comprehensive diet and fitness plan is generated by AI and should not replace professional medical advice, nutritional counseling, or personal training guidance. Always consult healthcare professionals before starting any new diet or exercise program.
          </p>
        </div>

        {/* Create New Plan Button */}
        <div className="mt-8 text-center">
          <button
            onClick={resetWizard}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            🆕 Create New Diet Plan
          </button>
        </div>
        </div>
      )}
    </div>
  );
} 
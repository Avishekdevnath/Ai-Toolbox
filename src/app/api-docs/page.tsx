'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Code, 
  Database, 
  Key, 
  Globe, 
  Copy,
  CheckCircle,
  AlertCircle,
  Play,
  Zap
} from 'lucide-react';

export default function ApiDocsPage() {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const copyToClipboard = (text: string, endpoint: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(endpoint);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const apis = [
    {
      name: "Age Calculator",
      endpoint: "/api/analyze/age",
      method: "POST",
      description: "Comprehensive age analysis with AI-powered insights",
      features: ["Life milestones", "Health recommendations", "Retirement planning", "Life expectancy", "AI insights"],
      example: {
        request: {
          birthDate: "1990-01-01",
          gender: "male",
          lifestyle: "average",
          healthConditions: [],
          retirementAge: 65,
          currentSavings: 10000,
          monthlyIncome: 5000,
          desiredRetirementIncome: 4000,
          includeAIInsights: true
        },
        response: {
          ageData: { /* age calculation results */ },
          lifeMilestones: [ /* milestone data */ ],
          healthRecommendations: [ /* health tips */ ],
          retirementPlan: { /* retirement analysis */ },
          lifeExpectancy: { /* life expectancy data */ },
          aiInsights: { /* AI-generated advice */ }
        }
      }
    },
    {
      name: "URL Shortener",
      endpoint: "/api/url-shortener",
      method: "POST",
      description: "Create and manage shortened URLs with analytics",
      features: ["Custom aliases", "Click tracking", "Expiration dates", "QR codes", "Analytics"],
      example: {
        request: {
          originalUrl: "https://example.com/very-long-url",
          customAlias: "my-link",
          expiresAt: "2025-12-31"
        },
        response: {
          id: "507f1f77bcf86cd799439011",
          shortCode: "my-link",
          originalUrl: "https://example.com/very-long-url",
          clicks: 0,
          createdAt: "2024-12-01T00:00:00.000Z",
          expiresAt: "2025-12-31T00:00:00.000Z"
        }
      }
    },
    {
      name: "Quote Generator",
      endpoint: "/api/quote",
      method: "POST",
      description: "Generate AI-powered quotes based on topics and moods",
      features: ["Topic-based generation", "Mood selection", "Author specification", "AI-powered content"],
      example: {
        request: {
          topic: "motivation",
          mood: "inspiring",
          author: "famous"
        },
        response: {
          quote: "The only way to do great work is to love what you do.",
          author: "Steve Jobs",
          topic: "motivation",
          mood: "inspiring"
        }
      }
    },
    {
      name: "Diet Planner",
      endpoint: "/api/analyze/diet",
      method: "POST",
      description: "Generate personalized meal plans with AI recommendations",
      features: ["Nutritional analysis", "Dietary restrictions", "Meal planning", "AI recommendations"],
      example: {
        request: {
          age: 30,
          weight: 70,
          height: 175,
          activityLevel: "moderate",
          dietaryRestrictions: ["vegetarian"],
          goals: ["weight_loss"]
        },
        response: {
          dailyCalories: 1800,
          meals: [ /* meal plan data */ ],
          nutritionSummary: { /* nutritional info */ },
          recommendations: [ /* AI tips */ ]
        }
      }
    },
    {
      name: "Finance Analysis",
      endpoint: "/api/analyze/finance",
      method: "POST",
      description: "Comprehensive financial planning and analysis",
      features: ["Retirement planning", "Investment analysis", "Debt management", "Budget planning"],
      example: {
        request: {
          module: "retirement",
          data: {
            currentAge: 30,
            retirementAge: 65,
            currentSavings: 50000,
            monthlyIncome: 6000
          }
        },
        response: {
          analysis: { /* financial analysis */ },
          recommendations: [ /* AI recommendations */ ],
          projections: { /* future projections */ }
        }
      }
    }
  ];

  const authentication = {
    description: "Most endpoints require no authentication for basic usage. For advanced features, you may need an API key.",
    methods: [
      {
        type: "No Auth",
        description: "Basic endpoints work without authentication",
        example: "curl -X POST https://aitoolbox.com/api/analyze/age"
      },
      {
        type: "API Key",
        description: "Include your API key in the Authorization header",
        example: "Authorization: Bearer YOUR_API_KEY"
      }
    ]
  };

  const rateLimits = [
    { endpoint: "All endpoints", limit: "100 requests/hour", description: "Rate limit per IP address" },
    { endpoint: "AI-powered endpoints", limit: "50 requests/hour", description: "Additional limit for AI features" },
    { endpoint: "URL Shortener", limit: "1000 requests/day", description: "Higher limit for URL creation" }
  ];

  const errorCodes = [
    { code: "400", meaning: "Bad Request", description: "Invalid request parameters" },
    { code: "401", meaning: "Unauthorized", description: "Missing or invalid API key" },
    { code: "429", meaning: "Too Many Requests", description: "Rate limit exceeded" },
    { code: "500", meaning: "Internal Server Error", description: "Server error, try again later" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Code className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              API <span className="text-blue-600">Documentation</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Integrate AI Toolbox into your applications with our comprehensive REST API. 
              Access all our AI-powered tools programmatically.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Badge variant="outline" className="text-sm px-4 py-2">
                <Zap className="w-4 h-4 mr-2" />
                REST API
              </Badge>
              <Badge variant="outline" className="text-sm px-4 py-2">
                <Globe className="w-4 h-4 mr-2" />
                JSON Responses
              </Badge>
              <Badge variant="outline" className="text-sm px-4 py-2">
                <Key className="w-4 h-4 mr-2" />
                API Keys Available
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
            <TabsTrigger value="authentication">Auth</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Base URL</h3>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                    https://aitoolbox.com/api
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Response Format</h3>
                  <p className="text-gray-600 mb-2">All API responses are returned in JSON format with the following structure:</p>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
{`{
  "success": true,
  "data": { /* response data */ },
  "message": "Success message"
}`}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Rate Limits</h3>
                  <div className="space-y-3">
                    {rateLimits.map((limit, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="font-medium text-gray-900">{limit.endpoint}</span>
                          <p className="text-sm text-gray-600">{limit.description}</p>
                        </div>
                        <Badge variant="outline">{limit.limit}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="endpoints" className="space-y-8">
            {apis.map((api, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                        <Code className="w-6 h-6" />
                      </div>
                      {api.name}
                    </CardTitle>
                    <Badge className={api.method === 'POST' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                      {api.method}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Endpoint</h3>
                    <div className="flex items-center gap-2">
                      <div className="bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-sm flex-1">
                        {api.endpoint}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(api.endpoint, api.name)}
                      >
                        {copiedEndpoint === api.name ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-600">{api.description}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Features</h3>
                    <div className="flex flex-wrap gap-2">
                      {api.features.map((feature, featureIndex) => (
                        <Badge key={featureIndex} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Example Request</h3>
                    <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                      <pre>{JSON.stringify(api.example.request, null, 2)}</pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="authentication" className="space-y-8">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Key className="w-6 h-6" />
                  Authentication
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-gray-600">{authentication.description}</p>
                
                <div className="space-y-4">
                  {authentication.methods.map((method, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">{method.type}</h3>
                      <p className="text-gray-600 mb-3">{method.description}</p>
                      <div className="bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-sm">
                        {method.example}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Error Codes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {errorCodes.map((error, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium text-gray-900">{error.code} - {error.meaning}</span>
                        <p className="text-sm text-gray-600">{error.description}</p>
                      </div>
                      <Badge variant={error.code === '200' ? 'default' : 'outline'}>
                        {error.code}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="examples" className="space-y-8">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Play className="w-6 h-6" />
                  Quick Start Examples
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Age Calculator (cURL)</h3>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
{`curl -X POST https://aitoolbox.com/api/analyze/age \\
  -H "Content-Type: application/json" \\
  -d '{
    "birthDate": "1990-01-01",
    "gender": "male",
    "lifestyle": "average",
    "includeAIInsights": true
  }'`}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">URL Shortener (JavaScript)</h3>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
{`const response = await fetch('https://aitoolbox.com/api/url-shortener', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    originalUrl: 'https://example.com/very-long-url',
    customAlias: 'my-link'
  })
});

const data = await response.json();
console.log(data.shortCode);`}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Quote Generator (Python)</h3>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
{`import requests

response = requests.post('https://aitoolbox.com/api/quote', json={
    'topic': 'motivation',
    'mood': 'inspiring',
    'author': 'famous'
})

data = response.json()
print(data['quote'])`}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* CTA Section */}
      <div className="bg-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to Integrate?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Start building with our API today. All endpoints are free to use with generous rate limits.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Get API Key
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 